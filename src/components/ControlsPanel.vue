<template>
  <aside class="control-panel">
    <section>
      <div class="section-title">
        <h3>Model</h3>
        <button type="button" @click="showColorPicker = !showColorPicker">
          <span v-if="!showColorPicker">Color Picker</span>
          <span v-else>Hide</span>
        </button>
      </div>

      <label>X
        <input
          type="range"
          v-model="modelPosition.x"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Y
        <input
          type="range"
          v-model="modelPosition.y"
          :min="0"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Z
        <input
          type="range"
          v-model="modelPosition.z"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>RotX
        <input type="range" v-model="modelRotation.x" min="-90" max="90" step="10"/>
      </label>
      <label>RotY
        <input type="range" v-model="modelRotation.y" min="-90" max="90" step="10"/>
      </label>
      <label>RotZ
        <input type="range" v-model="modelRotation.z" min="-90" max="90" step="10"/>
      </label>
    </section>

    <section>
      <div class="section-title">
        <h3>Camera</h3>
        <button type="button" @click="reset">Reset</button>
      </div>
      <label>Zoom
        <input type="range" v-model="zoom" min="0.1" max="5" step="0.25" />
      </label>
      <label>X
        <input
          type="range"
          v-model="cameraPosition.x"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Y
        <input
          type="range"
          v-model="cameraPosition.y"
          min="0"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>Z
        <input
          type="range"
          v-model="cameraPosition.z"
          :min="-groundSize/2"
          :max="groundSize/2"
          step="0.25"
        />
      </label>
      <label>RotX
        <input type="range" v-model="cameraRotation.x" min="-180" max="180" step="10"/>
      </label>
      <label>RotY
        <input type="range" v-model="cameraRotation.y" min="-180" max="180" step="10"/>
      </label>
      <label>RotZ
        <input type="range" v-model="cameraRotation.z" min="-180" max="180" step="10"/>
      </label>
    </section>
  </aside>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ControlsPanel extends Vue {
  @Prop() private msg!: string;
}
</script>

<style scoped lang="scss">
</style>
