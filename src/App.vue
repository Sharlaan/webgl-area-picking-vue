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
      <controls-panel />
      <webgl-container />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import ControlsPanel from './components/ControlsPanel.vue';
import WebglContainer from './components/WebglContainer.vue';

@Component({
  components: {
    ControlsPanel,
    WebglContainer,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
.webgl-app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
  display: flex;
  height: 600px;
}

h1 {
  text-align: center;
}
</style>
