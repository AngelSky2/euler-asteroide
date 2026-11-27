// fall.js — m dv/dt = −m g + k v²  (eje hacia arriba, caída ⇒ v ≤ 0)
export const terminal = ({ m, k, g }) => Math.sqrt((m * g) / k);

/** Solución analítica para v0 ≤ 0 (cualquier magnitud) */
export function exactV(p) {
  const vT = terminal(p), { g } = p, v0 = p.v0 ?? 0;
  const u0 = -v0 / vT; // rapidez inicial relativa (≥ 0)
  if (u0 < 1) { const c = Math.atanh(u0); return (t) => -vT * Math.tanh((g * t) / vT + c); }
  if (u0 === 1) return () => -vT;
  const c = 0.5 * Math.log((u0 + 1) / (u0 - 1)); // arcoth(u0)
  return (t) => -vT / Math.tanh((g * t) / vT + c);
}
/** Distancia caída d(t) = ∫|v| dt (para v0 = 0: (v_T²/g) ln cosh(g t / v_T)); numérica precisa por Simpson */
export function exactDrop(p, t, n = 400) {
  const v = exactV(p); if (t === 0) return 0;
  const h = t / n; let s = -v(0) - v(t);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * -v(i * h);
  return (s * h) / 3;
}
export const f = ({ m, k, g }) => (t, v) => -g + (k / m) * v * v;

export function euler(p, h) {
  const F = f(p), n = Math.round(p.T / h), ts = [0], vs = [p.v0 ?? 0], ys = [0];
  for (let i = 0; i < n; i++) {
    const t = ts[i], v = vs[i], hh = Math.min(h, p.T - t);
    if (hh <= 1e-12) break;
    vs.push(v + hh * F(t, v));
    ys.push(ys[i] + hh * -v);           // distancia caída (Euler)
    ts.push(+(t + hh).toFixed(12));
  }
  if (p.T - ts.at(-1) > 1e-9) { const t = ts.at(-1), v = vs.at(-1), hh = p.T - t; vs.push(v + hh * F(t, v)); ys.push(ys.at(-1) + hh * -v); ts.push(p.T); }
  return { ts, vs, ys };
}

export function validate(p) {
  const e = [], ok = (v) => typeof v === "number" && Number.isFinite(v);
  if (!ok(p.m) || p.m <= 0) e.push("La masa m debe ser > 0 (kg).");
  if (!ok(p.k) || p.k <= 0) e.push("k debe ser > 0 (kg/m).");
  if (!ok(p.g) || p.g <= 0) e.push("g debe ser > 0 (m/s²).");
  if (!ok(p.v0) || p.v0 > 0) e.push("v₀ debe ser ≤ 0 m/s (el modelo describe caída; con v > 0 el término kv² no cambia de signo).");
  if (!ok(p.T) || p.T <= 0 || p.T > 600) e.push("T debe estar entre 0 y 600 s.");
  for (const key of ["h", "h2"]) if (!ok(p[key]) || p[key] <= 0 || (ok(p.T) && p[key] > p.T) || (ok(p.T) && p.T / p[key] > 50000)) e.push(`${key === "h" ? "h" : "h₂"} debe cumplir 0 < h ≤ T (y no más de 50 000 pasos).`);
  return e;
}
