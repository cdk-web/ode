import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { Terminal } from "xterm";
import ReactResizeDetector from "react-resize-detector";
import XtermJSShell from "xterm-js-shell";
import * as appRegistry from "./console";

import "xterm/css/xterm.css";

class ConsoleProcess {
  constructor(el, applications) {
    const terminal = new Terminal({ cursorBlink: true });
    // XtermJSShell uses eventemitter api, here we do a conversion
    terminal.listeners = [];
    terminal.on = (name, ...args) => {
      const listener = terminal[`on${_.capitalize(name)}`](...args);
      terminal.listeners.push(listener);
    };
    terminal.off = () => {
      for (let listener of terminal.listeners) {
        listener.dispose();
      }
      terminal.listeners = [];
    };
    // XtermJSShell is older than our xterm and needs some patches
    const shell = new XtermJSShell(terminal);
    // create applications that listen for specific commands
    appRegistry.registerApplications(shell);
    applications.forEach((application) => application(shell));
    // we hook into where XtermJSShell reads lines and save the last one
    let lastLine = "";
    const read = shell.echo.read.bind(shell.echo);
    shell.echo.read = async (...args) => {
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
    shell.run = async (command, args, flags) => {
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
    appRegistry.addons.register(terminal);
    this.terminal = terminal;
    this.shell = shell;
    this.refit();
  }

  refit() {
    if (this.terminal) {
      this.terminal.refit();
      this.terminal.focus();
    }
  }

  dispose() {
    if (this.shell) {
      this.shell.detach();
      delete this.shell;
    }
    if (this.terminal) {
      this.terminal.dispose();
      delete this.terminal;
    }
  }
}

export default class Console extends React.Component {
  static propTypes = {
    applications: PropTypes.arrayOf(PropTypes.func),
  };

  static defaultProps = {
    applications: [],
  };

  state = { process: null };

  handleConsoleRef = (el) => {
    if (!el) return;
    this.setState({ process: new ConsoleProcess(el, this.props.applications) });
  };

  refit = () => {
    if (this.state.process) {
      this.state.process.refit();
    }
  };

  dispose = () => {
    if (this.state.process) {
      this.state.process.dispose();
      this.setState({ process: null });
    }
  };

  componentDidMount = this.refit;
  componentWillUnmount = this.dispose;

  render() {
    return (
      <div style={{ backgroundColor: "#000", width: "100%", height: "100%" }}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.refit}>
          {
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
          }
        </ReactResizeDetector>
      </div>
    );
  }
}
