"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Map } from "@/components/map";
import { useAuth } from "@/lib/auth-context";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useListToilets } from "@/gen/api/toilets/toilets";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { Toilet } from "@/gen/models";
import type { ToiletBrand } from "@/gen/models/toiletBrand";

/** デフォルト検索中心（東京駅） */
const DEFAULT_CENTER = { lat: 35.6812, lng: 139.7671 };

/** ブランド名の日本語表示 */
const BRAND_LABEL: Record<ToiletBrand, string> = {
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
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);

  // 位置情報の取得に失敗した場合、toast で通知する
  useEffect(() => {
    if (geo.error) {
      toast({ title: geo.error, variant: "error" });
    }
  }, [geo.error, toast]);

  // 現在地 or デフォルト中心で周辺トイレを取得
  const searchCenter =
    geo.latitude != null && geo.longitude != null
      ? { lat: geo.latitude, lng: geo.longitude }
      : DEFAULT_CENTER;

  const { data: toiletData } = useListToilets(searchCenter, {
    query: {
      // 位置情報の取得が完了してからフェッチする
      enabled: !geo.loading,
      select: (res) => (res.status === 200 ? res.data : undefined),
    },
  });

  async function handleLogout() {
    await logout();
    toast({ title: "ログアウトしました", variant: "info" });
  }

  const userLocation =
    geo.latitude != null && geo.longitude != null
      ? { latitude: geo.latitude, longitude: geo.longitude }
      : null;

  // Geolocation の結果が出るまで Map のマウントを遅延させる。
  // initialViewState は初回マウント時しか効かないため、
  // 先に東京駅で描画すると現在地に切り替わらない。
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
        onToiletSelect={setSelectedToilet}
      />
      {/* TODO: navbar に移動する */}
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

      {/* トイレ詳細ドロワー */}
      <Drawer
        open={selectedToilet !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedToilet(null);
        }}
      >
        <DrawerContent>
          {selectedToilet && (
            <>
              <DrawerHeader>
                <DrawerTitle>{selectedToilet.name}</DrawerTitle>
                <DrawerDescription>
                  {BRAND_LABEL[selectedToilet.brand]}
                  {selectedToilet.address && ` · ${selectedToilet.address}`}
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-4 space-y-3">
                {/* トイレ個数 */}
                <div className="grid grid-cols-3 gap-2">
                  <CountBadge label="男性用" count={selectedToilet.maleCount} />
                  <CountBadge label="女性用" count={selectedToilet.femaleCount} />
                  <CountBadge label="多目的" count={selectedToilet.multipurposeCount} />
                </div>

                {/* 許可情報 */}
                <p className="text-sm text-muted-foreground">
                  {selectedToilet.requiresPermission
                    ? "🙋 店員に声掛けが必要"
                    : "🚪 自由に利用可"}
                </p>

                {/* 備考 */}
                {selectedToilet.note && (
                  <p className="text-sm text-muted-foreground">
                    📝 {selectedToilet.note}
                  </p>
                )}
              </div>

              <DrawerFooter>
                <Button asChild>
                  <Link href={`/toilets/${selectedToilet.toiletId}`}>
                    詳細を見る
                  </Link>
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

/** トイレ個数バッジ */
function CountBadge({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-lg border p-2 text-center">
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
