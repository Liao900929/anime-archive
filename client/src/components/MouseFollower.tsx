import { useEffect, useState } from 'react';

/**
 * 滑鼠跟著走的彩色色塊
 * Godly 風格互動效果
 */
export default function MouseFollower() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
  }>>([]);

  const colors = ['#E63946', '#F4D35E', '#1D3557'];

  useEffect(() => {
    let particleId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // 隨機生成色塊粒子
      if (Math.random() > 0.7) {
        const newParticle = {
          id: particleId++,
          x: e.clientX,
          y: e.clientY,
          color: colors[Math.floor(Math.random() * colors.length)],
        };

        setParticles(prev => {
          const updated = [...prev, newParticle];
          // 只保留最近的 10 個粒子
          return updated.slice(-10);
        });

        // 粒子動畫後移除
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="mouse-follower animate-float-mouse"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            '--mouse-x': `${(Math.random() - 0.5) * 100}px`,
            '--mouse-y': `${(Math.random() - 0.5) * 100}px`,
          } as React.CSSProperties}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: particle.color }}
          />
        </div>
      ))}
    </>
  );
}
