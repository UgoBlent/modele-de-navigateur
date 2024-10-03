const { contextBridge, ipcRenderer } = require('electron/renderer');

// Exposer les fonctions via `window.electronAPI`
window.electronAPI = {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),
  
  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  goToPage: (url) => ipcRenderer.invoke('go-to-page', url),
  currentUrl: () => ipcRenderer.invoke('current-url'),

  openEditor: () => ipcRenderer.send('open-editor'),  // Expose la méthode openEditor

  // Écoute les événements de navigation
  onUrlUpdate: (callback) => ipcRenderer.on('update-url', (event, url) => callback(url)),
  onDidNavigate: (callback) => ipcRenderer.on('did-navigate', callback)
};

ipcRenderer.on('load-page-source', (event, pageSource) => {
  // Créer un événement personnalisé dans la fenêtre d'édition pour charger le code source
  const eventLoad = new CustomEvent('load-page-source', { detail: pageSource });
  window.dispatchEvent(eventLoad);
});

window.openEditor = {
  openEditor: () => ipcRenderer.send('open-editor')
};

// Fonction pour appliquer les changements dans le processus de rendu
window.applyChanges = function(newCode) {
  ipcRenderer.send('apply-changes', newCode);
};