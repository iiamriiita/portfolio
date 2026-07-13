import { useState, useEffect, createContext, useContext } from "react";

// ---- 你的資料：之後改這裡就好 ----
const DEV = {
  name: "Ying Ci Luo",
  role: "UX Design Engineer · AI-assisted Programmer",
  based: "Taiwan",
  skills: {
    frontend: "HTML, CSS, JavaScript",
    backend: "Supabase (PostgreSQL / RLS), REST API, Python",
    creative: "p5.js, Canvas API, Web Audio, MediaPipe",
    aiCollab: "Gemini API, prompt engineering, building with AI (Agentic Engineering)",
  },
};

const PROJECTS = [
  {
    id: "team-retro",
    file: "team-retro.pj",
    codeName: "Team Retro (AI product)",
    img: "/team-retro-banner.png",
    video: "https://vimeo.com/1209583153",
    demo: "https://retro-six-orcin.vercel.app/", // ← 線上 demo 網址，卡片右上角會出現「Try now ↗」按鈕；留空不顯示
    grad: "linear-gradient(135deg,var(--thumb-a),var(--thumb-b))",
    link: "github.com/iiamriiita/retro",
    zh: {
    name: "Team Retro：AI 團隊回顧平台",
    role: "獨立開發 · AI-assisted programming",
    tags: ["Next.js 15", "TypeScript", "Supabase", "Gemini API", "Prompt Engineering", "RLS", "i18n", "Tailwind CSS"],
    short: "用一條分享連結發起團隊回顧（Retrospective），AI 根據回答自動產出洞察與調整建議，支援逐句討論與跨場趨勢洞察。",
    detail:
      "一個全端 SaaS 網站。發起人選擇情境模板建立回顧，成員免登入填寫。截止後 AI 生成結構化報告，內容包含一句話總結、綠色亮點區、紅色待改善區與行動建議，每條結論都附上可點擊的來源標籤。發起人可開啟「逐句討論」讓團隊針對某句話留言。Dashboard 彙整多場回顧，用圖表與 AI 短評追蹤團隊健康度的走向。",
    sections: [
      {
        title: "動機",
        text: "團隊回顧常見兩個死法：當面講太尷尬，沒人說真話；線上表單收完沒人整理，回饋石沉大海。我想做一個「降低說真話成本」的工具，用匿名降低心理門檻、讓 AI 負責整理歸納，回顧的產出直接是可以行動的結論，而不是一堆散落的便利貼。",
      },
      {
        title: "核心功能",
        items: [
          "一條連結收回饋：成員免註冊填寫，支援匿名／具名、截止時間、心情評分。",
          "關鍵字黑名單先擋明顯的人身攻擊，再用 LLM 判斷是否具建設性並給出更友善的改寫建議。",
          "AI 結構化報告：總結＋亮點＋待改善＋AI 生成的調整建議，含來源追溯標籤。",
          "逐句討論：在別人的回答上圈選文字留言，像 Google Docs 的評論。",
          "跨場團隊洞察：參與率、討論熱度、心情趨勢圖表（純計算），搭配 AI 撰寫的近況短評。",
        ],
      },
      {
        title: "技術亮點",
        subs: [
          {
            title: "與 LLM 的結構化協作（本專案最花心思的部分）",
            text: "AI 報告不是「丟 prompt 拿文章」，而是用 Gemini 的 JSON mode + response schema 強制輸出結構。過程中踩過並解決了一系列 LLM 工程的實際問題：",
            items: [
              "逐條標註取代自由歸納：直接要求模型填「亮點陣列＋待改善陣列」時，flash 級模型會系統性地漏填其中一欄，甚至把「效率差」改寫成「效率很好」。最後改成要求模型逐條為每個回答貼標籤（{text, kind: \"well\"|\"improve\"}，enum 鎖死），綠紅兩欄由後端依標籤拆分，把「模型可以偷懶的欄位」變成「從標籤推導的結果」，漏填問題徹底消失。",
              "欄位生成順序控制：一句話總結偶爾會失控寫成長篇（thinking 模型的退化模式），把 token 預算耗盡導致後面的分類陣列變空。用 propertyOrdering 強制「分類先生成、總結最後」，再加上後端硬截斷（只保留第一句、長度上限），讓失控只影響它自己。",
              "來源可追溯（citation）：組 context 時為每條回答編號 [#N]，schema 要求模型回傳每個結論引用的編號；後端把編號解析回 answer id 與回覆者，前端渲染成小圓標籤，點擊平滑捲動到原始回答並高亮。具名場次顯示名字首字母，匿名場次只給編號。",
              "可靠性：503/500 指數退避重試、429 額度與各種錯誤的雙語友善訊息、code fence 剝除與最外層 JSON 擷取、關閉不必要的 thinking（thinkingBudget: 0）避免簡單任務被思考 token 吃掉輸出。",
            ],
          },
          {
            title: "權限模型（Supabase）",
            text: "資料庫全程開啟 Row-Level Security；瀏覽器端不直接碰資料庫，所有寫入走 Next.js Route Handlers，由伺服器端以 service role 執行並自行做授權檢查（發起人才能生成報告／改設定、結束前不得看結果）。免登入填寫靠 session 連結中的 UUID 授權，登入則用 Supabase Auth 的 Email OTP。",
          },
          {
            title: "逐句討論的錨定",
            text: "留言錨定到「某則回答的第幾到第幾個字元」，選取文字後浮出評論按鈕，儲存 quote 與 offset；渲染時把錨點區間轉成高亮標記，處理了選取範圍跨節點與重疊高亮的切分。",
          },
          {
            title: "無套件的 UX 細節",
            text: "自製全站頂部路由進度條（攔截站內連結點擊＋pathname 變化偵測，含 10 秒失效保護）、AI 生成中的階段動畫、圖表長條進場與數字 count-up、全站彈窗統一進場動效，全部原生 CSS/React 實作，零額外依賴，且都尊重 prefers-reduced-motion。插圖（首頁場景、空狀態帆船）為手刻 inline SVG，用設計 token 上色以跟主題一致。",
          },
          {
            title: "自製輕量 i18n",
            text: "Cookie 決定語系、扁平 key 加變數插值，伺服器與客戶端元件共用同一份字典；所有使用者可見文案（含 AI 的 prompt 與錯誤訊息）皆雙語。",
          },
        ],
      },
      {
        title: "挑戰與取捨",
        text: [
          "最大的挑戰是讓 LLM 的輸出穩定到可以當產品功能。同一個 prompt，模型十次有八次對、兩次錯，對 demo 夠用、對產品是災難。我的結論是：能用結構解決的就不要用措辭解決。把任務拆小（逐條分類 > 整體歸納）、用 schema 與 enum 收窄輸出空間、把驗證與兜底放在後端（截斷、預設值、來源解析失敗就靜默降級成無標籤），prompt 只負責語意判斷本身。過程中也學到用「生成順序」管理 token 預算這類非直覺的技巧。",
          "另一個取捨是匿名與可追溯的平衡：報告需要來源標籤才有說服力，但匿名場次不能洩露身份。最後設計成雙軌，標籤資料只存 answer id 與回覆者索引，名字首字母只在具名場次於生成當下寫入，匿名場次從頭到尾不查名字表。",
        ],
      },
      {
        title: "回顧",
        text: "這是我第一次以 AI 協作的方式完成完整產品。最大的收穫不是寫了多少程式，而是學會如何當一個好的「技術決策者」：把模糊的想法拆成 AI 能執行的明確任務、對每個產出追問「為什麼這樣寫」、在不同技術方案間做取捨。既有的程式基礎讓我能看懂 AI 的輸出、與它討論，並做出最好的決策。",
      },
      {
        title: "技術棧",
        tags: ["Next.js 15 (App Router / RSC)", "React 19", "TypeScript", "Tailwind CSS", "Supabase (PostgreSQL / RLS / Auth / Realtime)", "Google Gemini API (JSON mode / response schema)", "Prompt Engineering", "i18n", "Vercel"],
      },
    ],
    },
    en: {
      name: "Team Retro: AI Retrospective Platform",
      role: "Solo project · AI-assisted programming",
      tags: ["Next.js 15", "TypeScript", "Supabase", "Gemini API", "Prompt Engineering", "RLS", "i18n", "Tailwind CSS"],
      short: "Launch a team retrospective with one share link. AI turns the answers into insights and action suggestions, with per-sentence discussion and cross-session trend insights.",
      detail:
        "A full-stack SaaS website. The organizer picks a scenario template to create a retrospective; members fill it in without signing up. After the deadline, AI generates a structured report: a one-line summary, a green highlights section, a red to-improve section, and action suggestions. Every conclusion carries a clickable source tag. The organizer can turn on per-sentence discussion so the team can comment on any sentence. A dashboard aggregates multiple retrospectives, tracking team health over time with charts and short AI commentary.",
      sections: [
        {
          title: "Motivation",
          text: "Team retrospectives usually die one of two ways: face to face it's too awkward, so nobody tells the truth; online forms get collected but never organized, so the feedback sinks without a trace. I wanted a tool that lowers the cost of telling the truth. Anonymity lowers the psychological bar, AI does the organizing, and a retro's output becomes actionable conclusions instead of a pile of scattered sticky notes.",
        },
        {
          title: "Core Features",
          items: [
            "Collect feedback with one link: members answer without registering; supports anonymous / named modes, deadlines, and mood scores.",
            "A keyword blocklist filters obvious personal attacks first, then an LLM judges whether feedback is constructive and suggests a friendlier rewrite.",
            "AI structured report: summary + highlights + areas to improve + AI-generated action suggestions, with source-traceable tags.",
            "Per-sentence discussion: select text in someone's answer and leave a comment, like comments in Google Docs.",
            "Cross-session team insights: participation rate, discussion activity, and mood-trend charts (pure computation), plus a short AI-written status note.",
          ],
        },
        {
          title: "Technical Highlights",
          subs: [
            {
              title: "Structured collaboration with the LLM (where most of the effort went)",
              text: "The AI report is not \"throw in a prompt, get an essay\". It uses Gemini's JSON mode + response schema to force structured output. Along the way I hit and solved a series of practical LLM-engineering problems:",
              items: [
                "Per-item labeling instead of free-form summarization: when asked to fill a \"highlights array + improvements array\" directly, flash-tier models systematically leave one column empty, or even rewrite \"inefficient\" as \"very efficient\". I switched to having the model label every answer ({text, kind: \"well\"|\"improve\"}, locked with an enum) and let the backend split the green and red columns from the labels, turning \"fields the model can slack on\" into \"results derived from labels\". The missing-column problem disappeared completely.",
                "Controlling field generation order: the one-line summary occasionally spirals into a long essay (a degenerate mode of thinking models), burning the token budget so the classification arrays behind it come back empty. propertyOrdering forces \"classification first, summary last\", plus a hard backend truncation (keep the first sentence, cap the length), so a runaway only hurts itself.",
                "Source traceability (citations): every answer is numbered [#N] when the context is assembled; the schema requires the model to return the numbers each conclusion cites. The backend resolves the numbers back to answer ids and respondents, and the frontend renders them as small round tags that smooth-scroll to and highlight the original answer. Named sessions show initials; anonymous sessions only show numbers.",
                "Reliability: exponential-backoff retries on 503/500, bilingual friendly messages for 429 quota and other errors, code-fence stripping and outermost-JSON extraction, and turning off unnecessary thinking (thinkingBudget: 0) so simple tasks don't get their output eaten by thinking tokens.",
              ],
            },
            {
              title: "Permission model (Supabase)",
              text: "Row-Level Security is on for the entire database; the browser never touches the database directly. All writes go through Next.js Route Handlers, executed server-side with the service role and guarded by explicit authorization checks (only the organizer can generate reports or change settings; results stay hidden until the session closes). Login-free participation is authorized by a UUID in the session link; signed-in users use Supabase Auth Email OTP.",
            },
            {
              title: "Anchoring per-sentence discussion",
              text: "Comments anchor to \"characters m–n of a specific answer\": selecting text pops up a comment button and stores the quote and offsets; rendering converts anchor ranges into highlight marks, handling selections that span nodes and splitting overlapping highlights.",
            },
            {
              title: "Zero-dependency UX details",
              text: "A hand-rolled site-wide route progress bar (intercepting in-site link clicks + pathname-change detection, with a 10-second failsafe), staged animations while AI generates, bar-chart entrances and number count-ups, and unified modal transitions, all in plain CSS/React with zero extra dependencies, all respecting prefers-reduced-motion. Illustrations (home scene, empty-state sailboat) are hand-drawn inline SVG colored with design tokens to match the theme.",
            },
            {
              title: "Lightweight homemade i18n",
              text: "A cookie decides the locale; flat keys with variable interpolation; server and client components share a single dictionary. Every user-facing string (including AI prompts and error messages) is bilingual.",
            },
          ],
        },
        {
          title: "Challenges & Trade-offs",
          text: [
            "The biggest challenge was making LLM output stable enough to ship as a product feature. With the same prompt the model gets it right eight times out of ten: fine for a demo, a disaster for a product. My conclusion is that whatever can be solved with structure should not be solved with wording. Split the task smaller (per-item labeling > holistic summarization), narrow the output space with schemas and enums, put validation and fallbacks in the backend (truncation, defaults, silently degrading to no tag when citation parsing fails), and let the prompt handle only the semantic judgment itself. I also picked up non-obvious tricks like managing the token budget through generation order.",
            "The other trade-off was balancing anonymity with traceability: the report needs source tags to be convincing, but anonymous sessions must not leak identities. The final design is dual-track. Tag data only stores answer ids and respondent indexes; initials are written in at generation time only for named sessions, and anonymous sessions never touch the name table at all.",
          ],
        },
        {
          title: "Reflection",
          text: "This was my first time completing a full product in collaboration with AI. The biggest takeaway wasn't how much code got written, but learning to be a good technical decision-maker: breaking vague ideas into tasks an AI can execute, asking \"why is it written this way?\" about every output, and weighing different technical approaches. My existing programming foundation let me read the AI's output, discuss it on equal footing, and make the best decision.",
        },
        {
          title: "Tech Stack",
          tags: ["Next.js 15 (App Router / RSC)", "React 19", "TypeScript", "Tailwind CSS", "Supabase (PostgreSQL / RLS / Auth / Realtime)", "Google Gemini API (JSON mode / response schema)", "Prompt Engineering", "i18n", "Vercel"],
        },
      ],
    },
  },
  {
    id: "catch-butterfly",
    file: "butterfly.pj",
    codeName: "AR Butterfly Catch Game",
    img: "/butterfly-banner.png",
    video: "",
    demo: "https://iiamriiita.github.io/butterflygame/finalver",
    grad: "linear-gradient(135deg,var(--thumb-a),var(--thumb-b))",
    link: "github.com/iiamriiita/butterflygame",
    zh: {
    name: "AR抓蝴蝶復健遊戲",
    role: "獨立開發",
    tags: ["JavaScript", "MediaPipe", "電腦視覺", "Canvas API", "Supabase", "即時手勢辨識"],
    short: "透過相機即時追蹤手部動作，用「握拳」手勢抓取畫面中飛舞的蝴蝶，含拍照與線上排行榜的手指復健遊戲。",
    detail:
      "一個在瀏覽器中運行的AR體感遊戲。程式即時追蹤手部關節，當玩家把手移到蝴蝶上並「握拳」時即完成抓取。遊戲結束前會自動拍下一張含遊戲元素的紀念照，最終成績上傳至跨裝置共享的線上排行榜。",
    sections: [
      {
        title: "動機",
        text: "經常看媽媽進行手指復健動作，但單純的機械式重複既枯燥又難以堅持。我想把這個動作「藏」進一個有趣的遊戲裡。遊戲的核心互動就設計成「張開手 → 握拳」，復健者可以配合平常練習的張力手指套遊戲。",
      },
      {
        title: "核心功能",
        items: [
          "即時手勢辨識：以 MediaPipe Hands 追蹤 21 個手部關節點，透過比對指尖與掌心的相對距離判定「張開／握拳」，只在「張開→握合」的瞬間觸發抓取。",
          "遊戲制度：藍蝴蝶 +1、稀有粉蝴蝶 +3、蜜蜂則扣除 5 秒時間。",
          "動態合成拍照：在計時最後三秒提示並擷取相機畫面，玩家可下載。",
          "跨裝置線上排行榜：成績寫入雲端資料庫，任何裝置玩完都能即時看到全球前十名。",
        ],
      },
      {
        title: "技術亮點",
        items: [
          "前端電腦視覺：手部追蹤模型完全在瀏覽器端（WebAssembly）運行，不需伺服器運算，兼顧隱私與延遲。座標需處理鏡像翻轉與螢幕比例映射，才能讓虛擬手部游標與真實手部對齊。",
          "Canvas 畫面合成：拍照功能將即時影像與遊戲精靈（程式生成的像素向量圖，非點陣素材）依螢幕座標換算後合成到單一 Canvas 匯出。",
          "無伺服器後端整合：以 Supabase（PostgreSQL）作為後端，透過 REST API 直接讀寫，並用 Row-Level Security 政策限制公開金鑰只能讀取與新增分數，安全地把資料庫金鑰放在純前端。",
          "零建置部署：純 HTML/CSS/JS 單檔，可直接部署到 GitHub Pages 等靜態託管，讓家人在任何裝置上打開網頁就能練習，沒有安裝門檻。",
        ],
      },
      {
        title: "挑戰與取捨",
        text: [
          "最大的挑戰在「握拳」判定的穩定性：不同手掌大小、與鏡頭的距離、光線都會影響關節座標。這對復健場景尤其重要，因為使用者的手部動作可能不如常人靈活、幅度也較小，判定必須夠寬容又不能誤觸。若用固定的絕對距離判定，遠近手勢就會失準；最後改用指尖相對於掌心的比例來判定，讓辨識不受手的遠近與個人手型影響。",
          "後端則遇到金鑰授權問題：新版金鑰在 REST 端點回傳 401，透過瀏覽器開發者工具直接對 API 發請求逐步排查，最終定位到金鑰類型與資料表權限（RLS / schema grant）的設定，理解了「公開金鑰為何能安全放在前端」的權限模型。",
        ],
      },
      {
        title: "技術棧",
        tags: ["JavaScript", "MediaPipe Hands", "電腦視覺", "HTML Canvas API", "Supabase (PostgreSQL / REST)", "即時手勢辨識", "requestAnimationFrame"],
      },
    ],
    },
    en: {
      name: "AR Butterfly-Catching Rehab Game",
      role: "Solo project",
      tags: ["JavaScript", "MediaPipe", "Computer Vision", "Canvas API", "Supabase", "Real-time Gesture Recognition"],
      short: "A finger-rehab game that tracks your hand through the camera in real time. Catch fluttering butterflies with a fist gesture, take a photo, and climb the online leaderboard.",
      detail:
        "An AR motion game that runs in the browser. It tracks hand joints in real time: move your hand over a butterfly and make a fist to complete the catch. Before the game ends it automatically takes a commemorative photo with the game elements composited in, and the final score is uploaded to a cross-device shared online leaderboard.",
      sections: [
        {
          title: "Motivation",
          text: "I often watched my mom do finger-rehab exercises: pure mechanical repetition that is boring and hard to keep up. I wanted to hide that movement inside a fun game. The core interaction is designed as exactly \"open hand → make a fist\", so she can play along with the finger-tension bands she already practices with.",
        },
        {
          title: "Core Features",
          items: [
            "Real-time gesture recognition: MediaPipe Hands tracks 21 hand landmarks; \"open / fist\" is judged by comparing fingertip-to-palm relative distances, and a catch only triggers at the instant of the open→close transition.",
            "Game rules: blue butterflies +1, rare pink butterflies +3, and bees deduct 5 seconds.",
            "Dynamic composite photo: in the final three seconds a prompt appears and the camera frame is captured; players can download it.",
            "Cross-device online leaderboard: scores are written to a cloud database, and the global top ten updates instantly on any device.",
          ],
        },
        {
          title: "Technical Highlights",
          items: [
            "In-browser computer vision: the hand-tracking model runs entirely in the browser (WebAssembly) with no server compute, which is good for both privacy and latency. Coordinates need mirror flipping and screen-ratio mapping so the virtual hand cursor lines up with the real hand.",
            "Canvas compositing: the photo feature maps the live video and the game sprites (procedurally generated pixel-style vector art, not bitmap assets) into screen coordinates and composites them onto a single exported Canvas.",
            "Serverless backend: Supabase (PostgreSQL) accessed directly over its REST API, with Row-Level Security policies restricting the public key to reading and inserting scores, which makes it safe to ship the database key in a pure frontend.",
            "Zero-build deployment: a single plain HTML/CSS/JS file, deployable to GitHub Pages or any static host, so family members can practice on any device just by opening a URL, with no installation barrier.",
          ],
        },
        {
          title: "Challenges & Trade-offs",
          text: [
            "The hardest part was making the \"fist\" detection stable: palm size, distance from the camera, and lighting all affect the landmark coordinates. This matters even more in a rehab context, where users' hands may be less nimble and their range of motion smaller, so the detection has to be forgiving without misfiring. Fixed absolute-distance thresholds break as the hand moves closer or farther; the final solution judges fingertips relative to the palm as a ratio, making recognition independent of hand distance and hand shape.",
            "On the backend I hit a key-authorization problem: the new-style key returned 401 on REST endpoints. I debugged by issuing requests directly against the API from the browser devtools, eventually pinning it down to the key type and table permissions (RLS / schema grants), and came away actually understanding the permission model behind \"why a public key can safely live in the frontend\".",
          ],
        },
        {
          title: "Tech Stack",
          tags: ["JavaScript", "MediaPipe Hands", "Computer Vision", "HTML Canvas API", "Supabase (PostgreSQL / REST)", "Real-time Gesture Recognition", "requestAnimationFrame"],
        },
      ],
    },
  },
  {
    id: "music-viz",
    file: "techno-vj.pj",
    codeName: "Eastern Techno VJ",
    img: "/music-viz-banner.jpg",
    video: "https://vimeo.com/1207678884",
    demo: "",
    grad: "linear-gradient(135deg,var(--thumb-a),var(--thumb-b))",
    link: "",
    zh: {
    name: "東方電音 Eastern Techno VJ",
    cardName: "中國風即時音樂 VJ 系統",
    role: "獨立開發",
    tags: ["JavaScript", "Canvas API", "Web Audio API", "即時繪圖"],
    short: "敲拍即鎖定節奏，十種東方美學特效隨 techno 律動的零依賴視覺演出工具。",
    detail:
      "一個為 techno 音樂現場設計的即時視覺演出（VJ）系統。表演者跟著音樂敲擊空白鍵定速，畫面便自動鎖定節拍持續律動，並可即時切換十種以中國傳統建築元素為主題的滿版動態特效。",
    sections: [
      {
        title: "動機",
        text: "市面上的 VJ 軟體功能強大但操作複雜、且視覺多為西方賽博風格。我想做一個「上手只需兩個按鍵、視覺具東方辨識度」的輕量工具，讓非專業者也能在小型派對現場即興演出。",
      },
      {
        title: "核心功能",
        items: [
          "Tap-tempo 節拍鎖定：敲擊空白鍵，記錄敲擊時間差計算 BPM，之後由程式自動打拍。",
          "十種特效，依能量由靜到爆排序，對應一首曲子的 intro → build → drop 能量曲線。",
          "按「下」按鍵即可切換效果。",
        ],
      },
      {
        title: "技術亮點",
        items: [
          "純 Canvas 2D 逐幀繪製，維持 60fps；所有圖案為程式生成的向量構件，非點陣圖，故任意解析度皆清晰。",
          "節拍以「衰減脈衝值」驅動視覺：一個每幀衰減的變數乘進大小／亮度／位移，即得到跟拍鼓動的效果。",
        ],
      },
      {
        title: "挑戰與取捨",
        text: "最初嘗試用 Web Audio 即時分析音訊自動偵測 kick，但麥克風收音在吵雜現場極不穩定，常漏拍或誤觸。最終改採 tap-tempo 手動定速，犧牲全自動、換取現場可靠性，並且如果遇到過門想改變拍子也較好掌控。",
      },
      {
        title: "技術棧",
        tags: ["JavaScript", "HTML Canvas API", "Web Audio API", "即時繪圖", "requestAnimationFrame"],
      },
    ],
    },
    en: {
      name: "Eastern Techno VJ",
      role: "Solo project",
      tags: ["JavaScript", "Canvas API", "Web Audio API", "Real-time Graphics"],
      short: "Tap to lock the tempo, and ten Eastern-aesthetic effects pulse with the techno beat in a zero-dependency visual performance tool.",
      detail:
        "A real-time visual performance (VJ) system built for live techno. The performer taps the spacebar along with the music to set the tempo; the visuals lock onto the beat and keep pulsing, with ten full-screen animated effects themed on traditional Chinese architectural elements that can be switched live.",
      sections: [
        {
          title: "Motivation",
          text: "Existing VJ software is powerful but complicated to operate, and its visuals lean Western cyberpunk. I wanted a lightweight tool that takes only two keys to learn and looks unmistakably Eastern, so non-professionals can improvise visuals at small parties.",
        },
        {
          title: "Core Features",
          items: [
            "Tap-tempo beat lock: tap the spacebar and the app computes the BPM from the intervals, then keeps the beat automatically.",
            "Ten effects ordered from calm to explosive, matching a track's intro → build → drop energy curve.",
            "Press the Down key to switch effects.",
          ],
        },
        {
          title: "Technical Highlights",
          items: [
            "Pure Canvas 2D drawn frame by frame at a steady 60fps; every pattern is a procedurally generated vector construction, not a bitmap, so it stays crisp at any resolution.",
            "The beat drives the visuals through a \"decaying pulse value\": a variable that decays every frame is multiplied into size / brightness / displacement, producing motion that thumps with the beat.",
          ],
        },
        {
          title: "Challenges & Trade-offs",
          text: "I first tried Web Audio real-time analysis to auto-detect the kick, but microphone pickup at a loud venue is wildly unreliable, with missed beats and false triggers. I switched to manual tap-tempo, trading full automation for on-stage reliability, and it is also easier to take control when a transition calls for a tempo change.",
        },
        {
          title: "Tech Stack",
          tags: ["JavaScript", "HTML Canvas API", "Web Audio API", "Real-time Graphics", "requestAnimationFrame"],
        },
      ],
    },
  },
];

