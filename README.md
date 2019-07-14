# Wyrwood / FE

An attempt at a modern cross-platform FE.

![illthorn_fe](https://user-images.githubusercontent.com/1090434/61176194-924b7780-a58a-11e9-92eb-4fbc225f3828.png)

## Current Features

1. Attempts to autostart sessions by detecting open lich processes started with `--without-frontend`
2. Renders links/monsters/etc
3. Rich FE commands
4. Multiple sessions / 1 application instance (ala `tmux` or `kitty`)

## Planned Features

1. Plugin Interface
2. Theme Interface
3. Custom Highlights
4. Macros
5. Command History / Autocomplete (ala fish/bash/zsh)

## FE Commands (Vim prefixed)

All FE commands are prefixed by the `:` character, ala `vim` or other common cli utils.

#### `:connect <name> <port>`
#### (alias) `:c <name> <port>`
#### `:connect`
#### `:connect <name>`

Attempts to create a new named session with the given arguments.
If `name` and `port` are omitted, it will attempt to autodetect any newly created Lich processes.
If `port` is omitted we will attempt to autodetect which port to connect to.

#### `:focus <session>`
#### (alias) `:f <session>`

Swaps focus to another session.

#### `:rename <new name>`

Renames the currently focused session.

#### `:swap <other name>`

If you accidentally mixed up the name/port combos when connecting, this allows you to easily swap between the names.