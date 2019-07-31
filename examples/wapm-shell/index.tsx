import XTerm, { Command, WASICommand, CommandOptions, Terminal } from "./term";
import React from "react";
import ReactDOM from "react-dom";
import * as fit from "xterm/lib/addons/fit/fit";

const stdinFile = import("./stdin.wasm");
console.log(stdinFile);
Terminal.applyAddon(fit);

let compiledModules: { [key: string]: WebAssembly.Module } = {};

let commands = {
  cowsay: "https://registry-cdn.wapm.dev/contents/_/cowsay/0.1.2/cowsay.wasm",
  a: "http://localhost:1234/stdin.6f029b38.wasm",
  matrix:
    "https://registry-cdn.wapm.dev/contents/syrusakbary/wasm-matrix/0.0.4/optimized.wasm",
  // 'cowsay': 'https://wapm.dev/_/cowsay/0.1.2/cowsay.wasm',
  lolcat: "https://registry-cdn.wapm.dev/contents/_/lolcat/0.1.1/lolcat.wasm"
};

const compileFromUrl = async (url: string): Promise<WebAssembly.Module> => {
  // @ts-ignore
  if (WebAssembly.compileStreaming && false) {
    // @ts-ignore
    return await WebAssembly.compileStreaming(fetch(url));
  } else {
    let fetched = await fetch(url);
    let buffer = await fetched.arrayBuffer();
    return await WebAssembly.compile(buffer);
  }
};

const getCommand = async (options: CommandOptions): Promise<WASICommand> => {
  // await stdinFile;
  let [commandName, commandArgs] = options.args;
  let commandUrl = commands[commandName];
  if (!commandUrl) {
    throw new Error(`command not found ${commandName}`);
  }

  let cachedData = compiledModules[commandUrl];
  if (!cachedData) {
    cachedData = compiledModules[commandUrl] = await compileFromUrl(commandUrl);
  }
  return new WASICommand({
    args: options.args,
    env: options.env,
    module: cachedData
  });
};

ReactDOM.render(
  <XTerm
    getCommand={getCommand}
    onSetup={component => {
      (component.xterm as any).fit();
    }}
  />,
  document.getElementById("root")
);
