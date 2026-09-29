import { PointLocation, ThicknessThresholds, ArenaSettings } from '../types';
import { Language } from '../i18n/translations';

export const DEFAULT_THRESHOLDS: ThicknessThresholds = {
  criticalMin: 25, // < 25 mm - Опасно тонкий (Красный)
  warningMin: 32,  // 25 - 32 mm - Ниже нормы (Оранжевый)
  optimalMin: 38,  // 32 - 46 mm - Оптимально для хоккея (Зеленый)
  warningMax: 46,  // > 46 mm - Выше нормы
  criticalMax: 55, // > 55 mm - Избыточно толстый (Фиолетовый)
};

export const DEFAULT_ARENA_NAMES: Record<Language, string> = {
  ru: 'Ледовая арена',
  lv: 'Ledus arēna',
  en: 'Ice Arena',
};

export const DEFAULT_SETTINGS: ArenaSettings = {
  arenaName: 'Ледовая арена',
  spreadsheetId: '',
  googleClientId: '',
  autoAdvance: true,
  soundFeedback: true,
  vibrateFeedback: true,
  bleServiceUuid: '0000ffe0-0000-1000-8000-00805f9b34fb', // Standard HM-10 UART Service
  bleCharacteristicUuid: '0000ffe1-0000-1000-8000-00805f9b34fb', // Notification characteristic
  thresholds: DEFAULT_THRESHOLDS,
};

// Localized names for the 25 standard measurement points
export const STANDARD_25_NAMES: Record<number, Record<Language, string>> = {
  1: {
    ru: 'Зона защиты — верхний левый угол',
    lv: 'Aizsardzības zona — augšējais kreisais stūris',
    en: 'Defending Zone — Top Left Corner',
  },
  2: {
    ru: 'Зона защиты — у линии ворот (верх)',
    lv: 'Aizsardzības zona — pie vārtu līnijas (augšā)',
    en: 'Defending Zone — Goal Line (Upper)',
  },
  3: {
    ru: 'За левыми воротами',
    lv: 'Aiz kreisajiem vārtiem',
    en: 'Behind Left Goal',
  },
  4: {
    ru: 'Зона защиты — у линии ворот (низ)',
    lv: 'Aizsardzības zona — pie vārtu līnijas (apakšā)',
    en: 'Defending Zone — Goal Line (Lower)',
  },
  5: {
    ru: 'Зона защиты — нижний левый угол',
    lv: 'Aizsardzības zona — apakšējais kreisais stūris',
    en: 'Defending Zone — Bottom Left Corner',
  },
  6: {
    ru: 'Круг вбрасывания левый (низ)',
    lv: 'Kreisais iemetiena aplis (apakšā)',
    en: 'Left Face-Off Circle (Bottom)',
  },
  7: {
    ru: 'Пятак перед левыми воротами',
    lv: 'Laukums pie kreisajiem vārtiem',
    en: 'Left Slot (In Front of Goal)',
  },
  8: {
    ru: 'Круг вбрасывания левый (верх)',
    lv: 'Kreisais iemetiena aplis (augšā)',
    en: 'Left Face-Off Circle (Top)',
  },
  9: {
    ru: 'Синяя линия левая (верхний борт)',
    lv: 'Kreisā zilā līnija (augšējā apmale)',
    en: 'Left Blue Line (Top Boards)',
  },
  10: {
    ru: 'Синяя линия левая (верх-центр)',
    lv: 'Kreisā zilā līnija (augšdaļa)',
    en: 'Left Blue Line (Upper Middle)',
  },
  11: {
    ru: 'Синяя линия левая (низ-центр)',
    lv: 'Kreisā zilā līnija (apakšdaļa)',
    en: 'Left Blue Line (Lower Middle)',
  },
  12: {
    ru: 'Синяя линия левая (нижний борт)',
    lv: 'Kreisā zilā līnija (apakšējā apmale)',
    en: 'Left Blue Line (Bottom Boards)',
  },
  13: {
    ru: 'Центральный круг (центр поля)',
    lv: 'Centrālais aplis (laukuma centrs)',
    en: 'Center Ice Circle',
  },
  14: {
    ru: 'Синяя линия правая (верхний борт)',
    lv: 'Labā zilā līnija (augšējā apmale)',
    en: 'Right Blue Line (Top Boards)',
  },
  15: {
    ru: 'Синяя линия правая (верх-центр)',
    lv: 'Labā zilā līnija (augšdaļa)',
    en: 'Right Blue Line (Upper Middle)',
  },
  16: {
    ru: 'Синяя линия правая (низ-центр)',
    lv: 'Labā zilā līnija (apakšdaļa)',
    en: 'Right Blue Line (Lower Middle)',
  },
  17: {
    ru: 'Синяя линия правая (нижний борт)',
    lv: 'Labā zilā līnija (apakšējā apmale)',
    en: 'Right Blue Line (Bottom Boards)',
  },
  18: {
    ru: 'Круг вбрасывания правый (низ)',
    lv: 'Labais iemetiena aplis (apakšā)',
    en: 'Right Face-Off Circle (Bottom)',
  },
  19: {
    ru: 'Пятак перед правыми воротами',
    lv: 'Laukums pie labajiem vārtiem',
    en: 'Right Slot (In Front of Goal)',
  },
  20: {
    ru: 'Круг вбрасывания правый (верх)',
    lv: 'Labais iemetiena aplis (augšā)',
    en: 'Right Face-Off Circle (Top)',
  },
  21: {
    ru: 'Зона атаки — верхний правый угол',
    lv: 'Uzbrukuma zona — augšējais labais stūris',
    en: 'Attacking Zone — Top Right Corner',
  },
  22: {
    ru: 'Зона атаки — у линии ворот (верх)',
    lv: 'Uzbrukuma zona — pie vārtu līnijas (augšā)',
    en: 'Attacking Zone — Goal Line (Upper)',
  },
  23: {
    ru: 'За правыми воротами',
    lv: 'Aiz labajiem vārtiem',
    en: 'Behind Right Goal',
  },
  24: {
    ru: 'Зона атаки — у линии ворот (низ)',
    lv: 'Uzbrukuma zona — pie vārtu līnijas (apakšā)',
    en: 'Attacking Zone — Goal Line (Lower)',
  },
  25: {
    ru: 'Зона атаки — нижний правый угол',
    lv: 'Uzbrukuma zona — apakšējais labais stūris',
    en: 'Attacking Zone — Bottom Right Corner',
  },
};

