/* ============================================================
   DB.JS — lapisan "database" sederhana pakai localStorage.
   Semua halaman (public & admin) memakai file ini supaya
   sumber data selalu konsisten.
   ============================================================ */

const DB = (() => {
  const KEY_ANIME = 'la_anime';
  const KEY_NOTE  = 'la_catatan';
  const KEY_THEME = 'la_tema';
  const KEY_AUTH  = 'la_admin_session';

  const SEED = [
    {
      id: 'code-geass',
      title: 'Code Geass',
      cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
      sinopsis: 'Lelouch Lamperouge, seorang pangeran buangan, mendapatkan kekuatan "Geass" yang mampu memerintah siapa pun secara mutlak. Ia memakai kekuatan itu untuk memimpin pemberontakan melawan kekaisaran Britannia yang menindas, sambil menyamar sebagai Zero, sosok misterius bertopeng.',
      characters: ['Lelouch Lamperouge', 'C.C.', 'Suzaku Kururugi', 'Nunnally Lamperouge'],
      tamat: true
    }
  ];

  function _read(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function _write(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function init(){
    if(localStorage.getItem(KEY_ANIME) === null){
      _write(KEY_ANIME, SEED);
    }
    if(localStorage.getItem(KEY_NOTE) === null){
      _write(KEY_NOTE, 'Web ini adalah list anime yang sudah saya tamatkan, sedang saya tonton, atau masuk daftar rencana nonton. Dibuat sebagai arsip pribadi supaya tidak lupa jalan cerita dan karakter favorit di tiap judul.');
    }
    if(localStorage.getItem(KEY_THEME) === null){
      _write(KEY_THEME, 'dark');
    }
  }
  init();

  return {
    // ---- anime ----
    getAll(){ return _read(KEY_ANIME, []); },
    getById(id){ return this.getAll().find(a => a.id === id) || null; },
    save(anime){
      const list = this.getAll();
      const i = list.findIndex(a => a.id === anime.id);
      if(i >= 0) list[i] = anime; else list.push(anime);
      _write(KEY_ANIME, list);
    },
    remove(id){
      _write(KEY_ANIME, this.getAll().filter(a => a.id !== id));
    },
    makeId(title){
      const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      let id = base || 'anime-' + Date.now();
      let n = 1;
      while(this.getById(id)){ id = base + '-' + (++n); }
      return id;
    },

    // ---- catatan ----
    getNote(){ return _read(KEY_NOTE, ''); },
    setNote(text){ _write(KEY_NOTE, text); },

    // ---- tema ----
    getTheme(){ return _read(KEY_THEME, 'dark'); },
    setTheme(t){ _write(KEY_THEME, t); },

    // ---- sesi admin (sederhana, hanya untuk kebutuhan front-end) ----
    login(user, pass){
      const ok = user === 'LIST' && pass === 'LIST';
      if(ok) sessionStorage.setItem(KEY_AUTH, '1');
      return ok;
    },
    isLoggedIn(){ return sessionStorage.getItem(KEY_AUTH) === '1'; },
    logout(){ sessionStorage.removeItem(KEY_AUTH); }
  };
})();
        
