import { useState, useEffect } from 'react';
import FlipCard from './FlipCard.jsx';

export default function CardPackAnimation({ 
  prizes, 
  tierColors, 
  tierOrder = [],
  effectTierCount = 3,
  showLogo = false,
  customPackImage = null,
  logoUrl = null,
  onComplete,
  onSkip
}) {
  const [stage, setStage] = useState('pack'); // 'pack' (includes peeling), 'revealing'
  const [cardsRevealed, setCardsRevealed] = useState(0);
  const [peelProgress, setPeelProgress] = useState(0); // 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const cardCount = prizes.length;

  // Determine top N tiers based on tier order and effectTierCount
  const topTiers = tierOrder.slice(0, effectTierCount);
  
  // Handle drag start (pack stage)
  const handlePeelStart = (clientY) => {
    if (stage === 'pack') {
      setIsDragging(true);
      setStartY(clientY);
    }
  };
  
  // Handle drag move (pack stage)
  const handlePeelMove = (clientY) => {
    if (isDragging && stage === 'pack') {
      const deltaY = startY - clientY;
      const progress = Math.min(Math.max((deltaY / 200) * 100, 0), 100);
      setPeelProgress(progress);
      
      // Auto-complete if dragged far enough
      if (progress >= 100) {
        completePeel();
      }
    }
  };
  
  // Handle drag end (pack stage)
  const handlePeelEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // If not fully peeled, animate back or complete
      if (peelProgress >= 70) {
        completePeel();
      } else {
        // Snap back
        setPeelProgress(0);
      }
    }
  };
  
  // Complete the peel and show cards
  const completePeel = () => {
    setPeelProgress(100);
    setIsDragging(false);
    setTimeout(() => {
      setStage('revealing');
    }, 500);
  };

  const handleCardFlipComplete = () => {
    setCardsRevealed(prev => prev + 1);
    // Don't auto-dismiss, wait for user to click Dismiss button
  };
  
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4">
      {/* Skip Button - shown during pack stage */}
      {onSkip && stage === 'pack' && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold transition-all border border-slate-700 hover:border-slate-600 shadow-lg z-10"
        >
          Skip Animation ➤
        </button>
      )}
      {/* Pack Stage (with integrated Pokemon-style opening) */}
      {stage === 'pack' && (
        <div
          className="relative touch-none animate-scale-in"
          style={{ width: '500px', height: '350px' }}
          onMouseDown={(e) => handlePeelStart(e.clientY)}
          onMouseMove={(e) => handlePeelMove(e.clientY)}
          onMouseUp={handlePeelEnd}
          onMouseLeave={handlePeelEnd}
          onTouchStart={(e) => handlePeelStart(e.touches[0].clientY)}
          onTouchMove={(e) => handlePeelMove(e.touches[0].clientY)}
          onTouchEnd={handlePeelEnd}
        >
          {/* Instructions */}
          <div className="absolute -top-16 left-0 right-0 text-center z-10">
            <p className="text-white text-lg font-semibold animate-pulse">
              👆 Drag to tear open the pack
            </p>
          </div>
          
          {/* Glow effect behind pack (revealed as it tears) */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              opacity: peelProgress / 100,
              filter: 'blur(20px)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 animate-pulse" />
          </div>
          
          {/* Pack wrapper (landscape orientation like Pokemon pack) */}
          <div 
            className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden"
            style={{ transform: 'perspective(1000px) rotateY(0deg)' }}
          >
              {/* Custom pack image or gradient background */}
              {customPackImage ? (
                <img 
                  src={customPackImage} 
                  alt="Card pack" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700" />
              )}
              
              {/* Foil shine overlay (holographic effect) */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div 
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Pack content */}
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                {/* Card count badge - top right corner */}
                <div className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-yellow-400 text-yellow-900 font-bold text-base shadow-lg border-2 border-yellow-600">
                  ×{cardCount}
                </div>

                {/* Pack logo/icon */}
                <div className="w-40 h-40 mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {showLogo && logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  )}
                </div>

                {/* Pack title */}
                <h2 className="text-4xl font-bold mb-2 text-center drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                  Prize Pack
                </h2>
                <p className="text-xl text-white font-semibold mb-2 drop-shadow-md">
                  {cardCount} {cardCount === 1 ? 'Card' : 'Cards'}
                </p>
              </div>
              
              {/* Tear effect overlay (splits pack open) */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: peelProgress > 0 
                    ? `polygon(
                        0 0, 
                        ${50 - peelProgress/2}% 0, 
                        ${50 - peelProgress/2}% 100%, 
                        0 100%, 
                        0 0,
                        ${50 + peelProgress/2}% 0,
                        100% 0,
                        100% 100%,
                        ${50 + peelProgress/2}% 100%
                      )`
                    : 'none',
                  transition: 'clip-path 0.1s ease-out',
                }}
              >
                <div className="absolute inset-0 bg-black/50" />
              </div>
            </div>
          
          {/* Progress indicator */}
          <div className="absolute -bottom-20 left-0 right-0">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border-2 border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 transition-all duration-100"
                style={{ 
                  width: `${peelProgress}%`,
                  boxShadow: peelProgress > 50 ? '0 0 10px rgba(251, 146, 60, 0.8)' : 'none',
                }}
              />
            </div>
            <p className="text-center text-white text-sm mt-3 font-semibold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {peelProgress > 0 ? (
                <span>
                  ✨ {Math.round(peelProgress)}% torn open ✨
                </span>
              ) : (
                'Drag up to tear open'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Card Revealing Stage */}
      {stage === 'revealing' && (
        <div className="w-full max-w-7xl animate-fade-in">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Your Prizes!
            </h2>
            <p className="text-slate-400 mb-2">
              {cardsRevealed} / {cardCount} revealed
            </p>
            {cardsRevealed < cardCount && (
              <p className="text-sm text-purple-300 animate-pulse">
                👆 Click cards to flip and reveal your prizes
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto px-2">
            {prizes.map((prize, index) => {
              const tier = String(prize.tier || '?').toUpperCase();
              const isTopTier = topTiers.includes(tier);

              return (
                <div
                  key={index}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <FlipCard
                    prize={prize}
                    tierColors={tierColors}
                    delay={index * 200 + 500}
                    isTopTier={isTopTier}
                    showLogo={showLogo}
                    logoUrl={logoUrl}
                    onFlipComplete={handleCardFlipComplete}
                  />
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-6 text-center animate-fade-in flex flex-col gap-3">
            {/* Dismiss button (only after all cards revealed) */}
            {cardsRevealed >= cardCount && (
              <button
                onClick={onComplete}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                ❌ Dismiss
              </button>
            )}
            
            {/* Skip button (only while cards are unflipped) */}
            {onSkip && cardsRevealed < cardCount && (
              <button
                onClick={handleSkip}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg font-semibold transition-all border border-slate-600"
              >
                Skip to Results ➤
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            transform: translateX(-100%) skewX(-15deg);
          }
          50% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes peel-out {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

         .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
