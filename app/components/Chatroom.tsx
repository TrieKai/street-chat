"use client";

import { useCallback, useEffect, useState, Fragment } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
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
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleBack = useCallback((): void => {
    router.push("/");
  }, [router]);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await auth.signOut();
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  const handleLogin = useCallback((): void => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser({
          user_id: result.user.uid,
          user_name: result.user.displayName || "",
          photo_url: result.user.photoURL || "",
          messaging_token: "", // TODO: get FCM token
        });
        setIsLoginModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
        setUser(null);
      });
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!user) {
        setIsLoginModalOpen(true);
        return;
      }
      if (!newMessage.trim()) return;

      const message: ChatMessage = {
        user_id: user.user_id,
        user_name: user.user_name,
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
    [chatroomId, newMessage, user]
  );

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          user_id: user.uid,
          user_name: user.displayName || "",
          photo_url: user.photoURL || "",
          messaging_token: "", // TODO: get FCM token
        });
      } else {
        setUser(null);
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
        <h1 className="text-xl font-semibold flex-1">{chatroomName}</h1>
        {user && (
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <span className="sr-only">打開用戶選單</span>
              <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-700">
                <Image
                  src={user.photo_url}
                  alt={user.user_name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            </MenuButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          focus ? "bg-gray-100" : ""
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                      >
                        登出
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        )}
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const userInfo = users.find(
            (user) => user.user_id === message.user_id
          );
          return (
            <MessageBubble
              key={index}
              isSelf={message.user_id === user?.user_id}
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
