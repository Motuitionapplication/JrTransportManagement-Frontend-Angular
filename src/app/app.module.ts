import { NgModule, isDevMode } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SplashScreenComponent } from './shared/splash-screen/splash-screen.component';
import { IosInstallPromptComponent } from './shared/ios-install-prompt/ios-install-prompt.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

// Feature Modules
import { StudentsModule } from './features/students/students.module';
import { AuthModule } from './features/auth/auth.module';
import { OwnerModule } from './features/owner/owner.module';
import { CustomerModule } from './features/customer/customer.module';
import { DriverModule } from './features/driver/driver.module';
import { AdminModule } from './features/admin/admin.module';
import { SuperAdminModule } from './features/super-admin/super-admin.module';

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    IosInstallPromptComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    AppRoutingModule,
    StudentsModule,
    AuthModule,
    OwnerModule,
    CustomerModule,
    DriverModule,
    AdminModule,
    SuperAdminModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
