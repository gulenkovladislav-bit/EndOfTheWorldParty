const STORAGE_KEY = "last-dawn-console";
const STATE_VERSION = 4;
const FOCUS_ZOOM = 1.45;
const EDIT_ZOOM_STEP = 0.2;

const defaultRegionStyle = {
  markerLabel: "",
  markerSubLabel: "",
  regionColor: "#ff2635",
  regionStroke: 4,
  regionGlow: 68,
  regionFill: 18,
  regionBlink: 58,
  regionLineStyle: "tear",
  regionParticleDensity: 3,
  regionParticleSize: 5,
};

const defaultState = {
  version: STATE_VERSION,
  active: 0,
  threat: 2,
  customMap: "",
  mapFit: "contain",
  heroesOpen: false,
  editMode: false,
  drawingRegion: false,
  mapZoom: 1,
  focusX: 50,
  focusY: 50,
  soundUrl: "",
  sounds: {
    panic: "",
    stage: "",
    chaos: "",
    damage: "",
    focus: "",
  },
  news: "Метасущества замечены. Мир пока делает вид, что ничего не происходит.",
  locations: [
    {
      id: "hq",
      name: "Киев",
      country: "Украина",
      type: "Наш штаб",
      ...defaultRegionStyle,
      regionColor: "#ffd0a1",
      regionLineStyle: "scanner",
      x: 49,
      y: 46,
      radius: 12,
      highlightStyle: "scan",
      particleStyle: "static",
      completed: false,
      preview: false,
      regionPoints: [],
      image: "",
      summary: "Нейтральное убежище. Точка сбора, где начинается конец.",
      hooks: ["выдать карточки персонажей", "начислить стартовые очки хаоса", "объявить охоту Ордена"],
    },
    {
      id: "vegas",
      name: "Лас-Вегас",
      country: "США",
      type: "Казино / Дьявол",
      ...defaultRegionStyle,
      regionColor: "#ff2635",
      regionLineStyle: "tear",
      x: 12,
      y: 46,
      radius: 17,
      highlightStyle: "breach",
      particleStyle: "embers",
      completed: false,
      preview: false,
      regionPoints: [],
      image: "",
      summary: "Покер, рулетка, ставки HP и сделки с тем, кто всегда улыбается слишком широко.",
      hooks: ["ставка HP за удвоение хаоса", "дьявол может предложить грязную сделку", "проигравший раскрывает изъян"],
    },
    {
      id: "transylvania",
      name: "Трансильвания",
      country: "Румыния",
      type: "Мистика / Ритуал",
      ...defaultRegionStyle,
      regionColor: "#ffb58b",
      regionLineStyle: "ritual",
      regionParticleDensity: 4,
      x: 57,
      y: 39,
      radius: 13,
      highlightStyle: "sigil",
      particleStyle: "runes",
      completed: false,
      preview: false,
      regionPoints: [],
      image: "",
      summary: "Деревня, ведьма и ритуал, который желательно не понимать до конца.",
      hooks: ["гадание Таро открывает подсказку", "ритуал требует жертву/обещание", "Орден вмешивается при затяжке"],
    },
    {
      id: "lab",
      name: "Сингапур",
      country: "Лабораторный комплекс",
      type: "Биооружие",
      ...defaultRegionStyle,
      regionColor: "#f54848",
      regionLineStyle: "signal",
      x: 81,
      y: 55,
      radius: 15,
      highlightStyle: "pulse",
      particleStyle: "static",
      completed: false,
      preview: false,
      regionPoints: [],
      image: "",
      summary: "Напитки, один опасный образец и прекрасная возможность соврать с научным видом.",
      hooks: ["каждый делает напиток", "один знает опасный образец", "ошибка стоит HP или усиливает Орден"],
    },
    {
      id: "final",
      name: "Кейптаун",
      country: "Южная Африка",
      type: "Центр управления",
      ...defaultRegionStyle,
      regionColor: "#ff2635",
      regionLineStyle: "scanner",
      x: 52,
      y: 79,
      radius: 14,
      highlightStyle: "scan",
      particleStyle: "embers",
      completed: false,
      preview: false,
      regionPoints: [],
      image: "",
      summary: "ИИ, финальный запрос и момент, когда разные цели становятся проблемой.",
      hooks: ["каждый формулирует часть запроса", "предатель может исказить команду", "последний банкет перед исходом"],
    },
  ],
  heroes: [
    {
      id: "ludwig",
      name: "Людвиг",
      role: "Вампир-подсос",
      hp: 3,
      chaos: 0,
      flaw: "Слабость к любви. Любое публичное отвержение стоит ему 1 HP.",
      image: "assets/character-card-reference.jpg",
      visible: true,
    },
    {
      id: "doctor",
      name: "Доктор Мор",
      role: "Алхимик провалов",
      hp: 3,
      chaos: 1,
      flaw: "Если план становится слишком логичным, он обязан добавить эксперимент.",
      image: "",
      visible: true,
    },
    {
      id: "oracle",
      name: "Мадам Ноль",
      role: "Ворожка конца",
      hp: 2,
      chaos: 2,
      flaw: "Говорит правду так туманно, что иногда сама проигрывает.",
      image: "",
      visible: true,
    },
  ],
};

let state = loadState();

