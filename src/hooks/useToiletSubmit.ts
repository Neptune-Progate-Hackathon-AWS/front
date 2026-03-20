/**
 * トイレ登録の submit 処理
 *
 * 画像がある場合: presigned URL 取得 → S3 アップロード → トイレ登録
 * 画像なしの場合: トイレ登録のみ
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPresignedUrl } from "@/gen/api/images/images";
import { createToilet } from "@/gen/api/toilets/toilets";
import { useToast } from "@/components/ui/toast";
import { authFetchOptions } from "@/lib/auth-fetch";
import type { CreateToiletRequest } from "@/gen/models";
import type { PresignedUrlRequestContentType } from "@/gen/models/presignedUrlRequestContentType";

/** フォームから受け取る値（imageKey の代わりに File を持つ） */
export type ToiletFormValues = Omit<CreateToiletRequest, "imageKey"> & {
  imageFile: File | null;
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function useToiletSubmit() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** @returns 登録成功なら true */
  async function onSubmit(values: ToiletFormValues): Promise<boolean> {
    setServerError("");
    setIsSubmitting(true);

    try {
      const fetchOpts = await authFetchOptions();
      let imageKey = "";

      // 画像がある場合のみアップロード
      if (values.imageFile && values.imageFile.size > 0) {
        if (!ALLOWED_IMAGE_TYPES.includes(values.imageFile.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
          throw new Error("対応していない画像形式です（JPEG / PNG / WebP のみ）");
        }
        const contentType = values.imageFile.type as PresignedUrlRequestContentType;

        // 1. presigned URL を取得
        const presignedRes = await createPresignedUrl(
          { contentType },
          fetchOpts,
        );
        if (presignedRes.status !== 200) {
          throw new Error("画像アップロードURLの取得に失敗しました");
        }
        imageKey = presignedRes.data.imageKey;

        // 2. S3 に画像をアップロード
        const uploadRes = await fetch(presignedRes.data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": values.imageFile.type },
          body: values.imageFile,
        });
        if (!uploadRes.ok) {
          throw new Error("画像のアップロードに失敗しました");
        }
      }

      // 3. トイレ情報を POST
      const { imageFile: _, ...rest } = values;
      const toiletRes = await createToilet(
        { ...rest, imageKey },
        fetchOpts,
      );
      if (toiletRes.status !== 201) {
        throw new Error("トイレ情報の登録に失敗しました");
      }

      toast({ title: "トイレ情報を登録しました！", variant: "success" });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "登録に失敗しました";
      setServerError(message);
      toast({ title: message, variant: "error" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { onSubmit, serverError, isSubmitting };
}
