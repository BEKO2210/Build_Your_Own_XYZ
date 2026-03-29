import fs from 'fs';
import path from 'path';

// Load tutorials
const dataDir = path.join(process.cwd(), 'src', 'content');
const tutorials = JSON.parse(fs.readFileSync(path.join(dataDir, 'tutorials.json'), 'utf-8'));

// Only fetch GitHub repos
const githubTutorials = tutorials.filter(t => t.contentType === 'repository' && t.url.includes('github.com'));

// Cache dir
const cacheDir = path.join(process.cwd(), 'src', 'content', 'readmes');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

// Extract owner/repo from GitHub URL
function extractRepoPath(url) {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) return null;
  return match[1].replace(/\.git$/, '');
}

// Convert GitHub URL to raw README URL
function getReadmeUrl(repoPath) {
  return `https://raw.githubusercontent.com/${repoPath}/HEAD/README.md`;
}

// Simple markdown to HTML (no external deps)
function mdToHtml(md) {
  let html = md
    // Code blocks (fenced)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-4"><code>${escHtml(code.trim())}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-4" loading="lazy" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">$1</a>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-4">$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr class="my-8 border-gray-200 dark:border-gray-700" />')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary-500 pl-4 my-4 text-gray-600 dark:text-gray-400 italic">$1</blockquote>')
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<[a-z/])((?!^\s*$).+)$/gm, '<p class="text-gray-700 dark:text-gray-300 leading-relaxed my-2">$1</p>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="list-disc my-4 space-y-1">$1</ul>');

  return html;
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Fetch with timeout
async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    return null;
  }
}

// Main
async function main() {
  const readmeMap = {};
  let fetched = 0, cached = 0, failed = 0;

  // Check existing cache
  const existingCache = {};
  if (fs.existsSync(path.join(cacheDir, 'index.json'))) {
    try {
      const idx = JSON.parse(fs.readFileSync(path.join(cacheDir, 'index.json'), 'utf-8'));
      Object.assign(existingCache, idx);
    } catch {}
  }

  // Process in batches of 5
  const BATCH = 5;
  for (let i = 0; i < githubTutorials.length; i += BATCH) {
    const batch = githubTutorials.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(async (t) => {
      const repoPath = extractRepoPath(t.url);
      if (!repoPath) return;

      // Use cache if exists
      const cacheFile = path.join(cacheDir, `${t.slug}.html`);
      if (existingCache[t.slug] && fs.existsSync(cacheFile)) {
        readmeMap[t.slug] = true;
        cached++;
        return;
      }

      const readmeUrl = getReadmeUrl(repoPath);
      const res = await fetchWithTimeout(readmeUrl);
      if (!res || !res.ok) {
        // Try lowercase readme
        const altUrl = readmeUrl.replace('README.md', 'readme.md');
        const res2 = await fetchWithTimeout(altUrl);
        if (!res2 || !res2.ok) {
          failed++;
          return;
        }
        const md = await res2.text();
        // Fix relative image URLs
        const fixedMd = md.replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
          `![$ 1](https://raw.githubusercontent.com/${repoPath}/HEAD/$2)`);
        const html = mdToHtml(fixedMd);
        fs.writeFileSync(cacheFile, html);
        readmeMap[t.slug] = true;
        fetched++;
        return;
      }
      const md = await res.text();
      const fixedMd = md.replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
        `![$ 1](https://raw.githubusercontent.com/${repoPath}/HEAD/$2)`);
      const html = mdToHtml(fixedMd);
      fs.writeFileSync(cacheFile, html);
      readmeMap[t.slug] = true;
      fetched++;
    }));

    // Small delay between batches to avoid rate limiting
    if (i + BATCH < githubTutorials.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Save index
  const idx = { ...existingCache, ...readmeMap };
  fs.writeFileSync(path.join(cacheDir, 'index.json'), JSON.stringify(idx, null, 2));

  console.log(`✅ GitHub READMEs: ${fetched} fetched, ${cached} cached, ${failed} failed (${githubTutorials.length} total repos)`);
}

main().catch(e => {
  console.error('README fetch error:', e.message);
  process.exit(0); // Don't fail the build
});
