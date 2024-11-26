import {
  Camera,
  Clock,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import {
  ICustomRenderer,
  IViewer,
  LngLatAlt,
  RenderPass,
  Viewer,
} from "mapillary-js";

import { geoToPosition } from "@/helpers/geo";

import { GeoPosition } from "@/type/geo";

export type Cube = {
  geoPosition: GeoPosition;
  mesh: Mesh;
  rotationSpeed: number;
  chatroomId: string;
};

export class ThreeCubeRenderer implements ICustomRenderer {
  id: string;
  renderPass: RenderPass;
  clock: Clock;
  viewer: Viewer | null;
  renderer: WebGLRenderer | null;
  scene: Scene;
  cubes: Cube[];
  raycaster: Raycaster;
  pointer: Vector2;
  camera: Camera;

  constructor(
    scene: Scene,
    cubes: Cube[],
    raycaster: Raycaster,
    pointer: Vector2
  ) {
    this.id = "three-cube-renderer";
    this.renderPass = RenderPass.Opaque;
    this.clock = new Clock();
    this.viewer = null;
    this.renderer = null;
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
  }

  onAdd(viewer: Viewer, reference: LngLatAlt, context: WebGL2RenderingContext) {
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
    const { cubes } = this;

    cubes.forEach((cube) => {
      const position = geoToPosition(cube.geoPosition, reference);
      cube.mesh.position.fromArray(position);
    });
  }
  onRemove(_viewer: IViewer, _context: WebGL2RenderingContext) {
    const { cubes, renderer } = this;

    cubes.forEach((cube) => {
      cube.mesh.geometry.dispose();
      if (Array.isArray(cube.mesh.material)) {
        cube.mesh.material.forEach((m) => m.dispose());
      }
    });
    renderer?.dispose();
  }
  render(
    _context: WebGL2RenderingContext,
    viewMatrix: number[],
    projectionMatrix: number[]
  ) {
    const {
      clock,
      cubes,
      raycaster,
      pointer,
      camera,
      renderer,
      scene,
      viewer,
    } = this;

    const delta = clock.getDelta();
    cubes.forEach((cube) => {
      const { rotationSpeed } = cube;
      cube.mesh.rotateZ(rotationSpeed * delta);
      cube.mesh.rotateY(0.7 * rotationSpeed * delta);
    });

    camera.matrix.fromArray(viewMatrix).invert();
    camera.updateMatrixWorld(true);
    camera.projectionMatrix.fromArray(projectionMatrix);

    raycaster.setFromCamera(pointer, camera);

    renderer?.resetState();
    renderer?.render(scene, camera);

    viewer?.triggerRerender();
  }
}
