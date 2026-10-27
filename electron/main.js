const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Xóa hoàn toàn thanh menu
  win.setMenu(null);

  // Khi đóng gói app.isPackaged = true -> load file index.html trong dist
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
    win.webContents.openDevTools();
  } else {
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    win.loadURL(startUrl);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});