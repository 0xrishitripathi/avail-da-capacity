import { useState, useEffect, useRef, Fragment, useMemo } from 'react';

// Dynamic fill ripples component
const FillRipples = ({ isActive, fillPercentage }) => {
  const rippleCount = 5; // Number of ripples to show when filling
  
  // Only render ripples when active
  if (!isActive) return null;
  
  // Create ripples with random positions based on fill height
  const ripples = Array(rippleCount).fill().map((_, i) => {
    // Position ripples at the current water level
    const top = 100 - fillPercentage; // Position at water surface
    const left = Math.floor(Math.random() * 80) + 10; // 10-90%
    const delay = (i * 150) + (Math.random() * 100); // Staggered delays
    const size = Math.floor(Math.random() * 4) + 6; // 6-10px
    
    return (
      <div 
        key={`fill-ripple-${i}`} 
        className="fill-ripple" 
        style={{ 
          left: `${left}%`, 
          top: `${top}%`, 
          animationDelay: `${delay}ms`,
          width: `${size}px`,
          height: `${size}px`
        }}
      />
    );
  });
  
  return <>{ripples}</>;
};

// Component for dynamic ripples
const DynamicRipples = ({ fillPercentage }) => {
  // Calculate number of ripples based on fill percentage
  const numRipples = useMemo(() => {
    if (fillPercentage < 10) return 2;
    if (fillPercentage < 30) return 4;
    if (fillPercentage < 60) return 6;
    return 8;
  }, [fillPercentage]);
  
  // Generate ripples with random positions
  const ripples = useMemo(() => {
    return Array(numRipples).fill().map((_, i) => {
      const left = Math.floor(Math.random() * 80) + 10; // 10-90%
      const top = Math.floor(Math.random() * 80) + 10; // 10-90%
      const delay = Math.random() * 3; // 0-3s delay
      const size = Math.floor(Math.random() * 3) + 4; // 4-6px
      // Random depth for 3D effect - affects blur and opacity
      const depth = Math.random();
      const blur = depth * 1.5;
      const opacity = 0.9 - (depth * 0.5);
      
      return (
        <div 
          key={i} 
          className="ripple" 
          style={{ 
            left: `${left}%`, 
            top: `${top}%`, 
            animationDelay: `${delay}s`,
            width: `${size}px`,
            height: `${size}px`,
            filter: `blur(${blur}px)`,
            opacity: opacity,
            zIndex: Math.floor(depth * 10)
          }}
        />
      );
    });
  }, [numRipples]);

  // Generate water depth fragments to simulate three.js water depth
  const depthFragments = useMemo(() => {
    // Only add depth fragments for higher fill percentages
    if (fillPercentage < 20) return null;
    
    return Array(12).fill().map((_, i) => {
      const left = Math.floor(Math.random() * 100);
      const top = Math.floor(Math.random() * 100);
      const width = Math.floor(Math.random() * 40) + 10;
      const height = Math.floor(Math.random() * 40) + 10;
      const opacity = Math.random() * 0.3;
      const blur = Math.random() * 3 + 1;
      
      return (
        <div
          key={`depth-${i}`}
          className="water-depth-fragment"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            opacity: opacity,
            filter: `blur(${blur}px)`
          }}
        />
      );
    });
  }, [fillPercentage]);
  
  return (
    <>
      {depthFragments}
      {ripples}
    </>
  );
};

