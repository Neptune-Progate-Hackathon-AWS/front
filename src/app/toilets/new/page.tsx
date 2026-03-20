"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";
import { useCreateToilet } from "@/gen/api/toilets/toilets";
import { useCreatePresignedUrl } from "@/gen/api/images/images";
import { CreateToiletRequestBrand } from "@/gen/models/createToiletRequestBrand";
import { PresignedUrlRequestContentType } from "@/gen/models/presignedUrlRequestContentType";

type ToiletForm = {
  name: string;
  brand: CreateToiletRequestBrand;
  address: string;
  lat: string;
  lng: string;
  maleCount: string;
  femaleCount: string;
  multipurposeCount: string;
  requiresPermission: boolean;
  note: string;
  image: File | null;
};

const BRAND_LABELS: Record<CreateToiletRequestBrand, string> = {
  seven_eleven: "セブン-イレブン",
  family_mart: "ファミリーマート",
  lawson: "ローソン",
  mini_stop: "ミニストップ",
  daily_yamazaki: "デイリーヤマザキ",
  other: "その他",
};

export default function NewToiletPage() {
  const { mutateAsync: getPresignedUrl } = useCreatePresignedUrl();
  const { mutateAsync: createToilet } = useCreateToilet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ToiletForm>({
    name: "",
    brand: CreateToiletRequestBrand.seven_eleven,
    address: "",
    lat: "",
    lng: "",
    maleCount: "0",
    femaleCount: "0",
    multipurposeCount: "0",
    requiresPermission: false,
    note: "",
    image: null,
  });

  const handleChange = (
    key: Exclude<keyof ToiletForm, "image" | "brand" | "requiresPermission">,
    value: string
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.image) return;

    setIsSubmitting(true);
    try {
      // 1. Presigned URL を取得
      const contentType = form.image.type as PresignedUrlRequestContentType;
      const presignedResult = await getPresignedUrl({ data: { contentType } });
      if (presignedResult.status !== 200) throw new Error("Presigned URL の取得に失敗しました");
      const { uploadUrl, imageKey } = presignedResult.data;

      // 2. S3 に画像を直接アップロード
      // const uploadRes = await fetch(uploadUrl, {
      //   method: "PUT",
      //   headers: { "Content-Type": form.image.type },
      //   body: form.image,
      // });
      // if (!uploadRes.ok) throw new Error("画像のアップロードに失敗しました");

      // 3. トイレデータを POST
      await createToilet({
        data: {
          name: form.name,
          brand: form.brand,
          address: form.address || undefined,
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
          imageKey,
          maleCount: parseInt(form.maleCount, 10),
          femaleCount: parseInt(form.femaleCount, 10),
          multipurposeCount: parseInt(form.multipurposeCount, 10),
          requiresPermission: form.requiresPermission,
          note: form.note || undefined,
        },
      });

      alert("登録が完了しました");
    } catch (err) {
      alert(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>新しいトイレ登録</CardTitle>
        <CardDescription>新しいトイレの情報を入力してください。</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">

            <div className="grid gap-2">
              <Label htmlFor="name">コンビニ店舗名 *</Label>
              <Input
                id="name"
                placeholder="セブンイレブン〇〇店"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>ブランド *</Label>
              <Select
                value={form.brand}
                onValueChange={(value) =>
                  setForm(prev => ({ ...prev, brand: value as CreateToiletRequestBrand }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="ブランドを選択" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRAND_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                placeholder="東京都渋谷区..."
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="lat">緯度 *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="35.6812"
                  value={form.lat}
                  onChange={(e) => handleChange("lat", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lng">経度 *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="139.7671"
                  value={form.lng}
                  onChange={(e) => handleChange("lng", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="maleCount">男性用</Label>
                <Input
                  id="maleCount"
                  type="number"
                  min="0"
                  value={form.maleCount}
                  onChange={(e) => handleChange("maleCount", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="femaleCount">女性用</Label>
                <Input
                  id="femaleCount"
                  type="number"
                  min="0"
                  value={form.femaleCount}
                  onChange={(e) => handleChange("femaleCount", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="multipurposeCount">多目的</Label>
                <Input
                  id="multipurposeCount"
                  type="number"
                  min="0"
                  value={form.multipurposeCount}
                  onChange={(e) => handleChange("multipurposeCount", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresPermission"
                checked={form.requiresPermission}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, requiresPermission: e.target.checked }))
                }
              />
              <Label htmlFor="requiresPermission">店員への使用許可が必要</Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">備考</Label>
              <Textarea
                id="note"
                placeholder="備考(500文字以内)"
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </div>

            {/* <div className="grid gap-2">
              <Label htmlFor="image">画像 *</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                required
              />
            </div> */}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録"}
            </Button>

          </div>
        </form>
      </CardContent>
    </Card>
  );
}
