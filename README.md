# Build Your Own X - Website

A premium, fast, and searchable website for the [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) repository.

## 🚀 Features

- ⚡ **Fast** - Static site generation with Astro
- 🔍 **Searchable** - Search through 358+ tutorials
- 🎨 **Beautiful** - Modern design with dark mode support
- 📱 **Responsive** - Works on all devices
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🔎 **SEO Optimized** - Meta tags, sitemap, structured data

## 📊 Stats

- **358+ Tutorials** across 30 categories
- **37 Programming Languages** supported
- **100% Static** - No server required
- **< 500KB** Total page weight

## 🛠️ Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 🏗️ Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── content/     # TutorialCard, CategoryCard
│   │   └── navigation/  # Header, Footer
│   ├── content/         # JSON data (tutorials, categories, languages)
│   ├── layouts/         # Page layouts
│   ├── lib/             # Utility functions
│   ├── pages/           # Route pages
│   ├── styles/          # Global CSS
│   └── types/           # TypeScript types
├── scripts/             # Build scripts
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Parse README data
npm run ingest

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### GitHub Pages

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to "GitHub Actions"
4. The included workflow will build and deploy automatically

### Other Platforms

The `dist/` folder contains the static site ready for deployment to any static hosting platform:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3

## 📝 Data Flow

```
README.md (GitHub)
    ↓
scripts/parse-readme.js
    ↓
src/content/*.json
    ↓
Astro build
    ↓
dist/ (static site)
```

## 🤝 Contributing

This website is generated from the [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) repository.

To add or update tutorials, please submit a PR to the original repository.

## 📄 License

MIT License - same as the original build-your-own-x project.

## 🙏 Credits

- Original project by [Daniel Stefanovic](https://github.com/danistefanovic)
- Maintained by [CodeCrafters](https://codecrafters.io)
