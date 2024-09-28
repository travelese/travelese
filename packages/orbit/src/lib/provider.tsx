'use client';

import * as React from 'react';
import OrbitProvider from '@kiwicom/orbit-components/lib/OrbitProvider';
import { defaultTheme } from '@kiwicom/orbit-components/lib';

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
