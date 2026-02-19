import { useEffect, useState } from 'react';

const FRAMES = ['◐', '◓', '◑', '◒'];

export function useSpinnerFrames(): string {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((previousIndex) => (previousIndex + 1) % FRAMES.length);
    }, 120);

    return () => clearInterval(timer);
  }, []);

  return FRAMES[frameIndex];
}
