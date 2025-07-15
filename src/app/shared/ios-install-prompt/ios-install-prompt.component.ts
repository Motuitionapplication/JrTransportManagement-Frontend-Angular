import { Component, OnInit } from '@angular/core';
import { PwaService } from '../../core/services/pwa.service';

@Component({
  selector: 'app-ios-install-prompt',
  template: `
    <div class="ios-install-overlay" *ngIf="showPrompt" (click)="hidePrompt()">
      <div class="ios-install-modal" (click)="$event.stopPropagation()">
        <div class="ios-install-header">
          <i class="fas fa-mobile-alt"></i>
          <h3>Install Educare</h3>
          <button class="close-btn" (click)="hidePrompt()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="ios-install-content">
          <p>Add Educare to your home screen for quick and easy access when you're on the go.</p>
          
          <div class="install-steps">
            <div class="step">
              <div class="step-icon">
                <i class="fas fa-share" style="transform: rotate(-90deg);"></i>
              </div>
              <div class="step-text">
                <strong>1. Tap the Share button</strong><br>
                <small>Look for <i class="fas fa-share" style="transform: rotate(-90deg); font-size: 0.8em;"></i> in Safari's toolbar</small>
              </div>
            </div>
            
            <div class="step">
              <div class="step-icon">
                <i class="fas fa-plus-square"></i>
              </div>
              <div class="step-text">
                <strong>2. Add to Home Screen</strong><br>
                <small>Scroll down and tap "Add to Home Screen"</small>
              </div>
            </div>
            
            <div class="step">
              <div class="step-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="step-text">
                <strong>3. Confirm</strong><br>
                <small>Tap "Add" to install the app</small>
              </div>
            </div>
          </div>
          
          <div class="install-benefits">
            <h4>Benefits of installing:</h4>
            <ul>
              <li><i class="fas fa-rocket"></i> Faster loading times</li>
              <li><i class="fas fa-wifi"></i> Works offline</li>
              <li><i class="fas fa-home"></i> Easy access from home screen</li>
              <li><i class="fas fa-mobile-alt"></i> Full-screen experience</li>
            </ul>
          </div>
        </div>
        
        <div class="ios-install-footer">
          <button class="btn btn-secondary" (click)="dontShowAgain()">
            Don't show again
          </button>
          <button class="btn btn-primary" (click)="hidePrompt()">
            Got it!
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ios-install-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      backdrop-filter: blur(4px);
    }
    .ios-install-modal {
      background: white;
      border-radius: 1rem;
      max-width: 400px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .ios-install-header {
      padding: 1.5rem 1.5rem 1rem;
      text-align: center;
      position: relative;
      border-bottom: 1px solid #e9ecef;
    }
    .ios-install-header i { font-size: 2rem; color: #ff6b35; margin-bottom: 0.5rem; }
    .ios-install-header h3 { margin: 0; color: #2c3e50; font-size: 1.25rem; font-weight: 600; }
    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #7f8c8d;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    .close-btn:hover { background: #f8f9fa; color: #2c3e50; }
    .ios-install-content { padding: 1.5rem; }
    .ios-install-content p { margin-bottom: 1.5rem; color: #7f8c8d; line-height: 1.6; }
    .install-steps { margin-bottom: 1.5rem; }
    .step {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
    }
    .step-icon {
      width: 40px;
      height: 40px;
      background: #ff6b35;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      flex-shrink: 0;
    }
    .step-text { flex: 1; }
    .step-text strong { color: #2c3e50; display: block; margin-bottom: 0.25rem; }
    .step-text small { color: #7f8c8d; }
    .install-benefits {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid #ff6b35;
    }
    .install-benefits h4 { margin: 0 0 0.75rem 0; color: #2c3e50; font-size: 1rem; }
    .install-benefits ul { list-style: none; padding: 0; margin: 0; }
    .install-benefits li { padding: 0.25rem 0; color: #7f8c8d; font-size: 0.9rem; }
    .install-benefits li i { color: #4caf50; margin-right: 0.5rem; width: 16px; }
    .ios-install-footer {
      padding: 1rem 1.5rem 1.5rem;
      display: flex;
      gap: 1rem;
      border-top: 1px solid #e9ecef;
    }
    .btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-secondary { background: #e9ecef; color: #6c757d; }
    .btn-secondary:hover { background: #dee2e6; }
    .btn-primary { background: #ff6b35; color: white; }
    .btn-primary:hover { background: #e55a2b; }
    @media (max-width: 480px) {
      .ios-install-modal { margin: 0.5rem; max-height: 95vh; }
      .ios-install-header, .ios-install-content, .ios-install-footer { padding-left: 1rem; padding-right: 1rem; }
      .step { padding: 0.75rem; }
      .ios-install-footer { flex-direction: column; }
    }
  `]
})
export class IosInstallPromptComponent implements OnInit {
  showPrompt = false;

  constructor(private pwaService: PwaService) {}

  ngOnInit(): void {
    // Auto-show prompt for iOS devices that can install the PWA
    setTimeout(() => {
      this.checkAndShowPrompt();
    }, 2000);
  }

  private checkAndShowPrompt(): void {
    if (this.pwaService.isIOSDevice() && 
        !this.pwaService.isInStandaloneMode() && 
        !this.isDismissed()) {
      this.showPrompt = true;
    }
  }

  public showInstallPrompt(): void {
    this.showPrompt = true;
  }

  public hidePrompt(): void {
    this.showPrompt = false;
  }

  public dontShowAgain(): void {
    localStorage.setItem('ios-install-dismissed', 'true');
    this.hidePrompt();
  }

  private isDismissed(): boolean {
    return localStorage.getItem('ios-install-dismissed') === 'true';
  }
}
