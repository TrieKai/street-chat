"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";

import { auth, provider } from "@/lib/firebase/firebase";
import { createChatroom } from "@/helpers/chatroom";
import { useRouter } from "next/navigation";
import CreateChatroomModal from "@/app/components/CreateChatroomModal";
import WarningModal from "@/app/components/WarningModal";
import { useViewer } from "@/hooks/useViewer";

const IMAGE_ID = "474314650500833"; // Ximending

export default function Home() {
  const router = useRouter();
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistanceAlertOpen, setIsDistanceAlertOpen] = useState(false);

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
          await signInWithPopup(auth, provider);
          // retry to create the chatroom after signing in
          user = await new Promise<User | null>((resolve) => {
            onAuthStateChanged(auth, (user) => resolve(user));
          });

          if (!user) {
            return;
          }
        }

        const chatroomId = await createChatroom(
          name,
          pendingLocation.lat,
          pendingLocation.lng,
          user
        );

        createChatroomCube(chatroomId, name);
        setIsModalOpen(false);
        router.push(`/${chatroomId}`);
      } catch (error) {
        console.error("Error creating chatroom:", error);
      }
    },
    [createChatroomCube, pendingLocation, router, viewer]
  );

  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    setPendingLocation(null);
  }, [setPendingLocation]);

  useEffect(() => {
    if (viewer) {
      void viewer.moveTo(IMAGE_ID).catch((error) => console.error(error));
    }
  }, [viewer]);

  return (
    <main className="w-full h-full">
      <div ref={viewerContainerRef} className="w-full h-full" />
      <CreateChatroomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateChatroom}
      />
      <WarningModal
        isOpen={isDistanceAlertOpen}
        onClose={() => setIsDistanceAlertOpen(false)}
      />
    </main>
  );
}
