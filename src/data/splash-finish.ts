import type { AppCopy } from './types';
import type { Locale } from '../i18n';
const command = 'curl -fsSL https://raw.githubusercontent.com/bobuk-io/splash-finish/main/install.py | python3 -';
const scriptUrl = 'https://github.com/bobuk-io/splash-finish/blob/main/install.py';
export const splashCopy: Record<Locale, AppCopy> = {
  en: {
    category: 'For working with AI', tagline: 'Your agents work. You stay focused.',
    description: 'One quiet inbox for Claude Code, Codex, and pi. Know when work is done or an agent needs a decision, then return to the right session.',
    screenshotAlt: 'Splash Finish inbox: one request for attention and two completed tasks from Claude Code, Codex, and pi',
    features: [
      { title: 'One place for everything', text: 'Completed tasks and requests for attention from Claude Code, Codex, and pi share one window.' },
      { title: 'Back to the context', text: 'Click a notification to return to its source. Exact navigation depends on your terminal and integration.' },
      { title: 'At your own pace', text: 'Snooze notifications, respect Do Not Disturb, pick a light or dark theme, or open the inbox with ⌥⌘S.' },
      { title: 'Local by default', text: 'No app account or analytics. The inbox stays on your Mac; updates come from GitHub.' },
    ],
    installNote: 'The installer requires Python 3.10+.',
    steps: [
      { title: 'Install the app', text: 'Run this in Terminal. The installer checks SHA-256 and the Developer ID signature, then installs the app in ~/Applications.', command, scriptUrl },
      { title: 'Connect your agents', text: 'In Claude Code, start a new session. In Codex, review and trust hooks via /hooks. In pi, run /reload.', command: 'splash-finish install-skills' },
    ],
    faq: [
      { question: 'What’s new in 0.3.9?', answer: 'A light theme. Open Settings… (⌘,) from the menu bar icon and choose Light or Dark; the panel stays dark until you switch. Start at Login, Respect Do Not Disturb, and installing or removing agent skills now live in Settings too.' },
      { question: 'What changed in 0.3.8?', answer: 'Less noise from pi: browsing idle menus such as /jewter no longer opens Splash Finish or clears completed items. Questions and approvals during an agent run still notify you. Managed workers can opt out with SPLASH_FINISH_DISABLED=1.' },
      { question: 'Is this an App Store app?', answer: 'Not yet. A signed and notarized version is available through GitHub Releases. An App Store link will appear after publication.' },
      { question: 'Do I need all three agents?', answer: 'No. Install just one integration: splash-finish install-skills --agent pi. Replace pi with claude or codex as needed.' },
      { question: 'How do I update or uninstall?', answer: 'Use Check for Updates in the app menu or run the installer again. After updating to 0.3.8, run splash-finish install-skills to refresh integrations, then /reload in existing pi sessions. To uninstall, first run splash-finish uninstall-skills, quit the app, and remove it from ~/Applications. See Support for data removal details.' },
    ],
    supportIntro: 'Installation, integrations, and a direct line to the project. No form that disappears into nowhere.',
    support: [
      { title: 'Something isn’t working?', paragraphs: [], items: ['Update the app by running the installer again.', 'Run splash-finish doctor to inspect integrations and repair hints.', 'In Codex, check hook trust via /hooks. In pi, run /reload. In Claude Code, start a new session.'] },
      { title: 'Too many pi notifications?', paragraphs: ['Update to 0.3.8 or later, run splash-finish install-skills, and run /reload in existing pi sessions. Menus opened while pi is idle no longer trigger attention notifications.', 'For managed workers, set SPLASH_FINISH_DISABLED=1 in the worker process environment. Leave it unset in the coordinator. This suppresses worker hooks, rich questions, and explicit notify calls; unmarked helper sessions can still notify.'] },
      { title: 'Report a problem', paragraphs: ['Include your macOS, app, and agent versions, steps to reproduce, and the expected result. Do not post full status --raw output: it can contain private task excerpts.'] },
      { title: 'Uninstall and remove data', paragraphs: [], items: ['Run splash-finish uninstall-skills.', 'Quit Splash Finish and remove ~/Applications/Splash Finish.app and the splash-finish symlink from your local bin directory.', 'To erase the inbox, remove ~/Library/Application Support/Splash Finish. Agent configuration backups remain next to their configuration files; remove those separately if no longer needed.'] },
    ],
    privacyTitle: 'Your tasks. On your Mac.', privacyIntro: 'How the current GitHub-distributed version of Splash Finish handles data.',
    privacy: [
      { title: 'Data stored by the app', paragraphs: ['No account is required. The app has no analytics or servers of its own. The inbox is stored locally at ~/Library/Application Support/Splash Finish/state.json. It may contain task titles and details, agent and project names, and source-session links.', 'Titles and details can contain short excerpts from agent responses. Never send secrets in notifications. The app does not retain entire transcripts or tool inputs. Other processes running as your user may access local data.'] },
      { title: 'Rich pi questions', paragraphs: ['When pi-agent-ask integration is enabled, question text and answers travel over a per-request local Unix socket in a private user directory, not through deep links or the saved inbox.'] },
      { title: 'Network use', paragraphs: ['The installer contacts GitHub for releases. Sparkle checks the public GitHub update feed and downloads updates. GitHub receives ordinary request data, including the IP address, under its privacy policy.', 'External source links open when you choose them. The destination service’s privacy policy applies. This website is hosted on GitHub Pages.'] },
      { title: 'Deleting data', paragraphs: ['Quit the app and remove ~/Library/Application Support/Splash Finish. Run splash-finish uninstall-skills to remove integrations. Agent configuration backups must be removed separately.'] },
      { title: 'Privacy questions', paragraphs: ['Use the Support page. GitHub Issues are public: do not include personal information or secrets.'] },
    ],
  },
  ru: {
    category: 'Для работы с AI', tagline: 'Агенты работают. Вы — не отвлекаетесь.',
    description: 'Один тихий инбокс для Claude Code, Codex и pi. Узнайте, когда работа закончена или агенту нужно ваше решение, — и вернитесь к нужной сессии.',
    screenshotAlt: 'Окно Splash Finish: один запрос внимания и две завершённые задачи от Claude Code, Codex и pi',
    features: [
      { title: 'Всё в одном месте', text: 'Завершённые задачи и запросы внимания от Claude Code, Codex и pi собираются в общем окне.' },
      { title: 'Назад к контексту', text: 'Нажмите на уведомление, чтобы вернуться к источнику. Точный переход зависит от терминала и интеграции.' },
      { title: 'В вашем ритме', text: 'Отложите уведомления, включите учёт режима «Не беспокоить», выберите светлую или тёмную тему или откройте инбокс сочетанием ⌥⌘S.' },
      { title: 'Локально по умолчанию', text: 'Без аккаунта и аналитики приложения. Инбокс хранится на Mac; обновления загружаются с GitHub.' },
    ],
    installNote: 'Для установщика нужен Python 3.10+.',
    steps: [
      { title: 'Установите приложение', text: 'Выполните в Терминале. Установщик проверит SHA-256 и подпись Developer ID, затем установит приложение в ~/Applications.', command, scriptUrl },
      { title: 'Подключите агентов', text: 'В Claude Code начните новую сессию; в Codex подтвердите hooks через /hooks; в pi выполните /reload.', command: 'splash-finish install-skills' },
    ],
    faq: [
      { question: 'Что нового в 0.3.9?', answer: 'Светлая тема. Откройте Settings… (⌘,) из значка в строке меню и выберите Light или Dark; до переключения панель остаётся тёмной. Start at Login, Respect Do Not Disturb, установка и удаление навыков агентов теперь тоже находятся в Settings.' },
      { question: 'Что изменилось в 0.3.8?', answer: 'Меньше шума от pi: просмотр меню при простое, например /jewter, больше не открывает Splash Finish и не убирает завершённые задачи. Вопросы и подтверждения во время работы агента по-прежнему вызывают уведомления. Для управляемых воркеров добавлен флаг SPLASH_FINISH_DISABLED=1.' },
      { question: 'Это приложение из App Store?', answer: 'Пока нет. Сейчас доступна подписанная и нотарифицированная версия через GitHub Releases. Ссылка на App Store появится после публикации.' },
      { question: 'Нужно ли подключать все три агента?', answer: 'Нет. Можно установить одну интеграцию: splash-finish install-skills --agent pi. Вместо pi можно указать claude или codex.' },
      { question: 'Как обновить или удалить приложение?', answer: 'Выберите Check for Updates в меню приложения или повторно запустите установщик. После обновления до 0.3.8 выполните splash-finish install-skills для обновления интеграций, затем /reload в открытых сессиях pi. Для удаления выполните splash-finish uninstall-skills, закройте приложение и удалите его из ~/Applications. Подробности удаления данных — в поддержке.' },
    ],
    supportIntro: 'Инструкции и прямая связь с проектом. Без формы, которая теряется в пустоте.',
    support: [
      { title: 'Что-то не работает?', paragraphs: [], items: ['Обновите приложение, повторно запустив установщик.', 'Выполните splash-finish doctor — он проверит интеграции и подскажет, что исправить.', 'В Codex проверьте доверие к hooks через /hooks. В pi выполните /reload, в Claude Code начните новую сессию.'] },
      { title: 'Слишком много уведомлений от pi?', paragraphs: ['Обновитесь до 0.3.8 или новее, выполните splash-finish install-skills, затем /reload в открытых сессиях pi. Меню, открытые при простое pi, больше не вызывают уведомлений о запросе внимания.', 'Для управляемых воркеров задайте SPLASH_FINISH_DISABLED=1 в окружении процесса воркера. У координатора оставьте переменную незаданной. Это отключает хуки, интерактивные вопросы и явные вызовы notify от воркера; непомеченные служебные сессии всё ещё могут присылать уведомления.'] },
      { title: 'Сообщить о проблеме', paragraphs: ['Укажите версии macOS, приложения и агента, шаги воспроизведения и ожидаемый результат. Не публикуйте полный вывод status --raw: он может содержать приватные фрагменты задач.'] },
      { title: 'Удаление приложения и данных', paragraphs: [], items: ['Выполните splash-finish uninstall-skills.', 'Закройте Splash Finish, удалите ~/Applications/Splash Finish.app и ссылку splash-finish из локальной bin-директории.', 'Чтобы стереть инбокс, удалите ~/Library/Application Support/Splash Finish. Резервные копии конфигураций агентов остаются рядом с ними; при необходимости удалите их отдельно.'] },
    ],
    privacyTitle: 'Ваши задачи. На вашем Mac.', privacyIntro: 'Информация об обработке данных в текущей версии Splash Finish, распространяемой через GitHub.',
    privacy: [
      { title: 'Какие данные хранит приложение', paragraphs: ['Приложение не требует аккаунта и не использует собственные серверы или аналитику. Инбокс хранится локально в ~/Library/Application Support/Splash Finish/state.json. В нём могут быть названия и детали задач, имена агентов и проектов, ссылки на исходные сессии.', 'Заголовки и детали могут содержать короткие фрагменты ответа агента. Не передавайте секреты в уведомления. Полные транскрипты и входные данные инструментов не сохраняются. Доступ к локальным данным возможен у процессов, работающих от имени вашего пользователя.'] },
      { title: 'Вопросы и ответы pi', paragraphs: ['При включённой интеграции с pi-agent-ask тексты вопросов и ответы передаются через локальный Unix-сокет в приватной пользовательской директории, а не через deep link или сохранённый инбокс.'] },
      { title: 'Когда используется сеть', paragraphs: ['Установщик обращается к GitHub за релизами. Sparkle проверяет публичную ленту обновлений GitHub и загружает обновления. GitHub получает обычные данные запроса, в том числе IP-адрес, по своей политике конфиденциальности.', 'Внешние ссылки открываются по вашему действию. При переходе действуют правила соответствующего сервиса. Этот сайт размещён на GitHub Pages.'] },
      { title: 'Как удалить данные', paragraphs: ['Закройте приложение и удалите ~/Library/Application Support/Splash Finish. Для удаления интеграций выполните splash-finish uninstall-skills. Резервные копии настроек агентов удаляются отдельно.'] },
      { title: 'Вопросы об обработке данных', paragraphs: ['Используйте страницу поддержки. GitHub Issues публичны: не включайте персональные или секретные данные.'] },
    ],
  },
  uk: {
    category: 'Для роботи з AI', tagline: 'Агенти працюють. Ви — не відволікаєтеся.',
    description: 'Один тихий інбокс для Claude Code, Codex і pi. Дізнайтеся, коли роботу завершено або агенту потрібне ваше рішення, — і поверніться до потрібної сесії.',
    screenshotAlt: 'Вікно Splash Finish: один запит уваги та два завершені завдання від Claude Code, Codex і pi',
    features: [
      { title: 'Усе в одному місці', text: 'Завершені завдання та запити уваги від Claude Code, Codex і pi збираються в спільному вікні.' },
      { title: 'Назад до контексту', text: 'Натисніть сповіщення, щоб повернутися до джерела. Точний перехід залежить від термінала та інтеграції.' },
      { title: 'У вашому ритмі', text: 'Відкладіть сповіщення, увімкніть урахування режиму «Не турбувати», виберіть світлу або темну тему чи відкрийте інбокс сполученням ⌥⌘S.' },
      { title: 'Локально за замовчуванням', text: 'Без облікового запису й аналітики застосунку. Інбокс зберігається на Mac; оновлення надходять із GitHub.' },
    ],
    installNote: 'Для інсталятора потрібен Python 3.10+.',
    steps: [
      { title: 'Встановіть застосунок', text: 'Виконайте в Терміналі. Інсталятор перевірить SHA-256 і підпис Developer ID, а потім встановить застосунок у ~/Applications.', command, scriptUrl },
      { title: 'Підключіть агентів', text: 'У Claude Code почніть нову сесію; у Codex підтвердьте hooks через /hooks; у pi виконайте /reload.', command: 'splash-finish install-skills' },
    ],
    faq: [
      { question: 'Що нового в 0.3.9?', answer: 'Світла тема. Відкрийте Settings… (⌘,) зі значка в рядку меню та виберіть Light або Dark; до перемикання панель залишається темною. Start at Login, Respect Do Not Disturb, встановлення та видалення навичок агентів тепер теж у Settings.' },
      { question: 'Що змінилося в 0.3.8?', answer: 'Менше шуму від pi: перегляд меню під час простою, наприклад /jewter, більше не відкриває Splash Finish і не прибирає завершені завдання. Запитання та підтвердження під час роботи агента й надалі викликають сповіщення. Для керованих воркерів додано прапорець SPLASH_FINISH_DISABLED=1.' },
      { question: 'Це застосунок з App Store?', answer: 'Поки ні. Підписана й нотаризована версія доступна через GitHub Releases. Посилання на App Store з’явиться після публікації.' },
      { question: 'Чи потрібно підключати всіх трьох агентів?', answer: 'Ні. Можна встановити одну інтеграцію: splash-finish install-skills --agent pi. Замість pi можна вказати claude або codex.' },
      { question: 'Як оновити або видалити застосунок?', answer: 'Виберіть Check for Updates у меню застосунку або знову запустіть інсталятор. Після оновлення до 0.3.8 виконайте splash-finish install-skills для оновлення інтеграцій, потім /reload у відкритих сесіях pi. Для видалення виконайте splash-finish uninstall-skills, закрийте застосунок і видаліть його з ~/Applications. Подробиці видалення даних — у підтримці.' },
    ],
    supportIntro: 'Інструкції та прямий зв’язок із проєктом. Без форми, що губиться в порожнечі.',
    support: [
      { title: 'Щось не працює?', paragraphs: [], items: ['Оновіть застосунок, знову запустивши інсталятор.', 'Виконайте splash-finish doctor — він перевірить інтеграції та підкаже, що виправити.', 'У Codex перевірте довіру до hooks через /hooks. У pi виконайте /reload, у Claude Code почніть нову сесію.'] },
      { title: 'Забагато сповіщень від pi?', paragraphs: ['Оновіться до 0.3.8 або новішої версії, виконайте splash-finish install-skills, потім /reload у відкритих сесіях pi. Меню, відкриті під час простою pi, більше не викликають сповіщень із запитом уваги.', 'Для керованих воркерів задайте SPLASH_FINISH_DISABLED=1 в оточенні процесу воркера. У координатора залиште змінну незаданою. Це вимикає хуки, інтерактивні запитання та явні виклики notify від воркера; непозначені службові сесії все ще можуть надсилати сповіщення.'] },
      { title: 'Повідомити про проблему', paragraphs: ['Укажіть версії macOS, застосунку й агента, кроки відтворення та очікуваний результат. Не публікуйте повний вивід status --raw: він може містити приватні фрагменти завдань.'] },
      { title: 'Видалення застосунку й даних', paragraphs: [], items: ['Виконайте splash-finish uninstall-skills.', 'Закрийте Splash Finish, видаліть ~/Applications/Splash Finish.app та посилання splash-finish із локальної bin-директорії.', 'Щоб стерти інбокс, видаліть ~/Library/Application Support/Splash Finish. Резервні копії конфігурацій агентів залишаються поруч із ними; за потреби видаліть їх окремо.'] },
    ],
    privacyTitle: 'Ваші завдання. На вашому Mac.', privacyIntro: 'Інформація про обробку даних у поточній версії Splash Finish, що розповсюджується через GitHub.',
    privacy: [
      { title: 'Які дані зберігає застосунок', paragraphs: ['Застосунок не потребує облікового запису й не використовує власних серверів або аналітики. Інбокс зберігається локально в ~/Library/Application Support/Splash Finish/state.json. Він може містити назви й деталі завдань, імена агентів і проєктів, посилання на вихідні сесії.', 'Заголовки й деталі можуть містити короткі фрагменти відповіді агента. Не передавайте секрети у сповіщеннях. Повні транскрипти та вхідні дані інструментів не зберігаються. Процеси, що працюють від імені вашого користувача, можуть мати доступ до локальних даних.'] },
      { title: 'Запитання та відповіді pi', paragraphs: ['За ввімкненої інтеграції з pi-agent-ask тексти запитань і відповіді передаються через локальний Unix-сокет у приватній користувацькій директорії, а не через deep link чи збережений інбокс.'] },
      { title: 'Коли використовується мережа', paragraphs: ['Інсталятор звертається до GitHub по релізи. Sparkle перевіряє публічну стрічку оновлень GitHub і завантажує оновлення. GitHub отримує звичайні дані запиту, зокрема IP-адресу, за власною політикою конфіденційності.', 'Зовнішні посилання відкриваються за вашою дією. Після переходу діють правила відповідного сервісу. Цей сайт розміщено на GitHub Pages.'] },
      { title: 'Як видалити дані', paragraphs: ['Закрийте застосунок і видаліть ~/Library/Application Support/Splash Finish. Для видалення інтеграцій виконайте splash-finish uninstall-skills. Резервні копії налаштувань агентів видаляються окремо.'] },
      { title: 'Запитання про обробку даних', paragraphs: ['Скористайтеся сторінкою підтримки. GitHub Issues публічні: не додавайте персональних чи секретних даних.'] },
    ],
  },
};