// ---- 之後把你的設計作品集網址貼進來（例如 "https://www.behance.net/yourname"）----
const DESIGN_PORTFOLIO_URL = "https://portfoliothi.framer.website/";

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

// ---- 樹狀分支線（檔案總管子項目前的 └ 形）----
function BranchIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="var(--text-dim)" strokeWidth="1.2" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M5 0v10.5h7" />
    </svg>
  );
}

// ---- 灰色實心 icon（取代 emoji，跟著主題變色）----
function SolidIcon({ path, size = 15, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0, color: "var(--text-mid)", ...style }}>
      <path d={path} />
    </svg>
  );
}
const ICON = {
  folder: "M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z",
  file: "M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z",
  palette: "M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  hand: "M8 11V3.75a1.75 1.75 0 0 1 3.5 0V10h1V2.75a1.75 1.75 0 0 1 3.5 0V10h1V4.75a1.75 1.75 0 0 1 3.5 0V14a8 8 0 0 1-16 0v-3.5a1.75 1.75 0 0 1 3.5 0z",
  person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  image: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
};

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

// ---- 路由：每頁有自己的網址，可直接分享 ----
// "/" → projects、"/about" → about、"/<專案id>" → 專案頁
function pathFor(id) {
  return id === "projects" ? "/" : `/${id}`;
}
function idFromPath(pathname) {
  const seg = pathname.replace(/\/+$/, "").replace(/^\//, "");
  if (!seg) return "projects";
  if (seg === "about") return "about";
  if (PROJECTS.some((p) => p.id === seg)) return seg;
  return "projects";
}

// ---- 響應式：偵測手機寬度；lang：專案內容語言（zh / en）----
const UI = createContext({ isMobile: false, lang: "zh" });

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
  // 從網址還原目前頁面（深連結直接打開該頁）
  const [openFile, setOpenFile] = useState(() =>
    typeof window !== "undefined" ? idFromPath(window.location.pathname) : "projects"
  );
  const [tabs, setTabs] = useState(() => {
    const initial = typeof window !== "undefined" ? idFromPath(window.location.pathname) : "projects";
    return ["projects", "about", ...(["projects", "about"].includes(initial) ? [] : [initial])];
  });
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
  const [lang, setLang] = useState(() => {
    // 記住使用者選過的；沒選過一律預設英文
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "zh" || saved === "en") return saved;
      return "en";
    } catch { return "en"; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { /* ignore */ }
  }, [theme]);
  useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
  }, [lang]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // 切頁時同步網址；瀏覽器上一頁/下一頁也能用
  const go = (id) => {
    setOpenFile(id);
    if (window.location.pathname !== pathFor(id)) {
      window.history.pushState({}, "", pathFor(id));
    }
  };
  useEffect(() => {
    const onPop = () => {
      const id = idFromPath(window.location.pathname);
      setOpenFile(id);
      setTabs((t) => (t.includes(id) ? t : [...t, id]));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    document.title = `${fileNameOf(openFile)} · YING CI`;
  }, [openFile]);

  const openTab = (id) => {
    go(id);
    if (!tabs.includes(id)) setTabs([...tabs, id]);
    if (isMobile) setDrawerOpen(false); // 手機點檔案後收起抽屜
  };
  const closeTab = (id, e) => {
    e.stopPropagation();
    const next = tabs.filter((t) => t !== id);
    setTabs(next);
    if (openFile === id && next.length) go(next[next.length - 1]);
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
    <UI.Provider value={{ isMobile, lang }}>
      <div style={appStyle}>
        {/* ---- 手機頂部列 ---- */}
        {isMobile && (
          <div style={S.mtop}>
            <button
              aria-label="Open explorer"
              style={S.mBurger}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              ☰
            </button>
            <span style={S.mTitle}>
              <img src="/yc-flower.png" alt="" style={{ width: 16, height: 16 }} />
              YING CI
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
            <img src="/yc-flower.png" alt="" style={{ width: 20, height: 20 }} />
            YING CI
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
            <SolidIcon path={ICON.folder} /> projects
          </div>
          {foldersOpen &&
            PROJECTS.map((p) => (
              <FileRow key={p.id} label={p.file} sub active={openFile === p.id} onClick={() => openTab(p.id)} />
            ))}
          <FileRow icon={<SolidIcon path={ICON.file} />} label="about me" active={openFile === "about"} onClick={() => openTab("about")} />

          {/* 外部連結：設計作品集（之後會導到另一個網站） */}
          <div
            onClick={openDesignPortfolio}
            title={DESIGN_PORTFOLIO_URL || "Link coming soon"}
            style={{ ...S.file, paddingLeft: 30, whiteSpace: "nowrap", borderLeft: "2px solid transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <SolidIcon path={ICON.palette} /> Design portfolio
            <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>↗</span>
          </div>

        </aside>

        {/* ---- Main ---- */}
        <div style={S.main}>
          {/* tabs */}
          <div style={S.tabbar}>
            <div style={S.tabScroll}>
              {tabs.map((id) => (
                <div key={id} style={{ ...S.tab, ...(openFile === id ? S.tabActive : {}) }} onClick={() => go(id)}>
                  <span>{fileNameOf(id)}</span>
                  <span style={S.close} onClick={(e) => closeTab(id, e)}>×</span>
                </div>
              ))}
            </div>

            {/* 右上角：語言切換＋主題下拉選單 */}
            <div style={S.themeWrap}>
              <button
                aria-label="Switch language"
                onClick={() => setLang((v) => (v === "zh" ? "en" : "zh"))}
                style={{ ...S.themeBtn, marginRight: 8 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {lang === "zh" ? "EN" : "中"}
              </button>
              <button
                aria-label="Select theme"
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
                    <div style={S.phead}>◎ Featured projects</div>
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
      {sub && <BranchIcon />}
      {icon}{dot}<span style={{ color: "var(--text-dim)" }}>{ext}</span>
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
      <Line n={1}><span style={T.hero}>// Hi, I'm YING CI <SolidIcon path={ICON.hand} size={18} style={{ verticalAlign: "-3px" }} /></span></Line>
      <Line n={2}> </Line>
      <Line n={3}>
        <span style={T.kw}>const</span> <span style={T.fn}>role</span><span style={T.dim}> = </span>
        <span style={T.str}>"UX Design Engineer · AI-assisted Programmer"</span><span style={T.dim}>;</span>
      </Line>
      <Line n={4}> </Line>
      <Line n={5}>
        <span style={T.kw}>export const</span> <span style={T.fn}>projects</span><span style={T.dim}> = [</span>
      </Line>
      {PROJECTS.map((p, i) => (
        <Line n={6 + i} key={p.id}>
          <span style={T.dim}>{"  { name: "}</span>
          <span style={T.str}>"{p.codeName}"</span>
          <span style={T.dim}>{" },"}</span>
        </Line>
      ))}
      <Line n={6 + PROJECTS.length}><span style={T.dim}>];</span></Line>
    </>
  );
}

// 統一樣式的連結按鈕（與「← projects」同款）；cta 版為黑底白字
function BtnLink({ href, style, cta, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{ ...S.btnLink, ...(cta ? S.btnCta : {}), ...style }}
      onMouseEnter={(e) => {
        if (cta) { e.currentTarget.style.background = "#333"; }
        else { e.currentTarget.style.color = "var(--text-bright)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }
      }}
      onMouseLeave={(e) => {
        if (cta) { e.currentTarget.style.background = "#111"; }
        else { e.currentTarget.style.color = "var(--text-mid)"; e.currentTarget.style.borderColor = "var(--border)"; }
      }}
    >
      {children}
    </a>
  );
}

function ProjectShowcase({ p, onOpen }) {
  const { isMobile, lang } = useContext(UI);
  const t = p[lang]; // 目前語言的專案內容
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
        {/* 頁首大視覺：有 demo 影片直接放影片；否則放截圖／emoji 佔位 */}
        {videoEmbed(p.video) ? (
          videoEmbed(p.video).type === "video" ? (
            <video src={videoEmbed(p.video).src} controls style={S.heroVideo} />
          ) : (
            <iframe
              src={videoEmbed(p.video).src}
              title={`${t.name} demo`}
              style={S.heroVideo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        ) : p.img ? (
          <img src={p.img} alt={t.name} style={{ ...S.hero, ...(isMobile ? S.heroM : {}), width: "100%", height: "auto", display: "block" }} />
        ) : (
          <div style={{ ...S.hero, ...(isMobile ? S.heroM : {}), background: p.grad }}>
            <SolidIcon path={ICON.image} size={isMobile ? 52 : 72} />
          </div>
        )}
        {p.demo && (
          <div style={S.heroBtns}>
            <BtnLink href={p.demo} style={S.heroBtn} cta>Try it now ↗</BtnLink>
          </div>
        )}
        <div style={S.showRole}>{t.role}</div>
        <h1 style={{ ...S.showTitle, ...(isMobile ? S.showTitleM : {}) }}>{t.name}</h1>
        <p style={{ ...S.showDesc, ...(isMobile ? S.showDescM : {}) }}>{t.detail}</p>

        {/* 分節內容（動機 / 核心功能 / 技術亮點…），專案有提供才顯示 */}
        {t.sections?.map((sec) => (
          <div key={sec.title}>
            <h3 style={S.secH}>{sec.title}</h3>
            <SecText text={sec.text} />
            <SecItems items={sec.items} />
            {sec.tags && (
              <div style={S.stRow}>
                {sec.tags.map((tag) => (<span key={tag} style={S.stBig}>{tag}</span>))}
              </div>
            )}
            {sec.subs?.map((sub) => (
              <div key={sub.title}>
                <h4 style={S.secH4}>{sub.title}</h4>
                <SecText text={sub.text} />
                <SecItems items={sub.items} />
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}

// 段落文字：接受字串或字串陣列（多段落）
function SecText({ text }) {
  if (!text) return null;
  return (Array.isArray(text) ? text : [text]).map((t, i) => (
    <p key={i} style={S.secP}>{t}</p>
  ));
}

function SecItems({ items }) {
  if (!items) return null;
  return (
    <ul style={S.secList}>
      {items.map((it, i) => (
        <li key={i} style={S.secLi}>{it}</li>
      ))}
    </ul>
  );
}

function AboutCode() {
  const sk = Object.entries(DEV.skills);
  return (
    <>
      <Line n={1}><span style={T.hero}>// about me <SolidIcon path={ICON.person} size={18} style={{ verticalAlign: "-3px" }} /></span></Line>
      <Line n={2}> </Line>
      <Line n={3}><span style={T.cmt}>/* I built my foundations through university coursework: small games,</span></Line>
      <Line n={4}><span style={T.cmt}>interactive art pieces, and websites. I learned how the frontend and</span></Line>
      <Line n={5}><span style={T.cmt}>backend connect: databases, external API integrations, and how they work. */</span></Line>
      <Line n={6}> </Line>
      <Line n={7}><span style={T.cmt}>/* AI-assisted development then got me hooked on shipping complete products,</span></Line>
      <Line n={8}><span style={T.cmt}>from digital tools for my family to a SaaS product. */</span></Line>
      <Line n={9}> </Line>
      <Line n={10}><span style={T.kw}>const</span> <span style={T.fn}>developer</span> = {"{"}</Line>
      <Line n={11}>{"  "}<span style={T.prop}>name</span>: <span style={T.str}>"{DEV.name}"</span>,</Line>
      <Line n={12}>{"  "}<span style={T.prop}>role</span>: <span style={T.str}>"{DEV.role}"</span>,</Line>
      <Line n={13}>{"  "}<span style={T.prop}>based</span>: <span style={T.str}>"{DEV.based}"</span>,</Line>
      <Line n={14}>{"  "}<span style={T.prop}>coffee</span>: <span style={T.num}>Infinity</span>,</Line>
      <Line n={15}>{"  "}<span style={T.prop}>skills</span>: {"{"}</Line>
      {sk.map(([k, v], i) => (
        <Line n={16 + i} key={k}>{"    "}<span style={T.prop}>{k}</span>: <span style={T.str}>"{v}"</span>,</Line>
      ))}
      <Line n={16 + sk.length}>{"  "}{"}"},</Line>
      <Line n={17 + sk.length}>{"}"};</Line>
      <Line n={18 + sk.length}> </Line>
      <Line n={19 + sk.length}><span style={T.cmt}>/* I love turning ideas into interactive things. Open to new opportunities. */</span></Line>
      <Line n={20 + sk.length}>
        <span style={T.cmt}>
          {"/* Questions or collaboration → "}
          <a href="mailto:yingciluo1015@gmail.com" style={{ color: "inherit", textDecoration: "underline" }}>yingciluo1015@gmail.com</a>
          {" */"}
        </span>
      </Line>
      <Line n={21 + sk.length}><span style={T.kw}>export default</span> <span style={T.fn}>developer</span>;</Line>
    </>
  );
}

function PCard({ p, onClick }) {
  const [hover, setHover] = useState(false);
  const { lang } = useContext(UI);
  const t = p[lang]; // 目前語言的專案內容
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...S.pcard, transform: hover ? "translateY(-3px)" : "none", borderColor: hover ? "var(--border-strong)" : "var(--border)" }}
    >
      {p.demo && <BtnLink href={p.demo} style={S.tryBtnPos}>Try now ↗</BtnLink>}
      {p.img ? (
        <img src={p.img} alt={t.name} style={{ ...S.thumb, width: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ ...S.thumb, background: p.grad }}><SolidIcon path={ICON.image} size={38} /></div>
      )}
      <div style={{ padding: "13px 16px 15px" }}>
        <h4 style={S.pcardH}>{t.cardName || t.name}</h4>
        <p style={S.pcardP}>{t.short}</p>
        <div style={S.stRow}>{t.tags.map((tag) => (<span key={tag} style={S.st}>{tag}</span>))}</div>
      </div>
    </div>
  );
}

// helpers
function splitExt(label) { const i = label.lastIndexOf("."); return i < 0 ? [label, ""] : [label.slice(0, i), label.slice(i)]; }
function fileNameOf(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (p) return p.file;
  return { projects: "projects", about: "about me" }[id] || id;
}

// ---- styles ----
const mono = "'SF Mono','JetBrains Mono','Fira Code',Consolas,monospace";
// 長文用一般字體，比 mono 好讀（介面元素維持 mono 保留編輯器氛圍）
const sans = "-apple-system,'Segoe UI','Noto Sans TC','PingFang TC','Microsoft JhengHei',Roboto,sans-serif";
const S = {
  app: { display: "grid", gridTemplateColumns: "220px 1fr", height: "100dvh", fontFamily: mono, background: "var(--bg)", color: "var(--text)", fontSize: 14 },
  side: { background: "var(--bg-side)", borderRight: "1px solid var(--border)", overflowY: "auto", padding: "8px 0" },
  root: { display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 700, color: "var(--text-bright)", letterSpacing: ".22em", padding: "16px 14px 12px", userSelect: "none" },
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
  pcard: { position: "relative", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 14, cursor: "pointer", transition: "transform .18s, border-color .18s" },
  btnLink: { display: "inline-block", fontFamily: mono, fontSize: 13, background: "var(--bg)", color: "var(--text-mid)", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", transition: "color .15s, border-color .15s, background .15s" },
  btnCta: { background: "#111", color: "#fff", borderColor: "#111" },
  tryBtnPos: { position: "absolute", top: 10, right: 10, zIndex: 2 },
  heroBtns: { display: "flex", gap: 10, marginBottom: 20 },
  heroBtn: { flex: 1, textAlign: "center", fontSize: 14, padding: "11px 12px" },
  thumb: { height: 185, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 },
  pcardH: { fontSize: 15.5, color: "var(--text-bright)", marginBottom: 4, fontFamily: sans, fontWeight: 700 },
  pcardP: { fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.6, fontFamily: sans },
  stRow: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" },
  st: { fontSize: 11.5, background: "var(--bg)", color: "var(--text-mid)", padding: "2px 8px", borderRadius: 12 },
  detail: { color: "var(--text)" },
  backBtn: { position: "sticky", top: 10, zIndex: 10, background: "var(--bg)", border: "none", color: "var(--text-mid)", fontFamily: mono, fontSize: 13, padding: "6px 10px", borderRadius: 6, cursor: "pointer", transition: "color .15s" },
  backBtnM: { position: "static", display: "inline-block", marginBottom: 16 },
  detailH: { fontSize: 18, marginTop: 14, marginBottom: 4 },
  detailRole: { fontSize: 12, color: "var(--syn-prop)", marginBottom: 10 },
  detailP: { fontSize: 13, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 12 },
  link: { display: "inline-block", marginTop: 14, color: "var(--syn-fn)", fontSize: 13, textDecoration: "none" },
  showcase: { overflowY: "auto", background: "var(--bg)", padding: "32px 24px" },
  showInner: { maxWidth: 700, margin: "0 auto" },
  hero: { height: 220, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid var(--border)" },
  showRole: { fontSize: 14, color: "var(--text-mid)", marginBottom: 6, fontFamily: sans },
  showTitle: { fontSize: 30, fontWeight: 700, color: "var(--text-bright)", letterSpacing: "-.01em", marginBottom: 14, lineHeight: 1.3, fontFamily: sans },
  showDesc: { fontSize: 16, color: "var(--text-soft)", lineHeight: 1.9, marginBottom: 18, fontFamily: sans },
  stBig: { fontSize: 13, background: "var(--bg-card)", color: "var(--text-mid)", padding: "5px 12px", borderRadius: 14, border: "1px solid var(--border)" },
  secH: { fontSize: 20, fontWeight: 700, color: "var(--text-bright)", fontFamily: sans, marginTop: 34, marginBottom: 10 },
  secH4: { fontSize: 16.5, fontWeight: 700, color: "var(--text-bright)", fontFamily: sans, marginTop: 20, marginBottom: 6 },
  secP: { fontSize: 15, color: "var(--text-soft)", lineHeight: 1.85, fontFamily: sans, marginBottom: 10 },
  secList: { paddingLeft: 22, margin: 0 },
  secLi: { fontSize: 15, color: "var(--text-soft)", lineHeight: 1.85, fontFamily: sans, marginBottom: 6 },
  heroVideo: { width: "100%", aspectRatio: "16 / 9", border: "1px solid var(--border)", borderRadius: 14, display: "block", background: "#000", marginBottom: 24 },

  // ---- 手機頂部列 / 抽屜 ----
  mtop: { display: "flex", alignItems: "center", gap: 10, background: "var(--bg-side)", borderBottom: "1px solid var(--border)", padding: "8px 12px", flexShrink: 0 },
  mBurger: { background: "none", border: "none", color: "var(--text)", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: "2px 4px" },
  mTitle: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "var(--text-bright)", letterSpacing: ".18em", userSelect: "none" },
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
