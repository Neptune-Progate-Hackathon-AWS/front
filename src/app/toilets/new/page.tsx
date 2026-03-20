"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCreateToilet } from "@/gen/api/toilets/toilets";
import { useCreatePresignedUrl } from "@/gen/api/images/images";
import { CreateToiletRequestBrand } from "@/gen/models/createToiletRequestBrand";
import { PresignedUrlRequestContentType } from "@/gen/models/presignedUrlRequestContentType";


type ToiletForm = {
  brand: CreateToiletRequestBrand;
  address: string;
  lat: string;
  lng: string;
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: getPresignedUrl } = useCreatePresignedUrl();
  const { mutateAsync: createToilet } = useCreateToilet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ToiletForm>({
    brand: CreateToiletRequestBrand.seven_eleven,
    address: "",
    lat: "",
    lng: "",
    requiresPermission: false,
    note: "",
    image: null,
  });
  const geo = useGeolocation();

  // 現在地が取得できたら住所・緯度経度を自動入力
  useEffect(() => {
    if (geo.latitude == null || geo.longitude == null) return;

    const lat = geo.latitude;
    const lng = geo.longitude;

    setForm(prev => ({ ...prev, lat: String(lat), lng: String(lng) }));

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`
    )
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setForm(prev => ({ ...prev, address: data.display_name }));
        }
      })
      .catch(() => { });
  }, [geo.latitude, geo.longitude]);

  const handleChange = (
    key: Exclude<keyof ToiletForm, "image" | "brand" | "requiresPermission">,
    value: string
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  /** 全角数字・全角マイナスを半角に変換 */
  const normalize = (str: string) =>
    str
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/−/g, "-");

  //入力された住所から緯度経度を取得する
  const getLatLngFromAddress = async (address: string) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(normalize(address))}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length > 0) {
      setForm(prev => ({ ...prev, lat: data[0].lat, lng: data[0].lon }));
    }
    alert("緯度経度の取得に成功しました");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 画像が選択されている場合のみ S3 アップロード（未実装のためスキップ）
      let imageKey = "";
      if (form.image) {
        const contentType = form.image.type as PresignedUrlRequestContentType;
        const presignedResult = await getPresignedUrl({ data: { contentType } });
        if (presignedResult.status !== 200) throw new Error("Presigned URL の取得に失敗しました");
        imageKey = presignedResult.data.imageKey;
      }

      // トイレデータを POST
      await createToilet({
        data: {
          name: "",
          brand: form.brand,
          address: form.address || undefined,
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
          imageKey,
          maleCount: 0,
          femaleCount: 0,
          multipurposeCount: 0,
          requiresPermission: form.requiresPermission,
          note: form.note || undefined,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["http://localhost:8080/toilets"] });
      router.push("/");
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
            <div className="flex justify-left">
              <Button type="button" onClick={() => getLatLngFromAddress(form.address)}>住所から緯度経度を取得</Button>
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
