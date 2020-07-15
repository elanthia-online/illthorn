# Illthorn

A modern cross-platform front-end for [Gemstone IV](https://www.play.net/gs4/).

![illthorn-fe](https://user-images.githubusercontent.com/1090434/81620486-0082e580-93ba-11ea-91ad-b526bb16ceac.png)

## Developer Installation

**From The Command Line**

- Have Node
- Clone the repository or download the [.zip](https://github.com/elanthia-online/illthorn/archive/master.zip).
- Navigate to the directory and install dependencies with `yarn install`.
- You can then launch Illthorn with `yarn start`
- Or make an app file with `yarn make` (look for the executable in `/out/`)

## Connecting to the game

You need to have an active Lich session. So you'd connect something like...

```
ruby lich.rb --login CHARACTER_NAME --detachable-client=8003 --without-frontend
```

Lich might also be `lich.rbw` on your setup. You can run multiple connections (for multiple characters/accounts) in multiple terminals and Illtorn will autodetect them. You'll have to run them on different ports though, like `--detachable-client=8004`.

## Current Features

- Attempts to autostart sessions by detecting open lich processes started with `--without-frontend`
- Runs multiple sessions in a single app (alt-# between them)
- Highlights names/monsters/etc
- Autocomplete command history
- Multiple themes to choose from
- User Themeable via CSS
- Zoom in/out (like a web browser)

## Planned Features

- [ ] Plugin Interface
- [ ] Custom Highlights
- [ ] Macros
- [ ] Saved Logging
- [ ] Download Public Themes
- [ ] Clickable links

## Meta Shortcuts

Meta shortcuts are not customizable, as this project will general prefer sane defaults over configuration

#### `alt+<n>`

quick swap between sessions based on the numeric order on the left-hand session pane, similar to many modern terminals

## CLI Commands (Vim prefixed)

All FE commands are prefixed by the `:` character, ala `vim` or other common CLI utils.

#### `:connect <name> <port>`

Also has an alias: `:c <name> <port>`

Attempts to create a new named session with the given arguments. If `name` and `port` are omitted, it will attempt to autodetect any newly created Lich processes.

If `port` is omitted we will attempt to autodetect which port to connect to.

#### `:focus <session>`

Swaps focus to another session.

There is also an alias: `:f <session>`

#### `:rename <new name>`

Renames the currently focused session.

#### `:swap <other name>`

If you accidentally mixed up the name/port combos when connecting, this allows you to easily swap between the names.

#### `:set <path> <value>`

Sets a configuration path to a value.

Currently supported `:set` operations:
| path | value | description |
|-------------|:---------|---------------------------------------------|
| clickable | boolean | turns clickable `<d cmd>` elements on or off|

#### `:ui <name> <state>`

Sets the panels. State is `on` or `off`. Names are:

- `vitals`
- `injuries`
- `active-spells`
- `compass`

Example: `:ui compass off`

#### `:stream <name> <state>`

Sets the stream panels. State is `on` or `off`. Names are:

- `thoughts`
- `speech`
- `logon`
- `logoff`
- `death`

Example: `:stream thoughts on`

## Autocomplete

Previous commands in a session are saved and will show a ghosted version as you type characters which you can autocomplete by pressing the **right arrow** key to complete the command.

## Customization

You can override default styles with a `user.css` file.

On a Mac, this file goes in:

```
/Users/USERNAME/Library/Application%20Support/illthorn/user.css
```

On Linux (XDG specification):

```
 ~/.config/illthorn/user.css
```

On Windows:

```
%APPDATA% environment variable
```
