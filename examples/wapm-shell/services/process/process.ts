import { WASIExitError, WASIKillError } from "../../../../lib/bindings/browser";
import { CommandOptions } from "../../services/command-runner/command";
import WASICommand from "./wasi-command";

export default class Process {
  commandOptions: CommandOptions;
  dataCallback: Function;
  endCallback: Function;
  errorCallback: Function;
  sharedStdin?: Int32Array;
  startStdinReadCallback?: Function;

  wasiCommand: WASICommand;

  constructor(
    commandOptions: CommandOptions,
    dataCallback: Function,
    endCallback: Function,
    errorCallback: Function,
    sharedStdinBuffer?: SharedArrayBuffer,
    startStdinReadCallback?: Function
  ) {
    this.commandOptions = commandOptions;
    this.dataCallback = dataCallback;
    this.endCallback = endCallback;
    this.errorCallback = errorCallback;

    let sharedStdin: Int32Array | undefined = undefined;
    if (sharedStdinBuffer) {
      sharedStdin = new Int32Array(sharedStdinBuffer);
    }

    this.wasiCommand = new WASICommand(
      commandOptions,
      sharedStdin,
      startStdinReadCallback
    );
  }

  async start(pipedStdinData?: Uint8Array) {
    const commandStream = await this.wasiCommand.instantiate(
      this.dataCallback,
      pipedStdinData
    );

    commandStream.on("end", () => {
      this.endCallback();
    });

    try {
      this.wasiCommand.run();
    } catch (e) {
      console.log("ERROR", e);
      let error = "Unknown Error";

      if (e instanceof WASIExitError) {
        error = `exited with code: ${e.code}`;
      } else if (e instanceof WASIKillError) {
        error = `killed with signal: ${e.signal}`;
      }

      this.errorCallback(error);
    }
  }
}
