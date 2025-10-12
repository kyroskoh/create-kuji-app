import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Group, Rect } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ScratchCard Component
 * Interactive scratch-off card revealing prizes with coin cursor
 */
export default function ScratchCard({ 
  prizeContent, 
  onComplete, 
  width, 
  height,
  surfaceColor = '#c0c0c0',
  enabled = true 
}) {
  const stageRef = useRef(null);
  const scratchLayerRef = useRef(null);
  const contentRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lines, setLines] = useState([]);
  const [surfaceTexture, setSurfaceTexture] = useState(null);
  const [dimensions, setDimensions] = useState({ width: width || 400, height: height || 300 });

  // Measure content dimensions if width/height not provided
  useEffect(() => {
    if (contentRef.current && (!width || !height)) {
      const rect = contentRef.current.getBoundingClientRect();
      setDimensions({
        width: width || rect.width,
        height: height || rect.height
      });
    }
  }, [width, height, prizeContent]);

  // Create metallic scratch surface texture
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');

    // Create metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
    gradient.addColorStop(0, '#b8b8b8');
    gradient.addColorStop(0.25, '#d4d4d4');
    gradient.addColorStop(0.5, '#e8e8e8');
    gradient.addColorStop(0.75, '#d4d4d4');
    gradient.addColorStop(1, '#b8b8b8');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Add noise texture
    const imageData = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 20 - 10;
      data[i] += noise;     // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }
    ctx.putImageData(imageData, 0, 0);

    // Add text overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH HERE', dimensions.width / 2, dimensions.height / 2 - 20);
    ctx.font = '16px Arial';
    ctx.fillText('🪙 Use your mouse to reveal!', dimensions.width / 2, dimensions.height / 2 + 20);

    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = () => setSurfaceTexture(image);
  }, [dimensions.width, dimensions.height]);

  // Calculate scratched percentage
  const calculateScratchedPercentage = () => {
    if (!scratchLayerRef.current) return 0;

    const layer = scratchLayerRef.current;
    const canvas = layer.getCanvas()._canvas;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
    const data = imageData.data;

    let transparentPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparentPixels++; // Alpha channel
    }

    const percentage = (transparentPixels / (dimensions.width * dimensions.height)) * 100;
    return percentage;
  };

  // Handle mouse/touch events
  const handleMouseDown = (e) => {
    if (!enabled || isCompleted) return;
    setIsScratching(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], brushSize: 30 }]);
  };

  const handleMouseMove = (e) => {
    if (!isScratching || !enabled || isCompleted) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([pos.x, pos.y]);
    
    // Add some randomness to brush size for natural feel
    const brushSize = 25 + Math.random() * 10;
    lastLine.brushSize = brushSize;
    
    setLines([...lines.slice(0, -1), lastLine]);

    // Calculate percentage every few strokes for performance
    if (lastLine.points.length % 10 === 0) {
      setTimeout(() => {
        const percentage = calculateScratchedPercentage();
        setScratchedPercentage(percentage);

        // Auto-complete if threshold reached
        if (percentage > 60 && !isCompleted) {
          completeScratching();
        }
      }, 0);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
    const percentage = calculateScratchedPercentage();
    setScratchedPercentage(percentage);
  };

  const completeScratching = () => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div 
      className="relative"
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        minHeight: dimensions.height,
      }}
    >
      {/* Prize content underneath - always visible so it shows through when scratching */}
      <div 
        ref={contentRef}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-lg"
        style={{ 
          zIndex: 1
        }}
      >
        {prizeContent}
      </div>

      {/* Scratch layer */}
      <AnimatePresence>
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{
              cursor: enabled ? `url(/assets/coin-cursor.svg) 16 16, auto` : 'default',
              zIndex: 10
            }}
          >
            <Stage
              ref={stageRef}
              width={dimensions.width}
              height={dimensions.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className="rounded-lg shadow-2xl"
            >
              {/* Scratch surface layer */}
              <Layer ref={scratchLayerRef}>
                {/* Fallback background in case texture hasn't loaded */}
                <Rect
                  x={0}
                  y={0}
                  width={dimensions.width}
                  height={dimensions.height}
                  fill={surfaceColor}
                />
                {surfaceTexture && (
                  <KonvaImage
                    image={surfaceTexture}
                    width={dimensions.width}
                    height={dimensions.height}
                  />
                )}

                {/* Scratch lines with destination-out composition */}
                <Group globalCompositeOperation="destination-out">
                  {lines.map((line, i) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke="#000"
                      strokeWidth={line.brushSize}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation="destination-out"
                    />
                  ))}
                </Group>
              </Layer>
            </Stage>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {!isCompleted && enabled && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <div className="flex items-center justify-between mb-1 px-2">
              <span className="text-xs font-medium text-gray-700">
                {Math.round(scratchedPercentage)}% revealed
              </span>
              {scratchedPercentage > 60 && (
                <button
                  onClick={completeScratching}
                  className="text-xs bg-purple-700 text-white px-3 py-1 rounded-full hover:bg-purple-600 transition"
                >
                  Reveal All
                </button>
              )}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${scratchedPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Completion celebration */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full shadow-lg font-bold text-sm">
            🎉 Revealed!
          </div>
        </motion.div>
      )}
    </div>
  );
}