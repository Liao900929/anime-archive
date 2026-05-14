// 動畫作品數據類型
export interface AnimeEntry {
  id: number;
  title: string;
  rating: number;
  review: string;
  series: string;
  date: string;
  season?: string;
}

// 聲優數據類型
export interface VoiceActor {
  name: string;
  gender: 'male' | 'female' | 'unknown';
  animes: string[]; // 作品標題列表
}

// 備份文件格式
export interface AnimeBackup {
  exportDate: string;
  version: string;
  count: number;
  entries: AnimeEntry[];
}

// 統計信息
export interface Statistics {
  totalAnimes: number;
  averageRating: number;
  ratedCount: number;
  perfectScoreCount: number;
  lastUpdated: string;
}
