# 前台頁籤顯示開關 — 設計文件

日期：2026-07-02
狀態：已核准（方案 A）

## 目標

後台可以個別開關前台導覽列的 8 個頁籤（INFORMATION、SCHEDULE、MEMBER、VIDEO、DISCOGRAPHY、GOODS、RULES、CONTACT）。關閉的頁籤不出現在前台導覽列（桌機與手機選單）。

## 範圍界定

- **只隱藏導覽列連結**：直接輸入網址（如 `/goods`）仍可訪問該頁。不加 route guard；日後有需要再加。
- 首頁（LOGO / `/`）永遠顯示，不受控制。

## 資料層

沿用既有 `home_settings` 單列資料表，新增一欄：

```sql
alter table home_settings
  add column nav_visibility jsonb not null default '{}';
```

- 格式：`{ "goods": false, "rules": false }` — key 為路徑段（不含斜線），值 `false` 表示隱藏。
- **缺 key 視為顯示**，因此預設 `'{}'` = 全部顯示，向後相容。
- RLS 沿用 `home_settings` 既有政策（public read / admin write），不需變更。
- migrations 目錄為手動執行流程：新增 `supabase/migrations/003_nav_visibility.sql`，由使用者在 Supabase Dashboard SQL Editor 執行。同時更新 `supabase/README.md`：Setup Instructions 補上第 3 步（執行 003），Tables 表格的 `home_settings` 描述補上 nav visibility。

## 後台

- 新頁面「網站設定」：路由 `/admin/site-settings`，比照 `home-settings` 的寫法（standalone component、`canDeactivate: [unsavedChangesGuard]`）。
- 內容：8 個頁籤各一個 toggle（PrimeNG ToggleSwitch，比照後台既有元件庫）+ 儲存按鈕。
- 讀寫透過既有 `HomeSettingsService`（`getAdmin()` / `update()`），只動 `nav_visibility` 欄位。
- `HomeSettings` model 加 `nav_visibility: Record<string, boolean>` 欄位。
- admin-layout 側邊選單加「網站設定」項目。

## 前台

- navbar 刻意不載入 supabase SDK（initial bundle 效能，見 navbar.component.ts 的 ponytail 註記）。因此用原生 `fetch()` 打 Supabase REST API：

```
GET {supabaseUrl}/rest/v1/home_settings?select=nav_visibility&limit=1
headers: apikey: {anonKey}
```

- 注意：PostgREST 預設回傳**陣列**（非 SDK `.single()` 的單物件），因此回應是 `[{ nav_visibility: {...} }]`，取第一筆的 `nav_visibility`；空陣列視同 `{}`（全顯示）。
- navbar 的 `navLinks` 改為 signal，fetch 成功後過濾掉隱藏項。注意 key 對應：`navLinks` 的 `path` 是 `/goods`（帶斜線），`nav_visibility` 的 key 是 `goods`（不帶斜線），過濾時必須先去掉 `path` 開頭的 `/` 再查表（`nav_visibility[path.slice(1)] === false` 即隱藏）。
- fetch 失敗（網路錯誤等）：保持全部顯示（fail-open），不擋使用者。
- 已知取捨：非同步載入造成毫秒級閃爍（先全顯示、隱藏項隨後消失），接受。

## 測試

- navbar 過濾邏輯單元測試（含：空設定全顯示、部分 false 隱藏、fetch 失敗 fail-open）。
- 後台元件測試比照既有 home-settings 測試慣例（若有）。

## 錯誤處理

- 後台儲存失敗：沿用既有 home-settings 頁的錯誤提示模式。
- 前台 fetch 失敗：fail-open，全部顯示。
