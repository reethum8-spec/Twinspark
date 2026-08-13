import { ComponentItem } from '../types/twinspark';
import { EXPANDED_COMPONENT_CATALOG } from './expandedCatalog';

export const COMPONENT_DATABASE: Record<string, ComponentItem> = EXPANDED_COMPONENT_CATALOG.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<string, ComponentItem>);