const mapShell = document.querySelector("#mapShell");
const markersEl = document.querySelector("#markers");
const chaosLayer = document.querySelector("#chaosLayer");
const regionLayer = document.querySelector("#regionLayer");
const regionHandles = document.querySelector("#regionHandles");
const heroToggle = document.querySelector("#heroToggle");
const heroDock = document.querySelector("#heroDock");
const panelEl = document.querySelector("#locationPanel");
const briefEl = document.querySelector("#brief");
const selectEl = document.querySelector("#locationSelect");
const stageList = document.querySelector("#stageList");
const threatTrack = document.querySelector("#threatTrack");
const threatValue = document.querySelector("#threatValue");
const newsInput = document.querySelector("#newsInput");
const broadcastText = document.querySelector("#broadcastText");
const customMap = document.querySelector("#customMap");
const routeLines = document.querySelector("#routeLines");
const alertOverlay = document.querySelector("#alertOverlay");
const alertKicker = document.querySelector("#alertKicker");
const alertText = document.querySelector("#alertText");
const editRadius = document.querySelector("#editRadius");
const editX = document.querySelector("#editX");
const editY = document.querySelector("#editY");
const highlightStyle = document.querySelector("#highlightStyle");
const particleStyle = document.querySelector("#particleStyle");
const regionColor = document.querySelector("#regionColor");
const regionStroke = document.querySelector("#regionStroke");
const regionGlow = document.querySelector("#regionGlow");
const regionFill = document.querySelector("#regionFill");
const regionBlink = document.querySelector("#regionBlink");
const regionLineStyle = document.querySelector("#regionLineStyle");
const regionParticleDensity = document.querySelector("#regionParticleDensity");
const regionParticleSize = document.querySelector("#regionParticleSize");
const mapFit = document.querySelector("#mapFit");
const heroEditorList = document.querySelector("#heroEditorList");
const heroSpotlight = document.querySelector("#heroSpotlight");
const heroPortrait = document.querySelector("#heroPortrait");
const heroRole = document.querySelector("#heroRole");
const heroName = document.querySelector("#heroName");
const heroFlaw = document.querySelector("#heroFlaw");
const heroHp = document.querySelector("#heroHp");
const heroChaos = document.querySelector("#heroChaos");
const modalBackdrop = document.querySelector("#modalBackdrop");
const modalMedia = document.querySelector("#modalMedia");
const modalType = document.querySelector("#modalType");
const modalTitle = document.querySelector("#modalTitle");
const modalCountry = document.querySelector("#modalCountry");
const modalSummary = document.querySelector("#modalSummary");
const modalHooks = document.querySelector("#modalHooks");
const editModeBtn = document.querySelector("#editModeBtn");
const drawRegionBtn = document.querySelector("#drawRegionBtn");
const undoRegionPointBtn = document.querySelector("#undoRegionPointBtn");
const clearRegionBtn = document.querySelector("#clearRegionBtn");
const editZoomMinus = document.querySelector("#editZoomMinus");
const editZoomReset = document.querySelector("#editZoomReset");
const editZoomPlus = document.querySelector("#editZoomPlus");
const soundUpload = document.querySelector("#soundUpload");
const stageSoundUpload = document.querySelector("#stageSoundUpload");
const chaosSoundUpload = document.querySelector("#chaosSoundUpload");
const damageSoundUpload = document.querySelector("#damageSoundUpload");
const focusSoundUpload = document.querySelector("#focusSoundUpload");
const soundTestSelect = document.querySelector("#soundTestSelect");
const testSoundBtn = document.querySelector("#testSoundBtn");
const editModalBackdrop = document.querySelector("#editModalBackdrop");
const editModalName = document.querySelector("#editModalName");
const editModalCountry = document.querySelector("#editModalCountry");
const editModalType = document.querySelector("#editModalType");
const editModalMarkerLabel = document.querySelector("#editModalMarkerLabel");
const editModalMarkerSubLabel = document.querySelector("#editModalMarkerSubLabel");
const editModalSummary = document.querySelector("#editModalSummary");
const editModalHooks = document.querySelector("#editModalHooks");
const editModalImageUpload = document.querySelector("#editModalImageUpload");
const editModalImagePreview = document.querySelector("#editModalImagePreview");

let audioContext;

const eventCopy = {
  order: ["ПРОТОКОЛ РАССВЕТ", "ОРДЕН НАНОСИТ 1 УРОН ВСЕМ"],
  chaos: ["ХАОС ЗАФИКСИРОВАН", "+1 ОЧКО ХАОСА ЗА СЦЕНУ"],
  ritual: ["РИТУАЛ НЕСТАБИЛЕН", "РЕАЛЬНОСТЬ ТРЕБУЕТ ПЛАТУ"],
  system: ["ЦЕНТР УПРАВЛЕНИЯ", "ИИ ПРИНЯЛ ЗАПРОС К ОБРАБОТКЕ"],
  traitor: ["ВНУТРЕННЯЯ УГРОЗА", "ОБНАРУЖЕН ТОТ, КТО НЕ ХОЧЕТ КОНЦА"],
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    if (!saved.version || saved.version < STATE_VERSION) {
      saved.customMap = "";
      saved.mapFit = "contain";
      saved.version = STATE_VERSION;
    }
    return {
      ...structuredClone(defaultState),
      ...saved,
      sounds: { ...defaultState.sounds, ...(saved.sounds || {}), panic: saved.sounds?.panic || saved.soundUrl || "" },
      locations: defaultState.locations.map((location) => ({ ...location, ...(saved.locations?.find((item) => item.id === location.id) || {}) })),
      heroes: defaultState.heroes.map((hero) => ({ ...hero, ...(saved.heroes?.find((item) => item.id === hero.id) || {}) })),
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  renderSelect();
  renderStageList();
  renderChaosZones();
  renderRegionLayer();
  renderRegionHandles();
  renderMarkers();
  renderRoutes();
  renderPanel();
  renderThreat();
  renderMap();
  renderNews();
  renderEditor();
  renderEditState();
  renderHeroes();
  saveState();
}

function renderSelect() {
  selectEl.innerHTML = state.locations
    .map((location, index) => `<option value="${index}">${location.completed ? "✓ " : ""}${escapeHtml(location.name)} — ${escapeHtml(location.type)}</option>`)
    .join("");
  selectEl.value = String(state.active);
}

function renderStageList() {
  stageList.innerHTML = state.locations
    .map((location, index) => {
      const status = location.completed ? "поражено" : index === state.active ? "в фокусе" : "ожидает";
      return `
        <button class="stage-item ${index === state.active ? "is-active" : ""} ${location.completed ? "is-complete" : ""}" type="button" data-stage="${index}">
          <span class="stage-index">${index + 1}</span>
          <span><b>${escapeHtml(location.name)}</b><small>${escapeHtml(location.type)}</small></span>
          <span class="stage-badge">${status}</span>
        </button>
      `;
    })
    .join("");
  stageList.querySelectorAll("[data-stage]").forEach((button) => {
    button.addEventListener("click", () => setActive(Number(button.dataset.stage)));
  });
}

function markerLabel(location) {
  return {
    title: location.markerLabel?.trim() || location.name,
    subtitle: location.markerSubLabel?.trim() || location.type,
  };
}

function safeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultRegionStyle.regionColor;
}

