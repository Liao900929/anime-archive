import { Link } from 'wouter';
import Header from '@/components/Header';
import MouseFollower from '@/components/MouseFollower';

interface Tool {
  name: string;
  tag: string;
  description: string;
}

interface Department {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  tools: Tool[];
  highlight?: string;
  highlightSource?: string;
  note?: string;
  coreSkills?: string[];
  otherSkills?: string[];
  flow?: string[];
}

const departments: Department[] = [
  {
    id: 1,
    tag: 'TRANSLATION',
    title: '翻譯部',
    subtitle: 'DEPT 01 · 翻譯與在地化',
    description: '不是丟給 GPT 直翻——而是分析、翻譯、校正、潤色，再做一次台灣化稽核。',
    tools: [
      {
        name: 'baoyu-translate',
        tag: '譯者',
        description:
          '四段式翻譯流程：分析 → 翻譯 → 校正 → 潤色。支援自訂詞彙表、可指定讀者是誰，產出貼近「正式出版級」的中文。',
      },
      {
        name: 'taiwan-traditional-chinese',
        tag: '在地校對',
        description:
          '460+ 筆台灣 vs 對岸術語對照稽核。自動把「組件→元件、數據→資料、伺服器、函式、陣列、回傳值、匯入、快取」全部改成台灣味。',
      },
    ],
    flow: ['英文原文', 'baoyu-translate', '台灣化稽核', '在地化正稿'],
  },
  {
    id: 2,
    tag: 'CONTENT',
    title: '內容創作部',
    subtitle: 'DEPT 02 · 內容創作 BAOYU 系列',
    description:
      '21 位員工，從抓資料、做圖、排版、到三平台發佈一條龍——這是宝玉分享的整套 workflow。',
    tools: [
      {
        name: 'baoyu-url-to-markdown',
        tag: '抓取',
        description: '任何網頁／推文 → 乾淨的 markdown',
      },
      {
        name: 'baoyu-youtube-transcript',
        tag: '抓取',
        description: 'YouTube 影片 → 逐字稿＋封面圖',
      },
      {
        name: 'baoyu-infographic',
        tag: '視覺',
        description: '21 種專業布局 × 22 視覺風格的資訊圖',
      },
      {
        name: 'baoyu-xhs-images',
        tag: '視覺',
        description: '社群圖卡系列（12 風格 × 8 布局）',
      },
      {
        name: 'baoyu-format-markdown',
        tag: '排版',
        description: '純文字 → 排版漂亮的 markdown',
      },
      {
        name: 'baoyu-post-to-x / wechat / weibo',
        tag: '發佈',
        description: '三大平台同步發文（含長文／圖文）',
      },
    ],
    note: '這六位只是代表。整個部門 21 個 skill，串起來就是一條從靈感到發文的產線。',
  },
  {
    id: 3,
    tag: 'DESIGN',
    title: '設計部',
    subtitle: 'DEPT 03 · 視覺設計',
    description:
      '寫網頁、做 UI、配色、字體配對——目標是不要做出一看就知道是 AI 寫的那種平庸感。',
    tools: [
      {
        name: 'frontend-design',
        tag: '設計總監',
        description:
          'Anthropic 官方 skill。強調「選一個 BOLD 美學方向」再寫程式——極簡或極繁都行，重點是有意圖、不是強度。',
      },
      {
        name: 'ui-ux-pro-max',
        tag: '資深設計師',
        description:
          '50+ 風格、161 配色、57 字體配對、161 產品類型、99 UX 準則、25 種圖表、10 個技術棧。',
      },
      {
        name: 'ckm-design 系列',
        tag: '設計團隊（6 人）',
        description:
          'brand / design-system / ui-styling / slides / banner-design / 整套品牌識別。Logo 55 風格、CIP 50 件交付、圖標 15 風格。',
      },
    ],
    highlight: '「Bold maximalism 和 refined minimalism 都行——關鍵是 intentionality，不是 intensity。」',
    highlightSource: '— FROM frontend-design SKILL.md',
  },
  {
    id: 4,
    tag: 'ENGINEERING',
    title: '工程部',
    subtitle: 'DEPT 04 · SUPERPOWERS TDD 框架',
    description:
      '14 位員工，整套是 obra/superpowers——每個 skill 對應寫程式流程的一個環節，串起來就是一個資深 SDE 的工作腦。',
    tools: [],
    coreSkills: [
      'brainstorming',
      'writing-plans',
      'test-driven-development',
      'systematic-debugging',
      'verification-before-completion',
    ],
    otherSkills: [
      'executing-plans',
      'subagent-driven-development',
      'dispatching-parallel-agents',
      'requesting-code-review',
      'receiving-code-review',
      'using-git-worktrees',
      'finishing-a-development-branch',
      'writing-skills',
      'using-superpowers',
    ],
    highlight: '「證據先於斷言。」\n宣稱完成前，必須跑驗證指令、確認輸出。',
    highlightSource: '— FROM verification-before-completion SKILL.md',
  },
  {
    id: 5,
    tag: 'META',
    title: '行政部',
    subtitle: 'DEPT 05 · 工作流元工具',
    description: '公司裡負責管理其他員工的人——找 skill、建 skill、發版、調度——讓整個系統能自己擴張。',
    tools: [
      {
        name: 'find-skills',
        tag: '人資招募',
        description: '透過 npx skills find 搜尋全球 skill 生態系，一行指令安裝到公司。',
      },
      {
        name: 'skill-creator',
        tag: '訓練主管',
        description: 'Anthropic 官方建 skill 工具，含 eval 評測、效能基準、自動優化 description 觸發精準度。',
      },
      {
        name: 'gstack-workflow-assistant',
        tag: '專案經理',
        description:
          '一整套 AI 工作流團隊：CEO 審查、工程規劃、code review、shipping、QA 測試、瀏覽器自動化。',
      },
    ],
    highlight: '工具會用工具找工具——這才是真正的 leverage。',
    highlightSource: '— OBSERVATION',
  },
];

