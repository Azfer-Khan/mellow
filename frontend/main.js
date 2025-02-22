const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Recommended for security
      contextIsolation: true, // Recommended for security
      preload: path.join(__dirname, 'preload.js') // Optional, if I need Node APIs in renderer
    }
  });

  // Load the React app
  if (isDev) {
    // In development, load from React dev server
    win.loadURL('http://localhost:3000');
  } else {
    // In production, load from build folder
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  // Uncomment below to open DevTools
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

