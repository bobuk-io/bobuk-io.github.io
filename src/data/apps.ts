import publicRepos from './public-repos.json';

export interface App {
  slug: string;
  name: string;
  repo: string;
  platform: string;
  category: string;
  tagline: string;
  description: string;
  icon: string;
  screenshot: string;
  requirements: string;
  appStoreUrl?: string;
  features: { title: string; text: string }[];
}

const catalog: App[] = [{
  slug: 'splash-finish',
  name: 'Splash Finish',
  repo: 'https://github.com/bobuk-io/splash-finish',
  platform: 'macOS',
  category: 'Для работы с AI',
  tagline: 'Агенты работают. Вы — не отвлекаетесь.',
  description: 'Один тихий инбокс для Claude Code, Codex и pi. Узнайте, когда работа закончена или агенту нужно ваше решение, — и вернитесь к нужной сессии.',
  icon: '/images/splash-finish-icon.png',
  screenshot: '/images/splash-finish.png',
  requirements: 'macOS 14+ · Apple silicon и Intel',
  features: [
    { title: 'Всё в одном месте', text: 'Завершённые задачи и запросы внимания от Claude Code, Codex и pi собираются в общем окне.' },
    { title: 'Назад к контексту', text: 'Нажмите на уведомление, чтобы вернуться к источнику. Точный переход зависит от терминала и интеграции.' },
    { title: 'В вашем ритме', text: 'Отложите уведомления, включите учёт режима «Не беспокоить» или откройте инбокс сочетанием ⌥⌘S.' },
    { title: 'Локально по умолчанию', text: 'Без аккаунта и аналитики приложения. Инбокс хранится на Mac; обновления загружаются с GitHub.' },
  ],
}];

const publicNames = new Set<string>(publicRepos.repositories);
export const apps = catalog.filter(app => publicNames.has(app.slug));
export const installCommand = 'curl -fsSL https://raw.githubusercontent.com/bobuk-io/splash-finish/main/install.py | python3 -';
