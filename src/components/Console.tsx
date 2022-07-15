import _ from "lodash";
import * as React from "react";
import * as assert from "assert";
import * as PropTypes from "prop-types";
import { Terminal, ITerminalOptions } from "xterm";
import ReactResizeDetector from "react-resize-detector";
import stringArgv from "string-argv";
import minimist from "minimist";
import XtermJSShell from "xterm-js-shell";
import appStore from "../stores/AppStore";
import * as consoleComponent from "./console";
import { Application } from "../models";

import "xterm/css/xterm.css";

let _buf: null | string = null;

export { Application } from "../models";

interface State {
  shell?: typeof XtermJSShell;
  terminal: ConsoleTerminal;
}

interface Props {}

class ConsoleTerminal extends Terminal {
  listeners: any[] = [];
  serializeAddon: any;
  constructor(options?: ITerminalOptions) {
    super(options);
  }
  on(name: string, ...args: any[]) {
    const listener = (this as any)[`on${_.capitalize(name)}`](...args);
    this.listeners.push(listener);
  }
  off() {
    for (let listener of this.listeners) {
      listener.dispose();
    }
    this.listeners = [];
  }
  refit() {}
}

export class Console extends React.Component<
  {
    applications: Application[];
    //tabSize: number;
    padding: string;
  },
  {}
> {
  state: State = {
    /** @type {XtermJSShell} */
    shell: null,
    /** @type {ConsoleTerminal} */
    terminal: null,
  };

  static propTypes = {
    //tabSize: PropTypes.number.isRequired,
    padding: PropTypes.number,
    applications: PropTypes.arrayOf(PropTypes.shape({init: PropTypes.func})),
  };

  static defaultProps: Props = {
    padding: 5,
    applications: [],
  };

  constructor(props: any) {
    super(props);
  }

  handleConsoleData = (data: string) => {
    assert.ok(this.state.shell);
    assert.ok(_.isString(data));
    // this api prints into xterm
    this.state.shell.printLine(data);
    this.refit();
  };

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
    if (!this.state.shell) {
      return;
    }
    this.props.applications.forEach((application: Application) => application.init(this.state.shell));
  }

  componentWillMount() {
    // handle 3rd party actions sent from app
    appStore.onRunAction.register(() => {
      const action = appStore.getAction();
      action.command.split("\n").forEach((line: string) => {
        const argv = stringArgv(line)
        const command = argv.shift()
        const parsed = minimist(argv)
        const raw_args = parsed._
        this.state.shell.currentLine = () => {
          return line;
        };
        this.state.shell.run(command, raw_args, parsed)
      })
    });
  }

  handleConsoleRef = (el: HTMLElement) => {
    if (!el) return; // this.cleanup();
    const terminal = new ConsoleTerminal({ cursorBlink: true });
    // XtermJSShell is older than our xterm and needs some patches
    const shell = new XtermJSShell(terminal);
    // create applications that listen for specific commands
    consoleComponent.registerApplications(shell);

    // we hook into where XtermJSShell reads lines and save the last one
    let lastLine = "";
    const read = shell.echo.read.bind(shell.echo);
    shell.echo.read = async (...args: any[]) => {
      const line = await read(...args);
      lastLine = line;
      return line;
    };
    // expose the last line as a function of the shell
    shell.currentLine = () => {
      return lastLine;
    };
    // we hook into XtermJSShell and pass stuff it does not recognize to cash-money
    const run = shell.run.bind(shell);
    shell.run = async (command: string, args: any[], flags: { [key: string]: string }) => {
      try {
        // this is everything registered with XtermJSShell's api
        // documented in node_modules/xterm-js-shell/README.md
        return await run(command, args, flags);
        // }
      } catch (err) {
        // if lastLine is empty, user is just hitting enter without commands
        if (shell.currentLine()) shell.printLine(err.message);
      }
    };
    shell.repl();
    terminal.open(el);
    (consoleComponent as any).addons.register(terminal);
    this.setState({ shell, terminal });
    this.refit();
    _buf && terminal.writeln(_buf);
  };

  refit = () => {
    if (this.state.terminal) {
      this.state.terminal.refit();
      this.state.terminal.focus();
    }
  };

  cleanup() {
    if (this.state.shell) {
      delete this.state.shell.currentLine;
      this.state.shell.detach();
      this.setState({ shell: null });
    }
    if (this.state.terminal) {
      _buf = this.state.terminal.serializeAddon.serialize();
      this.state.terminal.dispose();
      this.setState({ terminal: null });
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  componentDidMount() {
    this.refit();
  }

  render() {
    return (
      <ReactResizeDetector handleWidth handleHeight skipOnMount={true} onResize={this.refit}>
        <div
          ref={this.handleConsoleRef}
          style={{
            width: "100%",
            height: "calc(100% - 15px)",
            boxSizing: "border-box",
            background: "#000",
            padding: 10,
          }}
        ></div>
      </ReactResizeDetector>
    );
  }
}
