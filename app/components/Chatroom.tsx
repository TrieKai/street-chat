"use client";

import { useCallback, useEffect, useState, Fragment } from "react";
import { Message as ChatMessage, User } from "@/type/chatroom";
import { auth, db, provider } from "@/lib/firebase/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useRouter } from "next/navigation";
import MessageBubble from "./Message";

import { ArrowIcon, SendIcon } from "@/app/icons";

type Props = {
  chatroomId: string;
};

export default function ChatroomClient({ chatroomId }: Props) {
  const router = useRouter();
  const [chatroomName, setChatroomName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleBack = useCallback((): void => {
    router.push("/");
  }, [router]);

  const handleLogin = useCallback((): void => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUserId(result.user.uid);
        setIsLoginModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
        setUserId("");
      });
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!userId) {
        setIsLoginModalOpen(true);
        return;
      }
      if (!newMessage.trim()) return;

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
      console.log("user", user);
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
      <header className="p-4 h-16 border-b border-gray-200 bg-white flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity scale-x-[-1]"
          onClick={handleBack}
          aria-label="返回"
        >
          <ArrowIcon />
        </button>
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
        className="p-4 border-t border-gray-200"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <SendIcon />
          </button>
        </div>
      </form>

      <Transition appear show={isLoginModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsLoginModalOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    需要登入
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      請先登入以發送訊息。點擊下方按鈕使用 Google 帳號登入。
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleLogin}
                    >
                      使用 Google 登入
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsLoginModalOpen(false)}
                    >
                      取消
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </main>
  );
}
