import { ComponentItem, ComponentCategory } from '../types/twinspark';
import { EXPANDED_COMPONENT_CATALOG } from '../data/expandedCatalog';

const LOCAL_STORAGE_CUSTOM_PARTS_KEY = 'twinspark_custom_parts_v1';

/**
 * Architecture Layer: Parts Library Service
 * Provides a clean API for catalog queries, search, custom component storage, and supplier API extensibility.
 */

// ─── Custom Parts LocalStorage Persistence ───────────────────────────────

export function getStoredCustomComponents(): ComponentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PARTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse custom components from localStorage:', err);
    return [];
  }
}

export function saveCustomComponent(part: ComponentItem): ComponentItem[] {
  const existing = getStoredCustomComponents();
  const index = existing.findIndex(p => p.id === part.id);
  
  let updated: ComponentItem[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = { ...part, isCustom: true };
  } else {
    updated = [{ ...part, isCustom: true }, ...existing];
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PARTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom component to localStorage:', err);
  }

  return updated;
}

export function deleteCustomComponent(id: string): ComponentItem[] {
  const existing = getStoredCustomComponents();
  const updated = existing.filter(p => p.id !== id);

  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PARTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom component from localStorage:', err);
  }

  return updated;
}

// ─── Catalog Queries & Filtering API ──────────────────────────────────────

/**
 * Retrieves full unified list of built-in catalog entries + user custom parts.
 */
export function getAllCatalogComponents(): ComponentItem[] {
  const customParts = getStoredCustomComponents();
  return [...customParts, ...EXPANDED_COMPONENT_CATALOG];
}

/**
 * Finds component by ID across built-in catalog and custom parts.
 */
export function getComponentById(id: string): ComponentItem | undefined {
  return getAllCatalogComponents().find(item => item.id === id);
}

/**
 * Filters parts by category and optional text search query.
 */
export function queryPartsLibrary(options: {
  category?: ComponentCategory | 'all' | 'custom';
  searchQuery?: string;
  subcategory?: string;
}): ComponentItem[] {
  let list = getAllCatalogComponents();

  const { category, searchQuery, subcategory } = options;

  if (category && category !== 'all') {
    if (category === 'custom') {
      list = list.filter(item => item.isCustom || item.category === 'custom' || item.confidence === 'custom-spec');
    } else {
      list = list.filter(item => item.category === category);
    }
  }

  if (subcategory) {
    list = list.filter(item => item.subcategory?.toLowerCase() === subcategory.toLowerCase());
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(item => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchSub = item.subcategory?.toLowerCase().includes(q);
      const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
      return matchName || matchDesc || matchCat || matchSub || matchTags;
    });
  }

  return list;
}

/**
 * Returns available subcategories for a given category.
 */
export function getSubcategoriesForCategory(category: ComponentCategory | 'all'): string[] {
  const list = queryPartsLibrary({ category });
  const subcats = new Set<string>();
  list.forEach(item => {
    if (item.subcategory) subcats.add(item.subcategory);
  });
  return Array.from(subcats);
}

/**
 * Exports parts catalog as JSON string.
 */
export function exportPartsLibraryJson(): string {
  return JSON.stringify(getAllCatalogComponents(), null, 2);
}