function hexToRgba(hex, alpha) {
  const color = safeColor(hex).slice(1);
  const value = parseInt(color, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

function regionDash(location) {
  const dashes = {
    solid: "none",
    tear: "20 9 5 10",
    scanner: "34 14",
    ritual: "7 8 2 8",
    signal: "4 8",
  };
  return dashes[location.regionLineStyle] || dashes.tear;
}

function buildRegionStyle(location) {
  const stroke = clamp(Number(location.regionStroke ?? defaultRegionStyle.regionStroke), 2, 12);
  const glow = clamp(Number(location.regionGlow ?? defaultRegionStyle.regionGlow), 0, 100);
  const fill = clamp(Number(location.regionFill ?? defaultRegionStyle.regionFill), 0, 55);
  const blink = clamp(Number(location.regionBlink ?? defaultRegionStyle.regionBlink), 0, 100);
  const color = safeColor(location.regionColor);
  const blinkSpeed = blink <= 0 ? 999 : Math.max(0.75, 5.4 - blink * 0.045);
  const flowSpeed = Math.max(1.2, 6.2 - blink * 0.035);
  return [
    `--region-color:${color}`,
    `--region-fill-color:${hexToRgba(color, fill / 100)}`,
    `--region-stroke:${stroke}`,
    `--region-stroke-width:${stroke}px`,
    `--region-active-stroke-width:${stroke + 1}px`,
    `--region-glow-stroke-width:${stroke * 3}px`,
    `--region-glow-size:${Math.round(glow / 7)}px`,
    `--region-particle-glow-size:${Math.max(1, Math.round(glow / 9))}px`,
    `--region-glow-level:${(glow / 100).toFixed(2)}`,
    `--region-glow-opacity:${(glow * 0.0024).toFixed(2)}`,
    `--region-complete-glow-opacity:${(glow * 0.0034).toFixed(2)}`,
    `--region-fill-level:${(fill / 55).toFixed(2)}`,
    `--region-blink-level:${(blink / 100).toFixed(2)}`,
    `--region-blink-speed:${blinkSpeed.toFixed(2)}s`,
    `--region-flow-speed:${flowSpeed.toFixed(2)}s`,
    `--region-dash:${regionDash(location)}`,
  ].join(";");
}

function buildRegionParticles(location, points) {
  const particleStyleValue = location.particleStyle || "embers";
  const density = clamp(Number(location.regionParticleDensity ?? defaultRegionStyle.regionParticleDensity), 0, 7);
  if (particleStyleValue === "none" || density <= 0 || points.length < 2) return "";
  const size = clamp(Number(location.regionParticleSize ?? defaultRegionStyle.regionParticleSize), 2, 12);
  const closed = points.length >= 3;
  const segments = closed ? points.map((point, index) => [point, points[(index + 1) % points.length]]) : points.slice(0, -1).map((point, index) => [point, points[index + 1]]);
  let particleIndex = 0;

  return segments
    .map(([from, to], segmentIndex) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.max(Math.hypot(dx, dy), 1);
      const count = Math.max(1, Math.round(density * Math.min(2.4, length / 160 + 0.65)));
      const normalX = -dy / length;
      const normalY = dx / length;
      return Array.from({ length: count }, (_, index) => {
        const t = (index + 1) / (count + 1);
        const wave = Math.sin((segmentIndex + 1) * 1.7 + index * 0.9) * Math.min(5, size * 0.65);
        const x = from.x + dx * t + normalX * wave;
        const y = from.y + dy * t + normalY * wave;
        const delay = (particleIndex++ % 11) * -0.16;
        return `<circle class="region-particle particles-${particleStyleValue}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" style="animation-delay:${delay}s" />`;
      }).join("");
    })
    .join("");
}

function renderChaosZones() {
  chaosLayer.innerHTML = state.locations
    .filter((location) => (location.completed || location.preview) && (!location.regionPoints || location.regionPoints.length < 3))
    .map((location) => {
      const particleCount = location.particleStyle === "none" ? 0 : location.particleStyle === "runes" ? 8 : 12;
      const particles = Array.from({ length: particleCount }, (_, index) => {
        const angle = index * 36 + (location.id.length % 5) * 7;
        const delay = `${(index % 5) * -0.22}s`;
        return `<i class="chaos-particle" style="--angle:${angle}deg; --delay:${delay}; --radius:${location.radius || 12};"></i>`;
      }).join("");
      return `<div class="chaos-zone chaos-${location.highlightStyle || "breach"} particles-${location.particleStyle || "embers"} ${location.preview ? "is-preview" : ""}" style="left:${location.x}%; top:${location.y}%; --radius:${location.radius || 12};">${particles}</div>`;
    })
    .join("");
}

function renderRegionLayer() {
  regionLayer.innerHTML = state.locations
    .filter((location) => (location.completed || location.preview || (state.editMode && location === state.locations[state.active])) && location.regionPoints?.length >= 2)
    .map((location) => {
      const active = state.locations.indexOf(location) === state.active;
      const points = location.regionPoints.map((point) => ({ x: point.x * 12, y: point.y * 6.8 }));
      const path = points.length >= 3 ? smoothClosedPath(points) : `M ${points.map((point) => `${point.x} ${point.y}`).join(" L ")}`;
      const particles = buildRegionParticles(location, points);
      return `
        <g class="region-effect region-${location.highlightStyle || "breach"} line-${location.regionLineStyle || "tear"} ${active ? "is-active" : ""} ${location.completed ? "is-complete" : ""} ${location.preview ? "is-preview" : ""}" style="${buildRegionStyle(location)}">
          <path class="region-glow-trace" d="${path}" />
          <path class="region-path" d="${path}" />
          ${particles}
        </g>
      `;
    })
    .join("");
}

function renderRegionHandles() {
  const location = state.locations[state.active];
  const points = location.regionPoints || [];
  regionHandles.innerHTML = !state.editMode
    ? ""
    : points
        .map((point, index) => {
          const projected = projectMapPoint(point.x, point.y);
          return `<button class="region-handle" type="button" data-point="${index}" style="left:${projected.x}%; top:${projected.y}%;" title="Точка контура ${index + 1}"></button>`;
        })
        .join("");
  regionHandles.querySelectorAll("[data-point]").forEach((handle) => attachRegionHandleDrag(handle, Number(handle.dataset.point)));
}

function renderMarkers() {
  markersEl.innerHTML = "";
  state.locations.forEach((location, index) => {
    const point = projectMapPoint(location.x, location.y);
    const marker = document.createElement("button");
    marker.className = [
      "marker",
      index === state.active ? "is-active" : "",
      location.completed ? "is-complete" : "",
      point.x > 72 ? "label-left" : "",
      point.y > 72 ? "label-up" : "",
    ].filter(Boolean).join(" ");
    marker.type = "button";
    marker.style.left = `${point.x}%`;
    marker.style.top = `${point.y}%`;
    const label = markerLabel(location);
    marker.title = `${label.title}: ${label.subtitle}`;
    marker.innerHTML = `<span class="marker-label">${escapeHtml(label.title)}<b>${escapeHtml(label.subtitle)}</b><small class="marker-status">${location.completed ? "хаос активен" : "этап открыт"}</small></span>`;
    marker.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (marker.dataset.suppressClick === "true") return;
      if (state.editMode) {
        openLocationEditor(index);
        return;
      }
      focusLocation(index);
    });
    marker.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (marker.dataset.suppressClick === "true") return;
      closeLocationEditor();
      focusLocation(index, { sound: false });
      openLocationModal(index);
    });
    attachDrag(marker, location, index);
    markersEl.append(marker);
  });
}

