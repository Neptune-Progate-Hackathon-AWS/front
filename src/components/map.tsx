"use client";

import { Map as MapGL, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Toilet } from "@/gen/models";
import type { ToiletBrand } from "@/gen/models/toiletBrand";

/** 東京駅をフォールバック中心に使用 */
const DEFAULT_CENTER = {
  latitude: 35.6812,
  longitude: 139.7671,
} as const;

/** ブランドごとのマーカー色 */
const BRAND_COLORS: Record<ToiletBrand, string> = {
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
}

/**
 * MapLibre GL JS による地図コンポーネント。
 * userLocation が渡された場合はそこを中心に表示し、現在地マーカーを描画する。
 * toilets が渡された場合はピンを表示する。
 */
export function Map({ userLocation, toilets = [], onToiletSelect }: MapProps) {
  const center = userLocation ?? DEFAULT_CENTER;

  return (
    <MapGL
      initialViewState={{ ...center, zoom: 15 }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
    >
      {/* トイレマーカー */}
      {toilets.map((toilet) => (
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
              className="size-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: BRAND_COLORS[toilet.brand] }}
            >
              🚻
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
            className="size-4 rounded-full bg-blue-500 border-2 border-white shadow-md"
            aria-label="現在地"
          />
        </Marker>
      )}
    </MapGL>
  );
}
