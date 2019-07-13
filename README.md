# Wyrwood / FE

An attempt at a modern cross-platform FE.

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

## FE Commands (Vim prefixed)

All FE commands are prefixed by the `:` character, ala `vim` or other common cli utils.

#### `:connect <name> <port>`
#### (alias) `:c <name> <port>`

Attempts to create a new named session with the given arguments.

#### `:focus <session>`
#### (alias) `:f <session>`

Swaps focus to another session.

#### `:rename <new name>`

Renames the currently focused session.

#### `:swap <other name>`

If you accidentally mixed up the name/port combos when connecting, this allows you to easily swap between the names.