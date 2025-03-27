import { addDoc, collection, GeoPoint } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/libs/firebase/firebase";
import { createAssistantId } from "@/helpers/common";
import { DB_COLLECTION_PATH } from "@/constants/common";
import type { Chatroom } from "@/types/chatroom";

export const createChatroom = async (
  name: string,
  lat: number,
  lng: number,
  user: User
): Promise<string> => {
  const chatroom: Omit<Chatroom, "id"> = {
    position: new GeoPoint(lat, lng),
    create_at: Date.now(),
    messages: [
      {
        id: crypto.randomUUID(),
        user_id: createAssistantId(),
        user_name: "AI Assistant",
        text: "How can I help you today?",
        timestamp: Date.now(),
      },
    ],
    name,
    users: [
      {
        user_id: user.uid,
        user_name: user.isAnonymous
          ? `Anonymous_${user.uid.slice(0, 6)}`
          : user.displayName || "",
        photo_url: user.photoURL || "",
        messaging_token: "", // TODO: get FCM token
      },
    ],
  };

  const docRef = await addDoc(collection(db, DB_COLLECTION_PATH), chatroom);
  return docRef.id;
};
