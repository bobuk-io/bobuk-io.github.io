import type { AppCopy } from './types';
import type { Locale } from '../i18n';
export const hascsCopy: Record<Locale, AppCopy> = {
  en: {
    category: 'For your home', tagline: 'Your home scenes. One key away.',
    description: 'A native macOS menu-bar remote for Home Assistant scenes. Open the compact panel, press 1–9, and get back to what you were doing.',
    features: [
      { title: 'A remote in your menu bar', text: 'Click the house icon to open the panel on the display containing your pointer.' },
      { title: 'Made for the keyboard', text: 'Keys 1–9 run scenes. Arrows select, Return activates, and Escape closes the panel.' },
      { title: 'Your order, remembered', text: 'Drag scenes or use Shift + arrow keys to reorder them. Saved numbers stay stable across restarts.' },
      { title: 'Keychain, not a text file', text: 'Your Home Assistant URL and token are stored in macOS Keychain. The app supports English, Ukrainian, and Russian.' },
    ],
    installNote: 'Requires a configured Home Assistant instance and a long-lived access token. Up to nine scenes. Scene activation affects real devices.',
    steps: [
      { title: 'Download and install', text: 'Open the latest GitHub release, download the universal ZIP, unzip it, and move HAScS.app to /Applications. Official releases include a SHA-256 checksum.' },
      { title: 'Connect Home Assistant', text: 'Open HAScS, right-click the house icon, and choose Settings. Enter your Home Assistant URL and long-lived access token. Prefer HTTPS and a dedicated non-administrator HA user.' },
      { title: 'Open the remote', text: 'Click the house icon to choose a scene. The panel immediately accepts number keys. This command only opens the panel; it does not itself run a scene.', command: "open 'hascs://scenes'" },
    ],
    faq: [
      { question: 'Do I need Home Assistant?', answer: 'Yes. HAScS is a remote for scenes in your own Home Assistant instance, not a replacement server. Up to nine scenes are available.' },
      { question: 'Does a successful request mean every device changed?', answer: 'No. The confirmation means Home Assistant accepted the request, not that every device reached its final state. Do not use this as a safety-critical controller.' },
      { question: 'Is it in the App Store?', answer: 'Not yet. Download the signed and notarized universal build from GitHub Releases. Global hotkeys and launch at login are not implemented yet.' },
    ],
    supportIntro: 'Connection setup, scene selection, and help from the project. Never share your real Home Assistant token.',
    support: [
      { title: 'Connection troubleshooting', paragraphs: [], items: ['Check the URL in Settings and use HTTPS where possible. HTTP sends the token without transport encryption.', 'Check that the long-lived token is valid and that its Home Assistant user can access the scenes. Leave the token field empty to keep the saved token.', 'Install the latest release. Do not test by repeatedly activating scenes that affect real devices.'] },
      { title: 'Scene order and limits', paragraphs: ['The app displays up to nine scenes. Use Reorder to drag scenes or move them with Shift + arrow keys, then choose Done to save. Escape or closing the panel discards unsaved changes.'] },
      { title: 'Report a problem safely', paragraphs: ['Include the app and macOS versions, steps to reproduce, and the expected result. Redact server addresses, tokens, scene names, screenshots, and device details where necessary.', 'For security issues, use the private reporting instructions in SECURITY.md on GitHub, not a public issue.'] },
      { title: 'Uninstall and remove connection data', paragraphs: [], items: ['Quit HAScS and remove /Applications/HAScS.app.', 'In Keychain Access, remove the HAScS connection item for service io.bobuk.HAScS.credentials.v1 (account home-assistant-connection) if you want to erase saved credentials.', 'Remove legacy .env files and old HAScS Keychain items separately, if present. Revoke the long-lived token in Home Assistant when no longer needed. Deleting the app alone does not revoke it.'] },
    ],
    privacyTitle: 'Your home. Your connection.', privacyIntro: 'How the current GitHub-distributed version of HAScS handles your Home Assistant connection.',
    privacy: [
      { title: 'Credentials and local preferences', paragraphs: ['The Home Assistant URL and long-lived access token are stored in macOS Keychain, not UserDefaults or the app bundle. Scene-number assignments and app preferences are stored locally. Scene names are read from your Home Assistant instance.', 'Earlier local versions can migrate a legacy .env file once. The old file and old Keychain items are not automatically deleted. Remove redundant plaintext copies yourself when safe.'] },
      { title: 'Network requests', paragraphs: ['HAScS connects to the Home Assistant server you configure. It reads /api/states to discover scenes and calls /api/services/scene/turn_on when you activate one. The server receives your token and the request under its own configuration.', 'HTTPS uses system certificate validation. Authenticated requests do not follow redirects. HTTP sends the token without transport encryption. The token has the permissions of its HA user; it is not restricted to scenes by this app.'] },
      { title: 'Project services and this website', paragraphs: ['The current app has no built-in analytics or project-operated account service. Downloads, source code, and support are hosted on GitHub; this website uses GitHub Pages. GitHub may process ordinary request data, including your IP address, under its privacy policy.'] },
      { title: 'Deleting data and revoking access', paragraphs: ['Quit and delete the app, then remove its saved connection in Keychain Access. Remove legacy .env files and old Keychain entries separately. Revoke the long-lived token in Home Assistant to invalidate access. Removing the app does not itself delete Keychain records or revoke tokens.'] },
      { title: 'Privacy questions', paragraphs: ['Use Support. For sensitive security reports, follow SECURITY.md in the repository. Never put tokens or private home details in a public issue.'] },
    ],
  },
  ru: {
    category: 'Для вашего дома', tagline: 'Сцены вашего дома. Одной клавишей.',
    description: 'Нативный пульт для сцен Home Assistant в строке меню macOS. Откройте компактную панель, нажмите 1–9 — и возвращайтесь к своим делам.',
    features: [
      { title: 'Пульт в строке меню', text: 'Нажмите на значок дома: панель откроется на экране, где находится указатель.' },
      { title: 'Удобно с клавиатуры', text: 'Клавиши 1–9 запускают сцены. Стрелки выбирают, Return активирует, Escape закрывает панель.' },
      { title: 'Ваш порядок сохраняется', text: 'Перетаскивайте сцены или используйте Shift + стрелки. Сохранённые номера стабильны после перезапуска.' },
      { title: 'Keychain, а не текстовый файл', text: 'URL и токен Home Assistant хранятся в Связке ключей macOS. Интерфейс поддерживает английский, украинский и русский.' },
    ],
    installNote: 'Нужен настроенный Home Assistant и долгоживущий токен доступа. Доступно до девяти сцен. Запуск сцен влияет на реальные устройства.',
    steps: [
      { title: 'Скачайте и установите', text: 'Откройте последний релиз на GitHub, скачайте универсальный ZIP, распакуйте и перенесите HAScS.app в /Applications. К официальным релизам прилагается контрольная сумма SHA-256.' },
      { title: 'Подключите Home Assistant', text: 'Откройте HAScS, нажмите правой кнопкой на значок дома и выберите Settings. Укажите URL Home Assistant и долгоживущий токен. Предпочтительны HTTPS и отдельный HA-пользователь без прав администратора.' },
      { title: 'Откройте пульт', text: 'Нажмите на значок дома для выбора сцены. Панель сразу принимает цифровые клавиши. Эта команда только открывает панель и сама не запускает сцену.', command: "open 'hascs://scenes'" },
    ],
    faq: [
      { question: 'Нужен ли Home Assistant?', answer: 'Да. HAScS — пульт для сцен в вашем Home Assistant, а не замена сервера. Доступно до девяти сцен.' },
      { question: 'Успешный запрос означает, что все устройства переключились?', answer: 'Нет. Подтверждение означает, что Home Assistant принял запрос, а не что каждое устройство достигло нужного состояния. Не используйте приложение для критичных систем безопасности.' },
      { question: 'Приложение есть в App Store?', answer: 'Пока нет. Подписанная и нотарифицированная универсальная сборка доступна в GitHub Releases. Глобальная горячая клавиша и запуск при входе пока не реализованы.' },
    ],
    supportIntro: 'Настройка подключения, выбор сцен и помощь проекта. Никогда не публикуйте настоящий токен Home Assistant.',
    support: [
      { title: 'Проблемы с подключением', paragraphs: [], items: ['Проверьте URL в настройках; по возможности используйте HTTPS. Через HTTP токен передаётся без шифрования транспорта.', 'Проверьте действительность токена и доступ HA-пользователя к сценам. Пустое поле токена сохраняет прежнее значение.', 'Установите последний релиз. Не проверяйте подключение многократным запуском сцен, влияющих на реальные устройства.'] },
      { title: 'Порядок и ограничение сцен', paragraphs: ['Доступно до девяти сцен. В режиме Reorder перетаскивайте сцены или перемещайте их через Shift + стрелки, затем нажмите Done. Escape и закрытие панели отменяют несохранённые изменения.'] },
      { title: 'Как безопасно сообщить о проблеме', paragraphs: ['Укажите версии приложения и macOS, шаги воспроизведения и ожидаемый результат. При необходимости скройте адреса сервера, токены, названия сцен, скриншоты и сведения об устройствах.', 'Об уязвимостях сообщайте приватно по инструкции SECURITY.md на GitHub, а не в публичном issue.'] },
      { title: 'Удаление приложения и подключения', paragraphs: [], items: ['Закройте HAScS и удалите /Applications/HAScS.app.', 'Чтобы стереть подключение, удалите в Связке ключей запись службы io.bobuk.HAScS.credentials.v1 с аккаунтом home-assistant-connection.', 'Отдельно удалите старые .env и записи HAScS в Keychain, если они остались. Отзовите ненужный долгоживущий токен в Home Assistant: удаление приложения не отзывает его.'] },
    ],
    privacyTitle: 'Ваш дом. Ваше подключение.', privacyIntro: 'Как текущая версия HAScS, распространяемая через GitHub, обрабатывает данные подключения к Home Assistant.',
    privacy: [
      { title: 'Доступы и локальные настройки', paragraphs: ['URL Home Assistant и долгоживущий токен хранятся в Связке ключей macOS, а не в UserDefaults или пакете приложения. Номера сцен и настройки приложения сохраняются локально. Названия сцен считываются из вашего Home Assistant.', 'Ранние локальные версии могут однократно перенести настройки из .env. Старый файл и прежние записи Keychain автоматически не удаляются. Удалите лишние открытые копии самостоятельно, когда это безопасно.'] },
      { title: 'Сетевые запросы', paragraphs: ['HAScS подключается к указанному вами серверу Home Assistant. Читает /api/states для поиска сцен и вызывает /api/services/scene/turn_on при запуске сцены. Сервер получает токен и запрос согласно собственной конфигурации.', 'HTTPS использует системную проверку сертификатов. Авторизованные запросы не следуют перенаправлениям. HTTP передаёт токен без транспортного шифрования. Токен имеет права своего HA-пользователя; приложение не ограничивает его только сценами.'] },
      { title: 'Сервисы проекта и этот сайт', paragraphs: ['В текущем приложении нет встроенной аналитики или собственного сервиса аккаунтов. Загрузки, исходники и поддержка размещены на GitHub, этот сайт — на GitHub Pages. GitHub может обрабатывать обычные данные запросов, включая IP-адрес, по своей политике конфиденциальности.'] },
      { title: 'Удаление данных и отзыв доступа', paragraphs: ['Закройте и удалите приложение, затем удалите сохранённое подключение в Связке ключей. Старые .env и записи Keychain удаляются отдельно. Для прекращения доступа отзовите токен в Home Assistant. Удаление приложения само по себе не удаляет записи Keychain и не отзывает токены.'] },
      { title: 'Вопросы о данных', paragraphs: ['Используйте поддержку. Для чувствительных сообщений об уязвимостях следуйте SECURITY.md в репозитории. Не публикуйте токены и приватные сведения о доме в issue.'] },
    ],
  },
  uk: {
    category: 'Для вашої оселі', tagline: 'Сцени вашої оселі. Однією клавішею.',
    description: 'Нативний пульт для сцен Home Assistant у рядку меню macOS. Відкрийте компактну панель, натисніть 1–9 — і повертайтеся до своїх справ.',
    features: [
      { title: 'Пульт у рядку меню', text: 'Натисніть значок будинку: панель відкриється на екрані, де розташований вказівник.' },
      { title: 'Зручно з клавіатури', text: 'Клавіші 1–9 запускають сцени. Стрілки вибирають, Return активує, Escape закриває панель.' },
      { title: 'Ваш порядок зберігається', text: 'Перетягуйте сцени або використовуйте Shift + стрілки. Збережені номери стабільні після перезапуску.' },
      { title: 'Keychain, а не текстовий файл', text: 'URL і токен Home Assistant зберігаються у В’язці ключів macOS. Інтерфейс підтримує англійську, українську та російську.' },
    ],
    installNote: 'Потрібен налаштований Home Assistant і довгостроковий токен доступу. Доступно до дев’яти сцен. Запуск сцен впливає на справжні пристрої.',
    steps: [
      { title: 'Завантажте та встановіть', text: 'Відкрийте останній реліз на GitHub, завантажте універсальний ZIP, розпакуйте та перенесіть HAScS.app у /Applications. Офіційні релізи мають контрольну суму SHA-256.' },
      { title: 'Підключіть Home Assistant', text: 'Відкрийте HAScS, натисніть правою кнопкою значок будинку та виберіть Settings. Укажіть URL Home Assistant і довгостроковий токен. Бажано використовувати HTTPS та окремого HA-користувача без прав адміністратора.' },
      { title: 'Відкрийте пульт', text: 'Натисніть значок будинку для вибору сцени. Панель одразу приймає цифрові клавіші. Ця команда лише відкриває панель і сама не запускає сцену.', command: "open 'hascs://scenes'" },
    ],
    faq: [
      { question: 'Чи потрібен Home Assistant?', answer: 'Так. HAScS — пульт для сцен у вашому Home Assistant, а не заміна сервера. Доступно до дев’яти сцен.' },
      { question: 'Успішний запит означає, що всі пристрої перемкнулися?', answer: 'Ні. Підтвердження означає, що Home Assistant прийняв запит, а не що кожен пристрій досяг потрібного стану. Не використовуйте застосунок для критичних систем безпеки.' },
      { question: 'Чи є застосунок в App Store?', answer: 'Поки ні. Підписана та нотаризована універсальна збірка доступна в GitHub Releases. Глобальна гаряча клавіша та запуск під час входу поки не реалізовані.' },
    ],
    supportIntro: 'Налаштування підключення, вибір сцен і допомога проєкту. Ніколи не публікуйте справжній токен Home Assistant.',
    support: [
      { title: 'Проблеми з підключенням', paragraphs: [], items: ['Перевірте URL у налаштуваннях; за можливості використовуйте HTTPS. Через HTTP токен передається без транспортного шифрування.', 'Перевірте чинність токена й доступ HA-користувача до сцен. Порожнє поле токена зберігає попереднє значення.', 'Встановіть останній реліз. Не перевіряйте підключення багаторазовим запуском сцен, що впливають на справжні пристрої.'] },
      { title: 'Порядок та обмеження сцен', paragraphs: ['Доступно до дев’яти сцен. У режимі Reorder перетягуйте сцени або переміщуйте їх через Shift + стрілки, а потім натисніть Done. Escape і закриття панелі скасовують незбережені зміни.'] },
      { title: 'Як безпечно повідомити про проблему', paragraphs: ['Укажіть версії застосунку та macOS, кроки відтворення й очікуваний результат. За потреби приховайте адреси сервера, токени, назви сцен, знімки екрана та відомості про пристрої.', 'Про вразливості повідомляйте приватно за інструкцією SECURITY.md на GitHub, а не в публічному issue.'] },
      { title: 'Видалення застосунку та підключення', paragraphs: [], items: ['Закрийте HAScS і видаліть /Applications/HAScS.app.', 'Щоб стерти підключення, видаліть у В’язці ключів запис служби io.bobuk.HAScS.credentials.v1 з обліковим записом home-assistant-connection.', 'Окремо видаліть старі .env і записи HAScS у Keychain, якщо вони залишилися. Відкличте непотрібний довгостроковий токен у Home Assistant: видалення застосунку його не відкликає.'] },
    ],
    privacyTitle: 'Ваша оселя. Ваше підключення.', privacyIntro: 'Як поточна версія HAScS, що розповсюджується через GitHub, обробляє дані підключення до Home Assistant.',
    privacy: [
      { title: 'Доступи та локальні налаштування', paragraphs: ['URL Home Assistant і довгостроковий токен зберігаються у В’язці ключів macOS, а не в UserDefaults чи пакеті застосунку. Номери сцен і налаштування застосунку зберігаються локально. Назви сцен зчитуються з вашого Home Assistant.', 'Ранні локальні версії можуть одноразово перенести налаштування з .env. Старий файл і попередні записи Keychain автоматично не видаляються. Видаліть зайві відкриті копії самостійно, коли це безпечно.'] },
      { title: 'Мережеві запити', paragraphs: ['HAScS підключається до вказаного вами сервера Home Assistant. Читає /api/states для пошуку сцен і викликає /api/services/scene/turn_on під час запуску сцени. Сервер отримує токен і запит відповідно до власної конфігурації.', 'HTTPS використовує системну перевірку сертифікатів. Авторизовані запити не йдуть за перенаправленнями. HTTP передає токен без транспортного шифрування. Токен має права свого HA-користувача; застосунок не обмежує його лише сценами.'] },
      { title: 'Сервіси проєкту й цей сайт', paragraphs: ['У поточному застосунку немає вбудованої аналітики чи власного сервісу облікових записів. Завантаження, вихідний код і підтримка розміщені на GitHub, цей сайт — на GitHub Pages. GitHub може обробляти звичайні дані запитів, зокрема IP-адресу, за власною політикою конфіденційності.'] },
      { title: 'Видалення даних і відкликання доступу', paragraphs: ['Закрийте й видаліть застосунок, а потім видаліть збережене підключення у В’язці ключів. Старі .env і записи Keychain видаляються окремо. Щоб припинити доступ, відкличте токен у Home Assistant. Видалення застосунку саме по собі не видаляє записи Keychain та не відкликає токени.'] },
      { title: 'Запитання про дані', paragraphs: ['Скористайтеся підтримкою. Для чутливих повідомлень про вразливості дотримуйтеся SECURITY.md у репозиторії. Не публікуйте токени та приватні відомості про оселю в issue.'] },
    ],
  },
};
