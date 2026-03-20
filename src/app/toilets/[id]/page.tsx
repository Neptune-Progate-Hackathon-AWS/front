"use client";

import { use } from "react";
import Link from "next/link";
import { useGetToilet } from "@/gen/api/toilets/toilets";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { ToiletBrand } from "@/gen/models/toiletBrand";
import {
  ToiletMaleIcon,
  ToiletFemaleIcon,
  ToiletIcon,
} from "@/components/icons/toilet-icons";

/** ブランド名の日本語表示 */
const BRAND_LABEL: Record<ToiletBrand, string> = {
  seven_eleven: "セブンイレブン",
  family_mart: "ファミリーマート",
  lawson: "ローソン",
  mini_stop: "ミニストップ",
  daily_yamazaki: "デイリーヤマザキ",
  other: "その他",
};

export default function ToiletDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError } = useGetToilet(id, {
    query: {
      select: (res) => (res.status === 200 ? res.data : undefined),
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">トイレ情報が見つかりませんでした</p>
        <Button variant="outline" asChild>
          <Link href="/">地図に戻る</Link>
        </Button>
      </div>
    );
  }

  const totalCount = data.maleCount + data.femaleCount + data.multipurposeCount;

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-2" asChild>
          <Link href="/">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <h1 className="font-bold text-lg truncate">{data.name}</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* トイレ画像 */}
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imageUrl}
            alt={`${data.name}のトイレ`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 基本情報 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">ブランド</span>
            <span className="font-medium">{BRAND_LABEL[data.brand]}</span>
          </div>

          {data.address && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">住所</span>
              <span>{data.address}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">許可</span>
            <span>{data.requiresPermission ? "店員に声掛けが必要" : "自由に利用可"}</span>
          </div>
        </section>

        {/* トイレ個数 */}
        <section className="space-y-2">
          <h2 className="font-bold">トイレ個数（合計 {totalCount}）</h2>
          <div className="grid grid-cols-3 gap-3">
            <CountCard label="男性用" count={data.maleCount} icon={<ToiletMaleIcon className="size-5" />} />
            <CountCard label="女性用" count={data.femaleCount} icon={<ToiletFemaleIcon className="size-5" />} />
            <CountCard label="多目的" count={data.multipurposeCount} icon={<ToiletIcon className="size-5" />} />
          </div>
        </section>

        {/* 備考 */}
        {data.note && (
          <section className="space-y-2">
            <h2 className="font-bold">備考</h2>
            <p className="text-sm text-muted-foreground">{data.note}</p>
          </section>
        )}

        {/* 虚偽報告リンク */}
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/toilets/${id}/report`}>この情報を報告する</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

/** トイレ個数のカード */
function CountCard({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-3 text-center space-y-1">
      <div className="flex items-center justify-center text-muted-foreground">{icon}</div>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
