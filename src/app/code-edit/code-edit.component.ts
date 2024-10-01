import { Component, inject } from '@angular/core';
import { BrowserService } from '../browser.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-code-edit',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './code-edit.component.html',
  styleUrl: './code-edit.component.css'
})
export class CodeEditComponent {
  public browserService = inject(BrowserService);
}
