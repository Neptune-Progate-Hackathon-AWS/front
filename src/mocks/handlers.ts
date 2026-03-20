import { http, HttpResponse } from "msw";
import { getImagesMock } from "@/gen/api/images/images.msw";
import {
  getCreateToiletMockHandler,
  getGetToiletMockHandler,
} from "@/gen/api/toilets/toilets.msw";
import type { ListToilets200 } from "@/gen/models";

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
  const toilets = Array.from({ length: 8 }, (_, i) => {
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

  const body: ListToilets200 = { toilets };
  return HttpResponse.json(body, { status: 200 });
});

export const handlers = [
  ...getImagesMock(),
  listToiletsMockHandler,
  getCreateToiletMockHandler(),
  getGetToiletMockHandler(),
];
