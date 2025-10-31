import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EnvironmentService } from 'src/app/core/services/environment.service';
import { DriverDTO } from 'src/app/models/driver.dto';
import { Driver } from 'src/app/models/driver.model';
import { AuthService } from 'src/app/services/auth.service';
import { DriverService } from '../../driver.service';
import { User } from 'src/app/models/auth.model';
import { MatSnackBar } from '@angular/material/snack-bar';

type UploadType = 'avatar' | 'license' | 'document';

interface DriverAttachment {
  id?: string;
  name?: string;
  url?: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
}

@Component({
  selector: 'app-driver-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  loading = false;
  saving = false;
  isCreatingProfile = false;
  driver: Driver | null = null;
  /** When true, inputs are enabled and user can modify fields */
  editMode = false;
  /** Snapshot used to restore values on Cancel */
  private originalDriver: Driver | null = null;
  serverError = '';
  successMessage = '';
  uploadErrors: string[] = [];
  form: FormGroup;
  currentUser: User | null = null;
  profileAutoCreated = false;
  /** Holds current profile photo URL for display */
  profilePhotoUrl: string = '';
  /** Avatar upload in-progress flag */
  uploadingAvatar = false;

  private autoCreateAttempted = false;

  readonly maxFileSizeBytes = 5 * 1024 * 1024; // 5MB
  readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly driverService: DriverService,
    private readonly authService: AuthService,
    private readonly environmentService: EnvironmentService,
    private readonly cdr: ChangeDetectorRef,
    private readonly snackBar: MatSnackBar
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.loadProfile();
    // Start in read-only mode until user taps Edit
    this.setReadOnlyMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get attachments(): FormArray {
    return this.form.get('attachments') as FormArray;
  }

  refresh(): void {
    // COPILOT-FIX: allow another auto-create attempt when user explicitly refreshes
    this.autoCreateAttempted = false;
    this.profileAutoCreated = false;
    this.loadProfile(true);
  }

  save(): void {
    this.successMessage = '';
    this.serverError = '';
    this.uploadErrors = [];

    // Only allow saving when in edit mode
    if (!this.editMode) {
      return;
    }

    if (!this.driver) {
      this.serverError = 'No profile to update yet. Please refresh.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildUpdatePayload();

    if (this.environmentService.isLocal()) {
      console.debug('[DriverProfile] update payload', payload);
    }
    this.saving = true;
    this.cdr.markForCheck();

    this.driverService
      .updateDriver(this.driver.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedDriver) => {
          this.driver = updatedDriver;
          this.patchForm(updatedDriver);
          // Update snapshot and exit edit mode
          this.originalDriver = updatedDriver;
          this.setReadOnlyMode();
          this.editMode = false;
          this.successMessage = 'Profile updated';
          this.saving = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.saving = false;
          this.serverError = this.extractErrorMessage(
            error,
            'We could not update your profile. Please try again later.'
          );

          if (error?.status === 401) {
            this.authService.logout();
          }

          this.cdr.markForCheck();
        },
      });
  }

  onFileSelected(event: Event, type: UploadType): void {
    if (!this.editMode) {
      this.showToast('Enable Edit mode to upload files.', true);
      return;
    }
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.driver) {
      return;
    }

    const file = input.files[0];
    input.value = '';

    this.uploadErrors = [];
    this.successMessage = '';

    if (file.size > this.maxFileSizeBytes) {
      this.uploadErrors.push('File is too large. Maximum allowed size is 5MB.');
      this.cdr.markForCheck();
      return;
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      this.uploadErrors.push(
        'Unsupported file format. Please upload an image or PDF file.'
      );
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    if (this.environmentService.isLocal()) {
      console.debug('[DriverProfile] uploading file', {
        driverId: this.driver.id,
        type,
        fileName: file.name,
        size: file.size,
      });
    }

    this.driverService
      .uploadDriverFile(this.driver.id, file, type)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'File uploaded successfully.';
          this.saving = false;
          this.loadProfile(true, true);
        },
        error: (error) => {
          this.saving = false;
          const message = this.extractErrorMessage(
            error,
            'We could not upload the file. Please try again.'
          );
          this.uploadErrors = [message];

          if (error?.status === 401) {
            this.serverError = 'Session expired, please login again.';
            this.authService.logout();
          }

          this.cdr.markForCheck();
        },
      });
  }

  removeAttachment(index: number): void {
    if (!this.editMode) {
      this.showToast('Enable Edit mode to modify attachments.', true);
      return;
    }
    const control = this.attachments.at(index);
    if (!control) {
      return;
    }

    const attachment = control.value as DriverAttachment;
    this.attachments.removeAt(index);
    if (this.driver) {
      (this.driver as any).attachments = this.attachments.value;
    }
    this.uploadErrors = [
      `Removed ${
        attachment?.name ?? 'attachment'
      } locally. Backend deletion will be wired soon.`,
    ];
    this.cdr.markForCheck();
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorCode);
  }

  trackAttachment(_: number, item: AbstractControl): string {
    const value = item.value as DriverAttachment;
    return value?.id ?? value?.url ?? value?.name ?? Math.random().toString(36);
  }

  focusFirstField(): void {
    // COPILOT-FIX: quick CTA to guide drivers after auto-create completes
    const firstInput = document.getElementById(
      'firstName'
    ) as HTMLInputElement | null;
    firstInput?.focus();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\s-]{7,15}$/)],
      ],
      city: [''],
      addressLine: [''],
      postalCode: ['', [this.optionalMinLengthValidator(4)]],
      licenseNumber: ['', [this.optionalMinLengthValidator(4)]],
      licenseExpiry: ['', [this.futureDateValidator()]],
      avatarUrl: [''],
      attachments: this.fb.array([]),
    });
  }

  private loadProfile(forceReload = false, retainSuccessMessage = false): void {
    if (this.loading && !forceReload) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.serverError = 'Not authenticated. Please login again.';
      this.cdr.markForCheck();
      return;
    }

    this.currentUser = user;
    if (this.environmentService.isLocal()) {
      console.debug('[DriverProfile] loading profile for user', {
        userId: user.id,
        username: user.username,
      });
    }

    this.loading = true;
    this.serverError = '';
    if (!retainSuccessMessage) {
      this.successMessage = '';
    }
    this.uploadErrors = [];
    this.cdr.markForCheck();

    this.driverService
      .getDriverByUserId(user.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (driver) => {
          this.driver = driver;
          this.patchForm(driver);
          this.originalDriver = driver;
          this.setReadOnlyMode();
          this.loading = false;
          this.profileAutoCreated = retainSuccessMessage
            ? this.profileAutoCreated
            : false;
          this.autoCreateAttempted = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loading = false;
          if (error?.status === 404) {
            if (!this.autoCreateAttempted) {
              this.autoCreateAttempted = true;
              this.tryAutoCreateProfile(user);
              return;
            }
            this.serverError = 'No profile found. Please contact support.';
          } else if (error?.status === 401) {
            this.serverError = 'Session expired, please login again.';
            this.authService.logout();
          } else {
            this.serverError = this.extractErrorMessage(
              error,
              'Unable to load your profile at the moment.'
            );
          }
          this.cdr.markForCheck();
        },
      });
  }

  private tryAutoCreateProfile(user: User): void {
    if (this.isCreatingProfile) {
      return;
    }
    const userId = user.id?.toString();
    if (!userId) {
      this.serverError =
        'We could not determine your driver account identifier.';
      this.cdr.markForCheck();
      return;
    }

    const payload = {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    if (this.environmentService.isLocal()) {
      console.debug(
        '[DriverProfile] auto-creating minimal driver profile',
        payload
      );
    }

    // COPILOT-FIX: guard against multiple concurrent auto-create attempts
    this.isCreatingProfile = true;
    this.serverError = '';
    this.uploadErrors = [];
    this.cdr.markForCheck();

    this.driverService
      .createMinimalDriver(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isCreatingProfile = false;
          this.profileAutoCreated = true;
          this.successMessage =
            'Profile created automatically. Please review and save your details.';
          this.showToast('Profile created. Please complete your details.');
          this.cdr.markForCheck();
          this.loadProfile(true, true);
        },
        error: (error) => {
          this.isCreatingProfile = false;
          this.serverError = this.extractErrorMessage(
            error,
            'We could not create a driver profile automatically. Please try again later.'
          );
          this.showToast(this.serverError, true);
          this.cdr.markForCheck();
        },
      });
  }

  private showToast(message: string, isError = false): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: isError ? 6000 : 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private patchForm(driver: Driver): void {
    const driverAny = driver as any;
    const profile = driverAny?.profile ?? {};
    const address = profile?.address ?? driverAny?.address ?? {};
    const license = driverAny?.drivingLicense ?? {};
    const attachments = this.resolveAttachments(driver);

    const firstName = profile?.firstName ?? driverAny?.firstName ?? '';
    const lastName = profile?.lastName ?? driverAny?.lastName ?? '';
    const email = profile?.email ?? driverAny?.email ?? '';
    const phoneNumber = profile?.phoneNumber ?? driverAny?.phoneNumber ?? '';
    const avatarUrl = profile?.profilePhoto ?? driverAny?.profilePhoto ?? '';

    this.form.patchValue({
      firstName,
      lastName,
      email,
      phoneNumber,
      city: address?.city ?? '',
      addressLine: address?.street ?? '',
      postalCode: address?.pincode ?? '',
      licenseNumber: license?.licenseNumber ?? '',
      licenseExpiry: this.toDateInputValue(license?.expiryDate),
      avatarUrl,
    });

    // keep a local display URL for avatar
    this.profilePhotoUrl = avatarUrl;

    this.setAttachments(attachments);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  /** Handle dedicated avatar selection, validates size/type, shows preview and uploads */
  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.driver) {
      return;
    }
    const file = input.files[0];
    input.value = '';

    // Validate size/type: only png/jpg/jpeg up to 2MB
    const validTypes = ['image/png', 'image/jpeg'];
    const maxBytes = 2 * 1024 * 1024;
    if (!validTypes.includes(file.type) || file.size > maxBytes) {
      this.showToast('Only image files up to 2MB allowed', true);
      return;
    }

    // Temporary preview using object URL
    const tempUrl = URL.createObjectURL(file);
    const prevUrl = this.profilePhotoUrl;
    this.profilePhotoUrl = tempUrl;
    this.uploadingAvatar = true;
    this.cdr.markForCheck();

    this.driverService
      .uploadProfilePhoto(this.driver.id, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newUrl = response?.avatarUrl ?? '';
          this.profilePhotoUrl = newUrl || tempUrl;
          this.form.patchValue({ avatarUrl: this.profilePhotoUrl });
          this.authService.updateAvatar(this.profilePhotoUrl);
          this.successMessage = 'Profile photo updated!';
          this.uploadingAvatar = false;
          URL.revokeObjectURL(tempUrl);
          this.cdr.markForCheck();
        },
        error: () => {
          // Restore previous
          this.profilePhotoUrl = prevUrl;
          this.uploadingAvatar = false;
          this.showToast('Failed to update profile photo', true);
          URL.revokeObjectURL(tempUrl);
          this.cdr.markForCheck();
        },
      });
  }

  /** Enter edit mode: enable form and focus first input */
  enterEdit(): void {
    if (this.loading || this.saving || this.isCreatingProfile) return;
    if (!this.driver) return;
    this.editMode = true;
    this.form.enable({ emitEvent: false });
    this.cdr.markForCheck();
    // Focus after view updates
    setTimeout(() => this.focusFirstField());
  }

  /** Cancel edits: revert to last snapshot, disable form */
  cancelEdit(): void {
    if (!this.editMode) return;
    if (this.originalDriver) {
      this.patchForm(this.originalDriver);
    }
    this.setReadOnlyMode();
    this.editMode = false;
    this.cdr.markForCheck();
  }

  /** Helper to disable the form without affecting action buttons */
  private setReadOnlyMode(): void {
    this.form.disable({ emitEvent: false });
  }

  private setAttachments(attachments: DriverAttachment[]): void {
    this.attachments.clear();
    attachments.forEach((attachment) => {
      this.attachments.push(
        this.fb.group({
          id: [attachment.id ?? null],
          name: [attachment.name ?? ''],
          url: [attachment.url ?? ''],
          type: [attachment.type ?? 'document'],
          size: [attachment.size ?? null],
          uploadedAt: [attachment.uploadedAt ?? null],
        })
      );
    });
  }

  private resolveAttachments(driver: Driver): DriverAttachment[] {
    const attachments = (driver as any)?.attachments as DriverAttachment[];
    const documents = (driver as any)?.documents as DriverAttachment[];

    if (Array.isArray(attachments) && attachments.length) {
      return attachments;
    }

    if (Array.isArray(documents) && documents.length) {
      return documents;
    }

    return [];
  }

  private buildUpdatePayload(): Partial<DriverDTO> {
    const value = this.form.value;
    const payload: Partial<DriverDTO> & Record<string, unknown> = {
      firstName: value.firstName?.trim(),
      lastName: value.lastName?.trim(),
      email: value.email?.trim(),
      phoneNumber: value.phoneNumber?.trim(),
      profile: {
        firstName: value.firstName?.trim(),
        lastName: value.lastName?.trim(),
        email: value.email?.trim(),
        phoneNumber: value.phoneNumber?.trim(),
        profilePhoto: value.avatarUrl,
        address: {
          street: value.addressLine?.trim(),
          city: value.city?.trim(),
          pincode: value.postalCode?.trim(),
        },
      },
      drivingLicense: {
        licenseNumber: value.licenseNumber?.trim(),
        expiryDate: value.licenseExpiry
          ? new Date(value.licenseExpiry).toISOString()
          : null,
      },
    };

    return this.removeEmptyFields(payload);
  }

  private removeEmptyFields<T extends Record<string, unknown>>(obj: T): T {
    const cleaned: Record<string, unknown> = {};
    Object.entries(obj).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        return;
      }

      if (Array.isArray(val)) {
        cleaned[key] = val.length ? val : undefined;
        return;
      }

      if (typeof val === 'object' && val !== null) {
        const nested = this.removeEmptyFields(val as Record<string, unknown>);
        if (Object.keys(nested).length) {
          cleaned[key] = nested;
        }
        return;
      }

      cleaned[key] = val;
    });

    return cleaned as T;
  }

  private extractErrorMessage(error: any, fallback: string): string {
    if (!error) {
      return fallback;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error.userMessage) {
      return error.userMessage;
    }

    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.userMessage) {
        return error.error.userMessage;
      }
    }

    if (error.message) {
      return error.message;
    }

    return fallback;
  }

  private toDateInputValue(value: string | Date | undefined): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().split('T')[0];
  }

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return { invalidDate: true };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        return { pastDate: true };
      }

      return null;
    };
  }

  private optionalMinLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = (control.value ?? '').toString().trim();
      if (!value) {
        return null;
      }

      return value.length >= length
        ? null
        : { minLength: { requiredLength: length, actualLength: value.length } };
    };
  }
}
