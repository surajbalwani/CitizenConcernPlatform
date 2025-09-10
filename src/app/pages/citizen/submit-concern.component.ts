import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { CreateConcernRequest } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

interface CapturedImage {
  id: string;
  url: string;
  name: string;
}

@Component({
  selector: 'app-submit-concern',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  template: `
    <div
      class="mobile-container"
      [class.mobile-layout]="layoutService.isMobile()"
    >
      <h1>Submit New Concern</h1>

      <mat-stepper #stepper orientation="vertical" [linear]="true">
        <mat-step [stepControl]="basicInfoForm" label="Basic Information">
          <form [formGroup]="basicInfoForm">
            <mat-form-field class="full-width">
              <mat-label>Title</mat-label>
              <input
                matInput
                formControlName="title"
                placeholder="Brief description"
              />
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="4"
                placeholder="Detailed description"
              ></textarea>
              <button
                mat-icon-button
                matSuffix
                (click)="startVoiceInput()"
                [disabled]="isListening()"
              >
                <mat-icon>{{ isListening() ? 'mic_off' : 'mic' }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="step-actions">
              <button
                mat-raised-button
                color="primary"
                matStepperNext
                [disabled]="!basicInfoForm.valid"
              >
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <mat-step [stepControl]="locationForm" label="Location">
          <form [formGroup]="locationForm">
            <mat-form-field class="full-width">
              <mat-label>Address</mat-label>
              <textarea
                matInput
                formControlName="address"
                rows="3"
                placeholder="Enter address"
              ></textarea>
              <button
                mat-icon-button
                matSuffix
                (click)="getCurrentLocation()"
                [disabled]="gettingLocation()"
              >
                <mat-icon>{{
                  gettingLocation() ? 'gps_fixed' : 'location_on'
                }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field class="half-width">
                <mat-label>Region</mat-label>
                <input matInput formControlName="region" placeholder="Region" />
              </mat-form-field>

              <mat-form-field class="half-width">
                <mat-label>Ward/Area</mat-label>
                <input
                  matInput
                  formControlName="ward"
                  placeholder="Local ward or area"
                />
              </mat-form-field>
            </div>

            <mat-checkbox
              formControlName="isAnonymous"
              class="anonymous-checkbox"
            >
              Submit anonymously
            </mat-checkbox>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button
                mat-raised-button
                color="primary"
                matStepperNext
                [disabled]="!locationForm.valid"
              >
                Next
              </button>
            </div>
          </form>
        </mat-step>

        <mat-step label="Evidence">
          <div class="media-section">
            <button
              mat-raised-button
              (click)="capturePhoto()"
              class="full-width photo-button"
            >
              <mat-icon>camera_alt</mat-icon>
              Capture Photo
            </button>

            @if (capturedImages().length > 0) {
            <div class="image-preview">
              @for (image of capturedImages(); track image.id) {
              <div class="image-container">
                <img
                  [src]="image.url"
                  [alt]="image.name"
                  class="preview-image"
                />
                <button
                  mat-mini-fab
                  color="warn"
                  class="remove-button"
                  (click)="removeImage(image.id)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              }
            </div>
            }

            <mat-form-field class="full-width">
              <mat-label>Additional Notes</mat-label>
              <textarea
                matInput
                [(ngModel)]="additionalNotes"
                rows="3"
                placeholder="Any additional information"
              ></textarea>
            </mat-form-field>
          </div>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button mat-raised-button color="primary" matStepperNext>
              Next
            </button>
          </div>
        </mat-step>

        <mat-step label="Review & Submit">
          <div class="review-section">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Review Your Concern</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>
                  <strong>Title:</strong>
                  {{ basicInfoForm.get('title')?.value }}
                </p>
                <p>
                  <strong>Description:</strong>
                  {{ basicInfoForm.get('description')?.value }}
                </p>
                <p>
                  <strong>Address:</strong>
                  {{ locationForm.get('address')?.value }}
                </p>
                <p>
                  <strong>Region:</strong>
                  {{ locationForm.get('region')?.value }}
                </p>
                <p>
                  <strong>Ward:</strong> {{ locationForm.get('ward')?.value }}
                </p>
                <p>
                  <strong>Anonymous:</strong>
                  {{ locationForm.get('isAnonymous')?.value ? 'Yes' : 'No' }}
                </p>
                <p>
                  <strong>Photos:</strong>
                  {{ capturedImages().length }} attached
                </p>
                @if (additionalNotes) {
                <p><strong>Additional Notes:</strong> {{ additionalNotes }}</p>
                }
              </mat-card-content>
            </mat-card>
          </div>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button
              mat-raised-button
              color="primary"
              (click)="submitConcern()"
              [disabled]="isSubmitting()"
            >
              @if (isSubmitting()) {
              <mat-spinner
                diameter="20"
                style="margin-right: 8px;"
              ></mat-spinner>
              }
              {{ isSubmitting() ? 'Submitting...' : 'Submit Concern' }}
            </button>

            @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
            }
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [
    `
      .mobile-container {
        padding: 16px;
        max-width: 800px;
        margin: 0 auto;
      }

      .mobile-layout {
        padding: 8px;
      }

      h1 {
        color: #1976d2;
        text-align: center;
        margin-bottom: 24px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .step-actions {
        margin: 16px 0;
        display: flex;
        gap: 8px;
        justify-content: space-between;
      }

      .media-section {
        text-align: center;
        margin: 16px 0;
      }

      .photo-button {
        margin-bottom: 16px;
      }

      .image-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 16px 0;
        justify-content: center;
      }

      .image-container {
        position: relative;
      }

      .preview-image {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .remove-button {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
      }

      .remove-button mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .review-section {
        margin: 16px 0;
      }

      mat-stepper {
        background: transparent;
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .half-width {
        flex: 1;
        margin-bottom: 16px;
      }

      .anonymous-checkbox {
        margin: 16px 0;
      }

      .error-message {
        color: #f44336;
        font-size: 14px;
        margin-top: 16px;
        text-align: center;
      }

      @media (max-width: 600px) {
        .step-actions {
          flex-direction: column;
        }

        .step-actions button {
          width: 100%;
          margin-bottom: 8px;
        }

        .form-row {
          flex-direction: column;
          gap: 0;
        }
      }
    `,
  ],
})
export class SubmitConcernComponent implements OnInit {
  basicInfoForm: FormGroup;
  locationForm: FormGroup;
  additionalNotes = '';

  isListening = signal(false);
  gettingLocation = signal(false);
  isSubmitting = signal(false);
  capturedImages = signal<CapturedImage[]>([]);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    public layoutService: LayoutService,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {
    // Removed category from form validation
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      region: [''],
      ward: [''],
      isAnonymous: [false],
    });
  }

  ngOnInit() {
    // Removed loadCategories() call
  }

  // Removed loadCategories() method and availableCategories signal

  startVoiceInput() {
    if (this.isListening()) {
      this.isListening.set(false);
    } else {
      this.isListening.set(true);
      setTimeout(() => {
        this.isListening.set(false);
        const currentDescription =
          this.basicInfoForm.get('description')?.value || '';
        this.basicInfoForm.patchValue({
          description:
            currentDescription + ' [Voice input would be added here]',
        });
      }, 3000);
    }
  }

  getCurrentLocation() {
    this.gettingLocation.set(true);

    setTimeout(() => {
      this.locationForm.patchValue({
        address: '123 Mock Street, Sample City, State 12345',
        ward: 'Ward 5',
      });
      this.gettingLocation.set(false);
    }, 2000);
  }

  private currentImageIndex = 0;
  private sampleImages = [
    'assets/images/pothole.jpg',
    'assets/images/pothole2.jpg',
    'assets/images/pothole3.jpg',
  ];

  capturePhoto() {
    const imageUrl = this.sampleImages[this.currentImageIndex % this.sampleImages.length];
    this.currentImageIndex++;

    const capturedImage: CapturedImage = {
      id: Date.now().toString(),
      url: imageUrl,
      name: `photo_${Date.now()}.jpg`,
    };

    this.capturedImages.update((images) => [...images, capturedImage]);
  }

  removeImage(imageId: string) {
    this.capturedImages.update((images) =>
      images.filter((img) => img.id !== imageId)
    );
  }

  submitConcern() {
    if (this.basicInfoForm.valid && this.locationForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set('');

      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.errorMessage.set('You must be logged in to submit a concern');
        this.isSubmitting.set(false);
        return;
      }

      const basicInfo = this.basicInfoForm.value;
      const locationInfo = this.locationForm.value;
      const isAnonymous = locationInfo.isAnonymous;

      const concernRequest: CreateConcernRequest = {
        title: basicInfo.title,
        description:
          basicInfo.description +
          (this.additionalNotes
            ? '\n\nAdditional Notes: ' + this.additionalNotes
            : ''),
        address: locationInfo.address,
        region: locationInfo.region,
        ward: locationInfo.ward,
        citizenId: currentUser.id,
        citizenName: isAnonymous
          ? undefined
          : `${currentUser.firstName} ${currentUser.lastName}`,
        citizenEmail: isAnonymous ? undefined : currentUser.email,
        citizenPhone: isAnonymous ? undefined : currentUser.phoneNumber,
        isAnonymous: isAnonymous,
        language: 'en',
        attachmentUrls: this.capturedImages().map((img) => img.url),
      };

      this.apiService.createConcern(concernRequest).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/citizen/dashboard'], {
            queryParams: { submitted: 'true' },
          });
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            error.message || 'Failed to submit concern. Please try again.'
          );
          console.error('Failed to submit concern:', error);
        },
      });
    } else {
      this.errorMessage.set(
        'Please fill in all required fields before submitting.'
      );
    }
  }
}
