"use client";

import { useEffect } from "react";
import { Map } from "@/components/map";
import { useAuth } from "@/lib/auth-context";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/toast";

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
      <Map userLocation={userLocation} />
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
