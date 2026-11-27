import { terminal, exactV, exactDrop, euler, validate } from "./fall.js";
import { lineChart } from "./charts.js";

const STUDENT = { nombre: "Angel (completar apellidos)", materia: "Métodos Numéricos", repo: "https://github.com/AngelSky2/euler-asteroide" };
const $ = (s) => document.querySelector(s);
const ids = ["m", "k", "g", "v0", "T", "h", "h2"];
const fmt = (v, p = 6) => (v === null || !Number.isFinite(v) ? "—" : v === 0 ? "0" : Math.abs(v) < 1e-4 ? v.toExponential(2) : (+v.toPrecision(p)).toString());
const PRESETS = {
  ej: { m: 5, k: 0.05, g: 9.81, v0: 0, T: 15, h: 1, h2: 0.1 },
  roca: { m: 5, k: 0.01, g: 9.81, v0: 0, T: 30, h: 1, h2: 0.1 },
  rapido: { m: 5, k: 0.05, g: 9.81, v0: -150, T: 15, h: 0.5, h2: 0.05 },
};
const kpi = (l, v, s = "", c = "") => `<div class="kpi ${c}"><div class="kpi-l">${l}</div><div class="kpi-v">${v}</div><div class="kpi-s">${s}</div></div>`;

function read() {
  const p = {};
  ids.forEach((k) => { const r = $("#" + k).value.trim().replace(",", "."); p[k] = r === "" ? NaN : Number(r); });
  return p;
}

function errorsOf(p, h) {
  const ex = exactV(p), s = euler(p, h);
  const rows = s.ts.map((t, i) => {
    const ve = ex(t), ea = Math.abs(ve - s.vs[i]);
    return { i, t, vE: s.vs[i], vx: ve, ea, er: ve !== 0 ? (ea / Math.abs(ve)) * 100 : null, dE: s.ys[i], dx: exactDrop(p, t, 200) };
  });
  return { h, rows, max: Math.max(...rows.map((r) => r.ea)), fin: rows.at(-1).ea };
}

