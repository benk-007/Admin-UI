import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent
} from '@coreui/angular';
import {ImageGetModel} from '../../../../models/unit/get/image-get.model';
import {ImageApiService} from '../../../../services/image-api.service';
import {ConfirmModalComponent} from '../../../../../../shared/components/confirm-modal/confirm-modal.component';


@Component({
  selector: 'app-unit-gallery',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    TranslatePipe,
  ],
  templateUrl: './unit-gallery.component.html',
  styleUrl: './unit-gallery.component.scss',
  providers: [BsModalService]
})
export class UnitGalleryComponent implements OnInit, OnDestroy {

  @Input() unitId!: string;

  // Image lists
  images: ImageGetModel[] = [];
  coverImage: ImageGetModel | null = null;
  regularImages: ImageGetModel[] = [];

  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly imageApiService: ImageApiService,
    private readonly sanitizer: DomSanitizer,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService,
    private readonly modalService: BsModalService
  ) {}

  ngOnInit(): void {
    if (this.unitId) {
      this.retrieveImages();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Handle file selection for upload
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.uploadImages(files);

      // Reset input for next selection
      input.value = '';
    }
  }

  /**
   * Set selected image as cover
   */
  setAsCover(image: ImageGetModel): void {
    if (image.cover) {
      // Already cover, no need to change
      return;
    }

    this.subscriptions.push(
      this.imageApiService.setAsCover(image.id).subscribe({
        next: (updatedImage) => {
          console.log('Image set as cover successfully:', updatedImage);

          // Update local state
          if (this.coverImage) {
            this.coverImage.cover = false;
          }
          image.cover = true;
          this.organizeImages();

          this.toastrService.success(
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.success.message'),
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.success.title')
          );
        },
        error: (err) => {
          console.error('Error setting image as cover:', err);
          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.error.message'),
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.error.title')
          );
        }
      })
    );
  }

  /**
   * Show confirmation modal before deleting image
   */
  confirmImageDeletion(image: ImageGetModel): void {
    const initialState = {
      title: this.translateService.instant('units.edit-unit.tabs.general-information.gallery.delete-modal.title'),
      message: this.translateService.instant('units.edit-unit.tabs.general-information.gallery.delete-modal.message')
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, { initialState });

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.deleteImage(image);
      })
    );
  }

  /**
   * Get images to display in right zone (max 4 images, 2x2 grid)
   */
  getDisplayedRightImages(): ImageGetModel[] {
    return this.regularImages.slice(0, 4);
  }

  /**
   * Get images to display in bottom row (starting from 5th image)
   */
  getBottomRowImages(): ImageGetModel[] {
    return this.regularImages.slice(4);
  }

  /**
   * Check if add button should be shown in bottom row
   */
  shouldShowBottomAddButton(): boolean {
    // Show in bottom if right zone is full (4 images) or if there are bottom images
    return this.regularImages.length >= 4;
  }

  /**
   * Retrieve images list from API
   */
  private retrieveImages(): void {
    this.subscriptions.push(
      this.imageApiService.getImagesByUnitId(this.unitId).subscribe({
        next: (data) => {
          console.log('Unit images retrieved:', data);
          this.images = data.content;
          this.organizeImages();

          // Load each image for display
          this.images.forEach(image => this.loadImageData(image));
        },
        error: (err) => {
          console.error('Error retrieving unit images:', err);
          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.load.error.message'),
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.load.error.title')
          );
        }
      })
    );
  }

  /**
   * Organize images into cover and regular images
   */
  private organizeImages(): void {
    this.coverImage = this.images.find(img => img.cover) || null;
    this.regularImages = this.images.filter(img => !img.cover);
  }

  /**
   * Load binary data of an image using Media Service
   */
  private loadImageData(image: ImageGetModel): void {
    console.log('Loading image data for:', image);
    console.log('UUID value:', image.uuid);

    if (!image.uuid) {
      console.error(`No UUID found for image ${image.id}. Full image object:`, image);
      return;
    }

    this.subscriptions.push(
      this.imageApiService.getImageByUuid(image.uuid).subscribe({
        next: (blob) => {
          console.log(`Successfully loaded image blob for ${image.id}`);
          const objectUrl = URL.createObjectURL(blob);
          image.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        },
        error: (err) => {
          console.error(`Error loading image ${image.id} with UUID ${image.uuid}:`, err);
        }
      })
    );
  }

  /**
   * Upload selected images to the API
   */
  private uploadImages(files: File[]): void {
    this.subscriptions.push(
      this.imageApiService.postImages(this.unitId, files).subscribe({
        next: (response) => {
          console.log('Upload response type:', typeof response);
          console.log('Upload response:', response);

          let uploadedImages: ImageGetModel[] = [];

          if (Array.isArray(response)) {
            uploadedImages = response;
          } else if (response && typeof response === 'object') {
            // Si c'est un objet avec une propriété content (comme une Page)
            uploadedImages = (response as any).content || [];
          }

          if (uploadedImages.length === 0) {
            console.warn('No images found in upload response');
            return;
          }

          console.log('Images uploaded successfully:', uploadedImages);

          // Add uploaded images to current list
          this.images.push(...uploadedImages);
          this.organizeImages();

          // Load image data for display
          uploadedImages.forEach(image => this.loadImageData(image));

          this.toastrService.success(
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.success.message'),
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.success.title')
          );
        },
        error: (err) => {
          console.error('Error uploading images:', err);
          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.error.message'),
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.error.title')
          );
        }
      })
    );
  }

  /**
   * Delete image from server and update local state
   */
  private deleteImage(image: ImageGetModel): void {
    this.subscriptions.push(
      this.imageApiService.deleteById(image.id).subscribe({
        next: () => {
          console.log('Image deleted successfully:', image.id);

          // Remove from local arrays
          this.images = this.images.filter(img => img.id !== image.id);
          this.organizeImages();

          // Clean up object URL to prevent memory leaks
          if (image.imageUrl) {
            URL.revokeObjectURL(image.imageUrl.toString());
          }

          this.toastrService.success(
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.success.message'),
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.success.title')
          );
        },
        error: (err) => {
          console.error('Error deleting image:', err);
          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.error.message'),
            this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.error.title')
          );
        }
      })
    );
  }
}
