import { useCallback, useRef } from "react";
import { Sprite } from "three";
import { ViewerMouseEvent } from "mapillary-js";
import { getDistanceFromLatLonInMeters } from "@/helpers/distance";

import type { Object3D, Object3DEventMap, Raycaster, Scene } from "three";
import type { Viewer } from "mapillary-js";

interface UseCubeInteractionProps {
  scene: Scene;
  raycaster: Raycaster;
  viewer: Viewer | null;
  setIsDistanceAlertOpen: (isOpen: boolean) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setPendingLocation: (location: { lat: number; lng: number } | null) => void;
  onChatroomSelect: (chatroomId: string) => void;
}

export const useCubeInteraction = ({
  scene,
  raycaster,
  viewer,
  setIsDistanceAlertOpen,
  setIsModalOpen,
  setPendingLocation,
  onChatroomSelect,
}: UseCubeInteractionProps) => {
  const hoveredCube = useRef<Object3D<Object3DEventMap> | null>(null);

  const handleCubeMouseOver = useCallback(
    (_event: ViewerMouseEvent): void => {
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const meshIntersect = intersects.find(
          (intersect) => !(intersect.object instanceof Sprite)
        );

        if (meshIntersect && hoveredCube.current !== meshIntersect.object) {
          if (hoveredCube.current) {
            hoveredCube.current.scale.set(1, 1, 1);
          }
          hoveredCube.current = meshIntersect.object;
          hoveredCube.current.scale.set(1.2, 1.2, 1.2);
          const sceneElement = document.querySelector(
            ".mapillary-interactive"
          ) as HTMLElement;
          sceneElement.style.cursor = "pointer";
        }
      } else {
        if (hoveredCube.current) {
          hoveredCube.current.scale.set(1, 1, 1);
        }
        hoveredCube.current = null;
        const sceneElement = document.querySelector(
          ".mapillary-interactive"
        ) as HTMLElement;
        sceneElement.style.cursor = "";
      }
    },
    [raycaster, scene.children]
  );

  const handleCubeClick = useCallback(
    async (event: ViewerMouseEvent): Promise<void> => {
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        onChatroomSelect(intersects[0].object.userData.chatroomId);
      } else if (event.lngLat && viewer) {
        const viewerPosition = await viewer.getPosition();
        if (!viewerPosition) {
          return;
        }

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
    },
    [
      raycaster,
      scene.children,
      viewer,
      onChatroomSelect,
      setIsDistanceAlertOpen,
      setIsModalOpen,
      setPendingLocation,
    ]
  );

  return {
    handleCubeMouseOver,
    handleCubeClick,
  };
};
