// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray} = require('electron')
const path = require('path');
const { electron, exit } = require('process');
const Config = require('electron-store')
const config = new Config()

let win = null;

// single instance lock 요청
const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
  exit(-1);
}

function createWindow (opts) {
  // Create the browser window.
  let options = {icon: path.join(__dirname, 'app_ico.png')}
  Object.assign(options, config.get('winBounds'));
  win = new BrowserWindow(options);
  win.setMenu(null);
  win.loadURL('https://outlook.office.com');

  win.on('close', (event) => {
    config.set('winBounds', win.getBounds());
  });
}

app.whenReady().then(() => {
  if (!singleInstanceLock) {
    app.quit();
    exit(-1);
  }
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    win.show();
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', (event) => {
  win = null;
});


const iconPath = path.join(__dirname, "app_ico.png");
let tray = null;

app.on('ready', () => {
  tray = new Tray(iconPath);
  const template = [
    {
      label: "Open",
      click: () => { win.show(); }
    }, {
      label: "Exit",
      click: () => { app.quit(); }
    }
  ];

  const ctxMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(ctxMenu);
});

app.on('second-instance', () => {
  if (!singleInstanceLock) {
    app.quit();
    exit(-1);
  }
  if (win) {
    if (win.isMinimized() || !win.isVisible()) {
      win.show();
    }
    win.focus();
  }
});
