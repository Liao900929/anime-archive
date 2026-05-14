import { AnimeEntry, Statistics, VoiceActor } from './types';

const STORAGE_KEY = 'anime_entries';
const VOICE_ACTORS_KEY = 'voice_actors';

// 初始化數據 - 從 localStorage 或備份文件加載
export async function initializeData(): Promise<AnimeEntry[]> {
  // 先檢查 localStorage 中是否有數據
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.error('Failed to parse stored data');
    }
  }

  // 從備份文件加載
  try {
    const response = await fetch('/anime-data.json');
    const backup = await response.json();
    const entries = backup.entries || [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entries;
  } catch (error) {
    console.error('Failed to load backup data:', error);
    return [];
  }
}

// 保存所有條目到 localStorage
export function saveEntries(entries: AnimeEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// 添加新條目
export function addEntry(entry: Omit<AnimeEntry, 'id'>): AnimeEntry {
  const entries = getEntries();
  const newEntry: AnimeEntry = {
    ...entry,
    id: Date.now(),
  };
  entries.push(newEntry);
  saveEntries(entries);
  return newEntry;
}

// 更新條目
export function updateEntry(id: number, updates: Partial<AnimeEntry>): AnimeEntry | null {
  const entries = getEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) return null;

  entries[index] = { ...entries[index], ...updates };
  saveEntries(entries);
  return entries[index];
}

// 刪除條目
export function deleteEntry(id: number): boolean {
  const entries = getEntries();
  const filtered = entries.filter(e => e.id !== id);
  if (filtered.length === entries.length) return false;
  saveEntries(filtered);
  return true;
}

// 獲取所有條目
export function getEntries(): AnimeEntry[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// 搜尋條目
export function searchEntries(query: string): AnimeEntry[] {
  const entries = getEntries();
  const lowerQuery = query.toLowerCase();
  return entries.filter(entry =>
    entry.title.toLowerCase().includes(lowerQuery) ||
    entry.series.toLowerCase().includes(lowerQuery) ||
    entry.review.toLowerCase().includes(lowerQuery)
  );
}

// 按系列分組
export function groupBySeriesWithSeasons(entries: AnimeEntry[]): Record<string, AnimeEntry[]> {
  const grouped: Record<string, AnimeEntry[]> = {};
  entries.forEach(entry => {
    if (!grouped[entry.series]) {
      grouped[entry.series] = [];
    }
    grouped[entry.series].push(entry);
  });
  return grouped;
}

// 提取聲優信息（從標題中解析）
export function extractVoiceActors(entries: AnimeEntry[]): VoiceActor[] {
  // 這是一個簡化版本，實際應用中可能需要更複雜的解析邏輯
  // 或者從外部 API 獲取聲優信息
  const actorsMap: Record<string, VoiceActor> = {};

  // 示例：從標題中提取可能的聲優名字
  // 實際應用中可能需要使用 AniDB 或其他 API

  return Object.values(actorsMap);
}

// 計算統計信息
export function calculateStatistics(entries: AnimeEntry[]): Statistics {
  const ratedEntries = entries.filter(e => e.rating > 0);
  const totalRating = ratedEntries.reduce((sum, e) => sum + e.rating, 0);
  const averageRating = ratedEntries.length > 0 ? totalRating / ratedEntries.length : 0;
  const perfectScoreCount = entries.filter(e => e.rating === 10).length;

  return {
    totalAnimes: entries.length,
    averageRating: Math.round(averageRating * 10) / 10,
    ratedCount: ratedEntries.length,
    perfectScoreCount,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

// 導出為 JSON 備份
export function exportAsBackup(): string {
  const entries = getEntries();
  const backup = {
    exportDate: new Date().toISOString(),
    version: 'v4',
    count: entries.length,
    entries,
  };
  return JSON.stringify(backup, null, 2);
}

// 從 JSON 導入備份
export function importFromBackup(jsonString: string): boolean {
  try {
    const backup = JSON.parse(jsonString);
    if (!backup.entries || !Array.isArray(backup.entries)) {
      throw new Error('Invalid backup format');
    }
    saveEntries(backup.entries);
    return true;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return false;
  }
}
