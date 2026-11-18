#!/bin/sh
# Expose the helper already shipped in the installed lowkey app; download nothing.
set -eu
helper=/Applications/lowkey.app/Contents/Helpers/lowkeyctl
[ -f "$helper" ] && [ -x "$helper" ] || { echo 'Install lowkey 0.1.1 or later in /Applications first.' >&2; exit 1; }
dir="$HOME/.local/bin"
for candidate in "$dir" "$HOME/bin" "$HOME/.bin"; do
  case ":$PATH:" in *":$candidate:"*) dir=$candidate; break ;; esac
done
link="$dir/lowkeyctl"
if [ -L "$link" ] && [ "$(readlink "$link")" = "$helper" ]; then
  : # Already installed.
elif [ -e "$link" ] || [ -L "$link" ]; then
  echo "Refusing to replace $link" >&2; exit 1
else
  mkdir -p "$dir"
  ln -s "$helper" "$link"
fi
printf 'Linked: %s -> %s\n' "$link" "$helper"
case ":$PATH:" in *":$dir:"*) ;; *) echo 'For zsh, add this to ~/.zshrc and open a new terminal: export PATH="$HOME/.local/bin:$PATH"' ;; esac
