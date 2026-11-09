'use strict';
const input = document.querySelector('#hex-input');
const select = document.querySelector('#hex-select');
const form = document.querySelector('#search-form');
const statusEl = document.querySelector('#status');
const resultsEl = document.querySelector('#results');
const castProgress = document.querySelector('#casting-progress');
const castStep = document.querySelector('#casting-step');
const castStatus = document.querySelector('#casting-status');
const castYang = document.querySelector('#cast-yang');
const castYin = document.querySelector('#cast-yin');
const castUndo = document.querySelector('#cast-undo');
const castReset = document.querySelector('#cast-reset');
const stepNames = ['初爻（最下方）','二爻','三爻','四爻','五爻','上爻（最上方）'];
let hexagrams = [];
const casts = []; // 自下而上儲存：1=陽，0=陰
const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[\s　]+/g,'').replace(/卦$/,'');
function getHexagram(value) {
  const q = normalize(value);
  if (!q) return null;
  const exact = hexagrams.find(h => [h.name, h.shortName, ...(h.aliases || [])].some(n => normalize(n) === q));
  if (exact) return exact;
  const candidates = hexagrams.filter(h => [h.name, h.shortName].some(n => normalize(n).includes(q)));
  return candidates.length === 1 ? candidates[0] : null;
}
function setImage(element, src, alt) {
  element.src = src;
  element.alt = alt;
  element.onerror = () => { statusEl.textContent = '圖片無法載入，請確認檔案路徑與名稱。'; };
}
function render(hex) {
  resultsEl.hidden = false;
  document.querySelector('#result-subtitle').textContent = `第 ${hex.id} 卦`;
  document.querySelector('#original-id').textContent = `No. ${String(hex.id).padStart(2,'0')}`;
  document.querySelector('#original-name').textContent = hex.name;
  setImage(document.querySelector('#original-image'), hex.image, `${hex.name}卦象正面掃描圖片`);
  setImage(document.querySelector('#original-back-image'), hex.backImage, `${hex.name}文字背面掃描圖片`);
  // 綜卦：六爻上下倒序（第一爻與第六爻互換）；陰陽本身不變。
  // 原資料 oppositeId 為「錯卦」，不可沿用。
  const reversedPattern = hex.binaryPatternBottomUp.split('').reverse().join('');
  const zong = hexagrams.find(h => h.binaryPatternBottomUp === reversedPattern);
  document.querySelector('#opposite-name').textContent = zong ? zong.name : '查無對應';
  document.querySelector('#opposite-id').textContent = zong ? `No. ${String(zong.id).padStart(2,'0')}` : '';
  if (zong) {
    setImage(document.querySelector('#opposite-image'), zong.image, `${zong.name}綜卦正面掃描圖片`);
    setImage(document.querySelector('#opposite-back-image'), zong.backImage, `${zong.name}綜卦文字背面掃描圖片`);
  }
  statusEl.textContent = `已找到：${hex.name}${zong ? `；其綜卦（六爻上下倒序）為 ${zong.name}` : ''}`;
}
function search(value) {
  if (!hexagrams.length) { statusEl.textContent = '資料尚未載入。'; return; }
  const hex = getHexagram(value);
  if (!hex) {
    resultsEl.hidden = true;
    statusEl.textContent = '查無唯一對應的卦名，請輸入完整名稱或從清單選擇。';
    return;
  }
  input.value = hex.name;
  select.value = String(hex.id);
  location.hash = `q=${encodeURIComponent(hex.name)}`;
  render(hex);
}
function renderCasts() {
  castProgress.textContent = `已記錄 ${casts.length} / 6 爻`;
  castStep.textContent = casts.length < 6
    ? `第 ${casts.length + 1} 次：請輸入${stepNames[casts.length]}`
    : '六爻輸入完成，已自動查卦';
  for (let i = 1; i <= 6; i++) {
    const element = document.querySelector(`#line-stack [data-line="${i}"]`);
    const value = casts[i - 1];
    element.classList.toggle('empty', value === undefined);
    element.classList.toggle('yang', value === '1');
    element.classList.toggle('yin', value === '0');
    element.querySelector('.line-graphic').textContent = value === undefined ? '······' : value === '1' ? '━━━━━━' : '━━  ━━';
    element.querySelector('.line-name').textContent = value === undefined ? '待輸入' : value === '1' ? '陽' : '陰';
  }
  castYang.disabled = casts.length === 6;
  castYin.disabled = casts.length === 6;
  castUndo.disabled = casts.length === 0;
  castReset.disabled = casts.length === 0;
  if (!casts.length) castStatus.textContent = '尚未輸入，請依擲幣順序開始。';
  else if (casts.length < 6) castStatus.textContent = `已輸入 ${casts.length} 爻，請繼續輸入第 ${casts.length + 1} 次結果。`;
}
function recordLine(value) {
  if (casts.length >= 6 || hexagrams.length !== 64) return;
  casts.push(value);
  renderCasts();
  if (casts.length === 6) {
    const hex = hexagrams.find(h => h.binaryPatternBottomUp === casts.join(''));
    if (hex) {
      search(hex.name);
      castStatus.textContent = `完成！六爻對應第 ${hex.id} 卦：${hex.name}。下方已顯示原卦與綜卦圖片。`;
      resultsEl.scrollIntoView({behavior:'smooth',block:'start'});
    } else {
      castStatus.textContent = '無法比對六十四卦資料，請確認資料檔。';
    }
  }
}
form.addEventListener('submit', event => { event.preventDefault(); search(input.value); });
select.addEventListener('change', () => {
  if (!select.value) return;
  const hex = hexagrams.find(h => h.id === Number(select.value));
  if (hex) search(hex.name);
});
input.addEventListener('input', () => { select.value = ''; });
document.querySelectorAll('[data-quick]').forEach(button => button.addEventListener('click', () => search(button.dataset.quick)));
castYang.addEventListener('click', () => recordLine('1'));
castYin.addEventListener('click', () => recordLine('0'));
castUndo.addEventListener('click', () => { if (casts.length) { casts.pop(); renderCasts(); } });
castReset.addEventListener('click', () => { casts.length = 0; renderCasts(); });
function init() {
  renderCasts();
  try {
    const data = window.HEXAGRAM_DATA;
    if (!Array.isArray(data) || data.length !== 64) throw Error('六十四卦資料筆數不正確');
    if (new Set(data.map(h => h.binaryPatternBottomUp)).size !== 64 || data.some(h => !/^[01]{6}$/.test(h.binaryPatternBottomUp))) {
      throw Error('六十四卦爻線對照資料不正確');
    }
    hexagrams = data;
    const datalist = document.querySelector('#hex-options');
    for (const h of data) {
      for (const label of [h.name, h.shortName]) {
        const option = document.createElement('option');
        option.value = label;
        datalist.append(option);
      }
    }
    for (const h of [...data].sort((a, b) => a.id - b.id)) {
      const option = document.createElement('option');
      option.value = String(h.id);
      option.textContent = `第 ${String(h.id).padStart(2, '0')} 卦｜${h.name}`;
      select.append(option);
    }
    statusEl.textContent = '已載入六十四卦，可用六次陰陽結果、文字或選單查詢。';
    if (location.hash.startsWith('#q=')) search(decodeURIComponent(location.hash.slice(3)));
  } catch (error) {
    console.error(error);
    castStatus.textContent = '資料載入失敗，請確認 js/hexagrams-data.js 檔案已完整上傳。';
    statusEl.textContent = '資料載入失敗，請確認 js/hexagrams-data.js 檔案存在。';
    castYang.disabled = true;
    castYin.disabled = true;
  }
}
init();
