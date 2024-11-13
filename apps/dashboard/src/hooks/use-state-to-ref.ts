import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

export function useStateToRef<T = unknown>(initial: T): MutableRefObject<T> {
  const ref = useRef<T>(initial);

  useEffect(() => {
    ref.current = initial;
  }, [initial]);

  return ref;
}
