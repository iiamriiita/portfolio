import { useState, useEffect, createContext, useContext } from "react";

// ---- 你的資料：之後改這裡就好 ----
const DEV = {
  name: "你的名字",
  role: "UX Design Engineer",
  based: "Taiwan",
  stack: ["React", "TypeScript", "Node"],
  skills: {
    frontend: "React, TypeScript, Tailwind",
    backend: "Node, Express, PostgreSQL",
    tooling: "Git, Docker, Vite",
  },
};

const PROJECTS = [
  {
    id: "team-retro",
    file: "team-retro.pj",
    name: "Team Retro－給小組的團隊回饋 AI 工具",
    en: "Team Retro (AI product)",
    emoji: "💬",
    img: "/team-retro-banner.png",
    video: "", // ← 貼 YouTube 網址（例如 "https://www.youtube.com/watch?v=xxxx"），留空不顯示
    grad: "linear-gradient(135deg,var(--thumb-a),var(--thumb-b))",
    tags: ["Next.js", "TypeScript", "Supabase", "Gemini"],
    short: "給 2–5 人小組的匿名回饋工具，AI 即時把關讓回饋更建設性。",
    detail:
      "讓小組成員互相給回饋（agile retro 形式）。填寫時採兩段式把關：關鍵字黑名單先擋明顯的人身攻擊，再用 LLM 判斷是否具建設性並給出更友善的改寫建議；服務中斷時自動降級、不擋使用者。全部完成後，系統彙整去識別化的結果，並用 AI 產生主題／優點／改進方向的摘要。以 Next.js App Router + Supabase（Postgres + RLS + Realtime）打造。",
    role: "獨立開發 · 前後端",
    link: "github.com/iiamriiita/retro",
  },
  {
    id: "catch-butterfly",
    file: "butterfly.pj",
    name: "抓蝴蝶－為手指復健者增添樂趣",
    en: "Butterfly Catch Game",
    emoji: "🦋",
    img: "/butterfly-banner.png",
    video: "",
    grad: "linear-gradient(135deg,var(--thumb-a),var(--thumb-b))",
    // TODO: 以下為草稿，待你補正確資訊
    tags: ["React", "Canvas"],
    short: "把手指復健變成小遊戲，讓復健過程多一點樂趣。",
    detail:
      "為手指復健者設計的互動遊戲：用抓蝴蝶的動作引導手指運動，邊玩邊練、降低復健的枯燥感。（實作細節待補）",
    role: "（待補）",
    link: "github.com/iiamriiita",
  },
  {
    id: "music-viz",
    file: "music-viz.pj",
    name: "音樂視覺化動畫",
    en: "Music Visualization",
    emoji: "🎵",
    video: "https://vimeo.com/1207676729",
    grad: "linear-gradient(135deg,var(--thumb-a),var(--thumb-b))",
    // TODO: 以下為草稿，待你補正確資訊
    tags: ["Web Audio API", "Canvas"],
    short: "隨音樂即時生成的視覺化動畫。",
    detail:
      "分析音訊並即時繪製對應的視覺化動畫，讓聲音變成畫面。（技術與細節待補）",
    role: "（待補）",
    link: "github.com/iiamriiita",
  },
];

// ---- 之後把你的設計作品集網址貼進來（例如 "https://www.behance.net/yourname"）----
const DESIGN_PORTFOLIO_URL = "";

// ---- 語法高亮小工具 ----
const T = {
  kw: { color: "var(--syn-kw)" }, str: { color: "var(--syn-str)" }, fn: { color: "var(--syn-fn)" },
  num: { color: "var(--syn-num)" }, cmt: { color: "var(--text-dim)", fontStyle: "italic" },
  prop: { color: "var(--text-dim)" }, txt: { color: "var(--text)" },
  dim: { color: "var(--text-dim)" }, // 不重要的字（屬性名、標點）
  hero: { color: "var(--text-bright)", fontStyle: "italic", fontSize: 20, fontWeight: 700 }, // 開頭打招呼那行
};

// ---- 單色主題 icon（跟文字同色）----
function SunIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
    </svg>
  );
}
function MoonIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// ---- 影片網址 → 內嵌來源（支援 YouTube / Vimeo / 直接 mp4）----
function videoEmbed(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return { type: "video", src: url };
  return { type: "iframe", src: url }; // 其他嵌入網址直接用
}

