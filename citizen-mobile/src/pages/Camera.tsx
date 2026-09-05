import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cameraService } from '../services/cameraService';
import {
  RefreshCw,
  X,
  Check,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';

export const CameraPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setIsInitializing(true);
      setCameraError(null);
      try {
        const mediaStream = await cameraService.getMediaStream(facingMode);
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera initialization error:', err);
        setCameraError(t('report.cameraErrorDesc'));
      } finally {
        setIsInitializing(false);
      }
    };

    if (!capturedPhoto) {
      startCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, capturedPhoto, t]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      try {
        const photoData = cameraService.captureFrame(videoRef.current);
        setCapturedPhoto(photoData);
        stopStream();
      } catch (err) {
        console.error('Capture failed:', err);
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleUsePhoto = () => {
    if (capturedPhoto) {
      sessionStorage.setItem('swachhlens_captured_photo', capturedPhoto);
      navigate('/report');
    }
  };

  const handleToggleFacingMode = () => {
    stopStream();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleGalleryFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      cameraService.compressImageFile(file).then((base64) => {
        sessionStorage.setItem('swachhlens_captured_photo', base64);
        navigate('/report');
      });
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-black text-white flex flex-col justify-between overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleGalleryFallback}
        className="hidden"
      />

      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => {
            stopStream();
            navigate('/report');
          }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          aria-label="Close Camera"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-white/90">
          {capturedPhoto ? 'Review Photo' : 'Live Camera'}
        </span>

        {!capturedPhoto && !cameraError && (
          <button
            onClick={handleToggleFacingMode}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
            aria-label="Switch Camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        {capturedPhoto ? (
          <img
            src={capturedPhoto}
            alt="Captured Preview"
            className="w-full h-full object-cover"
          />
        ) : cameraError ? (
          <div className="p-6 text-center max-w-xs space-y-4 bg-stone-900/90 rounded-3xl border border-stone-700 m-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">
                {t('report.cameraErrorTitle')}
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                {cameraError}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-floating transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{t('report.chooseGallery')}</span>
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="relative z-20 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-around safe-bottom">
        {capturedPhoto ? (
          <div className="w-full flex items-center justify-between gap-4 max-w-xs mx-auto">
            <button
              onClick={handleRetake}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 active:scale-95 transition-transform"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('report.replaceMedia')}</span>
            </button>
            <button
              onClick={handleUsePhoto}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#168A5B] hover:bg-[#13754D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-floating active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('report.usePhoto')}</span>
            </button>
          </div>
        ) : !cameraError ? (
          <div className="flex items-center justify-center gap-8 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 active:scale-95"
              aria-label="Gallery"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleCapture}
              disabled={isInitializing}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform shadow-2xl"
              aria-label="Capture Photo"
            >
              <div className="w-full h-full rounded-full bg-white group-hover:bg-[#168A5B] transition-colors" />
            </button>

            <div className="w-12 h-12" />
          </div>
        ) : null}
      </div>
    </div>
  );
};
