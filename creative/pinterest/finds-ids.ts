/** A finds pin's stable name: its product and its place among that product's pins, e.g. "Pin-mm-travel-companion-03". */
export function findsPinId(pins: { product: string }[], index: number): string {
  const n = pins.slice(0, index + 1).filter((p) => p.product === pins[index].product).length;
  return `Pin-mm-${pins[index].product}-${String(n).padStart(2, "0")}`;
}
