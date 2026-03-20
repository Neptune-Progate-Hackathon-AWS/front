/**
 * 周辺コンビニ検索フック
 *
 * Amazon Location Service の SearchPlaceIndexForText を使って
 * 現在地周辺のコンビニエンスストアを検索する。
 * Cognito Identity Pool 経由で AWS クレデンシャルを取得。
 */
import { useState, useCallback, useRef } from "react";
import {
  LocationClient,
  SearchPlaceIndexForTextCommand,
} from "@aws-sdk/client-location";
import { fetchAuthSession } from "aws-amplify/auth";

const PLACE_INDEX_NAME = process.env.NEXT_PUBLIC_PLACE_INDEX_NAME ?? "";

/** 検索結果の店舗情報 */
export interface NearbyStore {
  name: string;
  brand: string;
  address: string;
  lat: number;
  lng: number;
  distance: number; // メートル
}

/** ブランド名の正規化マッピング */
const BRAND_MAP: Record<string, string> = {
  "セブン-イレブン": "seven_eleven",
  "セブンイレブン": "seven_eleven",
  "7-Eleven": "seven_eleven",
  "ファミリーマート": "family_mart",
  "FamilyMart": "family_mart",
  "ローソン": "lawson",
  "Lawson": "lawson",
  "ミニストップ": "mini_stop",
  "MINISTOP": "mini_stop",
  "デイリーヤマザキ": "daily_yamazaki",
  "Daily Yamazaki": "daily_yamazaki",
};

/** 店舗名からブランドを推定 */
function detectBrand(name: string): string {
  for (const [keyword, brand] of Object.entries(BRAND_MAP)) {
    if (name.includes(keyword)) return brand;
  }
  return "other";
}

export function useNearbyStores() {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // LocationClient を使い回す
  const clientRef = useRef<LocationClient | null>(null);

  const search = useCallback(async (lat: number, lng: number) => {
    setIsSearching(true);
    setError(null);

    try {
      if (!PLACE_INDEX_NAME) {
        throw new Error("Place Index が設定されていません（NEXT_PUBLIC_PLACE_INDEX_NAME）");
      }

      // クライアントがなければ初期化
      if (!clientRef.current) {
        const session = await fetchAuthSession();
        const credentials = session.credentials;
        if (!credentials) {
          throw new Error("AWS クレデンシャルを取得できませんでした");
        }
        clientRef.current = new LocationClient({
          region: "us-east-1",
          credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
          },
        });
      }

      // 「コンビニ」で周辺テキスト検索（店名が返る）
      const command = new SearchPlaceIndexForTextCommand({
        IndexName: PLACE_INDEX_NAME,
        Text: "コンビニ",
        BiasPosition: [lng, lat], // [経度, 緯度] の順
        MaxResults: 10,
        Language: "ja",
      });

      const result = await clientRef.current.send(command);

      const convenienceStores: NearbyStore[] = (result.Results ?? [])
        .map((r) => {
          const place = r.Place!;
          const label = place.Label ?? "不明な店舗";
          // Label は "セブン-イレブン ○○店, 東京都..." の形式
          const name = label.split(",")[0]?.trim() ?? label;
          const point = place.Geometry?.Point;
          return {
            name,
            brand: detectBrand(label),
            address: [place.Municipality, place.AddressNumber]
              .filter(Boolean)
              .join("") || label,
            lat: point?.[1] ?? lat,
            lng: point?.[0] ?? lng,
            distance: r.Distance ?? 0,
          };
        })
        .sort((a, b) => a.distance - b.distance);

      setStores(convenienceStores);

      if (convenienceStores.length === 0) {
        setError("周辺にコンビニが見つかりませんでした");
      }
    } catch (err) {
      // クレデンシャル期限切れ時はクライアントをリセット
      clientRef.current = null;
      const message =
        err instanceof Error ? err.message : "店舗の検索に失敗しました";
      setError(message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { stores, isSearching, error, search };
}