const tagColors: Record<string, string> = {
  TRANSLATION: 'bg-blue-600 text-white',
  CONTENT: 'bg-accent text-background',
  DESIGN: 'bg-primary text-background',
  ENGINEERING: 'bg-foreground text-background',
  META: 'bg-blue-600 text-white',
};

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MouseFollower />
      <Header />

      <main className="container mx-auto py-16">
        {/* Page title */}
        <div className="mb-16">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-2">
            Team Structure
          </p>
          <h2 className="display-text text-foreground leading-none mb-4">DEPTS</h2>
          <p className="text-lg text-muted-foreground font-bold max-w-xl">
            五個部門、各司其職——翻譯、創作、設計、工程、行政，串起一套完整的 AI 工作流。
          </p>
        </div>

        {/* Department cards */}
        <div className="space-y-16">
          {departments.map((dept) => (
            <section key={dept.id} className="border-2 border-foreground bg-card">
              {/* Dept header */}
              <div className="border-b-2 border-foreground p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black tracking-widest text-muted-foreground">
                    {dept.subtitle}
                  </span>
                </div>
                <span
                  className={`text-xs font-black tracking-widest px-3 py-1 ${tagColors[dept.tag] ?? 'bg-foreground text-background'}`}
                >
                  {dept.tag}
                </span>
              </div>

              <div className="p-6 space-y-8">
                {/* Dept title + description */}
                <div>
                  <h3 className="display-text-lg text-foreground leading-tight mb-3">
                    {dept.title}
                  </h3>
                  <p className="text-muted-foreground font-bold text-lg leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                {/* Tools list */}
                {dept.tools.length > 0 && (
                  <div className="space-y-3">
                    {dept.tools.map((tool) => (
                      <div key={tool.name} className="border border-foreground/30 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-black text-foreground font-mono">{tool.name}</span>
                          <span className="text-xs font-bold border border-foreground/50 px-2 py-0.5 text-muted-foreground">
                            {tool.tag}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Engineering dept skill pills */}
                {dept.coreSkills && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {dept.coreSkills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-primary text-background px-3 py-2 text-sm font-black font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dept.otherSkills?.map((skill) => (
                        <span
                          key={skill}
                          className="border-2 border-foreground/50 text-foreground px-3 py-2 text-sm font-bold font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Translation flow */}
                {dept.flow && (
                  <div className="border-2 border-foreground/20 p-4 bg-background">
                    <div className="flex flex-wrap items-center gap-2">
                      {dept.flow.map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          <span
                            className={`px-3 py-2 text-sm font-black ${
                              i === dept.flow!.length - 1
                                ? 'bg-primary text-background'
                                : 'border-2 border-foreground text-foreground'
                            }`}
                          >
                            {step}
                          </span>
                          {i < dept.flow!.length - 1 && (
                            <span className="text-muted-foreground font-bold">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content dept note */}
                {dept.note && (
                  <div className="border-l-4 border-primary pl-4">
                    <p className="text-sm font-bold text-muted-foreground">{dept.note}</p>
                  </div>
                )}

                {/* Highlight quote */}
                {dept.highlight && (
                  <div className="border-l-4 border-primary pl-4">
                    <p className="font-bold text-foreground whitespace-pre-line">{dept.highlight}</p>
                    {dept.highlightSource && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {dept.highlightSource}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Back to home */}
        <div className="mt-16">
          <Link href="/">
            <button className="bauhaus-button-secondary">← 返回主頁</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
