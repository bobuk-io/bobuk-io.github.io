import type { Guide } from '../types';
import type { Locale } from '../../i18n';
// The micro-app guide of Ting 0.6.0. Facts come from FORMAT.md, CONFIGURING.md and the README of
// bobuk-io/ting; the YAML in the code blocks passes `ting-micro check`. Code is the same in every locale.

const format = 'https://github.com/bobuk-io/ting/blob/v0.6.0/docs/micro-apps/FORMAT.md';
const configuring = 'https://github.com/bobuk-io/ting/blob/v0.6.0/docs/CONFIGURING.md';

const code = {
  request: `Write a new Ting micro-app: Leader t a should translate the
clipboard into German and copy the translation.`,
  prompt: `Change my Ting setup. Read /Applications/Ting.app/Contents/Resources/CONFIGURING.md
and follow it; for micro-apps it points to FORMAT.md. Check every file with
ting-micro before you finish. Never put API keys into files and never touch
~/Library/Application Support/Ting/.

My task:`,
  first: `format: ting.microapp/2
id: sort-lines
name: Sort lines
description: Sort the clipboard lines and drop duplicates.

input: clipboard
command: LC_ALL=en_US.UTF-8 sort -u
output:
  to: [clipboard, panel]
  as: text`,
  params: `params:
  - name: domain              # read as \${params.domain} or $TING_DOMAIN
    type: text
    required: true
    prompt: Domain
  - name: record
    type: choice
    required: false
    default: A
    choices: [A, AAAA, MX, TXT]

input: none
command: dig +noall +answer "$TING_DOMAIN" "$TING_RECORD"`,
  steps: `format: ting.microapp/2
name: Wikipedia summary
description: Show the Wikipedia summary of the clipboard word or title.

input: clipboard
steps:
  - url: https://en.wikipedia.org/api/rest_v1/page/summary/\${input|trim|url}
    id: page
  - json: extract
    id: extract
  - json: content_urls.desktop.page
    stdin: \${steps.page}
  - text: |
      \${steps.extract}

      \${input}
output:
  to: [panel]
  as: markdown`,
  ai: `steps:
  - ai: \${input}
    provider: anthropic
    model: claude-haiku-5-5
    key: \${keychain.anthropic}
    system: Answer in one short paragraph.`,
  python: `steps:
  - python: |
      import json, sys
      data = json.load(sys.stdin)
      print(json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False))`,
  library: `# ~/.config/ting/micro/libs/translate.yaml
format: ting.microlib/1
description: Translate the input text with OpenAI.
params:
  - name: language
    type: text
    required: false
    default: English
input: clipboard
steps:
  - ai: \${input}
    id: translate
    provider: openai
    model: gpt-4.1-mini
    system: Translate the text into \${params.language}. Answer with the translation only.
output:
  to: [clipboard, panel]
  as: text`,
  inherit: `# ~/.config/ting/micro/translate-german.yaml
format: ting.microapp/2
inherit: translate
id: translate-german
name: Translate to German
description: Translate the clipboard text into German.
steps:
  - id: translate
    params:
      language: German`,
  call: `steps:
  - call: translate
    params:
      language: \${params.language}`,
  context: `format: ting.microapp/2
name: Sort selected lines
description: Sort the lines of the selected text and put them in place of the selection.
tools: [sort]

context: [selection]
input: none
steps:
  - command: LC_ALL=en_US.UTF-8 sort
    stdin: \${context.selection.text}
output:
  to: [app]`,
  keys: `input: clipboard
steps:
  - keys: cmd+t
  - paste: \${input|trim}
  - keys: return`,
  keychain: `security add-generic-password -s anthropic -a "$USER" -w`,
  cli: `MICRO=/Applications/Ting.app/Contents/MacOS/ting-micro
"$MICRO" check sort-lines.yaml
printf 'b\\na\\nb\\n' | "$MICRO" run sort-lines.yaml
"$MICRO" run dns-lookup.yaml --param domain=example.com --verbose
"$MICRO" run sort-selection.yaml --context "selection.text=$(printf 'b\\na')"
"$MICRO" check-config`,
  binding: `{ "key": "t", "label": "Translate", "items": [
  { "key": "a", "label": "Translate to German", "micro": "translate-german" }
]}`,
};

