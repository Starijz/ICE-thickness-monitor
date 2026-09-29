import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bluetooth,
  CheckCircle2,
  Radio,
  Smartphone,
  Keyboard,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface GemRedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestMeasurement?: (valMm: number) => void;
  onTryWebBle?: () => void;
}

export const GemRedGuideModal: React.FC<GemRedGuideModalProps> = ({
  isOpen,
  onClose,
  onTestMeasurement,
  onTryWebBle,
}) => {
  const { lang } = useLanguage();
  const [testInput, setTestInput] = useState('');
  const [lastReceived, setLastReceived] = useState<number | null>(null);
  const testInputRef = useRef<HTMLInputElement>(null);
  const commitTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTestInput('');
      const timer = setTimeout(() => {
        testInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commitTestValue = (rawStr: string) => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
    const clean = rawStr.trim().replace(',', '.');
    const match = clean.match(/([+-]?\d+\.?\d*)/);
    if (!match) return;
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val >= 0 && val <= 200) {
      const rounded = Math.round(val * 100) / 100;
      setLastReceived(rounded);
      setTestInput('');
      onTestMeasurement?.(rounded);
    }
  };

  const handleTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTestInput(val);
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    // Auto-commit if caliper doesn't send Enter after 500ms
    if (/\d/.test(val)) {
      commitTimerRef.current = setTimeout(() => {
        commitTestValue(val);
      }, 500);
    }
  };

  const handleTestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      commitTestValue(testInput);
    }
  };

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const copy = {
    lv: {
      title: 'Kā pieslēgt GemRed Bluetooth bīdmēru',
      subtitle: 'Jūsu modelis ar dzelteno joslu darbojas Bluetooth HID (tastatūras) režīmā',
      schemeTitle: 'Jūsu GemRed bīdmēra shēma:',
      iconOn: 'Ikona ((•)) deg!',
      sideBtnTitle: 'Sānu poga «DATA»',
      sideBtnSub: 'Korpusa kreisajā galā',
      btOnTooltip: 'Bluetooth indikators ieslēgts',
      step1Title: 'Ieslēdziet Bluetooth raidītāju uz paša bīdmēra',
      step1Desc:
        'Melnā korpusa kreisajā galā ir dzelteni-melna datu nosūtīšanas poga. Ja antenas ikona ((•)) ekrāna kreisajā pusē nedeg — turiet nospiestu sānu pogu 3 sekundes.',
      step2Title: 'Pievienojiet to viedtālruņa vai datora standarta Bluetooth iestatījumos',
      step2Desc:
        'Atveriet Tālruņa iestatījumus (Android / iPhone) → Bluetooth. Jauno ierīču sarakstā parādīsies bīdmērs (parasti GemRed, Bluetooth Caliper vai HID Keyboard). Nospiediet uz tā, lai savienotu pārī.',
      step2Tip:
        '💡 Kāpēc tas ir ērti: GemRed bīdmērs pieslēdzas kā bezvadu ciparu tastatūra (HID) — tas darbojas gan iPhone, gan Android, gan datorā jebkurā pārlūkā!',
      step3Title: 'Īsi nospiediet sānu pogu uz bīdmēra, lai nosūtītu mērījumu!',
      step3Desc:
        'Kad atrodaties lietotnes galvenajā ekrānā vai ievades logā — vienkārši īsi nospiediet sānu pogu bīdmēra galā. Ierīce automātiski ievadīs skaitli (piemēram, 36.54) aktīvajā punktā un pāries pie nākamā punkta!',
      testTitle: 'Savienojuma pārbaude ar bīdmēru tieši tagad:',
      receivedLabel: 'Saņemts:',
      testDesc:
        'Pēc savienošanas tālruņa Bluetooth iestatījumos ieklikšķiniet zemāk esošajā laukā un īsi nospiediet sānu pogu uz bīdmēra:',
      testPlaceholder: 'Nospiediet sānu pogu uz GemRed...',
      iframeTitle: 'Izmantojat citu BLE moduli (HM-10)?',
      iframeDesc:
        'Priekšskatījuma logā pārlūks bloķē tiešo BLE skenēšanu. Tiešam BLE atveriet lietotni jaunā cilnē (bet GemRed HID režīmā tas nav nepieciešams!).',
      openTab: 'Atvērt cilnē',
      tryWebBle: 'Meklēt caur Web Bluetooth (BLE)',
      alwaysActive: 'GemRed (HID) uztveršanas režīms vienmēr ir aktīvs galvenajā ekrānā',
      startBtn: 'Skaidrs, sākt mērījumus',
    },
    en: {
      title: 'How to Connect GemRed Bluetooth Caliper',
      subtitle: 'Your yellow-stripe GemRed model works in Bluetooth HID (keyboard) mode',
      schemeTitle: 'Your GemRed caliper layout:',
      iconOn: 'Icon ((•)) is ON!',
      sideBtnTitle: 'Side "DATA" Button',
      sideBtnSub: 'On the left edge of body',
      btOnTooltip: 'Bluetooth indicator is ON',
      step1Title: 'Turn on the Bluetooth transmitter on the caliper itself',
      step1Desc:
        'On the left side edge of the black housing there is a yellow/black data button. If the antenna icon ((•)) on the left of the LCD is not lit — press and hold the side button for 3 seconds.',
      step2Title: 'Pair it in your phone or PC standard Bluetooth Settings',
      step2Desc:
        'Open Phone Settings (Android / iPhone) → Bluetooth. Select the caliper from available devices (usually named GemRed, Bluetooth Caliper, or HID Keyboard) to pair.',
      step2Tip:
        '💡 Why this is great: GemRed connects as a wireless numeric keypad (HID) — working seamlessly on iPhone, Android, and PC in any browser!',
      step3Title: 'Short-press the side button on the caliper to send a reading!',
      step3Desc:
        'While on the main screen or manual input modal — simply short-press the side button on the caliper. It will automatically type the reading (e.g. 36.54) into the active point and advance to the next point!',
      testTitle: 'Test your caliper connection right now:',
      receivedLabel: 'Received:',
      testDesc:
        'After pairing in your phone Bluetooth settings, tap the box below and short-press the side button on your caliper:',
      testPlaceholder: 'Press side button on GemRed...',
      iframeTitle: 'Using another BLE module (HM-10)?',
      iframeDesc:
        'Inside a preview iframe, browsers block direct Web Bluetooth scanning. Open the app in a separate tab for raw BLE (not needed for GemRed HID mode!).',
      openTab: 'Open Tab',
      tryWebBle: 'Scan via Web Bluetooth (BLE)',
      alwaysActive: 'GemRed (HID) receiver mode is always active on the main screen',
      startBtn: 'Got it, start measuring',
    },
    ru: {
      title: 'Как подключить штангенциркуль GemRed',
      subtitle: 'Ваша модель с жёлтой полосой работает в режиме Bluetooth HID (без драйверов)',
      schemeTitle: 'Схема вашего штангенциркуля GemRed:',
      iconOn: 'Значок ((•)) горит!',
      sideBtnTitle: 'Боковая кнопка «DATA»',
      sideBtnSub: 'На левом торце корпуса',
      btOnTooltip: 'Индикатор Bluetooth включён',
      step1Title: 'Включите передатчик Bluetooth на самом штангенциркуле',
      step1Desc:
        'На левом боку (торце) чёрного корпуса есть жёлто-чёрная кнопка передачи данных. Если значок антенны ((•)) слева на экране не горит — зажмите и удерживайте боковую кнопку 3 секунды.',
      step2Title: 'Подключите его в обычных Настройках Bluetooth смартфона или ПК',
      step2Desc:
        'Откройте Настройки телефона (Android / iPhone) → Bluetooth. В списке новых устройств появится штангенциркуль (обычно называется GemRed, Bluetooth Caliper или HID Keyboard). Нажмите на него для сопряжения.',
      step2Tip:
        '💡 Почему это удобно: Штангенциркуль GemRed подключается как беспроводная цифровая клавиатура (HID) — он работает и на iPhone, и на Android, и на ноутбуке в любом браузере!',
      step3Title: 'Коротко нажимайте боковую кнопку на штангеле для отправки замера!',
      step3Desc:
        'Когда вы в приложении на главном экране или в окне ввода — просто коротко нажмите боковую кнопку на торце штангенциркуля. Прибор сам «впечатает» число (например, 36.54) в активную точку и автоматически перейдёт к следующей точке!',
      testTitle: 'Проверка связи со штангенциркулем прямо сейчас:',
      receivedLabel: 'Получено:',
      testDesc:
        'После сопряжения в настройках Bluetooth телефона нажмите в поле ниже и коротко нажмите боковую кнопку на штангеле:',
      testPlaceholder: 'Нажмите боковую кнопку на GemRed...',
      iframeTitle: 'Используете другой BLE-модуль (HM-10)?',
      iframeDesc:
        'Внутри окна предпросмотра браузер блокирует прямое сканирование BLE. Для прямого BLE откройте приложение в отдельной вкладке (для GemRed в режиме HID это не нужно!).',
      openTab: 'Вкладка',
      tryWebBle: 'Поиск через Web Bluetooth (BLE)',
      alwaysActive: 'Режим приёма GemRed (HID) всегда активен на главном экране',
      startBtn: 'Понятно, начать замеры',
    },
  }[lang];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {copy.title}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {copy.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Visual Diagram of the User's GemRed Caliper */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>{copy.schemeTitle}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" /> {copy.iconOn}
              </span>
            </div>

            <div className="relative bg-slate-900 border-2 border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-3.5">
              {/* Side DATA button illustration */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0 bg-amber-500/10 border border-amber-500/40 rounded-xl p-2.5 text-center">
                <div className="w-4 h-10 rounded-l-lg bg-amber-400 border-2 border-amber-200 shadow-lg shadow-amber-500/30 animate-pulse" />
                <div className="text-left sm:text-center">
                  <div className="text-xs font-extrabold text-amber-300">
                    {copy.sideBtnTitle}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {copy.sideBtnSub}
                  </div>
                </div>
              </div>

              {/* Caliper LCD & Front Buttons illustration */}
              <div className="flex-1 w-full bg-slate-950 border-t-4 border-amber-400 rounded-xl p-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-1">
                  <span>GemRed</span>
                  <span className="text-slate-400">0–150 mm</span>
                </div>
                {/* LCD Screen */}
                <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-lg px-3 py-2 flex items-center justify-between font-mono">
                  <div className="flex flex-col items-center text-emerald-400" title={copy.btOnTooltip}>
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span className="text-[9px] leading-none mt-0.5">BT ON</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-wider">
                    36.54 <span className="text-xs font-bold">mm</span>
                  </div>
                </div>
                {/* 3 Buttons */}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                    mm/in
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                    ZERO
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                    ON
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="space-y-2.5">
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-sky-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs sm:text-sm space-y-1">
                <div className="font-bold text-white">
                  {copy.step1Title}
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {copy.step1Desc}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-sky-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs sm:text-sm space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{copy.step2Title}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {copy.step2Desc}
                </p>
                <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-700/40 rounded-lg px-2.5 py-1.5 mt-1">
                  {copy.step2Tip}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs sm:text-sm space-y-1">
                <div className="font-bold text-white">
                  {copy.step3Title}
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {copy.step3Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Test Box */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border-2 border-emerald-600/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-300">
                <Keyboard className="w-4 h-4 text-emerald-400" />
                <span>{copy.testTitle}</span>
              </div>
              {lastReceived !== null && (
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {copy.receivedLabel} {lastReceived.toFixed(2)} mm!
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300">
              {copy.testDesc}
            </p>

            <div className="flex items-center gap-2">
              <input
                ref={testInputRef}
                type="text"
                inputMode="none"
                value={testInput}
                onChange={handleTestChange}
                onKeyDown={handleTestKeyDown}
                placeholder={copy.testPlaceholder}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 text-sm font-mono font-bold text-emerald-300 placeholder:text-slate-500 focus:outline-none"
              />
              {lastReceived !== null && (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 font-mono font-black text-emerald-300 text-sm shrink-0">
                  {lastReceived.toFixed(2)} mm
                </div>
              )}
            </div>
          </div>

          {/* Note about Web Bluetooth in iframe if applicable */}
          {isInIframe && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white block">
                  {copy.iframeTitle}
                </span>
                {copy.iframeDesc}
              </div>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{copy.openTab}</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          {onTryWebBle && !isInIframe ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTryWebBle();
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {copy.tryWebBle}
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              {copy.alwaysActive}
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            {copy.startBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
