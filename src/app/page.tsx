/**
 * メインマップページ
 *
 * 通常モード: 登録済みトイレをマーカー表示、タップで詳細パネル
 * 登録モード: 周辺コンビニをマーカー表示、タップで登録パネル
 */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Map } from "@/components/map";
import { useAuth } from "@/lib/auth-context";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useListToilets } from "@/gen/api/toilets/toilets";
import { useNearbyStores, type NearbyStore } from "@/hooks/useNearbyStores";
import { useToiletSubmit, type ToiletFormValues } from "@/hooks/useToiletSubmit";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { BottomPanel, type SnapPoint } from "@/components/bottom-panel";
import { Camera, ImageIcon, Loader2, LogOut, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { Toilet } from "@/gen/models";
import type { ToiletBrand } from "@/gen/models/toiletBrand";
import type { CreateToiletRequestBrand } from "@/gen/models/createToiletRequestBrand";
import {
  ToiletMaleIcon,
  ToiletFemaleIcon,
  ToiletIcon,
} from "@/components/icons/toilet-icons";

/** デフォルト検索中心（東京駅） */
const DEFAULT_CENTER = { lat: 35.6812, lng: 139.7671 };

/** ブランド名の日本語表示 */
const BRAND_LABEL: Record<string, string> = {
  seven_eleven: "セブンイレブン",
  family_mart: "ファミリーマート",
  lawson: "ローソン",
  mini_stop: "ミニストップ",
  daily_yamazaki: "デイリーヤマザキ",
  other: "その他",
};

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const geo = useGeolocation();

  // 通常モード
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [snap, setSnap] = useState<SnapPoint>("medium");

  // 登録モード
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const [regSnap, setRegSnap] = useState<SnapPoint>("medium");
  const { stores, isSearching, search } = useNearbyStores();
  const { onSubmit: submitToilet, isSubmitting } = useToiletSubmit();

  // 登録フォーム
  const [requiresPermission, setRequiresPermission] = useState(false);
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 位置情報の取得に失敗した場合、toast で通知する
  useEffect(() => {
    if (geo.error) {
      toast({ title: geo.error, variant: "error" });
    }
  }, [geo.error, toast]);

  // Object URL クリーンアップ
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 現在地 or デフォルト中心で周辺トイレを取得
  const searchCenter =
    geo.latitude != null && geo.longitude != null
      ? { lat: geo.latitude, lng: geo.longitude }
      : DEFAULT_CENTER;

  const { data: toiletData } = useListToilets(searchCenter, {
    query: {
      enabled: !geo.loading,
      select: (res) => (res.status === 200 ? res.data : undefined),
    },
  });

  const userLocation =
    geo.latitude != null && geo.longitude != null
      ? { latitude: geo.latitude, longitude: geo.longitude }
      : null;

  /** 登録モード開始 */
  function startRegistration() {
    setSelectedToilet(null);
    setIsRegistrationMode(true);
    if (geo.latitude != null && geo.longitude != null) {
      search(geo.latitude, geo.longitude);
    }
  }

  /** 登録モード終了 */
  function exitRegistration() {
    setIsRegistrationMode(false);
    setSelectedStore(null);
    resetForm();
  }

  /** フォームリセット */
  function resetForm() {
    setRequiresPermission(false);
    setNote("");
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  /** コンビニ選択 */
  function handleStoreSelect(store: NearbyStore) {
    setSelectedStore(store);
    setRegSnap("medium");
    resetForm();
  }

  /** 画像選択 */
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  /** トイレ登録実行 */
  async function handleRegister() {
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
    exitRegistration();
  }

  async function handleLogout() {
    await logout();
    toast({ title: "ログアウトしました", variant: "info" });
  }

  if (geo.loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        現在地を取得中...
      </div>
    );
  }

  return (
    <>
      <Map
        userLocation={userLocation}
        toilets={toiletData?.toilets}
        onToiletSelect={(toilet) => {
          if (isRegistrationMode) return;
          setSelectedToilet(toilet);
          setSnap("medium");
        }}
        onMapInteraction={() => {
          if (selectedToilet && snap !== "small") setSnap("small");
          if (selectedStore && regSnap !== "small") setRegSnap("small");
        }}
        nearbyStores={isRegistrationMode ? stores : []}
        onStoreSelect={handleStoreSelect}
      />

      {/* ログアウトボタン */}
      {isAuthenticated && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="fixed top-4 right-4 z-10 bg-background/80 backdrop-blur-sm size-10 rounded-full p-0"
          aria-label="ログアウト"
        >
          <LogOut size={18} />
        </Button>
      )}

      {/* 登録 / キャンセルボタン */}
      {isAuthenticated && (
        <Button
          size="sm"
          variant={isRegistrationMode ? "outline" : "primary"}
          onClick={isRegistrationMode ? exitRegistration : startRegistration}
          className="fixed top-4 left-4 z-10 size-10 rounded-full p-0 shadow-lg"
          aria-label={isRegistrationMode ? "キャンセル" : "トイレを登録"}
        >
          {isRegistrationMode ? <X size={20} /> : <Plus size={20} />}
        </Button>
      )}

      {/* 登録モード: 検索中バナー */}
      {isRegistrationMode && isSearching && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">周辺のコンビニを検索中...</span>
        </div>
      )}

      {/* 登録モード: 店舗数バナー */}
      {isRegistrationMode && !isSearching && stores.length > 0 && !selectedStore && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm">コンビニが {stores.length} 件見つかりました。タップして選択</span>
        </div>
      )}

      {/* 通常モード: トイレ詳細パネル */}
      <BottomPanel
        open={selectedToilet !== null && !isRegistrationMode}
        onClose={() => setSelectedToilet(null)}
        snap={snap}
        onSnapChange={setSnap}
      >
        {selectedToilet && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelectedToilet(null)}
              className="absolute right-3 top-0 rounded-full p-1 hover:bg-muted"
            >
              <X size={16} />
            </button>

            <div className="px-4 pb-2">
              <h2 className="font-bold text-base">{selectedToilet.name}</h2>
              <p className="text-sm text-muted-foreground">
                {BRAND_LABEL[selectedToilet.brand]}
                {selectedToilet.address && ` · ${selectedToilet.address}`}
              </p>
            </div>

            {snap !== "small" && (
              <div className="px-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <CountBadge label="男性用" count={selectedToilet.maleCount} icon={<ToiletMaleIcon className="size-4" />} />
                  <CountBadge label="女性用" count={selectedToilet.femaleCount} icon={<ToiletFemaleIcon className="size-4" />} />
                  <CountBadge label="多目的" count={selectedToilet.multipurposeCount} icon={<ToiletIcon className="size-4" />} />
                </div>

                <p className="text-sm text-muted-foreground">
                  {selectedToilet.requiresPermission
                    ? "🙋 店員に声掛けが必要"
                    : "🚪 自由に利用可"}
                </p>

                {selectedToilet.note && (
                  <p className="text-sm text-muted-foreground">
                    📝 {selectedToilet.note}
                  </p>
                )}

                {snap === "large" && selectedToilet.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedToilet.imageUrl}
                      alt={`${selectedToilet.name}のトイレ`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="px-4 py-3">
              <Button className="w-full" asChild>
                <Link href={`/toilets/${selectedToilet.toiletId}`}>
                  詳細を見る
                </Link>
              </Button>
            </div>
          </div>
        )}
      </BottomPanel>

      {/* 登録モード: 登録パネル */}
      <BottomPanel
        open={selectedStore !== null}
        onClose={() => setSelectedStore(null)}
        snap={regSnap}
        onSnapChange={setRegSnap}
      >
        {selectedStore && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelectedStore(null)}
              className="absolute right-3 top-0 rounded-full p-1 hover:bg-muted"
            >
              <X size={16} />
            </button>

            {/* 店舗情報 */}
            <div className="px-4 pb-3">
              <h2 className="font-bold text-base">{selectedStore.name}</h2>
              <p className="text-sm text-muted-foreground">
                {BRAND_LABEL[selectedStore.brand] ?? "その他"} · {Math.round(selectedStore.distance)}m
              </p>
            </div>

            {regSnap !== "small" && (
              <div className="px-4 space-y-4">
                {/* 店員許可 */}
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="reg-permission" className="cursor-pointer">
                      店員に声掛けが必要
                    </FieldLabel>
                    <Switch
                      id="reg-permission"
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
                  <FieldLabel htmlFor="reg-note">備考（任意）</FieldLabel>
                  <Textarea
                    id="reg-note"
                    placeholder="例：2階の奥にあります"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>

                {/* 登録ボタン */}
                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={handleRegister}
                >
                  {isSubmitting ? "登録中..." : "このコンビニのトイレを登録"}
                </Button>
              </div>
            )}
          </div>
        )}
      </BottomPanel>
    </>
  );
}

/** トイレ個数バッジ */
function CountBadge({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-2 text-center space-y-1">
      <div className="flex items-center justify-center text-muted-foreground">{icon}</div>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