function projectMapPoint(x, y) {
  const zoom = Number(state.mapZoom || 1);
  const focusX = Number(state.focusX || 50);
  const focusY = Number(state.focusY || 50);
  return {
    x: focusX + (x - focusX) * zoom,
    y: focusY + (y - focusY) * zoom,
  };
}

function screenToMapPoint(clientX, clientY) {
  const rect = mapShell.getBoundingClientRect();
  const zoom = Number(state.mapZoom || 1);
  const focusX = Number(state.focusX || 50);
  const focusY = Number(state.focusY || 50);
  const screenX = ((clientX - rect.left) / rect.width) * 100;
  const screenY = ((clientY - rect.top) / rect.height) * 100;
  return {
    x: clamp(focusX + (screenX - focusX) / zoom, 0, 100),
    y: clamp(focusY + (screenY - focusY) / zoom, 0, 100),
  };
}

function renderRoutes() {
  const hq = state.locations[0];
  routeLines.innerHTML = state.locations
    .slice(1)
    .map((location, index) => {
      const locationIndex = index + 1;
      const classes = [
        locationIndex === state.active ? "is-active" : "",
        location.completed ? "is-complete" : "",
      ].filter(Boolean).join(" ");
      return `<line class="${classes}" x1="${hq.x * 12}" y1="${hq.y * 6.8}" x2="${location.x * 12}" y2="${location.y * 6.8}" />`;
    })
    .join("");
}

function renderPanel() {
  const location = state.locations[state.active];
  panelEl.innerHTML = `
    <span>${escapeHtml(location.type)}</span>
    <h2>${escapeHtml(location.name)}</h2>
    <h3>${escapeHtml(location.country)}</h3>
    <p>${escapeHtml(location.summary)}</p>
    <ul>${location.hooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join("")}</ul>
  `;
  panelEl.style.setProperty("--panel-title-size", `${fitTitleSize(location.name, 40)}px`);
  briefEl.innerHTML = `
    <strong>${escapeHtml(location.name)}: ${escapeHtml(location.type)}</strong>
    <ul>${location.hooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join("")}</ul>
  `;
}

function fitTitleSize(text, maxSize) {
  const length = String(text).length;
  if (length > 24) return Math.min(maxSize, 24);
  if (length > 18) return Math.min(maxSize, 28);
  if (length > 13) return Math.min(maxSize, 32);
  if (length > 10) return Math.min(maxSize, 35);
  return maxSize;
}

function renderEditor() {
  const location = state.locations[state.active];
  editRadius.value = location.radius || 12;
  editX.value = location.x;
  editY.value = location.y;
  highlightStyle.value = location.highlightStyle || "breach";
  particleStyle.value = location.particleStyle || "embers";
  regionColor.value = safeColor(location.regionColor);
  regionStroke.value = location.regionStroke ?? defaultRegionStyle.regionStroke;
  regionGlow.value = location.regionGlow ?? defaultRegionStyle.regionGlow;
  regionFill.value = location.regionFill ?? defaultRegionStyle.regionFill;
  regionBlink.value = location.regionBlink ?? defaultRegionStyle.regionBlink;
  regionLineStyle.value = location.regionLineStyle || defaultRegionStyle.regionLineStyle;
  regionParticleDensity.value = location.regionParticleDensity ?? defaultRegionStyle.regionParticleDensity;
  regionParticleSize.value = location.regionParticleSize ?? defaultRegionStyle.regionParticleSize;
}

