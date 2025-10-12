import { useState } from "react";

export default function CardPackAnimation({
  prizes,
  tierColors = {},
  tierOrder = [],
  effectTierCount = 3,
  showLogo = false,
  logoUrl = null,
  customPackColor = null,
  customPackColorEnd = null,
  customPackGradientType = 'linear',
  customPackGradientAngle = 135,
  customPackImage = null,
  animationStyle = 'fade',
  fontWeight = 400,
  letterSpacing = 'normal',
  onComplete,
  onSkip
}) {
  const [stage, setStage] = useState('pack'); // 'pack', 'cards', 'complete'
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());

  const cardCount = prizes.length;
  
  // Get pack color or image with gradient support
  const color1 = customPackColor || '#9333ea';
  const color2 = customPackColorEnd || '#4f46e5';
  const gradientType = customPackGradientType || 'linear';
  const gradientAngle = customPackGradientAngle || 135;
  
  // Build gradient based on type
  const packColor = (() => {
    if (gradientType === 'linear') {
      return `linear-gradient(${gradientAngle}deg, ${color1} 0%, ${color2} 100%)`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle at center, ${color1} 0%, ${color2} 100%)`;
    } else if (gradientType === 'conic') {
      return `conic-gradient(from 0deg at center, ${color1} 0%, ${color2} 50%, ${color1} 100%)`;
    }
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  })();
  
  const hasCustomImage = Boolean(customPackImage);
  
  // Determine if current prize should have special effects
  const isTopTierPrize = (prize) => {
    if (!prize?.tier || !tierOrder.length || effectTierCount <= 0) return false;
    const tierUpper = String(prize.tier).toUpperCase();
    const tierIndex = tierOrder.findIndex(t => String(t).toUpperCase() === tierUpper);
    return tierIndex >= 0 && tierIndex < effectTierCount;
  };
  
  // Convert letter spacing preset to CSS value
  const getLetterSpacingValue = () => {
    const spacingMap = {
      'tighter': '-0.05em',
      'tight': '-0.025em',
      'normal': '0',
      'wide': '0.025em',
      'wider': '0.05em',
      'widest': '0.1em'
    };
    return spacingMap[letterSpacing] || '0';
  };
  
  // Text style object for typography
  const textStyle = {
    fontWeight,
    letterSpacing: getLetterSpacingValue()
  };
  
  // Get animation class based on style
  const getAnimationClass = () => {
    switch(animationStyle) {
      case 'slide':
        return 'animate-slide-in';
      case 'scale':
        return 'animate-scale-in';
      case 'bounce':
        return 'animate-bounce-in';
      case 'fade':
      default:
        return 'animate-fade-in';
    }
  };

  const handleOpenPack = () => {
    setStage('cards');
  };

  const handleFlipCard = () => {
    if (isFlipping || flippedCards.has(currentCardIndex)) return;
    
    setIsFlipping(true);
    setFlippedCards(prev => new Set([...prev, currentCardIndex]));
    
    setTimeout(() => {
      setIsFlipping(false);
      
      // After 1.5 seconds, move to next card or complete
      setTimeout(() => {
        if (currentCardIndex < cardCount - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
        } else {
          setStage('complete');
          setTimeout(() => {
            onComplete?.();
          }, 1000);
        }
      }, 1500);
    }, 600);
  };

  const getTierColor = (tier) => {
    const tierUpper = String(tier || '').toUpperCase();
    const colorValue = tierColors[tierUpper];
    
    if (!colorValue) return '#6366f1'; // default blue
    
    // If it's a hex color
    if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
      return colorValue;
    }
    
    // If it's a tailwind color name
    const colorMap = {
      'amber': '#f59e0b',
      'sky': '#0ea5e9',
      'emerald': '#10b981',
      'purple': '#a855f7',
      'rose': '#f43f5e',
      'lime': '#84cc16',
      'teal': '#14b8a6',
      'cyan': '#06b6d4',
      'violet': '#8b5cf6',
      'fuchsia': '#d946ef'
    };
    
    return colorMap[colorValue] || '#6366f1';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4">
      {/* Skip Button */}
      {onSkip && stage !== 'complete' && (
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold transition-all border border-slate-700 hover:border-slate-600 shadow-lg z-10"
        >
          Skip Animation ➤
        </button>
      )}

      {/* Pack Stage */}
      {stage === 'pack' && (
        <div className="animate-scale-in">
          <div className="relative" style={{ width: '350px', height: '500px' }}>
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
              style={{ background: packColor }}
            />
            
            {/* Front Pack */}
            <div 
              className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
              style={hasCustomImage ? {} : { background: packColor }}
              onClick={handleOpenPack}
            >
              {/* Custom Image Background */}
              {hasCustomImage && (
                <img 
                  src={customPackImage} 
                  alt="Card pack design" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              {/* Shine effect */}
              <div 
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />
              
              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                {/* Card count badge */}
                <div className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-yellow-400 text-yellow-900 font-bold text-base shadow-lg border-2 border-yellow-600">
                  ×{cardCount}
                </div>

                {/* Logo */}
                {showLogo && logoUrl && (
                  <div className="w-48 h-48 mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {!showLogo || !logoUrl ? (
                  <div className="w-48 h-48 mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                    <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                ) : null}

                {/* Title */}
                <h2 
                  className="text-5xl font-bold text-center drop-shadow-lg" 
                  style={{ 
                    textShadow: '0 0 20px rgba(255,255,255,0.5)',
                    ...textStyle
                  }}
                >
                  Prize Pack
                </h2>
                <p className="text-2xl text-white font-semibold mt-3 drop-shadow-md" style={textStyle}>
                  {cardCount} {cardCount === 1 ? 'Card' : 'Cards'}
                </p>
                
                <button
                  onClick={handleOpenPack}
                  className="mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xl font-bold rounded-2xl border-4 border-white/40 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                >
                  👆 Tap to Open
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Stage */}
      {stage === 'cards' && (
        <div className={getAnimationClass()}>
          <div className="text-center mb-4">
            <p className="text-white text-lg font-semibold" style={textStyle}>
              Card {currentCardIndex + 1} of {cardCount}
            </p>
            <p className="text-slate-400 text-sm mt-1" style={{ letterSpacing: getLetterSpacingValue() }}>
              👆 Tap card to reveal your prize
            </p>
          </div>
          
          <div className="relative" style={{ width: '350px', height: '500px', perspective: '1000px' }}>
            {/* Card */}
            <div
              className={`relative w-full h-full cursor-pointer transition-transform duration-600 ${
                flippedCards.has(currentCardIndex) ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: flippedCards.has(currentCardIndex) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
              onClick={handleFlipCard}
            >
              {/* Card Back */}
              <div 
                className="absolute inset-0 rounded-3xl shadow-2xl flex items-center justify-center text-white text-6xl font-bold overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  background: hasCustomImage ? 'transparent' : packColor,
                }}
              >
                {/* Custom Image Background for card back */}
                {hasCustomImage && (
                  <img 
                    src={customPackImage} 
                    alt="Card back design" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                
                {/* Logo on card back */}
                {showLogo && logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className="relative text-center z-10">
                  <div className="text-8xl mb-4">?</div>
                  <p className="text-2xl font-semibold opacity-80 drop-shadow-lg">Tap to Reveal</p>
                </div>
              </div>

              {/* Card Front (Prize) */}
              <div 
                className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: flippedCards.has(currentCardIndex) 
                    ? getTierColor(prizes[currentCardIndex]?.tier)
                    : '#1e293b', // Default slate color for unflipped cards
                }}
              >
                <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                  {/* Only show prize details if card is flipped */}
                  {flippedCards.has(currentCardIndex) ? (
                    <>
                      {/* Tier Badge */}
                      <div 
                        className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm font-bold text-xl border-2 border-white/30"
                        style={textStyle}
                      >
                        Tier {String(prizes[currentCardIndex]?.tier || '?').toUpperCase()}
                      </div>
                      
                      {/* Prize Name */}
                      <div className="text-center relative z-10">
                        <h3 
                          className="text-4xl font-bold mb-4 drop-shadow-lg" 
                          style={{ 
                            textShadow: '0 0 20px rgba(0,0,0,0.5)',
                            ...textStyle
                          }}
                        >
                          {prizes[currentCardIndex]?.prize_name || 'Prize'}
                        </h3>
                        
                        {prizes[currentCardIndex]?.sku && (
                          <p className="text-xl text-white/80 font-semibold" style={textStyle}>
                            {prizes[currentCardIndex].sku}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    // Show placeholder for unflipped card
                    <div className="text-center relative z-10">
                      <div className="text-8xl mb-4">?</div>
                      <p className="text-2xl font-semibold opacity-60">Hidden</p>
                    </div>
                  )}
                  
                  {/* Special effects for top-tier prizes */}
                  {isTopTierPrize(prizes[currentCardIndex]) && flippedCards.has(currentCardIndex) && (
                    <>
                      {/* Particle effects */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="particle"
                            style={{
                              position: 'absolute',
                              width: `${Math.random() * 8 + 4}px`,
                              height: `${Math.random() * 8 + 4}px`,
                              background: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
                              borderRadius: '50%',
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
                              animationDelay: `${Math.random() * 2}s`,
                              opacity: 0.7,
                              boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Glow effect */}
                      <div 
                        className="absolute inset-0 pointer-events-none animate-pulse"
                        style={{
                          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)',
                          animation: 'glow 2s ease-in-out infinite',
                        }}
                      />
                    </>
                  )}
                  
                  {/* Standard sparkle effect */}
                  {!isTopTierPrize(prizes[currentCardIndex]) && (
                    <div className="absolute inset-0 pointer-events-none animate-pulse">
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 70%)',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Stage - Show Back Pack */}
      {stage === 'complete' && (
        <div className="animate-scale-in">
          <div className="relative" style={{ width: '350px', height: '500px' }}>
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
              style={{ background: packColor }}
            />
            
            {/* Back Pack */}
            <div 
              className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden"
              style={hasCustomImage ? {} : { background: packColor }}
            >
              {/* Custom Image Background */}
              {hasCustomImage && (
                <img 
                  src={customPackImage} 
                  alt="Card pack design" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-white z-10">
                <div className="text-6xl mb-6">✨</div>
                <h2 className="text-4xl font-bold text-center mb-4 drop-shadow-lg" style={textStyle}>All Cards Revealed!</h2>
                <p className="text-xl text-center opacity-90 drop-shadow-md" style={textStyle}>
                  You've opened all {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          50% {
            transform: translateY(-100px) translateX(20px) scale(1.2);
            opacity: 0.5;
          }
          90% {
            opacity: 0.3;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            opacity: 0.4;
            filter: blur(20px);
          }
          50% {
            opacity: 0.7;
            filter: blur(30px);
          }
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
