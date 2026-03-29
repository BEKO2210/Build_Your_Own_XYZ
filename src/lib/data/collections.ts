import tutorialsData from '../../content/tutorials.json';
import categoriesData from '../../content/categories.json';
import languagesData from '../../content/languages.json';
import type { Tutorial, Category, Language } from '../../types';

export function getAllTutorials(): Tutorial[] {
  return tutorialsData as Tutorial[];
}

export function getAllCategories(): Category[] {
  return (categoriesData as Category[]).sort((a, b) => b.tutorialCount - a.tutorialCount);
}

export function getAllLanguages(): Language[] {
  return (languagesData as Language[]).sort((a, b) => b.tutorialCount - a.tutorialCount);
}

export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return (tutorialsData as Tutorial[]).find(t => t.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return (categoriesData as Category[]).find(c => c.slug === slug);
}

export function getLanguageBySlug(slug: string): Language | undefined {
  return (languagesData as Language[]).find(l => l.slug === slug);
}

export function getTutorialsByCategory(categorySlug: string): Tutorial[] {
  return (tutorialsData as Tutorial[]).filter(t => t.categorySlug === categorySlug);
}

export function getTutorialsByLanguage(languageSlug: string): Tutorial[] {
  return (tutorialsData as Tutorial[]).filter(t => t.languageSlugs.includes(languageSlug));
}

export function getRelatedTutorials(tutorial: Tutorial, limit: number = 4): Tutorial[] {
  return (tutorialsData as Tutorial[])
    .filter(t => 
      t.id !== tutorial.id && 
      (t.categorySlug === tutorial.categorySlug || 
       t.languageSlugs.some(l => tutorial.languageSlugs.includes(l)))
    )
    .slice(0, limit);
}

export function searchTutorials(query: string): Tutorial[] {
  const lowerQuery = query.toLowerCase();
  return (tutorialsData as Tutorial[]).filter(t => 
    t.title.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery) ||
    t.languages.some(l => l.toLowerCase().includes(lowerQuery))
  );
}

export function getFeaturedTutorials(limit: number = 6): Tutorial[] {
  return (tutorialsData as Tutorial[]).slice(0, limit);
}

export function getRecentTutorials(limit: number = 6): Tutorial[] {
  return (tutorialsData as Tutorial[]).slice(-limit).reverse();
}
