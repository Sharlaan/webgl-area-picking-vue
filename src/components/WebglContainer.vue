<template>
  <section class="webgl-container">
    <vgl-renderer ref="renderer" antialias>
      <vgl-scene name="scene" ref="sceneRef">
        <!-- Model -->
        <vgl-geometry
          name="modelGeometry"
          :position-attribute="geometry.position"
          :normal-attribute="geometry.normal"
        ></vgl-geometry>
        <vgl-mesh-phong-material
          name="modelMaterial"
          :color="commonProps.modelColor"
          shininess="200"
          specular="#111111"
        ></vgl-mesh-phong-material>
        <vgl-mesh
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
        ></vgl-mesh-phong-material>
        <vgl-mesh
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
          ></vgl-grid-helper>
        </vgl-mesh>

        <vgl-hemisphere-light color="#443333" ground-color="#111122"></vgl-hemisphere-light>
        <vgl-directional-light position="1 1 1" cast-shadow></vgl-directional-light>
        <vgl-axes-helper :size="groundSize/2"></vgl-axes-helper>
      </vgl-scene>

      <vgl-perspective-camera
        name="cmr0"
        fov="35"
        :zoom="commonProps.zoom"
        :orbit-target="modelPositionVector"
        :position="cameraPositionVector"
        :rotation="cameraRotationVector"
      ></vgl-perspective-camera>

      <orbit-controls camera="cmr0" @onCameraUpdate="cameraChangeHandler"></orbit-controls>
      <!-- <pointer-lock-controls camera="cmr0" scene="scene"></pointer-lock-controls> -->
    </vgl-renderer>
  </section>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import { BufferGeometry, Color, Fog, LoadingManager, Math as ThreeMath, Vector3 } from 'three';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

import { CommonProps } from '../App.vue';
// tslint:disable
import OrbitControls from './OrbitControls.vue';
import AsyncComputed from "../typings/async-computed";

@Component({
  components: {
    'orbit-controls': OrbitControls,
  },
})
export default class WebglContainer extends Vue {
  @Model() public commonProps!: CommonProps;
  @Prop() public readonly groundSize!: number;
  @Prop() public readonly stlModelURL!: string;

  private readonly groundRotX: number = -Math.PI / 2;
  private readonly fog: Fog = new Fog(0x72645b, 2, 15);
  private readonly background: Color = new Color(0x72645b);

  public mounted() {
    this.setSceneProps();
    // console.log({ 'this.webglContainer': this });
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
    return this.commonProps.modelPosition && new Vector3(
      this.commonProps.modelPosition.x,
      this.commonProps.modelPosition.y,
      this.commonProps.modelPosition.z
    );
  }

  public get modelRotationVector() {
    if (this.commonProps.modelRotation) {
      const { x, y, z } = this.commonProps.modelRotation;
      return `${ThreeMath.degToRad(x)} ${ThreeMath.degToRad(y)} ${ThreeMath.degToRad(z)}`;
    }
  }

  public get cameraPositionVector() {
    return this.commonProps.cameraPosition && new Vector3(
      this.commonProps.cameraPosition.x,
      this.commonProps.cameraPosition.y,
      this.commonProps.cameraPosition.z
    );
  }

  public get cameraRotationVector() {
    if (this.commonProps.cameraRotation) {
      const { x, y, z } = this.commonProps.cameraRotation;
      return `${ThreeMath.degToRad(x)} ${ThreeMath.degToRad(y)} ${ThreeMath.degToRad(z)}`;
    }
  }

  // Methods
  public setSceneProps() {
    console.log({ sceneRef: this.$refs.sceneRef }); // can access children
    // @ts-ignore
    this.$refs.sceneRef.inst.fog = this.fog;
    // @ts-ignore
    this.$refs.sceneRef.inst.background = this.background;
  }

  public rgb2hex(r: string, g: string, b: string) {
    return `#${[r, g, b]
      .map((v) => parseInt(v, 10).toString(16))
      .map((v) => (v.length < 2 ? '0' + v : v))
      .join('')}`;
  }

  public cameraChangeHandler({ position, rotation }: { [K: string]: Vector3 }) {
    this.commonProps.cameraPosition.x = position.getComponent(0);
    this.commonProps.cameraPosition.y = position.getComponent(1);
    this.commonProps.cameraPosition.z = position.getComponent(2);
    this.commonProps.cameraRotation.x = ThreeMath.radToDeg(rotation.getComponent(0));
    this.commonProps.cameraRotation.y = ThreeMath.radToDeg(rotation.getComponent(1));
    this.commonProps.cameraRotation.z = ThreeMath.radToDeg(rotation.getComponent(2));
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
