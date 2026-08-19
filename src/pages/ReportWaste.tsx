import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { LocationCard } from '../components/LocationCard';
import { locationService } from '../services/locationService';
import { cameraService } from '../services/cameraService';
import type { LocationData } from '../types/report';
import {
  Camera,
  Image as ImageIcon,
  Video,
  Clock,
  Send,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

export const ReportWaste: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(true);

  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimestamp(new Date().toISOString());
    captureLocation();

    const pendingCameraPhoto = sessionStorage.getItem('swachhlens_captured_photo');
    if (pendingCameraPhoto) {
      setSelectedImage(pendingCameraPhoto);
      sessionStorage.removeItem('swachhlens_captured_photo');
    }
  }, []);

  const captureLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
    } catch (err: any) {
      console.warn('Using controlled fallback location for demo:', err);
      const mockLoc = locationService.getMockLocation();
      setLocation(mockLoc);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await cameraService.compressImageFile(file);
        setSelectedImage(compressedBase64);
        setSelectedVideo(null);
        setMediaError(null);
      } catch (err) {
        console.error('Failed to process image:', err);
        setMediaError('Could not process the selected image. Please try again.');
      }
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedVideo(url);
      setSelectedImage(null);
      setMediaError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage && !selectedVideo) {
      setMediaError(t('report.mediaRequired'));
      return;
    }

    const finalLocation = location || locationService.getMockLocation();
    const finalTimestamp = new Date().toISOString();

    const reportPayload = {
      image: selectedImage || undefined,
      video: selectedVideo || undefined,
      latitude: finalLocation.latitude,
      longitude: finalLocation.longitude,
      timestamp: finalTimestamp,
      description: description.trim() || undefined,
    };

    sessionStorage.setItem('swachhlens_pending_report', JSON.stringify(reportPayload));
    navigate('/analyzing');
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#F7FAF8] flex flex-col">
      <TopHeader
        title={t('report.title')}
        subtitle={t('report.subtitle')}
        showBack={true}
      />
      <NatureBackground />

      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleGalleryChange}
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        capture="environment"
        onChange={handleVideoChange}
        className="hidden"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
              Waste Evidence (Photo / Video) *
            </span>

            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border-2 border-[#168A5B] shadow-md group">
                <img
                  src={selectedImage}
                  alt="Captured Waste"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/camera')}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/90 backdrop-blur-md text-[#17211B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('report.replaceMedia')}</span>
                  </button>
                </div>
              </div>
            ) : selectedVideo ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border-2 border-[#168A5B] shadow-md">
                <video
                  src={selectedVideo}
                  controls
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/camera')}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#EAF6EF] border-2 border-dashed border-[#168A5B]/50 flex flex-col items-center justify-center gap-2 text-center shadow-xs active:scale-95 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#EAF6EF] text-[#168A5B] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-[#17211B] leading-tight">
                    {t('report.takePhoto')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#F7FAF8] border border-[#DCE7E1] flex flex-col items-center justify-center gap-2 text-center shadow-xs active:scale-95 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-[#17211B] leading-tight">
                    {t('report.chooseGallery')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#F7FAF8] border border-[#DCE7E1] flex flex-col items-center justify-center gap-2 text-center shadow-xs active:scale-95 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-[#17211B] leading-tight">
                    {t('report.addVideo')}
                  </span>
                </button>
              </div>
            )}

            {mediaError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{mediaError}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
              GPS Location (Auto-captured)
            </span>
            <LocationCard
              location={location}
              error={locationError}
              isLoading={isDetectingLocation}
              onRetry={captureLocation}
            />
          </div>

          <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7E1] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#64736A]">
              <Clock className="w-4 h-4 text-[#168A5B]" />
              <span className="font-semibold">{t('report.timestampAuto')}:</span>
            </div>
            <span className="font-mono text-[#17211B] font-bold text-[11px]">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211B] uppercase tracking-wider block">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descriptionPlaceholder')}
              className="w-full p-3 rounded-xl bg-white border border-[#DCE7E1] text-sm text-[#17211B] placeholder-[#64736A]/60 focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 focus:border-[#168A5B] shadow-xs resize-none"
            />
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-[#168A5B] hover:bg-[#13754D] active:scale-[0.98] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-floating transition-all"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span>{t('report.submitReport')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
