import { rerender } from "./render";

const states: any[] = [];
let stateCount = 0;

export function useState<T>(defaultValue: T): [T, Function] {
  const index = stateCount;
  const currentValue = states[index] ?? defaultValue;

  if (states[index] === undefined) {
    states[index] = defaultValue;
  }

  const setState = (val: T) => {
    states[index] = val;

    stateCount = 0;
    rerender();
  };

  stateCount++;

  return [currentValue, setState];
}
