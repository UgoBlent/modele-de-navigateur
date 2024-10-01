import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  url = 'https://amiens.unilasalle.fr';
  canGoBack = false;
  canGoForward = false;

// @ts-ignore
  electronAPI = window.electronAPI;

  toogleDevTool() {
    this.electronAPI.toogleDevTool();
  }

  goBack() {
    this.electronAPI.goBack();
    this.waitForNavigation().then(() => this.updateHistory());
  }
  
  goForward() {
    this.electronAPI.goForward();
    this.waitForNavigation().then(() => this.updateHistory());
  }

  refresh() {
    this.electronAPI.refresh();
  }

  goToPage(url: string): void {
    this.electronAPI.goToPage(url).then(() => {
      this.url = url;
        // Update the URL after the navigation is successful
    });
    this.updateHistory();
  }

  setToCurrentUrl(): void {
    this.electronAPI.currentUrl().then((currentUrl: string) => {
      this.url = currentUrl;  // Set the URL to the current page's URL
    });
  }

  updateHistory() {
    this.setToCurrentUrl();

    this.electronAPI.canGoBack()
      .then((canGoBack : boolean) => this.canGoBack = canGoBack);

    this.electronAPI.canGoForward()
      .then((canGoForward : boolean) => this.canGoForward = canGoForward);
  }

  waitForNavigation(): Promise<void> {
    return new Promise((resolve) => {
      this.electronAPI.onDidNavigate(() => resolve());
    });
  }
}
