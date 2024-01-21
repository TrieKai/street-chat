"use client";

import {
  ICustomRenderer,
  RenderPass,
  Viewer,
  ViewerOptions,
  geodeticToEnu,
} from "mapillary-js";
import { useEffect, useRef } from "react";
import {
  BoxGeometry,
  Camera,
  Mesh,
  MeshBasicMaterial,
  Scene,
  WebGLRenderer,
} from "three";

const makeCubeMesh = () => {
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

function geoToPosition(geoPosition, reference) {
  const enuPosition = geodeticToEnu(
    geoPosition.lng,
    geoPosition.lat,
    geoPosition.alt,
    reference.lng,
    reference.lat,
    reference.alt
  );
  return enuPosition;
}

class ThreeCubeRenderer implements ICustomRenderer {
  id: string;
  renderPass: RenderPass;

  constructor(cube) {
    this.id = "three-cube-renderer";
    this.renderPass = RenderPass.Opaque;
    this.cube = cube;
  }

  onAdd(viewer, reference, context) {
    const position = geoToPosition(this.cube.geoPosition, reference);
    this.cube.mesh.position.fromArray(position);

    const canvas = viewer.getCanvas();
    this.renderer = new WebGLRenderer({
      canvas,
      context,
    });
    this.renderer.autoClear = false;

    this.camera = new Camera();
    this.camera.matrixAutoUpdate = false;

    this.scene = new Scene();
    this.scene.add(this.cube.mesh);
  }
  onReference(viewer, reference) {
    const position = geoToPosition(this.cube.geoPosition, reference);
    this.cube.mesh.position.fromArray(position);
  }
  onRemove(_viewer, _context) {
    this.cube.mesh.geometry.dispose();
    this.cube.mesh.material.forEach((m) => m.dispose());
    this.renderer.dispose();
  }
  render(context, viewMatrix, projectionMatrix) {
    const { camera, scene, renderer } = this;
    camera.matrix.fromArray(viewMatrix).invert();
    camera.updateMatrixWorld(true);
    camera.projectionMatrix.fromArray(projectionMatrix);

    renderer.resetState();
    renderer.render(scene, camera);
  }
}

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageId = "3748064795322267";
    const options: ViewerOptions = {
      accessToken: process.env.MAPILLARY_ACCESS_TOKEN,
      component: { cover: false },
      container: mainRef.current ?? "",
    };
    const viewer = new Viewer(options);

    const cube = {
      geoPosition: {
        alt: 1,
        lat: -25.28268614514251,
        lng: -57.630922858385,
      },
      mesh: makeCubeMesh(),
      rotationSpeed: 1,
    };

    const cubeRenderer = new ThreeCubeRenderer(cube);
    viewer.addCustomRenderer(cubeRenderer);
    viewer.moveTo(imageId).catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <main className="w-full h-full">
      <div ref={mainRef} className="w-full h-full">
        Mapillary
      </div>
    </main>
  );
}