function renderHeroes() {
  document.body.classList.toggle("heroes-open", Boolean(state.heroesOpen));
  heroToggle.textContent = state.heroesOpen ? "×" : "✓";
  heroToggle.title = state.heroesOpen ? "Скрыть героев" : "Показать героев";
  const visibleHeroes = state.heroes.filter((hero) => hero.visible);
  heroDock.innerHTML = visibleHeroes
    .map((hero) => `
      <button class="hero-mini" type="button" data-hero="${hero.id}">
        <span class="hero-avatar">${hero.image ? `<img src="${hero.image}" alt="" />` : hero.name.slice(0, 1)}</span>
        <span><b>${escapeHtml(hero.name)}</b><small>${escapeHtml(hero.role)}</small></span>
        <em>HP ${hero.hp}</em>
      </button>
    `)
    .join("");
  heroDock.querySelectorAll("[data-hero]").forEach((button) => {
    button.addEventListener("click", () => openHeroSpotlight(button.dataset.hero));
  });

  heroEditorList.innerHTML = state.heroes
    .map((hero) => `
      <div class="hero-editor-item">
        <button class="hero-editor-main" type="button" data-hero-show="${hero.id}">
          <b>${escapeHtml(hero.name)}</b>
          <small>${escapeHtml(hero.role)} // HP ${hero.hp} // хаос ${hero.chaos}</small>
        </button>
        <button type="button" data-hero-toggle="${hero.id}">${hero.visible ? "Скрыть" : "Показать"}</button>
      </div>
    `)
    .join("");
  heroEditorList.querySelectorAll("[data-hero-show]").forEach((button) => {
    button.addEventListener("click", () => openHeroSpotlight(button.dataset.heroShow));
  });
  heroEditorList.querySelectorAll("[data-hero-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const hero = state.heroes.find((item) => item.id === button.dataset.heroToggle);
      if (!hero) return;
      hero.visible = !hero.visible;
      render();
    });
  });
}

function renderThreat() {
  threatValue.textContent = state.threat;
  threatTrack.innerHTML = Array.from({ length: 6 }, (_, index) => `<span class="threat-cell ${index < state.threat ? "is-filled" : ""}"></span>`).join("");
}

function renderMap() {
  mapShell.dataset.fit = state.mapFit || "contain";
  const zoom = Number(state.mapZoom || 1);
  mapShell.style.setProperty("--map-zoom", String(zoom));
  mapShell.style.setProperty("--focus-x", `${state.focusX || 50}%`);
  mapShell.style.setProperty("--focus-y", `${state.focusY || 50}%`);
  mapFit.value = state.mapFit || "contain";
  document.body.classList.toggle("uploaded-map", Boolean(state.customMap));
  document.body.classList.toggle("map-zoomed", zoom > 1.01);
  if (state.customMap) {
    customMap.src = state.customMap;
    customMap.classList.add("is-visible");
  } else {
    customMap.removeAttribute("src");
    customMap.classList.remove("is-visible");
  }
}

function renderNews() {
  newsInput.value = state.news;
  broadcastText.textContent = state.news;
}

function renderEditState() {
  document.body.classList.toggle("edit-mode", Boolean(state.editMode));
  document.body.classList.toggle("drawing-region", Boolean(state.editMode && state.drawingRegion));
  editModeBtn.textContent = state.editMode ? "Режим редактирования: вкл" : "Режим редактирования: выкл";
  drawRegionBtn.textContent = state.drawingRegion ? "Рисование: вкл" : "Рисовать";
}

function setActive(index) {
  state.active = (index + state.locations.length) % state.locations.length;
  render();
}

function resetMapFocus({ renderNow = true } = {}) {
  state.mapZoom = 1;
  state.focusX = 50;
  state.focusY = 50;
  if (renderNow) render();
}

function resetEverything() {
  state = structuredClone(defaultState);
  localStorage.removeItem(STORAGE_KEY);
  render();
}

function focusLocation(index, { sound = true, zoom = FOCUS_ZOOM } = {}) {
  const locationIndex = (index + state.locations.length) % state.locations.length;
  const location = state.locations[locationIndex];
  state.active = locationIndex;
  state.focusX = location.x;
  state.focusY = location.y;
  state.mapZoom = zoom;
  render();
  if (sound) playAlertSound("focus");
}

function adjustEditZoom(delta) {
  if (!state.editMode) return;
  const activeLocation = state.locations[state.active];
  state.focusX = activeLocation.x;
  state.focusY = activeLocation.y;
  state.mapZoom = clamp(Number(state.mapZoom || 1) + delta, 1, 2.4);
  render();
}

function showAlert(kicker, text) {
  alertKicker.textContent = kicker;
  alertText.textContent = text;
  alertOverlay.classList.remove("is-active");
  void alertOverlay.offsetWidth;
  alertOverlay.classList.add("is-active");
}

function openLocationModal(index) {
  state.active = (index + state.locations.length) % state.locations.length;
  render();
  const location = state.locations[state.active];
  modalType.textContent = location.completed ? `${location.type} // хаос активен` : location.type;
  modalTitle.textContent = location.name;
  modalTitle.style.fontSize = `${fitTitleSize(location.name, 62)}px`;
  modalCountry.textContent = location.country;
  modalSummary.textContent = location.summary;
  modalHooks.innerHTML = location.hooks.map((hook) => `<li>${escapeHtml(hook)}</li>`).join("");
  modalMedia.innerHTML = location.image
    ? `<img src="${location.image}" alt="" />`
    : `<div class="modal-placeholder">Досье локации<br />загрузите картинку в редакторе</div>`;
  modalBackdrop.hidden = false;
}

function closeLocationModal() {
  modalBackdrop.hidden = true;
}

function openLocationEditor(index) {
  state.active = (index + state.locations.length) % state.locations.length;
  render();
  const location = state.locations[state.active];
  editModalName.value = location.name;
  editModalCountry.value = location.country;
  editModalType.value = location.type;
  editModalMarkerLabel.value = location.markerLabel || "";
  editModalMarkerSubLabel.value = location.markerSubLabel || "";
  editModalSummary.value = location.summary;
  editModalHooks.value = location.hooks.join("\n");
  editModalImageUpload.value = "";
  editModalImagePreview.innerHTML = location.image ? `<img src="${location.image}" alt="" />` : "";
  editModalBackdrop.hidden = false;
}

function closeLocationEditor() {
  editModalBackdrop.hidden = true;
}

function saveLocationEditor() {
  const location = state.locations[state.active];
  location.name = editModalName.value.trim() || location.name;
  location.country = editModalCountry.value.trim() || location.country;
  location.type = editModalType.value.trim() || location.type;
  location.markerLabel = editModalMarkerLabel.value.trim();
  location.markerSubLabel = editModalMarkerSubLabel.value.trim();
  location.summary = editModalSummary.value.trim() || location.summary;
  location.hooks = editModalHooks.value
    .split("\n")
    .map((hook) => hook.trim())
    .filter(Boolean);
  closeLocationEditor();
  render();
}

