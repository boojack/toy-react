export namespace utils {
  export function isFunction(c: any): boolean {
    return typeof c === "function";
  }

  export function parseEventName(eventName: string): string {
    return toFirstLowerCase(eventName.replaceAll("on", ""));
  }

  export function toFirstUpperCase(str: string): string {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
  }

  export function toFirstLowerCase(str: string): string {
    return str.toLowerCase().replace(/( |^)[A-Z]/g, (L) => L.toLowerCase());
  }
}
