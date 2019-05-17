import isWebglEnabled from 'detector-webgl';
import Vue from 'vue';
import * as VueGL from 'vue-gl';
import App from './App.vue';
import displayWebGLErrorMessage from './webglError';

Vue.config.productionTip = false;

!isWebglEnabled && displayWebGLErrorMessage();

Object.keys(VueGL).forEach((name) => {
  // @ts-ignore
  Vue.component(name, VueGL[name]);
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
