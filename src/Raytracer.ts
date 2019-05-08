// /* tslint:disable: max-classes-per-file */

// class Vector {
//   public constructor(public x: number, public y: number, public z: number) { }

//   public static times(k: number, v: Vector) {
//     return new Vector(k * v.x, k * v.y, k * v.z);
//   }

//   public static minus(v1: Vector, v2: Vector) {
//     return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
//   }

//   public static plus(v1: Vector, v2: Vector) {
//     return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
//   }

//   public static dot(v1: Vector, v2: Vector) {
//     return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
//   }

//   public static mag(v: Vector) {
//     return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
//   }

//   public static norm(v: Vector) {
//     const mag = Vector.mag(v);
//     const div = (mag === 0) ? Infinity : 1.0 / mag;
//     return Vector.times(div, v);
//   }

//   public static cross(v1: Vector, v2: Vector) {
//     return new Vector(v1.y * v2.z - v1.z * v2.y,
//                       v1.z * v2.x - v1.x * v2.z,
//                       v1.x * v2.y - v1.y * v2.x);
//   }
// }

// class Color {
//   public static white = new Color(1.0, 1.0, 1.0);
//   public static grey = new Color(0.5, 0.5, 0.5);
//   public static black = new Color(0.0, 0.0, 0.0);
//   public static background = Color.black;
//   public static defaultColor = Color.black;

//   public constructor(public r: number, public g: number, public b: number) { }

//   public static scale(k: number, v: Color) {
//     return new Color(k * v.r, k * v.g, k * v.b);
//   }

//   public static plus(v1: Color, v2: Color) {
//     return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b);
//   }

//   public static times(v1: Color, v2: Color) {
//     return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b);
//   }


//   public static toDrawingColor({r, g, b}: Color) {
//     const legalize = (d: number) => d > 1 ? 1 : d;
//     return {
//       r: Math.floor(legalize(r) * 255),
//       g: Math.floor(legalize(g) * 255),
//       b: Math.floor(legalize(b) * 255),
//     };
//   }
// }

// class Camera {
//   public forward: Vector;
//   public right: Vector;
//   public up: Vector;

//   public constructor(public pos: Vector, lookAt: Vector) {
//     const down = new Vector(0.0, -1.0, 0.0);
//     this.forward = Vector.norm(Vector.minus(lookAt, this.pos));
//     this.right = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, down)));
//     this.up = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, this.right)));
//   }
// }

// interface IRay {
//   start: Vector;
//   dir: Vector;
// }

// interface IIntersection {
//   thing: IThing;
//   ray: IRay;
//   dist: number;
// }

// interface ISurface {
//   diffuse: (pos: Vector) => Color;
//   specular: (pos: Vector) => Color;
//   reflect: (pos: Vector) => number;
//   roughness: number;
// }

// interface IThing {
//   intersect: (ray: IRay) => IIntersection | null;
//   normal: (pos: Vector) => Vector;
//   surface: ISurface;
// }

// interface ILight {
//   pos: Vector;
//   color: Color;
// }

// interface IScene {
//   things: IThing[];
//   lights: ILight[];
//   camera: Camera;
// }

// class Sphere implements IThing {
//   public radius2: number;

//   public constructor(public center: Vector, radius: number, public surface: ISurface) {
//     this.radius2 = radius * radius;
//   }

//   public normal(pos: Vector): Vector {
//     return Vector.norm(Vector.minus(pos, this.center));
//   }

//   public intersect(ray: IRay) {
//     const eo = Vector.minus(this.center, ray.start);
//     const v = Vector.dot(eo, ray.dir);
//     let dist = 0;
//     if (v >= 0) {
//       const disc = this.radius2 - (Vector.dot(eo, eo) - v * v);
//       if (disc >= 0) { dist = v - Math.sqrt(disc); }
//     }
//     return dist === 0 ? null : { thing: this, ray, dist };
//   }
// }

// class Plane implements IThing {
//   public normal: (pos: Vector) => Vector;
//   public intersect: (ray: IRay) => IIntersection | null;
//   public surface: ISurface;

//   public constructor(norm: Vector, offset: number, surface: ISurface) {
//     this.normal = () => norm;
//     this.intersect = (ray: IRay) => {
//       const denom = Vector.dot(norm, ray.dir);
//       if (denom > 0) {
//         return null;
//       } else {
//         const dist = (Vector.dot(norm, ray.start) + offset) / (-denom);
//         return { thing: this, ray, dist };
//       }
//     };
//     this.surface = surface;
//   }
// }

// const surfaces: { [key: string]: ISurface } = {
//   shiny: {
//     diffuse: (pos: Vector) => Color.white,
//     specular: (pos: Vector) => Color.grey,
//     reflect: (pos: Vector) => 0.7,
//     roughness: 250,
//   },

//   checkerboard: {
//     diffuse: (pos: Vector) => ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) ?
//       Color.white : Color.black,
//     specular: (pos: Vector) => Color.white,
//     reflect: (pos: Vector) => ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) ? 0.1 : 0.7,
//     roughness: 150,
//   },
// };

// class RayTracer {
//   private MAX_DEPTH = 5;

