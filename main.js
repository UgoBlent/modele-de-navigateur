const { app, WebContentsView, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

let editorWindow = null;

app.whenReady().then(() => {

  // BrowserWindow initiate the rendering of the angular toolbar
  const win = new BrowserWindow({
    width: 940,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (app.isPackaged){
    win.loadFile('dist/browser-template/browser/index.html');
  }else{
    win.loadURL('http://localhost:4200')
  }


  // WebContentsView initiate the rendering of a second view to browser the web
  const view = new WebContentsView();
  win.contentView.addChildView(view);

  // Always fit the web rendering with the electron windows
  function fitViewToWin() {
    const winSize = win.webContents.getOwnerBrowserWindow().getBounds();
    view.setBounds({ x: 0, y: 55, width: winSize.width, height: winSize.height });
  }

    win.webContents.openDevTools({ mode: 'detach' });

  // Register events handling from the toolbar
  ipcMain.on('toogle-dev-tool', () => {
    if (winContent.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  ipcMain.on('open-editor', async () => {
    if (!editorWindow) {
      editorWindow = new BrowserWindow({
        width: 600,
        height: 400,
        parent: win,  // Si tu veux garder la relation parent, sinon tu peux aussi l'enlever
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false
        }
      });
  
      editorWindow.loadFile('editor.html');
      
      // Récupérer le code source de la fenêtre principale
      const pageSource = await view.webContents.executeJavaScript('document.documentElement.outerHTML');
  
      // Envoyer le code source après que la fenêtre d'édition soit complètement chargée
      editorWindow.webContents.on('did-finish-load', () => {
        editorWindow.webContents.send('load-page-source', pageSource);
      });
  
      editorWindow.on('closed', () => {
        editorWindow = null;
      });
    }
  });
  

  ipcMain.on('go-back', () => {
    view.webContents.navigationHistory.goBack();
  });

  ipcMain.handle('can-go-back', () => {
    return view.webContents.navigationHistory.canGoBack();
  });

  ipcMain.on('go-forward', () => {
    view.webContents.navigationHistory.goForward();
  });

  ipcMain.handle('can-go-forward', () => {
    return view.webContents.navigationHistory.canGoForward();
  });

  ipcMain.on('refresh', () => {
    view.webContents.reload();
  });

  ipcMain.handle('go-to-page', (event, url) => {
    return view.webContents.loadURL(url);
  });


  ipcMain.handle('current-url', () => {
    return view.webContents.getURL();
  });

  ipcMain.on('apply-changes', (event, newCode) => {
    // Utiliser document.open(), document.write() et document.close() pour injecter le nouveau code
    const sanitizedCode = newCode.replace(/`/g, '\\`');  // Échapper les backticks si nécessaire
    const script = `
      document.open();
      document.write(\`${sanitizedCode}\`);
      document.close();
    `;
    view.webContents.executeJavaScript(script)
      .then(() => {
        console.log('Le code HTML a été appliqué avec succès via document.write');
      })
      .catch((error) => {
        console.error('Erreur lors de l\'application du code HTML : ', error);
      });
  });

  ipcMain.handle('get-page-source', async () => {
    const pageSource = await view.webContents.executeJavaScript('document.documentElement.outerHTML');
    return pageSource;
  });

  //Register events handling from the main windows
  win.once('ready-to-show', () => {
    fitViewToWin();
    view.webContents.loadURL('https://amiens.unilasalle.fr');
  });


  win.on('resized', () => {
    fitViewToWin();
  });

  view.webContents.on('did-start-navigation', (event, url) => {
    win.webContents.send('update-url', url)
  });
  view.webContents.on('did-navigate', () => {
    win.webContents.send('did-navigate');  // Send event to renderer process
  });

})
