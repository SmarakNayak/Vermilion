import { build } from "bun";
import bufferPlugin from "./plugins/bufferPlugin";
import nodePlugin from "./plugins/nodePlugin";

await build({
  entrypoints: ["./index.html"],
  outdir: "dist",
  //sourcemap: true,
  target: "browser",
  minify: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  env: "BUN_PUBLIC_*",
  plugins: [bufferPlugin, nodePlugin]
});