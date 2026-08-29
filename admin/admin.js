/* ============================================================
   ADMIN.JS — login sederhana + CRUD koleksi anime
   ============================================================ */

const el = (id) => document.getElementById(id);
let editingChars = [];

function applyTheme(){
  document.body.setAttribute('data-theme', DB.getTheme());
}

function showApp(){
  el('loginScreen').hidden = true;
  el('adminApp').hidden = false;
  el('noteInput').value = DB.getNote();
  renderList();
  resetForm();
}

function showLogin(){
  el('loginScreen').hidden = false;
  el('adminApp').hidden = true;
}

/* ---------- login ---------- */
el('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = el('loginUser').value.trim();
  const pass = el('loginPass').value;
  if(DB.login(user, pass)){
    el('loginError').hidden = true;
    showApp();
  }else{
    el('loginError').hidden = false;
  }
});

el('btnLogout').addEventListener('click', () => {
  DB.logout();
  showLogin();
});

/* ---------- catatan ---------- */
el('btnSaveNote').addEventListener('click', () => {
  DB.setNote(el('noteInput').value);
  el('btnSaveNote').textContent = 'Tersimpan ✓';
  setTimeout(() => el('btnSaveNote').textContent = 'Simpan Catatan', 1200);
});

/* ---------- form karakter (chip editor) ---------- */
function renderChars(){
  const wrap = el('charEditor');
  wrap.innerHTML = '';
  editingChars.forEach((name, i) => {
    const chip = document.createElement('span');
    chip.className = 'char-chip';
    chip.innerHTML = `<span>${name}</span>`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '×';
    btn.addEventListener('click', () => {
      editingChars.splice(i, 1);
      renderChars();
    });
    chip.appendChild(btn);
    wrap.appendChild(chip);
  });
}

el('btnAddChar').addEventListener('click', () => {
  const input = el('fCharInput');
  const val = input.value.trim();
  if(val){
    editingChars.push(val);
    input.value = '';
    renderChars();
  }
});
el('fCharInput').addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){ e.preventDefault(); el('btnAddChar').click(); }
});

/* ---------- upload foto cover dari perangkat ---------- */
const MAX_W = 900; // lebar maksimal, biar file tidak terlalu berat di localStorage

function resizeAndStore(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_W / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

el('fCoverFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  el('coverHint').textContent = 'Memproses foto...';
  try{
    const dataUrl = await resizeAndStore(file);
    el('fCoverData').value = dataUrl;
    el('fCoverPreview').src = dataUrl;
    el('coverHint').textContent = 'Foto siap disimpan.';
  }catch(err){
    el('coverHint').textContent = 'Gagal memproses foto, coba foto lain.';
  }
});

/* ---------- form anime (tambah / edit) ---------- */
function resetForm(){
  el('animeForm').reset();
  el('animeId').value = '';
  el('fCoverData').value = '';
  el('fCoverPreview').src = '';
  el('coverHint').textContent = 'Pilih foto dari galeri/kamera HP. Otomatis dikompres agar ringan.';
  editingChars = [];
  renderChars();
  el('formTitle').textContent = 'Tambah Anime';
}
el('btnResetForm').addEventListener('click', resetForm);

el('animeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = el('fTitle').value.trim();
  if(!title) return;

  const existingId = el('animeId').value;
  const oldAnime = existingId ? DB.getById(existingId) : null;
  const anime = {
    id: existingId || DB.makeId(title),
    title,
    // pakai foto baru kalau ada, kalau tidak pakai foto lama (saat mode edit)
    cover: el('fCoverData').value || (oldAnime ? oldAnime.cover : ''),
    sinopsis: el('fSinopsis').value.trim(),
    characters: [...editingChars],
    tamat: el('fTamat').checked
  };

  try{
    DB.save(anime);
  }catch(err){
    alert('Penyimpanan gagal — kemungkinan foto terlalu besar/kapasitas penuh. Coba foto lain atau hapus beberapa anime lama.');
    return;
  }
  resetForm();
  renderList();
});

/* ---------- daftar koleksi ---------- */
function renderList(){
  const list = DB.getAll();
  el('totalCount').textContent = `${list.length} judul tersimpan`;
  const ul = el('adminList');
  ul.innerHTML = '';

  if(list.length === 0){
    ul.innerHTML = '<li class="admin-row-sub" style="padding:14px 4px;">Belum ada anime. Tambahkan lewat formulir di atas.</li>';
    return;
  }

  list.forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${a.cover || ''}" alt="">
      <div class="admin-row-info">
        <div class="admin-row-title">${a.title}${a.tamat ? '<span class="tag-tamat">TAMAT</span>' : ''}</div>
        <div class="admin-row-sub">${(a.characters||[]).length} karakter tercatat</div>
      </div>
      <div class="admin-row-actions">
        <button data-act="edit">Ubah</button>
        <button data-act="del">Hapus</button>
      </div>
    `;
    li.querySelector('[data-act="edit"]').addEventListener('click', () => loadIntoForm(a));
    li.querySelector('[data-act="del"]').addEventListener('click', () => {
      if(confirm(`Hapus "${a.title}" dari arsip?`)){
        DB.remove(a.id);
        renderList();
        if(el('animeId').value === a.id) resetForm();
      }
    });
    ul.appendChild(li);
  });
}

function loadIntoForm(a){
  el('animeId').value = a.id;
  el('fTitle').value = a.title;
  el('fCoverData').value = a.cover || '';
  el('fCoverPreview').src = a.cover || '';
  el('coverHint').textContent = 'Foto lama masih dipakai — pilih file baru untuk mengganti.';
  el('fSinopsis').value = a.sinopsis || '';
  el('fTamat').checked = !!a.tamat;
  editingChars = [...(a.characters || [])];
  renderChars();
  el('formTitle').textContent = `Ubah "${a.title}"`;
  window.scrollTo({ top: el('animeForm').offsetTop - 100, behavior:'smooth' });
}

/* ---------- init ---------- */
applyTheme();
if(DB.isLoggedIn()) showApp(); else showLogin();
       
