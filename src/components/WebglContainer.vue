<template>
  <section class="webgl-container">
    <vgl-renderer ref="renderer" antialias>
      <vgl-scene name="scene" ref="sceneRef">
        <!-- Model -->
        <vgl-geometry
          name="modelGeometry"
          :position-attribute="geometry.position"
          :normal-attribute="geometry.normal"
        />
        <vgl-mesh-phong-material
          name="modelMaterial"
          :color="commonProps.modelColor"
          shininess="200"
          specular="#111111"
        />
        <vgl-mesh
          ref="model"
          geometry="modelGeometry"
          material="modelMaterial"
          cast-shadow
          receive-shadow
          :position="modelPositionVector"
          :rotation="modelRotationVector"
        >
          <vgl-axes-helper size="1"></vgl-axes-helper
        ></vgl-mesh>

        <!-- Ground -->
        <vgl-plane-geometry
          name="groundGeometry"
          :width="groundSize"
          :height="groundSize"
        ></vgl-plane-geometry>
        <vgl-mesh-phong-material
          name="groundMaterial"
          color="#999999"
          specular="#101010"
        />
        <vgl-mesh
          ref="ground"
          geometry="groundGeometry"
          material="groundMaterial"
          receive-shadow
          position="0 -0.5 0"
          :rotation="`${groundRotX} 0 0`"
        >
          <vgl-grid-helper
            :rotation="`${groundRotX} 0 0`"
            :size="groundSize"
            :divisions="groundSize"
            :color-center-line="colorCenterLine"
            :color-grid="colorGrid"
          />
        </vgl-mesh>

        <vgl-hemisphere-light color="#443333" ground-color="#111122" />
        <vgl-directional-light position="1 1 1" cast-shadow />
        <vgl-axes-helper :size="groundSize/2" />
      </vgl-scene>

      <vgl-perspective-camera
        ref="cmr0"
        name="cmr0"
        fov="35"
        :zoom="commonProps.zoom"
        :orbit-target="modelPositionVector"
        :position="cameraPositionVector"
        :rotation="cameraRotationVector"
      />

      <orbit-controls camera="cmr0" @onCameraUpdate="cameraChangeHandler" />
      <!-- <pointer-lock-controls camera="cmr0" scene="scene" /> -->
    </vgl-renderer>
  </section>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  ArrowHelper,
  BufferGeometry,
  Camera,
  Color,
  Fog,
  Material,
  Math as ThreeMath,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Renderer,
  Scene,
  Texture,
  Vector2,
  Vector3,
} from 'three';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

import { CommonProps } from '../App.vue';
// tslint:disable
import OrbitControls from './OrbitControls.vue';
import AsyncComputed from "../typings/async-computed";

const { degToRad, radToDeg } = ThreeMath;

interface VglNamespace {
  beforeRender(): void,
  cameras?: { [name: string]: PerspectiveCamera },
  geometries?: { [name: string]: BufferGeometry },
  materials?: { [name: string]: Material },
  object3ds?: { [name: string]: Object3D },
  renderers?: object[],
  scenes?: { [name: string]: Scene },
  textures?: { [name: string]: Texture },
  update(): void
}

@Component({
  components: { OrbitControls },
})
export default class WebglContainer extends Vue {
  @Model() public commonProps!: CommonProps;
  @Prop() public readonly groundSize!: number;
  @Prop() public readonly stlModelURL!: string;

  private readonly groundRotX: number = -Math.PI / 2;
  private readonly fog: Fog = new Fog(0x72645b, 2, 15);
  private readonly background: Color = new Color(0x72645b);
  private namespace!: VglNamespace;
  private readonly raycaster = new Raycaster(); // Raycast (for interactions detection)

  public mounted() {
    this.namespace = this.$refs.renderer.vglNamespace;
    console.log({ namespace: this.namespace });

    this.setSceneProps();

    // DOM events listeners
    const canvaGL = this.namespace.renderers[0].inst.domElement;
    canvaGL.addEventListener("mousemove", this.onMouseMove, false);
    ["mousedown", "mouseup"].forEach(type =>
      canvaGL.addEventListener(type, this.onClick, false)
    );
  }

  // Computed
  public get colorCenterLine() {
    // return rgb2hex(cr, cg, cb);
    return '';
  }

  public get colorGrid() {
    // return rgb2hex(gr, gg, gb);
    return '';
  }

  public get modelPositionVector() {
    if (this.commonProps.modelPosition) {
      const { x, y, z } = this.commonProps.modelPosition;
      // return new Vector3(x, y, z);
      return `${x} ${y} ${z}`
    }
  }

  public get modelRotationVector() {
    if (this.commonProps.modelRotation) {
      const { x, y, z } = this.commonProps.modelRotation;
      return `${degToRad(x)} ${degToRad(y)} ${degToRad(z)}`;
    }
  }

  public get cameraPositionVector() {
    if (this.commonProps.cameraPosition) {
      const { x, y, z } = this.commonProps.cameraPosition;
      // return new Vector3(x, y, z);
      return `${x} ${y} ${z}`
    }
  }

