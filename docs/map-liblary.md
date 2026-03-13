# 地図まわりの技術メモ

## 技術スタック

| ライブラリ | 役割 | バージョン |
|-----------|------|-----------|
| MapLibre GL JS (`maplibre-gl`) | 地図レンダリングエンジン（WebGL） | 5.x |
| react-map-gl | MapLibre を React コンポーネントとして使うラッパー | 8.x |

## MapLibre GL JS とは

- **Mapbox GL JS** のオープンソース fork
- WebGL ベースでベクタータイルを描画 → スムーズなズーム・回転が可能
- Amazon Location Service の地図表示にも MapLibre が採用されている
- ライセンス: BSD-3-Clause（商用利用OK）

## react-map-gl とは

- Uber が開発した、Mapbox GL / MapLibre GL の React ラッパー
- `<Map>`, `<Marker>`, `<Popup>` 等のコンポーネントを提供
- `react-map-gl/maplibre` からインポートすると MapLibre 用になる

## 地図タイル（mapStyle）

地図の見た目は `mapStyle` prop で指定する。タイルプロバイダーによって変わる。

| 環境 | タイルプロバイダー | URL |
|------|-------------------|-----|
| 開発 | OpenFreeMap | `https://tiles.openfreemap.org/styles/liberty` |
| 本番 | Amazon Location Service | AWS 設定後に差し替え |

### デモタイルについて

`https://demotiles.maplibre.org/style.json` は MapLibre 公式のデモ用。
国境線程度のデータしかないため、日本のズーム14等では何も表示されない（肌色一面になる）。
開発用途には使えないので注意。

## 基本的な使い方

```tsx
import { Map, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";  // CSS の読み込みが必須

function App() {
  return (
    <Map
      initialViewState={{ latitude: 35.68, longitude: 139.76, zoom: 14 }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
    >
      <Marker longitude={139.76} latitude={35.68} anchor="bottom">
        <span>📍</span>
      </Marker>
    </Map>
  );
}
```

### ポイント

- `maplibre-gl/dist/maplibre-gl.css` を読み込まないと地図の UI コントロールが崩れる
- `initialViewState` は初期表示のみ。ユーザー操作後は内部で状態管理される
- `style` prop は CSS のサイズ指定。`height` を指定しないと地図が表示されない

## 今後やること

- Amazon Location Service のタイル URL に差し替え（AWS 設定後）
- トイレ位置のマーカー表示（`<Marker>` コンポーネント）
- 現在地取得（ブラウザの Geolocation API）
- ナビゲーション用ポリライン描画
