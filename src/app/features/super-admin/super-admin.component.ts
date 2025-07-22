import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent implements OnInit, OnDestroy {
  currentRoute: string = '';
  subscriptions: Subscription[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.setupRouterEvents();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupRouterEvents(): void {
    const routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
          console.log('🧭 Route changed to:', this.currentRoute);
        }
      });
    this.subscriptions.push(routerSub);
  }
}
