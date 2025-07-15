function resolverEcuacion() {
  const input = document.getElementById("ecuacion").value.trim();
  const pasosDiv = document.getElementById("pasos");
  pasosDiv.innerHTML = "";

  try {
    // Validaciones iniciales
    if (!/^[0-9x+\-*/().= ]+$/i.test(input)) {
      throw new Error("Solo se permiten números, operaciones y la letra 'x'.");
    }
    if (!input.includes("=")) {
      throw new Error("Falta el signo '=' en la ecuación.");
    }
    if (!input.toLowerCase().includes("x")) {
      throw new Error("La ecuación debe contener una incógnita 'x'.");
    }

    const pasos = resolverPasoAPaso(input);
    pasos.forEach(p => {
      const pasoElem = document.createElement("div");
      pasoElem.className = "paso";

      const titulo = document.createElement("h4");
      titulo.textContent = p.titulo;

      const detalle = document.createElement("p");
      detalle.textContent = p.detalle;

      const expresion = document.createElement("div");
      expresion.style.fontWeight = "bold";
      expresion.style.marginTop = "5px";
      expresion.textContent = p.expresion;

      pasoElem.appendChild(titulo);
      pasoElem.appendChild(detalle);
      pasoElem.appendChild(expresion);
      pasosDiv.appendChild(pasoElem);
    });
  } catch (err) {
    pasosDiv.innerHTML = `<div class="paso">❌ Error: ${err.message}</div>`;
  }
}

function resolverPasoAPaso(ecuacion) {
  ecuacion = ecuacion.replace(/\s+/g, "").replace(/\./g, "*").toLowerCase();

  const [ladoIzq, ladoDer] = ecuacion.split("=");
  if (!ladoIzq || !ladoDer) throw new Error("Ecuación inválida. Asegurate de usar '=' correctamente.");

  let pasos = [];

  let izqReducida = procesarLado(ladoIzq);
  let derReducida = procesarLado(ladoDer);

  pasos.push({
    titulo: "📘 Paso 1: Aplicamos la propiedad distributiva",
    detalle: "Multiplicamos cada término dentro del paréntesis por el número que lo acompaña.",
    expresion: `${mostrarBonito(izqReducida.expresion)} = ${mostrarBonito(derReducida.expresion)}`
  });

  const derConSignoInvertido = invertirSignos(derReducida.expresion);
  let totalCoef = izqReducida.coef - derReducida.coef;
  let totalConst = izqReducida.const - derReducida.const;

  pasos.push({
    titulo: "📘 Paso 2: Pasamos los términos al otro lado cambiando el signo",
    detalle: "Los términos del segundo miembro pasan al primero con signo contrario.",
    expresion: `${mostrarBonito(izqReducida.expresion)} ${derConSignoInvertido} = 0`
  });

  pasos.push({
    titulo: "📘 Paso 3: Agrupamos términos semejantes",
    detalle: "Sumamos o restamos los coeficientes de 'x' y los números.",
    expresion: `${totalCoef}x + ${totalConst} = 0`
  });

  pasos.push({
    titulo: "📘 Paso 4: Despejamos la incógnita 'x'",
    detalle: "Aislamos la 'x' dejando su coeficiente solo en un lado.",
    expresion: `${totalCoef}x = ${-totalConst}`
  });

  pasos.push({
    titulo: "✅ Resultado final",
    detalle: `Dividimos ambos lados entre ${totalCoef} para encontrar el valor de x.`,
    expresion: `x = ${-totalConst / totalCoef}`
  });

  return pasos;
}

function invertirSignos(expr) {
  const partes = expr.split(/(?=[+-])/);
  let resultado = [];

  partes.forEach((parte, index) => {
    parte = parte.trim();

    if (parte.includes("x")) {
      if (parte.startsWith("-")) resultado.push("+" + parte.slice(1));
      else if (parte.startsWith("+")) resultado.push("-" + parte.slice(1));
      else resultado.push("-" + parte);
    } else {
      let num = parseFloat(parte);
      if (isNaN(num)) return;

      if (index === 0) {
        resultado.push((num > 0 ? "-" : "+") + Math.abs(num));
      } else {
        resultado.push((num > 0 ? " - " : " + ") + Math.abs(num));
      }
    }
  });

  return resultado.join("").replace(/\+\s?/g, " + ").replace(/\-\s?/g, " - ").replace(/\s+/g, " ").trim();
}

function procesarLado(expr) {
  expr = insertarMultiplicaciones(expr);
  expr = expandirParentesis(expr);

  let partes = expr.split(/(?=[+-])/);
  let coef = 0;
  let constante = 0;
  let reconstruida = [];

  for (let parte of partes) {
    parte = parte.trim();
    if (parte.includes("x")) {
      let n = parte.replace("x", "");
      if (n === "" || n === "+") n = "1";
      if (n === "-") n = "-1";
      coef += parseFloat(n);
      reconstruida.push(`${parseFloat(n)}x`);
    } else {
      constante += parseFloat(parte);
      reconstruida.push(parte);
    }
  }

  return {
    coef,
    const: constante,
    expresion: reconstruida.join(" + ").replace(/\+\s-\s/g, "- ")
  };
}

function insertarMultiplicaciones(expr) {
  return expr
    .replace(/(\d)(x)/g, "$1*$2")
    .replace(/(x)\(/g, "$1*(")
    .replace(/(\d)\(/g, "$1*(")
    .replace(/(\))(\()/g, "$1*$2")
    .replace(/(\))(\d)/g, "$1*$2");
}

function expandirParentesis(expr) {
  return expr.replace(/(\([^\)]+\))\*(\d+)/g, (_, grupo, n) => {
    const contenido = grupo.slice(1, -1);
    const partes = contenido.split(/(?=[+-])/);
    return partes.map(p => {
      if (p.includes("x")) {
        let factor = p.replace("x", "");
        if (factor === "" || factor === "+") factor = "1";
        if (factor === "-") factor = "-1";
        return `${parseFloat(n) * parseFloat(factor)}x`;
      } else {
        return eval(`${n}*(${p})`);
      }
    }).join("+");
  }).replace(/(\d+)\*\(([^\)]+)\)/g, (_, n, contenido) => {
    const partes = contenido.split(/(?=[+-])/);
    return partes.map(p => {
      if (p.includes("x")) {
        let factor = p.replace("x", "");
        if (factor === "" || factor === "+") factor = "1";
        if (factor === "-") factor = "-1";
        return `${parseFloat(n) * parseFloat(factor)}x`;
      } else {
        return eval(`${n}*(${p})`);
      }
    }).join("+");
  }).replace(/\+\-/g, "-");
}

function mostrarBonito(expr) {
  return expr
    .replace(/\*/g, "")
    .replace(/\+\-/g, "-")
    .replace(/\+\s\-/g, "-")
    .replace(/\-\s\-/g, "+");
}
