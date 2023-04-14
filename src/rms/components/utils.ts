import { Context, useContext, useRef } from "react";

export function range(length: number): number[] {
  return [...new Array(length).keys()];
}

export function useContextSafely<T>(context: Context<T | undefined>, message: string = 'Invalid context'): T {
  const value = useContext(context);

  if (value === undefined) {
    throw new Error(message);
  }

  return value;
}

export function useRange(length: number): number[] {
  const values = useRef<number[]>();

  if (!values.current || values.current.length !== length) {
    values.current = range(length);
  }

  return values.current;
}
