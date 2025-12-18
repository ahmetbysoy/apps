import { useState, useEffect } from 'react';

export const useShake = (threshold = 15) => {
  const [shakeIntensity, setShakeIntensity] = useState(0);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastUpdate = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const { x, y, z } = current;
      const curTime = Date.now();

      if ((curTime - lastUpdate) > 100) {
        const diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        if (x !== null && y !== null && z !== null) {
          const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

          if (speed > threshold) {
            // Normalize speed to a 0-100 scale roughly
            setShakeIntensity(Math.min(100, speed));
          } else {
            setShakeIntensity(prev => Math.max(0, prev - 5)); // Decay
          }

          lastX = x;
          lastY = y;
          lastZ = z;
        }
      }
    };

    // Check if permission is needed (iOS 13+)
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const response = await (DeviceMotionEvent as any).requestPermission();
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (e) {
          console.error("Shake permission denied", e);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [threshold]);

  return shakeIntensity;
};