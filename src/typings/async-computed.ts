import Vue from 'vue';
import VueAsyncComputed, { IAsyncComputedProperty } from 'vue-async-computed';
import { createDecorator, VueDecorator } from 'vue-class-component';

Vue.use(VueAsyncComputed);

export default function AsyncComputed<T>(computedOptions?: Omit<IAsyncComputedProperty<T>, 'get'>): VueDecorator {
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
