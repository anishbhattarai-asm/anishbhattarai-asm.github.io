# anishbhattarai-asm.github.io

Portfolio site for [Anish Bhattarai](https://github.com/anishbhattarai-asm), served by GitHub Pages at
**https://anishbhattarai-asm.github.io/**.

It is plain static HTML with no JavaScript. The pages are generated from one list of projects.

## Add or change a project

1. Edit `scripts/projects.mjs`.
2. Run `node scripts/build.mjs`. It rewrites `index.html`, `projects/*/`, `sitemap.xml`, `robots.txt`
   and `404.html`.
3. Commit and push. GitHub Pages publishes the result.

Project pages live under `/projects/` so they never collide with the project sites GitHub Pages
already serves, such as `/DWFS/`, `/nepalqr/` and `/VCF-Editor/`.

## Search engines

`sitemap.xml` lists every page. Submit it in Google Search Console and Bing Webmaster Tools.
