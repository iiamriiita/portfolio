# Portfolio

VS Code 風格的個人作品集，用 **React + Vite** 打造，支援桌機與手機（RWD）。

🔗 線上版：https://iiamriiita.github.io/portfolio/

## 開發

```bash
npm install
npm run dev
```

打開 http://localhost:5173 。

## 改成你自己的資料

所有內容集中在 `src/Portfolio.jsx` 最上方：

- `DEV`：名字、職稱、地點、照片網址（`photo`）、技能。
- `PROJECTS`：作品陣列，每個作品含名稱、emoji、標籤、說明、連結。
  - 想放真實截圖：把 `ProjectShowcase` 裡的 emoji `<span>` 換成
    `<img src="...">` 效果更好。

## RWD 說明

- 寬度 ≤ 768px 進入手機版：左側檔案總管收合成可滑出的抽屜（點左上 ☰ 開關），
  程式碼區與作品卡片改為單欄垂直堆疊。
- 桌機版維持原本的三欄編輯器排版。

## 部署

已內建 GitHub Actions（`.github/workflows/deploy.yml`）：push 到 `main`
會自動 build 並把成品推到 `gh-pages` 分支。到 repo Settings → Pages →
Source 選「Deploy from a branch」→ `gh-pages` / `(root)` 即可上線。
