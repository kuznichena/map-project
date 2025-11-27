// src/components/DocumentMapView.jsx
import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const IMAGE_BASE_URL = "https://dhm.uni-greifswald.de/pngMaps";

function DocumentMapView({ onSheetsSelected }) {
  const mapDiv = useRef(null);

  // Will store layerView to be able to highlight features
  const layerViewRef = useRef(null);
  // Will store current highlight handle so we can remove it on next click
  const highlightHandleRef = useRef(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    // 1) Create map with basemap
    const map = new Map({
      basemap: "osm",
    });

    // 2) Footprint layer (polygons with "signatur")
    const layer = new FeatureLayer({
      url: "https://ifzo-gis.geo.uni-greifswald.de/server/rest/services/Hosted/matrikelkarten_footprint_view/FeatureServer",
      outFields: ["*"],   // we need "signatur"
      popupEnabled: false // we handle UI in React
    });

    map.add(layer);

    // 3) Create the MapView
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [13.38, 54.09], // around Greifswald
      zoom: 11,
    });

    // 4) Save layerView for highlighting once it's ready
    view.whenLayerView(layer).then((layerView) => {
      layerViewRef.current = layerView;
    });

    // 5) Handle map clicks
    const handleClick = async (event) => {
      try {
        const hit = await view.hitTest(event);

        // Collect graphics belonging to our footprint layer
        const graphics = hit.results
          .filter((r) => r.graphic.layer === layer)
          .map((r) => r.graphic);

        // Clear selection & right panel if nothing clicked
        if (!graphics.length) {
          // remove previous highlight
          if (highlightHandleRef.current) {
            highlightHandleRef.current.remove();
            highlightHandleRef.current = null;
          }
          onSheetsSelected?.([]);
          return;
        }

        // --- HIGHLIGHT ON MAP (teal polygon like in Map Viewer) ---
        if (layerViewRef.current) {
          // remove previous highlight
          if (highlightHandleRef.current) {
            highlightHandleRef.current.remove();
          }
          // highlight all graphics under cursor
          highlightHandleRef.current = layerViewRef.current.highlight(
            graphics
          );
        }

        // Optionally zoom to the first footprint (comment out if you don't want this)
        const firstGeom = graphics[0].geometry;
        if (firstGeom) {
          view.goTo(firstGeom.extent.expand(1.2)).catch(() => {});
        }

        // --- Build data for React side panel ---
        const sheets = graphics.map((g) => {
          const attrs = g.attributes || {};
          const signature = attrs.signatur;

          const imageUrl = signature
            ? `${IMAGE_BASE_URL}/${signature}.png`
            : null;

          return {
            id: attrs.fid ?? attrs.OBJECTID ?? Math.random(),
            title: signature || "Unknown sheet",
            signature,
            imageUrl,
            attributes: attrs,
          };
        });

        onSheetsSelected?.(sheets);
      } catch (err) {
        console.error("Error during hitTest:", err);
      }
    };

    const clickHandle = view.on("click", handleClick);

    // 6) Cleanup on unmount
    return () => {
      clickHandle.remove();
      if (highlightHandleRef.current) {
        highlightHandleRef.current.remove();
      }
      view.destroy();
    };
  }, [onSheetsSelected]);

  return <div ref={mapDiv} className="w-full h-full rounded shadow" />;
}

export default DocumentMapView;
