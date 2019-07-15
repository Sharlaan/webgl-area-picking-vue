declare module 'detector-webgl';

// DeepReadOnly
export type DeepReadOnly<T> =
    T extends Function ? T :
    T extends ReadonlyArray<infer R> ? IDeepReadOnlyArray<R> :
    T extends Map<infer K, infer V> ? IDeepReadOnlyMap<K, V> :
    T extends object ? DeepReadOnlyObject<T> :
    T;

interface IDeepReadOnlyArray<T> extends ReadonlyArray<DeepReadOnly<T>> {}

interface IDeepReadOnlyMap<K, V> extends ReadonlyMap<DeepReadOnly<K>, DeepReadOnly<V>> {}

type DeepReadOnlyObject<T> = {
    readonly [P in keyof T]: DeepReadOnly<T[P]>;
}
