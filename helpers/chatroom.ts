import { addDoc, collection, GeoPoint } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { DB_COLLECTION_PATH } from "@/constants/common";
import { Chatroom } from "@/type/chatroom";
import { User } from "firebase/auth";

export const createChatroom = async (
  name: string,
  lat: number,
  lng: number,
  user: User
): Promise<string> => {
  const chatroom: Omit<Chatroom, "id"> = {
    position: new GeoPoint(lat, lng),
    create_at: Date.now(),
    messages: [],
    name,
    users: [
      {
        user_id: user.uid,
        user_name: user.displayName || "",
        photo_url: user.photoURL || "",
        messaging_token: "", // TODO: get FCM token
      },
    ],
  };

  const docRef = await addDoc(collection(db, DB_COLLECTION_PATH), chatroom);
  return docRef.id;
};
