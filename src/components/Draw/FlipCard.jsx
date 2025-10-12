import { useState, useEffect } from 'react';
import { tierChipClass, getTierColorHex } from '../../utils/tierColors.js';

export default function FlipCard({ 
  prize, 
  tierColors, 
  delay = 0, 
  isTopTier = false,
  showLogo = false,
  logoUrl = null,
  onFlipComplete 
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show card after delay (staggered appearance)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);
  
  // Handle manual flip
  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      if (isTopTier) {
        setShowParticles(true);
      }
      if (onFlipComplete) {
        setTimeout(() => onFlipComplete(), 600);
      }
    }
  };

  const tier = String(prize.tier || '?').toUpperCase();
  const tierHex = getTierColorHex(tier, tierColors);
  const isCustomHex = tierColors?.[tier]?.startsWith?.('#');

  // Don't render until visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative perspective-1000">
      {/* Particles for top tier */}
      {showParticles && isTopTier && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-particle"
              style={{
                background: `linear-gradient(135deg, ${tierHex}, gold)`,
                left: '50%',
                top: '50%',
                animation: `particle-burst 1s ease-out ${i * 0.05}s forwards`,
                '--tx': `${Math.cos((i / 12) * Math.PI * 2) * 100}px`,
                '--ty': `${Math.sin((i / 12) * Math.PI * 2) * 100}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Card container with flip animation */}
      <div
        onClick={handleFlip}
        className={`relative w-full h-64 transition-transform duration-600 preserve-3d ${
          isFlipped ? 'rotate-y-180' : 'cursor-pointer hover:scale-105'
        } ${
          !isFlipped ? 'animate-bounce-subtle' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back (shown initially) */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 flex flex-col items-center justify-center shadow-2xl transition-all"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse flex items-center justify-center overflow-hidden">
            {showLogo && logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </div>
          <div className="text-lg font-bold text-slate-400 uppercase tracking-wider">
            Prize Card
          </div>
          <div className="mt-2 text-xs text-slate-500 animate-pulse">
            {isFlipped ? '' : '👆 Click to flip'}
          </div>
        </div>

        {/* Card Front (revealed after flip) */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 p-6 flex flex-col items-center justify-center shadow-2xl rotate-y-180 ${
            isTopTier ? 'animate-glow-pulse' : ''
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: tierHex,
            borderColor: isCustomHex ? tierHex : undefined,
            boxShadow: isTopTier
              ? `0 0 30px ${tierHex}80, 0 0 60px ${tierHex}40`
              : undefined,
          }}
        >
          {/* Top tier badge */}
          {isTopTier && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-bold text-white shadow-lg animate-bounce">
              ⭐ RARE
            </div>
          )}

          {/* Tier badge */}
          <div className="mb-4">
            <span
              className={`${tierChipClass(tier, tierColors)} text-2xl font-bold px-6 py-2 ${
                isTopTier ? 'animate-pulse' : ''
              }`}
              style={isCustomHex ? { backgroundColor: tierHex, borderColor: tierHex } : undefined}
            >
              {tier}
            </span>
          </div>

          {/* Prize name */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {prize.prize_name || 'Unknown Prize'}
            </h3>
            {prize.sku && (
              <p className="text-sm text-slate-400 font-mono">
                SKU: {prize.sku}
              </p>
            )}
          </div>

          {/* Decorative elements for top tier */}
          {isTopTier && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes particle-burst {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        @keyframes glow-pulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
