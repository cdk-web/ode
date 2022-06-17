define({
  init(shell) {
    shell.command("python", async (shell, args, opts) => {
      shell.printLine("Hello World");
    });
  },
});
