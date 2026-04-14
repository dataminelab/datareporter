declare const dummyObject: any;
declare module "has-own-prop" {
  const hasOwnProp: (obj: object, prop: string | symbol) => boolean;
  export = hasOwnProp;
}
