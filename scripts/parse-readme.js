import fs from 'fs';
import path from 'path';

// Read the README file
const readmePath = path.join(process.cwd(), 'README-source.md');
const readme = fs.readFileSync(readmePath, 'utf-8');

// Parse tutorials
const tutorials = [];
const categories = new Map();
const languages = new Map();

let currentCategory = '';

const lines = readme.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check for category header
  const categoryMatch = line.match(/^#### Build your own [`"'](.+?)[`"']/);
  if (categoryMatch) {
    currentCategory = categoryMatch[1].trim();
    if (!categories.has(currentCategory)) {
      categories.set(currentCategory, {
        id: slugify(currentCategory),
        name: currentCategory,
        slug: slugify(currentCategory),
        description: `Tutorials for building your own ${currentCategory.toLowerCase()}`,
        tutorialCount: 0
      });
    }
    continue;
  }
  
  // Check for tutorial entry
  const tutorialMatch = line.match(/^\* \[\*\*(.+?)\*\*:\s*_*(.+?)_*\]\((.+?)\)(?:\s*\[(\w+)\])?/);
  if (tutorialMatch && currentCategory) {
    const langPart = tutorialMatch[1].trim();
    const title = tutorialMatch[2].trim();
    const url = tutorialMatch[3].trim();
    const tag = tutorialMatch[4] || null;
    
    // Handle multiple languages
    const langList = langPart.split(/\s*\/\s*/).map(l => l.trim()).filter(Boolean);
    
    const tutorial = {
      id: `${slugify(currentCategory)}-${slugify(title)}`,
      title: title,
      slug: slugify(title),
      category: currentCategory,
      categorySlug: slugify(currentCategory),
      languages: langList,
      languageSlugs: langList.map(slugify),
      url: url,
      contentType: tag === 'video' ? 'video' : detectContentType(url),
      sourcePlatform: detectSourcePlatform(url),
      difficulty: detectDifficulty(title),
      tags: tag ? [tag] : []
    };
    
    tutorials.push(tutorial);
    
    // Update category count
    const cat = categories.get(currentCategory);
    if (cat) cat.tutorialCount++;
    
    // Track languages
    langList.forEach(lang => {
      if (!languages.has(lang)) {
        languages.set(lang, {
          id: slugify(lang),
          name: lang,
          slug: slugify(lang),
          brandColor: getLanguageColor(lang),
          tutorialCount: 0
        });
      }
      const langData = languages.get(lang);
      if (langData) langData.tutorialCount++;
    });
  }
}

// Helper functions
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

function detectContentType(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
  if (url.includes('github.com')) return 'repository';
  return 'article';
}

function detectSourcePlatform(url) {
  if (url.includes('github.com')) return 'GitHub';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('medium.com')) return 'Medium';
  if (url.includes('dev.to')) return 'Dev.to';
  return 'Blog';
}

function detectDifficulty(title) {
  const lower = title.toLowerCase();
  if (lower.includes('simple') || lower.includes('basic') || lower.includes('beginner')) return 'beginner';
  if (lower.includes('advanced') || lower.includes('complex') || lower.includes('sophisticated')) return 'advanced';
  return 'intermediate';
}

function getLanguageColor(lang) {
  const colors = {
    'Python': '#3776AB',
    'JavaScript': '#F7DF1E',
    'TypeScript': '#3178C6',
    'C': '#A8B9CC',
    'C++': '#00599C',
    'Go': '#00ADD8',
    'Rust': '#DEA584',
    'Java': '#007396',
    'Ruby': '#CC342D',
    'Node.js': '#339933',
    'C#': '#239120',
    'Haskell': '#5D4F85',
    'Nim': '#FFE953',
    'PHP': '#777BB4',
    'Swift': '#F05138',
    'Kotlin': '#7F52FF',
    'Elixir': '#4B275F',
    'Scala': '#DC322F',
    'F#': '#378BBA',
    'OCaml': '#EC6813',
    'Clojure': '#5881D8',
    'Common Lisp': '#3FB68B',
    'Racket': '#3C5CAA',
    'Lua': '#000080',
    'Shell': '#89E051',
    'Perl': '#39457E',
    'R': '#276DC3',
    'Zig': '#EC915C',
    'Crystal': '#000100',
    'ATS': '#1ACCEF',
    'Alloy': '#64C800',
    'Pascal': '#E3F171',
    'Verilog': '#B2B7F8',
    'Assembly': '#6E4C13'
  };
  return colors[lang] || '#6366F1';
}

// Save data
const dataDir = path.join(process.cwd(), 'src', 'content');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(
  path.join(dataDir, 'tutorials.json'),
  JSON.stringify(tutorials, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'categories.json'),
  JSON.stringify(Array.from(categories.values()), null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'languages.json'),
  JSON.stringify(Array.from(languages.values()), null, 2)
);

// Generate search index
const searchIndex = tutorials.map(t => ({
  id: t.id,
  title: t.title,
  category: t.category,
  languages: t.languages,
  difficulty: t.difficulty,
  contentType: t.contentType
}));

fs.writeFileSync(
  path.join(dataDir, 'search-index.json'),
  JSON.stringify(searchIndex, null, 2)
);

console.log(`✅ Parsed ${tutorials.length} tutorials`);
console.log(`✅ Found ${categories.size} categories`);
console.log(`✅ Found ${languages.size} languages`);
console.log('✅ Data saved to src/content/');
