import { polyfillNode } from 'esbuild-plugin-polyfill-node';
export default polyfillNode({
  globals: {
    global: true,
    // buffer: true,
    // process: true,
  },
  // polyfills: {
  //   buffer: true
  // },
});
// not designed for browsers, but polyfills global object