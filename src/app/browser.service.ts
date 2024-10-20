import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  url = 'https://amiens.unilasalle.fr';
  selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';//default language
  canGoBack = false;
  canGoForward = false;
  apiKey = 'AIzaSyAOhx_RYisy4vTPrprybxlld509TIvHaVk'; // Place your Google API key here


// @ts-ignore
  electronAPI = window.electronAPI;
///////////////////////////////////////////// translation

  
  setLanguage(language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.electronAPI.setLanguage(language)
        .then((result: any) => {
          console.log('Language set response:', result);
          localStorage.setItem('selectedLanguage', language);
          this.translatePage(language)
            .then(() => resolve())
            .catch(reject);
        })
        .catch((error: any) => {
          console.error('Error setting language:', error);
          reject(error);
        });
    });
  }

  getLanguage(): string {
    // return this.selectedLanguage;
    return this.electronAPI.getLanguage();  // Get the saved language from localStorage

  }



  async translatePage(language: string): Promise<void> {
    try {
      const currentUrl = await this.electronAPI.currentUrl();
      console.log(`Translating page at: ${currentUrl}`);
      
      interface TextAndId {
        id: string;
        text: string;
      }
  
      const textsAndIds = await this.electronAPI.executeJavaScript<TextAndId[]>(`
        (function() {
          let elements = document.querySelectorAll('body, body *');
          return Array.from(elements).map((el, index) => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
              if (!el.id) {
                el.id = 'translate-' + index;
              }
              return { id: el.id, text: el.innerText.trim() };
            }
            return null;
          }).filter(item => item && item.text !== '');
        })();
      `);
  
      if (!textsAndIds || textsAndIds.length === 0) {
        console.log('No texts found for translation');
        return;
      }
  
      console.log(`Found ${textsAndIds.length} text elements to translate`);
  
      const translatedTexts = await this.getTranslations(textsAndIds.map((item: TextAndId) => item.text), language);
  
      interface Translation extends TextAndId {
        translation: string;
      }
  
      const translations: Translation[] = textsAndIds.map((item: TextAndId, i: number) => ({ ...item, translation: translatedTexts[i] }));
  
      await this.electronAPI.executeJavaScript(`
        (function() {
          let translations = ${JSON.stringify(translations)};
          translations.forEach(item => {
            let el = document.getElementById(item.id);
            if (el) {
              el.innerHTML = el.innerHTML.replace(item.text, item.translation);
            }
          });
          console.log('Translation applied to ' + translations.length + ' elements');
        })();
      `);
      
      console.log('Page translation complete');
    } catch (error) {
      console.error('Error during page translation:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
    }
  }

  // Google Translate API call
  async getTranslations(texts: string[], targetLanguage: string): Promise<string[]> {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
    const batchSize = 128; // Maximum allowed by Google Translate API
    let allTranslatedTexts: string[] = [];
  
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: batch, target: targetLanguage })
        });
        
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Translation API error: ${response.status} ${response.statusText}\n${errorBody}`);
        }
        
        const result = await response.json();
        
        if (result.data && result.data.translations) {
          const translatedBatch = result.data.translations.map((t: any) => t.translatedText);
          allTranslatedTexts = allTranslatedTexts.concat(translatedBatch);
        } else {
          throw new Error('Unexpected response format from Translation API');
        }
      } catch (error) {
        console.error('Error fetching translations:', error);
        throw error;
      }
    }
  
    return allTranslatedTexts;
  }
  
///////////////////////////////////////////////

  toogleDevTool() {
    this.electronAPI.toogleDevTool();
  }

  goHome(): void {
    if (this.electronAPI && this.electronAPI.goHome) {
      this.electronAPI.goHome();
    } else {
      console.error('Electron API non disponible pour Home');
    }
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
/////////////////
  goToPage(url: string): void {
    this.electronAPI.goToPage(url).then(() => {
      this.url = url;
      this.applyLanguage();  // Apply the language after navigation
    });
    this.waitForNavigation().then(() => this.updateHistory());
  }
  

  applyLanguage(): void {
    const lang = this.getLanguage();
    this.electronAPI.setLanguage(lang).then(() => {
      this.translatePage(lang);  // Translate the page after language is applied
    });
  }
  /////////////////

  setToCurrentUrl(): void {
    this.electronAPI.currentUrl().then((currentUrl: string) => {
      this.url = currentUrl;  // Set the URL to the current page's URL
    });
  }

  openEditor(): void {
    if (window && this.electronAPI) {
      this.electronAPI.openEditor();
    } else {
      console.error('Electron API non disponible');
    }
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
