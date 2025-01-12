import { ACCESS_TOKEN } from "@/constants/common";

interface MapillaryResponse {
  id: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export async function getMapillaryImageLocation(
  imageId: string
): Promise<[number, number]> {
  try {
    const response = await fetch(
      `https://graph.mapillary.com/${imageId}?access_token=${ACCESS_TOKEN}&fields=id,geometry`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Mapillary data: ${response.statusText}`);
    }

    const data: MapillaryResponse = await response.json();
    // Mapillary returns coordinates as [longitude, latitude]
    // We'll return [latitude, longitude] to match our app's convention
    return [data.geometry.coordinates[1], data.geometry.coordinates[0]];
  } catch (error) {
    console.error("Error fetching Mapillary image location:", error);
    throw error;
  }
}