// Legacy/preset Russian point names mapping to localized strings
const LEGACY_POINT_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Ворота левые (створ)': {
    ru: 'Ворота левые (створ)',
    lv: 'Kreisie vārti',
    en: 'Left Goal Crease',
  },
  'Ворота левые': {
    ru: 'Ворота левые',
    lv: 'Kreisie vārti',
    en: 'Left Goal',
  },
  'Ворота левые (за воротами)': {
    ru: 'За левыми воротами',
    lv: 'Aiz kreisajiem vārtiem',
    en: 'Behind Left Goal',
  },
  'Угол левый верхний': {
    ru: 'Угол левый верхний',
    lv: 'Augšējais kreisais stūris',
    en: 'Top Left Corner',
  },
  'Угол левый верх': {
    ru: 'Угол левый верх',
    lv: 'Augšējais kreisais stūris',
    en: 'Top Left Corner',
  },
  'Угол левый нижний': {
    ru: 'Угол левый нижний',
    lv: 'Apakšējais kreisais stūris',
    en: 'Bottom Left Corner',
  },
  'Угол левый низ': {
    ru: 'Угол левый низ',
    lv: 'Apakšējais kreisais stūris',
    en: 'Bottom Left Corner',
  },
  'Круг вбрасывания А (верх)': {
    ru: 'Круг вбрасывания левый (верх)',
    lv: 'Kreisais iemetiena aplis (augšā)',
    en: 'Left Face-Off Circle (Top)',
  },
  'Круг вбрасывания А-верх': {
    ru: 'Круг вбрасывания левый (верх)',
    lv: 'Kreisais iemetiena aplis (augšā)',
    en: 'Left Face-Off Circle (Top)',
  },
  'Круг вбрасывания А (низ)': {
    ru: 'Круг вбрасывания левый (низ)',
    lv: 'Kreisais iemetiena aplis (apakšā)',
    en: 'Left Face-Off Circle (Bottom)',
  },
  'Круг вбрасывания А-низ': {
    ru: 'Круг вбрасывания левый (низ)',
    lv: 'Kreisais iemetiena aplis (apakšā)',
    en: 'Left Face-Off Circle (Bottom)',
  },
  'Пятак левый': {
    ru: 'Пятак перед левыми воротами',
    lv: 'Laukums pie kreisajiem vārtiem',
    en: 'Left Slot',
  },
  'Центральный круг': {
    ru: 'Центральный круг',
    lv: 'Centrālais aplis',
    en: 'Center Circle',
  },
  'Центр у борта верх': {
    ru: 'Центр у верхнего борта',
    lv: 'Centrs pie augšējās apmales',
    en: 'Center Top Boards',
  },
  'Центр у борта низ': {
    ru: 'Центр у нижнего борта',
    lv: 'Centrs pie apakšējās apmales',
    en: 'Center Bottom Boards',
  },
  'Круг вбрасывания Б-верх': {
    ru: 'Круг вбрасывания правый (верх)',
    lv: 'Labais iemetiena aplis (augšā)',
    en: 'Right Face-Off Circle (Top)',
  },
  'Круг вбрасывания Б-низ': {
    ru: 'Круг вбрасывания правый (низ)',
    lv: 'Labais iemetiena aplis (apakšā)',
    en: 'Right Face-Off Circle (Bottom)',
  },
  'Ворота правые': {
    ru: 'Ворота правые',
    lv: 'Labie vārti',
    en: 'Right Goal',
  },
  'Пятак Б': {
    ru: 'Пятак перед правыми воротами',
    lv: 'Laukums pie labajiem vārtiem',
    en: 'Right Slot',
  },
};

