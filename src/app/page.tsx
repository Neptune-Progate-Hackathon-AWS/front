"use client";

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

  async function handleLogout() {
    await logout();
    toast({ title: "ログアウトしました", variant: "info" });
  }

  const userLocation =
    geo.latitude != null && geo.longitude != null
      ? { latitude: geo.latitude, longitude: geo.longitude }
      : null;

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
