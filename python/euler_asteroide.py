"""
Ejercicio 42: caída libre con resistencia del aire (vuelo oscuro de un fragmento de asteroide)

    m dv/dt = -m g + k v^2 ,   v(0) = 0 ,   0 <= t <= 15 s
    m = 5 kg, k = 0.05 kg/m, g = 9.81 m/s^2

Convención: eje vertical hacia ARRIBA => v < 0 cuando el objeto cae.

Solución analítica:
    v_T  = sqrt(m g / k)                    (velocidad terminal)
    v(t) = -v_T * tanh(g t / v_T)
    y(t) = y0 - (v_T^2 / g) * ln(cosh(g t / v_T))

Uso:
    pip install numpy matplotlib
    python euler_asteroide.py
"""
import math

import matplotlib.pyplot as plt
import numpy as np

m, k, g = 5.0, 0.05, 9.81
t_final, v0 = 15.0, 0.0
vT = math.sqrt(m * g / k)


def f(t, v):
    """dv/dt = -g + (k/m) v^2"""
    return -g + (k / m) * v * v


def v_exact(t):
    return -vT * np.tanh(g * t / vT) + 0.0  # +0.0 evita mostrar -0.0


def euler(h):
    n = int(round(t_final / h))
    t = np.linspace(0.0, n * h, n + 1)
    v = np.zeros(n + 1)
    v[0] = v0
    for i in range(n):
        v[i + 1] = v[i] + h * f(t[i], v[i])
    return t, v


def tabla(h, cada=1):
    t, v = euler(h)
    print(f"\nMétodo de Euler, h = {h} s")
    print(f"{'n':>4} {'t (s)':>7} {'v Euler':>12} {'v exacta':>12} {'E abs':>10} {'E rel %':>9}")
    for i in range(0, len(t), cada):
        ve = v_exact(t[i])
        ea = abs(ve - v[i])
        er = ea / abs(ve) * 100 if ve != 0 else float("nan")
        print(f"{i:>4} {t[i]:>7.2f} {v[i]:>12.6f} {ve:>12.6f} {ea:>10.6f} {er:>9.4f}")
    return t, v


if __name__ == "__main__":
    print(f"Velocidad terminal v_T = sqrt(mg/k) = {vT:.6f} m/s = {vT*3.6:.2f} km/h")
    resultados = {h: tabla(h, cada=max(1, int(round(1 / h)))) for h in (1.0, 0.5, 0.1)}

    tt = np.linspace(0, t_final, 400)
    fig, ax = plt.subplots(1, 2, figsize=(13, 5))
    ax[0].plot(tt, v_exact(tt), "k-", lw=2.5, label="Analítica  v = -v_T tanh(g t / v_T)")
    estilos = {1.0: ("o--", "tab:red"), 0.5: ("s--", "tab:orange"), 0.1: ("-", "tab:blue")}
    for h, (t, v) in resultados.items():
        st, c = estilos[h]
        ax[0].plot(t, v, st, color=c, ms=4, lw=1.4, label=f"Euler h = {h} s")
    ax[0].axhline(-vT, color="gray", ls=":", label=f"-v_T = {-vT:.2f} m/s")
    ax[0].set(xlabel="t (s)", ylabel="v (m/s)", title="Velocidad del fragmento (vuelo oscuro)")
    ax[0].grid(alpha=.3)
    ax[0].legend()
    for h, (t, v) in resultados.items():
        ax[1].semilogy(t[1:], np.abs(v_exact(t[1:]) - v[1:]), estilos[h][0], color=estilos[h][1], ms=4, label=f"h = {h} s")
    ax[1].set(xlabel="t (s)", ylabel="|v_exacta - v_Euler| (m/s)", title="Error absoluto de Euler")
    ax[1].grid(alpha=.3, which="both")
    ax[1].legend()
    fig.tight_layout()
    fig.savefig("../img/velocidad_euler.png", dpi=130)
    print("\nGráfica guardada en img/velocidad_euler.png")
