"use client";

import { useRef, useCallback, useEffect, useState, type ReactNode } from "react";

type SnapPoint = "closed" | "small" | "medium" | "large";

const SNAP_ORDER: SnapPoint[] = ["small", "medium", "large"];

/** 各スナップポイントの高さ（vh） */
const SNAP_VH: Record<SnapPoint, number> = {
  closed: 0,
  small: 15,
  medium: 40,
  large: 85,
};

interface BottomPanelProps {
  open: boolean;
  onClose: () => void;
  snap: SnapPoint;
  onSnapChange: (snap: SnapPoint) => void;
  children: ReactNode;
}

/**
 * Google Maps ライクなボトムパネル。
 * 地図の上に重なり、ドラッグで高さを切り替えられる。
 * modal ではないので背後のコンテンツは操作可能。
 */
export function BottomPanel({
  open,
  onClose,
  snap,
  onSnapChange,
  children,
}: BottomPanelProps) {
  const dragStartY = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 出現アニメーション：マウント直後は height:0、次フレームで目標サイズに
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) {
      // requestAnimationFrame で次フレームまで待ってからアニメーション開始
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    // ポインターをキャプチャして、要素外に出てもイベントを受け取る
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragStartY.current === null) return;
      const delta = e.clientY - dragStartY.current;
      dragStartY.current = null;

      const threshold = 30;
      const currentIndex = SNAP_ORDER.indexOf(snap);

      if (delta < -threshold && currentIndex < SNAP_ORDER.length - 1) {
        // 上スワイプ → 大きく
        onSnapChange(SNAP_ORDER[currentIndex + 1]);
      } else if (delta > threshold) {
        if (currentIndex > 0) {
          // 下スワイプ → 小さく
          onSnapChange(SNAP_ORDER[currentIndex - 1]);
        } else {
          // small で下スワイプ → 閉じる
          onClose();
        }
      }
    },
    [snap, onSnapChange, onClose],
  );

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="fixed inset-x-0 bottom-0 z-40 bg-background rounded-t-xl shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t transition-[height] duration-300 ease-out flex flex-col"
      style={{ height: mounted ? `${SNAP_VH[snap]}vh` : "0vh" }}
    >
      {/* ドラッグエリア（ハンドル + ヘッダー領域） */}
      <div
        className="cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* ハンドルバー */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export type { SnapPoint };
