import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Viewer, ViewerImageEvent, ViewerOptions } from "mapillary-js";
import { Cube, ThreeCubeRenderer } from "@/model/threeRenderer";
import { ACCESS_TOKEN } from "@/constants/common";
import { useGetChatRoomList } from "./useChatRoom";
import { db } from "@/libs/firebase/firebase";
import { useThreeScene } from "./useThreeScene";
import { useCubeInteraction } from "./useCubeInteraction";
import { createCubeMesh } from "@/helpers/three";

interface UseViewerProps {
  viewerContainer: HTMLDivElement | null;
  setIsDistanceAlertOpen: (isOpen: boolean) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const useViewer = ({
  viewerContainer,
  setIsDistanceAlertOpen,
  setIsModalOpen,
}: UseViewerProps) => {
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const {
    scene,
    raycaster,
    pointer,
    createCubesFromChatroomList,
    handlePointerMove,
  } = useThreeScene();
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

  const [pendingLocation, setPendingLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const createChatroomCube = useCallback(
    (chatroomId: string, name: string): void => {
      if (!pendingLocation || !viewer) {
        return;
      }

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
      setPendingLocation(null);
    },
    [pendingLocation, pointer, raycaster, scene, viewer]
  );

  const { handleCubeMouseOver, handleCubeClick } = useCubeInteraction({
    scene,
    raycaster,
    viewer,
    setIsDistanceAlertOpen,
    setIsModalOpen,
    setPendingLocation,
    onChatroomSelect: (chatroomId) => router.push(`/${chatroomId}`),
  });

  useEffect(() => {
    if (!viewerContainer) {
      return;
    }

    const options: ViewerOptions = {
      accessToken: ACCESS_TOKEN,
      component: { cover: false },
      container: viewerContainer,
    };
    setViewer(new Viewer(options));
  }, [viewerContainer]);

  useEffect(() => {
    if (!viewerContainer) {
      return;
    }

    const handlePointerMoveEvent = (event: PointerEvent): void => {
      handlePointerMove(event, viewerContainer);
    };

    window.addEventListener("pointermove", handlePointerMoveEvent);
    return () => {
      window.removeEventListener("pointermove", handlePointerMoveEvent);
    };
  }, [handlePointerMove, viewerContainer]);

  useEffect(() => {
    if (!viewer) {
      return;
    }

    cubes.current = createCubesFromChatroomList(chatroomList);
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

    viewer.on("image", handleImage);
    viewer.on("mousemove", handleCubeMouseOver);
    viewer.on("click", handleCubeClick);

    return () => {
      viewer.removeCustomRenderer(cubeRenderer.id);
      viewer.off("image", handleImage);
      viewer.off("mousemove", handleCubeMouseOver);
      viewer.off("click", handleCubeClick);
    };
  }, [
    chatroomList,
    createCubesFromChatroomList,
    handleCubeClick,
    handleCubeMouseOver,
    pointer,
    raycaster,
    scene,
    viewer,
  ]);

  return { viewer, pendingLocation, setPendingLocation, createChatroomCube };
};
