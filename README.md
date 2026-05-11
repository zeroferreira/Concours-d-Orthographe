# 🐝 Spelling Bee 2026 - Guía de Estructura

Este proyecto es una plataforma interactiva para la práctica de deletreo (Spelling Bee) en tres idiomas: **Inglés, Francés y Alemán**.

## 📂 Estructura General del Proyecto

Para mantener la consistencia y facilitar el mantenimiento, el proyecto sigue esta estructura de archivos:

```text
/ (Raíz del Proyecto)
├── README.md               # Documentación y guía de estructura (este archivo)
├── index.html              # Selector principal de idiomas (Landing Page)
├── spelling.tsx            # Lógica central en React (si se usa de forma externa)
├── img/                    # Recursos visuales compartidos (iconos, fondos)
├── scripts/                # Scripts de utilidad compartidos
│
├── English/                # Módulo de Inglés
│   ├── index.html          # Interfaz de deletreo para Inglés
│   ├── spelling-data.js    # Base de datos de palabras y ejemplos
│   └── scripts/            # Scripts específicos para procesamiento de inglés
│
├── French/                 # Módulo de Francés
│   ├── index.html          # Interfaz de deletreo para Francés
│   ├── spelling-data.js    # Base de datos de palabras y ejemplos
│   └── data/               # Archivos Excel de respaldo (.xlsm)
│
└── German/                 # Módulo de Alemán
    ├── index.html          # Interfaz de deletreo para Alemán
    ├── spelling-data.js    # Base de datos de palabras y ejemplos
    └── data/               # Archivos Excel de respaldo (.xlsm)
```

---

## 🛠️ Estructura por Idioma (Estandarización)

Cada carpeta de idioma (`English/`, `French/`, `German/`) debe contener idealmente los siguientes elementos para funcionar correctamente:

### 1. `index.html`
Es el punto de entrada para el ejercicio de ese idioma. Contiene la interfaz de usuario (UI) adaptada.
- **Tip**: Debe cargar el archivo `spelling-data.js` correspondiente para obtener las palabras.

### 2. `spelling-data.js`
Archivo de JavaScript que exporta un objeto con las palabras categorizadas por niveles.
**Formato sugerido:**
```javascript
const spellingData = {
  level1: [
    { word: "Abeille", definition: "Insecte social...", example: "L'abeille fait du miel." },
    // ...
  ],
  // ...
};
```

### 3. `audio/` (Opcional)
Carpeta para archivos de audio si se desea usar grabaciones reales en lugar de síntesis de voz (TTS).
- Formato: `palabra.mp3`

---

## 🚀 Cómo agregar contenido

1. **Nuevas Palabras**: Edita el archivo `spelling-data.js` dentro de la carpeta del idioma correspondiente.
2. **Nuevos Idiomas**: 
   - Crea una nueva carpeta (ej. `Italian/`).
   - Copia un `index.html` base de otro idioma.
   - Crea su propio `spelling-data.js`.
   - Añade el enlace en el `index.html` de la raíz.

---

## 📝 Notas de Mantenimiento
- Los archivos `.xlsm` (Excel) en las carpetas `French/` y `German/` son fuentes de datos originales. Si se actualizan, asegúrate de exportar los cambios al archivo `spelling-data.js`.
- Los scripts en `English/` (`analyze_words.py`, `generate_patch.py`) son herramientas de automatización para procesar listas de palabras.
