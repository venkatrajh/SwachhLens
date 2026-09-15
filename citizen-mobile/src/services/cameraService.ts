/**
 * Service for camera stream acquisition, canvas frame capture, and client-side image compression.
 */
export const cameraService = {
  /**
   * Acquire a user or environment camera video stream via MediaDevices API.
   *
   * @param facingMode - Preferred camera facing mode ('environment' for rear or 'user' for front-facing).
   * @returns Promise resolving to the active MediaStream.
   * @throws Error if the browser does not support getUserMedia or permission is denied.
   */
  async getMediaStream(facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API is not supported on this device/browser');
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch {
      // Fallback without ideal constraints
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }
  },

  /**
   * Capture a snapshot frame from an active HTMLVideoElement onto an in-memory canvas.
   *
   * @param videoElement - Active HTMLVideoElement currently streaming camera feed.
   * @returns JPEG base64 data URI string.
   * @throws Error if the canvas 2D rendering context is unavailable.
   */
  captureFrame(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    }
    throw new Error('Could not capture frame from video element');
  },

  /**
   * Resize and compress an uploaded image File client-side to constrain payload size.
   *
   * @param file - Raw image File object from file picker.
   * @param maxWidth - Maximum permissible width in pixels (default 1200).
   * @param maxHeight - Maximum permissible height in pixels (default 1200).
   * @param quality - JPEG encoding quality between 0.0 and 1.0 (default 0.85).
   * @returns Promise resolving to the compressed JPEG base64 data URI.
   */
  compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
