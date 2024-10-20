const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('node:path');

let editorWindow = null;

app.whenReady().then(() => {

  // Create the main window
  const win = new BrowserWindow({
    width: 940,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the app or the localhost URL
  if (app.isPackaged) {
    win.loadFile('dist/browser-template/browser/index.html');
  } else {
    win.loadURL('http://localhost:4200');
  }

  // Create a new BrowserView
  const view = new BrowserView();

  // Attach the BrowserView to the BrowserWindow
  win.setBrowserView(view);

  // Adjust the BrowserView size and position to fit within the main window
  const fitViewToWindow = () => {
    const [winWidth, winHeight] = win.getSize();
    view.setBounds({ x: 0, y: 55, width: winWidth, height: winHeight - 55 });
  };

  // Call initially to set the size of the view
  fitViewToWindow();

  // Adjust the BrowserView when the window is resized
  win.on('resize', fitViewToWindow);

  // Open DevTools for the main window
  win.webContents.openDevTools({ mode: 'detach' });

  // IPC to toggle dev tools for the view
  ipcMain.on('toogle-dev-tool', () => {
    if (view.webContents.isDevToolsOpened()) {
      view.webContents.closeDevTools();
    } else {
      view.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Handle browser navigation actions (back, forward, refresh)
  ipcMain.on('go-back', () => {
    if (view.webContents.canGoBack()) view.webContents.goBack();
  });

  ipcMain.on('go-forward', () => {
    if (view.webContents.canGoForward()) view.webContents.goForward();
  });

  ipcMain.on('refresh', () => {
    view.webContents.reload();
  });

  // IPC handlers for navigating to a specific URL
  ipcMain.handle('go-to-page', (event, url) => {
    return view.webContents.loadURL(url);
  });

  ipcMain.handle('current-url', () => {
    return view.webContents.getURL();
  });

  // IPC handlers for enabling/disabling navigation buttons
  ipcMain.handle('can-go-back', () => {
    return view.webContents.canGoBack();
  });

  ipcMain.handle('can-go-forward', () => {
    return view.webContents.canGoForward();
  });



  ipcMain.handle('set-language', async (event, language) => {
    try {
      view.webContents.executeJavaScript(`document.documentElement.lang = "${language}";`);
      return { success: true, message: 'Language set successfully' };
    } catch (error) {
      console.error('Error setting language:', error);
      return { success: false, error: error.message };
    }
  });


  ipcMain.handle('execute-javascript', async (event, script) => {
    try {
      const result = await view.webContents.executeJavaScript(script);
      return result;
    } catch (error) {
      console.error('Error executing JavaScript:', error);
      throw error;
    }
  });

  // Handle navigation events
  view.webContents.on('did-start-navigation', (event, url) => {
    win.webContents.send('update-url', url);
  });

  view.webContents.on('did-navigate', () => {
    win.webContents.send('did-navigate');
  });
});

