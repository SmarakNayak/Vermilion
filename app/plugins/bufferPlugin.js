export default {
  name: "inject-buffer",
  setup(build) {
    // Match files that need Buffer
    build.onLoad({ filter: /\.(js|ts)$/ }, async (args) => {
      const source = await Bun.file(args.path).text();
      
      // Only inject into files that use Buffer
      if (source.includes("Buffer") || source.includes("buffer")) {
        return {
          contents: `
            function getGlobalThis() {
              if (typeof globalThis !== 'undefined') return globalThis;
              if (typeof self !== 'undefined') return self;
              if (typeof window !== 'undefined') return window;
              if (typeof global !== 'undefined') return global;
              throw new Error('Unable to locate global object');
            };
            const globalObject = getGlobalThis();
            if (typeof globalObject.Buffer === "undefined") {
              try {
                const BufferPolyfill = require('buffer').Buffer;
                globalObject.Buffer = BufferPolyfill;
              } catch (e) {
                console.warn('Failed to load Buffer polyfill:', e);
              }
            }
            \n${source}`,
          loader: args.path.endsWith(".ts") ? "ts" : "js",
        };
      }
      
      return null; // Let Bun handle files normally
    });
  }
};

// import {nodePolyfills} from 'vite-plugin-node-polyfills';
// export default nodePolyfills({
//   include: ['buffer'],
//   globals: {
//     Buffer: true
//   }
// }); doesn't work with Bun

// import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
// export default nodeModulesPolyfillPlugin({
//   globals: {
//     Buffer: true,
//     process: true,
//   },
//   modules: ['buffer'],
// }); requires bun onEnd() handler