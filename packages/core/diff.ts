export function diffVElementProps(prevProps: Props, currProps: Props) {
  const prevIterProps = prevProps as IterableObject;
  const currIterProps = currProps as IterableObject;
  const keys = Object.keys(prevProps).concat(Object.keys(currProps));
  const finaIterProps = {} as IterableObject;

  for (const key of keys) {
    if (!currIterProps.hasOwnProperty(key)) {
      finaIterProps[key] = null;
    } else if (typeof currIterProps[key] === "function") {
      finaIterProps[key] = currIterProps[key];
    } else if (typeof currIterProps[key] === "string" && prevIterProps[key] !== currIterProps[key]) {
      finaIterProps[key] = currIterProps[key];
    }
  }

  return finaIterProps;
}