function openHeroSpotlight(heroId) {
  const hero = state.heroes.find((item) => item.id === heroId);
  if (!hero) return;
  heroRole.textContent = hero.role;
  heroName.textContent = hero.name;
  heroFlaw.textContent = hero.flaw;
  heroHp.textContent = `HP ${hero.hp}`;
  heroChaos.textContent = `ХАОС ${hero.chaos}`;
  heroPortrait.innerHTML = hero.image
    ? `<img src="${hero.image}" alt="" />`
    : `<span>${escapeHtml(hero.name.slice(0, 1))}</span>`;
  heroSpotlight.hidden = false;
}

function closeHeroSpotlight() {
  heroSpotlight.hidden = true;
}

function completeActiveStage() {
  const location = state.locations[state.active];
  location.completed = true;
  location.preview = false;
  state.news = `${location.name}: регион поражен хаосом. Очевидцы сообщают о нарушениях реальности.`;
  render();
  playAlertSound("stage");
  showAlert("ЭТАП ЗАВЕРШЕН", `${location.name}: ХАОС РАСПРОСТРАНЯЕТСЯ`);
}

function reopenActiveStage() {
  const location = state.locations[state.active];
  location.completed = false;
  location.preview = false;
  render();
}

function nextStage() {
  setActive(state.active + 1);
}

function applyRegionEditorValues(location) {
  location.radius = Number(editRadius.value) || location.radius || 12;
  location.x = Number(editX.value) || location.x;
  location.y = Number(editY.value) || location.y;
  location.highlightStyle = highlightStyle.value;
  location.particleStyle = particleStyle.value;
  location.regionColor = safeColor(regionColor.value);
  location.regionStroke = clamp(Number(regionStroke.value) || defaultRegionStyle.regionStroke, 2, 12);
  location.regionGlow = clamp(Number(regionGlow.value) || 0, 0, 100);
  location.regionFill = clamp(Number(regionFill.value) || 0, 0, 55);
  location.regionBlink = clamp(Number(regionBlink.value) || 0, 0, 100);
  location.regionLineStyle = regionLineStyle.value || defaultRegionStyle.regionLineStyle;
  location.regionParticleDensity = clamp(Number(regionParticleDensity.value) || 0, 0, 7);
  location.regionParticleSize = clamp(Number(regionParticleSize.value) || defaultRegionStyle.regionParticleSize, 2, 12);
}

function updateActiveEffectFromEditor({ preview = false, apply = false, reset = false } = {}) {
  const location = state.locations[state.active];
  if (reset) {
    const defaults = defaultState.locations[state.active] || defaultRegionStyle;
    location.completed = false;
    location.preview = false;
    location.radius = defaults.radius || 12;
    location.highlightStyle = defaults.highlightStyle || "breach";
    location.particleStyle = defaults.particleStyle || "embers";
    location.regionColor = defaults.regionColor || defaultRegionStyle.regionColor;
    location.regionStroke = defaults.regionStroke ?? defaultRegionStyle.regionStroke;
    location.regionGlow = defaults.regionGlow ?? defaultRegionStyle.regionGlow;
    location.regionFill = defaults.regionFill ?? defaultRegionStyle.regionFill;
    location.regionBlink = defaults.regionBlink ?? defaultRegionStyle.regionBlink;
    location.regionLineStyle = defaults.regionLineStyle || defaultRegionStyle.regionLineStyle;
    location.regionParticleDensity = defaults.regionParticleDensity ?? defaultRegionStyle.regionParticleDensity;
    location.regionParticleSize = defaults.regionParticleSize ?? defaultRegionStyle.regionParticleSize;
    render();
    return;
  }
  applyRegionEditorValues(location);
  if (preview) location.preview = true;
  if (apply) {
    location.preview = false;
    location.completed = true;
    state.news = `${location.name}: контур хаоса активирован. Регион начал искажаться.`;
  }
  render();
  if (apply) {
    playAlertSound("chaos");
    showAlert("ХАОС ПРИМЕНЕН", `${location.name}: ОБЛАСТЬ АКТИВНА`);
  }
}

function smoothClosedPath(points) {
  if (points.length < 3) return "";
  const commands = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    const midX = (point.x + next.x) / 2;
    const midY = (point.y + next.y) / 2;
    return `Q ${point.x} ${point.y} ${midX} ${midY}`;
  });
  const first = points[0];
  const second = points[1];
  return `M ${(first.x + second.x) / 2} ${(first.y + second.y) / 2} ${commands.join(" ")} Z`;
}

function addRegionPoint(event) {
  if (!state.editMode || !state.drawingRegion) return;
  if (event.target.closest("button, .modal-backdrop, .hero-spotlight")) return;
  const point = screenToMapPoint(event.clientX, event.clientY);
  const location = state.locations[state.active];
  location.regionPoints ||= [];
  location.regionPoints.push({
    x: point.x,
    y: point.y,
  });
  location.preview = true;
  render();
}

function handleMapShellClick(event) {
  if (event.target.closest("button, input, select, textarea, .modal-backdrop, .hero-spotlight, .location-panel, .hero-dropdown, .broadcast, .intel-card, .legend-card, .map-title, .seal, .status-strip")) return;
  if (state.editMode && state.drawingRegion) {
    addRegionPoint(event);
    return;
  }
  if (!state.editMode && (state.mapZoom || 1) !== 1) resetMapFocus();
}

function regionCenter(points) {
  if (!points?.length) return { x: 50, y: 50 };
  return points.reduce((center, point) => ({ x: center.x + point.x / points.length, y: center.y + point.y / points.length }), { x: 0, y: 0 });
}

function scaleActiveRegion(factor) {
  const location = state.locations[state.active];
  if (!location.regionPoints?.length) return;
  const center = regionCenter(location.regionPoints);
  location.regionPoints = location.regionPoints.map((point) => ({
    x: clamp(center.x + (point.x - center.x) * factor, 0, 100),
    y: clamp(center.y + (point.y - center.y) * factor, 0, 100),
  }));
  location.preview = true;
  render();
}

