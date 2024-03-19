"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Viewer, ViewerMouseEvent, ViewerOptions } from "mapillary-js";
import { Event, Object3D, Raycaster, Scene, Vector2 } from "three";

import { Cube, ThreeCubeRenderer } from "@/model/threeRenderer";
import { createCubeMesh } from "@/helpers/three";
import { useGetChatRoomList } from "@/hooks/useChatRoom";
import { db } from "@/lib/firebase/firebase";

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);

  const scene = useMemo(() => new Scene(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const pointer = useMemo(() => new Vector2(), []);
  const currentIntersect = useRef<Object3D<Event> | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);

  const imageId = "474314650500833";

  const { chatroomList } = useGetChatRoomList(db);

  useEffect(() => {
    const options: ViewerOptions = {
      accessToken: process.env.MAPILLARY_ACCESS_TOKEN,
      component: { cover: false },
      container: mainRef.current ?? "",
    };
    setViewer(new Viewer(options));
  }, []);

  useEffect(() => {
    if (viewer) {
      const cubes: Cube[] = [
        {
          geoPosition: {
            alt: 1,
            lat: 25.042838,
            lng: 121.507388,
          },
          mesh: createCubeMesh(),
          rotationSpeed: 1,
        },
      ];
      const cubeRenderer = new ThreeCubeRenderer(
        scene,
        cubes,
        raycaster,
        pointer
      );
      viewer.addCustomRenderer(cubeRenderer);

      viewer.moveTo(imageId).catch((error) => console.error(error));

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
      viewer.on("click", (event) => {
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
          console.log("click", intersects[0].object);
        } else {
          if (!event.lngLat) {
            return;
          }

          viewer.removeCustomRenderer(cubeRenderer.id);
          cubes.push({
            geoPosition: {
              alt: 1,
              lat: event.lngLat.lat,
              lng: event.lngLat.lng,
            },
            mesh: createCubeMesh(),
            rotationSpeed: 1,
          });
          viewer.addCustomRenderer(cubeRenderer);
        }
      });
    }

    return () => {
      if (viewer) {
        viewer.remove();
      }
    };
  }, [pointer, raycaster, scene, viewer]);

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
