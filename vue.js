const { package } = require('./package.json');
const { remote } = require("electron");
const Store = require('electron-store');
const store = new Store();
const ipcRenderer = require('electron').ipcRenderer;
const { PythonShell } = require('python-shell');

const vm = new Vue({
  el: '#app',
  data: {
    input: "",
    output: "",
    regex: "",
    creationDate: false,
    destinationBehavior: "copy",
    directoryFormat: "",
    originalName: false,
    pythonArgs: [],
    pythonProcess: null,
    codeDir: "",
    view: 0,
    scanning: true,
    messageReturn: [],
    command: "phockup "
  },
  created: function () {

    if (store.get("phockup")) {
      this.input = store.get("phockup.input");
      this.output = store.get("phockup.output");
      this.regex = store.get("phockup.regex");
      this.creationDate = store.get("phockup.creationDate");
      this.destinationBehavior = store.get("phockup.destinationBehavior");
      this.directoryFormat = store.get("phockup.directoryFormat");
      this.originalName = store.get("phockup.originalName");
      this.codeDir = store.get("codeDir");
    } else {
      this.updateStore();
    }

    this.updateCommand();

  },
  methods: {
    // window methods
    toggleMinimize: function () {
      remote.getCurrentWindow().minimize();
    },
    toggleClose: function () {
      remote.app.quit();
    },
    cleanPath: function (_path) {
      var path = _path;
      var split = path.split("/");
      return split.slice(0, split.length - 1).join("/") + "/";
    },
    selectedPhockup: function (e) {
      this.codeDir = this.cleanPath(e.target.files[0].path);
      this.updateCommand();
    },
    selectedInput: function (e) {
      this.input = this.cleanPath(e.target.files[0].path);
      this.updateCommand();
    },
    selectedOutput: function (e) {
      this.output = this.cleanPath(e.target.files[0].path);
      this.updateCommand();
    },
    updateResults: function (params) {
      this.messageReturn.push(params);
    },
    changeView: function (view) {
      this.view = view;
      if (this.view == 3) {

        this.scanning = true;
        this.messageReturn = [];

        let options = {
          mode: 'text',
          scriptPath: this.codeDir,
          args: this.pythonArgs
        };

        var pyshell = new PythonShell('phockup.py', options);

        var callback = this.updateResults;
        var completed = () => {
          this.scanning = false;
        };

        pyshell.on('message', function (message) {
          callback(message);
        });

        pyshell.end(function (err) {
          if (err) {
            console.log(err);
            throw err;
          };
          completed();
        });

        this.pythonProcess = pyshell.childProcess;
      }

    },
    cancelProcess: function () {
      this.pythonProcess.kill('SIGINT');
    },
    isDisabled: function () {
      if (this.input && this.output) {
        return false;
      } else {
        return true;
      }
    },
    changeDestination: function (option) {
      this.destinationBehavior = option;
    },
    updateStore: function () {
      store.set("phockup.input", this.input);
      store.set("phockup.output", this.output);
      store.set("phockup.regex", this.regex);
      store.set("phockup.creationDate", this.creationDate);
      store.set("phockup.destinationBehavior", this.destinationBehavior);
      store.set("phockup.directoryFormat", this.directoryFormat);
      store.set("phockup.originalName", this.originalName);
      store.set("codeDir", this.codeDir);
    },
    updateCommand: function () {
      this.command = "phockup";
      this.pythonArgs = [];

      if (this.input) {
        this.command = this.command + " \"" + this.input + "\"";
        this.pythonArgs.push(this.input);
      }

      if (this.output) {
        this.command = this.command + " \"" + this.output + "\"";
        this.pythonArgs.push(this.output);
      }

      if (this.regex) {
        this.command = this.command + " --regex \"" + this.regex + "\"";
        this.pythonArgs.push("--regex="+ this.regex);
      }

      if (this.creationDate) {
        this.command = this.command + " --timestamp";
        this.pythonArgs.push("--timestamp");
      }

      if (this.destinationBehavior === "move") {
        this.command = this.command + " --move";
        this.pythonArgs.push("--move");
      } else if (this.destinationBehavior === "link") {
        this.command = this.command + " --link";
        this.pythonArgs.push("--link");
      }

      if (this.directoryFormat) {
        this.command = this.command + " --date=\"" + this.directoryFormat + "\"";
        this.pythonArgs.push("--date=" + this.directoryFormat);
      }

      if (this.originalName) {
        this.command = this.command + " --original-names";
        this.pythonArgs.push("--original-names");
      }

      this.updateStore();

    }
  }

});

