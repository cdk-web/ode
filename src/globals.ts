import { EventEmitter } from "eventemitter3";
import { fs as memfs } from "memfs";

export const fsEvents = new EventEmitter();
export const fs = new Proxy(memfs, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === "function") {
      return (...args: any[]) => {
        fsEvents.emit(prop as any, args);
        try {
          return value.apply(target, args);
        } catch (e) {
          if (
            typeof prop === "string" &&
            e.name === "TypeError" &&
            e.message === "callback must be a function"
          ) {
            const syncProp = `${prop}Sync`;
            if (
              Object.keys(target).includes(syncProp) &&
              typeof (target as any)[syncProp] === "function"
            ) {
              return Reflect.get(target, syncProp, receiver).apply(
                target,
                args
              );
            }
          }
          throw e;
        }
      };
    }
    return value;
  },
});

export const os = require("os-browserify/browser");
export const path = require("path-browserify");
export const util = require("util/");
export const process = require("process/browser");
process.getMaxListeners = () => {
  return 0;
};
process.chdir = function (dir: string) {
  const abspath = path.resolve(dir);
  process.cwd = () => {
    return abspath;
  };
};
process.listenerCount = function (sym: any) {
  return this.listeners ? this.listeners(sym).length : 0;
};
process.hrtime = require("browser-process-hrtime");

process.stderr = {
  write: (...args: any[]) => console.error("stderr", ...args),
};
process.stdout = {
  write: (...args: any[]) => console.log("stdout", ...args),
};

// @ts-ignore
globalThis.fs = fs;
const globals = {
  fs,
  fsEvents,
  os,
  path,
  util,
  process,
};
export default globals;

// @ts-ignore
if (typeof define === "function") {
  for (const [key, value] of Object.entries(globals)) {
    // @ts-ignore
    define(key, () => {
      return value;
    });
  }
}
