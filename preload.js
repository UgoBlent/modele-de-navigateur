const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),

  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  goToPage: (url) => ipcRenderer.invoke('go-to-page', url),
  currentUrl: () => ipcRenderer.invoke('current-url'),

  //listen to the 'update url' event
  onUrlUpdate: (callback) => ipcRenderer.on('update-url', (event, url) => callback(url)),
  onDidNavigate: (callback) => ipcRenderer.on('did-navigate', callback)

})

// Fonction pour ouvrir la fenêtre d'édition
window.openEditor = function() {
  ipcRenderer.send('open-editor');
};

// Fonction pour appliquer les changements dans le processus de rendu
window.applyChanges = function(newCode) {
  ipcRenderer.send('apply-changes', newCode);
};