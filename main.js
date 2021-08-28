const electron = require('electron');
const app = electron.app;
// const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;

const path = require('path');
const url = require('url');

const Store = require('electron-store');
const store = new Store();

const AutoLaunch = require('auto-launch');

let mainWindow = null;
let tray = null;
let blurActivated = false;

require('electron-reload')(__dirname);

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 800,
    frame: false,
    fullscreenable: false,
    // show: false,
    resizable: true,
    transparent: true,
    // skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

};


app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// if (process.platform == 'darwin') {
//   app.dock.hide();
// }