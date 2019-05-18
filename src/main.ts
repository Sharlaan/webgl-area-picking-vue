import isWebglEnabled from 'detector-webgl';
import Vue from 'vue';
import * as VueGL from 'vue-gl';
// tslint:disable
import App from './App.vue';
import displayWebGLErrorMessage from './webglError';

Vue.config.productionTip = false;

!isWebglEnabled && displayWebGLErrorMessage();

// @ts-ignore
Object.keys(VueGL).forEach((name) => Vue.component(name, VueGL[name]));

new Vue({
  render: (h) => h(App),
}).$mount('#app');
