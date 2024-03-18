import { LngLatAlt, geodeticToEnu } from "mapillary-js";

import { GeoPosition } from "@/type/geo";

export const geoToPosition = (
  geoPosition: GeoPosition,
  reference: LngLatAlt
): number[] => {
  const enuPosition = geodeticToEnu(
    geoPosition.lng,
    geoPosition.lat,
    geoPosition.alt,
    reference.lng,
    reference.lat,
    reference.alt
  );

  return enuPosition;
};
