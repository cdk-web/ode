define({
  init(shell) {
    shell.command("hello", async (shell, args, opts) => {
      shell.printLine("World");
    });
  },
});
