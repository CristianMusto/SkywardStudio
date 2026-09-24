/** Tiny element description used for the two animated icons the engine builds in code. */
export interface VNode {
  t: string;
  p: Record<string, unknown>;
  c: unknown[];
}

export const h = (t: string, p: Record<string, unknown> | null, ...c: unknown[]): VNode => ({
  t,
  p: p ?? {},
  c: c.flat(Infinity),
});
