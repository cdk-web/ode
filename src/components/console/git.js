import { fs, process } from "../../globals";

import assert from "assert";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web";

// https://github.com/isomorphic-git/isomorphic-git/blob/0a320c69be08e0befbd1345ed1a051c7fe13d409/cli.cjs
const handleGitCommand = async function (
  shell,
  unused,
  { _: [command, ...args], ...opts }
) {
  assert.ok(shell);
  try {
    const result = await git[command](
      Object.assign(
        {
          fs,
          http,
          dir: process.cwd(),
          corsProxy: "https://cors.isomorphic-git.org",
          singleBranch: true,
          depth: 1,
          headers: { "User-Agent": `git/isogit-${git.version()}` },
          onProgress: (event) => {
            const progress = event.total
              ? (event.loaded / event.total) * 100
              : event.loaded;
            const progressString = progress.toFixed(2);
            shell.printLine(`${event.phase} progress: (${progressString})`);
          },
        },
        { ...(command === "clone" && { url: args[0] }), ...opts }
      )
    );
    if (result === undefined) return;
    // detect streams
    if (typeof result.on === "function") {
      throw new Error("not implemented");
    } else {
      shell.printLine(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    shell.printLine(`Git Error: ${err.message}`);
  }
};
export function register(shell) {
  shell.command("git", handleGitCommand);
}
