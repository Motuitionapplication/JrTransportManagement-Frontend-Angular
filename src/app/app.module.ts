import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';
import { TokenInterceptor } from './core/token.interceptor';
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
import { AgGridModule } from 'ag-grid-angular';
import { AppCustomerWalletComponent } from './features/wallet-managements/app-customer-wallet/app-customer-wallet.component';
import { AppDriverWalletComponent } from './features/wallet-managements/app-driver-wallet/app-driver-wallet.component';
import { AppAdminWalletComponent } from './features/wallet-managements/app-admin-wallet/app-admin-wallet.component';
import { DriverFormComponent } from './features/form/driver-form/driver-form.component';
import { VehicleFormComponent } from './features/form/vehicle-form/vehicle-form.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { OwnerFormComponent } from './features/form/owner-form/owner-form.component';
import { PaymentComponent } from './features/payment/payment.component';
import { PaymentDialogComponent } from './features/Fetched/payment-dialog/payment-dialog.component';
import { DialogMessageComponent } from './shared/dialog-message/dialog-message.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehiclesComponent } from './features/vehicle/vehicle.component';
import { VehicleDialogComponent } from './features/Fetched/vehicle-dialog/vehicle-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { AssignVehicleComponent } from './features/form/assign-vehicle/assign-vehicle.component';
import { HistoryDialogComponent } from './features/Fetched/history-dialog/history-dialog.component';
import { AuthService } from './services/auth.service';
// import { VehiclesComponent } from './vehicles/vehicles.component';

export function authInitializerFactory(
  authService: AuthService
): () => Promise<void> {
  return () => authService.bootstrapSession();
}

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    IosInstallPromptComponent,
    DashboardComponent,

    DriverFormComponent,
    // VehicleFormComponent,
    OwnerFormComponent,
    PaymentComponent,
    PaymentDialogComponent,
    DialogMessageComponent,
    VehiclesComponent,
    VehicleDialogComponent,
    AssignVehicleComponent,
    HistoryDialogComponent,
    // VehiclesComponent,
  ],
  imports: [
    MatProgressSpinnerModule,
    AgGridModule,
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
      registrationStrategy: 'registerWhenStable:30000',
    }),
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: authInitializerFactory,
      deps: [AuthService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
