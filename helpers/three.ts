import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";

export const createCubeMesh = (
  chatroomId: string
): Mesh<BoxGeometry, MeshBasicMaterial[]> => {
  const geometry = new BoxGeometry(1, 1, 1);
  const materials = [
    new MeshBasicMaterial({
      color: 0xffff00,
    }),
    new MeshBasicMaterial({
      color: 0xff00ff,
    }),
    new MeshBasicMaterial({
      color: 0x00ff00,
    }),
    new MeshBasicMaterial({
      color: 0x0000ff,
    }),
    new MeshBasicMaterial({
      color: 0xffffff,
    }),
    new MeshBasicMaterial({
      color: 0xff0000,
    }),
  ];

  const mesh = new Mesh(geometry, materials);
  mesh.userData.chatroomId = chatroomId;
  return mesh;
};
