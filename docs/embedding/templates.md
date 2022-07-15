# Custom Templates

To provide custom templates you need to create a folder at path `/templates` and place an index.js file in it. When the ODE loads it will check for the existance of this file and, if it exists, prompt the user to choose one of the templates.

Templates can provide custom [applications](#applications) for the terminal or specific [actions](#actions) to run in the toolbar. Loading applications and actions is done using [require.js](https://requirejs.org/docs/api.html#define).

## Define Templates

Templates are defined by creating an object inside of `/templates/index.js` where the key is the relative path to the template folder and the value is the template definition. You must enumerate each file in the template.

Example `/templates/index.js`

```json
{
  "empty_c": {
    "name": "Empty C Project",
    "description": "# Empty C Project",
    "icon": "c-lang-file-icon",
    "files": [
      {
        "name": "README.md"
      },
      {
        "name": "build.ts"
      },
      {
        "name": "package.json"
      },
      {
        "name": "src/main.c"
      },
      {
        "name": "src/main.html"
      },
      {
        "name": "src/main.js"
      }
    ],
    "applications": [],
    "actions": []
  }
}
```

In the example above there would be a template folder at `/templates/empty_c` that contains 6 files. The name of the file determines both their relative path on disk (inside the `/templates/empty_c` folder) as well as the explorer file structure in the ODE.

## Applications

Applictions are defined as an array of strings. The string value is the path to a javascript file that contains a [require.js module](https://requirejs.org/docs/api.html#define). The module defintion must return an object that defined an `init` function that accepts a single argument with an instance of [xterm js shell](https://github.com/RangerMauve/xterm-js-shell).

Example template definition:

```json
{
  "empty_python": {
    "name": "Empty Python Project",
    "description": "# Empty C Project",
    "icon": "python-lang-file-icon",
    "files": [],
    "applications": ["applications/python.js"],
    "actions": []
  }
}
```

Contents of `/templates/empty_python/applications/python.js`

```javascript
define({
  init(shell) {
    shell.command("hello", async (shell, args, opts) => {
      shell.printLine("World");
    });
  },
});
```

## Actions

Customize the toolbar by definining actions. Actions can run built in or custom terminal applications by defining a "command". Define the "onClick" event to run arbitrary code by specifying the path to a require.js module that will be executed and passed an instance of "Application".

Example action definition:

```json
{
  "empty_python": {
    "name": "Empty Python Project",
    "description": "# Empty C Project",
    "icon": "python-lang-file-icon",
    "files": [],
    "applications": ["applications/python.js"],
    "actions": [
      {
        "label": "Deploy",
        "command": "hello",
        "icon": "GoRocket",
        "index": 0
      },
      {
        "label": "Share",
        "icon": "GoCode",
        "title": "Share Project",
        "onClick": "actions/share.js"
      }
    ]
  }
}
```

Contents of `/templates/empty_python/actions/share.js`

```javascript
define(function() {
  return function(app) {
    app.share();
  }
});

```

### Example / Built-in Actions

Any `onClick` events defined in the examples below need to be in a separate file and defined as a require.js module as specified in [actions](#actions).

```javascript
{
  icon: "GoRepoForked",
  label: "Fork",
  title: "Fork Project",
  onClick: () => {
    app.fork();
  },
}
```

```javascript
{
  icon: "GoGist",
  label: "Create Gist",
  title: "Create GitHub Gist from Project",
  onClick: () => {
    app.gist();
  },
}
```

```javascript
{
  icon: "GoRocket",
  label: "Share",
  title: "Share Project",
  onClick: () => {
    app.share();
  },
}
```

```javascript
{
  icon: "GoBeaker",
  label: "Build",
  title: "Build Project: CtrlCmd + B",
  onClick: () => {
    build();
  },
}
```

```javascript
{
  icon: "GoGear",
  label: "Run",
  title: "Run Project: CtrlCmd + Enter",
  onClick: () => {
    run();
  },
}
```

```javascript
{
  icon: "GoBeakerGear",
  label: "Build &amp; Run",
  title: "Build &amp; Run Project: CtrlCmd + Alt + Enter",
  onClick: () => {
    build().then(run);
  },
}
```

```javascript
{
  icon: "GoOpenIssue",
  label: "GitHub Issues",
  title: "GitHub Issues",
  customClassName: "issue",
  href: "https:github.com/wasdk/WebAssemblyStudio",
  target: "_blank",
  rel: "noopener noreferrer",
}
```

## Available Icons

- GoRepoForked
- GoBeaker
- GoGear
- GoBeakerGear
- GoBook
- GoRocket
- GoPencil
- GoDelete
- GoVerified
- GoFile
- GoFileBinary
- GoFileCode
- GoFileDirectory
- GoQuote
- GoDesktopDownload
- GoX
- GoKebabHorizontal
- GoThreeBars
- GoGist
- GoCheck
- GoOpenIssue
- GoQuestion
- GoClippy
- GoEye
- GoCode
- GoCloudUpload
- GoSync
