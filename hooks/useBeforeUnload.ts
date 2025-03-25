import { useEffect, useCallback } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/libs/firebase/firebase";
import type { Message } from "@/types/chatroom";

interface UseBeforeUnloadProps {
  chatroomId: string;
  messageId?: string;
  isGenerating: boolean;
}

export const useBeforeUnload = ({
  chatroomId,
  messageId,
  isGenerating,
}: UseBeforeUnloadProps) => {
  const handleUpdateMessageError = useCallback(async (): Promise<void> => {
    if (!messageId) {
      return;
    }

    try {
      const chatRef = doc(db, "chatrooms", chatroomId);
      const snapshot = await getDoc(chatRef);
      const data = snapshot.data();

      if (!data) {
        return;
      }

      const messages: Message[] = data.messages || [];
      const targetMessage = messages.find(
        (msg: Message) => msg.id === messageId
      );

      if (!targetMessage) {
        return;
      }

      // Remove old message and add updated message
      await updateDoc(chatRef, {
        messages: messages.map((msg: Message) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              isThinking: false,
              isGenerating: false,
              isError: true,
            };
          }
          return msg;
        }),
      });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  }, [chatroomId, messageId]);

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent): string | undefined => {
      if (!isGenerating) {
        return;
      }

      const message = "正在產生訊息中，確定要離開嗎？";
      event.preventDefault();
      return message;
    },
    [isGenerating]
  );

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const handleUnload = (): void => {
      void handleUpdateMessageError();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [isGenerating, handleBeforeUnload, handleUpdateMessageError]);

  return {
    handleUpdateMessageError,
  };
};
