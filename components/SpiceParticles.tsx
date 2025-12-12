import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface SpiceParticlesProps {
    isNight: boolean;
}

export const SpiceParticles: React.FC<SpiceParticlesProps> = ({ isNight }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Earthy spice colors for Day, Glowing Gold/White for Night
    const dayColors = ['#A0522D', '#CD853F', '#8B4513', '#D2691E']; 
    const nightColors = ['#FCD34D', '#FFFFFF', '#FDBA74', '#818CF8']; 

    const colors = isNight ? nightColors : dayColors;

    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, [isNight]);

  return (
    <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${isNight ? 'opacity-80 blur-[1px]' : 'opacity-60'}`}
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: isNight ? `0 0 ${p.size * 2}px ${p.color}` : 'none'
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
            opacity: isNight ? [0.4, 1, 0.4] : 0.6
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};