const BlockCube = ({ 
  blockNumber, 
  blockDetails, 
  displayPercentage, 
  fillPercentage, 
  isNewBlock, 
  isFillingUp, 
  totalByteSize,
  formatByteSize,
  formatCapacityUtilization,
  formatSignerAddress,
  explorerUrl
}) => {
  // State and refs for cube interaction
  const [cubeRotation, setCubeRotation] = useState({ x: 15, y: -15 });
  const [showBlobInfo, setShowBlobInfo] = useState(false);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Mouse event handlers for blob info
  const handleMouseEnter = () => {
    setShowBlobInfo(true);
  };

  const handleMouseLeave = () => {
    setShowBlobInfo(false);
  };

  // Mouse event handlers for cube spinning
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    
    setCubeRotation(prev => ({
      x: prev.x - deltaY * 0.5, // Reversed for natural feel
      y: prev.y + deltaX * 0.5
    }));
    
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      };
    }
  };
  
  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
    const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;
    
    setCubeRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    lastMousePosRef.current = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    };
    
    // Prevent page scrolling while dragging the cube
    e.preventDefault();
  };

  // Add global mouse/touch up handlers
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="block-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div 
        className={`block spinnable ${isNewBlock ? 'pulse' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ 
          transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)` 
        }}
      >
        {/* Cube Faces */}
        <div className="block-face face-front"></div>
        <div className="block-face face-back"></div>
        <div className="block-face face-left"></div>
        <div className="block-face face-right"></div>
        <div className="block-face face-top"></div>
        <div className="block-face face-bottom"></div>
        
        {/* 3D Water Fill */}
        {totalByteSize > 0 && displayPercentage >= 1 && (
          <div className="block-fill-3d">
            {/* Water sides */}
            <div 
              className="water-front" 
              style={{ height: `${fillPercentage}%` }}
            >
              <div className="wave-container-3d">
                <div className="water-surface-3d"></div>
              </div>
            </div>
            
            <div 
              className="water-back" 
              style={{ height: `${fillPercentage}%` }}
            >
              <div className="wave-container-3d">
                <div className="water-surface-3d"></div>
              </div>
            </div>
            
            <div 
              className="water-left" 
              style={{ height: `${fillPercentage}%` }}
            >
              <div className="wave-container-3d">
                <div className="water-surface-3d"></div>
              </div>
            </div>
            
            <div 
              className="water-right" 
              style={{ height: `${fillPercentage}%` }}
            >
              <div className="wave-container-3d">
                <div className="water-surface-3d"></div>
              </div>
            </div>
            
            {/* Water top/surface - Reverting to relative center alignment */}
            <div 
              className="water-top" 
              style={{
                // We'll rely on transform for vertical positioning
                bottom: 'auto', // Remove bottom positioning
                top: 0, // Anchor to the top of the container initially
                // Rotate flat, then translate relative to the center
                // Z = -150 (bottom) + (fillPercentage * 3) --> Range: -150 to +150
                transform: `rotateX(90deg) translateZ(${-150 + fillPercentage * 3}px)`, 
                // Only show if there's water
                opacity: fillPercentage > 0 ? 0.96 : 0, 
                // Ensure it's clickable for ripples if needed
                pointerEvents: fillPercentage > 0 ? 'auto' : 'none',
              }}
            >
              <DynamicRipples fillPercentage={fillPercentage} />
              <FillRipples 
                isActive={isFillingUp} 
                fillPercentage={fillPercentage} 
              />
            </div>
          </div>
        )}
        
        {/* Always show the percentage label */}
        {totalByteSize > 0 && (
          <div className={displayPercentage >= 1 ? "capacity-label" : "capacity-label-no-fill"}>
            {displayPercentage.toFixed(2)}%
          </div>
        )}
        
        <a 
          href={`${explorerUrl}${blockNumber}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block-number-link"
        >
          #{blockNumber}
        </a>
      </div>
              
      {showBlobInfo && (
        <div className="blob-info-popup">
          <div className="blob-info-header">block info</div>
          <div className="blob-info-content">
            <div className="blob-info-item">
              <div className="blob-info-line">
                <span className="blob-info-key">block_size:</span> 
                <span className="blob-info-value">4 MB</span>
              </div>
              
              {blockDetails.length > 0 && (
                <>
                  {blockDetails.map((blob, index) => (
                    <Fragment key={index}>
                      <div className="blob-info-line">
                        <span className="blob-info-key">blob_size:</span> 
                        <span className="blob-info-value">{formatByteSize(blob.byteSize)}</span>
                      </div>
                      <div className="blob-info-line">
                        <span className="blob-info-key">app_ID:</span> 
                        <span className="blob-info-value">{blob.appId}</span>
                      </div>
                      <div className="blob-info-line">
                        <span className="blob-info-key">signer:</span> 
                        <span className="blob-info-value">{formatSignerAddress(blob.signer)}</span>
                      </div>
                    </Fragment>
                  ))}
                </>
              )}
              
              <div className="blob-info-line">
                <span className="blob-info-key">DA Capacity used:</span> 
                <span className="blob-info-value">{formatCapacityUtilization(totalByteSize)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockCube; 