export function getLocalizedPointName(
  point: PointLocation | null | undefined,
  lang: Language
): string {
  if (!point) return '';
  const num = Number(point.number);
  const rawName = (point.name || '').trim();

  // Check if point name matches any of the standard 25 names in any language
  const stdEntry = STANDARD_25_NAMES[num];
  if (stdEntry) {
    if (
      !rawName ||
      rawName === stdEntry.ru ||
      rawName === stdEntry.lv ||
      rawName === stdEntry.en ||
      /^point\s*\d+$/i.test(rawName) ||
      /^точка\s*№?\d+$/i.test(rawName) ||
      /^punkts\s*nr\.?\s*\d+$/i.test(rawName)
    ) {
      return stdEntry[lang] || stdEntry.ru;
    }
  }

  // Check legacy dictionary
  if (LEGACY_POINT_TRANSLATIONS[rawName]) {
    return LEGACY_POINT_TRANSLATIONS[rawName][lang] || rawName;
  }

  // Check if it matches any other number's standard name
  for (const key of Object.keys(STANDARD_25_NAMES)) {
    const entry = STANDARD_25_NAMES[Number(key)];
    if (rawName === entry.ru || rawName === entry.lv || rawName === entry.en) {
      return entry[lang] || rawName;
    }
  }

  if (/^point\s*(\d+)$/i.test(rawName)) {
    const n = rawName.match(/\d+/)?.[0] || num;
    return lang === 'lv' ? `Punkts Nr. ${n}` : lang === 'en' ? `Point #${n}` : `Точка №${n}`;
  }

  return rawName;
}

export function getLocalizedArenaName(arenaName: string | undefined, lang: Language): string {
  const trimmed = (arenaName || '').trim();
  const defaultNames = [
    '',
    'Ледовая арена',
    'Ледовая Арена',
    'Ледовая Арена "Северный Лед"',
    'Лёд',
    'Ledus arēna',
    'Ice Arena',
  ];
  if (defaultNames.includes(trimmed)) {
    return DEFAULT_ARENA_NAMES[lang] || DEFAULT_ARENA_NAMES.ru;
  }
  return trimmed;
}

