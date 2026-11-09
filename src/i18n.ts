export const locales = ['en', 'ru', 'uk'] as const;
export type Locale = typeof locales[number];
export const languageNames: Record<Locale, string> = { en: 'English', ru: 'Русский', uk: 'Українська' };
export const ogLocales: Record<Locale, string> = { en: 'en_US', ru: 'ru_RU', uk: 'uk_UA' };
export function localPath(locale: Locale, path = '') {
  return `${locale === 'en' ? '/' : `/${locale}/`}${path.replace(/^\/+|\/+$/g, '')}${path.replace(/\//g, '') ? '/' : ''}`;
}
const en = {
  siteTitle: 'Small apps for things that matter', siteDescription: 'Independent bobuk.io apps with public source code. Made for real tasks, without the noise.',
  skip: 'Skip to content', home: 'Home', apps: 'Apps', support: 'Support', code: 'Source code', language: 'Language',
  eyebrow: 'Independent apps. Public source code.', hero: 'Less noise.', heroSoft: 'More of your own work.', intro: 'Small tools that solve a specific problem. Made with respect for your time.', findApp: 'Find your app', catalog: 'public catalog',
  explore: 'Take a look', install: 'Install', requirements: 'macOS 14+ · Apple silicon and Intel', companions: 'Works with', onMac: 'On your Mac', shotCaption: 'Less switching. More peace of mind.',
  principles: [
    { label: '01 / Focused', title: 'One thing. Done well.', text: 'Not an everything app. A useful tool that fits into an ordinary day.' },
    { label: '02 / In the open', title: 'The code is no secret.', text: 'Only public bobuk-io projects are listed here. See how they work and suggest improvements.' },
    { label: '03 / In touch', title: 'Somewhere to ask.', text: 'Each app has its own instructions, support page, and information about data.' },
  ],
  closing: 'Good tools don’t demand extra attention.', closingText: 'And if something goes wrong, let’s work it out.', contact: 'Get support', footer: 'Small apps. Attention to detail.', empty: 'No public apps yet. Please check back later.',
  allApps: 'All apps', overview: 'Overview', privacy: 'Privacy', installMac: 'Install on Mac', store: 'View in App Store', signed: 'Signed with Developer ID and notarized by Apple.', distribution: 'Currently distributed through GitHub Releases.',
  quickStart: 'Quick start', installTitle: 'A little setup. Back to your day.', latestRelease: 'View the latest release', copy: 'Copy', copyLabel: 'Copy command', copied: 'Command copied.', copyFailed: 'Could not copy. Select the command and copy it manually.', reviewScript: 'This command downloads and runs a script. Read it before running', faq: 'Good to know',
  supportEyebrow: 'Help', supportTitle: 'Let’s work it out.', privacyEyebrow: 'Data & privacy', issueWarning: 'GitHub Issues are public and require a GitHub account to submit. Never include tokens, personal data, or private session contents.', openIssue: 'Contact support', fullDocs: 'Full documentation on GitHub', privacyNote: 'Based on the public project documentation. Before a store release, verify this page against that build’s behavior and App Privacy declarations.',
  supportHomeTitle: 'Every question has a place.', supportHomeIntro: 'Choose an app for setup instructions, common questions, and a direct link to the project.', supportRow: 'Installation, settings, and help', website: 'About this website', websiteText: 'This catalog lists public bobuk-io apps only. The site has no analytics, data collection forms, third-party scripts, or application cookies. Fonts and images are served locally. The hosting provider may process technical HTTP request data under its own privacy policy.', hostingPrivacy: 'GitHub privacy statement',
  notFound: 'Nothing here', notFoundTitle: 'That’s not the right place.', notFoundText: 'This page moved or hasn’t been created yet.', back: 'Back to apps',
};
type UI = typeof en;
const ru: UI = {
  siteTitle: 'Небольшие приложения для больших дел', siteDescription: 'Независимые приложения bobuk.io с публичным исходным кодом. Сделаны для реальных задач, без лишнего шума.',
  skip: 'К содержимому', home: 'Главная', apps: 'Приложения', support: 'Поддержка', code: 'Исходный код', language: 'Язык',
  eyebrow: 'Независимые приложения с публичным кодом', hero: 'Меньше шума.', heroSoft: 'Больше своего дела.', intro: 'Небольшие инструменты, которые решают конкретную задачу. Сделаны с вниманием к вашему времени.', findApp: 'Найти своё приложение', catalog: 'публичный каталог',
  explore: 'Познакомиться', install: 'Установить', requirements: 'macOS 14+ · Apple silicon и Intel', companions: 'В компании с', onMac: 'На вашем Mac', shotCaption: 'Меньше переключений. Больше спокойствия.',
  principles: [
    { label: '01 / По делу', title: 'Одна задача. Хорошо.', text: 'Не комбайн на все случаи жизни, а инструмент, которому находится место в обычном дне.' },
    { label: '02 / Открыто', title: 'Код — не секрет.', text: 'В каталоге только публичные проекты bobuk-io. Можно посмотреть, как всё устроено, и предложить улучшение.' },
    { label: '03 / На связи', title: 'Есть куда написать.', text: 'У каждого приложения свои инструкции, страница поддержки и информация о данных.' },
  ],
  closing: 'Хорошие инструменты не требуют лишнего внимания.', closingText: 'А если что-то пошло не так — давайте разберёмся.', contact: 'Перейти в поддержку', footer: 'Небольшие приложения. Внимание к деталям.', empty: 'Публичных приложений пока нет. Загляните позже.',
  allApps: 'Все приложения', overview: 'Обзор', privacy: 'Конфиденциальность', installMac: 'Установить на Mac', store: 'Открыть в App Store', signed: 'Подписано Developer ID и нотарифицировано Apple.', distribution: 'Сейчас распространяется через GitHub Releases.',
  quickStart: 'Быстрый старт', installTitle: 'Немного настроек. И можно к работе.', latestRelease: 'Посмотреть последний релиз', copy: 'Копировать', copyLabel: 'Скопировать команду', copied: 'Команда скопирована.', copyFailed: 'Не удалось скопировать. Выделите команду и скопируйте вручную.', reviewScript: 'Команда скачивает и запускает скрипт. Прочитайте его перед запуском', faq: 'Полезно знать',
  supportEyebrow: 'Помощь', supportTitle: 'Давайте разберёмся.', privacyEyebrow: 'Данные и конфиденциальность', issueWarning: 'GitHub Issues публичны; для отправки нужен аккаунт GitHub. Не публикуйте токены, персональные данные и содержимое приватных сессий.', openIssue: 'Написать в поддержку', fullDocs: 'Полная документация на GitHub', privacyNote: 'Основано на публичной документации проекта. Перед выпуском в магазине проверьте эту страницу на соответствие поведению магазинной сборки и декларациям App Privacy.',
  supportHomeTitle: 'У каждого вопроса есть своё место.', supportHomeIntro: 'Выберите приложение: там собраны инструкции, частые вопросы и ссылка для связи с проектом.', supportRow: 'Установка, настройки и помощь', website: 'О самом сайте', websiteText: 'Каталог включает только публичные приложения bobuk-io. На сайте нет аналитики, форм сбора данных, сторонних скриптов или cookies приложения. Шрифты и изображения локальные. Провайдер хостинга может обрабатывать технические данные HTTP-запросов по своей политике конфиденциальности.', hostingPrivacy: 'Политика конфиденциальности GitHub',
  notFound: 'Здесь пусто', notFoundTitle: 'Кажется, не туда.', notFoundText: 'Страница переехала или ещё не появилась.', back: 'К приложениям',
};
const uk: UI = {
  siteTitle: 'Невеликі застосунки для важливих справ', siteDescription: 'Незалежні застосунки bobuk.io з публічним вихідним кодом. Для справжніх завдань, без зайвого шуму.',
  skip: 'До вмісту', home: 'Головна', apps: 'Застосунки', support: 'Підтримка', code: 'Вихідний код', language: 'Мова',
  eyebrow: 'Незалежні застосунки з публічним кодом', hero: 'Менше шуму.', heroSoft: 'Більше власної справи.', intro: 'Невеликі інструменти, що розв’язують конкретне завдання. Створені з повагою до вашого часу.', findApp: 'Знайти свій застосунок', catalog: 'публічний каталог',
  explore: 'Познайомитися', install: 'Встановити', requirements: 'macOS 14+ · Apple silicon та Intel', companions: 'Працює разом із', onMac: 'На вашому Mac', shotCaption: 'Менше перемикань. Більше спокою.',
  principles: [
    { label: '01 / По суті', title: 'Одна справа. Добре.', text: 'Не комбайн на всі випадки життя, а інструмент, якому є місце у звичайному дні.' },
    { label: '02 / Відкрито', title: 'Код — не секрет.', text: 'У каталозі лише публічні проєкти bobuk-io. Можна побачити, як усе влаштовано, і запропонувати покращення.' },
    { label: '03 / На зв’язку', title: 'Є куди написати.', text: 'Кожен застосунок має власні інструкції, сторінку підтримки та інформацію про дані.' },
  ],
  closing: 'Хороші інструменти не потребують зайвої уваги.', closingText: 'А якщо щось пішло не так — розберімося.', contact: 'Перейти до підтримки', footer: 'Невеликі застосунки. Увага до деталей.', empty: 'Публічних застосунків поки немає. Завітайте пізніше.',
  allApps: 'Усі застосунки', overview: 'Огляд', privacy: 'Конфіденційність', installMac: 'Встановити на Mac', store: 'Відкрити в App Store', signed: 'Підписано Developer ID та нотаризовано Apple.', distribution: 'Наразі розповсюджується через GitHub Releases.',
  quickStart: 'Швидкий старт', installTitle: 'Трохи налаштувань. І можна до справ.', latestRelease: 'Переглянути останній реліз', copy: 'Копіювати', copyLabel: 'Скопіювати команду', copied: 'Команду скопійовано.', copyFailed: 'Не вдалося скопіювати. Виділіть команду та скопіюйте вручну.', reviewScript: 'Команда завантажує та запускає скрипт. Прочитайте його перед запуском', faq: 'Корисно знати',
  supportEyebrow: 'Допомога', supportTitle: 'Розберімося разом.', privacyEyebrow: 'Дані та конфіденційність', issueWarning: 'GitHub Issues публічні; для надсилання потрібен обліковий запис GitHub. Не публікуйте токени, персональні дані чи вміст приватних сесій.', openIssue: 'Написати до підтримки', fullDocs: 'Повна документація на GitHub', privacyNote: 'На основі публічної документації проєкту. Перед випуском у магазині перевірте цю сторінку на відповідність поведінці магазинної збірки та деклараціям App Privacy.',
  supportHomeTitle: 'Для кожного запитання є своє місце.', supportHomeIntro: 'Виберіть застосунок: там зібрані інструкції, поширені запитання та посилання для зв’язку з проєктом.', supportRow: 'Встановлення, налаштування й допомога', website: 'Про цей сайт', websiteText: 'Каталог містить лише публічні застосунки bobuk-io. На сайті немає аналітики, форм збору даних, сторонніх скриптів чи cookies застосунку. Шрифти та зображення локальні. Провайдер хостингу може обробляти технічні дані HTTP-запитів за власною політикою конфіденційності.', hostingPrivacy: 'Політика конфіденційності GitHub',
  notFound: 'Тут порожньо', notFoundTitle: 'Здається, не туди.', notFoundText: 'Сторінка переїхала або ще не з’явилася.', back: 'До застосунків',
};
export const ui: Record<Locale, UI> = { en, ru, uk };
