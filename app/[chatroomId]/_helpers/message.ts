import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/libs/firebase/firebase";

import type { Message } from "@/types/chatroom";

export const getRemoteChatroomMessages = async (
  chatroomId: string
): Promise<Message[]> => {
  try {
    const snapshot = await getDoc(doc(db, "chatrooms", chatroomId));
    const data = snapshot.data();
    return data?.messages || [];
  } catch (error) {
    console.error("Error getting chatroom messages:", error);
    return [];
  }
};

export const updateRemoteChatroomMessages = async (
  chatroomId: string,
  messages: Message[]
): Promise<void> => {
  try {
    await updateDoc(doc(db, "chatrooms", chatroomId), { messages });
  } catch (error) {
    console.error("Error updating chatroom messages:", error);
  }
};

export const updateLocalBotMessage = (
  messages: Message[],
  botMessageId: string,
  updates: Partial<Message>
): Message[] => {
  return messages.map((msg) => {
    if (msg.id === botMessageId) {
      return { ...msg, ...updates };
    }
    return msg;
  });
};