// Preset 1: Standard 25 Points (Exact layout & sequence from user's protocol diagram)
export const PRESET_STANDARD_25: PointLocation[] = [
  // Левый край (линия ворот и углы: сверху вниз 1 -> 5)
  { id: 'p1', number: 1, name: STANDARD_25_NAMES[1].ru, x: 5.3, y: 2.4, zone: 'defending' },
  { id: 'p2', number: 2, name: STANDARD_25_NAMES[2].ru, x: 5.1, y: 9.8, zone: 'defending' },
  { id: 'p3', number: 3, name: STANDARD_25_NAMES[3].ru, x: 1.8, y: 14.3, zone: 'defending' },
  { id: 'p4', number: 4, name: STANDARD_25_NAMES[4].ru, x: 5.1, y: 19.3, zone: 'defending' },
  { id: 'p5', number: 5, name: STANDARD_25_NAMES[5].ru, x: 5.3, y: 27.6, zone: 'defending' },

  // Левые круги вбрасывания и пятак (снизу вверх 6 -> 8)
  { id: 'p6', number: 6, name: STANDARD_25_NAMES[6].ru, x: 10.0, y: 21.5, zone: 'defending' },
  { id: 'p7', number: 7, name: STANDARD_25_NAMES[7].ru, x: 9.7, y: 15.0, zone: 'defending' },
  { id: 'p8', number: 8, name: STANDARD_25_NAMES[8].ru, x: 10.0, y: 8.0, zone: 'defending' },

  // Вдоль левой синей линии (сверху вниз 9 -> 12)
  { id: 'p9', number: 9, name: STANDARD_25_NAMES[9].ru, x: 21.6, y: 1.7, zone: 'defending' },
  { id: 'p10', number: 10, name: STANDARD_25_NAMES[10].ru, x: 21.3, y: 9.4, zone: 'defending' },
  { id: 'p11', number: 11, name: STANDARD_25_NAMES[11].ru, x: 21.6, y: 21.1, zone: 'defending' },
  { id: 'p12', number: 12, name: STANDARD_25_NAMES[12].ru, x: 21.6, y: 28.6, zone: 'defending' },

  // Центр поля (13)
  { id: 'p13', number: 13, name: STANDARD_25_NAMES[13].ru, x: 30.0, y: 15.0, zone: 'neutral' },

  // Вдоль правой синей линии (сверху вниз 14 -> 17)
  { id: 'p14', number: 14, name: STANDARD_25_NAMES[14].ru, x: 38.8, y: 1.7, zone: 'attacking' },
  { id: 'p15', number: 15, name: STANDARD_25_NAMES[15].ru, x: 38.7, y: 9.4, zone: 'attacking' },
  { id: 'p16', number: 16, name: STANDARD_25_NAMES[16].ru, x: 39.1, y: 20.6, zone: 'attacking' },
  { id: 'p17', number: 17, name: STANDARD_25_NAMES[17].ru, x: 38.8, y: 28.4, zone: 'attacking' },

  // Правые круги вбрасывания и пятак (снизу вверх 18 -> 20)
  { id: 'p18', number: 18, name: STANDARD_25_NAMES[18].ru, x: 50.0, y: 21.8, zone: 'attacking' },
  { id: 'p19', number: 19, name: STANDARD_25_NAMES[19].ru, x: 49.0, y: 15.0, zone: 'attacking' },
  { id: 'p20', number: 20, name: STANDARD_25_NAMES[20].ru, x: 50.0, y: 8.5, zone: 'attacking' },

  // Правый край (линия ворот и углы: сверху вниз 21 -> 25)
  { id: 'p21', number: 21, name: STANDARD_25_NAMES[21].ru, x: 54.8, y: 2.3, zone: 'attacking' },
  { id: 'p22', number: 22, name: STANDARD_25_NAMES[22].ru, x: 55.6, y: 10.4, zone: 'attacking' },
  { id: 'p23', number: 23, name: STANDARD_25_NAMES[23].ru, x: 58.6, y: 15.0, zone: 'attacking' },
  { id: 'p24', number: 24, name: STANDARD_25_NAMES[24].ru, x: 54.8, y: 21.1, zone: 'attacking' },
  { id: 'p25', number: 25, name: STANDARD_25_NAMES[25].ru, x: 55.2, y: 27.8, zone: 'attacking' },
];

// Keep alias for backwards compatibility
export const PRESET_STANDARD_24 = PRESET_STANDARD_25;

// Preset 2: Fast 12 Points (Экспресс-проверка)
export const PRESET_FAST_12: PointLocation[] = [
  { id: 'p1', number: 1, name: 'Ворота левые', x: 4.5, y: 15, zone: 'defending' },
  { id: 'p2', number: 2, name: 'Угол левый верх', x: 6, y: 5, zone: 'defending' },
  { id: 'p3', number: 3, name: 'Угол левый низ', x: 6, y: 25, zone: 'defending' },
  { id: 'p4', number: 4, name: 'Круг вбрасывания А-верх', x: 10, y: 8.5, zone: 'defending' },
  { id: 'p5', number: 5, name: 'Круг вбрасывания А-низ', x: 10, y: 21.5, zone: 'defending' },
  { id: 'p6', number: 6, name: 'Центральный круг', x: 30, y: 15, zone: 'neutral' },
  { id: 'p7', number: 7, name: 'Центр у борта верх', x: 30, y: 4, zone: 'neutral' },
  { id: 'p8', number: 8, name: 'Центр у борта низ', x: 30, y: 26, zone: 'neutral' },
  { id: 'p9', number: 9, name: 'Круг вбрасывания Б-верх', x: 50, y: 8.5, zone: 'attacking' },
  { id: 'p10', number: 10, name: 'Круг вбрасывания Б-низ', x: 50, y: 21.5, zone: 'attacking' },
  { id: 'p11', number: 11, name: 'Ворота правые', x: 55.5, y: 15, zone: 'attacking' },
  { id: 'p12', number: 12, name: 'Пятак Б', x: 51, y: 15, zone: 'attacking' },
];

export const DEFAULT_POINTS = PRESET_STANDARD_25;

export const POINT_PRESETS = [
  { id: 'standard_25', title: 'Стандартная сетка (25 точек)', points: PRESET_STANDARD_25 },
  { id: 'fast_12', title: 'Экспресс-контроль (12 точек)', points: PRESET_FAST_12 },
];
