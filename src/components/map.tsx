"use client";

import { Map as MapGL, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/** 東京駅をフォールバック中心に使用 */
const DEFAULT_CENTER = {
  latitude: 35.6812,
  longitude: 139.7671,
} as const;

interface MapProps {
  /** ユーザーの現在地（取得できた場合） */
  userLocation?: { latitude: number; longitude: number } | null;
}

/**
 * MapLibre GL JS による地図コンポーネント。
 * userLocation が渡された場合はそこを中心に表示し、現在地マーカーを描画する。
 */
export function Map({ userLocation }: MapProps) {
  const center = userLocation ?? DEFAULT_CENTER;

  return (
    <MapGL
      initialViewState={{ ...center, zoom: 15 }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
    >
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
