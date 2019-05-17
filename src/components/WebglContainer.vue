<template>
  <section class="webgl-container">
    <div class="color-picker" v-if="showColorPicker">
      <slider-picker :value="modelColor" @input="updateModelColor"></slider-picker>
      <material-picker :value="modelColor" @input="updateModelColor"></material-picker>
    </div>

    <vgl-renderer ref="renderer" antialias style="height: 100%">
      <vgl-scene name="scene">
        <!-- Model -->
        <vgl-geometry
          name="modelGeometry"
          :position-attribute="geometry.position"
          :normal-attribute="geometry.normal"
        ></vgl-geometry>
        <vgl-mesh-phong-material
          name="modelMaterial"
          :color="modelColor"
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
        :zoom="zoom"
        :orbit-target="modelPositionVector"
        :position="cameraPositionVector"
        :rotation="cameraRotationVector"
      ></vgl-perspective-camera>

      <orbit-controls camera="cmr0"></orbit-controls>
      <!-- <pointer-lock-controls camera="cmr0" scene="scene"></pointer-lock-controls> -->
    </vgl-renderer>
  </section>
</template>

<script lang="ts">
import VueAsyncComputed, { IAsyncComputedProperty } from 'vue-async-computed';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Material, Slider } from 'vue-color';
import { BufferGeometry, LoadingManager, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { createDecorator, VueDecorator } from 'vue-class-component';

import OrbitControls from './OrbitControls.vue';

Vue.use(VueAsyncComputed);

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

function AsyncComputed<T>(computedOptions?: Omit<IAsyncComputedProperty<T>, 'get'>): VueDecorator {
  return createDecorator((options, key) => {
    options.asyncComputed = options.asyncComputed || {};
    const method = options.methods![key];
    options.asyncComputed[key] = {
      get: method,
      ...computedOptions,
    } as IAsyncComputedProperty<T>;
    delete options.methods![key];
  });
}

interface IColors {
  hex: string;
  hsl: { [key in 'h' | 's' | 'l' | 'a']: number };
  hsv: { [key in 'h' | 's' | 'v' | 'a']: number };
  rgba: { [key in 'r' | 'g' | 'b' | 'a']: number };
  a: number;
}

function initialState() {
  return {
    modelPosition: { x: 0, y: 0, z: 0 },
    modelRotation: { x: 0, y: 0, z: 0 },
    cameraPosition: { x: -2, y: 1, z: 3 },
    cameraRotation: { x: 0, y: 0, z: 0 },
  };
}

@Component({
  components: {
    'orbit-controls': OrbitControls,
    'material-picker': Material,
    'slider-picker': Slider,
  },
})
export default class WebglContainer extends Vue {
  // public geometry: { position: number[]; normal: number[]; } = { position: [], normal: [] };
  public groundSize = 20;
  public groundRotX = -Math.PI / 2;
  public stlModelURL = 'https://threejs.org/examples/models/stl/ascii/slotted_disk.stl';
  public modelColor = '#409DBF';
  public showColorPicker = false;
  public zoom = 1;
  public modelPosition!: ReturnType<typeof initialState>['modelPosition'];
  public modelRotation!: ReturnType<typeof initialState>['modelRotation'];
  public cameraPosition!: ReturnType<typeof initialState>['cameraPosition'];
  public cameraRotation!: ReturnType<typeof initialState>['cameraRotation'];

  public mounted() {
    Object.assign(this, initialState());
    // this.loadModel();
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
    return this.modelPosition && new Vector3(
      this.modelPosition.x,
      this.modelPosition.y,
      this.modelPosition.z,
    );
  }

  public get modelRotationVector() {
    if (this.modelRotation) {
      const { x, y, z } = this.modelRotation;
      return `
        ${this.degrees2radians(x)}
        ${this.degrees2radians(y)}
        ${this.degrees2radians(z)}
      `;
    }
  }

  public get cameraPositionVector() {
    return this.cameraPosition && new Vector3(
      this.cameraPosition.x,
      this.cameraPosition.y,
      this.cameraPosition.z,
    );
  }

  public get cameraRotationVector() {
    if (this.cameraRotation) {
      const { x, y, z } = this.cameraRotation;
      return `
        ${this.degrees2radians(x)}
        ${this.degrees2radians(y)}
        ${this.degrees2radians(z)}
      `;
    }
  }

  // Methods
  public degrees2radians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  public rgb2hex(r: string, g: string, b: string) {
    return `#${[r, g, b]
      .map((v) => parseInt(v, 10).toString(16))
      .map((v) => (v.length < 2 ? '0' + v : v))
      .join('')}`;
  }

  public updateModelColor(color: IColors) {
    this.modelColor = color.hex;
  }

  public reset() {
    Object.assign(this, initialState());
  }

  // public loadModel() {
  //   const onLoad = (bufferGeometry: BufferGeometry) => {
  //     this.geometry = {
  //       position: Array.from(bufferGeometry.attributes.position.array),
  //       normal: Array.from(bufferGeometry.attributes.normal.array),
  //     };
  //     // hide loading component;
  //   };
  //   const onProgress = ({ loaded, total }: ProgressEvent) =>
  //     // show loading component;
  //     // tslint:disable-next-line:no-console
  //     console.info('progress', ((loaded / total) * 100).toFixed(2) + '%');
  //   const onError = (error: ErrorEvent) => console.error({ error });  // hide loading component;

  //   new STLLoader().load(this.stlModelURL, onLoad, onProgress, onError);
  // }

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

<style scoped lang="scss">
</style>
