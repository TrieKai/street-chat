"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ICustomRenderer,
  IViewer,
  LngLatAlt,
  RenderPass,
  Viewer,
  ViewerOptions,
  geodeticToEnu,
} from "mapillary-js";
import {
  BoxGeometry,
  Camera,
  Clock,
  Event,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
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

function geoToPosition(geoPosition, reference: LngLatAlt) {
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

type Cube = {
  geoPosition: {
    alt: number;
    lat: number;
    lng: number;
  };
  mesh: Mesh;
  rotationSpeed: number;
};

class ThreeCubeRenderer implements ICustomRenderer {
  id: string;
  renderPass: RenderPass;
  clock: Clock;
  viewer: Viewer;
  renderer: WebGLRenderer;
  scene: Scene;
  cubes: Cube[];
  raycaster: Raycaster;
  pointer: Vector2;
  camera: Camera;
  isScaled: boolean;

  constructor(
    scene: Scene,
    cubes: Cube[],
    raycaster: Raycaster,
    pointer: Vector2
  ) {
    this.id = "three-cube-renderer";
    this.renderPass = RenderPass.Opaque;
    this.clock = new Clock();
    this.scene = scene;
    this.cubes = cubes;
    this.raycaster = raycaster;
    this.pointer = pointer;
    this.camera = new PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.isScaled = false;
  }

  onAdd(viewer: Viewer, reference: LngLatAlt, context) {
    this.viewer = viewer;

    this.cubes.forEach((cube) => {
      const position = geoToPosition(cube.geoPosition, reference);
      cube.mesh.position.fromArray(position);
      this.scene.add(cube.mesh);
    });

    const canvas = viewer.getCanvas();
    this.renderer = new WebGLRenderer({
      canvas,
      context,
    });
    this.renderer.autoClear = false;

    this.camera.matrixAutoUpdate = false;
  }
  onReference(_viewer: IViewer, reference: LngLatAlt) {
    this.cubes.forEach((cube) => {
      const position = geoToPosition(cube.geoPosition, reference);
      cube.mesh.position.fromArray(position);
    });
  }
  onRemove(_viewer: IViewer, _context) {
    this.cubes.forEach((cube) => {
      cube.mesh.geometry.dispose();
      if (Array.isArray(cube.mesh.material)) {
        cube.mesh.material.forEach((m) => m.dispose());
      }
    });
    this.renderer.dispose();
  }
  render(_context, viewMatrix: number[], projectionMatrix: number[]) {
    const { camera, clock, scene, cubes, renderer, viewer } = this;

    const delta = clock.getDelta();
    cubes.forEach((cube) => {
      const { rotationSpeed } = cube;
      cube.mesh.rotateZ(rotationSpeed * delta);
      cube.mesh.rotateY(0.7 * rotationSpeed * delta);
    });

    camera.matrix.fromArray(viewMatrix).invert();
    camera.updateMatrixWorld(true);
    camera.projectionMatrix.fromArray(projectionMatrix);

    this.raycaster.setFromCamera(this.pointer, camera);

    renderer.resetState();
    renderer.render(scene, camera);

    viewer.triggerRerender();
  }
}

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);

  const scene = useMemo(() => new Scene(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const pointer = useMemo(() => new Vector2(), []);
  const currentIntersect = useRef<Object3D<Event> | null>(null);

  useEffect(() => {
    const imageId = "758855944800782";
    const options: ViewerOptions = {
      accessToken: process.env.MAPILLARY_ACCESS_TOKEN,
      component: { cover: false },
      container: mainRef.current ?? "",
    };
    const viewer = new Viewer(options);

    const cubes: Cube[] = [
      {
        geoPosition: {
          alt: 1,
          lat: 25.043135,
          lng: 121.515098,
        },
        mesh: makeCubeMesh(),
        rotationSpeed: 1,
      },
      {
        geoPosition: {
          alt: 1,
          lat: 25.043265,
          lng: 121.515112,
        },
        mesh: makeCubeMesh(),
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

    return () => {
      viewer.removeCustomRenderer(cubeRenderer.id);
    };
  }, [pointer, raycaster, scene]);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

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
    },
    [pointer, raycaster, scene.children]
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
