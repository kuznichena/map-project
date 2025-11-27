// src/components/ArcGISMap.jsx
import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

function ArcGISMap() {
  const mapDiv = useRef(null);

  // Legend items that we will render outside the map
  const [legendItems, setLegendItems] = useState([]);

  useEffect(() => {
    if (!mapDiv.current) return;

    // 1) Create map with basemap
    const map = new Map({
      basemap: "osm",
    });

    // 2) Feature layer
    const layer = new FeatureLayer({
      url: "https://ifzo-gis.geo.uni-greifswald.de/server/rest/services/Hosted/landnutzung1702_1705_view/FeatureServer",
      opacity: 0.9,
      outFields: ["*"],
    });

    map.add(layer);

    // 3) Create view centered on Greifswald
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [13.38, 54.09], // Greifswald (lon, lat)
      zoom: 12,
      constraints: {
        minZoom: 4,
        maxZoom: 18,
      },
    });

    // 4) When layer is loaded, build our custom legend data from its renderer
    layer
      .when(() => {
        const renderer = layer.renderer;
        const items = [];

        // Unique value renderer
        if (renderer && renderer.type === "unique-value") {
          renderer.uniqueValueInfos.forEach((info) => {
            const symbol = info.symbol;
            const color = symbol?.color;

            let cssColor = "#cccccc";
            if (color) {
              const r = color.r ?? 200;
              const g = color.g ?? 200;
              const b = color.b ?? 200;
              const a = "a" in color ? color.a : 1;
              cssColor = `rgba(${r}, ${g}, ${b}, ${a})`;
            }

            items.push({
              label: info.label || info.value || "Unknown",
              color: cssColor,
            });
          });
        }

        // Simple renderer as a fallback
        else if (renderer && renderer.type === "simple") {
          const symbol = renderer.symbol;
          const color = symbol?.color;
          let cssColor = "#cccccc";

          if (color) {
            const r = color.r ?? 200;
            const g = color.g ?? 200;
            const b = color.b ?? 200;
            const a = "a" in color ? color.a : 1;
            cssColor = `rgba(${r}, ${g}, ${b}, ${a})`;
          }

          items.push({
            label: layer.title || "Layer",
            color: cssColor,
          });
        }

        setLegendItems(items);
      })
      .catch((err) => {
        console.error("FeatureLayer failed to load:", err);
      });

    // 5) Cleanup
    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div className="w-full h-full rounded shadow flex flex-col">
      {/* Map container */}
      <div ref={mapDiv} className="flex-1" />

      {/* Custom legend outside the map UI */}
      <div className="mt-4 bg-white rounded border p-3 max-h-56 overflow-auto text-sm">
        <h3 className="font-semibold mb-2">Legend</h3>
        {legendItems.length === 0 && (
          <p className="text-gray-500">Legend is loading…</p>
        )}
        <ul className="space-y-1">
          {legendItems.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-sm border"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ArcGISMap;
