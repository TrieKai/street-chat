"use client";

import { useCallback, useEffect, useState } from "react";
import { Message as ChatMessage, User } from "@/type/chatroom";
import { auth, db } from "@/lib/firebase/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import MessageBubble from "./Message";

import { SendIcon } from "@/app/icons";

type Props = {
  chatroomId: string;
};

export default function ChatroomClient({ chatroomId }: Props) {
  const [chatroomName, setChatroomName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!newMessage.trim() || !userId) return;

      const message: ChatMessage = {
        user_id: userId,
        user_name: userName,
        text: newMessage,
        timestamp: Date.now(),
      };

      try {
        const chatroomRef = doc(collection(db, "chatrooms"), chatroomId);
        await updateDoc(chatroomRef, {
          messages: arrayUnion(message),
        });
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [chatroomId, newMessage, userId, userName]
  );

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Anonymous");
        setUserId(user.uid);
      }
    });

    const unsubscribeMessages = onSnapshot(
      doc(db, "chatrooms", chatroomId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setMessages(data.messages || []);
          setUsers(data.users || []);
          setChatroomName(data.name || "Chat Room");
        }
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, [chatroomId]);

  return (
    <main className="w-full h-screen flex flex-col">
      <header className="p-4 h-16 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-semibold">{chatroomName}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const userInfo = users.find(
            (user) => user.user_id === message.user_id
          );
          return (
            <MessageBubble
              key={index}
              isSelf={message.user_id === userId}
              userAvatarUrl={userInfo?.photo_url || ""}
              userName={message.user_name}
              text={message.text}
              time={message.timestamp}
            />
          );
        })}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-4 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Please enter your message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600 transition-colors"
          title="送出"
        >
          <SendIcon />
        </button>
      </form>
    </main>
  );
}
