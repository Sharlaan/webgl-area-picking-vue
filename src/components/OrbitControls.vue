<template></template>

<script lang="ts">
  import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
  import { Camera } from 'three';
  import { VglNamespace } from 'vue-gl';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

  @Component
  export default class OrbitControlsClass extends Vue {
    @Inject() public readonly vglNamespace!: typeof VglNamespace;

    @Prop() public readonly camera!: Camera;

    public get cmr() {
      // @ts-ignore
      return this.vglNamespace.cameras[this.camera];
    }

    @Watch('cmr', { immediate: true })
    public handler(cmr: Camera) {
      // @ts-ignore
      const threeContainer = this.vglNamespace.renderers[0].inst.domElement;
      const controls = new OrbitControls(cmr, threeContainer);
      // @ts-ignore
      controls.addEventListener('change', () => this.vglNamespace.update());
    }
  }
</script>
