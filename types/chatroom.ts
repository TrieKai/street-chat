import { GeoPoint } from "firebase/firestore";

export type Chatroom = {
  create_at: number;
  messages: Message[];
  name: string;
  position: GeoPoint;
  users: Users[];
};

export interface Message {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: number;
  isThinking?: boolean;
  isGenerating?: boolean;
  isError?: boolean;
}

export interface User {
  messaging_token: string;
  photo_url: string;
  user_id: string;
  user_name: string;
}

export interface Users {
  user_id: string;
  user_name: string;
  photo_url: string;
  messaging_token: string;
}
