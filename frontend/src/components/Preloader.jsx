import React, { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";

const Preloader = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show preloader for 1.8 seconds, then trigger fadeOut transition
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    // Completely unmount after fadeOut animation finishes (500ms)
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`preloader-wrapper ${fadeOut ? "fade-out" : ""}`}>
      <div className="preloader-content">
        <div className="preloader-animation">
          <div className="preloader-ring"></div>
          <Dumbbell className="preloader-icon" size={40} />
        </div>
        <h1 className="preloader-brand">DREAM PHYSIQUE</h1>
        <p className="preloader-subtitle">BUILDING YOUR DESTINY...</p>
      </div>
    </div>
  );
};

export default Preloader;
