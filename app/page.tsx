"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Viewer,
  ViewerImageEvent,
  ViewerMouseEvent,
  ViewerOptions,
} from "mapillary-js";
import { Event, Object3D, Raycaster, Scene, Sprite, Vector2 } from "three";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";

import { Cube, ThreeCubeRenderer } from "@/model/threeRenderer";
import { createCubeMesh } from "@/helpers/three";
import { useGetChatRoomList } from "@/hooks/useChatRoom";
import { auth, db, provider } from "@/lib/firebase/firebase";
import { createChatroom } from "@/helpers/chatroom";
import { useRouter } from "next/navigation";
import { Chatroom } from "@/type/chatroom";
import CreateChatroomModal from "@/app/components/CreateChatroomModal";
import WarningModal from "@/app/components/WarningModal";
import { getDistanceFromLatLonInMeters } from "@/helpers/distance";
import { ACCESS_TOKEN } from "@/constants/common";

const IMAGE_ID = "474314650500833"; // Ximending

export default function Home() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  const scene = useMemo(() => new Scene(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const pointer = useMemo(() => new Vector2(), []);
  const currentIntersect = useRef<Object3D<Event> | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const cubes = useRef<Cube[]>([]);

  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);
  const { chatroomList } = useGetChatRoomList(
    db,
    currentLocation?.[0],
    currentLocation?.[1],
    10
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistanceAlertOpen, setIsDistanceAlertOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const onPointerMove = useCallback(
    (event: PointerEvent): void => {
      if (!mainRef.current) return;

      // use the element's actual size and position, not the entire viewport
      const rect = mainRef.current.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [pointer]
  );

  const handleCreateChatroom = useCallback(
    async (name: string): Promise<void> => {
      if (!pendingLocation || !viewer) return;

      try {
        const user = await new Promise<User | null>((resolve) => {
          onAuthStateChanged(auth, (user) => resolve(user));
        });

        if (!user) {
          await signInWithPopup(auth, provider);
          // retry to create the chatroom after signing in
          const newUser = await new Promise<User | null>((resolve) => {
            onAuthStateChanged(auth, (user) => resolve(user));
          });
          if (!newUser) return;

          const chatroomId = await createChatroom(
            name,
            pendingLocation.lat,
            pendingLocation.lng,
            newUser
          );

          cubes.current.push({
            geoPosition: {
              alt: 1,
              lat: pendingLocation.lat,
              lng: pendingLocation.lng,
            },
            mesh: createCubeMesh(chatroomId),
            rotationSpeed: 1,
            chatroomId,
            name,
          });

          const newCubeRenderer = new ThreeCubeRenderer(
            scene,
            cubes.current,
            raycaster,
            pointer
          );
          viewer.addCustomRenderer(newCubeRenderer);

          setIsModalOpen(false);
          setPendingLocation(null);
          router.push(`/${chatroomId}`);
          return;
        }

        const chatroomId = await createChatroom(
          name,
          pendingLocation.lat,
          pendingLocation.lng,
          user
        );

        cubes.current.push({
          geoPosition: {
            alt: 1,
            lat: pendingLocation.lat,
            lng: pendingLocation.lng,
          },
          mesh: createCubeMesh(chatroomId),
          rotationSpeed: 1,
          chatroomId,
          name,
        });

        const newCubeRenderer = new ThreeCubeRenderer(
          scene,
          cubes.current,
          raycaster,
          pointer
        );
        viewer.addCustomRenderer(newCubeRenderer);

        setIsModalOpen(false);
        setPendingLocation(null);
        void router.push(`/${chatroomId}`);
      } catch (error) {
        console.error("Error creating chatroom:", error);
      }
    },
    [pendingLocation, pointer, raycaster, router, scene, viewer]
  );

  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    setPendingLocation(null);
  }, []);

  useEffect(() => {
    const options: ViewerOptions = {
      accessToken: ACCESS_TOKEN,
      component: { cover: false },
      container: mainRef.current ?? "",
    };
    setViewer(new Viewer(options));
  }, []);

  useEffect(() => {
    if (!viewer) {
      return;
    }

    cubes.current = chatroomList.map((chatroom) => {
      const chatroomData = chatroom.data() as Chatroom;
      return {
        geoPosition: {
          alt: 1,
          lat: chatroomData.position.latitude,
          lng: chatroomData.position.longitude,
        },
        mesh: createCubeMesh(chatroom.id),
        rotationSpeed: 1,
        chatroomId: chatroom.id,
        name: chatroomData.name,
      };
    });

    const cubeRenderer = new ThreeCubeRenderer(
      scene,
      cubes.current,
      raycaster,
      pointer
    );

    viewer.addCustomRenderer(cubeRenderer);

    const handleImage = (event: ViewerImageEvent): void => {
      setCurrentLocation([event.image.lngLat.lat, event.image.lngLat.lng]);
    };

    const handleMouseOver = (_event: ViewerMouseEvent): void => {
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        // only handle non-Sprite objects
        const meshIntersect = intersects.find(
          (intersect) => !(intersect.object instanceof Sprite)
        );

        if (
          meshIntersect &&
          currentIntersect.current !== meshIntersect.object
        ) {
          if (currentIntersect.current) {
            currentIntersect.current.scale.set(1, 1, 1);
          }
          currentIntersect.current = meshIntersect.object;
          currentIntersect.current.scale.set(1.2, 1.2, 1.2);
        }
      } else {
        if (currentIntersect.current) {
          currentIntersect.current.scale.set(1, 1, 1);
        }
        currentIntersect.current = null;
      }
    };

    const handleClick = async (event: ViewerMouseEvent): Promise<void> => {
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        void router.push(`/${intersects[0].object.userData.chatroomId}`);
      } else {
        if (!event.lngLat) {
          return;
        }

        // get the current view position
        const viewerPosition = await viewer.getPosition();
        if (!viewerPosition) {
          return;
        }

        // calculate the distance between the click position and the viewing angle
        const distance = getDistanceFromLatLonInMeters(
          viewerPosition.lat,
          viewerPosition.lng,
          event.lngLat.lat,
          event.lngLat.lng
        );

        if (distance > 10) {
          setIsDistanceAlertOpen(true);
          return;
        }

        setPendingLocation({
          lat: event.lngLat.lat,
          lng: event.lngLat.lng,
        });
        setIsModalOpen(true);
      }
    };

    viewer.on("image", handleImage);
    viewer.on("mousemove", handleMouseOver);
    viewer.on("click", handleClick);

    return () => {
      if (viewer) {
        viewer.removeCustomRenderer(cubeRenderer.id);
        viewer.off("image", handleImage);
        viewer.off("mousemove", handleMouseOver);
        viewer.off("click", handleClick);
      }
    };
  }, [chatroomList, pointer, raycaster, router, scene, viewer]);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [onPointerMove]);

  useEffect(() => {
    if (viewer) {
      void viewer.moveTo(IMAGE_ID).catch((error) => console.error(error));
    }
  }, [viewer]);

  return (
    <main className="w-full h-full">
      <div ref={mainRef} className="w-full h-full" />
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
