// Rollup Config for the Wapm Shell Example

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import json from "rollup-plugin-json";
import postcss from "rollup-plugin-postcss";
import postcssImport from "postcss-import";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import bundleSize from "rollup-plugin-bundle-size";
import hash from "rollup-plugin-hash";
import serve from "rollup-plugin-serve";

const sourcemapOption = process.env.PROD ? undefined : "inline";

const fs = require("fs");

const writeIndexHtml = bundleName => {
  let indexHtml = fs.readFileSync("examples/wapm-shell/index.html", "utf8");
  indexHtml = indexHtml.replace(
    "<%BUNDLE%>",
    bundleName.replace("dist/examples/wapm-shell/", "")
  );
  fs.writeFileSync("dist/examples/wapm-shell/index.html", indexHtml, "utf8");
};

let typescriptPluginOptions = {
  tsconfig: "./tsconfig.json"
};

let plugins = [
  postcss({
    extensions: [".css"],
    plugins: [postcssImport()]
  }),
  typescript(typescriptPluginOptions),
  resolve(),
  commonjs(),
  json(),
  compiler(),
  bundleSize()
];

if (process.env.PROD) {
  plugins = [
    ...plugins,
    hash({
      dest: "dist/examples/wapm-shell//bundle.[hash].js",
      callback: bundleName => {
        writeIndexHtml(bundleName);
      }
    })
  ];
} else {
  plugins = [
    ...plugins,
    serve({
      contentBase: ["dist/"],
      port: 8080
    })
  ];
  writeIndexHtml("index.iife.js");
}

const wapmShellBundles = [
  {
    input: "examples/wapm-shell/index.tsx",
    output: [
      {
        file: "dist/examples/wapm-shell/index.js",
        format: "iife",
        sourcemap: sourcemapOption,
        name: "WasiWapmShellDemo"
      }
    ],
    watch: {
      clearScreen: false
    },
    plugins: plugins
  }
];

export default wapmShellBundles;
