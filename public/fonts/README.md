# Fonts

Self-hosted so the build has no third-party network dependency. Visual regression tests
can't rely on a remote request: a capture landing before the font arrives produces a
phantom diff with no code change behind it.

| File | Family | Axis |
| --- | --- | --- |
| `fredoka-latin-var.woff2` | Fredoka | `wght` 400–700 |
| `jetbrains-mono-latin-var.woff2` | JetBrains Mono | `wght` 400–700 |

Both are variable fonts, latin subset, pulled from Google Fonts' CDN (Fredoka v17,
JetBrains Mono v24). One file per family covers every weight the tokens reference.

`fonts.css` declares them with `font-display: block` — `swap` would paint fallback text
first and replace it mid-capture, which is the race this whole setup exists to avoid.

## Licensing

Both families are licensed under the **SIL Open Font License 1.1**, which permits
bundling and redistribution with the software.

- Fredoka — https://fonts.google.com/specimen/Fredoka/license
- JetBrains Mono — https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt

The full license text is not vendored here. If you ship these files in a distributed
artifact, include a copy of OFL.txt alongside them as the license requires.
