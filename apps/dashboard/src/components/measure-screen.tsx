"use client";

import type { CSSProperties } from "react";

export const MeasureScreen = () => {
  const screenWidth =
    typeof window !== "undefined" ? document.body.clientWidth : 0;

  return (
    <div
      style={
        {
          "--screen-width": `${screenWidth}px`,
        } as CSSProperties
      }
    />
  );
};
