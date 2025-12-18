import React, { useRef, useEffect, useState } from 'react';
import { Modal } from './Modal';
import { feedbackService } from '../services/feedbackService';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setScanning(true);
      setProgress(0);
      setLocked(false);
      setError(null);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  // Scanning Simulation
  useEffect(() => {
    if (!scanning || !isOpen || error) return;

    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setScanning(false);
                setLocked(true);
                feedbackService.playSuccess();
                return 100;
            }
            // Random fluctuations
            if (Math.random() > 0.7) return prev + 10;
            return prev + 1;
        });
    }, 50);

    return () => clearInterval(interval);
  }, [scanning, isOpen, error]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Kamera erişimi reddedildi veya cihazda kamera yok.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleExtract = () => {
      onScanComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex flex-col items-center justify-center animate-fade-in">
        <div className="absolute top-4 right-4 z-50">
            <button onClick={onClose} className="text-white text-xl font-bold bg-black/50 p-2 rounded-full w-10 h-10 border border-gray-500">✕</button>
        </div>

        {error ? (
            <div className="text-red-500 text-center p-8 border border-red-500 rounded bg-red-900/20 max-w-xs">
                <div className="text-4xl mb-4">🚫</div>
                <h3 className="font-bold mb-2">SİNYAL YOK</h3>
                <p className="text-sm">{error}</p>
                <button onClick={onClose} className="mt-6 bg-red-600 px-6 py-2 rounded text-white font-bold">KAPAT</button>
            </div>
        ) : (
            <div className="relative w-full h-full max-w-md bg-black flex flex-col">
                {/* Camera Feed */}
                <div className="relative flex-1 overflow-hidden bg-gray-900">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    
                    {/* Cyberpunk HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                        
                        {/* Corners */}
                        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-green-500"></div>
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-green-500"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-green-500"></div>
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-green-500"></div>

                        {/* Center Target */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-green-500/50 rounded-full flex items-center justify-center transition-all duration-300 ${locked ? 'border-red-500 bg-red-500/10 scale-90' : 'animate-pulse'}`}>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>

                        {/* Scanning Line */}
                        {!locked && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_10px_#0f0] animate-[slide-up_2s_linear_infinite] opacity-50"></div>
                        )}
                        
                        {/* Status Text */}
                        <div className="absolute top-1/2 left-4 text-xs font-mono text-green-500 space-y-1">
                            <div>ISO: AUTO</div>
                            <div>SHUTTER: 1/60</div>
                            <div>SIGNAL: {Math.floor(progress)}%</div>
                            <div>ENC: {locked ? 'DECRYPTED' : 'SEARCHING...'}</div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="h-48 bg-black border-t border-gray-800 p-6 flex flex-col items-center justify-center">
                    <h3 className="text-green-500 font-mono font-bold text-lg mb-2 animate-pulse">
                        {locked ? 'VERİ PAKETİ BULUNDU' : 'ORTAM TARANIYOR...'}
                    </h3>
                    
                    <div className="w-full bg-gray-800 h-2 rounded-full mb-6 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-75 ${locked ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {locked && (
                        <button 
                            onClick={handleExtract}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xl rounded clip-path-polygon shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
                        >
                            ÇIKART
                        </button>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};