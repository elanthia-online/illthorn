# Illthorn / Electron 9

Moving to electron 9 has significant improvements for the developer packaging workflow as well as security.

There were a significant amount of breaking changes however, and I have decided to use this as an opportunity to roll with that and bundle as many of the breaking changes I also wanted to make as possible into this major release.

Goals:
- [X] remove as many external runtime dependencies as possible
        * small stack means less work to maintain
- [X] move from mithril.js to plain Web Components
        * mithril is amazing for redraw/diff cycles, but most of our operations
          are simple appends which need to happen as close to the DOM as possible.
          Web Components are also a de facto web standard, and require no framework
          specific knowledge, which makes it easier for outside contributors.
- [x] move from javascript to typescript for maintainability
        * I found it next to impossible to pick this project up after a hiatus
          due to how complex it is, which made it less likely I would work on it
          in general, typescript will help a lot here.
- [x] move from a singleton view to a context based layout
        * in the future this will allow the context to be settings, etc more easily
- [x] move from everything passing through a global event bus to session-specific buses
- [x] rewrite the parser... again
        * the complexity of shoehorning the `DOMParser` api into parsing the Gemstone feed
          led to more edge-cases than I anticipated, it ended up being very fast at doing a very bad job.  I have completely rewritten the parser in plain Typescript, with a suite of tests to handle all of the various oddities in the game feed.

# Links

- [electron-webpack](https://github.com/electron-userland/electron-webpack)
- [electron-builder](https://github.com/electron-userland/electron-builder)