[![Appica UI](.github/assets/appica-ui-root.jpg)](https://appica.dev/ui)

Beautiful, accessible UI designed by humans for the modern web - 75+ themeable components for AI-powered apps, SaaS dashboards, e-commerce sites, and scalable design systems. Polished interactions, dark mode, and full theming out of the box.

This monorepo contains framework-specific packages living under `packages/`. Each package is published to npm independently.

## Packages

|                                                               | Package            | Version                                                                                                 | Links                                                                                                                       |
| ------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| <img src=".github/assets/react.svg" width="35" alt="React" /> | `@appica/ui-react` | [![npm](https://img.shields.io/npm/v/@appica/ui-react)](https://www.npmjs.com/package/@appica/ui-react) | [Docs](https://appica.dev/ui/docs/react/installation) · [Changelog](packages/react/CHANGELOG.md) · [Source](packages/react) |

## Documentation

Full documentation, component demos, and theming guides live at [appica.dev/ui](https://appica.dev/ui).

## For AI agents

Coding agents write Appica UI correctly once they know its rules and its components. 2 things to add to a project that uses the library:

- **The rules**, about 25 lines for your `AGENTS.md` or `CLAUDE.md`. They ship in the package as `agent-rules.md`. See [Set up your coding agent](https://appica.dev/ui/docs/react/agents).
- **The agent skill**, loaded only when a task involves the interface: a component catalog, composition and theming guides, and a script that checks the setup and the code your agent wrote. See [Agent skill](https://appica.dev/ui/docs/react/skill).

```bash
npx skills add appica-dev/appica-ui --skill appica-ui-react
```

The skill's source is in [skills/appica-ui-react](skills/appica-ui-react).

## Figma design file

Every component is also available as a [free Figma design file](https://www.figma.com/community/file/1657080448204231925) - variants, sizes, and states mirrored one-to-one with the code, built on the same design tokens. Design and develop from a single source of truth.

## Stay updated

Follow [@Appica_dev](https://x.com/Appica_dev) on X for release announcements, new components, and previews of what's coming.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and workflow.

## License

MIT © [Appica](https://appica.dev)

Free to use in personal and commercial projects.
