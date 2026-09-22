import { PointLocation, ThicknessThresholds, ArenaSettings } from '../types';

export const DEFAULT_THRESHOLDS: ThicknessThresholds = {
  criticalMin: 25, // < 25 mm - Опасно тонкий (Красный)
  warningMin: 32,  // 25 - 32 mm - Ниже нормы (Оранжевый)
  optimalMin: 38,  // 33 - 42 mm - Оптимально для хоккея (Зеленый)
  warningMax: 46,  // 43 - 50 mm - Выше нормы (Синий)
  criticalMax: 55, // > 50 mm - Избыточно толстый (Фиолетовый)
};

export const DEFAULT_SETTINGS: ArenaSettings = {
  arenaName: 'Ледовая Арена "Северный Лед"',
  spreadsheetId: '',
  googleClientId: '',
  autoAdvance: true,
  soundFeedback: true,
  vibrateFeedback: true,
  bleServiceUuid: '0000ffe0-0000-1000-8000-00805f9b34fb', // Standard HM-10 UART Service
  bleCharacteristicUuid: '0000ffe1-0000-1000-8000-00805f9b34fb', // Notification characteristic
  thresholds: DEFAULT_THRESHOLDS,
};

// Preset 1: Standard 24 Points (30x60m official arena layout)
export const PRESET_STANDARD_24: PointLocation[] = [
  // Ворота левые и зона защиты
  { id: 'p1', number: 1, name: 'Ворота левые (створ)', x: 4.5, y: 15, zone: 'defending', description: 'Площадь ворот А' },
  { id: 'p2', number: 2, name: 'Ворота левые (за воротами)', x: 1.8, y: 15, zone: 'defending', description: 'Трапеция за воротами А' },
  { id: 'p3', number: 3, name: 'Угол левый верхний', x: 5, y: 5, zone: 'defending', description: 'Угол площадки А-верх' },
  { id: 'p4', number: 4, name: 'Угол левый нижний', x: 5, y: 25, zone: 'defending', description: 'Угол площадки А-низ' },
  { id: 'p5', number: 5, name: 'Круг вбрасывания А (верх)', x: 10, y: 8.5, zone: 'defending', description: 'Точка вбрасывания защита-верх' },
  { id: 'p6', number: 6, name: 'Круг вбрасывания А (низ)', x: 10, y: 21.5, zone: 'defending', description: 'Точка вбрасывания защита-низ' },
  { id: 'p7', number: 7, name: 'Пятак левый', x: 9, y: 15, zone: 'defending', description: 'Перед воротами А' },
  { id: 'p8', number: 8, name: 'Синяя линия А (верх)', x: 22.8, y: 5, zone: 'defending', description: 'Синяя линия левая у борта' },
  { id: 'p9', number: 9, name: 'Синяя линия А (центр)', x: 22.8, y: 15, zone: 'defending', description: 'Синяя линия левая по центру' },
  { id: 'p10', number: 10, name: 'Синяя линия А (низ)', x: 22.8, y: 25, zone: 'defending', description: 'Синяя линия левая у скамеек' },

  // Центральная зона (нейтральная)
  { id: 'p11', number: 11, name: 'Красная линия (верхний борт)', x: 30, y: 4, zone: 'neutral', description: 'Центр у дальнего борта' },
  { id: 'p12', number: 12, name: 'Центральный круг (точка)', x: 30, y: 15, zone: 'neutral', description: 'Центральная точка поля' },
  { id: 'p13', number: 13, name: 'Красная линия (нижний борт)', x: 30, y: 26, zone: 'neutral', description: 'Центр у судейской / скамеек' },
  { id: 'p14', number: 14, name: 'Точка вбрасывания нейтр. (верх-лево)', x: 26, y: 8.5, zone: 'neutral', description: 'Нейтральная зона верх' },
  { id: 'p15', number: 15, name: 'Точка вбрасывания нейтр. (низ-право)', x: 34, y: 21.5, zone: 'neutral', description: 'Нейтральная зона низ' },

  // Синяя линия правая и зона атаки
  { id: 'p16', number: 16, name: 'Синяя линия Б (верх)', x: 37.2, y: 5, zone: 'attacking', description: 'Синяя линия правая у борта' },
  { id: 'p17', number: 17, name: 'Синяя линия Б (центр)', x: 37.2, y: 15, zone: 'attacking', description: 'Синяя линия правая по центру' },
  { id: 'p18', number: 18, name: 'Синяя линия Б (низ)', x: 37.2, y: 25, zone: 'attacking', description: 'Синяя линия правая у скамеек' },
  { id: 'p19', number: 19, name: 'Пятак правый', x: 51, y: 15, zone: 'attacking', description: 'Перед воротами Б' },
  { id: 'p20', number: 20, name: 'Круг вбрасывания Б (верх)', x: 50, y: 8.5, zone: 'attacking', description: 'Точка вбрасывания атака-верх' },
  { id: 'p21', number: 21, name: 'Круг вбрасывания Б (низ)', x: 50, y: 21.5, zone: 'attacking', description: 'Точка вбрасывания атака-низ' },
  { id: 'p22', number: 22, name: 'Угол правый верхний', x: 55, y: 5, zone: 'attacking', description: 'Угол площадки Б-верх' },
  { id: 'p23', number: 23, name: 'Угол правый нижний', x: 55, y: 25, zone: 'attacking', description: 'Угол площадки Б-низ' },
  { id: 'p24', number: 24, name: 'Ворота правые (створ)', x: 55.5, y: 15, zone: 'attacking', description: 'Площадь ворот Б' },
];

