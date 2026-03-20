/**
 * トイレ登録ページ
 *
 * 画像撮影/選択 → フォーム入力 → presigned URL 取得 → S3 アップロード → トイレ登録
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, ImageIcon, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToiletSubmit, type ToiletFormValues } from "@/hooks/useToiletSubmit";
import { CreateToiletRequestBrand } from "@/gen/models/createToiletRequestBrand";

/** バリデーションスキーマ */
const toiletSchema = z.object({
  name: z.string().min(1, "店舗名を入力してください"),
  brand: z.enum(
    ["seven_eleven", "family_mart", "lawson", "mini_stop", "daily_yamazaki", "other"],
    { required_error: "ブランドを選択してください" },
  ),
  address: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  maleCount: z.number().min(0),
  femaleCount: z.number().min(0),
  multipurposeCount: z.number().min(0),
  requiresPermission: z.boolean(),
  note: z.string().max(500).optional(),
  imageFile: z
    .instanceof(File, { message: "写真を撮影または選択してください" })
    .refine((f) => f.size > 0, "写真を撮影または選択してください"),
});

type FormValues = z.infer<typeof toiletSchema>;

/** ブランド選択肢 */
const BRAND_OPTIONS: { value: string; label: string }[] = [
  { value: CreateToiletRequestBrand.seven_eleven, label: "セブンイレブン" },
  { value: CreateToiletRequestBrand.family_mart, label: "ファミリーマート" },
  { value: CreateToiletRequestBrand.lawson, label: "ローソン" },
  { value: CreateToiletRequestBrand.mini_stop, label: "ミニストップ" },
  { value: CreateToiletRequestBrand.daily_yamazaki, label: "デイリーヤマザキ" },
  { value: CreateToiletRequestBrand.other, label: "その他" },
];

// react-hook-form v7 + zod v3 の型互換性問題を回避
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toiletResolver = zodResolver(toiletSchema as any) as any;

export default function NewToiletPage() {
  return (
    <AuthGuard>
      <NewToiletForm />
    </AuthGuard>
  );
}

function NewToiletForm() {
  const router = useRouter();
  const geo = useGeolocation();
  const { onSubmit: submitToilet, serverError, isSubmitting } = useToiletSubmit();

  // 画像プレビュー用
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: toiletResolver,
    defaultValues: {
      name: "",
      brand: undefined,
      address: "",
      lat: geo.latitude ?? 0,
      lng: geo.longitude ?? 0,
      maleCount: 1,
      femaleCount: 1,
      multipurposeCount: 0,
      requiresPermission: false,
      note: "",
    },
  });

  // 現在地が取得できたらフォームにセット
  useEffect(() => {
    if (geo.latitude != null && geo.longitude != null) {
      setValue("lat", geo.latitude);
      setValue("lng", geo.longitude);
    }
  }, [geo.latitude, geo.longitude, setValue]);

  // コンポーネントアンマウント時に Object URL を解放
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /** 画像選択ハンドラー */
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("imageFile", file, { shouldValidate: true });
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  /** フォーム送信 */
  async function handleFormSubmit(values: FormValues) {
    await submitToilet(values as ToiletFormValues);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 py-3">
        <button type="button" onClick={() => router.back()} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">トイレ情報を登録</h1>
      </header>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 pb-24">
        <FieldGroup className="space-y-5">
          {/* 画像撮影/選択 */}
          <Field>
            <FieldLabel>写真</FieldLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
            {preview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-lg overflow-hidden bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="プレビュー" className="w-full h-full object-cover" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 transition-colors"
              >
                <div className="flex gap-3">
                  <Camera size={24} />
                  <ImageIcon size={24} />
                </div>
                <span className="text-sm">タップして撮影 / 選択</span>
              </button>
            )}
            {errors.imageFile && (
              <p className="text-sm text-destructive">{errors.imageFile.message}</p>
            )}
          </Field>

          {/* 店舗名 */}
          <Field>
            <FieldLabel htmlFor="name">店舗名</FieldLabel>
            <Input
              id="name"
              placeholder="例：セブンイレブン 渋谷駅前店"
              variant="outline"
              {...register("name")}
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </Field>

          {/* ブランド */}
          <Field>
            <FieldLabel>ブランド</FieldLabel>
            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger error={!!errors.brand}>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.brand && (
              <p className="text-sm text-destructive">{errors.brand.message}</p>
            )}
          </Field>

          {/* 住所（任意） */}
          <Field>
            <FieldLabel htmlFor="address">住所（任意）</FieldLabel>
            <Input
              id="address"
              placeholder="例：東京都渋谷区道玄坂1-2-3"
              variant="outline"
              {...register("address")}
            />
          </Field>

          {/* トイレ個数 */}
          <Field>
            <FieldLabel>トイレ個数</FieldLabel>
            <div className="grid grid-cols-3 gap-3">
              <CounterField
                label="男性用"
                value={watch("maleCount")}
                onChange={(v) => setValue("maleCount", v)}
              />
              <CounterField
                label="女性用"
                value={watch("femaleCount")}
                onChange={(v) => setValue("femaleCount", v)}
              />
              <CounterField
                label="多目的"
                value={watch("multipurposeCount")}
                onChange={(v) => setValue("multipurposeCount", v)}
              />
            </div>
          </Field>

          {/* 店員への使用許可 */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="requiresPermission" className="cursor-pointer">
                店員に声掛けが必要
              </FieldLabel>
              <Controller
                name="requiresPermission"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="requiresPermission"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </div>
          </Field>

          {/* 備考 */}
          <Field>
            <FieldLabel htmlFor="note">備考（任意）</FieldLabel>
            <Textarea
              id="note"
              placeholder="例：2階の奥にあります"
              {...register("note")}
            />
          </Field>

          {/* 位置情報（hidden） */}
          <input type="hidden" {...register("lat", { valueAsNumber: true })} />
          <input type="hidden" {...register("lng", { valueAsNumber: true })} />

          {/* エラー表示 */}
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
        </FieldGroup>

        {/* 送信ボタン（固定フッター） */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録する"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** +/- ボタン付きカウンター */
function CounterField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border p-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="rounded-full border p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
          disabled={value <= 0}
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="rounded-full border p-1 text-muted-foreground hover:bg-muted"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
