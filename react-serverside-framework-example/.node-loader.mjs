// .node-loader.mjs
import { createRequire } from "module";
import { resolve as resolveTs } from "ts-node/esm";

const require = createRequire(import.meta.url);

export function resolve(specifier, context, nextResolve) {
  return resolveTs(specifier, context, nextResolve);
}

export { load, transformSource } from "ts-node/esm";
