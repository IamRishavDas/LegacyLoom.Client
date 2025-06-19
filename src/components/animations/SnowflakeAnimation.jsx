import { useState, useEffect } from 'react';
import { Snowflake } from 'lucide-react';

function SnowflakeAnimation({ 
  count = 12, 
  opacity = 0.15, 
  color = 'text-stone-400', 
  minSize = 0.4, 
  maxSize = 1.2, 
  minDuration = 4, 
  maxDuration = 8,
  className = '',
  zIndex = 0
}) {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const generateSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < count; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 8,
          size: Math.random() * (maxSize - minSize) + minSize,
          duration: Math.random() * (maxDuration - minDuration) + minDuration,
          rotationSpeed: Math.random() * 360 + 180, // 180-540 degrees
          horizontalMovement: Math.random() * 30 - 15, // -15 to 15px
        });
      }
      setSnowflakes(flakes);
    };

    generateSnowflakes();
  }, [count, minSize, maxSize, minDuration, maxDuration]);

  return (
    <>
      {/* Snowflakes Container */}
      <div 
        className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
        style={{ zIndex }}
      >
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute"
            style={{
              left: `${flake.left}%`,
              opacity: opacity,
              animationDelay: `${flake.animationDelay}s`,
              animation: `snowfall-${flake.id} ${flake.duration}s linear infinite`,
            }}
          >
            <Snowflake 
              className={color}
              size={flake.size * 24}
            />
          </div>
        ))}
      </div>

      {/* Dynamic CSS Animations */}
      <style jsx="true">{`
        ${snowflakes.map((flake) => `
          @keyframes snowfall-${flake.id} {
            0% {
              transform: translateY(-100vh) translateX(0px) rotate(0deg);
            }
            25% {
              transform: translateY(25vh) translateX(${flake.horizontalMovement * 0.5}px) rotate(${flake.rotationSpeed * 0.25}deg);
            }
            50% {
              transform: translateY(50vh) translateX(${flake.horizontalMovement}px) rotate(${flake.rotationSpeed * 0.5}deg);
            }
            75% {
              transform: translateY(75vh) translateX(${flake.horizontalMovement * 0.5}px) rotate(${flake.rotationSpeed * 0.75}deg);
            }
            100% {
              transform: translateY(100vh) translateX(0px) rotate(${flake.rotationSpeed}deg);
            }
          }
        `).join('\n')}
      `}</style>
    </>
  );
}

export const SnowflakePresets = {
  // Subtle background animation for home page
  subtle: {
    count: 14,
    opacity: 0.3,
    color: 'text-stone-400',
    minSize: 0.3,
    maxSize: 1,
    minDuration: 5,
    maxDuration: 12,
  },
  
  // More visible for 404 page
  prominent: {
    count: 12,
    opacity: 0.2,
    color: 'text-stone-400',
    minSize: 0.4,
    maxSize: 1.2,
    minDuration: 4,
    maxDuration: 8,
  },
  
  // Dense animation for special occasions
  dense: {
    count: 20,
    opacity: 0.12,
    color: 'text-stone-350',
    minSize: 0.2,
    maxSize: 1.0,
    minDuration: 5,
    maxDuration: 10,
  },
  
  // Minimal for performance-sensitive areas
  minimal: {
    count: 5,
    opacity: 0.06,
    color: 'text-stone-300',
    minSize: 0.4,
    maxSize: 0.9,
    minDuration: 8,
    maxDuration: 15,
  }
};

export default SnowflakeAnimation;