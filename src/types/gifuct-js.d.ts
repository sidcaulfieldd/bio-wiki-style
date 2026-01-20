// Minimal type shim for gifuct-js (the library ships JS only in some versions)
declare module "gifuct-js" {
  export function parseGIF(data: ArrayBuffer): any;
  export function decompressFrames(gif: any, buildImagePatches: boolean): any[];
}