// ---- 響應式：偵測手機寬度 ----
const UI = createContext({ isMobile: false });

function useMediaQuery(query) {
  const [match, setMatch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return match;
}

export default function Portfolio() {
  const [openFile, setOpenFile] = useState("projects");
  const [tabs, setTabs] = useState(["projects", "about"]);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false); // 手機側邊抽屜
  const [theme, setTheme] = useState(() => {
    // 記住使用者選過的；沒選過就跟系統，系統沒偏好預設亮色
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch { return "light"; }
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { /* ignore */ }
  }, [theme]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const openTab = (id) => {
    setOpenFile(id);
    if (!tabs.includes(id)) setTabs([...tabs, id]);
    if (isMobile) setDrawerOpen(false); // 手機點檔案後收起抽屜
  };
  const closeTab = (id, e) => {
    e.stopPropagation();
    const next = tabs.filter((t) => t !== id);
    setTabs(next);
    if (openFile === id && next.length) setOpenFile(next[next.length - 1]);
  };
  const openDesignPortfolio = () => {
    if (DESIGN_PORTFOLIO_URL) window.open(DESIGN_PORTFOLIO_URL, "_blank", "noreferrer");
    if (isMobile) setDrawerOpen(false);
  };

  const isProj = PROJECTS.some((p) => p.id === openFile);

  const appStyle = isMobile
    ? { ...S.app, display: "flex", flexDirection: "column", gridTemplateColumns: undefined }
    : S.app;

  const sideStyle = isMobile
    ? {
        ...S.side,
        position: "fixed",
        zIndex: 50,
        top: 0,
        left: 0,
        height: "100dvh",
        width: 250,
        transform: drawerOpen ? "translateX(0)" : "translateX(-105%)",
        transition: "transform .22s ease",
        boxShadow: drawerOpen ? "0 0 40px #000a" : "none",
        pointerEvents: drawerOpen ? "auto" : "none", // 關閉時不攔截點擊，保留滑出動畫
      }
    : S.side;

  const isAbout = openFile === "about";

  // 內容區：桌面雙欄（about、作品頁單欄）；手機一律單欄堆疊並整塊捲動
  const splitStyle = isMobile
    ? { ...S.split, display: "flex", flexDirection: "column", overflowY: "auto" }
    : { ...S.split, gridTemplateColumns: isProj || isAbout ? "1fr" : "1fr 2fr" };

  return (
    <UI.Provider value={{ isMobile }}>
      <div style={appStyle}>
        {/* ---- 手機頂部列 ---- */}
        {isMobile && (
          <div style={S.mtop}>
            <button
              aria-label="開啟檔案總管"
              style={S.mBurger}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              ☰
            </button>
            <span style={S.mTitle}>
              YING CI<span className="brandCursor">_</span>
            </span>
            <span style={S.mFile}>{fileNameOf(openFile)}</span>
          </div>
        )}

        {/* ---- 手機抽屜背景遮罩 ---- */}
        {isMobile && drawerOpen && (
          <div style={S.backdrop} onClick={() => setDrawerOpen(false)} />
        )}

        {/* ---- Explorer ---- */}
        <aside style={sideStyle}>
          <div style={S.root}>
            YING CI<span className="brandCursor">_</span>
          </div>
          {/* 點資料夾名稱 → 開首頁專案頁；點三角形 → 展開/收合 */}
          <div
            onClick={() => openTab("projects")}
            style={{
              ...S.folder,
              background: openFile === "projects" ? "var(--bg-active)" : "transparent",
              borderLeft: openFile === "projects" ? "2px solid var(--border-strong)" : "2px solid transparent",
            }}
            onMouseEnter={(e) => openFile !== "projects" && (e.currentTarget.style.background = "var(--hover)")}
            onMouseLeave={(e) => openFile !== "projects" && (e.currentTarget.style.background = "transparent")}
          >
            <span
              style={{ color: "var(--text-dim)", cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); setFoldersOpen((v) => !v); }}
            >
              {foldersOpen ? "▾" : "▸"}
            </span>
            📂 projects
          </div>
          {foldersOpen &&
            PROJECTS.map((p) => (
              <FileRow key={p.id} label={p.file} sub active={openFile === p.id} onClick={() => openTab(p.id)} />
            ))}
          <FileRow icon="📄" label="about" active={openFile === "about"} onClick={() => openTab("about")} />

          {/* 外部連結：設計作品集（之後會導到另一個網站） */}
          <div
            onClick={openDesignPortfolio}
            title={DESIGN_PORTFOLIO_URL || "之後會加上連結"}
            style={{ ...S.file, paddingLeft: 30, whiteSpace: "nowrap", borderLeft: "2px solid transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            🎨 Design portfolio
            <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>↗</span>
          </div>

        </aside>

        {/* ---- Main ---- */}
        <div style={S.main}>
          {/* tabs */}
          <div style={S.tabbar}>
            <div style={S.tabScroll}>
              {tabs.map((id) => (
                <div key={id} style={{ ...S.tab, ...(openFile === id ? S.tabActive : {}) }} onClick={() => setOpenFile(id)}>
                  <span>{fileNameOf(id)}</span>
                  <span style={S.close} onClick={(e) => closeTab(id, e)}>×</span>
                </div>
              ))}
            </div>

            {/* 右上角：主題下拉選單 */}
            <div style={S.themeWrap}>
              <button
                aria-label="選擇主題"
                onClick={() => setThemeMenuOpen((v) => !v)}
                style={S.themeBtn}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                {theme === "dark" ? "Dark" : "Light"}
                <span style={{ color: "var(--text-dim)", fontSize: 10 }}>▾</span>
              </button>
              {themeMenuOpen && (
                <>
                  <div style={S.menuBackdrop} onClick={() => setThemeMenuOpen(false)} />
                  <div style={S.themeMenu}>
                    {[
                      { id: "dark", Icon: MoonIcon, label: "Dark" },
                      { id: "light", Icon: SunIcon, label: "Light" },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => { setTheme(opt.id); setThemeMenuOpen(false); }}
                        style={{ ...S.themeItem, ...(theme === opt.id ? S.themeItemActive : {}) }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = theme === opt.id ? "var(--bg-active)" : "transparent")}
                      >
                        <opt.Icon />
                        <span>{opt.label}</span>
                        {theme === opt.id && <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* content：作品→展示頁；code 頁→左程式右精選作品 */}
          <div style={splitStyle}>
            {isProj ? (
              <ProjectShowcase p={PROJECTS.find((p) => p.id === openFile)} onOpen={openTab} />
            ) : (
              <>
                <div style={{ ...S.codePane, ...(isMobile ? S.codePaneM : {}), ...(isAbout && !isMobile ? { borderRight: "none" } : {}) }}>
                  <CodeView id={openFile} />
                </div>
                {!isAbout && (
                  <div style={{ ...S.preview, ...(isMobile ? S.paneM : {}) }}>
                    <div style={S.phead}>◎ 精選作品</div>
                    {PROJECTS.map((p) => (
                      <PCard key={p.id} p={p} onClick={() => openTab(p.id)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </UI.Provider>
  );
}

function FileRow({ icon, label, sub, active, onClick }) {
  const [dot, ext] = splitExt(label);
  return (
    <div
      onClick={onClick}
      style={{
        ...S.file,
        paddingLeft: sub ? 44 : 30,
        background: active ? "var(--bg-active)" : "transparent",
        borderLeft: active ? "2px solid var(--border-strong)" : "2px solid transparent",
      }}
      onMouseEnter={(e) => !active && (e.currentTarget.style.background = "var(--hover)")}
      onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
    >
      {icon ? `${icon} ` : ""}{dot}<span style={{ color: "var(--text-dim)" }}>{ext}</span>
    </div>
  );
}

function CodeView({ id }) {
  if (id === "about") return <AboutCode />;
  return <ProjectsIndex />;
}

function Line({ n, children }) {
  return (
    <div style={S.line}>
      <span style={S.gutter}>{n}</span>
      <span style={S.lineTxt}>{children}</span>
    </div>
  );
}

function ProjectsIndex() {
  return (
    <>
      <Line n={1}><span style={T.hero}>// Hi, I'm YING CI 👋</span></Line>
      <Line n={2}> </Line>
      <Line n={3}>
        <span style={T.kw}>const</span> <span style={T.fn}>role</span><span style={T.dim}> = </span>
        <span style={T.str}>"UX Design Engineer"</span><span style={T.dim}>;</span>
      </Line>
      <Line n={4}>
        <span style={T.kw}>const</span> <span style={T.fn}>motto</span><span style={T.dim}> = </span>
        <span style={T.str}>"把想法變成可以互動的東西"</span><span style={T.dim}>;</span>
      </Line>
      <Line n={5}> </Line>
      <Line n={6}>
        <span style={T.kw}>export const</span> <span style={T.fn}>projects</span><span style={T.dim}> = [</span>
      </Line>
      {PROJECTS.map((p, i) => (
        <Line n={7 + i} key={p.id}>
          <span style={T.dim}>{"  { name: "}</span>
          <span style={T.str}>"{p.en}"</span>
          <span style={T.dim}>{" },"}</span>
        </Line>
      ))}
      <Line n={7 + PROJECTS.length}><span style={T.dim}>];</span></Line>
    </>
  );
}

function ProjectShowcase({ p, onOpen }) {
  const { isMobile } = useContext(UI);
  const others = PROJECTS.filter((x) => x.id !== p.id);
  return (
    <div style={{ ...S.showcase, ...(isMobile ? S.showcaseM : {}), position: "relative" }}>
      {/* 回專案列表 */}
      <button
        onClick={() => onOpen("projects")}
        style={{ ...S.backBtn, ...(isMobile ? S.backBtnM : {}) }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-bright)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-mid)"; e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        ← projects
      </button>
      <div style={S.showInner}>
        {/* 大視覺：有真實截圖用截圖，否則 emoji 佔位 */}
        {p.img ? (
          <img src={p.img} alt={p.name} style={{ ...S.hero, ...(isMobile ? S.heroM : {}), width: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ ...S.hero, ...(isMobile ? S.heroM : {}), background: p.grad }}>
            <span style={{ fontSize: isMobile ? 52 : 72 }}>{p.emoji}</span>
          </div>
        )}
        <div style={S.showRole}>{p.role}</div>
        <h1 style={{ ...S.showTitle, ...(isMobile ? S.showTitleM : {}) }}>{p.name}</h1>
        <p style={{ ...S.showDesc, ...(isMobile ? S.showDescM : {}) }}>{p.detail}</p>
        <div style={S.stRow}>{p.tags.map((t) => (<span key={t} style={S.stBig}>{t}</span>))}</div>
        <a href={"https://" + p.link} target="_blank" rel="noreferrer" style={S.showLink}>↗ {p.link}</a>

        {/* Demo 影片（有填 video 才顯示） */}
        {videoEmbed(p.video) && (
          <div style={S.demoRow}>
            <div style={S.moreLabel}>Demo</div>
            {videoEmbed(p.video).type === "video" ? (
              <video src={videoEmbed(p.video).src} controls style={S.demoFrame} />
            ) : (
              <iframe
                src={videoEmbed(p.video).src}
                title={`${p.name} demo`}
                style={S.demoFrame}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        )}

        <div style={S.moreRow}>
          <div style={S.moreLabel}>其他作品</div>
          {others.map((o) => (
            <button key={o.id} style={S.moreItem} onClick={() => onOpen(o.id)}>
              <span style={{ fontSize: 20 }}>{o.emoji}</span>
              <span>{o.name}</span>
              <span style={{ color: "var(--text-dim)", marginLeft: "auto" }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutCode() {
  const sk = Object.entries(DEV.skills);
  return (
    <>
      <Line n={1}><span style={T.hero}>// about me 🙋‍♀️</span></Line>
      <Line n={2}> </Line>
      <Line n={3}><span style={T.kw}>const</span> <span style={T.fn}>developer</span> = {"{"}</Line>
      <Line n={4}>{"  "}<span style={T.prop}>name</span>: <span style={T.str}>"{DEV.name}"</span>,</Line>
      <Line n={5}>{"  "}<span style={T.prop}>role</span>: <span style={T.str}>"{DEV.role}"</span>,</Line>
      <Line n={6}>{"  "}<span style={T.prop}>based</span>: <span style={T.str}>"{DEV.based}"</span>,</Line>
      <Line n={7}>{"  "}<span style={T.prop}>coffee</span>: <span style={T.num}>Infinity</span>,</Line>
      <Line n={8}>{"  "}<span style={T.prop}>skills</span>: {"{"}</Line>
      {sk.map(([k, v], i) => (
        <Line n={9 + i} key={k}>{"    "}<span style={T.prop}>{k}</span>: <span style={T.str}>"{v}"</span>,</Line>
      ))}
      <Line n={9 + sk.length}>{"  "}{"}"},</Line>
      <Line n={10 + sk.length}>{"}"};</Line>
      <Line n={11 + sk.length}> </Line>
      <Line n={12 + sk.length}><span style={T.cmt}>/* 熱愛把想法變成可以互動的東西，目前正在找機會。 */</span></Line>
      <Line n={13 + sk.length}><span style={T.kw}>export default</span> <span style={T.fn}>developer</span>;</Line>
    </>
  );
}

function PCard({ p, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...S.pcard, transform: hover ? "translateY(-3px)" : "none", borderColor: hover ? "var(--border-strong)" : "var(--border)" }}
    >
      {p.img ? (
        <img src={p.img} alt={p.name} style={{ ...S.thumb, width: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ ...S.thumb, background: p.grad }}>{p.emoji}</div>
      )}
      <div style={{ padding: "13px 16px 15px" }}>
        <h4 style={S.pcardH}>{p.name}</h4>
        <p style={S.pcardP}>{p.short}</p>
        <div style={S.stRow}>{p.tags.map((t) => (<span key={t} style={S.st}>{t}</span>))}</div>
      </div>
    </div>
  );
}

// helpers
function splitExt(label) { const i = label.lastIndexOf("."); return i < 0 ? [label, ""] : [label.slice(0, i), label.slice(i)]; }
function fileNameOf(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (p) return p.file;
  return { projects: "projects", about: "about" }[id] || id;
}

// ---- styles ----
const mono = "'SF Mono','JetBrains Mono','Fira Code',Consolas,monospace";
// 長文用一般字體，比 mono 好讀（介面元素維持 mono 保留編輯器氛圍）
const sans = "-apple-system,'Segoe UI','Noto Sans TC','PingFang TC','Microsoft JhengHei',Roboto,sans-serif";
const S = {
  app: { display: "grid", gridTemplateColumns: "220px 1fr", height: "100dvh", fontFamily: mono, background: "var(--bg)", color: "var(--text)", fontSize: 14 },
  side: { background: "var(--bg-side)", borderRight: "1px solid var(--border)", overflowY: "auto", padding: "8px 0" },
  root: { fontSize: 18, fontWeight: 700, color: "var(--text-bright)", letterSpacing: ".22em", padding: "16px 14px 12px", userSelect: "none" },
  sideTitle: { fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em", padding: "8px 14px" },
  folder: { fontSize: 14, color: "var(--text)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" },
  file: { display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", fontSize: 14, color: "var(--text)", cursor: "pointer" },
  main: { display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, flex: 1 },
  tabbar: { display: "flex", alignItems: "stretch", background: "var(--bg-side)", borderBottom: "1px solid var(--border)", flexShrink: 0 },
  tabScroll: { display: "flex", overflowX: "auto", flex: 1, minWidth: 0 },
  tab: { padding: "12px 14px 12px 18px", fontSize: 14, color: "var(--text-dim)", borderRight: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" },
  tabActive: { color: "var(--text)", background: "var(--bg)", borderTop: "2px solid var(--border-strong)" },
  themeWrap: { position: "relative", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 10px" },
  themeBtn: { display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--border)", color: "var(--text-mid)", fontFamily: mono, fontSize: 13, padding: "6px 12px", cursor: "pointer", borderRadius: 6, lineHeight: 1, whiteSpace: "nowrap" },
  menuBackdrop: { position: "fixed", inset: 0, zIndex: 60 },
  themeMenu: { position: "absolute", top: "calc(100% - 4px)", right: 10, zIndex: 61, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 4, minWidth: 130, boxShadow: "0 8px 24px #0006" },
  themeItem: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, fontFamily: mono, color: "var(--text)", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" },
  themeItemActive: { background: "var(--bg-active)" },
  close: { color: "var(--text-dim)", fontSize: 15, lineHeight: 1 },
  split: { display: "grid", flex: 1, overflow: "hidden", minHeight: 0 },
  codePane: { overflowY: "auto", padding: "14px 0", background: "var(--bg)", borderRight: "1px solid var(--border)", lineHeight: 1.75 },
  line: { display: "flex", whiteSpace: "pre-wrap" },
  gutter: { textAlign: "right", color: "var(--border)", padding: "0 12px", minWidth: 40, userSelect: "none" },
  lineTxt: { paddingRight: 16 },
  preview: { overflowY: "auto", background: "var(--bg-preview)", padding: 16 },
  phead: { fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 },
  pcard: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 14, cursor: "pointer", transition: "transform .18s, border-color .18s" },
  thumb: { height: 185, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 },
  pcardH: { fontSize: 15.5, color: "var(--text-bright)", marginBottom: 4, fontFamily: sans, fontWeight: 700 },
  pcardP: { fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.6, fontFamily: sans },
  stRow: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" },
  st: { fontSize: 11.5, background: "var(--bg)", color: "var(--text-mid)", padding: "2px 8px", borderRadius: 12 },
  detail: { color: "var(--text)" },
  backBtn: { position: "absolute", top: 28, left: 24, background: "none", border: "1px solid var(--border)", color: "var(--text-mid)", fontFamily: mono, fontSize: 13, padding: "6px 12px", borderRadius: 6, cursor: "pointer", transition: "color .15s, border-color .15s" },
  backBtnM: { position: "static", display: "inline-block", marginBottom: 16 },
  detailH: { fontSize: 18, marginTop: 14, marginBottom: 4 },
  detailRole: { fontSize: 12, color: "var(--syn-prop)", marginBottom: 10 },
  detailP: { fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 12 },
  link: { display: "inline-block", marginTop: 14, color: "var(--syn-fn)", fontSize: 13, textDecoration: "none" },
  showcase: { overflowY: "auto", background: "var(--bg)", padding: "32px 24px" },
  showInner: { maxWidth: 620, margin: "0 auto" },
  hero: { height: 220, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid var(--border)" },
  showRole: { fontSize: 14, color: "var(--text-mid)", marginBottom: 6, fontFamily: sans },
  showTitle: { fontSize: 30, fontWeight: 700, color: "var(--text-bright)", letterSpacing: "-.01em", marginBottom: 14, lineHeight: 1.3, fontFamily: sans },
  showDesc: { fontSize: 16, color: "var(--text-soft)", lineHeight: 1.9, marginBottom: 18, fontFamily: sans },
  stBig: { fontSize: 13, background: "var(--bg-card)", color: "var(--text-mid)", padding: "5px 12px", borderRadius: 14, border: "1px solid var(--border)" },
  showLink: { display: "inline-block", marginTop: 20, color: "var(--link)", fontSize: 14, textDecoration: "none", borderBottom: "1px solid var(--link-underline)", paddingBottom: 2 },
  demoRow: { marginTop: 32 },
  demoFrame: { width: "100%", aspectRatio: "16 / 9", border: "1px solid var(--border)", borderRadius: 14, display: "block", background: "#000" },
  moreRow: { marginTop: 44, paddingTop: 24, borderTop: "1px solid var(--hover)" },
  moreLabel: { fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 },
  moreItem: { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", marginBottom: 8, color: "var(--text)", fontFamily: mono, fontSize: 14, cursor: "pointer" },

  // ---- 手機頂部列 / 抽屜 ----
  mtop: { display: "flex", alignItems: "center", gap: 10, background: "var(--bg-side)", borderBottom: "1px solid var(--border)", padding: "8px 12px", flexShrink: 0 },
  mBurger: { background: "none", border: "none", color: "var(--text)", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: "2px 4px" },
  mTitle: { fontSize: 14, fontWeight: 700, color: "var(--text-bright)", letterSpacing: ".18em", userSelect: "none" },
  mFile: { fontSize: 12, color: "var(--link)", marginLeft: "auto", maxWidth: "45%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  backdrop: { position: "fixed", inset: 0, background: "#000a", zIndex: 40 },

  // ---- 手機版樣式覆寫 ----
  paneM: { overflowY: "visible", flexShrink: 0 },
  codePaneM: { overflowY: "visible", borderRight: "none", borderBottom: "1px solid var(--border)", flexShrink: 0, fontSize: 13 },
  showcaseM: { overflowY: "visible", padding: "22px 16px", flex: 1 },
  heroM: { height: 150, marginBottom: 18 },
  showTitleM: { fontSize: 23, marginBottom: 10 },
  showDescM: { fontSize: 14, lineHeight: 1.7, marginBottom: 14 },
};
