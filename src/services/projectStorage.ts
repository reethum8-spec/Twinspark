import { ProductSpec, SavedProjectVersion } from '../types/twinspark';

const STORAGE_KEY = 'twinspark_saved_versions_v2';

export function getSavedVersions(): SavedProjectVersion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved versions', e);
    return [];
  }
}

export function saveProjectVersion(name: string, spec: ProductSpec): SavedProjectVersion[] {
  const versions = getSavedVersions();
  const newVersion: SavedProjectVersion = {
    id: `ver-${Date.now()}`,
    name: name.trim() || spec.name,
    timestamp: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    spec: JSON.parse(JSON.stringify(spec))
  };

  const updated = [newVersion, ...versions];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save version to localStorage', e);
  }
  return updated;
}

export function deleteProjectVersion(versionId: string): SavedProjectVersion[] {
  const versions = getSavedVersions();
  const updated = versions.filter(v => v.id !== versionId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete version', e);
  }
  return updated;
}
