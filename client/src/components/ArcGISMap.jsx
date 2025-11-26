// src/components/ArcGISMap.jsx
import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";

function ArcGISMap() {
  const mapDiv = useRef(null);

  useEffect(() => {
    if (!mapDiv.current) return;
    const map = new Map({
      basemap: "osm",
    });

    const dktkLayer = new MapImageLayer({
      url: "https://ifzo-gis.geo.uni-greifswald.de/server/rest/services/DKTK100/dktk100/MapServer",
      opacity: 0.9,         
    });

    map.add(dktkLayer);

    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [12.0, 56.1], 
      zoom: 9,
      constraints: {
        minZoom: 6,
        maxZoom: 15,
      },
    });

    dktkLayer.when(() => {
      console.log("DKTK layer loaded");
    }).catch((err) => {
      console.error("DKTK layer failed to load:", err);
    });

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div
      ref={mapDiv}
      className="w-full h-full rounded shadow"
    />
  );
}

export default ArcGISMap;
