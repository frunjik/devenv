# Local UI conventions

Applicable UI defaults under [repository guidance](./AGENTS.md), not an additional always-on ruleset.

- Angular components use external `.html` templates via `templateUrl` and external `.scss` styles via `styleUrl`. Migrate existing inline components only within agreed scope.
- Reuse palette variables in `projects/client/src/styles.scss` for matching visual roles; keep feature layouts and intentional variants local.
- Use the global layout grid in [styles.scss](./projects/client/src/styles.scss): `.layout-page` and `--layout-*` tokens for page margins, columns, gutters, spacing and shell alignment. Align headings, toolbars and content to shared edges; preserve the narrow-screen single-column layout rather than duplicating local offsets.
- Opt into `.accent-card` for matching dark accent-bordered cards; keep padding, radius and layout local.
- Material meta toolbars opt into `.meta-toolbar` for shared colors; keep layout, sizing and responsive rules local.
- Light Problem Ticket cards define dark body/heading text locally. Ticket-list controls retain minimum 44px width/height, wrapping and narrow-screen fit.
- Native controls may opt into `.form-field` and `.form-control`; keep spacing local and do not apply indiscriminately to Material controls, radios or specialized editors.

The former detailed practices are preserved in the [reference snapshot](./knowledge/practices/archives/reference-snapshot-c35d399.zip), member `agent-practices.md`. They are historical, not binding.
