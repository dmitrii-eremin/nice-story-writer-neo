import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path = require("path")
import os = require("os");
import fs = require('node:fs');

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | undefined = undefined;

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 1024,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('toggle-dev-tools', (event, args) => {
  if (mainWindow === undefined) {
    return;
  }

  if (mainWindow.webContents.isDevToolsOpened()) {
    mainWindow.webContents.closeDevTools();
  }
  else {
    mainWindow.webContents.openDevTools();
  }
});

ipcMain.on('save-file', async (event, data: string) => {
  if (mainWindow === undefined) {
    return;
  }

  const options = {
    title: 'Save File',
    defaultPath: path.join(os.homedir(), 'new story.md'),
    buttonLabel: 'Save',
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  };

  const dialogResult = await dialog.showSaveDialog(mainWindow, options);
  if (dialogResult.canceled) {
    return;
  }
  
  try {
    fs.writeFileSync(dialogResult.filePath, data);
  }
  catch (err) {
    alert(`Nice Story Writer was not able to save the file. Details: ${err}`);
  }
});

ipcMain.handle('load-file', async (event, args) => {
  if (mainWindow === undefined) {
    return;
  }

  const options = {
    title: 'Open File',
    defaultPath: path.join(os.homedir(), '/'),
    buttonLabel: 'Open',
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
  };

  const dialogResult = await dialog.showOpenDialog(mainWindow, options)
  if (dialogResult.canceled) {
    return;
  }

  const filename: string = dialogResult.filePaths[0];
  try {
    return fs.readFileSync(filename, 'utf8');
  }
  catch (err) {
    alert(`Nice Story Writer was not able to read the file. Details: ${err}`);
  }
});
