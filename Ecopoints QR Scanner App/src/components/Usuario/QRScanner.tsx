import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Zap, ZapOff } from 'lucide-react';

type Transaction = {
  type: 'scan';
  points: number;
  description: string;
  location?: string;
};

interface QRScannerProps {
  onScanSuccess: (transaction: Transaction) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isFlashOn, setIsFlashOn] = useState(false);

  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    const result = detectedCodes[0]?.rawValue;
    if (!result) return;

    console.log('QR Decoded:', result);
    try {
      const parsedResult = JSON.parse(result);
      if (parsedResult.type === 'ecopoint_qr' && parsedResult.id && parsedResult.location && parsedResult.points) {
        onScanSuccess({
          type: 'scan',
          points: parsedResult.points,
          description: `Reciclaje en ${parsedResult.location}`,
          location: parsedResult.location,
        });
      }
    } catch (error) {
      console.error("Error parsing QR code:", error);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      <Scanner
        onScan={handleScan}
        onError={(error: any) => console.error(error?.message)}
        scanDelay={300}
        constraints={{
          facingMode: 'environment',
          torch: isFlashOn,
        } as any}
        styles={{
          container: {
            width: '100%',
            height: '100%',
          },
        }}
      />
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsFlashOn(!isFlashOn)}
          className="p-3 rounded-full bg-gray-800 bg-opacity-50 text-white"
        >
          {isFlashOn ? <ZapOff size={24} /> : <Zap size={24} />}
        </button>
      </div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 p-4 rounded-lg bg-gray-800 bg-opacity-50">
        <p className="text-white text-center text-lg">
          Apunta la cámara al código QR
        </p>
      </div>
    </div>
  );
}
