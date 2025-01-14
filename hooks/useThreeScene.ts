import { useMemo, useCallback } from "react";
import { Raycaster, Scene, Vector2 } from "three";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Cube } from "@/model/threeRenderer";
import { createCubeMesh } from "@/helpers/three";
import { Chatroom } from "@/type/chatroom";

export const useThreeScene = () => {
  const scene = useMemo(() => new Scene(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const pointer = useMemo(() => new Vector2(), []);

  const createCubesFromChatroomList = useCallback(
    (
      chatroomList: QueryDocumentSnapshot<DocumentData, DocumentData>[]
    ): Cube[] => {
      return chatroomList.map((chatroom) => {
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
        } as Cube;
      });
    },
    []
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent, containerElement: HTMLElement): void => {
      const rect = containerElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [pointer]
  );

  return {
    scene,
    raycaster,
    pointer,
    createCubesFromChatroomList,
    handlePointerMove,
  };
};
