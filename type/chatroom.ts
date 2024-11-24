import { GeoPoint } from "firebase/firestore";

export type Chatroom = {
  create_at: number;
  messages: Message[];
  name: string;
  position: GeoPoint;
  users: Users[];
};

export interface Message {
  user_id: string;
  user_name: string;
  text: string;
  timestamp: number;
}

export interface Users {
  user_id: string;
  user_name: string;
  photo_url: string;
  messaging_token: string;
}
