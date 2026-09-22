/**
 * GoogleSetupGuide - Step-by-step guide for setting up Google Cloud,
 * Google Sheets API v4, OAuth 2.0 Client ID, and Spreadsheet permissions.
 * Localized for LV, EN, RU.
 */

import React, { useState } from 'react';
import { Check, Copy, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const GoogleSetupGuide: React.FC = () => {
  const { lang } = useLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const texts = {
    lv: {
      title: 'Google Sheets API v4 pieslēgšanas pamācība',
      desc: 'Lai mērījumu sesijas automātiski saglabātu arēnas Google tabulā, Google Cloud Console ir jāizveido bezmaksas projekts un lietotnē jānorāda Client ID. Iestatīšana tiek veikta vienreiz.',
      step1Title: 'Projekta izveide Google Cloud Console',
      step1_1: 'Atveriet',
      step1_2: 'un ienāciet ar arēnas Google kontu.',
      step1_3: 'Augšējā izvēlnē izvēlieties «Select a project» → «New Project».',
      step1_4: 'Ievadiet projekta nosaukumu (piemēram, Ice-Thickness-Arena) un nospiediet «Create».',
      step2Title: 'Google Sheets API iespējošana',
      step2_1: 'Augšējā meklēšanas joslā ievadiet «Google Sheets API».',
      step2_2: 'Atveriet API lapu un nospiediet zilo pogu «Enable» (Iespējot).',
      step3Title: 'OAuth piekrišanas ekrāna iestatīšana (OAuth Consent Screen)',
      step3_1: 'Sānu izvēlnē dodieties uz APIs & Services → OAuth consent screen.',
      step3_2: 'Izvēlieties External (vai Internal, ja izmantojat organizācijas Google Workspace) un spiediet Create.',
      step3_3: 'Norādiet lietotnes nosaukumu (piem., Ice Thickness Monitor) un savu e-pastu.',
      step3_4: 'Sadaļā Scopes nospiediet Add or Remove Scopes un atzīmējiet:',
      step3_5: 'Sadaļā Test users pievienojiet ledus meistaru / darbinieku e-pastus.',
      step4Title: 'OAuth 2.0 Client ID izveide (Web Application)',
      step4_1: 'Dodieties uz APIs & Services → Credentials.',
      step4_2: 'Nospiediet «Create Credentials» → «OAuth client ID».',
      step4_3: 'Application type: izvēlieties «Web application».',
      step4_4: 'Sadaļā «Authorized JavaScript origins» nospiediet «Add URI» un iekopējiet šo lietotnes adresi:',
      step4_5: 'Nospiediet «Create» un nokopējiet izveidoto Client ID (beidzas ar .apps.googleusercontent.com).',
      step5Title: 'Google tabulas izveide un tās ID iegūšana',
      step5_1: 'Izveidojiet jaunu tabulu vietnē',
      step5_2: 'un nosauciet to, piemēram: «Ledus biezuma žurnāls - Arēna».',
      step5_3: 'Nokopējiet tabulas ID no pārlūka adreses joslas:',
      step5_4: 'Ielīmējiet Client ID un Spreadsheet ID šīs lietotnes iestatījumos.',
      securityTitle: 'Automātiska lapu struktūra un drošība',
      sec1: 'Pirmajā saglabāšanas reizē lietotne pati izveidos kārtējā gada lapu (piem., 2026) un ierakstīs īso galveni (Date, Point 1, Point 2...).',
      sec2: 'Katra mērījumu sesija tiks pievienota kā jauna rinda lapas beigās.',
      sec3: 'Ja arēnā pazūd internets, dati saglabāsies lokālajā rindā planšetē un nosūtīsies, tiklīdz parādīsies savienojums!',
    },
    en: {
      title: 'Google Sheets API v4 Setup Instructions',
      desc: 'To automatically sync measurement sessions to the arena Google Spreadsheet, set up a free Google Cloud Console project and configure your Client ID in the app settings. Done once.',
      step1Title: 'Create a Project in Google Cloud Console',
      step1_1: 'Open',
      step1_2: 'and sign in with the arena Google account.',
      step1_3: 'In the top dropdown, click «Select a project» → «New Project».',
      step1_4: 'Enter a project name such as «Ice-Thickness-Arena» and click «Create».',
      step2Title: 'Enable Google Sheets API',
      step2_1: 'In the top search bar, enter «Google Sheets API».',
      step2_2: 'Go to the API details page and click the blue «Enable» button.',
      step3Title: 'Configure OAuth Consent Screen',
      step3_1: 'In the left sidebar, navigate to APIs & Services → OAuth consent screen.',
      step3_2: 'Select External (or Internal if using corporate Google Workspace) and click Create.',
      step3_3: 'Enter an App name (e.g. Ice Thickness Monitor) and your support email.',
      step3_4: 'In the Scopes step, click Add or Remove Scopes and select:',
      step3_5: 'In Test users, add the email addresses of the operators/staff who will use the app.',
      step4Title: 'Create OAuth 2.0 Client ID (Web Application)',
      step4_1: 'Go to APIs & Services → Credentials.',
      step4_2: 'Click «Create Credentials» → «OAuth client ID».',
      step4_3: 'Application type: select «Web application».',
      step4_4: 'Under «Authorized JavaScript origins», click «Add URI» and paste the app origin:',
      step4_5: 'Click «Create» and copy the generated Client ID (ends with .apps.googleusercontent.com).',
      step5Title: 'Create Google Spreadsheet and get its ID',
      step5_1: 'Create a new Google Sheet at',
      step5_2: 'and name it (e.g. «Ice Arena Thickness Log»).',
      step5_3: 'Copy the Spreadsheet ID from the URL bar in your browser:',
      step5_4: 'Paste the Client ID and Spreadsheet ID into the Settings modal of this app.',
      securityTitle: 'Automatic Sheet Structure and Offline Safety',
      sec1: 'On the first save, the app automatically creates a sheet for the current year (e.g., 2026) with short headers (Date, Point 1, Point 2...).',
      sec2: 'Every measurement session is appended as a new row at the bottom.',
      sec3: 'If Wi-Fi drops on the rink, measurements are safely queued in local IndexedDB and synced when back online!',
    },
    ru: {
      title: 'Инструкция по подключению Google Sheets API v4',
      desc: 'Для автоматического сохранения сессий измерений в Google Таблицу арены требуется настроить бесплатный проект в Google Cloud Console и указать Client ID в приложении. Настройка выполняется один раз.',
      step1Title: 'Создание проекта в Google Cloud Console',
      step1_1: 'Откройте',
      step1_2: 'и войдите под аккаунтом арены.',
      step1_3: 'В верхнем левом меню выберите «Select a project» → «New Project».',
      step1_4: 'Укажите название проекта, например Ice-Thickness-Arena, и нажмите «Create».',
      step2Title: 'Включение Google Sheets API',
      step2_1: 'В поиске вверху страницы введите «Google Sheets API».',
      step2_2: 'Перейдите на страницу API и нажмите синюю кнопку «Enable» (Включить).',
      step3Title: 'Настройка экрана согласия OAuth (OAuth Consent Screen)',
      step3_1: 'В боковом меню перейдите в APIs & Services → OAuth consent screen.',
      step3_2: 'Выберите External (или Internal, если используется Google Workspace организации) и нажмите Create.',
      step3_3: 'Укажите App name (например Ice Thickness Monitor) и свой контактный email.',
      step3_4: 'На шаге Scopes нажмите Add or Remove Scopes и выберите:',
      step3_5: 'На шаге Test users добавьте email сотрудников/ледоваров, которые будут работать с приложением.',
      step4Title: 'Создание OAuth 2.0 Client ID (Web Application)',
      step4_1: 'Перейдите в APIs & Services → Credentials.',
      step4_2: 'Нажмите «Create Credentials» → «OAuth client ID».',
      step4_3: 'Application type: выберите «Web application».',
      step4_4: 'В разделе «Authorized JavaScript origins» нажмите «Add URI» и вставьте текущий адрес приложения:',
      step4_5: 'Нажмите «Create» и скопируйте созданный Client ID (заканчивается на .apps.googleusercontent.com).',
      step5Title: 'Создание Google Таблицы и получение её ID',
      step5_1: 'Создайте новую таблицу на',
      step5_2: 'и назовите её, например: «Журнал толщины льда — Арена».',
      step5_3: 'Скопируйте ID таблицы из адресной строки браузера:',
      step5_4: 'Вставьте Client ID и Spreadsheet ID в окно Настроек этого приложения.',
      securityTitle: 'Автоматическая структура листов и безопасность',
      sec1: 'При первом сохранении приложение само создаст лист текущего года (например 2026) и запишет короткую шапку (Date, Point 1, Point 2...).',
      sec2: 'Каждая сессия измерений будет аккуратно дописываться новой строкой в конец листа.',
      sec3: 'Если связь на арене пропадёт, данные сохранятся в локальную очередь на планшете и отправятся при появлении интернета!',
    },
  };

  const cur = texts[lang] || texts.ru;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* Intro */}
      <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 p-4 rounded-2xl">
        <h3 className="font-bold text-base text-sky-900 dark:text-sky-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          {cur.title}
        </h3>
        <p className="text-xs text-sky-800 dark:text-sky-200/90 mt-1.5 leading-relaxed">
          {cur.desc}
        </p>
      </div>

      {/* Step 1 */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs">
            1
          </span>
          <h4>{cur.step1Title}</h4>
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1 leading-relaxed">
          <li>
            {cur.step1_1}{' '}
            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 underline font-semibold inline-flex items-center gap-1"
            >
              Google Cloud Console <ExternalLink className="w-3 h-3" />
            </a>{' '}
            {cur.step1_2}
          </li>
          <li>{cur.step1_3}</li>
          <li>{cur.step1_4}</li>
        </ol>
      </div>

      {/* Step 2 */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs">
            2
          </span>
          <h4>{cur.step2Title}</h4>
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1 leading-relaxed">
          <li>{cur.step2_1}</li>
          <li>{cur.step2_2}</li>
        </ol>
      </div>

      {/* Step 3 */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs">
            3
          </span>
          <h4>{cur.step3Title}</h4>
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1 leading-relaxed">
          <li>{cur.step3_1}</li>
          <li>{cur.step3_2}</li>
          <li>{cur.step3_3}</li>
          <li>
            {cur.step3_4}
            <div className="my-1.5 p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-sky-700 dark:text-sky-300 flex items-center justify-between">
              <span>https://www.googleapis.com/auth/spreadsheets</span>
              <button
                onClick={() =>
                  copyToClipboard('https://www.googleapis.com/auth/spreadsheets', 'scope')
                }
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                type="button"
              >
                {copiedText === 'scope' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </li>
          <li>{cur.step3_5}</li>
        </ol>
      </div>

      {/* Step 4 */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs">
            4
          </span>
          <h4>{cur.step4Title}</h4>
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1 leading-relaxed">
          <li>{cur.step4_1}</li>
          <li>{cur.step4_2}</li>
          <li>{cur.step4_3}</li>
          <li>
            {cur.step4_4}
            <div className="my-1.5 p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-sky-700 dark:text-sky-300 flex items-center justify-between">
              <span className="truncate">{currentOrigin}</span>
              <button
                onClick={() => copyToClipboard(currentOrigin, 'origin')}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0 ml-2"
                type="button"
              >
                {copiedText === 'origin' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </li>
          <li>{cur.step4_5}</li>
        </ol>
      </div>

      {/* Step 5 */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs">
            5
          </span>
          <h4>{cur.step5Title}</h4>
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1 leading-relaxed">
          <li>
            {cur.step5_1}{' '}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 underline font-semibold inline-flex items-center gap-1"
            >
              sheets.new <ExternalLink className="w-3 h-3" />
            </a>{' '}
            {cur.step5_2}
          </li>
          <li>
            {cur.step5_3}
            <div className="my-1.5 p-2 bg-slate-100 dark:bg-slate-800 rounded text-[11px] text-slate-700 dark:text-slate-300">
              <code>https://docs.google.com/spreadsheets/d/</code>
              <span className="bg-amber-200 dark:bg-amber-900/60 font-bold px-1 rounded text-amber-900 dark:text-amber-200">
                1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
              </span>
              <code>/edit</code>
            </div>
          </li>
          <li>{cur.step5_4}</li>
        </ol>
      </div>

      {/* Structure note */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
        <div className="font-bold flex items-center gap-1.5 text-sm mb-1 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          {cur.securityTitle}
        </div>
        <ul className="list-disc list-inside space-y-1 text-emerald-800/90 dark:text-emerald-300/90">
          <li>{cur.sec1}</li>
          <li>{cur.sec2}</li>
          <li>{cur.sec3}</li>
        </ul>
      </div>
    </div>
  );
};
