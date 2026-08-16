// Host half: the clock is client-only, so this is a trivial no-op plugin.
// It exists so the package is a valid Loader entry on the host plane.
export const name = "@kakoyo/dsh-clock";

export function apply(_ctx) {}
