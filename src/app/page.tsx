"use client";

import { useEffect } from "react";
import { Map } from "@/components/map";
import { useAuth } from "@/lib/auth-context";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useListToilets } from "@/gen/api/toilets/toilets";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/** デフォルト検索中心（東京駅） */
const DEFAULT_CENTER = { lat: 35.6812, lng: 139.7671 };

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const geo = useGeolocation();

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
      <Map userLocation={userLocation} toilets={toiletData?.toilets} />
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
    </>
  );
}
