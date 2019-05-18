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
    @Prop() public onCameraUpdate!: () => void;

    public get cmr() {
      // @ts-ignore
      return this.vglNamespace.cameras[this.camera];
    }

    @Watch('cmr', { immediate: true })
    public onCameraChanged(cmr: Camera) {
      // @ts-ignore
      const threeContainer = this.vglNamespace.renderers[0].inst.domElement;
      const controls = new OrbitControls(cmr, threeContainer);
      // @ts-ignore
      controls.addEventListener('change', () => {
        const cmrPos = {
          position: cmr.position,
          rotation: cmr.rotation.toVector3(),
        };
        this.$emit('onCameraUpdate', cmrPos);
        // @ts-ignore
        this.vglNamespace.update();
      });
    }
  }
</script>
