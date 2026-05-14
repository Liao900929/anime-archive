import { AnimeEntry } from '@/lib/types';
import { useState } from 'react';

/**
 * 動畫卡片組件 - 包浩斯風格
 * 幾何評分、邊框強調、懸停偏移效果
 */
interface AnimeCardProps {
  entry: AnimeEntry;
}

export default function AnimeCard({ entry }: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasRating = entry.rating > 0;
  const hasReview = entry.review.trim().length > 0;

  // 用幾何色塊表示評分
  const renderRatingBlocks = () => {
    const fullBlocks = Math.floor(entry.rating);
    const hasHalfBlock = entry.rating % 1 !== 0;
    const emptyBlocks = 10 - fullBlocks - (hasHalfBlock ? 1 : 0);

    return (
      <div className="flex flex-wrap gap-1">
        {[...Array(fullBlocks)].map((_, i) => (
          <div key={`full-${i}`} className="rating-block rating-block-filled"></div>
        ))}
        {hasHalfBlock && (
          <div key="half" className="rating-block bg-primary opacity-50"></div>
        )}
        {[...Array(emptyBlocks)].map((_, i) => (
          <div key={`empty-${i}`} className="rating-block rating-block-empty"></div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="bauhaus-card group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translate(-6px, -6px)' : 'translate(0, 0)',
        boxShadow: isHovered ? '12px 12px 0 rgba(230, 57, 70, 0.4)' : 'none',
      }}
    >
      {/* 背景色塊 */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{ backgroundColor: '#F4D35E' }}
      ></div>

      <div className="bauhaus-card-inner space-y-3">
        {/* 標題 */}
        <div>
          <h3 className="font-black text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {entry.title}
          </h3>
          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            {entry.series}
          </p>
        </div>

        {/* 季數和日期 */}
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>{entry.season || '未標記'}</span>
          <span>{entry.date}</span>
        </div>

        {/* 評分 - 幾何色塊 */}
        {hasRating && (
          <div className="space-y-2">
            {renderRatingBlocks()}
            <p className="text-sm font-black text-accent">{entry.rating}/10</p>
          </div>
        )}

        {/* 心得預覽 */}
        {hasReview && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">
            {entry.review}
          </p>
        )}

        {/* 狀態指示 */}
        {!hasRating && !hasReview && (
          <p className="text-xs text-muted-foreground italic font-medium">未添加評論</p>
        )}
      </div>
    </div>
  );
}
