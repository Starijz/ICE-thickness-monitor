export type Language = 'lv' | 'en' | 'ru';

export interface Translations {
  // App
  appTitle: string;
  appSubtitle: string;
  language: string;

  // Header
  history: string;
  points: string;
  settings: string;
  installApp: string;
  newSession: string;
  saveSession: string;
  resetSession: string;
  exportPng: string;
  syncGoogle: string;
  resyncGoogle: string;
  syncing: string;
  synced: string;
  notSynced: string;
  offlineQueue: string;
  localQueue: string;
  online: string;
  offline: string;

  // Caliper Panel
  caliperTitle: string;
  bleStatus: {
    disconnected: string;
    searching: string;
    connecting: string;
    connected: string;
    error: string;
  };
  connectBle: string;
  disconnectBle: string;
  connected: string;
  disconnected: string;
  simulateBle: string;
  manualInput: string;
  activePoint: string;
  pointCoord: string;
  autoAdvance: string;
  sound: string;
  nextPoint: string;
  prevPoint: string;
  measured: string;
  notMeasured: string;
  waitingReading: string;

  // Hockey Rink
  defendingZone: string;
  neutralZone: string;
  attackingZone: string;
  goalA: string;
  goalB: string;
  rinkTip: string;
  editModeTip: string;
  editPositions: string;
  finishEdit: string;
  rinkSchemeTitle: string;
  clickToSelect: string;
  movePointsMode: string;
  clickToMove: string;

  // Stats
  statistics: string;
  progress: string;
  minimum: string;
  maximum: string;
  average: string;
  delta: string;
  optimalIce: string;
  pointsMeasured: string;

  // Thresholds Legend
  legend: string;
  criticallyThin: string;
  belowNormal: string;
  optimal: string;
  aboveNormal: string;
  criticallyThick: string;

  // Manual Input Modal
  manualInputTitle: string;
  quickPresets: string;
  selectPoint: string;
  saveAndNext: string;
  allPoints: string;
  cancel: string;
  apply: string;
  clear: string;
  enterThickness: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  tabGeneral: string;
  tabSheets: string;
  tabBle: string;
  tabGuide: string;
  arenaNameLabel: string;
  spreadsheetIdLabel: string;
  spreadsheetIdHelp: string;
  googleClientIdLabel: string;
  googleClientIdHelp: string;
  signInGoogle: string;
  signOutGoogle: string;
  testConnection: string;
  testingConnection: string;
  connectionSuccess: string;
  connectionFailed: string;
  bleServiceUuidLabel: string;
  bleCharUuidLabel: string;
  thresholdsTitle: string;
  resetDefaults: string;
  saveSettings: string;
  settingsSaved: string;
  authorizedAs: string;
  notAuthorized: string;

  // Admin Points Modal
  pointsAdminTitle: string;
  pointsAdminSubtitle: string;
  presetStandard24: string;
  presetFast12: string;
  addPoint: string;
  pointNumber: string;
  pointName: string;
  pointZone: string;
  pointX: string;
  pointY: string;
  delete: string;
  savePoints: string;
  pointsUpdated: string;
  actions: string;

  // History Modal
  historyTitle: string;
  historySubtitle: string;
  noSessions: string;
  loadSession: string;
  viewOnRink: string;
  sessionLoaded: string;
  deleteSession: string;
  sessionDeleted: string;
  resync: string;
  exportCsv: string;
  date: string;
  readings: string;
  inGoogleSheet: string;
  close: string;

  // Export Modal
  exportTitle: string;
  exportSubtitle: string;
  exportModalTitle: string;
  exportModalSubtitle: string;
  downloadPng: string;
  copyClipboard: string;
  copyImage: string;
  copied: string;
  generatingImage: string;
  imageGenFailed: string;

