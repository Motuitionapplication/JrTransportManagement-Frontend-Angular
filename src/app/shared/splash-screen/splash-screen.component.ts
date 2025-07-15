import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {
  isHidden = false;

  constructor() { }

  ngOnInit(): void {
    // Hide splash screen after 3 seconds
    setTimeout(() => {
      this.hideSplashScreen();
    }, 3000);
  }

  hideSplashScreen(): void {
    this.isHidden = true;
    // Remove from DOM after animation completes
    setTimeout(() => {
      const splashElement = document.querySelector('.splash-screen');
      if (splashElement) {
        splashElement.remove();
      }
    }, 500);
  }
}
