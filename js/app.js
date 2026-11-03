'use strict';
const input = document.querySelector('#hex-input');
const select = document.querySelector('#hex-select');
const form = document.querySelector('#search-form');
const statusEl = document.querySelector('#status');
const resultsEl = document.querySelector('#results');
let hexagrams = [];
const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[\s　]+/g,'').replace(/卦$/,'');
function getHexagram(value) {
  const q = normalize(value);
  if (!q) return null;
  const exact = hexagrams.find(h => [h.name, h.shortName, ...(h.aliases || [])].some(n => normalize(n) === q));
  if (exact) return exact;
  const candidates = hexagrams.filter(h => [h.name, h.shortName].some(n => normalize(n).includes(q)));
  return candidates.length === 1 ? candidates[0] : null;
}
function setImage(imgEl, src, alt) {
  imgEl.src = src;
  imgEl.alt = alt;
  imgEl.onerror = () => { statusEl.textContent = '圖片無法載入，請確認檔案路徑與名稱。'; };
}
function render(hex) {
  resultsEl.hidden = false;
  document.querySelector('#result-subtitle').textContent = `第 ${hex.id} 卦`;
  document.querySelector('#original-id').textContent = `No. ${String(hex.id).padStart(2,'0')}`;
  document.querySelector('#original-name').textContent = hex.name;
  setImage(document.querySelector('#original-image'), hex.image, `${hex.name}卦象正面掃描圖片`);
  setImage(document.querySelector('#original-back-image'), hex.backImage, `${hex.name}文字背面掃描圖片`);

  const opposite = hexagrams.find(h => h.id === hex.oppositeId);
  document.querySelector('#opposite-name').textContent = opposite ? opposite.name : '查無對應';
  document.querySelector('#opposite-id').textContent = opposite ? `No. ${String(opposite.id).padStart(2,'0')}` : '';
  if (opposite) {
    setImage(document.querySelector('#opposite-image'), opposite.image, `${opposite.name}卦象正面掃描圖片`);
    setImage(document.querySelector('#opposite-back-image'), opposite.backImage, `${opposite.name}文字背面掃描圖片`);
  }
  document.querySelector('#opposite-note').textContent = opposite
    ? `目前相反卦採用易經學理上的「錯卦」：${hex.name} 的錯卦是 ${opposite.name}。若老闆之後改要綜卦或公司自訂對應，只需更新資料檔。`
    : '目前找不到相反卦對應。';
  statusEl.textContent = `已找到：${hex.name}${opposite ? `；其相反卦（錯卦）為 ${opposite.name}` : ''}`;
}
function search(value) {
  if (!hexagrams.length) { statusEl.textContent = '資料尚未載入。'; return; }
  const hex = getHexagram(value);
  if (!hex) {
    resultsEl.hidden = true;
    statusEl.textContent = '查無唯一對應的卦名，請輸入完整名稱或從建議清單選擇。';
    return;
  }
  input.value = hex.name;
  select.value = String(hex.id);
  location.hash = `q=${encodeURIComponent(hex.name)}`;
  render(hex);
}
form.addEventListener('submit', event => { event.preventDefault(); search(input.value); });
select.addEventListener('change', () => { if (select.value) { const hex = hexagrams.find(h => h.id === Number(select.value)); if (hex) search(hex.name); } });
input.addEventListener('input', () => { select.value = ''; });
document.querySelectorAll('[data-quick]').forEach(btn => btn.addEventListener('click', () => search(btn.dataset.quick)));
function init() {
  try {
    const data = window.HEXAGRAM_DATA;
    if (!Array.isArray(data) || data.length !== 64) throw Error('六十四卦資料筆數不正確');
    hexagrams = data;
    const datalist = document.querySelector('#hex-options');
    for (const h of data) {
      for (const label of [h.name, h.shortName]) {
        const opt = document.createElement('option');
        opt.value = label;
        datalist.append(opt);
      }
    }
    for (const h of [...data].sort((a,b) => a.id-b.id)) {
      const option = document.createElement('option');
      option.value = String(h.id);
      option.textContent = `第 ${String(h.id).padStart(2, '0')} 卦｜${h.name}`;
      select.append(option);
    }
    statusEl.textContent = '已載入六十四卦，可以輸入卦名或從清單直接選擇。';
    if (location.hash.startsWith('#q=')) {
      const q = decodeURIComponent(location.hash.slice(3));
      search(q);
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = '資料載入失敗，請確認 js/hexagrams-data.js 檔案存在，且所有檔案已完整解壓縮。';
  }
}
init();
