# fonts/

Place custom web font files here (`.woff2`, `.woff`).

Reference them in `src/css/custom.css` via `@font-face` rules, for example:

```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

Docusaurus copies everything in `static/` to the build output as-is.
