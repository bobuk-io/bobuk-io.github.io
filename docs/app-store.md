# Путь в Mac App Store

Лендинг даёт постоянные Marketing URL, Support URL и Privacy Policy URL. Он **не делает приложение автоматически совместимым с App Store** и не заменяет App Review. Текущие Splash Finish и HAScS распространяются вне магазина.

## URL для App Store Connect

Постоянные HTTPS-адреса на GitHub Pages:

| Поле | URL (при SITE_URL=https://bobuk-io.github.io) |
| --- | --- |
| Marketing URL | https://bobuk-io.github.io/apps/splash-finish/ |
| Support URL | https://bobuk-io.github.io/apps/splash-finish/support/ |
| Privacy Policy URL | https://bobuk-io.github.io/apps/splash-finish/privacy/ |
| HAScS Marketing URL | https://bobuk-io.github.io/apps/hascs/ |
| HAScS Support URL | https://bobuk-io.github.io/apps/hascs/support/ |
| HAScS Privacy Policy URL | https://bobuk-io.github.io/apps/hascs/privacy/ |

В таблице английские URL. Для русской локализации добавьте `/ru` перед `/apps`, для украинской — `/uk`. Например: `https://bobuk-io.github.io/uk/apps/hascs/privacy/`. Все три локализации включают полный текст установки, поддержки и privacy. Пути не меняйте после публикации. Если меняется домен, настройте постоянные редиректы.

## Что уже есть

- [x] Страница приложения с реальным скриншотом, требованиями и установкой.
- [x] Поддержка и инструкция удаления без логина для чтения.
- [x] Страница обработки данных по публичному README.
- [x] Canonical, Open Graph, SoftwareApplication, sitemap и robots.txt.
- [x] Опциональное поле `appStoreUrl`: кнопка появится только при добавлении настоящей ссылки.
- [x] Каталог отделён от контента: новые публичные приложения добавляются в `src/data/apps.ts`.

## До подачи заявки

### Приложение — отдельный технический аудит

- [ ] Проверить актуальные [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) и требования [Mac App Store](https://developer.apple.com/macos/distribution/).
- [ ] Исследовать отдельную sandboxed-сборку. Запись hooks/settings других агентов, вызовы терминалов, CLI, глобальные shortcuts и возврат в Orca могут потребовать другой архитектуры, entitlement или исключения функций. Нельзя обещать одобрение текущей версии.
- [ ] Для Splash Finish убрать Sparkle и внешний установщик из магазинного канала; обновления магазинной версии — через App Store.
- [ ] Для HAScS отдельно проверить sandbox, исходящие соединения с Home Assistant, доступ к локальной сети, хранение/миграцию Keychain и пользовательские разрешения. Не применять к нему автоматически выводы аудита Splash Finish.
- [ ] Проверить подпись для магазина, entitlements, bundle ID, права доступа и минимальную macOS. Developer ID + notarization не равнозначны подписи для Mac App Store.
- [ ] Протестировать магазинную сборку на чистом Mac, включая удаление данных и отсутствие интеграций по умолчанию.

### Карточка и юридическая часть

- [ ] Apple Developer Program, App Store Connect, права на название/иконку, правообладатель и контакт владельца.
- [ ] Поддержка: проверить, достаточно ли публичных GitHub Issues; добавить реальный приватный контакт для персональных вопросов и юридические сведения. Не придумывать email.
- [ ] Пересмотреть privacy по поведению **магазинной** сборки и выбранного хостинга; согласовать юридический текст и App Privacy. «Локально» не автоматически означает любой конкретный ответ в анкете Apple.
- [ ] Название (до 30 символов), подзаголовок (до 30), описание (до 4000), keywords (до 100), категория, возрастной рейтинг, цена/территории, copyright. Перепроверить актуальные лимиты в App Store Connect.
- [ ] Настоящие скриншоты магазинной сборки в актуальных размерах Apple для нужных языков. Изображение README и иконка HAScS на лендинге не являются готовым комплектом скриншотов магазина.
- [ ] Privacy manifest и декларации используемых API/SDK — по фактическому составу сборки.
- [ ] App Review Notes: для Splash Finish — как подключить агента и что видно без интеграций; для HAScS — безопасный демонстрационный Home Assistant без доступа к реальному дому. Объяснить основные сценарии и предоставить проверяющим необходимые тестовые доступы.
- [ ] Проверить публичную доступность трёх URL с телефона и без авторизации.

## После одобрения

1. Добавить реальный `appStoreUrl` в `src/data/apps.ts`.
2. Проверить, что текст сайта явно различает магазинную и GitHub-версии, если их поведение отличается. При необходимости создать отдельные инструкции и privacy для каналов.
3. Пересобрать, проверить и опубликовать сайт. Не добавлять бейдж «скоро в App Store» без решения владельца.

Полезные официальные ссылки: [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/), [App privacy](https://developer.apple.com/app-store/app-privacy-details/), [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).