function moveActiveRegionToMarker() {
  const location = state.locations[state.active];
  if (!location.regionPoints?.length) return;
  const center = regionCenter(location.regionPoints);
  const dx = location.x - center.x;
  const dy = location.y - center.y;
  location.regionPoints = location.regionPoints.map((point) => ({
    x: clamp(point.x + dx, 0, 100),
    y: clamp(point.y + dy, 0, 100),
  }));
  location.preview = true;
  render();
}

function attachRegionHandleDrag(handle, pointIndex) {
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!state.editMode) return;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove", (event) => {
    if (!state.editMode || !handle.hasPointerCapture(event.pointerId)) return;
    const location = state.locations[state.active];
    const point = location.regionPoints?.[pointIndex];
    if (!point) return;
    const mapPoint = screenToMapPoint(event.clientX, event.clientY);
    point.x = mapPoint.x;
    point.y = mapPoint.y;
    const projected = projectMapPoint(point.x, point.y);
    handle.style.left = `${projected.x}%`;
    handle.style.top = `${projected.y}%`;
    renderRegionLayer();
    saveState();
  });
  handle.addEventListener("pointerup", (event) => {
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    render();
  });
}

function playAlertSound(kind = "panic") {
  const uploadedSound = state.sounds?.[kind] || (kind === "panic" ? state.soundUrl : "") || state.sounds?.panic || state.soundUrl;
  if (uploadedSound) {
    const audio = new Audio(uploadedSound);
    audio.volume = 0.7;
    audio.play().catch(() => {});
    return;
  }
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  const presets = {
    panic: { wave: "sawtooth", volume: 0.18, base: 130, peak: 430, end: 190, offsets: [0, 0.18, 0.36], length: 0.32 },
    stage: { wave: "triangle", volume: 0.16, base: 180, peak: 520, end: 260, offsets: [0, 0.14], length: 0.42 },
    chaos: { wave: "sawtooth", volume: 0.2, base: 90, peak: 360, end: 110, offsets: [0, 0.1, 0.2, 0.3], length: 0.25 },
    damage: { wave: "square", volume: 0.15, base: 240, peak: 120, end: 80, offsets: [0, 0.22], length: 0.36 },
    focus: { wave: "sine", volume: 0.09, base: 420, peak: 640, end: 520, offsets: [0], length: 0.18 },
  };
  const preset = presets[kind] || presets.panic;
  const gain = audioContext.createGain();
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(preset.volume, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

  preset.offsets.forEach((offset) => {
    const osc = audioContext.createOscillator();
    osc.type = preset.wave;
    osc.frequency.setValueAtTime(preset.base, now + offset);
    osc.frequency.exponentialRampToValueAtTime(preset.peak, now + offset + preset.length * 0.42);
    osc.frequency.exponentialRampToValueAtTime(preset.end, now + offset + preset.length * 0.88);
    osc.connect(gain);
    osc.start(now + offset);
    osc.stop(now + offset + preset.length);
  });
}

function attachDrag(marker, location, index) {
  let startX = 0;
  let startY = 0;

  marker.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (!state.editMode) return;
    state.active = index;
    startX = event.clientX;
    startY = event.clientY;
    marker.dataset.dragMoved = "false";
    marker.dataset.suppressClick = "false";
    marker.setPointerCapture(event.pointerId);
    marker.style.cursor = "grabbing";
  });

  marker.addEventListener("pointermove", (event) => {
    if (!state.editMode) return;
    if (!marker.hasPointerCapture(event.pointerId)) return;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 4) {
      marker.dataset.dragMoved = "true";
    }
    const mapPoint = screenToMapPoint(event.clientX, event.clientY);
    location.x = clamp(mapPoint.x, 3, 97);
    location.y = clamp(mapPoint.y, 7, 93);
    const projected = projectMapPoint(location.x, location.y);
    marker.style.left = `${projected.x}%`;
    marker.style.top = `${projected.y}%`;
    editX.value = location.x;
    editY.value = location.y;
    renderRoutes();
    saveState();
  });

  marker.addEventListener("pointerup", (event) => {
    if (!state.editMode || !marker.hasPointerCapture(event.pointerId)) return;
    marker.releasePointerCapture(event.pointerId);
    if (marker.dataset.dragMoved === "true") {
      marker.dataset.suppressClick = "true";
      setTimeout(() => {
        marker.dataset.suppressClick = "false";
      }, 200);
      render();
    }
    marker.style.cursor = "grab";
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return chars[char];
  });
}

document.querySelector("#prevBtn").addEventListener("click", () => setActive(state.active - 1));
document.querySelector("#nextBtn").addEventListener("click", () => setActive(state.active + 1));
selectEl.addEventListener("change", (event) => setActive(Number(event.target.value)));
mapFit.addEventListener("change", (event) => {
  state.mapFit = event.target.value;
  render();
});
heroToggle.addEventListener("click", () => {
  state.heroesOpen = !state.heroesOpen;
  render();
});
editModeBtn.addEventListener("click", () => {
  state.editMode = !state.editMode;
  if (state.editMode) resetMapFocus({ renderNow: false });
  if (!state.editMode) state.drawingRegion = false;
  render();
});
document.querySelector("#resetAllBtn").addEventListener("click", () => {
  if (window.confirm("Сбросить все настройки карты, точки, контуры, новости и звуки?")) resetEverything();
});
drawRegionBtn.addEventListener("click", () => {
  if (!state.editMode) state.editMode = true;
  state.drawingRegion = !state.drawingRegion;
  render();
});
undoRegionPointBtn.addEventListener("click", () => {
  const location = state.locations[state.active];
  location.regionPoints ||= [];
  location.regionPoints.pop();
  render();
});
clearRegionBtn.addEventListener("click", () => {
  const location = state.locations[state.active];
  location.regionPoints = [];
  location.preview = false;
  render();
});
editZoomMinus.addEventListener("click", () => adjustEditZoom(-EDIT_ZOOM_STEP));
editZoomReset.addEventListener("click", () => resetMapFocus());
editZoomPlus.addEventListener("click", () => adjustEditZoom(EDIT_ZOOM_STEP));
document.querySelector("#shrinkRegionBtn").addEventListener("click", () => scaleActiveRegion(0.86));
document.querySelector("#expandRegionBtn").addEventListener("click", () => scaleActiveRegion(1.16));
document.querySelector("#centerRegionBtn").addEventListener("click", moveActiveRegionToMarker);
mapShell.addEventListener("click", handleMapShellClick);
editX.addEventListener("input", () => updateActiveEffectFromEditor());
editY.addEventListener("input", () => updateActiveEffectFromEditor());
editRadius.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));
highlightStyle.addEventListener("change", () => updateActiveEffectFromEditor({ preview: true }));
particleStyle.addEventListener("change", () => updateActiveEffectFromEditor({ preview: true }));
regionColor.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));
regionStroke.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));
regionGlow.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));
regionFill.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));
regionBlink.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));
regionLineStyle.addEventListener("change", () => updateActiveEffectFromEditor({ preview: true }));
regionParticleDensity.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));
regionParticleSize.addEventListener("input", () => updateActiveEffectFromEditor({ preview: true }));

