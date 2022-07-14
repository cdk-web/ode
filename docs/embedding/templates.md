# Custom Templates

## Applications

## Actions

It's possible to customize the toolbar

### Example Button Configurations

```javascript
{
  key: "ForkProject",
  icon: <GoRepoForked />,
  label: "Fork",
  title: "Fork Project",
  isDisabled: this.toolbarButtonsAreDisabled(),
  onClick: () => {
    this.fork();
  },
}
```

```javascript
{
  key: "CreateGist",
  icon: <GoGist />,
  label: "Create Gist",
  title: "Create GitHub Gist from Project",
  isDisabled: this.toolbarButtonsAreDisabled(),
  onClick: () => {
    this.gist();
  },
}
```

```javascript
{
  key: "Share",
  icon: <GoRocket />,
  label: "Share",
  title: this.state.fiddle ? "Share Project" : "Cannot share a project that has not been forked yet.",
  isDisabled: this.toolbarButtonsAreDisabled() || !this.state.fiddle,
  onClick: () => {
    this.share();
  },
}
```

```javascript
{
  key: "Build",
  icon: <GoBeaker />,
  label: "Build",
  title: "Build Project: CtrlCmd + B",
  isDisabled: this.toolbarButtonsAreDisabled(),
  onClick: () => {
    build();
  },
}
```

```javascript
{
  key: "Run",
  icon: <GoGear />,
  label: "Run",
  title: "Run Project: CtrlCmd + Enter",
  isDisabled: this.toolbarButtonsAreDisabled(),
  onClick: () => {
    run();
  },
}
```

```javascript
{
  key: "BuildAndRun",
  icon: <GoBeakerGear />,
  label: "Build &amp; Run",
  title: "Build &amp; Run Project: CtrlCmd + Alt + Enter",
  isDisabled: this.toolbarButtonsAreDisabled(),
  onClick: () => {
    build().then(run);
  },
}
```

```javascript
{
  key: "GithubIssues",
  icon: <GoOpenIssue />,
  label: "GitHub Issues",
  title: "GitHub Issues",
  customClassName: "issue",
  href: "https:github.com/wasdk/WebAssemblyStudio",
  target: "_blank",
  rel: "noopener noreferrer",
}
```
