import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  width?: number;
  height?: number;
}

export class CameraService {
  /**
   * Check if camera is available on the current platform
   */
  static isAvailable(): boolean {
    return Capacitor.isNativePlatform() || Capacitor.getPlatform() === 'web';
  }

  /**
   * Take a photo using device camera
   */
  static async takePhoto(options: CameraOptions = {}): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing !== undefined ? options.allowEditing : true,
        resultType: options.resultType || CameraResultType.DataUrl,
        source: options.source || CameraSource.Camera,
        width: options.width,
        height: options.height,
      });

      return image.dataUrl || image.webPath || '';
    } catch (error) {
      console.error('Error taking photo:', error);
      throw new Error('Failed to take photo');
    }
  }

  /**
   * Choose a photo from gallery
   */
  static async chooseFromGallery(options: CameraOptions = {}): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing !== undefined ? options.allowEditing : true,
        resultType: options.resultType || CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: options.width,
        height: options.height,
      });

      return image.dataUrl || image.webPath || '';
    } catch (error) {
      console.error('Error choosing photo:', error);
      throw new Error('Failed to choose photo');
    }
  }

  /**
   * Show action sheet to choose between camera and gallery
   */
  static async promptForPhoto(options: CameraOptions = {}): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing !== undefined ? options.allowEditing : true,
        resultType: options.resultType || CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Will prompt user to choose camera or gallery
        width: options.width,
        height: options.height,
      });

      return image.dataUrl || image.webPath || '';
    } catch (error) {
      console.error('Error getting photo:', error);
      throw new Error('Failed to get photo');
    }
  }

  /**
   * Fallback to file input for web browsers
   */
  static async useFileInput(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }

  /**
   * Smart photo capture that works on all platforms
   */
  static async capturePhoto(options: CameraOptions = {}): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      // Native mobile - use Capacitor Camera
      return this.promptForPhoto(options);
    } else {
      // Web - fallback to file input
      return this.useFileInput();
    }
  }
}
