"use client";

import { Map as MapGL, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Store } from "lucide-react";
import type { Toilet } from "@/gen/models";
import type { ToiletBrand } from "@/gen/models/toiletBrand";
import { ToiletIcon } from "@/components/icons/toilet-icons";
import type { NearbyStore } from "@/hooks/useNearbyStores";

/** 東京駅をフォールバック中心に使用 */
const DEFAULT_CENTER = {
  latitude: 35.6812,
  longitude: 139.7671,
} as const;

/** ブランドごとのマーカー色 */
const BRAND_COLORS: Record<string, string> = {
  seven_eleven: "#f97316", // orange
  family_mart: "#22c55e",  // green
  lawson: "#3b82f6",       // blue
  mini_stop: "#eab308",    // yellow
  daily_yamazaki: "#ef4444", // red
  other: "#6b7280",        // gray
};

interface MapProps {
  /** ユーザーの現在地（取得できた場合） */
  userLocation?: { latitude: number; longitude: number } | null;
  /** 地図上に表示するトイレ一覧 */
  toilets?: Toilet[];
  /** マーカータップ時のコールバック */
  onToiletSelect?: (toilet: Toilet) => void;
  /** 地図操作開始時のコールバック */
  onMapInteraction?: () => void;
  /** 登録モード: 周辺コンビニのピン */
  nearbyStores?: NearbyStore[];
  /** 周辺コンビニタップ時のコールバック */
  onStoreSelect?: (store: NearbyStore) => void;
}

/**
 * MapLibre GL JS による地図コンポーネント。
 * 通常モード: トイレマーカーを表示
 * 登録モード: 周辺コンビニのマーカーを表示
 */
export function Map({
  userLocation,
  toilets = [],
  onToiletSelect,
  onMapInteraction,
  nearbyStores = [],
  onStoreSelect,
}: MapProps) {
  const center = userLocation ?? DEFAULT_CENTER;
  const isRegistrationMode = nearbyStores.length > 0;

  return (
    <MapGL
      initialViewState={{ ...center, zoom: 15 }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      onMoveStart={onMapInteraction}
    >
      {/* 通常モード: トイレマーカー */}
      {!isRegistrationMode &&
        toilets.map((toilet) => (
          <Marker
            key={toilet.toiletId}
            latitude={toilet.lat}
            longitude={toilet.lng}
            anchor="bottom"
          >
            <button
              type="button"
              className="flex flex-col items-center cursor-pointer"
              title={toilet.name}
              onClick={() => onToiletSelect?.(toilet)}
            >
              <div
                className="size-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white"
                style={{ backgroundColor: BRAND_COLORS[toilet.brand] }}
              >
                <ToiletIcon className="size-5" />
              </div>
            </button>
          </Marker>
        ))}

      {/* 登録モード: 周辺コンビニマーカー */}
      {nearbyStores.map((store, i) => (
        <Marker
          key={`store-${store.lat}-${store.lng}-${i}`}
          latitude={store.lat}
          longitude={store.lng}
          anchor="bottom"
        >
          <button
            type="button"
            className="flex flex-col items-center cursor-pointer animate-in fade-in zoom-in duration-300"
            title={store.name}
            onClick={() => onStoreSelect?.(store)}
          >
            <div
              className="size-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"
              style={{ backgroundColor: BRAND_COLORS[store.brand] ?? BRAND_COLORS.other }}
            >
              <Store className="size-5" />
            </div>
          </button>
        </Marker>
      ))}

      {/* 現在地マーカー */}
      {userLocation && (
        <Marker
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          anchor="center"
        >
          <div
            className="size-10 rounded-full bg-blue-500 border-3 border-white shadow-md"
            aria-label="現在地"
          />
        </Marker>
      )}
    </MapGL>
  );
}
