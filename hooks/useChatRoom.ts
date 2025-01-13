import { useCallback, useEffect, useState } from "react";
import {
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  query,
  where,
  GeoPoint,
} from "firebase/firestore";

import { DB_COLLECTION_PATH, ONE_DAY } from "@/constants/common";
import { getDistanceFromLatLonInMeters } from "@/helpers/distance";

/**
 *  Hook to get the list of chatrooms near a given latitude and longitude.
 *
 * @param db The Firestore database instance.
 * @param latitude The latitude to search around. Optional.
 * @param longitude The longitude to search around. Optional.
 * @param radiusInMeters The search radius in meters. Default to 10.
 *
 * @returns An object with a single property `chatroomList` which is an array of
 *          QueryDocumentSnapshot objects.
 *
 * @remarks If latitude and longitude are not provided, the hook will return
 *          all chatrooms created within the last day.
 */
export const useGetChatRoomList = (
  db: Firestore,
  latitude?: number,
  longitude?: number,
  radiusInMeters: number = 10
): {
  chatroomList: QueryDocumentSnapshot<DocumentData>[];
} => {
  const [chatroomList, setChatroomList] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);

  const getChatRoomList = useCallback(async (): Promise<void> => {
    let q;

    if (latitude && longitude) {
      // use a larger search radius to ensure we don't miss edge cases
      const searchRadius = radiusInMeters * 1.5;
      const latDegrees = searchRadius / 111320; // approximate conversion
      const lngDegrees = latDegrees / Math.cos((latitude * Math.PI) / 180);

      const NE = new GeoPoint(latitude + latDegrees, longitude + lngDegrees);
      const SW = new GeoPoint(latitude - latDegrees, longitude - lngDegrees);

      q = query(
        collection(db, DB_COLLECTION_PATH),
        where("position", "<=", NE),
        where("position", ">=", SW)
      );

      const querySnapshot = await getDocs(q);

      // use Haversine formula to get distance between two points on a sphere
      const filteredDocs = querySnapshot.docs.filter((doc) => {
        const position = doc.data().position as GeoPoint;
        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          position.latitude,
          position.longitude
        );
        return distance <= radiusInMeters;
      });

      setChatroomList(filteredDocs);
    } else {
      q = query(
        collection(db, DB_COLLECTION_PATH),
        where("create_at", ">=", new Date().getTime() - ONE_DAY)
      );
      const querySnapshot = await getDocs(q);
      setChatroomList(querySnapshot.docs);
    }
  }, [db, latitude, longitude, radiusInMeters]);

  useEffect(() => {
    void getChatRoomList();
  }, [getChatRoomList]);

  return { chatroomList };
};
