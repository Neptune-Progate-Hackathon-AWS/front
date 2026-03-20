"use client";

import { useState, useEffect } from "react";

/** Geolocation hook の戻り値 */
export interface GeolocationState {
  /** 緯度 */
  latitude: number | null;
  /** 経度 */
  longitude: number | null;
  /** 取得中かどうか */
  loading: boolean;
  /** エラーメッセージ（権限拒否・タイムアウト等） */
  error: string | null;
}

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};

/**
 * ブラウザの Geolocation API で現在地を取得するフック。
 * マウント時に一度だけ getCurrentPosition を呼び、結果を返す。
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        loading: false,
        error: "お使いのブラウザは位置情報に対応していません",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "位置情報の使用が許可されていません"
            : err.code === err.POSITION_UNAVAILABLE
              ? "位置情報を取得できませんでした"
              : "位置情報の取得がタイムアウトしました";

        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: message,
        });
      },
      GEOLOCATION_OPTIONS,
    );
  }, []);

  return state;
}
