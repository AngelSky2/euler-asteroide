# Solución explicada: ejercicio 42

## 1. Planteamiento
Un objeto de masa m cae por la gravedad y el aire lo frena con una fuerza proporcional al cuadrado de la velocidad:

    m dv/dt = −mg + kv²      (eje positivo hacia arriba; al caer v < 0)

- **−mg**: peso, siempre hacia abajo.
- **+kv²**: arrastre aerodinámico, hacia arriba mientras el objeto cae. k = ½ρC_dA depende de la densidad del aire, la forma y el área.

## 2. Velocidad terminal
Cuando el arrastre iguala al peso la aceleración es cero: mg = kv_T² ⇒ **v_T = √(mg/k) = √(5·9.81/0.05) = 31.32 m/s**.

## 3. Solución analítica (separación de variables)
    dv/dt = −g(1 − v²/v_T²)
    ∫ dv/(1 − v²/v_T²) = −g ∫ dt  ⇒  v_T·artanh(v/v_T) = −gt + C,  v(0)=0 ⇒ C = 0
    **v(t) = −v_T tanh(g t / v_T) = −31.32·tanh(0.3132·t)**

Comprobación: derivando, dv/dt = −g·sech²(gt/v_T); al sustituir en el lado derecho, −g + (g/v_T²)·v_T²·tanh² = −g·sech² ✔. Además v(0) = 0 ✔.

## 4. Método de Euler
Euler avanza con la pendiente del inicio de cada paso: v_{n+1} = v_n + h·f(t_n, v_n), donde f = −g + 0.01·v².

Con h = 1 s:
- v₁ = 0 + (−9.81) = −9.81
- v₂ = −9.81 + (−9.81 + 0.01·96.2361) = −18.6576
- v₃ = −18.6576 + (−9.81 + 3.4811) = −24.9866
- … hasta v₁₅ = −31.3209 m/s

Euler **sobreestima la rapidez** en los primeros segundos, porque toma la pendiente “sin arrastre” del inicio de cada intervalo. El error máximo es 1.96 m/s (8.5 %) en t ≈ 3 s. Después se anula porque ambas curvas llegan al mismo equilibrio −v_T. Al reducir h el error baja proporcionalmente: con h = 0.1 el error máximo es 0.18 m/s. Esto confirma que Euler es de orden 1.

## 5. Gráfica
La gráfica `img/velocidad_euler.png` muestra que v(t) baja rápido y se aplana en −31.32 m/s. La curva de Euler con h = 1 queda un poco por debajo de la exacta entre t = 1 y t = 7 s.

## 6. Contexto: la caída de un asteroide el próximo año (escenario hipotético)
Supongamos que en 2027 un asteroide de 1–2 m entra en la atmósfera sobre el altiplano. La fricción lo convierte en bola de fuego y lo fragmenta a 20–40 km de altura. Los fragmentos se frenan con fuerza y, cuando dejan de brillar, comienza el **vuelo oscuro**: caen solo bajo la gravedad y el arrastre del aire. En esa etapa vale nuestra ecuación.

**Qué nos dice el modelo:**
1. Un fragmento de 5 kg con k = 0.05 kg/m **no acelera indefinidamente**. En unos 10 s alcanza ≈ 31 m/s (113 km/h) y mantiene esa velocidad hasta el suelo.
2. Su energía de impacto es ½·5·31.3² ≈ 2.45 kJ, como soltarlo desde 50 m de altura. Es peligroso para una persona o un techo, pero no forma cráteres. Los cráteres, como el de Carancas (Perú, 2007), los producen objetos de toneladas que no alcanzan a frenarse.
3. Aunque el fragmento entre al vuelo oscuro a 150 m/s, la atmósfera lo frena a v_T en pocos segundos. Por eso la velocidad de llegada de los meteoritos pequeños depende de su masa y su forma (k), no de la velocidad del asteroide original.
4. En 15 s el fragmento recorre ≈ 400 m. Estos cálculos, hechos con métodos numéricos y un paso pequeño, permiten a los científicos acotar la zona donde buscar meteoritos.

**Limitaciones:** en la realidad la densidad del aire (y por tanto k) aumenta al descender, hay viento horizontal y el fragmento puede seguir rompiéndose. Además v(0) = 0 es una idealización del ejercicio.
