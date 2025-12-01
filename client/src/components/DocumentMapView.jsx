// src/components/DocumentMapView.jsx
import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const IMAGE_BASE_URL = "https://dhm.uni-greifswald.de/pngMaps";

function DocumentMapView({ onSheetsSelected, hoveredObjectId, activeObjectId }) {
  const mapDiv = useRef(null);

  const layerViewRef = useRef(null);
  const highlightHandleRef = useRef(null);
  // store last clicked graphics
  const selectedGraphicsRef = useRef([]);

  // helper: highlight specified graphics
  const setHighlightForGraphics = (graphics) => {
    if (!layerViewRef.current) return;

    if (highlightHandleRef.current) {
      highlightHandleRef.current.remove();
      highlightHandleRef.current = null;
    }

    if (graphics && graphics.length > 0) {
      highlightHandleRef.current = layerViewRef.current.highlight(graphics);
    }
  };

  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new Map({
      basemap: "osm",
    });

    const layer = new FeatureLayer({
      url: "https://ifzo-gis.geo.uni-greifswald.de/server/rest/services/Hosted/matrikelkarten_footprint_view/FeatureServer",
      outFields: ["*"],
      popupEnabled: false,
    });

    map.add(layer);

    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [13.38, 54.09],
      zoom: 11,
    });

    view.whenLayerView(layer).then((layerView) => {
      layerViewRef.current = layerView;
    });

    const handleClick = async (event) => {
      try {
        const hit = await view.hitTest(event);

        const graphics = hit.results
          .filter((r) => r.graphic.layer === layer)
          .map((r) => r.graphic);

        if (!graphics.length) {
          selectedGraphicsRef.current = [];
          setHighlightForGraphics([]);
          onSheetsSelected?.([]);
          return;
        }

        // save graphics for later hover/active logic
        selectedGraphicsRef.current = graphics;

        // highlight all selected
        setHighlightForGraphics(graphics);

        const firstGeom = graphics[0].geometry;
        if (firstGeom) {
          view.goTo(firstGeom.extent.expand(1.2)).catch(() => {});
        }

        const sheets = graphics.map((g) => {
          const attrs = g.attributes || {};
          const signature = attrs.signatur;

          // robust objectId detection (inдекс поля может отличаться)
          const objectId =
            attrs.OBJECTID ??
            attrs.objectid ??
            attrs.oid ??
            attrs.OID ??
            attrs.fid ??
            attrs.FID ??
            null;

          const imageUrl = signature
            ? `${IMAGE_BASE_URL}/${signature}.png`
            : null;

          return {
            id: objectId ?? Math.random(),
            title: signature || "Unknown sheet",
            signature,
            objectId,
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

    return () => {
      clickHandle.remove();
      if (highlightHandleRef.current) {
        highlightHandleRef.current.remove();
      }
      view.destroy();
    };
  }, []); // создаём карту только один раз

  // react to hovered/active card
  useEffect(() => {
    const graphics = selectedGraphicsRef.current;
    if (!graphics || graphics.length === 0) return;

    // pick which graphics to highlight:
    let toHighlight = graphics;

    if (hoveredObjectId != null) {
      const g = graphics.find(
        (gr) => (gr.attributes?.OBJECTID ?? gr.attributes?.fid) === hoveredObjectId
      );
      if (g) {
        toHighlight = [g];
      }
    } else if (activeObjectId != null) {
      const g = graphics.find(
        (gr) => (gr.attributes?.OBJECTID ?? gr.attributes?.fid) === activeObjectId
      );
      if (g) {
        toHighlight = [g];
      }
    }

    setHighlightForGraphics(toHighlight);
  }, [hoveredObjectId, activeObjectId]);

  return <div ref={mapDiv} className="w-full h-full rounded shadow" />;
}

export default DocumentMapView;