//   public render(scene: IScene, ctx: CanvasRenderingContext2D, screenWidth: number, screenHeight: number) {
//     const getPoint = (x: number, y: number, camera: Camera) => {
//       const recenterX = (coordX: number) => (coordX - (screenWidth / 2.0)) / 2.0 / screenWidth;
//       const recenterY = (coordY: number) => -(coordY - (screenHeight / 2.0)) / 2.0 / screenHeight;
//       return Vector.norm(
//         Vector.plus(
//           camera.forward,
//           Vector.plus(
//             Vector.times(recenterX(x), camera.right),
//             Vector.times(recenterY(y), camera.up),
//           ),
//         ),
//       );
//     };
//     for (let y = 0; y < screenHeight; y++) {
//       for (let x = 0; x < screenWidth; x++) {
//         const color = this.traceRay({
//           start: scene.camera.pos,
//           dir: getPoint(x, y, scene.camera),
//         }, scene, 0);
//         const {r, g, b} = Color.toDrawingColor(color);
//         ctx.fillStyle = `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
//         ctx.fillRect(x, y, x + 1, y + 1);
//       }
//     }
//   }

//   private intersections(ray: IRay, scene: IScene) {
//     let closest = +Infinity;
//     let closestInter: IIntersection;
//     for (const thing of scene.things) {
//       const inter = thing.intersect(ray);
//       if (inter !== null && inter.dist < closest) {
//         closestInter = inter;
//         closest = inter.dist;
//       }
//     }
//     return closestInter;
//   }

//   private testRay(ray: IRay, scene: IScene) {
//     const isect = this.intersections(ray, scene);
//     return isect !== null ? isect.dist : undefined;
//   }

//   private traceRay(ray: IRay, scene: IScene, depth: number): Color {
//     const isect = this.intersections(ray, scene);
//     return isect === undefined ? Color.background : this.shade(isect, scene, depth);
//   }

//   private shade(isect: IIntersection, scene: IScene, depth: number) {
//     const d = isect.ray.dir;
//     const pos = Vector.plus(Vector.times(isect.dist, d), isect.ray.start);
//     const normal = isect.thing.normal(pos);
//     const reflectDir = Vector.minus(d, Vector.times(2, Vector.times(Vector.dot(normal, d), normal)));
//     const naturalColor = Color.plus(
//       Color.background,
//       this.getNaturalColor(isect.thing, pos, normal, reflectDir, scene),
//     );
//     const reflectedColor = (depth >= this.MAX_DEPTH) ?
//       Color.grey :
//       this.getReflectionColor(isect.thing, pos, normal, reflectDir, scene, depth);
//     return Color.plus(naturalColor, reflectedColor);
//   }

//   private getReflectionColor(thing: IThing, pos: Vector, normal: Vector, rd: Vector, scene: IScene, depth: number) {
//     return Color.scale(thing.surface.reflect(pos), this.traceRay({ start: pos, dir: rd }, scene, depth + 1));
//   }

//   private getNaturalColor(thing: IThing, pos: Vector, norm: Vector, rd: Vector, scene: IScene) {
//     const addLight = (col: Color, light: ILight) => {
//       const ldis = Vector.minus(light.pos, pos);
//       const livec = Vector.norm(ldis);
//       const neatIsect = this.testRay({ start: pos, dir: livec }, scene);
//       const isInShadow = (neatIsect === undefined) ? false : (neatIsect <= Vector.mag(ldis));
//       if (isInShadow) {
//         return col;
//       } else {
//         const illum = Vector.dot(livec, norm);
//         const lcolor = (illum > 0) ? Color.scale(illum, light.color)
//                                    : Color.defaultColor;
//         const specular = Vector.dot(livec, Vector.norm(rd));
//         const scolor = (specular > 0) ? Color.scale(Math.pow(specular, thing.surface.roughness), light.color)
//                                   : Color.defaultColor;
//         return Color.plus(col, Color.plus(Color.times(thing.surface.diffuse(pos), lcolor),
//                                           Color.times(thing.surface.specular(pos), scolor)));
//       }
//     };
//     return scene.lights.reduce(addLight, Color.defaultColor);
//   }
// }

// function defaultScene(): IScene {
//   return {
//     things: [
//       new Plane(new Vector(0.0, 1.0, 0.0), 0.0, surfaces.checkerboard),
//       new Sphere(new Vector(0.0, 1.0, -0.25), 1.0, surfaces.shiny),
//       new Sphere(new Vector(-1.0, 0.5, 1.5), 0.5, surfaces.shiny),
//     ],
//     lights: [
//       { pos: new Vector(-2.0, 2.5, 0.0), color: new Color(0.49, 0.07, 0.07) },
//       { pos: new Vector(1.5, 2.5, 1.5), color: new Color(0.07, 0.07, 0.49) },
//       { pos: new Vector(1.5, 2.5, -1.5), color: new Color(0.07, 0.49, 0.071) },
//       { pos: new Vector(0.0, 3.5, 0.0), color: new Color(0.21, 0.21, 0.35) },
//     ],
//     camera: new Camera(new Vector(3.0, 2.0, 4.0), new Vector(-1.0, 0.5, 0.0)),
//   };
// }

// function exec() {
//   const canv = document.createElement('canvas');
//   canv.width = 256;
//   canv.height = 256;
//   document.body.appendChild(canv);
//   const ctx = canv.getContext('2d');
//   if (ctx) {
//     const rayTracer = new RayTracer();
//     return rayTracer.render(defaultScene(), ctx, 256, 256);
//   }
// }

// exec();
