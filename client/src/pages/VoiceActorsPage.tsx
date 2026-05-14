import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { AnimeEntry } from '@/lib/types';
import { getEntries } from '@/lib/storage';
import Header from '@/components/Header';
import MouseFollower from '@/components/MouseFollower';

interface VoiceActorInfo {
  name: string;
  animes: AnimeEntry[];
}

/**
 * 聲優專頁 - 包浩斯風格
 * 顯示所有聲優及其作品列表
 */
export default function VoiceActorsPage() {
  const [voiceActors, setVoiceActors] = useState<VoiceActorInfo[]>([]);
  const [filteredActors, setFilteredActors] = useState<VoiceActorInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const entries = getEntries();
    
    // 按系列分組
    const groupedBySeries: Record<string, AnimeEntry[]> = {};
    entries.forEach(entry => {
      if (!groupedBySeries[entry.series]) {
        groupedBySeries[entry.series] = [];
      }
      groupedBySeries[entry.series].push(entry);
    });

    // 轉換為 VoiceActorInfo 格式
    const actors = Object.entries(groupedBySeries).map(([series, animes]) => ({
      name: series,
      animes: animes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));

    setVoiceActors(actors);
    setFilteredActors(actors);
  }, []);

  // 搜尋功能
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = voiceActors.filter(actor =>
        actor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActors(results);
    } else {
      setFilteredActors(voiceActors);
    }
  }, [searchQuery, voiceActors]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MouseFollower />
      <Header />

      <main className="container mx-auto py-16">
        {/* 返回按鈕 */}
        <Link href="/">
          <button className="bauhaus-button-secondary mb-12">
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            返回主頁
          </button>
        </Link>

        {/* 頁面標題 */}
        <div className="mb-12 space-y-4">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">聲優資料庫</p>
          <h2 className="display-text-lg text-foreground leading-tight">
            VOICE<br />
            <span className="text-primary">ACTORS</span>
          </h2>
          <p className="text-sm font-bold text-muted-foreground">瀏覽聲優及其參與的動畫作品</p>
        </div>

        {/* 搜尋框 */}
        <div className="relative mb-12">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <Input
            type="text"
            placeholder="搜尋聲優名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-4 bg-background border-2 border-foreground text-foreground placeholder:text-muted-foreground font-bold text-lg"
          />
        </div>

        {/* 結果計數 */}
        <div className="mb-12 space-y-2">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">找到</p>
          <p className="display-text text-accent leading-none">{filteredActors.length}</p>
          <p className="text-xs font-bold text-muted-foreground">位聲優</p>
        </div>

        {/* 聲優列表 */}
        {filteredActors.length > 0 ? (
          <div className="space-y-6">
            {filteredActors.map((actor, index) => (
              <div key={actor.name} className="bauhaus-card">
                <div className="bauhaus-card-inner space-y-4">
                  {/* 聲優名稱 + 索引 */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-black text-2xl text-foreground">{actor.name}</h3>
                    <span className="font-black text-3xl text-primary opacity-20">{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  {/* 作品列表 */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">參與作品 ({actor.animes.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {actor.animes.map((anime) => (
                        <Link key={anime.id} href={`/anime/${anime.id}`}>
                          <span className="inline-block bg-background border border-foreground px-3 py-1 text-xs font-bold text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all cursor-pointer">
                            {anime.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* 統計信息 */}
                  <div className="flex gap-6 text-sm font-bold pt-2 border-t border-foreground">
                    <div>
                      <span className="text-muted-foreground">平均評分: </span>
                      <span className="text-accent">
                        {(actor.animes.filter(a => a.rating > 0).reduce((sum, a) => sum + a.rating, 0) / actor.animes.filter(a => a.rating > 0).length || 0).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">已評分: </span>
                      <span className="text-primary">
                        {actor.animes.filter(a => a.rating > 0).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="display-text text-muted-foreground leading-none">沒有找到</p>
          </div>
        )}
      </main>
    </div>
  );
}
