<template>
  <div>
    <h1>
      Tests with Vue-GL
      <a href="https://vue-gl.github.io/vue-gl" target="_blank" rel="noopener">(docs)</a>
      <a href="https://github.com/vue-gl/vue-gl" target="_blank" rel="noopener">
        <img height="40" src="./assets/Octocat.jpg" alt="Link to Github repository">
      </a>
    </h1>

    <div class="webgl-app">
      <div class="color-picker" v-if="showColorPicker">
        <slider-picker :value="commonProps.modelColor" @input="updateModelColor"></slider-picker>
        <material-picker :value="commonProps.modelColor" @input="updateModelColor"></material-picker>
      </div>

      <controls-panel
        v-model="commonProps"
        :groundSize="groundSize"
        :showColorPicker="showColorPicker"
        @updateShowColorPicker="toggleShowColorPicker"
        @reset="reset"
      />

      <webgl-container
        v-model="commonProps"
        :groundSize="groundSize"
        :stlModelURL="stlModelURL"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Material, Slider } from 'vue-color';
import cloneDeep from 'lodash.clonedeep';

import ControlsPanel from './components/ControlsPanel.vue';
import WebglContainer from './components/WebglContainer.vue';

const stlModelURL = 'https://threejs.org/examples/models/stl/ascii/slotted_disk.stl';
const groundSize = 20; // Common property but static

// Common reactive properties
const initialState = Object.freeze({
  cameraPosition: Object.freeze({ x: -2, y: 1, z: 3 }),
  cameraRotation: Object.freeze({ x: 0, y: 0, z: 0 }),
  modelColor: '#409DBF',
  modelPosition: Object.freeze({ x: 0, y: 0, z: 0 }),
  modelRotation: Object.freeze({ x: 0, y: 0, z: 0 }),
  zoom: 1,
});
type Mutable<T> = { -readonly [P in keyof T]: Mutable<T[P]> };
export type CommonProps = Mutable<typeof initialState>;

interface IColors {
  hex: string;
  hsl: { [key in 'h' | 's' | 'l' | 'a']: number };
  hsv: { [key in 'h' | 's' | 'v' | 'a']: number };
  rgba: { [key in 'r' | 'g' | 'b' | 'a']: number };
  a: number;
}

@Component({
  components: {
    ControlsPanel,
    WebglContainer,
    'material-picker': Material,
    'slider-picker': Slider,
  },
})
export default class App extends Vue {
  private groundSize: number = groundSize;
  private showColorPicker: boolean = false;
  private stlModelURL: string = stlModelURL;
  private commonProps: CommonProps = cloneDeep(initialState);

  public reset() {
    this.commonProps = cloneDeep(initialState);
    console.log('RESETED !', {commonProps: this.commonProps, initialState});
  }

  public toggleShowColorPicker() {
    this.showColorPicker = !this.showColorPicker;
  }

  public updateModelColor(color: IColors) {
    this.commonProps.modelColor = color.hex;
  }
}
</script>

<style lang="scss">
html, body {
  font-family: Open Sans, Helvetica, Montserrat, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
  margin: 0 20px;
  min-height: 100%;
}

h1 {
  text-align: center;
}

.webgl-app {
  position: relative;
  margin-top: 60px;
  display: flex;
  height: 600px;

  .color-picker {
    position: absolute;
    left: calc(50% + 250px / 2);
    transform: translateX(-50%);
    padding: 20px;
    display: flex;
  }

  .vc-material {
    margin-left: 20px;
  }
}
</style>
