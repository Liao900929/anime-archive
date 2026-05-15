import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';

function extractYear(title: string): string | null {
  const match = title.match(/[（(](\d{4})[）)]/);
  return match ? match[1] : null;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { AnimeEntry } from '@/lib/types';
import { getEntries, updateEntry, deleteEntry } from '@/lib/storage';
import Header from '@/components/Header';
import MouseFollower from '@/components/MouseFollower';

/**
 * 作品詳情頁 - 包浩斯風格
 * 顯示單個作品的完整信息、評分、心得評論
 */
export default function AnimeDetailPage() {
  const { id } = useParams();
  const [anime, setAnime] = useState<AnimeEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AnimeEntry>>({});

  useEffect(() => {
    const entries = getEntries();
    const found = entries.find(e => e.id === parseInt(id || '0'));
    if (found) {
      setAnime(found);
      setEditData(found);
    }
  }, [id]);

  const handleSaveEdit = () => {
    if (!anime) return;

    const updated = updateEntry(anime.id, editData);
    if (updated) {
      setAnime(updated);
      setIsEditing(false);
      toast.success('作品已更新');
    }
  };

  const handleDelete = () => {
    if (!anime) return;

    if (deleteEntry(anime.id)) {
      toast.success('作品已刪除');
      window.location.href = '/';
    }
  };

  // 用幾何色塊表示評分
  const renderRatingBlocks = () => {
    if (!anime || anime.rating === 0) return null;
    
    const fullBlocks = Math.floor(anime.rating);
    const hasHalfBlock = anime.rating % 1 !== 0;
    const emptyBlocks = 10 - fullBlocks - (hasHalfBlock ? 1 : 0);

    return (
      <div className="flex flex-wrap gap-2">
        {[...Array(fullBlocks)].map((_, i) => (
          <div key={`full-${i}`} className="w-8 h-8 bg-primary"></div>
        ))}
        {hasHalfBlock && (
          <div key="half" className="w-8 h-8 bg-primary opacity-50"></div>
        )}
        {[...Array(emptyBlocks)].map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8 border-2 border-foreground"></div>
        ))}
      </div>
    );
  };

  if (!anime) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <MouseFollower />
        <Header />
        <main className="container mx-auto py-16">
          <p className="text-muted-foreground">作品未找到</p>
        </main>
      </div>
    );
  }

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

        {/* 作品詳情卡片 */}
        <div className="bauhaus-card max-w-2xl mx-auto">
          <div className="bauhaus-card-inner space-y-8">
            {/* 標題區域 */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <h1 className="display-text-lg text-foreground leading-tight flex-1">{anime.title}</h1>
                {extractYear(anime.title) && (
                  <span className="shrink-0 text-base font-black bg-accent text-accent-foreground px-3 py-1 mt-1">
                    {extractYear(anime.title)}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-primary">{anime.series}</p>
              <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                {anime.season && `${anime.season} • `}
                {anime.date}
              </p>
            </div>

            {/* 分隔線 */}
            <div className="h-2 bg-foreground"></div>

            {/* 評分區域 - 幾何色塊 */}
            {anime.rating > 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">評分</p>
                  {renderRatingBlocks()}
                  <p className="text-2xl font-black text-accent">{anime.rating}/10</p>
                </div>
              </div>
            )}

            {/* 分隔線 */}
            <div className="h-2 bg-foreground"></div>

            {/* 心得評論 */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">觀影心得</p>
              {anime.review ? (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap font-medium">{anime.review}</p>
              ) : (
                <p className="text-muted-foreground italic font-medium">未添加心得評論</p>
              )}
            </div>

            {/* 分隔線 */}
            <div className="h-2 bg-foreground"></div>

            {/* 編輯和刪除按鈕 */}
            <div className="flex gap-3 pt-4">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <button className="bauhaus-button-primary flex-1">
                    <Edit className="w-4 h-4 mr-2 inline" />
                    編輯
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card border-2 border-foreground">
                  <DialogHeader>
                    <DialogTitle className="text-foreground font-black text-2xl">編輯作品</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-muted-foreground uppercase">作品名稱</label>
                      <Input
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="bg-background border-2 border-foreground text-foreground font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-muted-foreground uppercase">系列名稱</label>
                      <Input
                        value={editData.series || ''}
                        onChange={(e) => setEditData({ ...editData, series: e.target.value })}
                        className="bg-background border-2 border-foreground text-foreground font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-muted-foreground uppercase">季數</label>
                      <Input
                        value={editData.season || ''}
                        onChange={(e) => setEditData({ ...editData, season: e.target.value })}
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
                        value={editData.rating || 0}
                        onChange={(e) => setEditData({ ...editData, rating: parseFloat(e.target.value) || 0 })}
                        className="bg-background border-2 border-foreground text-foreground font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-muted-foreground uppercase">心得評論</label>
                      <Textarea
                        value={editData.review || ''}
                        onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                        className="bg-background border-2 border-foreground text-foreground font-bold min-h-24"
                      />
                    </div>
                    <button onClick={handleSaveEdit} className="bauhaus-button-primary w-full">
                      保存更改
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <button
                onClick={handleDelete}
                className="bauhaus-button-secondary flex-1 border-destructive text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2 inline" />
                刪除
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
