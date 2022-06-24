import XtermJSShell from "xterm-js-shell";

export interface Application {
  init(shell: typeof XtermJSShell): void;
}
