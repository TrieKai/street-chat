import { useCallback, useEffect, useState } from "react";
import {
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { DB_COLLECTION_PATH, ONE_DAY } from "@/constants/common";

export const useGetChatRoomList = (
  db: Firestore
): {
  chatroomList: QueryDocumentSnapshot<DocumentData>[];
} => {
  const [chatroomList, setChatroomList] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);

  const getChatRoomList = useCallback(async (): Promise<void> => {
    // const NE = new GeoPoint(
    //   defaultPosition.lat + 0.001,
    //   defaultPosition.lng + 0.001
    // )

    // const SW = new GeoPoint(
    //   defaultPosition.lat - 0.001,
    //   defaultPosition.lng - 0.001
    // )

    // const q = query(
    //   collection(db, 'chatrooms'),
    //   where('position', '<=', NE),
    //   where('position', '>=', SW)
    // )
    const q = query(
      collection(db, DB_COLLECTION_PATH),
      where("create_at", ">=", new Date().getTime() - ONE_DAY)
    );
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot.docs);
    setChatroomList(querySnapshot.docs);
  }, [db]);

  useEffect(() => {
    getChatRoomList();
  }, [getChatRoomList]);

  return { chatroomList };
};
