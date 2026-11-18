import { lowkeyGuide } from '../guides/lowkey';
import type { AppCopy } from '../types';
import type { Locale } from '../../i18n';
// lowkey 0.1.0. Real release-source windows with demo sites only; never real profiles.
const browser = { src: '/images/shots/lowkey/browser.webp', width: 1100, height: 760 };
const prompt = { src: '/images/shots/lowkey/prompt.webp', width: 560, height: 166 };
const settings = { src: '/images/shots/lowkey/settings.webp', width: 680, height: 502 };
const copy: Record<Locale, AppCopy> = {
  en: {
    guide: lowkeyGuide('en'),
    category: 'A quieter browser', tagline: 'One site. Its own space.',
    description: 'A small macOS browser using the system WebKit. No tabs or permanent address bar: open saved sites by alias, each with its own profile and sign-in state.',
    shots: [
      { ...browser, caption: 'The page, without the browser clutter.', alt: 'A real lowkey window displaying a local Field Notes demo website. A thin strip holds close, back, start page and forward controls; there are no tabs or permanent address bar.' },
      { ...prompt, caption: 'An alias is enough.', alt: 'The dark address prompt in lowkey lists two configured demo sites. Alias badges share a width, and shortcut hints appear below the list.' },
      { ...settings, caption: 'Give each site its own profile.', alt: 'lowkey Settings with three demo aliases. Field Notes has an alias, a start URL and a setting to open external links in the default browser.' },
    ],
    features: [
      { title: 'Separate sign-ins', text: 'Every saved site has a persistent WebKit profile. Ordinary windows share a default profile; popups retain their opener’s profile. Closing a window keeps its cookies.' },
      { title: 'Type less', text: 'Command-L accepts aliases, HTTP(S) URLs and bare hosts. The empty prompt lists only saved sites. Typing also searches submitted addresses, with Russian/Ukrainian ↔ US keyboard-layout matching.' },
      { title: 'Stay in this profile', text: 'Command-Shift-L opens a URL or alias in the exact current window and profile, including sign-in windows. Later links follow the normal policy. Some identity providers still block embedded browsers.' },
      { title: 'A place in your workflow', text: 'Use lowkey://alias/open and lowkey://alias/toggle from launchers such as Ting. Hide a site without closing its page. Choose Page, System, Light or Dark appearance and your own palette.' },
    ],
    installNote: 'Version 0.1.1 includes lowkeyctl for targeted window and page actions. Download the universal ZIP for Apple Silicon and Intel. No automatic updater or Homebrew cask.',
    steps: [
      { title: 'Download and install', text: 'Download the universal ZIP from GitHub Releases, unzip it and move lowkey.app to /Applications. Official releases are Developer ID signed, notarized and stapled, with SHA-256 checksums.' },
      { title: 'Add your sites', text: 'Open lowkey, press Command-comma and add an alias, optional title and start URL in Settings. Each site gets its own profile. Command-L opens the alias or an address.' },
      { title: 'Open from your launcher', text: 'This example opens the saved alias notes. Replace it with an alias you have configured. It does not create a site.', command: "open 'lowkey://notes/open'" },
      { title: 'Update without losing sign-ins', text: 'Quit lowkey, download the new GitHub release and replace only the app. Configuration, input history and website profiles remain. Old windows do not reopen. While lowkey is running, click its Dock icon to open the address prompt, even if a site window is visible.' },
    ],
    faq: [
      { question: 'Does every sign-in flow work?', answer: 'No. Google and other providers may reject embedded user agents. lowkey shares profiles with sign-in windows but does not impersonate Safari, bypass certificates or copy another browser’s cookies. Complex OAuth callbacks are not guaranteed.' },
      { question: 'What does closing a site do?', answer: 'Command-W hides a saved-site window while its page keeps running. Shift-Command-W closes it but retains the profile. Ordinary windows close with Command-W. Removing a saved site in Settings asks before deleting its profile.' },
      { question: 'Does it search the web or support extensions?', answer: 'No. There is no search-engine fallback, browser extension support, password-manager integration or automatic update service.' },
    ],
    supportIntro: 'Setup, profile behavior and troubleshooting for lowkey. Use a demo page when reporting a problem; never publish credentials or private URLs.',
    support: [
      { title: 'Check the address and profile', paragraphs: ['Use an HTTP(S) URL or bare host. Saved aliases are case-insensitive. Command-L can open an ordinary window from a saved site; Command-Shift-L explicitly reuses the current profile.', 'If a provider blocks sign-in, use a supported browser. Extra origins and external-link settings are navigation rules, not a security sandbox.'] },
      { title: 'Report a problem safely', paragraphs: ['Include lowkey and macOS versions and minimal reproduction steps. Hide cookies, credentials, URL tokens, private hosts and your config.json. Source builds require Swift 6.2 / Xcode 26 or later.', 'For local checks, LOWKEY_CONFIG isolates settings and input history, not the default WebKit profile. Use random site IDs or nonpersistent stores and a local mock site.'] },
      { title: 'Remove the app', paragraphs: ['To delete a saved site’s website data, remove that site in Settings before quitting. Then delete lowkey.app. Deleting only the app retains profiles, configuration and input history.', 'Configuration: ~/.config/lowkey/config.json. Input history: ~/Library/Application Support/Lowkey/history.json (the historical directory spelling is retained). Ordinary-window website data is managed by WebKit; never delete another browser’s files.'] },
    ],
    privacyTitle: 'Your sites. Their own profiles.',
    privacyIntro: 'lowkey has no account service, analytics or application backend. Website traffic still goes to the sites you open.',
    privacy: [
      { title: 'Stored on this Mac', paragraphs: ['Aliases, start URLs, origins and appearance live in ~/.config/lowkey/config.json. The last 1,000 unique submitted entries live in ~/Library/Application Support/Lowkey/history.json, not a log of every page visited.', 'Saved sites have separate persistent WebKit stores; ordinary windows share the default store and popups share their opener’s store. Profile separation is not an OS sandbox. Window geometry is stored locally.'] },
      { title: 'Network and permissions', paragraphs: ['WebKit sends normal requests, cookies and site data for the current profile. lowkey does not transfer Safari cookies, send app analytics or fetch an update feed. Downloads and release pages use GitHub.', 'Websites can request camera or microphone access through WebKit and macOS. Uploads and downloads use native dialogs. No Accessibility or Input Monitoring permission is needed.'] },
      { title: 'Control and deletion', paragraphs: ['Forget individual submitted entries with × in the prompt, or clear input history in Settings. Removing a saved site confirms deletion of its profile; hiding or closing it does not erase cookies.', 'Uninstalling the app does not erase its settings, history or WebKit data. See Support for the exact paths and limits. Never attach real profile data to a public issue.'] },
    ],
  },
  ru: {
    guide: lowkeyGuide('ru'),
    category: 'Спокойный браузер', tagline: 'Один сайт. Своё пространство.',
    description: 'Компактный браузер для macOS на системном WebKit. Без вкладок и постоянной адресной строки: сохранённые сайты открываются по алиасу, каждый с отдельным профилем и авторизацией.',
    shots: [
      { ...browser, caption: 'Страница без лишних панелей.', alt: 'Настоящее окно lowkey с локальным демо-сайтом Field Notes. В узкой полосе — закрытие, назад, начальная страница и вперёд. Вкладок и постоянной адресной строки нет.' },
      { ...prompt, caption: 'Достаточно алиаса.', alt: 'Тёмная адресная панель lowkey: два настроенных демо-сайта. Бейджи алиасов одной ширины, снизу — подсказки клавиш.' },
      { ...settings, caption: 'У каждого сайта — свой профиль.', alt: 'Настройки lowkey с тремя демо-алиасами. У Field Notes заданы алиас, начальный адрес и открытие внешних ссылок в браузере по умолчанию.' },
    ],
    features: [
      { title: 'Раздельные авторизации', text: 'У каждого сохранённого сайта — постоянный профиль WebKit. Обычные окна используют общий профиль, всплывающие — профиль родителя. Закрытие окна не удаляет cookies.' },
      { title: 'Меньше ввода', text: 'Command-L принимает алиасы, HTTP(S)-адреса и имена хостов. Пустая панель показывает только сохранённые сайты. При вводе появляются и подходящие адреса из истории. Поиск учитывает русскую, украинскую и американскую раскладки.' },
      { title: 'Остаться в этом профиле', text: 'Command-Shift-L открывает адрес или алиас в текущем окне и том же профиле, в том числе в окне авторизации. Последующие ссылки подчиняются обычным правилам. Некоторые провайдеры всё равно блокируют встроенные браузеры.' },
      { title: 'В вашем рабочем процессе', text: 'Вызывайте lowkey://alias/open и lowkey://alias/toggle из лаунчера, например Ting. Скрывайте сайт, не закрывая страницу. Выбирайте тему Page, System, Light или Dark и свою палитру.' },
    ],
    installNote: 'В версии 0.1.1 утилита lowkeyctl управляет выбранным окном и элементами страницы. Скачайте универсальный ZIP для Apple Silicon и Intel. Автообновления и Homebrew cask нет.',
    steps: [
      { title: 'Скачайте и установите', text: 'Скачайте универсальный ZIP из GitHub Releases, распакуйте и перенесите lowkey.app в /Applications. Официальные сборки подписаны Developer ID, нотарифицированы Apple и содержат stapled-билет. В релизе есть SHA-256.' },
      { title: 'Добавьте сайты', text: 'Откройте lowkey и нажмите Command-запятая. В Settings задайте алиас, необязательное название и начальный адрес. Каждый сайт получит свой профиль. Command-L открывает алиас или адрес.' },
      { title: 'Откройте из лаунчера', text: 'Пример открывает сохранённый алиас notes. Замените его на свой настроенный алиас. Команда не создаёт сайт.', command: "open 'lowkey://notes/open'" },
      { title: 'Обновите без потери авторизации', text: 'Завершите lowkey, скачайте новый релиз с GitHub и замените только приложение. Конфигурация, история ввода и профили останутся. Прежние окна не открываются. Когда lowkey запущен, нажмите значок в Dock, чтобы открыть адресную панель. Это работает и при открытом окне сайта.' },
    ],
    faq: [
      { question: 'Любая авторизация работает?', answer: 'Нет. Google и другие провайдеры могут отклонять встроенные браузеры. Окна авторизации используют нужный профиль, но lowkey не выдаёт себя за Safari, не обходит проверку сертификатов и не переносит cookies другого браузера. Сложные OAuth-сценарии не гарантируются.' },
      { question: 'Что происходит при закрытии сайта?', answer: 'Command-W скрывает сохранённый сайт, страница продолжает работать. Shift-Command-W закрывает окно, сохраняя профиль. Обычное окно закрывается по Command-W. Удаление сайта в Settings требует подтверждения перед удалением профиля.' },
      { question: 'Есть веб-поиск и расширения?', answer: 'Нет поиска через поисковую систему, расширений, интеграции с менеджером паролей и службы автоматических обновлений.' },
    ],
    supportIntro: 'Настройка, профили и помощь по lowkey. Для отчёта об ошибке используйте демо-страницу; не публикуйте учётные данные и частные адреса.',
    support: [
      { title: 'Проверьте адрес и профиль', paragraphs: ['Используйте HTTP(S)-адрес или имя хоста. Алиасы не зависят от регистра. Command-L из сохранённого сайта может открыть обычное окно; Command-Shift-L явно использует текущий профиль.', 'Если провайдер блокирует вход, используйте поддерживаемый браузер. Дополнительные origins и правила внешних ссылок управляют навигацией, а не создают изолированную среду безопасности.'] },
      { title: 'Безопасный отчёт об ошибке', paragraphs: ['Укажите версии lowkey и macOS, затем минимальные шаги воспроизведения. Скройте cookies, пароли, токены в адресах, частные хосты и config.json. Сборка из исходников требует Swift 6.2 / Xcode 26 или новее.', 'LOWKEY_CONFIG изолирует конфигурацию и историю ввода, но не обычный профиль WebKit. Для проверки нужны случайные ID сайтов или непостоянное хранилище и локальная демо-страница.'] },
      { title: 'Удаление', paragraphs: ['Чтобы удалить данные сохранённого сайта, сначала удалите его в Settings. Затем завершите lowkey и удалите lowkey.app. Удаление одного приложения сохраняет профили, настройки и историю.', 'Конфигурация: ~/.config/lowkey/config.json. История ввода: ~/Library/Application Support/Lowkey/history.json; исторический регистр каталога сохранён. Данными обычных окон управляет WebKit. Не удаляйте файлы другого браузера.'] },
    ],
    privacyTitle: 'Ваши сайты. Раздельные профили.',
    privacyIntro: 'У lowkey нет службы аккаунтов, аналитики и собственного сервера. Сетевые запросы всё равно отправляются открываемым сайтам.',
    privacy: [
      { title: 'На этом Mac', paragraphs: ['Алиасы, адреса, origins и оформление хранятся в ~/.config/lowkey/config.json. Последние 1 000 уникальных введённых значений — в ~/Library/Application Support/Lowkey/history.json. Это не журнал всех посещённых страниц.', 'Сохранённые сайты используют отдельные постоянные хранилища WebKit. У обычных окон общий профиль, у всплывающих — профиль родителя. Это не системная песочница. Геометрия окон хранится локально.'] },
      { title: 'Сеть и разрешения', paragraphs: ['WebKit отправляет обычные запросы, cookies и данные текущего профиля. lowkey не переносит cookies Safari, не отправляет аналитику и не загружает фид обновлений. Релизы и загрузки размещены на GitHub.', 'Сайты могут запрашивать камеру и микрофон через WebKit и macOS. Выбор и сохранение файлов проходят через системные диалоги. Разрешения Accessibility и Input Monitoring не нужны.'] },
      { title: 'Управление и удаление', paragraphs: ['Отдельную запись ввода можно забыть кнопкой ×, всю историю — очистить в Settings. Удаление сайта подтверждается и удаляет его профиль. Скрытие и закрытие окна не стирают cookies.', 'Удаление приложения не стирает настройки, историю и данные WebKit. Точные пути и ограничения указаны в разделе поддержки. Не прикладывайте настоящие профили к публичным обращениям.'] },
    ],
  },
  uk: {
    guide: lowkeyGuide('uk'),
    category: 'Спокійний браузер', tagline: 'Один сайт. Власний простір.',
    description: 'Компактний браузер для macOS на системному WebKit. Без вкладок і постійного адресного рядка: збережені сайти відкриваються за аліасом, кожен з окремим профілем і авторизацією.',
    shots: [
      { ...browser, caption: 'Сторінка без зайвих панелей.', alt: 'Справжнє вікно lowkey з локальним демо-сайтом Field Notes. На вузькій смузі — закриття, назад, початкова сторінка та вперед. Вкладок і постійного адресного рядка немає.' },
      { ...prompt, caption: 'Достатньо аліаса.', alt: 'Темна адресна панель lowkey: два налаштовані демо-сайти. Бейджі аліасів однакової ширини, внизу — підказки клавіш.' },
      { ...settings, caption: 'У кожного сайту — власний профіль.', alt: 'Налаштування lowkey із трьома демо-аліасами. Для Field Notes задано аліас, початкову адресу та відкриття зовнішніх посилань у браузері за замовчуванням.' },
    ],
    features: [
      { title: 'Окремі авторизації', text: 'Кожен збережений сайт має постійний профіль WebKit. Звичайні вікна використовують спільний профіль, спливні — профіль батьківського вікна. Закриття вікна не видаляє cookies.' },
      { title: 'Менше введення', text: 'Command-L приймає аліаси, HTTP(S)-адреси та імена хостів. Порожня панель показує лише збережені сайти. Коли ви вводите текст, з’являються також відповідні адреси з історії. Пошук враховує українську, російську й американську розкладки.' },
      { title: 'Залишитися в цьому профілі', text: 'Command-Shift-L відкриває адресу або аліас у поточному вікні та тому самому профілі, зокрема у вікні авторизації. Подальші посилання дотримуються звичайних правил. Деякі провайдери все одно блокують вбудовані браузери.' },
      { title: 'У вашому робочому процесі', text: 'Викликайте lowkey://alias/open і lowkey://alias/toggle з лаунчера, наприклад Ting. Приховуйте сайт, не закриваючи сторінку. Вибирайте тему Page, System, Light або Dark і власну палітру.' },
    ],
    installNote: 'У версії 0.1.1 утиліта lowkeyctl керує вибраним вікном та елементами сторінки. Завантажте універсальний ZIP для Apple Silicon та Intel. Автооновлення й Homebrew cask немає.',
    steps: [
      { title: 'Завантажте та встановіть', text: 'Завантажте універсальний ZIP із GitHub Releases, розпакуйте й перенесіть lowkey.app до /Applications. Офіційні збірки підписані Developer ID, нотаризовані Apple та мають stapled-квиток. Реліз містить SHA-256.' },
      { title: 'Додайте сайти', text: 'Відкрийте lowkey та натисніть Command-кома. У Settings задайте аліас, необов’язкову назву й початкову адресу. Кожен сайт отримає власний профіль. Command-L відкриває аліас або адресу.' },
      { title: 'Відкрийте з лаунчера', text: 'Приклад відкриває збережений аліас notes. Замініть його своїм налаштованим аліасом. Команда не створює сайт.', command: "open 'lowkey://notes/open'" },
      { title: 'Оновіть без втрати авторизації', text: 'Завершіть lowkey, завантажте новий реліз із GitHub і замініть лише застосунок. Конфігурація, історія введення та профілі залишаться. Попередні вікна не відкриваються. Коли lowkey запущено, натисніть значок у Dock, щоб відкрити адресну панель. Це працює й тоді, коли вікно сайту відкрите.' },
    ],
    faq: [
      { question: 'Будь-яка авторизація працює?', answer: 'Ні. Google та інші провайдери можуть відхиляти вбудовані браузери. Вікна авторизації використовують потрібний профіль, але lowkey не видає себе за Safari, не обходить перевірку сертифікатів і не переносить cookies іншого браузера. Складні OAuth-сценарії не гарантовані.' },
      { question: 'Що відбувається після закриття сайту?', answer: 'Command-W приховує збережений сайт, сторінка продовжує працювати. Shift-Command-W закриває вікно, зберігаючи профіль. Звичайне вікно закривається за Command-W. Видалення сайту в Settings потребує підтвердження перед видаленням профілю.' },
      { question: 'Є вебпошук і розширення?', answer: 'Немає пошуку через пошукову систему, розширень, інтеграції з менеджером паролів і служби автоматичних оновлень.' },
    ],
    supportIntro: 'Налаштування, профілі та допомога з lowkey. Для звіту про помилку використовуйте демо-сторінку; не публікуйте облікові дані й приватні адреси.',
    support: [
      { title: 'Перевірте адресу й профіль', paragraphs: ['Використовуйте HTTP(S)-адресу або ім’я хоста. Аліаси не залежать від регістру. Command-L зі збереженого сайту може відкрити звичайне вікно; Command-Shift-L явно використовує поточний профіль.', 'Якщо провайдер блокує вхід, використовуйте підтримуваний браузер. Додаткові origins і правила зовнішніх посилань керують навігацією, а не створюють ізольоване середовище безпеки.'] },
      { title: 'Безпечний звіт про помилку', paragraphs: ['Укажіть версії lowkey та macOS і мінімальні кроки відтворення. Приховайте cookies, паролі, токени в адресах, приватні хости й config.json. Збирання з джерел потребує Swift 6.2 / Xcode 26 або новішого.', 'LOWKEY_CONFIG ізолює конфігурацію та історію введення, але не звичайний профіль WebKit. Для перевірки потрібні випадкові ID сайтів або непостійне сховище й локальна демо-сторінка.'] },
      { title: 'Видалення', paragraphs: ['Щоб видалити дані збереженого сайту, спочатку видаліть його в Settings. Потім завершіть lowkey і видаліть lowkey.app. Видалення лише застосунку зберігає профілі, налаштування та історію.', 'Конфігурація: ~/.config/lowkey/config.json. Історія введення: ~/Library/Application Support/Lowkey/history.json; історичний регістр каталогу збережено. Даними звичайних вікон керує WebKit. Не видаляйте файли іншого браузера.'] },
    ],
    privacyTitle: 'Ваші сайти. Окремі профілі.',
    privacyIntro: 'lowkey не має служби акаунтів, аналітики й власного сервера. Мережеві запити все одно надходять до відкритих сайтів.',
    privacy: [
      { title: 'На цьому Mac', paragraphs: ['Аліаси, адреси, origins та оформлення зберігаються в ~/.config/lowkey/config.json. Останні 1 000 унікальних введених значень — у ~/Library/Application Support/Lowkey/history.json. Це не журнал усіх відвіданих сторінок.', 'Збережені сайти використовують окремі постійні сховища WebKit. Звичайні вікна мають спільний профіль, спливні — профіль батьківського вікна. Це не системна пісочниця. Геометрія вікон зберігається локально.'] },
      { title: 'Мережа й дозволи', paragraphs: ['WebKit надсилає звичайні запити, cookies і дані поточного профілю. lowkey не переносить cookies Safari, не надсилає аналітику й не завантажує фід оновлень. Релізи та завантаження розміщені на GitHub.', 'Сайти можуть запитувати камеру й мікрофон через WebKit і macOS. Вибір та збереження файлів проходять через системні діалоги. Дозволи Accessibility та Input Monitoring не потрібні.'] },
      { title: 'Керування та видалення', paragraphs: ['Окремий запис введення можна забути кнопкою ×, усю історію — очистити в Settings. Видалення сайту підтверджується та видаляє його профіль. Приховування й закриття вікна не стирають cookies.', 'Видалення застосунку не стирає налаштування, історію та дані WebKit. Точні шляхи й обмеження наведено в розділі підтримки. Не додавайте справжні профілі до публічних звернень.'] },
    ],
  },
};
export default copy;
