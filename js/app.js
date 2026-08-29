/* ============================================================
   APP.JS — logika halaman publik
   ============================================================ */

let animeList = [];
let currentIndex = 0;

const el = (id) => document.getElementById(id);

function applyTheme(theme){
  document.body.setAttribute('data-theme', theme);
  el('temaState').textContent = theme === 'dark' ? 'Gelap' : 'Terang';
}

function renderCard(){
  const card = el('animeCard');
  const empty = el('emptyState');

  if(animeList.length === 0){
    card.style.display = 'none';
    empty.hidden = false;
    el('stageIndex').textContent = '00 / 00';
    return;
  }
  card.style.display = '';
  empty.hidden = true;

  const a = animeList[currentIndex];
  el('cardImg').src = a.cover || '';
  el('cardImg').alt = a.title;
  el('cardTitle').textContent = a.title;
  el('cardSinopsis').textContent = a.sinopsis || '(sinopsis belum diisi)';
  el('cardStamp').classList.toggle('show', !!a.tamat);

  const charUl = el('cardChars');
  charUl.innerHTML = '';
  (a.characters || []).forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    charUl.appendChild(li);
  });
  if((a.characters || []).length === 0){
    const li = document.createElement('li');
    li.textContent = '(belum ada karakter ditambahkan)';
    charUl.appendChild(li);
  }

  const n = String(currentIndex + 1).padStart(2,'0');
  const total = String(animeList.length).padStart(2,'0');
  el('stageIndex').textContent = `${n} / ${total}`;
}

function goTo(index){
  if(animeList.length === 0) return;
  currentIndex = (index + animeList.length) % animeList.length;
  renderCard();
}

function renderTamatList(){
  const ul = el('tamatList');
  ul.innerHTML = '';
  const tamat = animeList.filter(a => a.tamat);
  if(tamat.length === 0){
    ul.innerHTML = '<li class="tamat-empty">Belum ada anime yang ditandai tamat.</li>';
    return;
  }
  tamat.forEach(a => {
    const li = document.createElement('li');
    li.textContent = a.title;
    li.addEventListener('click', () => {
      const idx = animeList.findIndex(x => x.id === a.id);
      goTo(idx);
      closeAllPanels();
    });
    ul.appendChild(li);
  });
}

function openPanel(panel){
  closeAllPanels();
  panel.classList.add('open');
  el('overlay').classList.add('show');
}
function closeAllPanels(){
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
  el('overlay').classList.remove('show');
}

function loadData(){
  animeList = DB.getAll();
  if(currentIndex >= animeList.length) currentIndex = 0;
  renderCard();
  renderTamatList();
}

function init(){
  applyTheme(DB.getTheme());
  el('noteBody').textContent = DB.getNote();
  loadData();

  el('btnPrev').addEventListener('click', () => goTo(currentIndex - 1));
  el('btnNext').addEventListener('click', () => goTo(currentIndex + 1));

  el('btnMenu').addEventListener('click', () => openPanel(el('panelMenu')));
  el('btnTamat').addEventListener('click', () => openPanel(el('panelTamat')));
  el('btnCatatan').addEventListener('click', () => openPanel(el('panelCatatan')));
  el('btnBackFromCatatan').addEventListener('click', () => openPanel(el('panelMenu')));

  el('btnTema').addEventListener('click', () => {
    const next = DB.getTheme() === 'dark' ? 'light' : 'dark';
    DB.setTheme(next);
    applyTheme(next);
  });

  el('overlay').addEventListener('click', closeAllPanels);
  document.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', closeAllPanels)
  );

  // navigasi keyboard, biar enak dipakai
  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') goTo(currentIndex - 1);
    if(e.key === 'ArrowRight') goTo(currentIndex + 1);
    if(e.key === 'Escape') closeAllPanels();
  });

  // sinkron otomatis kalau data diubah dari tab admin lain
  window.addEventListener('storage', loadData);
}

init();
