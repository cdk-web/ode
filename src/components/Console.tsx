import _ from "lodash";
import * as React from "react";
import * as assert from "assert";
import * as PropTypes from "prop-types";
import { Terminal, ITerminalOptions } from "xterm";
import ReactResizeDetector from "react-resize-detector";
import XtermJSShell from "xterm-js-shell";
import { css } from "@emotion/react";
import * as console from "./console";

import "xterm/css/xterm.css";

const styles = css`
  width: 100%;
  height: 100%;
  display: block;
  background: #000;

  .xterm .xterm-viewport {
    overflow-y: hidden !important;
  }
`;

export interface Application {}

interface State {
  shell?: typeof XtermJSShell;
  terminal: ConsoleTerminal;
}

interface Props {}

class ConsoleTerminal extends Terminal {
  listeners: any[] = [];
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
    applications: [];
    tabSize: number;
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
    tabSize: PropTypes.number.isRequired,
    padding: PropTypes.number,
    applications: PropTypes.arrayOf(PropTypes.func),
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

  handleConsoleRef = (el: HTMLElement) => {
    if (!el) return this.cleanup();
    const terminal = new ConsoleTerminal({ cursorBlink: true });
    // XtermJSShell is older than our xterm and needs some patches
    const shell = new XtermJSShell(terminal);
    // create applications that listen for specific commands
    console.registerApplications(shell);
    this.props.applications.forEach((application: (shell: any) => {}) => application(shell));
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
        if (lastLine) shell.printLine(`command "${lastLine}" not found: "${err.message}"`);
      }
    };
    shell.repl();
    terminal.open(el);
    (console as any).addons.register(terminal);
    this.setState({ shell, terminal });
    this.refit();
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
        {({ height, targetRef }) => (
          <div ref={targetRef as any} style={styles as any}>
            <div
              ref={this.handleConsoleRef}
              style={{
                width: "100%",
                height: height ? height - this.props.tabSize : "100%",
                padding: this.props.padding,
                boxSizing: "border-box",
              }}
            ></div>
          </div>
        )}
      </ReactResizeDetector>
    );
  }
}
