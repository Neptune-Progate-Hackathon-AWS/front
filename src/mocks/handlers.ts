import { http, HttpResponse } from "msw";
import { getImagesMock } from "@/gen/api/images/images.msw";
import { getGetToiletMockHandler } from "@/gen/api/toilets/toilets.msw";
import type { CreateToiletRequest, ListToilets200, Toilet } from "@/gen/models";

const SEARCH_RADIUS_METERS = 500;

/** Haversine 公式で2点間の距離（メートル）を計算 */
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 新規登録されたトイレのメモリストア */
const registeredToilets: Toilet[] = [];

/**
 * リクエストの lat/lng 周辺にモックトイレを生成する。
 * 地図上で確認しやすいよう、中心からランダムにずらした座標を使う。
 */
const listToiletsMockHandler = http.get("*/toilets", ({ request }) => {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "35.6812");
  const lng = parseFloat(url.searchParams.get("lng") ?? "139.7671");

  const brands = [
    "seven_eleven",
    "family_mart",
    "lawson",
    "mini_stop",
    "daily_yamazaki",
    "other",
  ] as const;

  const names: Record<(typeof brands)[number], string> = {
    seven_eleven: "セブンイレブン",
    family_mart: "ファミリーマート",
    lawson: "ローソン",
    mini_stop: "ミニストップ",
    daily_yamazaki: "デイリーヤマザキ",
    other: "その他コンビニ",
  };

  // 現在地から半径 ~500m 以内にランダム配置
  const staticToilets = Array.from({ length: 8 }, (_, i) => {
    const brand = brands[i % brands.length];
    const offset = () => (Math.random() - 0.5) * 0.01; // ~500m
    return {
      toiletId: `mock-${i + 1}`,
      name: `${names[brand]} ${i + 1}号店`,
      brand,
      address: `東京都目黒区${i + 1}丁目`,
      lat: lat + offset(),
      lng: lng + offset(),
      imageUrl: "https://placehold.co/400x300",
      maleCount: Math.floor(Math.random() * 3) + 1,
      femaleCount: Math.floor(Math.random() * 3) + 1,
      multipurposeCount: Math.random() > 0.5 ? 1 : 0,
      requiresPermission: Math.random() > 0.7,
      note: i === 0 ? "きれいなトイレです" : undefined,
      createdBy: "mock-user",
      createdAt: "2026-03-20T00:00:00Z",
    };
  });

  const nearbyStatic = staticToilets.filter(
    (t) => getDistanceMeters(lat, lng, t.lat, t.lng) <= SEARCH_RADIUS_METERS
  );
  const nearbyRegistered = registeredToilets.filter(
    (t) => getDistanceMeters(lat, lng, t.lat, t.lng) <= SEARCH_RADIUS_METERS
  );

  const body: ListToilets200 = { toilets: [...nearbyStatic, ...nearbyRegistered] };
  return HttpResponse.json(body, { status: 200 });
});

/** 新規トイレ登録 → メモリストアに保存 */
const createToiletMockHandler = http.post("*/toilets", async ({ request }) => {
  const body = await request.json() as CreateToiletRequest;

  const newToilet: Toilet = {
    toiletId: crypto.randomUUID(),
    name: body.name,
    brand: body.brand,
    address: body.address,
    lat: body.lat,
    lng: body.lng,
    imageUrl: "https://placehold.co/400x300",
    maleCount: body.maleCount,
    femaleCount: body.femaleCount,
    multipurposeCount: body.multipurposeCount,
    requiresPermission: body.requiresPermission,
    note: body.note,
    createdBy: "mock-user",
    createdAt: new Date().toISOString().slice(0, 19) + "Z",
  };

  registeredToilets.push(newToilet);
  return HttpResponse.json(newToilet, { status: 201 });
});

export const handlers = [
  ...getImagesMock(),
  listToiletsMockHandler,
  createToiletMockHandler,
  getGetToiletMockHandler(),
];
