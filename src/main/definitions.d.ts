/// <reference path="./../shared/definitions.d.ts"/>

/*
  this is where you put things like interfaces,
  that should only be used by the main process.
 */
declare module 'thumbsupply' {
  export const generateThumbnail:(path:string, options:any) => Promise<any>
}
