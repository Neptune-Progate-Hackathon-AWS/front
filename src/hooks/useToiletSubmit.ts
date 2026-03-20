/**
 * トイレ登録の submit 処理
 *
 * 1. presigned URL を取得
 * 2. S3 に画像をアップロード
 * 3. トイレ情報を POST
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
  imageFile: File;
};

export function useToiletSubmit() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: ToiletFormValues) {
    setServerError("");
    setIsSubmitting(true);

    try {
      const fetchOpts = await authFetchOptions();

      // 1. presigned URL を取得
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"] as const;
      if (!allowedTypes.includes(values.imageFile.type as (typeof allowedTypes)[number])) {
        throw new Error("対応していない画像形式です（JPEG / PNG / WebP のみ）");
      }
      const contentType = values.imageFile.type as PresignedUrlRequestContentType;
      const presignedRes = await createPresignedUrl(
        { contentType },
        fetchOpts,
      );
      if (presignedRes.status !== 200) {
        throw new Error("画像アップロードURLの取得に失敗しました");
      }
      const { uploadUrl, imageKey } = presignedRes.data;

      // 2. S3 に画像をアップロード
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": values.imageFile.type },
        body: values.imageFile,
      });
      if (!uploadRes.ok) {
        throw new Error("画像のアップロードに失敗しました");
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
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "登録に失敗しました";
      setServerError(message);
      toast({ title: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return { onSubmit, serverError, isSubmitting };
}
