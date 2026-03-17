import React, { useEffect, useRef } from 'react';
import { ShipShape } from '../types';

interface ShipPreviewProps {
  shape: ShipShape;
  color: string;
}

export const ShipPreview: React.FC<ShipPreviewProps> = ({ shape, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const width = 40;
      const height = 50;
      const t = Date.now() * 0.001;

      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Slight floating animation
      ctx.translate(0, Math.sin(t * 2) * 5);
      ctx.rotate(Math.sin(t) * 0.1);

      // Glow effect
      ctx.shadowBlur = 20 + Math.sin(t * 4) * 5;
      ctx.shadowColor = color;

      // Player Body
      ctx.fillStyle = color;
      ctx.beginPath();
      
      if (shape === 'VANGUARD') {
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(-width / 2, height / 2);
        ctx.lineTo(width / 2, height / 2);
      } else if (shape === 'PHANTOM') {
        ctx.moveTo(0, -height / 2 - 10);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-width / 2, height / 2);
        ctx.lineTo(0, height / 2 - 5);
        ctx.lineTo(width / 2, height / 2);
        ctx.lineTo(10, 0);
      } else if (shape === 'TITAN') {
        ctx.moveTo(-10, -height / 2);
        ctx.lineTo(10, -height / 2);
        ctx.lineTo(width / 2, 0);
        ctx.lineTo(width / 2, height / 2);
        ctx.lineTo(-width / 2, height / 2);
        ctx.lineTo(-width / 2, 0);
      } else if (shape === 'STRIKER') {
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-width / 2, height / 2);
        ctx.lineTo(-10, height / 2 - 10);
        ctx.lineTo(0, height / 2);
        ctx.lineTo(10, height / 2 - 10);
        ctx.lineTo(width / 2, height / 2);
        ctx.lineTo(5, 0);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Detail lines
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Cockpit
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -5, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Engines
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ffaa00';
      ctx.fillStyle = '#ffaa00';
      const engineH = 15 + Math.random() * 10;
      if (shape === 'TITAN') {
        ctx.fillRect(-20, height / 2, 8, engineH);
        ctx.fillRect(12, height / 2, 8, engineH);
      } else {
        ctx.fillRect(-12, height / 2, 6, engineH);
        ctx.fillRect(6, height / 2, 6, engineH);
      }

      ctx.restore();
    };

    let animationId: number;
    const render = () => {
      draw();
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationId);
  }, [shape, color]);

  return (
    <div className="relative w-32 h-32 bg-white/5 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-50" />
      <canvas ref={canvasRef} width={128} height={128} className="relative z-10" />
    </div>
  );
};
