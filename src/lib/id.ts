let counter = 0;

/** Dependency-free unique id — good enough for on-device data. */
export function uid(): string {
  counter = (counter + 1) % 1000;
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${counter}`;
}
