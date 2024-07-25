import { useEffect, useState } from "react";
import TileLayer from "ol/layer/Tile";
import OlMap from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";
import "ol/ol.css";
import "./styles.css";

import { MapFooter } from "@/components/Map/MapFooter";

export function Map() {
  const [map, setMap] = useState<OlMap | null>(null);
  const [center] = useState([-44.5550308, -18.512178]);
  const [zoom] = useState(7);

  useEffect(() => {
    const osm = new TileLayer({
      source: new OSM({ crossOrigin: "anonymous" }),
    });

    const view = new View({
      projection: "EPSG:4326",
      center: center,
      zoom: zoom,
    });

    const mapInstance = new OlMap({
      layers: [osm],
      view: view,
    });

    mapInstance.setTarget("map");
    setMap(mapInstance);
  }, [center, zoom]);

  return (
    <>
      <div id="map" className="w-screen h-screen overflow-hidden"></div>
      {map && <MapFooter map={map} />}
    </>
  );
}