// Preset 2: Fast 12 Points (Экспресс-проверка)
export const PRESET_FAST_12: PointLocation[] = [
  { id: 'p1', number: 1, name: 'Ворота левые', x: 4.5, y: 15, zone: 'defending', description: 'Площадь ворот А' },
  { id: 'p2', number: 2, name: 'Угол левый верх', x: 6, y: 5, zone: 'defending', description: 'Угол А-верх' },
  { id: 'p3', number: 3, name: 'Угол левый низ', x: 6, y: 25, zone: 'defending', description: 'Угол А-низ' },
  { id: 'p4', number: 4, name: 'Круг вбрасывания А-верх', x: 10, y: 8.5, zone: 'defending', description: 'Круг вбрасывания' },
  { id: 'p5', number: 5, name: 'Круг вбрасывания А-низ', x: 10, y: 21.5, zone: 'defending', description: 'Круг вбрасывания' },
  { id: 'p6', number: 6, name: 'Центральный круг', x: 30, y: 15, zone: 'neutral', description: 'Центр площадки' },
  { id: 'p7', number: 7, name: 'Центр у борта верх', x: 30, y: 4, zone: 'neutral', description: 'Красная линия у борта' },
  { id: 'p8', number: 8, name: 'Центр у борта низ', x: 30, y: 26, zone: 'neutral', description: 'Красная линия у скамеек' },
  { id: 'p9', number: 9, name: 'Круг вбрасывания Б-верх', x: 50, y: 8.5, zone: 'attacking', description: 'Круг вбрасывания' },
  { id: 'p10', number: 10, name: 'Круг вбрасывания Б-низ', x: 50, y: 21.5, zone: 'attacking', description: 'Круг вбрасывания' },
  { id: 'p11', number: 11, name: 'Ворота правые', x: 55.5, y: 15, zone: 'attacking', description: 'Площадь ворот Б' },
  { id: 'p12', number: 12, name: 'Пятак Б', x: 51, y: 15, zone: 'attacking', description: 'Перед воротами Б' },
];

export const DEFAULT_POINTS = PRESET_STANDARD_24;

export const POINT_PRESETS = [
  { id: 'standard_24', title: 'Стандартная сетка (24 точки)', points: PRESET_STANDARD_24 },
  { id: 'fast_12', title: 'Экспресс-контроль (12 точек)', points: PRESET_FAST_12 },
];

