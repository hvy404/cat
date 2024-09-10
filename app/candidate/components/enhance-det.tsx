import { useState, useEffect, useCallback, useRef } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface EnhancedBotDetectionResult {
  isLikelyBot: boolean;
  deviceFingerprint: string;
  mouseMovements: number;
  keypresses: number;
}

export const useEnhancedDetection = (): EnhancedBotDetectionResult => {
  const [isLikelyBot, setIsLikelyBot] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const formStartTime = useRef(Date.now());
  const mouseMovementsRef = useRef(0);
  const keypressesRef = useRef(0);

  const handleMouseMove = useCallback(() => {
    mouseMovementsRef.current += 1;
  }, []);

  const handleKeyPress = useCallback(() => {
    keypressesRef.current += 1;
  }, []);

  useEffect(() => {
    const generateFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceFingerprint(result.visitorId);
    };

    generateFingerprint();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);

    const checkBotBehavior = setInterval(() => {
      const timeElapsed = (Date.now() - formStartTime.current) / 1000;
      const isBehaviorHuman = timeElapsed > 3 && mouseMovementsRef.current > 5 && keypressesRef.current > 2;
      setIsLikelyBot(!isBehaviorHuman);
    }, 1000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      clearInterval(checkBotBehavior);
    };
  }, [handleMouseMove, handleKeyPress]);

  return { 
    isLikelyBot, 
    deviceFingerprint, 
    mouseMovements: mouseMovementsRef.current, 
    keypresses: keypressesRef.current 
  };
};
