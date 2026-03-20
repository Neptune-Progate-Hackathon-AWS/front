/**
 * トイレ登録ページ（簡易フロー）
 *
 * 1. GPS取得 → Amazon Location Service で周辺コンビニ検索
 * 2. 候補リストから店舗を選択
 * 3. 「店員許可が必要？」トグル + 任意で写真・備考
 * 4. 登録完了
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, ChevronRight, ImageIcon, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearbyStores, type NearbyStore } from "@/hooks/useNearbyStores";
import { useToiletSubmit, type ToiletFormValues } from "@/hooks/useToiletSubmit";
import { useToast } from "@/components/ui/toast";
import type { CreateToiletRequestBrand } from "@/gen/models/createToiletRequestBrand";

/** ブランドの日本語ラベル */
const BRAND_LABEL: Record<string, string> = {
  seven_eleven: "セブンイレブン",
  family_mart: "ファミリーマート",
  lawson: "ローソン",
  mini_stop: "ミニストップ",
  daily_yamazaki: "デイリーヤマザキ",
  other: "その他",
};

/** ブランドカラー */
const BRAND_COLOR: Record<string, string> = {
  seven_eleven: "bg-orange-500",
  family_mart: "bg-green-600",
  lawson: "bg-blue-500",
  mini_stop: "bg-yellow-500",
  daily_yamazaki: "bg-red-500",
  other: "bg-gray-500",
};

export default function NewToiletPage() {
  return (
    <AuthGuard>
      <NewToiletFlow />
    </AuthGuard>
  );
}

function NewToiletFlow() {
  const router = useRouter();
  const geo = useGeolocation();
  const { stores, isSearching, error: searchError, search } = useNearbyStores();
  const { onSubmit: submitToilet, isSubmitting } = useToiletSubmit();
  const { toast } = useToast();

  // ステップ管理: "select" → 店舗選択, "confirm" → 確認・追加情報
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);

  // 確認画面のフォーム値
  const [requiresPermission, setRequiresPermission] = useState(false);
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS取得完了時に自動検索
  useEffect(() => {
    if (geo.latitude != null && geo.longitude != null) {
      search(geo.latitude, geo.longitude);
    }
  }, [geo.latitude, geo.longitude, search]);

  // Object URL クリーンアップ
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /** 店舗選択 */
  function handleSelectStore(store: NearbyStore) {
    setSelectedStore(store);
    setStep("confirm");
  }

  /** 画像選択 */
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  /** 登録実行 */
  async function handleSubmit() {
    if (!selectedStore) return;

    const values: ToiletFormValues = {
      name: selectedStore.name,
      brand: selectedStore.brand as CreateToiletRequestBrand,
      address: selectedStore.address,
      lat: selectedStore.lat,
      lng: selectedStore.lng,
      maleCount: 0,
      femaleCount: 0,
      multipurposeCount: 0,
      requiresPermission,
      note: note || undefined,
      imageFile,
    };

    await submitToilet(values);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 py-3">
        <button
          type="button"
          onClick={() => {
            if (step === "confirm") {
              setStep("select");
              setSelectedStore(null);
            } else {
              router.back();
            }
          }}
          className="p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">
          {step === "select" ? "近くのコンビニ" : "トイレ情報を登録"}
        </h1>
      </header>

      {/* Step 1: 店舗選択 */}
      {step === "select" && (
        <div className="p-4">
          {/* 検索中 */}
          {(geo.loading || isSearching) && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm">
                {geo.loading ? "現在地を取得中..." : "周辺のコンビニを検索中..."}
              </p>
            </div>
          )}

          {/* エラー */}
          {searchError && !isSearching && (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Search size={32} />
              <p className="text-sm">{searchError}</p>
              {geo.latitude != null && geo.longitude != null && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => search(geo.latitude!, geo.longitude!)}
                >
                  再検索
                </Button>
              )}
            </div>
          )}

          {/* 候補リスト */}
          {!isSearching && !geo.loading && stores.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                <MapPin size={14} className="inline mr-1" />
                現在地から近い順
              </p>
              {stores.map((store, i) => (
                <button
                  key={`${store.lat}-${store.lng}-${i}`}
                  type="button"
                  onClick={() => handleSelectStore(store)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  {/* ブランドカラーバッジ */}
                  <div
                    className={`shrink-0 size-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${BRAND_COLOR[store.brand] ?? "bg-gray-500"}`}
                  >
                    {(BRAND_LABEL[store.brand] ?? "他")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{store.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {BRAND_LABEL[store.brand] ?? "その他"} · {Math.round(store.distance)}m
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: 確認・追加情報 */}
      {step === "confirm" && selectedStore && (
        <div className="p-4 pb-24 space-y-5">
          {/* 選択した店舗 */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div
              className={`shrink-0 size-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${BRAND_COLOR[selectedStore.brand] ?? "bg-gray-500"}`}
            >
              {(BRAND_LABEL[selectedStore.brand] ?? "他")[0]}
            </div>
            <div>
              <p className="font-medium">{selectedStore.name}</p>
              <p className="text-xs text-muted-foreground">
                {BRAND_LABEL[selectedStore.brand]} · {Math.round(selectedStore.distance)}m
              </p>
            </div>
          </div>

          {/* 店員許可 */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="requiresPermission" className="cursor-pointer">
                店員に声掛けが必要
              </FieldLabel>
              <Switch
                id="requiresPermission"
                checked={requiresPermission}
                onChange={(e) => setRequiresPermission(e.target.checked)}
              />
            </div>
          </Field>

          {/* 写真（任意） */}
          <Field>
            <FieldLabel>写真（任意）</FieldLabel>
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
                className="flex items-center justify-center gap-2 w-full h-12 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 transition-colors"
              >
                <Camera size={18} />
                <ImageIcon size={18} />
                <span className="text-sm">タップして撮影 / 選択</span>
              </button>
            )}
          </Field>

          {/* 備考（任意） */}
          <Field>
            <FieldLabel htmlFor="note">備考（任意）</FieldLabel>
            <Textarea
              id="note"
              placeholder="例：2階の奥にあります"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>

          {/* 登録ボタン */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
            <Button
              className="w-full"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
