import React, { useRef, useState } from "react";

const ImageMagnifier = ({
  src,
  zoom = 2.5,
  magnifierSize = 180,
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const handleMouseEnter = () => {
    const { width, height } = imgRef.current.getBoundingClientRect();
    setImgDimensions({ width, height });
    setShowMagnifier(true);
  };

  const handleMouseMove = (e) => {
    const { top, left } = imgRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setMousePosition({ x, y });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={src}
        ref={imgRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
        alt="Magnified Product"
      />

      {showMagnifier && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            top: `${mousePosition.y - magnifierSize / 2}px`,
            left: `${mousePosition.x - magnifierSize / 2}px`,
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            borderRadius: "50%",
            backgroundColor: "#fff",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${imgDimensions.width * zoom}px ${imgDimensions.height * zoom}px`,
            backgroundPosition: `-${mousePosition.x * zoom - magnifierSize / 2}px -${
              mousePosition.y * zoom - magnifierSize / 2
            }px`,
            border: "1px solid rgba(0,0,0,0.15)",
            boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
            zIndex: 100,
            opacity: 0.96,
            transition: "opacity 0.2s ease",
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
