const { contextBridge, ipcRenderer } = require('electron/renderer');

// Check if localStorage is available before using it
const selectedLanguage = localStorage ? localStorage.getItem('selectedLanguage') : 'en';

// Exposer les fonctions via `window.electronAPI`
window.electronAPI = {
  toogleDevTool: () => ipcRenderer.send('toogle-dev-tool'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),
  goHome: () => ipcRenderer.send('go-home'),
  
  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  goToPage: (url) => ipcRenderer.invoke('go-to-page', url),
  currentUrl: () => ipcRenderer.invoke('current-url'),

  onUrlUpdate: (callback) => ipcRenderer.on('update-url', (event, url) => callback(url)),
  onDidNavigate: (callback) => ipcRenderer.on('did-navigate', callback),

  executeJavaScript: (script) => ipcRenderer.invoke('execute-javascript', script),

  setLanguage: (language) => {
    localStorage.setItem('selectedLanguage', language);
    return ipcRenderer.invoke('set-language', language)
      .then((result) => {
        console.log('Language set result:', result);
        return result;
      })
      .catch((error) => {
        console.error('Error setting language:', error);
        throw error;
      });
  },
  

  getLanguage: () => {
    return localStorage.getItem('selectedLanguage') || 'en';  // Default to 'en' if none is set
  }
});
