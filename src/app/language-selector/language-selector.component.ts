import { Component, inject } from '@angular/core';
import { BrowserService } from '../browser.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent {

  public browserService = inject(BrowserService);

  languages = ['en', 'fr', 'es', 'de']; // List of supported languages
  selectedLanguage = this.browserService.getLanguage();

  constructor() {
    console.log('Languages:', this.languages);  // Debugging to ensure languages array is initialized
  }

  onLanguageChange(language: string): void {
    console.log('Language changed to:', language);
    this.browserService.setLanguage(language)
      .then(() => {
        console.log('Language set successfully');
        this.selectedLanguage = language;
      })
      .catch((error: any) => {
        console.error('Error setting language:', error);
      });
  }
}
