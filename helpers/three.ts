import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";

export const createCubeMesh = (): Mesh<BoxGeometry, MeshBasicMaterial[]> => {
  const geometry = new BoxGeometry(2, 2, 2);
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

  return new Mesh(geometry, materials);
};
