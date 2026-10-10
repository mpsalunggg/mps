import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { chromium } from "playwright";

const WRITINGS_DIR = "src/content/writings";
const OUTPUT_DIR = "public/og";
const WIDTH = 1200;
const HEIGHT = 630;

const COLOR = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.129 0.042 264.695)",
  muted: "oklch(0.554 0.046 257.417)",
  primary: "oklch(0.208 0.042 265.755)",
};

const LINES = `<svg class="lines" viewBox="0 0 800 600" fill="none" preserveAspectRatio="none">
      <path d="M0,300 Q200,100 400,300 T800,300" stroke="${"oklch(0.208 0.042 265.755)"}" stroke-opacity="0.3" stroke-width="1" vector-effect="non-scaling-stroke" />
      <path d="M0,400 Q300,200 600,400 T800,200" stroke="${"oklch(0.208 0.042 265.755)"}" stroke-opacity="0.22" stroke-width="1" vector-effect="non-scaling-stroke" />
      <path d="M100,0 Q300,200 500,100 T700,600" stroke="${"oklch(0.208 0.042 265.755)"}" stroke-opacity="0.15" stroke-width="1" vector-effect="non-scaling-stroke" />
    </svg>`;

interface Frontmatter {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
}

async function readFrontmatter(file: string): Promise<Frontmatter> {
  const source = await readFile(file, "utf8");
  const start = source.indexOf("{", source.indexOf("export const frontmatter"));
  if (start === -1) throw new Error(`No frontmatter export in ${file}`);

  let depth = 0;
  let end = -1;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}" && --depth === 0) {
      end = i + 1;
      break;
    }
  }
  if (end === -1) throw new Error(`Unterminated frontmatter in ${file}`);

  return runInNewContext(`(${source.slice(start, end)})`);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );
}

function cardHtml({
  title,
  description,
  category,
  readingTime,
}: Frontmatter): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link
      href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        position: relative;
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        padding: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: ${COLOR.background};
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      }

      /* Category and reading time read as two different things, so they are set
         differently: the topic in sans, the duration in mono. */
      .meta {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 34px;
      }

      .category {
        font-size: 26px;
        font-weight: 500;
        color: ${COLOR.primary};
      }

      .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${COLOR.muted};
      }

      .reading-time {
        font-family: "IBM Plex Mono", monospace;
        font-size: 20px;
        color: ${COLOR.muted};
      }

      h1 {
        font-family: "Amatic SC", cursive;
        font-size: ${title.length > 38 ? 82 : 110}px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        color: ${COLOR.foreground};
        margin-bottom: 28px;
      }

      p {
        font-size: 28px;
        line-height: 1.5;
        font-weight: 300;
        color: ${COLOR.muted};
      }

      /* Safety net: the size step above should already fit every real title. */
      .clamp-2, .clamp-3 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .clamp-2 { -webkit-line-clamp: 2; }
      .clamp-3 { -webkit-line-clamp: 3; }

      /* The waves sit behind everything; the three content rows stay above them. */
      .lines {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .meta, main { position: relative; }

    </style>
  </head>
  <body>
    ${LINES}

    <div class="meta">
      <span class="category">${escapeHtml(category)}</span>
      <span class="dot"></span>
      <span class="reading-time">${escapeHtml(readingTime)}</span>
    </div>

    <main>
      <h1 class="clamp-2">${escapeHtml(title)}</h1>
      <p class="clamp-3">${escapeHtml(description)}</p>
    </main>
  </body>
</html>`;
}

async function main() {
  const available = (await readdir(WRITINGS_DIR))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));

  const requested = process.argv.slice(2);
  const unknown = requested.filter((slug) => !available.includes(slug));
  if (unknown.length > 0) {
    console.error(`Unknown writing: ${unknown.join(", ")}`);
    console.error(`Available: ${available.join(", ")}`);
    process.exit(1);
  }

  const slugs = requested.length > 0 ? requested : available;
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
  });

  for (const slug of slugs) {
    const frontmatter = await readFrontmatter(
      join(WRITINGS_DIR, `${slug}.mdx`),
    );

    await page.setContent(cardHtml(frontmatter), { waitUntil: "networkidle" });
    // Without this the webfonts are still loading and the card renders in a fallback face.
    await page.evaluate(() => document.fonts.ready);

    const output = join(OUTPUT_DIR, `${slug}.png`);
    await writeFile(output, await page.screenshot({ type: "png" }));
    console.log(`✓ ${output}`);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
