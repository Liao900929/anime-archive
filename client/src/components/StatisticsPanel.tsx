import { Statistics } from '@/lib/types';

/**
 * 統計面板組件 - 包浩斯風格
 * 超大字體當設計元素、幾何形狀、不規則排版
 */
interface StatisticsPanelProps {
  stats: Statistics;
}

export default function StatisticsPanel({ stats }: StatisticsPanelProps) {
  return (
    <div className="space-y-12 mb-16">
      {/* 第一行：作品總數 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-2">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">TOTAL</p>
          <p className="text-xs text-muted-foreground">作品總數</p>
          <div className="display-text-lg text-primary leading-none">
            {stats.totalAnimes}
          </div>
        </div>
        {/* 裝飾幾何形狀 */}
        <div className="flex justify-end gap-4">
          <div className="w-24 h-24 bg-primary opacity-20"></div>
          <div className="w-24 h-24 bg-accent opacity-20 rounded-full"></div>
        </div>
      </div>

      {/* 分隔線 */}
      <div className="h-1 bg-foreground"></div>

      {/* 第二行：平均評分 + 已評分 */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">AVG</p>
          <p className="text-xs text-muted-foreground">平均評分</p>
          <div className="display-text text-accent leading-none">
            {stats.averageRating.toFixed(1)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">RATED</p>
          <p className="text-xs text-muted-foreground">已評分</p>
          <div className="display-text text-blue-500 leading-none">
            {stats.ratedCount}
          </div>
        </div>
      </div>

      {/* 分隔線 */}
      <div className="h-1 bg-foreground"></div>

      {/* 第三行：滿分作品 */}
      <div className="space-y-2">
        <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">10/10</p>
        <p className="text-xs text-muted-foreground">滿分神作</p>
        <div className="display-text text-white leading-none">
          {stats.perfectScoreCount}
        </div>
      </div>
    </div>
  );
}
