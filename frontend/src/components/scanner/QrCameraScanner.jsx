import { useEffect, useRef, useState } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import jsQR from "jsqr";

export default function QrCameraScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setLoading(false);
          scanLoop();
        }
      } catch (err) {
        setError("Camera access denied. Please allow permission.");
        setLoading(false);
      }
    };

    const scanLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        frameRef.current = requestAnimationFrame(scanLoop);
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const code = jsQR(
          imageData.data,
          imageData.width,
          imageData.height
        );

        if (code) {
          onScan(code.data);
          return;
        }
      }

      frameRef.current = requestAnimationFrame(scanLoop);
    };

    startCamera();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <span className="font-semibold">Scan QR Code</span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* scanner */}
      <div className="flex-1 flex items-center justify-center px-5">
        {error ? (
          <div className="text-center text-white space-y-3">
            <p className="text-sm text-white/70">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/30 rounded-xl"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}

            <video
              ref={videoRef}
              className="w-full rounded-2xl"
              playsInline
              muted
            />

            <canvas ref={canvasRef} className="hidden" />

            {/* scan frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/60 rounded-2xl" />
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="pb-8 text-center text-white/50 text-xs">
        Point your camera at a QR code
      </div>
    </div>
  );
}