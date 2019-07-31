// Rollup config for the WASI Lib

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import bundleSize from "rollup-plugin-bundle-size";
import pkg from "./package.json";

const sourcemapOption = process.env.PROD ? undefined : "inline";

const replaceNodeOptions = {
  delimiters: ["", ""],
  values: {
    "/*ROLLUP_REPLACE_NODE": "",
    "ROLLUP_REPLACE_NODE*/": ""
  }
};

const replaceBrowserOptions = {
  delimiters: ["", ""],
  values: {
    "/*ROLLUP_REPLACE_BROWSER": "",
    "ROLLUP_REPLACE_BROWSER*/": ""
  }
};

let typescriptPluginOptions = {
  tsconfig: "./tsconfig.json"
};

const plugins = [
  typescript(typescriptPluginOptions),
  resolve(),
  commonjs(),
  json()
];

const libBundles = [
  {
    input: "lib/index.ts",
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: sourcemapOption
    },
    watch: {
      clearScreen: false
    },
    plugins: [replace(replaceNodeOptions), ...plugins, bundleSize()]
  },
  {
    input: "lib/index.ts",
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: sourcemapOption
    },
    watch: {
      clearScreen: false
    },
    plugins: [
      replace(replaceBrowserOptions),
      ...plugins,
      compiler(),
      bundleSize()
    ]
  },
  {
    input: "lib/index.ts",
    output: {
      file: pkg.browser,
      format: "iife",
      sourcemap: sourcemapOption,
      name: "Wasi"
    },
    watch: {
      clearScreen: false
    },
    plugins: [
      replace(replaceBrowserOptions),
      ...plugins,
      compiler(),
      bundleSize()
    ]
  }
];

export default libBundles;