function run() {
  const p = read(), errs = validate(p);
  const box = $("#valBox");
  ids.forEach((k) => $("#" + k).classList.toggle("invalid", !Number.isFinite(p[k])));
  if (errs.length) { box.className = "alert error"; box.innerHTML = `<b>Revise los datos:</b><ul>${errs.map((e) => `<li>${e}</li>`).join("")}</ul>`; return; }
  const vT = terminal(p);
  box.className = "alert ok";
  box.innerHTML = `✔ f(t, v) = −${p.g} + ${fmt(p.k / p.m, 4)}·v² · v<sub>T</sub> = √(mg/k) = ${fmt(vT, 6)} m/s`;
  const A = errorsOf(p, p.h), B = errorsOf(p, p.h2), ex = exactV(p);
  const tt = Array.from({ length: 301 }, (_, i) => (i * p.T) / 300);
  const t99 = tt.find((t) => Math.abs(ex(t)) / vT > 0.99 && Math.abs(ex(t)) / vT < 1.01);
  $("#kpis").innerHTML = kpi("Velocidad terminal", `${fmt(vT, 5)} m/s`, `${fmt(vT * 3.6, 4)} km/h`) +
    kpi(`v(${p.T}) exacta`, fmt(ex(p.T), 6), "m/s") +
    kpi(`v(${p.T}) Euler h=${p.h}`, fmt(A.rows.at(-1).vE, 6), "m/s") +
    kpi("Error máx. Euler", fmt(A.max, 4), `h = ${p.h} s · con h₂: ${fmt(B.max, 3)}`, "bad") +
    kpi(`Distancia en ${p.T} s`, `${fmt(exactDrop(p, p.T), 5)} m`, "exacta (∫|v|dt)") +
    kpi("Llega al 99 % de v_T", t99 === undefined ? "—" : `${t99.toFixed(1)} s`, "");
  lineChart($("#chartV"), [
    { name: "Analítica", x: tt, y: tt.map(ex), color: "var(--c1)" },
    { name: `Euler h = ${p.h}`, x: A.rows.map((r) => r.t), y: A.rows.map((r) => r.vE), color: "var(--c2)", dash: "6 4", markers: true },
    { name: `Euler h₂ = ${p.h2}`, x: B.rows.map((r) => r.t), y: B.rows.map((r) => r.vE), color: "var(--c3)", dash: "2 3" },
  ], { xLabel: "t (s)", yLabel: "v (m/s)", hlines: [{ y: -vT, label: `−v_T = ${fmt(-vT, 5)} m/s`, color: "var(--bad)" }] });
  const pos = (a) => a.map((v) => (v > 0 ? v : NaN));
  lineChart($("#chartE"), [
    { name: `h = ${p.h}`, x: A.rows.map((r) => r.t), y: pos(A.rows.map((r) => r.ea)), color: "var(--c2)", markers: true },
    { name: `h₂ = ${p.h2}`, x: B.rows.map((r) => r.t), y: pos(B.rows.map((r) => r.ea)), color: "var(--c3)" },
  ], { xLabel: "t (s)", yLabel: "|v_exacta − v_Euler| (m/s)", logY: true });
  const hs = [2, 1, 0.5, 0.25, 0.1, 0.05].filter((h) => h <= p.T);
  const sims = hs.map((h) => errorsOf(p, h));
  $("#cmp").innerHTML = `<table class="tbl"><thead><tr><th>h (s)</th><th>pasos</th><th>E<sub>máx</sub> (m/s)</th><th>E<sub>rel</sub> máx</th><th>E(h)/E(h/2)</th></tr></thead><tbody>
    ${sims.map((s, i) => `<tr><td>${s.h}</td><td>${s.rows.length - 1}</td><td class="mono">${fmt(s.max, 4)}</td><td class="mono">${fmt(Math.max(...s.rows.map((r) => r.er ?? 0)), 3)} %</td><td>${i && hs[i - 1] === 2 * s.h ? fmt(sims[i - 1].max / s.max, 3) : "—"}</td></tr>`).join("")}</tbody></table>
    <p class="muted">Euler es de orden 1: si h se divide entre 2, el error se divide ≈ entre 2.</p>`;
  $("#table").innerHTML = `<table class="tbl"><thead><tr><th>n</th><th>t (s)</th><th>v Euler</th><th>v exacta</th><th>E abs</th><th>E rel %</th><th>dist. Euler (m)</th><th>dist. exacta (m)</th></tr></thead><tbody>
    ${A.rows.map((r) => `<tr><td>${r.i}</td><td>${fmt(r.t)}</td><td class="mono">${r.vE.toFixed(6)}</td><td class="mono">${(r.vx + 0).toFixed(6)}</td><td class="mono">${r.ea.toFixed(6)}</td><td class="mono">${r.er === null ? "no def." : r.er.toFixed(4)}</td><td class="mono">${r.dE.toFixed(3)}</td><td class="mono">${r.dx.toFixed(3)}</td></tr>`).join("")}</tbody></table>`;
}

ids.forEach((k) => $("#" + k).addEventListener("input", run));
document.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => { const pr = PRESETS[b.dataset.preset]; ids.forEach((k) => ($("#" + k).value = pr[k])); run(); }));
const base = PRESETS.ej, vTb = terminal(base);
$("#heroKpis").innerHTML = kpi("Velocidad terminal", `${vTb.toFixed(2)} m/s`, "√(mg/k) ≈ 113 km/h") + kpi("Solución analítica", "v = −v_T tanh(g t/v_T)", "") + kpi("v(15 s)", `${exactV(base)(15).toFixed(3)} m/s`, "exacta");
$("#studentLine").textContent = `${STUDENT.nombre} · ${STUDENT.materia} · UMSA`;
$("#footer").innerHTML = `${STUDENT.nombre} · Ejercicio 42 · ${STUDENT.materia} · <a href="${STUDENT.repo}">Repositorio</a>`;
run();