  // Notifications & Prompts
  sessionSavedLocally: string;
  sessionSyncedGoogle: string;
  syncSuccess: string;
  syncError: string;
  noMeasurementsToSave: string;
  googleLoginRequired: string;
  googleLoginSuccess: string;
  googleLoginError: string;
  confirmNewSession: string;
  confirmResetSession: string;
  confirmResetSettings: string;
  confirmDeleteSession: string;
  bleNotSupported: string;
  noPointsToSave: string;
  newSessionStarted: string;
  sessionStarted: string;
  quickPromptSignInTitle: string;
  quickPromptSignInDesc: string;
}

export const translations: Record<Language, Translations> = {
  lv: {
    appTitle: 'Ice Thickness Monitor',
    appSubtitle: 'Ledus biezuma mērīšana un vizualizācija',
    language: 'Valoda',

    // Header
    history: 'Vēsture',
    points: 'Punkti',
    settings: 'Iestatījumi',
    installApp: 'Instalēt PWA',
    newSession: 'Jauna sesija',
    saveSession: 'Saglabāt sesiju',
    resetSession: 'Sākt no jauna',
    exportPng: 'Eksportēt shēmu',
    syncGoogle: 'Sinhronizēt ar Google',
    resyncGoogle: 'Atkārtot sinhronizāciju',
    syncing: 'Sinhronizē...',
    synced: 'Sinhronizēts',
    notSynced: 'Nav sinhronizēts',
    offlineQueue: 'Rindā',
    localQueue: 'Lokālā rinda',
    online: 'Tiešsaistē',
    offline: 'Bezsaistē',

    // Caliper Panel
    caliperTitle: 'Bluetooth bībmērs',
    bleStatus: {
      disconnected: 'Atvienots',
      searching: 'Meklē ierīces...',
      connecting: 'Pieslēdzas...',
      connected: 'Pieslēgts',
      error: 'Kļūda',
    },
    connectBle: 'Pieslēgt bībmēru',
    disconnectBle: 'Atvienot',
    connected: 'pieslēgts',
    disconnected: 'Bībmērs atvienots',
    simulateBle: 'Simulēt mērījumu',
    manualInput: 'Manuāla ievade',
    activePoint: 'Aktīvais punkts',
    pointCoord: 'Koordinātas',
    autoAdvance: 'Auto-pāreja',
    sound: 'Skaņa',
    nextPoint: 'Nākamais punkts',
    prevPoint: 'Iepriekšējais',
    measured: 'Izmērīts',
    notMeasured: 'Nav mērīts',
    waitingReading: 'Gaida datus no bībmēra...',

    // Hockey Rink
    defendingZone: 'Aizsardzības zona',
    neutralZone: 'Neitrālā zona',
    attackingZone: 'Uzbrukuma zona',
    goalA: 'Vārti A',
    goalB: 'Vārti B',
    rinkTip: 'Uzklikšķiniet uz punkta laukumā, lai veiktu mērījumu',
    editModeTip: 'Klikšķiniet laukumā, lai pārvietotu izvēlēto punktu',
    editPositions: 'Rediģēt punktu vietas',
    finishEdit: 'Pabeigt rediģēšanu',
    rinkSchemeTitle: 'Ledus laukuma shēma 30×60 m',
    clickToSelect: 'Noklikšķiniet uz punkta, lai to izvēlētos',
    movePointsMode: 'Punktu pārvietošanas režīms',
    clickToMove: 'Noklikšķiniet laukumā, lai pārvietotu punktu',

    // Stats
    statistics: 'Sesijas statistika',
    progress: 'Progress',
    minimum: 'Minimums',
    maximum: 'Maksimums',
    average: 'Vidējais',
    delta: 'Starpība',
    optimalIce: 'Normas robežās',
    pointsMeasured: 'izmērīti punkti',

    // Thresholds Legend
    legend: 'Biezuma skala (mm)',
    criticallyThin: 'Kritiski plāns',
    belowNormal: 'Zem normas',
    optimal: 'Optimāls ledus',
    aboveNormal: 'Virs normas',
    criticallyThick: 'Pārāk biezs',

    // Manual Input Modal
    manualInputTitle: 'Manuāla biezuma ievade',
    quickPresets: 'Ātrās vērtības',
    selectPoint: 'Izvēlēties punktu',
    saveAndNext: 'Saglabāt un tālāk',
    allPoints: 'Visi punkti',
    cancel: 'Atcelt',
    apply: 'Piemērot',
    clear: 'Notīrīt',
    enterThickness: 'Ievadiet biezumu milimetros (mm)',

    // Settings Modal
    settingsTitle: 'Lietotnes iestatījumi',
    settingsSubtitle: 'Arēnas, Google Izklājlapu, BLE un sliekšņu konfigurācija',
    tabGeneral: 'Vispārīgi',
    tabSheets: 'Google Izklājlapa',
    tabBle: 'Bluetooth BLE',
    tabGuide: 'Google pamācība',
    arenaNameLabel: 'Arēnas nosaukums',
    spreadsheetIdLabel: 'Google Izklājlapas ID vai saite (URL)',
    spreadsheetIdHelp: 'Var iekopēt pilnu saiti no pārlūka vai tikai ID starp /d/ un /edit',
    googleClientIdLabel: 'Google OAuth Client ID',
    googleClientIdHelp: 'Izveidots Google Cloud Console ar Web Application tipu',
    signInGoogle: 'Pieslēgties ar Google',
    signOutGoogle: 'Izrakstīties no Google',
    testConnection: 'Pārbaudīt savienojumu ar tabulu',
    testingConnection: 'Pārbauda savienojumu...',
    connectionSuccess: 'Savienojums veiksmīgs! Tabula atrasta.',
    connectionFailed: 'Neizdevās izveidot savienojumu ar tabulu',
    bleServiceUuidLabel: 'BLE Service UUID (HM-10 noklusējums: 0xFFE0)',
    bleCharUuidLabel: 'BLE Characteristic UUID (HM-10 noklusējums: 0xFFE1)',
    thresholdsTitle: 'Biezuma robežvērtības (mm)',
    resetDefaults: 'Atiestatīt noklusējumus',
    saveSettings: 'Saglabāt iestatījumus',
    settingsSaved: 'Iestatījumi saglabāti',
    authorizedAs: 'Autorizēts Google kontā',
    notAuthorized: 'Nav autorizēts Google kontā',

    // Admin Points Modal
    pointsAdminTitle: 'Mērījumu punktu pārvaldība',
    pointsAdminSubtitle: 'Rediģējiet punktu numurus, nosaukumus un koordinātas uz 30×60m laukuma',
    presetStandard24: 'Standarta 24 punkti',
    presetFast12: 'Ekspress 12 punkti',
    addPoint: 'Pievienot punktu',
    pointNumber: 'Nr.',
    pointName: 'Nosaukums',
    pointZone: 'Zona',
    pointX: 'X (m)',
    pointY: 'Y (m)',
    delete: 'Dzēst',
    savePoints: 'Saglabāt punktus',
    pointsUpdated: 'Punktu saraksts atjaunināts',
    actions: 'Darbības',

    // History Modal
    historyTitle: 'Mērījumu vēsture',
    historySubtitle: 'Iepriekšējās mērījumu sesijas un eksports',
    noSessions: 'Nav saglabātu sesiju. Veiciet mērījumus un noklikšķiniet «Saglabāt sesiju».',
    loadSession: 'Atvērt laukumā',
    viewOnRink: 'Skatīt laukumā',
    sessionLoaded: 'Ielādēta sesija:',
    deleteSession: 'Dzēst',
    sessionDeleted: 'Sesija dzēsta',
    resync: 'Sinhronizēt ar Google',
    exportCsv: 'Eksportēt CSV',
    date: 'Datums un laiks',
    readings: 'Mērījumi',
    inGoogleSheet: 'Google Tabulā',
    close: 'Aizvērt',

    // Export Modal
    exportTitle: 'Shēmas eksports (PNG)',
    exportSubtitle: 'Augstas izšķirtspējas laukuma shēma ar mērījumiem un statistiku',
    exportModalTitle: 'Shēmas eksports (PNG)',
    exportModalSubtitle: 'Augstas izšķirtspējas laukuma shēma ar mērījumiem un statistiku',
    downloadPng: 'Lejupielādēt PNG',
    copyClipboard: 'Kopēt starpliktuvē',
    copyImage: 'Kopēt attēlu',
    copied: 'Nokopēts starpliktuvē!',
    generatingImage: 'Ģenerē augstas izšķirtspējas attēlu...',
    imageGenFailed: 'Neizdevās izveidot attēlu',

    // Notifications & Prompts
    sessionSavedLocally: 'Sesija saglabāta lokāli un pievienota nosūtīšanas rindai.',
    sessionSyncedGoogle: 'Sesija veiksmīgi sinhronizēta ar Google Izklājlapu!',
    syncSuccess: 'Dati veiksmīgi sinhronizēti ar Google Izklājlapu',
    syncError: 'Sinhronizācijas kļūda',
    noMeasurementsToSave: 'Nav veikts neviens mērījums, ko saglabāt',
    googleLoginRequired: 'Lai sinhronizētu ar Google Izklājlapu, nepieciešama autorizācija.',
    googleLoginSuccess: 'Google autorizācija veiksmīga!',
    googleLoginError: 'Google autorizācijas kļūda',
    confirmNewSession: 'Sākt jaunu sesiju? Pašreizējie nesaglabātie mērījumi tiks nodzēsti.',
    confirmResetSession: 'Sākt jaunu sesiju? Pašreizējie nesaglabātie mērījumi tiks nodzēsti.',
    confirmResetSettings: 'Atiestatīt visus iestatījumus uz noklusējuma vērtībām?',
    confirmDeleteSession: 'Vai tiešām vēlaties dzēst šo sesiju no vēstures?',
    bleNotSupported: 'Web Bluetooth API netiek atbalstīts šajā pārlūkā. Izmantojiet Chrome vai Edge.',
    noPointsToSave: 'Nav veikts neviens mērījums, ko saglabāt.',
    newSessionStarted: 'Sākta jauna mērījumu sesija.',
    sessionStarted: 'Sākta jauna mērījumu sesija',
    quickPromptSignInTitle: 'Pieslēgties Google Izklājlapai?',
    quickPromptSignInDesc: 'Lai mērījumu dati tiktu automātiski ierakstīti jūsu tabulā, autorizējieties ar Google kontu.',
  },

  en: {
    appTitle: 'Ice Thickness Monitor',
    appSubtitle: 'Ice arena thickness measurement and visualization',
    language: 'Language',

    // Header
    history: 'History',
    points: 'Points',
    settings: 'Settings',
    installApp: 'Install PWA',
    newSession: 'New Session',
    saveSession: 'Save Session',
    resetSession: 'Reset Session',
    exportPng: 'Export Diagram',
    syncGoogle: 'Sync with Google',
    resyncGoogle: 'Retry Sync',
    syncing: 'Syncing...',
    synced: 'Synced',
    notSynced: 'Not synced',
    offlineQueue: 'Queued',
    localQueue: 'Local Queue',
    online: 'Online',
    offline: 'Offline',

    // Caliper Panel
    caliperTitle: 'Bluetooth Caliper',
    bleStatus: {
      disconnected: 'Disconnected',
      searching: 'Searching for devices...',
      connecting: 'Connecting...',
      connected: 'Connected',
      error: 'Error',
    },
    connectBle: 'Connect Caliper',
    disconnectBle: 'Disconnect',
    connected: 'connected',
    disconnected: 'Caliper disconnected',
    simulateBle: 'Simulate Reading',
    manualInput: 'Manual Input',
    activePoint: 'Active Point',
    pointCoord: 'Coordinates',
    autoAdvance: 'Auto-advance',
    sound: 'Sound',
    nextPoint: 'Next Point',
    prevPoint: 'Previous',
    measured: 'Measured',
    notMeasured: 'Not measured',
    waitingReading: 'Waiting for caliper data...',

    // Hockey Rink
    defendingZone: 'Defending Zone',
    neutralZone: 'Neutral Zone',
    attackingZone: 'Attacking Zone',
    goalA: 'Goal A',
    goalB: 'Goal B',
    rinkTip: 'Click on a point on the rink to measure or inspect',
    editModeTip: 'Click on the rink to reposition the selected point',
    editPositions: 'Edit point positions',
    finishEdit: 'Finish editing',
    rinkSchemeTitle: 'Ice Rink Diagram 30×60 m',
    clickToSelect: 'Click on any point to select',
    movePointsMode: 'Reposition Points Mode',
    clickToMove: 'Click anywhere on the rink to place point',

    // Stats
    statistics: 'Session Statistics',
    progress: 'Progress',
    minimum: 'Minimum',
    maximum: 'Maximum',
    average: 'Average',
    delta: 'Delta',
    optimalIce: 'Within target range',
    pointsMeasured: 'points measured',

    // Thresholds Legend
    legend: 'Thickness Scale (mm)',
    criticallyThin: 'Critically thin',
    belowNormal: 'Below target',
    optimal: 'Optimal ice',
    aboveNormal: 'Above target',
    criticallyThick: 'Excessively thick',

    // Manual Input Modal
    manualInputTitle: 'Manual Thickness Input',
    quickPresets: 'Quick Presets',
    selectPoint: 'Select Point',
    saveAndNext: 'Save & Next',
    allPoints: 'All Points',
    cancel: 'Cancel',
    apply: 'Apply',
    clear: 'Clear',
    enterThickness: 'Enter thickness in millimeters (mm)',

    // Settings Modal
    settingsTitle: 'Application Settings',
    settingsSubtitle: 'Configure Arena, Google Sheets API, BLE, and Thresholds',
    tabGeneral: 'General',
    tabSheets: 'Google Sheets',
    tabBle: 'Bluetooth BLE',
    tabGuide: 'Google Setup Guide',
    arenaNameLabel: 'Arena Name',
    spreadsheetIdLabel: 'Google Spreadsheet ID or URL',
    spreadsheetIdHelp: 'Paste the full URL from your browser or just the ID between /d/ and /edit',
    googleClientIdLabel: 'Google OAuth Client ID',
    googleClientIdHelp: 'Created in Google Cloud Console as Web Application credential',
    signInGoogle: 'Sign in with Google',
    signOutGoogle: 'Sign out from Google',
    testConnection: 'Test Spreadsheet Connection',
    testingConnection: 'Testing connection...',
    connectionSuccess: 'Connection successful! Spreadsheet found.',
    connectionFailed: 'Could not connect to Google Spreadsheet',
    bleServiceUuidLabel: 'BLE Service UUID (HM-10 default: 0xFFE0)',
    bleCharUuidLabel: 'BLE Characteristic UUID (HM-10 default: 0xFFE1)',
    thresholdsTitle: 'Thickness Thresholds (mm)',
    resetDefaults: 'Reset to Defaults',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved',
    authorizedAs: 'Signed in with Google',
    notAuthorized: 'Not signed in with Google',

    // Admin Points Modal
    pointsAdminTitle: 'Measurement Points Management',
    pointsAdminSubtitle: 'Edit point numbers, labels, and coordinates on the 30×60m rink',
    presetStandard24: 'Standard 24 points',
    presetFast12: 'Express 12 points',
    addPoint: 'Add Point',
    pointNumber: 'No.',
    pointName: 'Name',
    pointZone: 'Zone',
    pointX: 'X (m)',
    pointY: 'Y (m)',
    delete: 'Delete',
    savePoints: 'Save Points',
    pointsUpdated: 'Points configuration updated',
    actions: 'Actions',

    // History Modal
    historyTitle: 'Measurement History',
    historySubtitle: 'Review past sessions, re-sync, or export CSV',
    noSessions: 'No saved sessions yet. Take measurements and click "Save Session".',
    loadSession: 'Load onto Rink',
    viewOnRink: 'View on Rink',
    sessionLoaded: 'Loaded session from',
    deleteSession: 'Delete',
    sessionDeleted: 'Session deleted',
    resync: 'Sync to Google',
    exportCsv: 'Export CSV',
    date: 'Date & Time',
    readings: 'Readings',
    inGoogleSheet: 'In Google Sheet',
    close: 'Close',

    // Export Modal
    exportTitle: 'Export Diagram (PNG)',
    exportSubtitle: 'High-resolution rink diagram with point readings and statistics',
    exportModalTitle: 'Export Diagram (PNG)',
    exportModalSubtitle: 'High-resolution rink diagram with point readings and statistics',
    downloadPng: 'Download PNG',
    copyClipboard: 'Copy to Clipboard',
    copyImage: 'Copy Image',
    copied: 'Copied to clipboard!',
    generatingImage: 'Generating high-resolution diagram...',
    imageGenFailed: 'Failed to generate image',

    // Notifications & Prompts
    sessionSavedLocally: 'Session saved locally and queued for synchronization.',
    sessionSyncedGoogle: 'Session successfully saved to Google Sheets!',
    syncSuccess: 'Data successfully synchronized to Google Sheets',
    syncError: 'Synchronization error',
    noMeasurementsToSave: 'No measured points to save.',
    googleLoginRequired: 'Google authentication required to sync with Google Sheets.',
    googleLoginSuccess: 'Signed in to Google successfully!',
    googleLoginError: 'Google authentication error',
    confirmNewSession: 'Start a new session? Current unsaved measurements will be cleared.',
    confirmResetSession: 'Start a new session? Current unsaved measurements will be cleared.',
    confirmResetSettings: 'Reset all settings to default values?',
    confirmDeleteSession: 'Are you sure you want to delete this session?',
    bleNotSupported: 'Web Bluetooth API is not supported in this browser. Please use Chrome or Edge.',
    noPointsToSave: 'No measured points to save.',
    newSessionStarted: 'New measurement session started.',
    sessionStarted: 'New measurement session started',
    quickPromptSignInTitle: 'Sign in to Google Sheets?',
    quickPromptSignInDesc: 'To automatically log measurements into your Google Spreadsheet, sign in with your Google account.',
  },

  ru: {
    appTitle: 'Ice Thickness Monitor',
    appSubtitle: 'Измерение и визуализация толщины льда на ледовой арене',
    language: 'Язык',

    // Header
    history: 'История',
    points: 'Точки',
    settings: 'Настройки',
    installApp: 'Установить PWA',
    newSession: 'Новая сессия',
    saveSession: 'Сохранить сессию',
    resetSession: 'Сбросить сессию',
    exportPng: 'Экспорт схемы',
    syncGoogle: 'Синхронизировать с Google',
    resyncGoogle: 'Повторить синхронизацию',
    syncing: 'Синхронизация...',
    synced: 'Синхронизировано',
    notSynced: 'Не синхронизировано',
    offlineQueue: 'В очереди',
    localQueue: 'Локальная очередь',
    online: 'Онлайн',
    offline: 'Офлайн',

    // Caliper Panel
    caliperTitle: 'Bluetooth штангенциркуль',
    bleStatus: {
      disconnected: 'Отключен',
      searching: 'Поиск устройств...',
      connecting: 'Подключение...',
      connected: 'Подключен',
      error: 'Ошибка',
    },
    connectBle: 'Подключить прибор',
    disconnectBle: 'Отключить',
    connected: 'подключен',
    disconnected: 'Штангенциркуль отключен',
    simulateBle: 'Симулировать замер',
    manualInput: 'Ручной ввод',
    activePoint: 'Активная точка',
    pointCoord: 'Координаты',
    autoAdvance: 'Автопереход',
    sound: 'Звук',
    nextPoint: 'Следующая точка',
    prevPoint: 'Предыдущая',
    measured: 'Измерено',
    notMeasured: 'Не измерено',
    waitingReading: 'Ожидание данных со штангенциркуля...',

    // Hockey Rink
    defendingZone: 'Зона защиты',
    neutralZone: 'Нейтральная зона',
    attackingZone: 'Зона атаки',
    goalA: 'Ворота А',
    goalB: 'Ворота Б',
    rinkTip: 'Нажмите на точку на поле для замера или просмотра',
    editModeTip: 'Нажмите на поле, чтобы переместить выбранную точку',
    editPositions: 'Режим расстановки точек',
    finishEdit: 'Завершить расстановку',
    rinkSchemeTitle: 'Схема ледовой площадки 30×60 м',
    clickToSelect: 'Кликните по любой точке для выбора',
    movePointsMode: 'Режим перемещения точек',
    clickToMove: 'Кликните в любое место поля, чтобы переместить точку',

    // Stats
    statistics: 'Статистика сессии',
    progress: 'Прогресс',
    minimum: 'Минимум',
    maximum: 'Максимум',
    average: 'Среднее',
    delta: 'Перепад',
    optimalIce: 'В пределах нормы',
    pointsMeasured: 'замеренных точек',

    // Thresholds Legend
    legend: 'Шкала толщины (мм)',
    criticallyThin: 'Критически тонкий',
    belowNormal: 'Ниже нормы',
    optimal: 'Оптимальный лед',
    aboveNormal: 'Выше нормы',
    criticallyThick: 'Избыточно толстый',

    // Manual Input Modal
    manualInputTitle: 'Ручной ввод толщины',
    quickPresets: 'Быстрые значения',
    selectPoint: 'Выбрать точку',
    saveAndNext: 'Сохранить и след.',
    allPoints: 'Все точки',
    cancel: 'Отмена',
    apply: 'Применить',
    clear: 'Очистить',
    enterThickness: 'Введите толщину льда в миллиметрах (мм)',

    // Settings Modal
    settingsTitle: 'Настройки приложения',
    settingsSubtitle: 'Конфигурация арены, Google Таблиц, BLE и цветовых порогов',
    tabGeneral: 'Общие',
    tabSheets: 'Google Таблица',
    tabBle: 'Bluetooth BLE',
    tabGuide: 'Инструкция Google',
    arenaNameLabel: 'Название арены',
    spreadsheetIdLabel: 'ID Google Таблицы или ссылка (URL)',
    spreadsheetIdHelp: 'Можно вставить полную ссылку из браузера или только ID между /d/ и /edit',
    googleClientIdLabel: 'Google OAuth Client ID',
    googleClientIdHelp: 'Создается в Google Cloud Console с типом Web Application',
    signInGoogle: 'Войти через Google',
    signOutGoogle: 'Выйти из Google',
    testConnection: 'Проверить подключение к таблице',
    testingConnection: 'Проверка подключения...',
    connectionSuccess: 'Подключение успешно! Таблица найдена.',
    connectionFailed: 'Не удалось подключиться к Google Таблице',
    bleServiceUuidLabel: 'BLE Service UUID (HM-10: 0xFFE0)',
    bleCharUuidLabel: 'BLE Characteristic UUID (HM-10: 0xFFE1)',
    thresholdsTitle: 'Пороги толщины льда (мм)',
    resetDefaults: 'Сбросить к исходным',
    saveSettings: 'Сохранить настройки',
    settingsSaved: 'Настройки сохранены',
    authorizedAs: 'Авторизован в Google',
    notAuthorized: 'Не авторизован в Google',

    // Admin Points Modal
    pointsAdminTitle: 'Управление точками измерений',
    pointsAdminSubtitle: 'Настройка номеров, названий и координат на площадке 30×60 м',
    presetStandard24: 'Стандартная сетка (24 точки)',
    presetFast12: 'Экспресс-контроль (12 точек)',
    addPoint: 'Добавить точку',
    pointNumber: '№',
    pointName: 'Название',
    pointZone: 'Зона',
    pointX: 'X (м)',
    pointY: 'Y (м)',
    delete: 'Удалить',
    savePoints: 'Сохранить точки',
    pointsUpdated: 'Список точек измерения обновлен',
    actions: 'Действия',

    // History Modal
    historyTitle: 'История замеров',
    historySubtitle: 'Просмотр сохраненных сессий, синхронизация и экспорт',
    noSessions: 'Сохраненных сессий пока нет. Завершите измерение и нажмите «Сохранить сессию».',
    loadSession: 'Показать на схеме',
    viewOnRink: 'Показать на схеме',
    sessionLoaded: 'Загружена сессия от',
    deleteSession: 'Удалить',
    sessionDeleted: 'Сессия удалена',
    resync: 'Синхронизировать с Google',
    exportCsv: 'Экспорт в CSV',
    date: 'Дата и время',
    readings: 'Замеры',
    inGoogleSheet: 'В Google Таблице',
    close: 'Закрыть',

    // Export Modal
    exportTitle: 'Экспорт схемы площадки (PNG)',
    exportSubtitle: 'Высококачественное изображение схемы с точками и статистикой',
    exportModalTitle: 'Экспорт схемы площадки (PNG)',
    exportModalSubtitle: 'Высококачественное изображение схемы с точками и статистикой',
    downloadPng: 'Скачать PNG',
    copyClipboard: 'Скопировать в буфер',
    copyImage: 'Скопировать в буфер',
    copied: 'Скопировано в буфер обмена!',
    generatingImage: 'Формирование изображения схемы...',
    imageGenFailed: 'Не удалось создать изображение',

    // Notifications & Prompts
    sessionSavedLocally: 'Сессия сохранена локально и добавлена в очередь отправки.',
    sessionSyncedGoogle: 'Сессия успешно сохранена в Google Таблицу!',
    syncSuccess: 'Сессия успешно сохранена в Google Таблицу!',
    syncError: 'Ошибка при синхронизации',
    noMeasurementsToSave: 'Нет измеренных точек для сохранения',
    googleLoginRequired: 'Для синхронизации с Google Таблицей требуется авторизация.',
    googleLoginSuccess: 'Успешная авторизация в Google!',
    googleLoginError: 'Ошибка авторизации Google',
    confirmNewSession: 'Начать новую сессию? Текущие несохраненные замеры будут сброшены.',
    confirmResetSession: 'Начать новую сессию? Текущие несохраненные замеры будут сброшены.',
    confirmResetSettings: 'Сбросить все настройки к значениям по умолчанию?',
    confirmDeleteSession: 'Удалить эту сессию из истории?',
    bleNotSupported: 'Web Bluetooth API не поддерживается вашим браузером. Используйте Chrome / Edge.',
    noPointsToSave: 'Нет измеренных точек для сохранения.',
    newSessionStarted: 'Начата новая сессия измерений.',
    sessionStarted: 'Начата новая сессия измерений',
    quickPromptSignInTitle: 'Войти в Google Таблицы?',
    quickPromptSignInDesc: 'Чтобы замеры автоматически записывались в вашу таблицу, войдите через Google аккаунт.',
  },
};
