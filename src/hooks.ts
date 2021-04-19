import { rerender } from "./render";

const _states: any[] = [];
let _curor = 0;

export function useState<T>(state: T) {
  const index = _curor;
  let _s = _states[index] ?? state;

  if (_states[index] === undefined) {
    _states[index] = state;
  }

  let setState = (val: T) => {
    _states[index] = val;
    _curor = 0;
    rerender();
  };

  _curor++;

  return [_s, setState];
}
