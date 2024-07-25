import { useEffect, useState } from "react";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import OlMap from "ol/Map";

interface FooterProps {
  map: OlMap;
}

export function MapFooter({ map }: FooterProps) {
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(
    null
  );

  useEffect(() => {
    const mousePos = new MousePosition({
      coordinateFormat: createStringXY(5),
      projection: "EPSG:4326",
      className: "mouse-position",
    });

    setMousePosition(mousePos);
  }, []);

  useEffect(() => {
    if (mousePosition) {
      mousePosition.setTarget("mouse-position-coordinates");
      map.addControl(mousePosition);
    }
  }, [mousePosition, map]);

  return (
    <footer className="w-screen h-8 bg-white absolute bottom-0 flex flex-row items-center justify-end shadow-md">
      <div
        id="mouse-position-coordinates"
        className="w-64 h-6 text-center pt-1 align-middle bg-gray-200 shadow-inner"
      />
      <label className="pl-2 pr-1">EPSG: 4326</label>
    </footer>
  );
}
