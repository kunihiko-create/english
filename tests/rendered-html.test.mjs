import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the English study application", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>英単語カード \| English Study<\/title>/);
  assert.match(html, /ENGLISH STUDY/);
  assert.match(html, /英単語カード/);
  assert.match(html, /単語/);
  assert.match(html, /フレーズ/);
  assert.match(html, /文法/);
  assert.match(html, /苦手/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape|react-loading-skeleton/);
});

test("removes the disposable starter preview", async () => {
  const [page, layout, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const WORDS/);
  assert.match(page, /localStorage/);
  assert.match(page, /const PHRASES/);
  assert.match(page, /const GRAMMAR/);
  assert.match(page, /const ALL_IDIOMS/);
  assert.match(page, /英熟語カード/);
  assert.match(page, /const INDONESIAN_TRANSLATIONS/);
  assert.match(page, /const SECOND_EXAMPLES/);
  assert.match(page, /confident about the interview/);
  assert.match(page, /confident in your English/);
  assert.match(page, /function handleCardPointerEnd/);
  assert.match(page, /onPointerDown=\{handleCardPointerDown\}/);
  assert.match(page, /onPointerEnd=\{handleCardPointerEnd\}/);
  assert.match(styles, /touch-action: pan-y/);
  assert.doesNotMatch(page, /Bahasa Indonesia/);
  assert.match(layout, /英単語カード \| English Study/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", templateRoot)));
});

test("keeps the expanded study data balanced and complete", async () => {
  const [page, expanded, more, further, idioms, additional, nonWordExamples] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/expanded-study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/more-study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/further-study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/idiom-study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/additional-study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/non-word-second-examples.ts", import.meta.url), "utf8"),
  ]);
  const allSource = `${page}\n${expanded}\n${more}\n${further}\n${idioms}\n${additional}`;
  const itemIds = [...allSource.matchAll(/\{ id: "([wpgi]-\d+)"/g)].map((match) => match[1]);
  const groupedCounts = Object.fromEntries(["w", "p", "g", "i"].map((prefix) => [prefix, itemIds.filter((id) => id.startsWith(prefix)).length]));
  const levelCounts = Object.fromEntries(["w", "p", "g", "i"].flatMap((prefix) => ["A1", "A2", "B1"].map((level) => [
    `${prefix}-${level}`,
    itemIds.filter((id) => id.startsWith(prefix) && allSource.includes(`{ id: "${id}", level: "${level}"`)).length,
  ])));

  assert.deepEqual(groupedCounts, { w: 240, p: 90, g: 90, i: 120 });
  assert.equal(new Set(itemIds).size, 540);
  assert.deepEqual(levelCounts, {
    "w-A1": 80, "w-A2": 80, "w-B1": 80,
    "p-A1": 30, "p-A2": 30, "p-B1": 30,
    "g-A1": 30, "g-A2": 30, "g-B1": 30,
    "i-A1": 40, "i-A2": 40, "i-B1": 40,
  });

  const translationSource = [
    page.slice(page.indexOf("const INDONESIAN_TRANSLATIONS"), page.indexOf("const SECOND_WORD_EXAMPLES")),
    expanded.slice(expanded.indexOf("const EXTRA_INDONESIAN_TRANSLATIONS"), expanded.indexOf("const EXTRA_SECOND_WORD_EXAMPLES")),
    more.slice(more.indexOf("const MORE_INDONESIAN_TRANSLATIONS"), more.indexOf("const MORE_SECOND_WORD_EXAMPLES")),
    further.slice(further.indexOf("const FURTHER_INDONESIAN_TRANSLATIONS"), further.indexOf("const FURTHER_SECOND_WORD_EXAMPLES")),
    idioms.slice(idioms.indexOf("const IDIOM_INDONESIAN_TRANSLATIONS"), idioms.indexOf("const IDIOM_SECOND_EXAMPLES")),
    additional.slice(additional.indexOf("const ADDITIONAL_INDONESIAN_TRANSLATIONS"), additional.indexOf("const ADDITIONAL_SECOND_EXAMPLES")),
  ].join("\n");
  const translationIds = [...translationSource.matchAll(/"([wpgi]-\d+)":/g)].map((match) => match[1]);
  const exampleSource = [
    page.slice(page.indexOf("const SECOND_EXAMPLES"), page.indexOf("const WORDS")),
    expanded.slice(expanded.indexOf("const EXTRA_SECOND_WORD_EXAMPLES")),
    more.slice(more.indexOf("const MORE_SECOND_WORD_EXAMPLES")),
    further.slice(further.indexOf("const FURTHER_SECOND_WORD_EXAMPLES")),
    idioms.slice(idioms.indexOf("const IDIOM_SECOND_EXAMPLES")),
    additional.slice(additional.indexOf("const ADDITIONAL_SECOND_EXAMPLES")),
    nonWordExamples,
  ].join("\n");
  const secondExampleIds = [...exampleSource.matchAll(/"([wpgi]-\d+)": \{ english:/g)].map((match) => match[1]);

  assert.deepEqual(new Set(translationIds), new Set(itemIds));
  assert.deepEqual(new Set(secondExampleIds), new Set(itemIds));
});
