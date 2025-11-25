import { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

export default function ArcGISMap() {
  const mapRef = useRef();

  useEffect(() => {
    let view;

    loadModules([
      "esri/Map",
      "esri/views/MapView"
    ], { css: true }).then(([ArcGISMap, MapView]) => {
      const map = new ArcGISMap({
        basemap: "topo-vector"
      });

      view = new MapView({
        container: mapRef.current,
        map: map,
        center: [13.3777, 54.0934],
        zoom: 13
      });

    });

    return () => {
      if (view) {
        view.destroy();
        view = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-[700px]" ref={mapRef}></div>
  );
}
