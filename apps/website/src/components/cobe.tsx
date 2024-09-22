"use client";

import "@/styles/globals.css";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

// https://github.com/shuding/cobe

export default function App() {
  const canvasRef = useRef();

  useEffect(() => {
    let phi = 0;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [40.7128, -74.006], size: 0.04 }, // New York
        { location: [43.6532, -79.3832], size: 0.07 }, // Toronto
        { location: [48.8566, 2.3522], size: 0.04 }, // Paris
        { location: [45.4642, 9.19], size: 0.04 }, // Milan
        { location: [35.6762, 51.4241], size: 0.04 }, // Tehran
        { location: [35.6762, 139.6503], size: 0.04 }, // Tokyo
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="Cobe">
      <h1 className="sr-only">COBE</h1>
      <p className="sr-only">
        A lightweight (5kB) WebGL globe lib:{" "}
        <a
          href="https://github.com/shuding/cobe"
          target="_blank"
          rel="noreferrer"
          className="sr-only"
        >
          GitHub
        </a>
      </p>
      <canvas
        ref={canvasRef}
        style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      />
    </div>
  );
}
