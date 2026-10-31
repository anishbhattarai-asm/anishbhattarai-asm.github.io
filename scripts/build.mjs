// Builds the static site from projects.mjs. Run: node scripts/build.mjs
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categories, GITHUB, projects } from './projects.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://anishbhattarai-asm.github.io';
const NAME = 'Anish Bhattarai';
const NPM = 'https://www.npmjs.com/~anishbhattarai';
const AVATAR = `${GITHUB}.png?size=240`;
const INTRO = 'Open source tools for payments in Nepal, math animation, and video and streaming automation.';
const GOOGLE_VERIFY = 'j8reBdE3fEtpz5bDb62e8pweoYer8cZxdplri8LsFM8';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Escapes text, then turns `code` and **bold** into markup. */
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

const plain = (s) => String(s).replace(/[`*]/g, '');
const repoUrl = (p) => `${GITHUB}/${p.repo}`;
const pageUrl = (p) => `${SITE}/projects/${p.slug}/`;

function page({ title, description, path, jsonLd, body }) {
  const url = `${SITE}${path}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${NAME}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${AVATAR}">
<meta name="twitter:card" content="summary">
<meta name="color-scheme" content="light dark">
<meta name="google-site-verification" content="${GOOGLE_VERIFY}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${body}
<footer class="footer">
  <div class="wrap">
    <p>&copy; ${new Date().getFullYear()} ${NAME}. Projects are MIT licensed.</p>
    <p><a href="${GITHUB}">GitHub</a> <span aria-hidden="true">&middot;</span> <a href="${NPM}">npm</a></p>
  </div>
</footer>
</body>
</html>
`;
}

const person = { '@type': 'Person', name: NAME, url: `${SITE}/`, image: AVATAR, sameAs: [GITHUB, NPM] };

function card(p) {
  return `<li class="card">
  <h3><a href="/projects/${p.slug}/">${esc(p.name)}</a></h3>
  <p>${inline(p.tagline)}</p>
  <p class="meta"><span class="lang">${esc(p.language)}</span>${p.topics
    .slice(0, 3)
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join('')}</p>
  <p class="card-links"><a href="/projects/${p.slug}/">Details</a><a href="${repoUrl(p)}">GitHub</a></p>
</li>`;
}

function home() {
  const sections = categories
    .map((c) => {
      const list = projects.filter((p) => p.category === c.id);
      return `<section aria-labelledby="cat-${c.id}">
  <h2 id="cat-${c.id}">${esc(c.title)}</h2>
  <ul class="grid">
${list.map(card).join('\n')}
  </ul>
</section>`;
    })
    .join('\n');

  return page({
    title: `${NAME}: open source projects`,
    description: `${NAME}'s open source projects. ${INTRO}`,
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { ...person, '@id': `${SITE}/#person` },
        {
          '@type': 'ItemList',
          name: 'Open source projects',
          itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: pageUrl(p), name: p.name })),
        },
      ],
    },
    body: `<header class="hero">
  <div class="wrap hero-inner">
    <img class="avatar" src="${AVATAR}" alt="" width="96" height="96">
    <div>
      <h1>${NAME}</h1>
      <p class="lead">${esc(INTRO)}</p>
      <p class="hero-links"><a class="button" href="${GITHUB}">GitHub</a><a class="button ghost" href="${NPM}">npm</a></p>
    </div>
  </div>
</header>
<main id="main" class="wrap">
${sections}
</main>`,
  });
}

function projectPage(p) {
  const links = [{ label: 'View on GitHub', href: repoUrl(p), primary: true }, ...p.links];
  const image = p.image
    ? `<figure class="shot"><img src="${esc(p.image.src)}" alt="${esc(p.image.alt)}" loading="lazy"></figure>`
    : '';
  const code = p.code
    ? `<h2>Quick start</h2>
<pre><code class="language-${p.code.lang}">${esc(p.code.text)}</code></pre>`
    : '';
  const others = projects.filter((o) => o.category === p.category && o.slug !== p.slug);
  const related = others.length
    ? `<h2>Related projects</h2>
<ul class="related">${others.map((o) => `<li><a href="/projects/${o.slug}/">${esc(o.name)}</a>: ${inline(o.tagline)}</li>`).join('')}</ul>`
    : '';

  // Search results cut titles at about 70 characters, so add the name only when it fits.
  const withName = `${p.title} | ${NAME}`;
  return page({
    title: withName.length <= 70 ? withName : p.title,
    description: plain(p.tagline),
    path: `/projects/${p.slug}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: p.name,
      description: plain(p.tagline),
      url: pageUrl(p),
      codeRepository: repoUrl(p),
      programmingLanguage: p.language,
      license: 'https://opensource.org/licenses/MIT',
      keywords: p.topics.join(', '),
      author: person,
    },
    body: `<header class="bar">
  <div class="wrap"><a href="/">&larr; ${NAME}</a></div>
</header>
<main id="main" class="wrap project">
<p class="eyebrow">${esc(categories.find((c) => c.id === p.category).title)}</p>
<h1>${esc(p.name)}</h1>
<p class="lead">${inline(p.tagline)}</p>
<p class="meta"><span class="lang">${esc(p.language)}</span><span class="tag">MIT</span></p>
<p class="actions">${links
      .map((l) => `<a class="button${l.primary ? '' : ' ghost'}" href="${esc(l.href)}">${esc(l.label)}</a>`)
      .join('')}</p>
${image}
<h2>About</h2>
${p.about.map((t) => `<p>${inline(t)}</p>`).join('\n')}
<h2>Highlights</h2>
<ul class="highlights">${p.highlights.map((h) => `<li>${inline(h)}</li>`).join('')}</ul>
${code}
<h2>Topics</h2>
<p class="meta">${p.topics.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</p>
<p class="source">Source code, issues and full documentation: <a href="${repoUrl(p)}">${esc(`github.com/anishbhattarai-asm/${p.repo}`)}</a></p>
${related}
</main>`,
  });
}

function notFound() {
  return page({
    title: `Page not found | ${NAME}`,
    description: 'This page does not exist.',
    path: '/404.html',
    jsonLd: { '@context': 'https://schema.org', ...person },
    body: `<main id="main" class="wrap project">
<h1>Page not found</h1>
<p class="lead">That page does not exist. <a href="/">See all projects</a>.</p>
</main>`,
  });
}

function write(rel, content) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const today = new Date().toISOString().slice(0, 10);
rmSync(join(ROOT, 'projects'), { recursive: true, force: true });
write('index.html', home());
write('404.html', notFound());
for (const p of projects) write(`projects/${p.slug}/index.html`, projectPage(p));
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[`${SITE}/`, ...projects.map(pageUrl)].map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
write('.nojekyll', '');
console.log(`built ${projects.length + 2} pages into ${ROOT}`);
