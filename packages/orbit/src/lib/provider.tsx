"use client";

import { defaultTheme } from "@kiwicom/orbit-components/lib";
import OrbitProvider from "@kiwicom/orbit-components/lib/OrbitProvider";
import * as React from "react";

export default function Provider({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}): JSX.Element {
  return (
    <OrbitProvider theme={defaultTheme} useId={React.useId}>
      {children}
    </OrbitProvider>
  );
}
