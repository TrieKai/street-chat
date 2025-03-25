"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, Textarea } from "@headlessui/react";
import { ArrowDown, CircleStop, SendHorizontal } from "lucide-react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "@/libs/firebase/firebase";
import MessageBubble from "./Message";
import LoginDialog from "@/app/components/LoginDialog";
import ChatroomHeader from "./ChatroomHeader";
import { useWebLLM } from "@/hooks/useWebLLM";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import LLMSettingsDialog from "../../components/LLMSettingsDialog";
import { useLLMConfigStore } from "@/app/store/llmConfigStore";
import { createAssistantId, isAssistantId } from "@/helpers/common";

import type { Message, User } from "@/types/chatroom";
import type { RequestMessage } from "@/types/llm";

type Props = {
  chatroomId: string;
};

export default function Chatroom({ chatroomId }: Props) {
  const router = useRouter();
  const [chatroomName, setChatroomName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newUserMessage, setNewUserMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLLMGenerating, setIsLLMGenerating] = useState(false);
  const [llmGeneratingResponse, setLLMGeneratingResponse] = useState(""); // response of LLM while generating
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { webLLM, chat } = useWebLLM();
  const { llmConfig } = useLLMConfigStore();
  const { handleUpdateMessageError } = useBeforeUnload({
    chatroomId,
    messageId: messages.find((msg) => msg.isGenerating)?.id,
    isGenerating: isLLMGenerating,
  });

  const handleBack = useCallback((): void => {
    if (isLLMGenerating) {
      const confirmed = window.confirm("正在產生訊息中，確定要離開嗎？");
      if (confirmed) {
        void handleUpdateMessageError();
        router.push("/");
      }
      return;
    }
    router.push("/");
  }, [handleUpdateMessageError, isLLMGenerating, router]);

  const handleLogin = useCallback((): void => {
    void signInWithPopup(auth, provider)
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

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await auth.signOut();
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      if (!user) {
        setIsLoginModalOpen(true);
        return;
      }

      if (!newUserMessage.trim()) {
        return;
      }

      const timestamp = Date.now();
      const userMessage: Message = {
        id: crypto.randomUUID(),
        text: newUserMessage.trim(),
        timestamp,
        user_id: user.user_id,
        user_name: user.user_name,
      };

      try {
        // Add user message to Firestore
        await updateDoc(doc(db, "chatrooms", chatroomId), {
          messages: arrayUnion(userMessage),
          users: arrayUnion(user),
        });

        setNewUserMessage(""); // clear user input

        // Add empty bot message to Firestore
        const botMessageId = crypto.randomUUID();
        const emptyBotMessage: Message = {
          id: botMessageId,
          text: "",
          timestamp: Date.now(),
          user_id: createAssistantId(),
          user_name: llmConfig.model,
          isThinking: true,
          isGenerating: true,
        };
        await updateDoc(doc(db, "chatrooms", chatroomId), {
          messages: arrayUnion(emptyBotMessage),
        }).catch((error) => {
          console.error("Error saving LLM response:", error);
        });

        // Generate LLM response
        setIsLLMGenerating(true);
        const llmMessages: RequestMessage[] = messages.map((msg) => ({
          role: msg.user_id === user.user_id ? "user" : "assistant",
          content: msg.text,
          name: msg.user_name,
        }));

        // Add the new message
        llmMessages.push({
          role: "user",
          content: newUserMessage.trim(),
          name: user.user_name,
        });

        await chat({
          messages: llmMessages,
          onUpdate: async (message): Promise<void> => {
            setIsLLMGenerating(true);
            setLLMGeneratingResponse(message);

            // TODO: update bot message in Firestore
            const currentChatroomDataSnapshot = await getDoc(
              doc(db, "chatrooms", chatroomId)
            );
            const currentChatroomData = currentChatroomDataSnapshot.data();
            const currentMessages: Message[] =
              currentChatroomData?.messages || [];
            // Find the bot message and update it
            const finalMessages = currentMessages.map((msg) => {
              if (msg.id === botMessageId) {
                return {
                  ...msg,
                  text: message,
                  isThinking: false,
                };
              }
              return msg;
            });
            updateDoc(doc(db, "chatrooms", chatroomId), {
              messages: finalMessages,
            }).catch((error) => {
              console.error("Error updating document:", error);
            });
          },
          onFinish: async (message): Promise<void> => {
            const currentChatroomDataSnapshot = await getDoc(
              doc(db, "chatrooms", chatroomId)
            );
            const currentChatroomData = currentChatroomDataSnapshot.data();
            const currentMessages: Message[] =
              currentChatroomData?.messages || [];
            // Find the bot message and update it
            const updatedMessages = currentMessages.map((msg) => {
              if (msg.id === botMessageId) {
                return {
                  ...msg,
                  text: message,
                };
              }
              return msg;
            });

            const finalMessages = updatedMessages.map((msg) => {
              if (msg.id === botMessageId) {
                return {
                  ...msg,
                  text: message,
                  isGenerating: false,
                };
              }
              return msg;
            });

            await updateDoc(doc(db, "chatrooms", chatroomId), {
              messages: finalMessages,
            }).catch((error) => {
              console.error("Error updating document:", error);
            });

            setIsLLMGenerating(false);
            setLLMGeneratingResponse("");
          },
          onError: async (error): Promise<void> => {
            console.error("LLM Error:", error);
            const currentChatroomDataSnapshot = await getDoc(
              doc(db, "chatrooms", chatroomId)
            );
            const currentChatroomData = currentChatroomDataSnapshot.data();
            const currentMessages: Message[] =
              currentChatroomData?.messages || [];

            const errorMessages = currentMessages.map((msg) => {
              if (msg.id === botMessageId) {
                return {
                  ...msg,
                  isThinking: false,
                  isGenerating: false,
                  isError: true,
                };
              }
              return msg;
            });

            await updateDoc(doc(db, "chatrooms", chatroomId), {
              messages: errorMessages,
            }).catch((error) => {
              console.error("Error updating error status:", error);
            });

            setIsLLMGenerating(false);
            setLLMGeneratingResponse("");
          },
        });
      } catch (error) {
        console.error("Error sending message:", error);
        setIsLLMGenerating(false);
        setLLMGeneratingResponse("");
      }
    },
    [user, newUserMessage, chatroomId, messages, chat, llmConfig.model]
  );

  const handleStopGenerating = useCallback((): void => {
    setIsLLMGenerating(false);
    webLLM?.abort();
  }, [webLLM]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ChatroomHeader
        chatroomName={chatroomName}
        handleBack={handleBack}
        user={user}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleClickSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
        {messages.map((message) => {
          const userInfo = users.find(
            (user) => user.user_id === message.user_id
          );
          return (
            <MessageBubble
              key={message.id}
              type={isAssistantId(message.user_id) ? "assistant" : "user"}
              isSelf={message.user_id === user?.user_id}
              text={message.text || llmGeneratingResponse}
              userName={message.user_name}
              time={message.timestamp}
              userAvatarUrl={userInfo?.photo_url}
              isLoading={message.isThinking}
              isError={message.isError}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 bg-white text-primary hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all duration-200"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}

      <div className="flex gap-2 p-4 border-t border-gray-200">
        <Textarea
          value={newUserMessage}
          onChange={(e) => setNewUserMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {isLLMGenerating ? (
          <Button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <CircleStop onClick={handleStopGenerating} />
          </Button>
        ) : (
          <Button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SendHorizontal onClick={handleSendMessage} />
          </Button>
        )}
      </div>

      <LoginDialog
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
        handleLogin={handleLogin}
      />
      <LLMSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
