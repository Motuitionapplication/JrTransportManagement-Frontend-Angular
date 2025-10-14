import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-location-prompt',
  templateUrl: './location-prompt.component.html',
  styleUrls: ['./location-prompt.component.scss']
})
export class LocationPromptComponent {
  @Input() title = 'Enable location';
  @Input() message = 'Drivers must enable location to use driver features.';
  @Input() blocking = true; // If true, app may choose to keep blocking until granted

  @Output() retry = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