  public get cameraRotationVector() {
    if (this.commonProps.cameraRotation) {
      const { x, y, z } = this.commonProps.cameraRotation;
      return `${degToRad(x)} ${degToRad(y)} ${degToRad(z)}`;
    }
  }

  // Methods
  public cameraChangeHandler({ position, rotation }: { [K: string]: Vector3 }) {
    const { cameraPosition, cameraRotation, zoom } = this.commonProps;
    cameraPosition.x = position.getComponent(0);
    cameraPosition.y = position.getComponent(1);
    cameraPosition.z = position.getComponent(2);
    cameraRotation.x = radToDeg(rotation.getComponent(0));
    cameraRotation.y = radToDeg(rotation.getComponent(1));
    cameraRotation.z = radToDeg(rotation.getComponent(2));
  }

  public getIntersection({ clientX, clientY, offsetX, offsetY, target }: MouseEvent) {
    const { top, left } = (target as HTMLCanvasElement).getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    // const x = offsetX; // offsetX/Y works but are experimental
    // const y = offsetY;
    // @ts-ignore
    const {
      clientHeight,
      clientWidth
    } = this.namespace.renderers[0].inst.domElement as HTMLCanvasElement;
    const mouseCoords = new Vector2();
    const mouseX = (x / clientWidth) * 2 - 1;
    const mouseY = -((y / clientHeight) * 2) + 1;
    mouseCoords.set(mouseX, mouseY);
    console.log({ mouseX, mouseY });
    // const cmr = this.namespace.cameras.cmr0;
    const cmr = this.$refs.cmr0.inst as Camera;
    this.raycaster.setFromCamera(mouseCoords, cmr);
    const { direction, origin } = this.raycaster.ray;
    const rayLength = origin.distanceTo(direction);
    const arrowHelper = new ArrowHelper(direction, origin, rayLength);
    arrowHelper.name = 'Ray Helper';
    this.namespace.scenes.scene.add(arrowHelper);
    // const Model = this.namespace.scenes.scene.getObjectByName("model"); // FIXME: does not work...
    // const model = this.$refs.model.inst as Object3D; // does NOT work ??!
    const model = this.$refs.model.inst as Object3D; // works !?
    console.log({ model, raycaster: this.raycaster.ray, rayLength: this.rayLength, rayDirection: this.rayDirection });
    return this.raycaster.intersectObject(model, true);
    // return this.raycaster.intersectObjects();
  }

  public onClick(event: MouseEvent) {
    event.preventDefault();
    if (event.type === 'mousedown' && !this.namespace.scenes.scene.getObjectByName("Ray Helper")) {
      const intersectionWithModel = this.getIntersection(event);
      console.log({ intersectionWithModel });
      if (intersectionWithModel) {
        // Prevents camera moving while mouse dragging
        // this.isControlsEnabled = !event.ctrlKey || event.type === "mouseup";
        // event.type === "mousedown"
        //   ? this.toggleSelections(event, intersectionWithModel.face)
        //   : this.validateSelections(); // @ mouseup
      } else {
      }
    }
  }

  public onMouseMove(event: MouseEvent) {
    event.preventDefault();
    // const targetPointer = this.scene.getObjectByName(
    //   "Target Pointer"
    // );
    // const intersectionWithModel = this.getIntersection(event);
    // // Add condition '&& event.ctrlKey' to show pointer and edges only whith Ctrl key down
    // // TODO: add a config option for that ?
    // if (intersectionWithModel) {
    //   console.log({ intersectionWithModel });
    //   this.showTargetPointer(
    //     targetPointer,
    //     intersectionWithModel.point,
    //     intersectionWithModel.face.normal
    //   );
    //   this.toggleSelections(
    //     event,
    //     intersectionWithModel.face,
    //     this.state.isSameFace
    //   );
    // } else {
    //   targetPointer && (targetPointer.visible = false);
    // }
  }

  public rgb2hex(r: string, g: string, b: string) {
    return `#${[r, g, b]
      .map((v) => parseInt(v, 10).toString(16))
      .map((v) => (v.length < 2 ? '0' + v : v))
      .join('')}`;
  }

  public setSceneProps() {
    console.log({ sceneRef: this.$refs.sceneRef }); // can access children
    // @ts-ignore
    this.$refs.sceneRef.inst.fog = this.fog;
    // @ts-ignore
    this.$refs.sceneRef.inst.background = this.background;
  }

  @AsyncComputed({
    default: { position: [], normal: [] },
  })
  public async geometry() {
    return new Promise((resolve, reject) => {
      const onLoad = (bufferGeometry: BufferGeometry) =>
        resolve({
          position: Array.from(bufferGeometry.attributes.position.array),
          normal: Array.from(bufferGeometry.attributes.normal.array),
        });
      const onProgress = ({ loaded, total }: ProgressEvent) =>
        // tslint:disable-next-line:no-console
        console.info('progress', ((loaded / total) * 100).toFixed(2) + '%');
      const onError = (error: ErrorEvent) => reject(error);
      new STLLoader().load(this.stlModelURL, onLoad, onProgress, onError);
    });
  }
}
</script>

<style lang="scss">
.webgl-container {
  width: calc(100% - 250px);

  & > div {
    height: 100%;
  }
}
</style>
