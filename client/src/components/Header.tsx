import { Link } from 'wouter';

export default function Header() {
  return (
    <header className="bg-background border-b-4 border-foreground relative overflow-hidden">
      {/* 背景幾何形狀 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 transform rotate-45"></div>
      <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-accent opacity-10 rounded-full"></div>

      <div className="container mx-auto py-12 relative z-10">
        <Link href="/">
          <div className="cursor-pointer hover:opacity-80 transition-opacity">
            {/* Logo - 幾何形狀 */}
            <div className="flex items-end gap-2 mb-4">
              <div className="w-8 h-8 bg-primary"></div>
              <div className="w-8 h-8 rounded-full bg-accent"></div>
              <div className="w-8 h-8 bg-blue-600" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
            </div>

            {/* 大字體標題 */}
            <div className="space-y-2">
              <h1 className="display-text-lg text-foreground leading-tight">
                ANIME<br />
                <span className="text-primary">ARCHIVE</span>
              </h1>
              <p className="text-sm font-bold tracking-widest text-muted-foreground">
                主公大大・個人觀影紀錄
              </p>
            </div>
          </div>
        </Link>

        {/* 右上角 VOL. 標籤 + 部門導覽 */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <Link href="/departments">
            <button className="border-2 border-foreground text-foreground px-4 py-2 font-black text-sm hover:bg-foreground hover:text-background transition-colors">
              DEPTS
            </button>
          </Link>
          <div className="border-2 border-accent bg-accent text-background px-4 py-2 font-black text-lg">
            VOL. 01
          </div>
        </div>
      </div>
    </header>
  );
}