const guides: Record<Locale, Guide> = {
  en: {
    slug: 'micro-apps', nav: 'Micro-apps', eyebrow: 'Micro-apps', title: 'Micro-apps: your own tools behind a key',
    intro: 'A micro-app is a small YAML file that Ting runs from a key: it reads the clipboard or what you were working on, asks for a few values, runs shell or Python code, HTTP requests or an AI model, and shows, copies or pastes the result. The easiest way to get one is to ask a coding agent to write it for you.',
    sections: [
      { id: 'agent', title: 'Ask a coding agent (recommended)', blocks: [
        'You do not have to learn the format. A coding agent such as Claude Code, Codex or pi reads the format guide shipped inside Ting.app, writes the file, checks it with `ting-micro` and puts it in place. It can also add the key binding to your `config.json`.',
        { steps: [
          'In the Ting menu-bar menu, choose Copy Agent Prompt (also in Settings › Advanced). It copies a ready text with the paths of your Mac.',
          'Start your agent in a terminal and paste the text.',
          'After the last line, “My task:”, write what you want in plain words: which key, what goes in, what should happen and where the result goes.',
          'Let the agent work. It writes the file in a temporary folder, checks it until `ting-micro check` reports `ok`, moves it into `~/.config/ting/micro/`, and checks `config.json` with `ting-micro check-config`.',
          'Press the key. Ting shows the full file once; Command-Return approves it, Esc refuses.',
        ] },
        'A request can be as short as this:',
        { code: code.request },
        'Without Copy Agent Prompt, start the agent with this text and add your task:',
        { code: code.prompt },
        'Tips for good results:',
        { list: [
          'Name the key sequence, for example “Leader t a”. The agent asks before it replaces a binding you already have.',
          'Say where the result goes: copied to the clipboard, shown in the panel, or both.',
          'Never paste an API key into the chat. Keep keys in your shell environment or the keychain (see “Keys and secrets”) and tell the agent their names.',
          'Ask it to reuse a library when you want a family of similar tools, such as one translate key per language.',
          'The agent should ask you before it tries a micro-app that calls a paid API or changes files.',
        ] },
        `The full guides the agent follows are CONFIGURING.md (${configuring}) and FORMAT.md (${format}).`,
      ] },
      { id: 'first', title: 'Your first micro-app by hand', blocks: [
        'Save this as `~/.config/ting/micro/sort-lines.yaml`. Ting loads the folder at once; there is nothing to restart.',
        { code: code.first },
        { steps: [
          'Open Settings › Bindings, choose + › Micro-app and pick Sort lines, or start it by name from launcha.',
          'Copy a few lines and press the key. The first time, approve the file with Command-Return.',
          'The sorted lines are on the clipboard and in the panel.',
        ] },
        'If the file has a mistake, Ting does not use it: the menu-bar menu warns, Settings › Advanced lists the problem with its line, and `~/.config/ting/micro-errors.log` holds it.',
      ] },
      { id: 'file', title: 'The file', blocks: [
        { table: [
          ['Key', 'Meaning'],
          ['`format`', 'Always `ting.microapp/2`.'],
          ['`id`, `name`', 'The id is kebab-case (`sort-lines`), by default the file name. The name is shown in menus.'],
          ['`description`', 'One line, required.'],
          ['`params`', 'Values Ting asks for before the run: `text` or `choice`. Required ones are always shown; optional ones need a `default` and sit behind Command-O.'],
          ['`input`', '`clipboard` (the text goes to the first step) or `none`.'],
          ['`context`', 'What Ting reads at the start: `app`, `finder`, `browser`, `selection`, `window` (see “What you were working on”).'],
          ['`command` or `steps`', 'One shell command, or a list of steps (below).'],
          ['`output`', '`to: [clipboard, panel]` (or `app`: pasted into the app you came from) and `as: markdown | console | text | code`. Without `output`, nothing is shown or copied.'],
          ['`timeout`', 'Seconds for the whole run: 60 by default, at most 300.'],
          ['`tools`', 'Programs the code needs on PATH, such as `[dig, jq]`.'],
          ['`hidden`, `remember`', '`hidden: true` keeps it out of launcha; `remember: false` does not offer the last values.'],
        ] },
        'Parameters reach shell and Python code as environment variables: `domain` becomes `$TING_DOMAIN`.',
        { code: code.params },
      ] },
      { id: 'steps', title: 'Steps', blocks: [
        'Instead of one `command`, a micro-app can run a list of `steps`. The output of each step is the input of the next one, like a shell pipe; the output of the last step is the result. A failing step stops the run and the panel shows which step failed and why.',
        { table: [
          ['Step', 'Does'],
          ['`command`', 'Shell code for `/bin/sh -c`: input on stdin, result on stdout.'],
          ['`python`', 'Python code for `python3` (standard library; needs the Xcode Command Line Tools).'],
          ['`url`', 'An HTTP request: `method`, `query`, `headers`, `body` (text or JSON) or `form`. The output is the response body.'],
          ['`ai`', 'A message to `openai` or `anthropic`, or any OpenAI-compatible server through `base_url` (Ollama, LM Studio, OpenRouter). The answer streams into the panel.'],
          ['`text`', 'Text with variables.'],
          ['`json`', 'A field of the input JSON, such as `items.0.name`.'],
          ['`open`', 'Opens a URL or a file, optionally in a given `app`.'],
          ['`notify`', 'Shows a notification.'],
          ['`call`', 'Runs a library (see “Libraries”).'],
          ['`keys`', 'Presses keys in the app you came from, such as `cmd+t` or `[cmd+a, return]`.'],
          ['`paste`', 'Pastes text into that app and puts the clipboard back.'],
        ] },
        'Every step can have an `id` (later steps read its output as `${steps.ID}`), its own `stdin`, `timeout` and `params`. `stream: true` lets a `command` or `python` step read the output of the step before it while it comes.',
        'This micro-app asks Wikipedia for the clipboard word and shows the summary with its link:',
        { code: code.steps },
        'An AI step and a Python step:',
        { code: code.ai },
        { code: code.python },
      ] },
      { id: 'variables', title: 'Variables', blocks: [
        'Every value of a step, except shell and Python code, can hold variables:',
        { table: [
          ['Variable', 'Value'],
          ['`${input}`', 'The input of the step.'],
          ['`${params.NAME}`', 'A parameter.'],
          ['`${steps.ID}`', 'The output of an earlier step.'],
          ['`${NAME}`', 'A variable of your login shell, such as `${OPENAI_API_KEY}`.'],
          ['`${keychain.SERVICE}`', 'A password from your login keychain.'],
          ['`${context.SOURCE.FIELD}`', 'A value of the context, such as `${context.app.name}`.'],
        ] },
        'Filters after `|`: `url` (percent-encode), `json` (escape for a JSON string), `trim`, `base64`. For example `${input|trim|url}`.',
        'Ting never puts text into shell or Python code. The code reads the same values from the environment: `$TING_NAME` for parameters, `$TING_STEP_ID` for step outputs, `$TING_CONTEXT_SOURCE_FIELD` for the context, and the variables you set with `env:`. This keeps clipboard text from becoming a command.',
      ] },
      { id: 'context', title: 'What you were working on', blocks: [
        'Since Ting 0.6.0 a micro-app can read the moment it starts: list the sources in `context:`, and Ting reads only those, before the parameter panel. Steps read a value as `${context.SOURCE.FIELD}`, code as `$TING_CONTEXT_SOURCE_FIELD`.',
        { table: [
          ['Source', 'Values', 'Permission'],
          ['`app`', '`name`, `bundle`, `path`, `pid` of the active app', 'none'],
          ['`finder`', '`selection` (one path per line) and `folder` of the front Finder window, also when Finder is in the background', 'Automation for Finder'],
          ['`browser`', '`url`, `title` of the front tab and `name` of the browser: Safari, Chrome, Arc, Brave, Edge, Vivaldi or Chromium', 'Automation for the browser'],
          ['`selection`', '`text`: the selected text; where Accessibility gives none, Ting presses Command-C and puts the clipboard back', 'Accessibility'],
          ['`window`', '`title` and `document` of the front window', 'Accessibility'],
        ] },
        'A micro-app can also send input to the app you came from: `keys` presses keys, `paste` pastes text, and `output` with `to: [app]` pastes the result. This one sorts the selected lines in place:',
        { code: code.context },
        'And this one opens a new browser tab and searches there for the clipboard text:',
        { code: code.keys },
        'macOS asks once to let Ting control Finder or the browser. Accessibility is turned on for Ting in System Settings › Privacy & Security › Accessibility. Without a permission the micro-app does not start, and the panel says what to allow.',
      ] },
      { id: 'libraries', title: 'Libraries', blocks: [
        'Steps that several micro-apps share live once in `~/.config/ting/micro/libs/NAME.yaml`, with `format: ting.microlib/1`. A library has no key and is not listed in launcha.',
        { code: code.library },
        'Inherit a library to make a variant that differs only in values. This file is the library with German fixed, so it asks nothing:',
        { code: code.inherit },
        'Or run a library as one step with `call` and pass its parameters:',
        { code: code.call },
        'A micro-app is approved together with its libraries. When you change a library, Ting asks you again for every micro-app that uses it.',
      ] },
      { id: 'secrets', title: 'Keys and secrets', blocks: [
        'Never write an API key into a micro-app file. Ting runs steps with the environment of your login shell, so a key exported in your shell profile works as `${OPENAI_API_KEY}` or `${ANTHROPIC_API_KEY}`; the `ai` step uses those two by default. Or keep the key in the keychain:',
        { code: code.keychain },
        'and read it as `${keychain.anthropic}`. Do not type secrets into parameters that Ting remembers: remembered values are stored as plain text.',
      ] },
      { id: 'terminal', title: 'Check and run in the terminal', blocks: [
        '`ting-micro` inside Ting.app checks and runs micro-apps without the panels. `run` reads the input from stdin and prints the result; it never touches the clipboard, your config or the approvals. `open` and `notify` steps run only with `--allow-effects`. It reads no context: give values with `--context app.name=Safari`. `keys` and `paste` steps never send anything there.',
        { code: code.cli },
        '`check-config` checks `config.json`: JSON errors, keys used twice, bad URLs and micro-app ids that do not load. A micro-app binding looks like this:',
        { code: code.binding },
      ] },
      { id: 'safety', title: 'Safety', blocks: [
        'A micro-app runs as you, with your full rights and no sandbox: it can read and change your files, use the network and start programs. That is why Ting runs a file only after you approve its exact text, and asks again after any change of the file or of a library it uses. Approve only what you understand, and keep `~/.config/ting/` writable only by your account. A micro-app that presses keys or pastes can do in the app in front what you can do with the keyboard: approve it as carefully as code.',
      ] },
    ],
  },
  ru: {
    slug: 'micro-apps', nav: 'Микро-приложения', eyebrow: 'Микро-приложения', title: 'Микро-приложения: свои инструменты на клавише',
    intro: 'Микро-приложение — небольшой YAML-файл, который Ting запускает по клавише. Он читает буфер обмена или то, с чем вы работали, спрашивает несколько значений, выполняет код оболочки или Python, HTTP-запросы или обращается к модели ИИ и показывает, копирует или вставляет результат. Проще всего получить такой файл — попросить агента для программирования написать его.',
    sections: [
      { id: 'agent', title: 'Попросите агента (рекомендуем)', blocks: [
        'Изучать формат не обязательно. Агент, например Claude Code, Codex или pi, читает руководство по формату внутри Ting.app, пишет файл, проверяет его через `ting-micro` и кладёт на место. Он также может добавить привязку клавиши в ваш `config.json`.',
        { steps: [
          'В меню Ting в строке меню выберите Copy Agent Prompt (эта кнопка есть и в Settings › Advanced). Ting скопирует готовый текст с путями вашего Mac.',
          'Запустите агента в терминале и вставьте текст.',
          'После последней строки «My task:» напишите задачу обычными словами: какая клавиша, что подаётся на вход, что должно произойти и куда деть результат.',
          'Дождитесь, пока агент закончит. Он пишет файл во временной папке, проверяет его, пока `ting-micro check` не ответит `ok`, переносит в `~/.config/ting/micro/` и проверяет `config.json` командой `ting-micro check-config`.',
          'Нажмите клавишу. Ting один раз покажет весь файл: Command-Return одобряет, Esc отказывает.',
        ] },
        'Запрос может быть совсем коротким:',
        { code: code.request },
        'Без Copy Agent Prompt запустите агента с этим текстом и допишите задачу:',
        { code: code.prompt },
        'Как получить хороший результат:',
        { list: [
          'Назовите последовательность клавиш, например «Leader t a». Если она уже занята, агент спросит перед заменой.',
          'Скажите, куда деть результат: скопировать в буфер обмена, показать в панели или и то и другое.',
          'Никогда не вставляйте API-ключ в чат. Храните ключи в окружении оболочки или в связке ключей (см. «Ключи и секреты») и назовите агенту их имена.',
          'Если нужно семейство похожих инструментов, например перевод на разные языки, попросите использовать библиотеку.',
          'Агент должен спросить вас, прежде чем запускать микро-приложение, которое обращается к платному API или меняет файлы.',
        ] },
        `Полные руководства, по которым работает агент: CONFIGURING.md (${configuring}) и FORMAT.md (${format}). Они на английском.`,
      ] },
      { id: 'first', title: 'Первое микро-приложение вручную', blocks: [
        'Сохраните этот текст в `~/.config/ting/micro/sort-lines.yaml`. Ting сразу загружает папку, ничего перезапускать не нужно.',
        { code: code.first },
        { steps: [
          'Откройте Settings › Bindings, выберите + › Micro-app и укажите Sort lines. Или запустите его по имени из launcha.',
          'Скопируйте несколько строк и нажмите клавишу. В первый раз одобрите файл клавишами Command-Return.',
          'Отсортированные строки окажутся в буфере обмена и в панели.',
        ] },
        'Файл с ошибкой Ting не использует: меню в строке меню предупреждает, Settings › Advanced показывает ошибку с номером строки, а `~/.config/ting/micro-errors.log` хранит её.',
      ] },
      { id: 'file', title: 'Файл', blocks: [
        { table: [
          ['Ключ', 'Значение'],
          ['`format`', 'Всегда `ting.microapp/2`.'],
          ['`id`, `name`', 'id пишется в kebab-case (`sort-lines`), по умолчанию это имя файла. name показывается в меню.'],
          ['`description`', 'Одна строка, обязательно.'],
          ['`params`', 'Значения, которые Ting спрашивает перед запуском: `text` или `choice`. Обязательные видны всегда; необязательным нужен `default`, они открываются по Command-O.'],
          ['`input`', '`clipboard` (текст идёт на вход первому шагу) или `none`.'],
          ['`context`', 'Что Ting читает при запуске: `app`, `finder`, `browser`, `selection`, `window` (см. «С чем вы работали»).'],
          ['`command` или `steps`', 'Одна команда оболочки или список шагов (ниже).'],
          ['`output`', '`to: [clipboard, panel]` (или `app`: вставить в приложение, из которого вы пришли) и `as: markdown | console | text | code`. Без `output` ничего не показывается и не копируется.'],
          ['`timeout`', 'Время всего запуска в секундах: по умолчанию 60, максимум 300.'],
          ['`tools`', 'Программы, которые нужны коду в PATH, например `[dig, jq]`.'],
          ['`hidden`, `remember`', '`hidden: true` скрывает из launcha; `remember: false` не предлагает прошлые значения.'],
        ] },
        'В код оболочки и Python параметры попадают как переменные окружения: `domain` становится `$TING_DOMAIN`.',
        { code: code.params },
      ] },
      { id: 'steps', title: 'Шаги', blocks: [
        'Вместо одной `command` микро-приложение может выполнять список `steps`. Вывод каждого шага идёт на вход следующему, как в конвейере оболочки; вывод последнего шага — результат. Если шаг завершился ошибкой, запуск останавливается, а панель показывает, какой шаг упал и почему.',
        { table: [
          ['Шаг', 'Что делает'],
          ['`command`', 'Код для `/bin/sh -c`: вход через stdin, результат в stdout.'],
          ['`python`', 'Код для `python3` (стандартная библиотека; нужны Xcode Command Line Tools).'],
          ['`url`', 'HTTP-запрос: `method`, `query`, `headers`, `body` (текст или JSON) или `form`. Вывод — тело ответа.'],
          ['`ai`', 'Сообщение для `openai` или `anthropic` или любого OpenAI-совместимого сервера через `base_url` (Ollama, LM Studio, OpenRouter). Ответ появляется в панели по мере поступления.'],
          ['`text`', 'Текст с переменными.'],
          ['`json`', 'Поле входного JSON, например `items.0.name`.'],
          ['`open`', 'Открывает URL или файл, при желании в указанном приложении (`app`).'],
          ['`notify`', 'Показывает уведомление.'],
          ['`call`', 'Запускает библиотеку (см. «Библиотеки»).'],
          ['`keys`', 'Нажимает клавиши в приложении, из которого вы пришли, например `cmd+t` или `[cmd+a, return]`.'],
          ['`paste`', 'Вставляет текст в это приложение и возвращает буфер обмена.'],
        ] },
        'У каждого шага может быть `id` (следующие шаги читают его вывод как `${steps.ID}`), свои `stdin`, `timeout` и `params`. С `stream: true` шаг `command` или `python` читает вывод предыдущего шага по мере поступления.',
        'Это микро-приложение ищет слово из буфера обмена в Википедии и показывает краткое описание со ссылкой:',
        { code: code.steps },
        'Шаг ИИ и шаг Python:',
        { code: code.ai },
        { code: code.python },
      ] },
      { id: 'variables', title: 'Переменные', blocks: [
        'Любое значение шага, кроме кода оболочки и Python, может содержать переменные:',
        { table: [
          ['Переменная', 'Значение'],
          ['`${input}`', 'Вход шага.'],
          ['`${params.NAME}`', 'Параметр.'],
          ['`${steps.ID}`', 'Вывод одного из предыдущих шагов.'],
          ['`${NAME}`', 'Переменная вашей оболочки входа, например `${OPENAI_API_KEY}`.'],
          ['`${keychain.SERVICE}`', 'Пароль из вашей связки ключей.'],
          ['`${context.SOURCE.FIELD}`', 'Значение контекста, например `${context.app.name}`.'],
        ] },
        'Фильтры после `|`: `url` (кодирование для URL), `json` (экранирование для строки JSON), `trim`, `base64`. Например, `${input|trim|url}`.',
        'Ting никогда не подставляет текст в код оболочки и Python. Код читает те же значения из окружения: `$TING_NAME` для параметров, `$TING_STEP_ID` для вывода шагов, `$TING_CONTEXT_SOURCE_FIELD` для контекста и переменные, заданные в `env:`. Так текст из буфера обмена не может стать командой.',
      ] },
      { id: 'context', title: 'С чем вы работали', blocks: [
        'С Ting 0.6.0 микро-приложение может узнать, что было на экране при запуске: перечислите источники в `context:`, и Ting прочитает только их, до панели параметров. Шаги читают значение как `${context.SOURCE.FIELD}`, код — как `$TING_CONTEXT_SOURCE_FIELD`.',
        { table: [
          ['Источник', 'Значения', 'Разрешение'],
          ['`app`', '`name`, `bundle`, `path`, `pid` активного приложения', 'не нужно'],
          ['`finder`', '`selection` (по пути на строку) и `folder` переднего окна Finder, даже если Finder в фоне', 'автоматизация для Finder'],
          ['`browser`', '`url`, `title` передней вкладки и `name` браузера: Safari, Chrome, Arc, Brave, Edge, Vivaldi или Chromium', 'автоматизация для браузера'],
          ['`selection`', '`text`: выделенный текст; если универсальный доступ его не отдаёт, Ting нажимает Command-C и возвращает буфер обмена', 'универсальный доступ'],
          ['`window`', '`title` и `document` переднего окна', 'универсальный доступ'],
        ] },
        'Микро-приложение может и отправлять ввод в приложение, из которого вы пришли: `keys` нажимает клавиши, `paste` вставляет текст, а `output` с `to: [app]` вставляет результат. Это микро-приложение сортирует выделенные строки на месте:',
        { code: code.context },
        'А это открывает новую вкладку браузера и ищет там текст из буфера обмена:',
        { code: code.keys },
        'macOS один раз спросит, можно ли Ting управлять Finder или браузером. Универсальный доступ для Ting включается в системных настройках, в разделе конфиденциальности и безопасности. Без разрешения микро-приложение не запускается, а панель говорит, что нужно разрешить.',
      ] },
      { id: 'libraries', title: 'Библиотеки', blocks: [
        'Шаги, общие для нескольких микро-приложений, хранятся один раз в `~/.config/ting/micro/libs/NAME.yaml` с `format: ting.microlib/1`. У библиотеки нет клавиши, и в launcha её нет.',
        { code: code.library },
        'Чтобы сделать вариант, который отличается только значениями, унаследуйте библиотеку. Этот файл — та же библиотека с немецким языком, поэтому он ничего не спрашивает:',
        { code: code.inherit },
        'Или запустите библиотеку как один шаг через `call` и передайте ей параметры:',
        { code: code.call },
        'Микро-приложение одобряется вместе с его библиотеками. После изменения библиотеки Ting снова спросит про каждое микро-приложение, которое её использует.',
      ] },
      { id: 'secrets', title: 'Ключи и секреты', blocks: [
        'Никогда не пишите API-ключ в файл микро-приложения. Ting выполняет шаги с окружением вашей оболочки входа, поэтому ключ, экспортированный в профиле оболочки, доступен как `${OPENAI_API_KEY}` или `${ANTHROPIC_API_KEY}`; шаг `ai` по умолчанию берёт именно их. Или храните ключ в связке ключей:',
        { code: code.keychain },
        'и читайте его как `${keychain.anthropic}`. Не вводите секреты в параметры, которые Ting запоминает: запомненные значения хранятся обычным текстом.',
      ] },
      { id: 'terminal', title: 'Проверка и запуск в терминале', blocks: [
        '`ting-micro` внутри Ting.app проверяет и запускает микро-приложения без панелей. `run` читает вход из stdin и печатает результат; он не трогает буфер обмена, конфигурацию и одобрения. Шаги `open` и `notify` выполняются только с `--allow-effects`. Контекст он не читает: значения задаются через `--context app.name=Safari`. Шаги `keys` и `paste` там ничего не отправляют.',
        { code: code.cli },
        '`check-config` проверяет `config.json`: ошибки JSON, повторные клавиши, плохие URL и id микро-приложений, которые не загружаются. Привязка микро-приложения выглядит так:',
        { code: code.binding },
      ] },
      { id: 'safety', title: 'Безопасность', blocks: [
        'Микро-приложение работает от вашего имени, со всеми вашими правами и без песочницы: оно может читать и менять файлы, работать с сетью и запускать программы. Поэтому Ting запускает файл только после того, как вы одобрите именно этот текст, и спрашивает снова после любого изменения файла или его библиотеки. Одобряйте только то, что понимаете, и оставьте запись в `~/.config/ting/` только своей учётной записи. Микро-приложение, которое нажимает клавиши или вставляет текст, может сделать в переднем приложении всё, что вы делаете клавиатурой: одобряйте его так же внимательно, как код.',
      ] },
    ],
  },
  uk: {
    slug: 'micro-apps', nav: 'Мікрозастосунки', eyebrow: 'Мікрозастосунки', title: 'Мікрозастосунки: власні інструменти на клавіші',
    intro: 'Мікрозастосунок — невеликий YAML-файл, який Ting запускає клавішею. Він читає буфер обміну або те, з чим ви працювали, запитує кілька значень, виконує код оболонки чи Python, HTTP-запити або звертається до моделі ШІ та показує, копіює чи вставляє результат. Найпростіше отримати такий файл — попросити агента для програмування написати його.',
    sections: [
      { id: 'agent', title: 'Попросіть агента (рекомендуємо)', blocks: [
        'Вивчати формат не обов’язково. Агент, наприклад Claude Code, Codex або pi, читає посібник із формату всередині Ting.app, пише файл, перевіряє його через `ting-micro` і кладе на місце. Він також може додати прив’язку клавіші у ваш `config.json`.',
        { steps: [
          'У меню Ting у рядку меню виберіть Copy Agent Prompt (ця кнопка є і в Settings › Advanced). Ting скопіює готовий текст зі шляхами вашого Mac.',
          'Запустіть агента в терміналі та вставте текст.',
          'Після останнього рядка «My task:» напишіть завдання звичайними словами: яка клавіша, що подається на вхід, що має статися й куди подіти результат.',
          'Дочекайтеся, поки агент закінчить. Він пише файл у тимчасовій папці, перевіряє його, доки `ting-micro check` не відповість `ok`, переносить у `~/.config/ting/micro/` і перевіряє `config.json` командою `ting-micro check-config`.',
          'Натисніть клавішу. Ting один раз покаже весь файл: Command-Return схвалює, Esc відмовляє.',
        ] },
        'Запит може бути зовсім коротким:',
        { code: code.request },
        'Без Copy Agent Prompt запустіть агента з цим текстом і допишіть завдання:',
        { code: code.prompt },
        'Як отримати добрий результат:',
        { list: [
          'Назвіть послідовність клавіш, наприклад «Leader t a». Якщо вона вже зайнята, агент запитає перед заміною.',
          'Скажіть, куди подіти результат: скопіювати в буфер обміну, показати в панелі чи і те, і те.',
          'Ніколи не вставляйте API-ключ у чат. Зберігайте ключі в середовищі оболонки або у зв’язці ключів (див. «Ключі та секрети») і назвіть агентові їхні імена.',
          'Якщо потрібна родина схожих інструментів, наприклад переклад різними мовами, попросіть використати бібліотеку.',
          'Агент має запитати вас, перш ніж запускати мікрозастосунок, який звертається до платного API або змінює файли.',
        ] },
        `Повні посібники, за якими працює агент: CONFIGURING.md (${configuring}) і FORMAT.md (${format}). Вони англійською.`,
      ] },
      { id: 'first', title: 'Перший мікрозастосунок вручну', blocks: [
        'Збережіть цей текст у `~/.config/ting/micro/sort-lines.yaml`. Ting одразу завантажує папку, нічого перезапускати не треба.',
        { code: code.first },
        { steps: [
          'Відкрийте Settings › Bindings, виберіть + › Micro-app і вкажіть Sort lines. Або запустіть його за назвою з launcha.',
          'Скопіюйте кілька рядків і натисніть клавішу. Першого разу схваліть файл клавішами Command-Return.',
          'Відсортовані рядки опиняться в буфері обміну та в панелі.',
        ] },
        'Файл із помилкою Ting не використовує: меню в рядку меню попереджає, Settings › Advanced показує помилку з номером рядка, а `~/.config/ting/micro-errors.log` зберігає її.',
      ] },
      { id: 'file', title: 'Файл', blocks: [
        { table: [
          ['Ключ', 'Значення'],
          ['`format`', 'Завжди `ting.microapp/2`.'],
          ['`id`, `name`', 'id пишеться в kebab-case (`sort-lines`), типово це ім’я файлу. name показується в меню.'],
          ['`description`', 'Один рядок, обов’язково.'],
          ['`params`', 'Значення, які Ting запитує перед запуском: `text` або `choice`. Обов’язкові видно завжди; необов’язковим потрібен `default`, вони відкриваються за Command-O.'],
          ['`input`', '`clipboard` (текст іде на вхід першому крокові) або `none`.'],
          ['`context`', 'Що Ting читає під час запуску: `app`, `finder`, `browser`, `selection`, `window` (див. «З чим ви працювали»).'],
          ['`command` або `steps`', 'Одна команда оболонки або список кроків (нижче).'],
          ['`output`', '`to: [clipboard, panel]` (або `app`: вставити в застосунок, з якого ви прийшли) і `as: markdown | console | text | code`. Без `output` нічого не показується й не копіюється.'],
          ['`timeout`', 'Час усього запуску в секундах: типово 60, щонайбільше 300.'],
          ['`tools`', 'Програми, потрібні коду в PATH, наприклад `[dig, jq]`.'],
          ['`hidden`, `remember`', '`hidden: true` приховує з launcha; `remember: false` не пропонує минулі значення.'],
        ] },
        'У код оболонки та Python параметри потрапляють як змінні середовища: `domain` стає `$TING_DOMAIN`.',
        { code: code.params },
      ] },
      { id: 'steps', title: 'Кроки', blocks: [
        'Замість однієї `command` мікрозастосунок може виконувати список `steps`. Вивід кожного кроку йде на вхід наступному, як у конвеєрі оболонки; вивід останнього кроку — результат. Якщо крок завершився помилкою, запуск зупиняється, а панель показує, який крок упав і чому.',
        { table: [
          ['Крок', 'Що робить'],
          ['`command`', 'Код для `/bin/sh -c`: вхід через stdin, результат у stdout.'],
          ['`python`', 'Код для `python3` (стандартна бібліотека; потрібні Xcode Command Line Tools).'],
          ['`url`', 'HTTP-запит: `method`, `query`, `headers`, `body` (текст або JSON) чи `form`. Вивід — тіло відповіді.'],
          ['`ai`', 'Повідомлення для `openai` або `anthropic` чи будь-якого OpenAI-сумісного сервера через `base_url` (Ollama, LM Studio, OpenRouter). Відповідь з’являється в панелі в міру надходження.'],
          ['`text`', 'Текст зі змінними.'],
          ['`json`', 'Поле вхідного JSON, наприклад `items.0.name`.'],
          ['`open`', 'Відкриває URL або файл, за бажання у вказаному застосунку (`app`).'],
          ['`notify`', 'Показує сповіщення.'],
          ['`call`', 'Запускає бібліотеку (див. «Бібліотеки»).'],
          ['`keys`', 'Натискає клавіші в застосунку, з якого ви прийшли, наприклад `cmd+t` або `[cmd+a, return]`.'],
          ['`paste`', 'Вставляє текст у цей застосунок і повертає буфер обміну.'],
        ] },
        'Кожен крок може мати `id` (наступні кроки читають його вивід як `${steps.ID}`), власні `stdin`, `timeout` і `params`. З `stream: true` крок `command` або `python` читає вивід попереднього кроку в міру надходження.',
        'Цей мікрозастосунок шукає слово з буфера обміну у Вікіпедії та показує короткий опис із посиланням:',
        { code: code.steps },
        'Крок ШІ та крок Python:',
        { code: code.ai },
        { code: code.python },
      ] },
      { id: 'variables', title: 'Змінні', blocks: [
        'Будь-яке значення кроку, крім коду оболонки та Python, може містити змінні:',
        { table: [
          ['Змінна', 'Значення'],
          ['`${input}`', 'Вхід кроку.'],
          ['`${params.NAME}`', 'Параметр.'],
          ['`${steps.ID}`', 'Вивід одного з попередніх кроків.'],
          ['`${NAME}`', 'Змінна вашої оболонки входу, наприклад `${OPENAI_API_KEY}`.'],
          ['`${keychain.SERVICE}`', 'Пароль із вашої зв’язки ключів.'],
          ['`${context.SOURCE.FIELD}`', 'Значення контексту, наприклад `${context.app.name}`.'],
        ] },
        'Фільтри після `|`: `url` (кодування для URL), `json` (екранування для рядка JSON), `trim`, `base64`. Наприклад, `${input|trim|url}`.',
        'Ting ніколи не підставляє текст у код оболонки та Python. Код читає ті самі значення із середовища: `$TING_NAME` для параметрів, `$TING_STEP_ID` для виводу кроків, `$TING_CONTEXT_SOURCE_FIELD` для контексту і змінні, задані в `env:`. Так текст із буфера обміну не може стати командою.',
      ] },
      { id: 'context', title: 'З чим ви працювали', blocks: [
        'З Ting 0.6.0 мікрозастосунок може дізнатися, що було на екрані під час запуску: перелічіть джерела в `context:`, і Ting прочитає лише їх, до панелі параметрів. Кроки читають значення як `${context.SOURCE.FIELD}`, код — як `$TING_CONTEXT_SOURCE_FIELD`.',
        { table: [
          ['Джерело', 'Значення', 'Дозвіл'],
          ['`app`', '`name`, `bundle`, `path`, `pid` активного застосунку', 'не потрібен'],
          ['`finder`', '`selection` (по шляху на рядок) і `folder` переднього вікна Finder, навіть якщо Finder у фоні', 'автоматизація для Finder'],
          ['`browser`', '`url`, `title` передньої вкладки й `name` браузера: Safari, Chrome, Arc, Brave, Edge, Vivaldi або Chromium', 'автоматизація для браузера'],
          ['`selection`', '`text`: виділений текст; якщо доступність його не віддає, Ting натискає Command-C і повертає буфер обміну', 'доступність'],
          ['`window`', '`title` і `document` переднього вікна', 'доступність'],
        ] },
        'Мікрозастосунок може й надсилати введення в застосунок, з якого ви прийшли: `keys` натискає клавіші, `paste` вставляє текст, а `output` з `to: [app]` вставляє результат. Цей мікрозастосунок сортує виділені рядки на місці:',
        { code: code.context },
        'А цей відкриває нову вкладку браузера й шукає там текст із буфера обміну:',
        { code: code.keys },
        'macOS один раз запитає, чи можна Ting керувати Finder або браузером. Доступність для Ting вмикається в системних налаштуваннях, у розділі приватності й безпеки. Без дозволу мікрозастосунок не запускається, а панель каже, що треба дозволити.',
      ] },
      { id: 'libraries', title: 'Бібліотеки', blocks: [
        'Кроки, спільні для кількох мікрозастосунків, зберігаються один раз у `~/.config/ting/micro/libs/NAME.yaml` з `format: ting.microlib/1`. Бібліотека не має клавіші, і в launcha її немає.',
        { code: code.library },
        'Щоб зробити варіант, який відрізняється лише значеннями, успадкуйте бібліотеку. Цей файл — та сама бібліотека з німецькою мовою, тому він нічого не запитує:',
        { code: code.inherit },
        'Або запустіть бібліотеку як один крок через `call` і передайте їй параметри:',
        { code: code.call },
        'Мікрозастосунок схвалюється разом із його бібліотеками. Після зміни бібліотеки Ting знову запитає про кожен мікрозастосунок, який її використовує.',
      ] },
      { id: 'secrets', title: 'Ключі та секрети', blocks: [
        'Ніколи не пишіть API-ключ у файл мікрозастосунку. Ting виконує кроки із середовищем вашої оболонки входу, тому ключ, експортований у профілі оболонки, доступний як `${OPENAI_API_KEY}` або `${ANTHROPIC_API_KEY}`; крок `ai` типово бере саме їх. Або зберігайте ключ у зв’язці ключів:',
        { code: code.keychain },
        'і читайте його як `${keychain.anthropic}`. Не вводьте секрети в параметри, які Ting запам’ятовує: запам’ятовані значення зберігаються звичайним текстом.',
      ] },
      { id: 'terminal', title: 'Перевірка й запуск у терміналі', blocks: [
        '`ting-micro` усередині Ting.app перевіряє й запускає мікрозастосунки без панелей. `run` читає вхід зі stdin і друкує результат; він не чіпає буфер обміну, конфігурацію та схвалення. Кроки `open` і `notify` виконуються лише з `--allow-effects`. Контекст він не читає: значення задаються через `--context app.name=Safari`. Кроки `keys` і `paste` там нічого не надсилають.',
        { code: code.cli },
        '`check-config` перевіряє `config.json`: помилки JSON, повторні клавіші, погані URL та id мікрозастосунків, які не завантажуються. Прив’язка мікрозастосунку виглядає так:',
        { code: code.binding },
      ] },
      { id: 'safety', title: 'Безпека', blocks: [
        'Мікрозастосунок працює від вашого імені, з усіма вашими правами й без пісочниці: він може читати та змінювати файли, працювати з мережею й запускати програми. Тому Ting запускає файл лише після того, як ви схвалите саме цей текст, і запитує знову після будь-якої зміни файлу чи його бібліотеки. Схвалюйте лише те, що розумієте, і залиште запис у `~/.config/ting/` лише своєму обліковому запису. Мікрозастосунок, який натискає клавіші чи вставляє текст, може зробити в передньому застосунку все, що ви робите клавіатурою: схвалюйте його так само уважно, як код.',
      ] },
    ],
  },
};
export default guides;
