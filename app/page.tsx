"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Viewer, ViewerMouseEvent, ViewerOptions } from "mapillary-js";
import { Event, Object3D, Raycaster, Scene, Vector2 } from "three";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";

import { Cube, ThreeCubeRenderer } from "@/model/threeRenderer";
import { createCubeMesh } from "@/helpers/three";
import { useGetChatRoomList } from "@/hooks/useChatRoom";
import { auth, db, provider } from "@/lib/firebase/firebase";
import { createChatroom } from "@/helpers/chatroom";
import { useRouter } from "next/navigation";
import { Chatroom } from "@/type/chatroom";

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN;
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

  const { chatroomList } = useGetChatRoomList(db);

  useEffect(() => {
    const options: ViewerOptions = {
      accessToken: ACCESS_TOKEN,
      component: { cover: false },
      container: mainRef.current ?? "",
    };
    setViewer(new Viewer(options));
  }, []);

  useEffect(() => {
    const shouldRenderCubes = viewer && chatroomList.length > 0;
    if (shouldRenderCubes) {
      cubes.current = chatroomList.map((chatroom) => {
        const chatroomData = chatroom.data() as Chatroom;
        return {
          geoPosition: {
            alt: 1,
            lat: chatroomData.position.latitude,
            lng: chatroomData.position.longitude,
          },
          mesh: createCubeMesh(),
          rotationSpeed: 1,
        };
      });

      const cubeRenderer = new ThreeCubeRenderer(
        scene,
        cubes.current,
        raycaster,
        pointer
      );
      viewer.addCustomRenderer(cubeRenderer);

      void viewer.moveTo(IMAGE_ID).catch((error) => console.error(error));

      viewer.on("mousemove", (_event: ViewerMouseEvent) => {
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
          if (currentIntersect.current !== intersects[0].object) {
            if (currentIntersect.current) {
              currentIntersect.current.scale.set(1, 1, 1);
            }
            currentIntersect.current = intersects[0].object;
            currentIntersect.current.scale.set(1.5, 1.5, 1.5);
          }
        } else {
          if (currentIntersect.current) {
            currentIntersect.current.scale.set(1, 1, 1);
          }
          currentIntersect.current = null;
        }
      });
      viewer.on("click", async (event) => {
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
          console.log("click", intersects[0].object);
        } else {
          if (!event.lngLat) {
            return;
          }

          try {
            const user = await new Promise<User | null>((resolve) => {
              onAuthStateChanged(auth, (user) => resolve(user));
            });

            if (!user) {
              await signInWithPopup(auth, provider);
              return;
            }

            const chatroomId = await createChatroom(
              "test", // TODO: should be user input chatroom name
              event.lngLat.lat,
              event.lngLat.lng,
              user
            );

            viewer.removeCustomRenderer(cubeRenderer.id);
            cubes.current.push({
              geoPosition: {
                alt: 1,
                lat: event.lngLat.lat,
                lng: event.lngLat.lng,
              },
              mesh: createCubeMesh(),
              rotationSpeed: 1,
            });
            viewer.addCustomRenderer(cubeRenderer);

            // Redirect to chatroom page
            void router.push(`/${chatroomId}`);
          } catch (error) {
            console.error("Error creating chatroom:", error);
          }
        }
      });
    }

    return () => {
      if (shouldRenderCubes) {
        viewer.remove();
      }
    };
  }, [chatroomList, pointer, raycaster, router, scene, viewer]);

  const onPointerMove = useCallback(
    (event: PointerEvent): void => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },
    [pointer]
  );

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [onPointerMove]);

  return (
    <main className="w-full h-full">
      <div ref={mainRef} className="w-full h-full" />
    </main>
  );
}
