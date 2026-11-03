# 易經卦象查詢系統 V1.3（錯卦版）

此版本已套用公司提供的 128 頁掃描卡片圖片：
- 每卦 2 張：正面（卦象）＋背面（文字）
- 共 64 卦
- 網頁右側顯示「相反卦」，目前採用易經學理上的**錯卦**（六爻陰陽全部相反）

## 功能
1. 依卦名查詢六十四卦（支援完整名稱、簡稱）
2. 顯示原卦正反面卡片
3. 顯示相反卦（錯卦）正反面卡片
4. 手機與桌機皆可瀏覽（RWD）

## 上線方式（GitHub Pages）
1. 建立 Public repository，例如 `hylove-iching`
2. 將此資料夾內容上傳到 repository 根目錄
3. 到 `Settings -> Pages`
4. Source 選 `Deploy from a branch`
5. Branch 選 `main`，資料夾選 `/(root)`
6. 存檔後等待幾分鐘，即可取得網址

## 檔案結構
- `index.html`：首頁
- `css/style.css`：樣式
- `js/app.js`：查詢邏輯
- `data/hexagrams.json`：六十四卦資料與錯卦對應
- `images/cards/`：公司掃描卡片圖片（front/back）

## 若日後要改成綜卦或公司自訂規則
只需修改 `data/hexagrams.json` 中每筆資料的 `oppositeId` 即可。

## 本機直接測試
將 ZIP 完整解壓縮後，雙擊 `index.html` 即可使用，不需啟動伺服器。
請勿把 `index.html` 單獨移出資料夾，因為圖片與 JS 檔案是相對路徑。

注意：若修改 `data/hexagrams.json`，本機版本的查詢資料也要同步更新 `js/hexagrams-data.js`。
本版本在瀏覽器直接載入 `js/hexagrams-data.js`，不再用 fetch() 讀取 JSON，以避免本機 file:// 被瀏覽器阻擋。
