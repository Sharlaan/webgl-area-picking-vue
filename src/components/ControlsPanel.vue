<template>
  <aside class="control-panel">
    <section>
      <div class="section-title">
        <h3>Model</h3>
        <button type="button" @click="$emit('updateShowColorPicker')">
          {{ showColorPicker ? 'Hide' : 'Color Picker' }}
        </button>
      </div>

      <label>X
        <input
          type="range"
          v-model.number="commonProps.modelPosition.x"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Y
        <input
          type="range"
          v-model.number="commonProps.modelPosition.y"
          :min="0"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Z
        <input
          type="range"
          v-model.number="commonProps.modelPosition.z"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>RotX
        <input type="range" v-model.number="commonProps.modelRotation.x" min="-90" max="90" step="10"/>
      </label>
      <label>RotY
        <input type="range" v-model.number="commonProps.modelRotation.y" min="-90" max="90" step="10"/>
      </label>
      <label>RotZ
        <input type="range" v-model.number="commonProps.modelRotation.z" min="-90" max="90" step="10"/>
      </label>
    </section>

    <section>
      <div class="section-title">
        <h3>Camera</h3>
        <button type="button" @click="$emit('reset')">Reset</button>
      </div>
      <label>Zoom
        <input type="range" v-model.number="commonProps.zoom" min="0.1" max="5" step="0.25" />
      </label>
      <label>X
        <input
          type="range"
          v-model.number="commonProps.cameraPosition.x"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Y
        <input
          type="range"
          v-model.number="commonProps.cameraPosition.y"
          min="0"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Z
        <input
          type="range"
          v-model.number="commonProps.cameraPosition.z"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>RotX
        <input type="range" v-model.number="commonProps.cameraRotation.x" min="-180" max="180" step="10"/>
      </label>
      <label>RotY
        <input type="range" v-model.number="commonProps.cameraRotation.y" min="-180" max="180" step="10"/>
      </label>
      <label>RotZ
        <input type="range" v-model.number="commonProps.cameraRotation.z" min="-180" max="180" step="10"/>
      </label>
    </section>
  </aside>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue } from 'vue-property-decorator';

import { CommonProps } from '../App.vue';

@Component
export default class ControlsPanel extends Vue {
  @Model('change') public commonProps!: CommonProps;
  @Prop() public readonly groundSize!: number;
  @Prop() public reset!: () => void;
  @Prop() public showColorPicker!: boolean;
  @Prop() public updateShowColorPicker!: () => void;
}
</script>

<style lang="scss">
.control-panel {
  display: flex;
  flex-direction: column;
  background: darkslategrey;
  color: white;
  padding: 20px;
  height: calc(100% - 40px);
  overflow-y: scroll;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  h3 {
    margin: 0;
  }

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  label > input {
    margin-left: 20px;
  }

  label + label,
  section + section {
    margin-top: 20px;
  }
}


</style>
