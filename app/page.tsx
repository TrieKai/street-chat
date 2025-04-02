"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import CreateChatroomModal from "@/app/components/CreateChatroomModal";
import LoginDialog from "@/app/components/LoginDialog";
import WarningModal from "@/app/components/WarningModal";
import { auth, provider } from "@/libs/firebase/firebase";
import { createChatroom } from "@/helpers/chatroom";
import { useViewer } from "@/hooks/useViewer";

const IMAGE_ID = "474314650500833"; // Ximending

export default function Home() {
  const router = useRouter();
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDistanceAlertOpen, setIsDistanceAlertOpen] = useState(false);
  const [pendingChatroomName, setPendingChatroomName] = useState<string>();
  const [showTutorial, setShowTutorial] = useState(true);

  const { viewer, pendingLocation, setPendingLocation, createChatroomCube } =
    useViewer({
      viewerContainer: viewerContainerRef.current,
      setIsDistanceAlertOpen,
      setIsModalOpen,
    });

  const handleCreateChatroom = useCallback(
    async (name: string): Promise<void> => {
      if (!pendingLocation || !viewer) {
        return;
      }

      try {
        let user = await new Promise<User | null>((resolve) => {
          onAuthStateChanged(auth, (user) => resolve(user));
        });

        if (!user) {
          setPendingChatroomName(name);
          setIsLoginModalOpen(true);
          return;
        }

        const chatroomId = await createChatroom(
          name,
          pendingLocation.lat,
          pendingLocation.lng,
          user
        );

        if (!chatroomId) {
          return;
        }

        createChatroomCube(chatroomId, name);
        setPendingLocation(null);
        setIsModalOpen(false);
        router.push(`/${chatroomId}`);
      } catch (error: unknown) {
        console.error("Error creating chatroom:", error);
      }
    },
    [pendingLocation, viewer, router, createChatroomCube, setPendingLocation]
  );

  const handleGoogleLogin = useCallback(async (): Promise<void> => {
    try {
      await signInWithPopup(auth, provider);
      if (pendingChatroomName) {
        await handleCreateChatroom(pendingChatroomName);
        setPendingChatroomName(undefined);
      }
    } catch (error: unknown) {
      console.error("Google login failed:", error);
    } finally {
      setIsLoginModalOpen(false);
    }
  }, [pendingChatroomName, handleCreateChatroom, setPendingChatroomName]);

  const handleAnonymousLogin = useCallback(async (): Promise<void> => {
    try {
      await signInAnonymously(auth);
      if (pendingChatroomName) {
        await handleCreateChatroom(pendingChatroomName);
        setPendingChatroomName(undefined);
      }
    } catch (error: unknown) {
      console.error("Anonymous login failed:", error);
    } finally {
      setIsLoginModalOpen(false);
    }
  }, [pendingChatroomName, handleCreateChatroom, setPendingChatroomName]);

  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    setPendingLocation(null);
  }, [setPendingLocation]);

  useEffect(() => {
    if (viewer) {
      void viewer
        .moveTo(IMAGE_ID)
        .catch((error: unknown) => console.error(error));
    }
  }, [viewer]);

  return (
    <main className="w-full h-full">
      <div className="relative w-full h-full">
        <div ref={viewerContainerRef} className="w-full h-full" />
        {showTutorial && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-10">
            <span>👇 點擊方塊進入聊天室，或點擊街景建立新聊天室</span>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-white/75 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <CreateChatroomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateChatroom}
      />
      <LoginDialog
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
        onGoogleLogin={handleGoogleLogin}
        onAnonymousLogin={handleAnonymousLogin}
      />
      <WarningModal
        isOpen={isDistanceAlertOpen}
        onClose={() => setIsDistanceAlertOpen(false)}
      />
    </main>
  );
}
