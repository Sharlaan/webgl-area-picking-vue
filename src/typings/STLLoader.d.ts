import { AnimationClip, Camera, LoadingManager, Scene } from 'three';

export interface STL {
  animations: AnimationClip[];
  scene: Scene;
  scenes: Scene[];
  cameras: Camera[];
  asset: object;
}

export default class STLLoader {
  constructor(manager?: LoadingManager);

  load(url: string, onLoad: (stl: STL) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : STLLoader;
  parse(data: ArrayBuffer, path: string, onLoad: (stl: STL) => void, onError?: (event: ErrorEvent) => void) : void;
}