document.querySelector("#completeBtn").addEventListener("click", completeActiveStage);
document.querySelector("#reopenBtn").addEventListener("click", reopenActiveStage);
document.querySelector("#nextStageBtn").addEventListener("click", nextStage);
document.querySelector("#previewChaosBtn").addEventListener("click", () => updateActiveEffectFromEditor({ preview: true }));
document.querySelector("#applyChaosBtn").addEventListener("click", () => updateActiveEffectFromEditor({ apply: true }));
document.querySelector("#resetChaosBtn").addEventListener("click", () => updateActiveEffectFromEditor({ reset: true }));

document.querySelector("#panicBtn").addEventListener("click", () => {
  playAlertSound("panic");
  showAlert("КРАСНЫЙ РЕЖИМ", "ОРДЕН РАССВЕТА ПРИБЛИЖАЕТСЯ");
});

document.querySelector("#presenterBtn").addEventListener("click", () => {
  state.editMode = false;
  state.drawingRegion = false;
  document.body.classList.add("presenter");
  render();
});

document.querySelector("#presenterExit").addEventListener("click", () => {
  document.body.classList.remove("presenter");
});

document.querySelector("#threatMinus").addEventListener("click", () => {
  state.threat = clamp(state.threat - 1, 0, 6);
  render();
});

document.querySelector("#threatPlus").addEventListener("click", () => {
  state.threat = clamp(state.threat + 1, 0, 6);
  render();
  if (state.threat >= 6) showAlert("ШКАЛА ЗАПОЛНЕНА", "ВСЕ ПОЛУЧАЮТ -1 HP");
});

document.querySelector("#damageBtn").addEventListener("click", () => {
  playAlertSound("damage");
  showAlert("ПРИКАЗ ОРДЕНА", "СИСТЕМА НАНОСИТ 1 УРОН ВСЕМ");
});

document.querySelector("#newsBtn").addEventListener("click", () => {
  const text = newsInput.value.trim();
  state.news = text || "Новости отсутствуют. Это подозрительно.";
  broadcastText.textContent = state.news;
  broadcastText.style.animation = "none";
  void broadcastText.offsetWidth;
  broadcastText.style.animation = "";
  saveState();
});

document.querySelector("#eventBtn").addEventListener("click", () => {
  const eventType = document.querySelector("#eventSelect").value;
  const [kicker, text] = eventCopy[eventType];
  const soundType = eventType === "chaos" ? "chaos" : eventType === "order" ? "damage" : eventType === "system" ? "stage" : "panic";
  playAlertSound(soundType);
  showAlert(kicker, text);
});

function attachSoundUpload(input, kind) {
  input.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.sounds ||= structuredClone(defaultState.sounds);
      state.sounds[kind] = reader.result;
      if (kind === "panic") state.soundUrl = reader.result;
      saveState();
    });
    reader.readAsDataURL(file);
  });
}

attachSoundUpload(soundUpload, "panic");
attachSoundUpload(stageSoundUpload, "stage");
attachSoundUpload(chaosSoundUpload, "chaos");
attachSoundUpload(damageSoundUpload, "damage");
attachSoundUpload(focusSoundUpload, "focus");

testSoundBtn.addEventListener("click", () => playAlertSound(soundTestSelect.value));

document.querySelector("#mapUpload").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.customMap = reader.result;
    render();
  });
  reader.readAsDataURL(file);
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  resetEverything();
});

editModalImageUpload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.locations[state.active].image = reader.result;
    editModalImagePreview.innerHTML = `<img src="${state.locations[state.active].image}" alt="" />`;
    render();
  });
  reader.readAsDataURL(file);
});

document.querySelector("#modalClose").addEventListener("click", closeLocationModal);
document.querySelector("#modalFocus").addEventListener("click", closeLocationModal);
document.querySelector("#editModalClose").addEventListener("click", closeLocationEditor);
document.querySelector("#editModalCancel").addEventListener("click", closeLocationEditor);
document.querySelector("#editModalSave").addEventListener("click", saveLocationEditor);
document.querySelector("#heroClose").addEventListener("click", closeHeroSpotlight);
document.querySelector("#modalComplete").addEventListener("click", () => {
  completeActiveStage();
  openLocationModal(state.active);
});
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeLocationModal();
});
editModalBackdrop.addEventListener("click", (event) => {
  if (event.target === editModalBackdrop) closeLocationEditor();
});
heroSpotlight.addEventListener("click", (event) => {
  if (event.target === heroSpotlight) closeHeroSpotlight();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLocationModal();
    closeLocationEditor();
    closeHeroSpotlight();
  }
  if (event.key === "ArrowLeft") setActive(state.active - 1);
  if (event.key === "ArrowRight") setActive(state.active + 1);
  if (event.key.toLowerCase() === "a") showAlert("КРАСНЫЙ РЕЖИМ", "ОРДЕН РАССВЕТА ПРИБЛИЖАЕТСЯ");
  if (event.key.toLowerCase() === "p") {
    state.editMode = false;
    state.drawingRegion = false;
    document.body.classList.toggle("presenter");
    render();
  }
});

render();
