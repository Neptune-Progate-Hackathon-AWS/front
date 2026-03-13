"use client";

import { Map as MapGL } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const INITIAL_VIEW = {
  latitude: 35.6812,
  longitude: 139.7671,
  zoom: 14,
} as const;

export function Map() {
  return (
    <MapGL
      initialViewState={INITIAL_VIEW}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
    />
  );
}
