import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Plus, Download, Upload } from 'lucide-react';
import { AnimeEntry, Statistics } from '@/lib/types';
import { initializeData, searchEntries, calculateStatistics, addEntry, exportAsBackup, importFromBackup } from '@/lib/storage';
import AnimeCard from '@/components/AnimeCard';
import StatisticsPanel from '@/components/StatisticsPanel';
import Header from '@/components/Header';
import MouseFollower from '@/components/MouseFollower';

/**
 * 主頁面 - 包浩斯風格 + Godly 前衛風格
 * 幾何形狀、不對稱排版、大字體主視覺、互動效果
 */
export default function Home() {
  const [entries, setEntries] = useState<AnimeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AnimeEntry[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingAnime, setIsAddingAnime] = useState(false);
  const [newAnimeData, setNewAnimeData] = useState({
    title: '',
    series: '',
    season: '',
    rating: 0,
    review: '',
  });

  // 初始化數據
  useEffect(() => {
    initializeData().then(data => {
      setEntries(data);
      setFilteredEntries(data);
      setStatistics(calculateStatistics(data));
    });
  }, []);

  // 搜尋功能
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchEntries(searchQuery);
      setFilteredEntries(results);
    } else {
      setFilteredEntries(entries);
    }
  }, [searchQuery, entries]);

  // 添加新動畫
  const handleAddAnime = () => {
    if (!newAnimeData.title.trim()) {
      toast.error('請輸入作品名稱');
      return;
    }
    if (!newAnimeData.series.trim()) {
      toast.error('請輸入系列名稱');
      return;
    }

    const entry = addEntry({
      title: newAnimeData.title,
      series: newAnimeData.series,
      season: newAnimeData.season,
      rating: newAnimeData.rating,
      review: newAnimeData.review,
      date: new Date().toISOString().split('T')[0],
    });

    setEntries([...entries, entry]);
    setNewAnimeData({
      title: '',
      series: '',
      season: '',
      rating: 0,
      review: '',
    });
    setIsAddingAnime(false);
    toast.success('作品已添加');
  };

  // 導出備份
  const handleExport = () => {
    const backup = exportAsBackup();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(backup));
    element.setAttribute('download', `anime-backup-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('備份已導出');
  };

  // 導入備份
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importFromBackup(content)) {
        initializeData().then(data => {
          setEntries(data);
          setFilteredEntries(data);
          setStatistics(calculateStatistics(data));
          toast.success('備份已導入');
        });
      } else {
        toast.error('導入失敗，請檢查文件格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MouseFollower />
      <Header />

      <main className="container mx-auto py-16">
        {/* 統計面板 */}
        {statistics && <StatisticsPanel stats={statistics} />}

        {/* 搜尋和操作欄 */}
        <div className="space-y-6 mb-16">
          {/* 搜尋框 - 包浩斯風格 */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="搜尋聲優名、角色名、作品名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 bg-background border-2 border-foreground text-foreground placeholder:text-muted-foreground font-bold text-lg"
            />
          </div>

          {/* 操作按鈕 - 不規則排列 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 新增作品按鈕 */}
            <Dialog open={isAddingAnime} onOpenChange={setIsAddingAnime}>
              <DialogTrigger asChild>
                <button className="bauhaus-button-primary col-span-1 md:col-span-2">
                  <Plus className="w-4 h-4 mr-2 inline" />
                  新增作品
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-foreground">
                <DialogHeader>
                  <DialogTitle className="text-foreground font-black text-2xl">新增動畫作品</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase">作品名稱 *</label>
                    <Input
                      value={newAnimeData.title}
                      onChange={(e) => setNewAnimeData({ ...newAnimeData, title: e.target.value })}
                      placeholder="例：薰香花朵凜然綻然"
                      className="bg-background border-2 border-foreground text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase">系列名稱 *</label>
                    <Input
                      value={newAnimeData.series}
                      onChange={(e) => setNewAnimeData({ ...newAnimeData, series: e.target.value })}
                      placeholder="例：薰香花朵凜然綻然"
                      className="bg-background border-2 border-foreground text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase">季數</label>
                    <Input
                      value={newAnimeData.season}
                      onChange={(e) => setNewAnimeData({ ...newAnimeData, season: e.target.value })}
                      placeholder="例：I季"
                      className="bg-background border-2 border-foreground text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase">評分 (0-10)</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={newAnimeData.rating}
                      onChange={(e) => setNewAnimeData({ ...newAnimeData, rating: parseFloat(e.target.value) || 0 })}
                      className="bg-background border-2 border-foreground text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase">心得評論</label>
                    <Textarea
                      value={newAnimeData.review}
                      onChange={(e) => setNewAnimeData({ ...newAnimeData, review: e.target.value })}
                      placeholder="分享您的觀影心得..."
                      className="bg-background border-2 border-foreground text-foreground font-bold min-h-24"
                    />
                  </div>
                  <button onClick={handleAddAnime} className="bauhaus-button-primary w-full">
                    添加作品
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            {/* 備份按鈕 */}
            <button onClick={handleExport} className="bauhaus-button-secondary">
              <Download className="w-4 h-4 mr-1 inline" />
              備份
            </button>

            {/* 導入按鈕 */}
            <label className="bauhaus-button-secondary inline-flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Upload className="w-4 h-4 mr-1" />
              導入
            </label>

            {/* 聲優頁面連結 */}
            <Link href="/voice-actors">
              <button className="bauhaus-button-secondary w-full">
                聲優資料庫
              </button>
            </Link>
          </div>
        </div>

        {/* 結果計數 - 大字體 */}
        <div className="mb-12">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">顯示</p>
          <p className="display-text text-primary leading-none">
            {filteredEntries.length}
          </p>
          <p className="text-xs font-bold text-muted-foreground mt-2">部作品</p>
        </div>

        {/* 作品卡片網格 - 不規則網格 */}
        {filteredEntries.length > 0 ? (
          <div className="irregular-grid">
            {filteredEntries.map((entry) => (
              <Link key={entry.id} href={`/anime/${entry.id}`}>
                <AnimeCard entry={entry} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl font-black text-muted-foreground">沒有找到相符的作品</p>
          </div>
        )}
      </main>
    </div>
  );
}
