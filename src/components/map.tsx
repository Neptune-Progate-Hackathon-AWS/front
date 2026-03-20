"use client";

import { Map as MapGL, Marker, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Toilet } from "@/gen/models";
import type { ToiletBrand } from "@/gen/models/toiletBrand";
import { ToiletIcon } from "@/components/icons/toilet-icons";
import { useRef, useEffect } from "react";

/** 緯度・経度を中心に半径 radiusMeters の円ポリゴンを生成 */
function createCircleGeoJSON(lat: number, lng: number, radiusMeters: number, steps = 64) {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (radiusMeters / 111320) * Math.cos(angle);
    const dLng = (radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    points.push([lng + dLng, lat + dLat]);
  }
  return {
    type: "Feature" as const,
    geometry: { type: "Polygon" as const, coordinates: [points] },
    properties: {},
  };
}

/** Haversine 公式で2点間の距離（メートル）を計算 */
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 東京駅をフォールバック中心に使用 */
const DEFAULT_CENTER = {
  latitude: 35.6812,
  longitude: 139.7671,
} as const;

/** ブランドごとのマーカー色 */
const BRAND_COLORS: Record<ToiletBrand, string> = {
  seven_eleven: "#f97316",
  family_mart: "#22c55e",
  lawson: "#3b82f6",
  mini_stop: "#eab308",
  daily_yamazaki: "#ef4444",
  other: "#6b7280",
};

export type DrawnCircle = { lat: number; lng: number; radiusMeters: number };

/** フリーハンド描画オーバーレイ */
function DrawingOverlay({
  mapRef,
  onCircleDrawn,
}: {
  mapRef: React.RefObject<MapRef | null>;
  onCircleDrawn: (circle: DrawnCircle) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<[number, number][]>([]);

  // キャンバスサイズを親要素に合わせる
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  // タッチイベントは passive: false が必要なため useEffect で登録
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getTouch = (e: TouchEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      pointsRef.current = [getTouch(e)];
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      pointsRef.current.push(getTouch(e));
      drawPath(canvas);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      finishDrawing(canvas);
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawPath = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const points = pointsRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.setLineDash([6, 3]);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const finishDrawing = (canvas: HTMLCanvasElement) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const map = mapRef.current;
    const points = pointsRef.current;
    if (points.length < 3 || !map) return;

    // 重心と平均半径を算出
    const cx = points.reduce((s, [x]) => s + x, 0) / points.length;
    const cy = points.reduce((s, [, y]) => s + y, 0) / points.length;
    const radiusPx = points.reduce((s, [x, y]) => s + Math.hypot(x - cx, y - cy), 0) / points.length;

    // フィットした円を描画
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // ピクセル座標 → 緯度経度変換
    const centerLL = map.unproject([cx, cy]);
    const edgeLL = map.unproject([cx + radiusPx, cy]);
    const radiusMeters = getDistanceMeters(centerLL.lat, centerLL.lng, edgeLL.lat, edgeLL.lng);

    // 1秒後にコールバック & キャンバスクリア
    setTimeout(() => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onCircleDrawn({ lat: centerLL.lat, lng: centerLL.lng, radiusMeters });
    }, 1000);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      style={{ zIndex: 10 }}
      onMouseDown={(e) => {
        isDrawingRef.current = true;
        pointsRef.current = [getMousePos(e)];
      }}
      onMouseMove={(e) => {
        if (!isDrawingRef.current || !canvasRef.current) return;
        pointsRef.current.push(getMousePos(e));
        drawPath(canvasRef.current);
      }}
      onMouseUp={() => canvasRef.current && finishDrawing(canvasRef.current)}
      onMouseLeave={() => canvasRef.current && finishDrawing(canvasRef.current)}
    />
  );
}

interface MapProps {
  userLocation?: { latitude: number; longitude: number } | null;
  toilets?: Toilet[];
  onToiletSelect?: (toilet: Toilet) => void;
  onMapInteraction?: () => void;
  mode?: "default" | "external";
  externalCircle?: DrawnCircle | null;
  onCircleDrawn?: (circle: DrawnCircle) => void;
}

export function Map({
  userLocation,
  toilets = [],
  onToiletSelect,
  onMapInteraction,
  mode = "default",
  externalCircle,
  onCircleDrawn,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const center = userLocation ?? DEFAULT_CENTER;

  return (
    <div className="relative w-full h-screen">
      <MapGL
        ref={mapRef}
        initialViewState={{ ...center, zoom: 15 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onMoveStart={mode === "default" ? onMapInteraction : undefined}
        dragPan={mode !== "external"}
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
                className="size-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white"
                style={{ backgroundColor: BRAND_COLORS[toilet.brand] }}
              >
                <ToiletIcon className="size-5" />
              </div>
            </button>
          </Marker>
        ))}

        {/* デフォルトモード：現在地500m円（青） */}
        {mode === "default" && userLocation && (
          <Source
            id="search-area"
            type="geojson"
            data={createCircleGeoJSON(userLocation.latitude, userLocation.longitude, 500)}
          >
            <Layer
              id="search-area-fill"
              type="fill"
              paint={{ "fill-color": "#3b82f6", "fill-opacity": 0.08 }}
            />
            <Layer
              id="search-area-border"
              type="line"
              paint={{ "line-color": "#3b82f6", "line-width": 2, "line-opacity": 0.4 }}
            />
          </Source>
        )}

        {/* 外部検索モード：描いた円（橙） */}
        {mode === "external" && externalCircle && (
          <Source
            id="external-search-area"
            type="geojson"
            data={createCircleGeoJSON(externalCircle.lat, externalCircle.lng, externalCircle.radiusMeters)}
          >
            <Layer
              id="external-search-area-fill"
              type="fill"
              paint={{ "fill-color": "#f59e0b", "fill-opacity": 0.08 }}
            />
            <Layer
              id="external-search-area-border"
              type="line"
              paint={{ "line-color": "#f59e0b", "line-width": 2, "line-opacity": 0.6 }}
            />
          </Source>
        )}

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

      {/* 描画オーバーレイ（外部検索モード時のみ） */}
      {mode === "external" && onCircleDrawn && (
        <DrawingOverlay mapRef={mapRef} onCircleDrawn={onCircleDrawn} />
      )}
    </div>
  );
}
