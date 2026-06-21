/* ============================================================
   الكتاب المقدّس — Orthodox Bible Reader  (app logic)
   Source: api.getbible.net  ·  translation: arabicsv (Van Dyck)
   All dynamic text is rendered via textContent (no innerHTML) — XSS-safe.
   ============================================================ */

const TR = 'arabicsv';
const API = (b, c) => `https://api.getbible.net/v2/${TR}/${b}/${c}.json`;
const CACHE_PREFIX = `bible:${TR}:`;

/* ---- Canon (book number = getbible index 1..66) ---- */
const BOOKS = [
  {n:1,name:'التكوين',ch:50,t:'ot'},        {n:2,name:'الخروج',ch:40,t:'ot'},
  {n:3,name:'اللاويين',ch:27,t:'ot'},       {n:4,name:'العدد',ch:36,t:'ot'},
  {n:5,name:'التثنية',ch:34,t:'ot'},        {n:6,name:'يشوع',ch:24,t:'ot'},
  {n:7,name:'القضاة',ch:21,t:'ot'},         {n:8,name:'راعوث',ch:4,t:'ot'},
  {n:9,name:'صموئيل الأول',ch:31,t:'ot'},   {n:10,name:'صموئيل الثاني',ch:24,t:'ot'},
  {n:11,name:'الملوك الأول',ch:22,t:'ot'},  {n:12,name:'الملوك الثاني',ch:25,t:'ot'},
  {n:13,name:'أخبار الأيام الأول',ch:29,t:'ot'},{n:14,name:'أخبار الأيام الثاني',ch:36,t:'ot'},
  {n:15,name:'عزرا',ch:10,t:'ot'},          {n:16,name:'نحميا',ch:13,t:'ot'},
  {n:17,name:'أستير',ch:10,t:'ot'},         {n:18,name:'أيوب',ch:42,t:'ot'},
  {n:19,name:'المزامير',ch:150,t:'ot'},     {n:20,name:'الأمثال',ch:31,t:'ot'},
  {n:21,name:'الجامعة',ch:12,t:'ot'},       {n:22,name:'نشيد الأنشاد',ch:8,t:'ot'},
  {n:23,name:'إشعياء',ch:66,t:'ot'},        {n:24,name:'إرميا',ch:52,t:'ot'},
  {n:25,name:'مراثي إرميا',ch:5,t:'ot'},    {n:26,name:'حزقيال',ch:48,t:'ot'},
  {n:27,name:'دانيال',ch:12,t:'ot'},        {n:28,name:'هوشع',ch:14,t:'ot'},
  {n:29,name:'يوئيل',ch:3,t:'ot'},          {n:30,name:'عاموس',ch:9,t:'ot'},
  {n:31,name:'عوبديا',ch:1,t:'ot'},         {n:32,name:'يونان',ch:4,t:'ot'},
  {n:33,name:'ميخا',ch:7,t:'ot'},           {n:34,name:'ناحوم',ch:3,t:'ot'},
  {n:35,name:'حبقوق',ch:3,t:'ot'},          {n:36,name:'صفنيا',ch:3,t:'ot'},
  {n:37,name:'حجي',ch:2,t:'ot'},            {n:38,name:'زكريا',ch:14,t:'ot'},
  {n:39,name:'ملاخي',ch:4,t:'ot'},
  {n:40,name:'متى',ch:28,t:'nt'},           {n:41,name:'مرقس',ch:16,t:'nt'},
  {n:42,name:'لوقا',ch:24,t:'nt'},          {n:43,name:'يوحنا',ch:21,t:'nt'},
  {n:44,name:'أعمال الرسل',ch:28,t:'nt'},   {n:45,name:'رومية',ch:16,t:'nt'},
  {n:46,name:'كورنثوس الأولى',ch:16,t:'nt'},{n:47,name:'كورنثوس الثانية',ch:13,t:'nt'},
  {n:48,name:'غلاطية',ch:6,t:'nt'},         {n:49,name:'أفسس',ch:6,t:'nt'},
  {n:50,name:'فيلبي',ch:4,t:'nt'},          {n:51,name:'كولوسي',ch:4,t:'nt'},
  {n:52,name:'تسالونيكي الأولى',ch:5,t:'nt'},{n:53,name:'تسالونيكي الثانية',ch:3,t:'nt'},
  {n:54,name:'تيموثاوس الأولى',ch:6,t:'nt'},{n:55,name:'تيموثاوس الثانية',ch:4,t:'nt'},
  {n:56,name:'تيطس',ch:3,t:'nt'},           {n:57,name:'فليمون',ch:1,t:'nt'},
  {n:58,name:'العبرانيين',ch:13,t:'nt'},    {n:59,name:'يعقوب',ch:5,t:'nt'},
  {n:60,name:'بطرس الأولى',ch:5,t:'nt'},    {n:61,name:'بطرس الثانية',ch:3,t:'nt'},
  {n:62,name:'يوحنا الأولى',ch:5,t:'nt'},   {n:63,name:'يوحنا الثانية',ch:1,t:'nt'},
  {n:64,name:'يوحنا الثالثة',ch:1,t:'nt'},  {n:65,name:'يهوذا',ch:1,t:'nt'},
  {n:66,name:'الرؤيا',ch:22,t:'nt'},
];

/* Coptic-Orthodox deuterocanon — listed for canon completeness.
   arabicsv (Protestant) lacks them, so they're flagged "coming". */
const DEUTERO = [
  'طوبيا','يهوديت','الحكمة (حكمة سليمان)','يشوع بن سيراخ',
  'باروخ','رسالة إرميا','زيادات أستير','زيادات دانيال',
  'المكابيين الأول','المكابيين الثاني',
];

const VOTD = [
  [43,3,16],[19,23,1],[45,8,28],[50,4,13],[23,40,31],[20,3,5],
  [40,11,28],[46,13,4],[19,46,1],[24,29,11],[6,1,9],[40,6,33],
  [50,4,6],[19,118,24],[45,12,2],[59,1,2],[62,4,8],[40,5,16],
];

/* ---- helpers ---- */
const AR_DIG = '٠١٢٣٤٥٦٧٨٩';
const toAr   = n => String(n).replace(/\d/g, d => AR_DIG[d]);
const toLat  = s => s.replace(/[٠-٩]/g, d => AR_DIG.indexOf(d));
const TASHKEEL = /[ً-ْٰ]/g;
const norm = s => toLat(s).replace(TASHKEEL,'')
  .replace(/[إأآٱا]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
  .replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[ـ\s]/g,'')
  .replace(/^ال/,'').toLowerCase();
const bookByN = n => BOOKS.find(b => b.n === +n);
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* tiny safe DOM builder — text always via textContent */
function el(tag, attrs, ...kids){
  const n = document.createElement(tag);
  if(attrs) for(const [k,v] of Object.entries(attrs)){
    if(v==null) continue;
    if(k==='class') n.className = v;
    else if(k==='text') n.textContent = v;
    else n.setAttribute(k, v);
  }
  for(const kid of kids){ if(kid==null) continue; n.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
  return n;
}

const LS = {
  get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},
};

/* ---- theme ---- */
function initTheme(){
  let t = LS.get('theme', null);
  if(!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.body.dataset.theme = t;
}
$('#themeBtn').onclick = () => {
  const t = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = t; LS.set('theme', t);
};

/* ---- font scale ---- */
function applyFont(){
  const s = LS.get('fontScale', 1);
  document.documentElement.style.setProperty('--reader-scale', s);
  $('#fontVal').textContent = toAr(Math.round(s*100)) + '٪';
}
$('#fontBtn').onclick = () => { const s=$('#fontSheet'); s.hidden=!s.hidden; };
$('#fontPlus').onclick  = () => { const s=Math.min(1.8, LS.get('fontScale',1)+0.1); LS.set('fontScale',+s.toFixed(2)); applyFont(); };
$('#fontMinus').onclick = () => { const s=Math.max(0.8, LS.get('fontScale',1)-0.1); LS.set('fontScale',+s.toFixed(2)); applyFont(); };

/* ---- sidebar ---- */
function openSidebar(o){ $('#sidebar').classList.toggle('open',o); $('#scrim').classList.toggle('show',o); }
$('#menuBtn').onclick = () => openSidebar(true);
$('#closeSidebar').onclick = () => openSidebar(false);
$('#scrim').onclick = () => openSidebar(false);

function buildSidebar(){
  const nav = $('#bookNav');
  const frag = document.createDocumentFragment();
  const addSection = (label, builder) => {
    frag.append(el('div', {class:'testament', text:label}));
    builder();
  };
  const bookBtn = b => el('button', {class:'book-item', 'data-n':b.n},
      el('span', {text:b.name}),
      el('span', {class:'bk-ch', text:`${toAr(b.ch)} إصحاح`}));
  const apocBtn = name => el('button', {class:'book-item apoc', 'data-apoc':'1'},
      el('span', {text:name}),
      el('span', {class:'bk-ch', text:'قريباً'}));

  addSection('العهد القديم', () => BOOKS.filter(b=>b.t==='ot').forEach(b=>frag.append(bookBtn(b))));
  addSection('الأسفار القانونية الثانية', () => DEUTERO.forEach(d=>frag.append(apocBtn(d))));
  addSection('العهد الجديد', () => BOOKS.filter(b=>b.t==='nt').forEach(b=>frag.append(bookBtn(b))));

  nav.replaceChildren(frag);
  nav.onclick = e => {
    const it = e.target.closest('.book-item'); if(!it) return;
    if(it.dataset.apoc){ toast('هذا السفر من الأسفار القانونية الثانية — النص الكامل سيُضاف من نسخة أرثوذكسية معتمدة قريباً.'); return; }
    openSidebar(false);
    location.hash = `#/book/${it.dataset.n}`;
  };
}
$('#bookFilter').addEventListener('input', e => {
  const q = norm(e.target.value);
  $$('#bookNav .book-item').forEach(it => {
    const name = it.querySelector('span').textContent;
    it.style.display = (!q || norm(name).includes(q)) ? '' : 'none';
  });
});

/* ---- data fetch (with cache) ---- */
async function getChapter(b, c){
  const key = `${CACHE_PREFIX}${b}:${c}`;
  const cached = LS.get(key, null);
  if(cached) return cached;
  const res = await fetch(API(b,c));
  if(!res.ok) throw new Error('network');
  const data = await res.json();
  let verses = data.verses;
  if(verses && !Array.isArray(verses)) verses = Object.values(verses);
  verses = (verses||[]).map(v => ({ v:+v.verse, text:(v.text||'').trim() }));
  LS.set(key, verses);
  return verses;
}

/* ---- views ---- */
const VIEWS = ['#home','#chapters','#reader','#daily','#theology','#library','#loading','#errorState'];
function show(id){ VIEWS.forEach(v => $(v).hidden = (v !== id)); }

function renderChapters(b){
  $('#chaptersTitle').textContent = b.name;
  const read = LS.get('readSet', {});
  const frag = document.createDocumentFragment();
  for(let i=1;i<=b.ch;i++){
    frag.append(el('button', {class:'ch-cell'+(read[`${b.n}:${i}`]?' read':''), 'data-c':i, text:toAr(i)}));
  }
  const g = $('#chapterGrid');
  g.replaceChildren(frag);
  g.onclick = e => { const c=e.target.closest('.ch-cell'); if(c) location.hash=`#/read/${b.n}/${c.dataset.c}`; };
  show('#chapters');
  scrollTo(0,0);
}

async function renderReader(b, c){
  c = Math.min(Math.max(1,+c), b.ch);
  $('#readerTitle').textContent = `${b.name} ${toAr(c)}`;
  show('#loading');
  try{
    const verses = await getChapter(b.n, c);
    const box = $('#verses');
    const frag = document.createDocumentFragment();
    verses.forEach(v => {
      const span = el('span', {class:'verse', 'data-v':v.v},
        el('span', {class:'vnum', text:toAr(v.v)}), v.text);
      frag.append(span, document.createTextNode(' '));
    });
    box.replaceChildren(frag);
    box.dataset.book = b.n; box.dataset.ch = c;

    $('#prevCh').disabled = (c<=1);
    $('#nextCh').disabled = (c>=b.ch);

    const read = LS.get('readSet', {}); read[`${b.n}:${c}`]=1; LS.set('readSet', read);
    LS.set('lastPos', {b:b.n,c,name:`${b.name} ${toAr(c)}`});
    updateContinue();

    show('#reader');
    scrollTo(0,0);
  }catch(err){
    $('#errorMsg').textContent = navigator.onLine
      ? 'تعذّر تحميل الإصحاح. حاول مرة أخرى.'
      : 'لا يوجد اتصال بالإنترنت. النص يُحمّل مباشرةً من المصدر.';
    show('#errorState');
    $('#retryBtn').onclick = () => renderReader(b,c);
  }
}

/* verse interactions */
$('#verses').addEventListener('click', e => {
  const v = e.target.closest('.verse'); if(!v) return;
  $$('.verse.sel').forEach(x=>x.classList.remove('sel'));
  v.classList.add('sel');
  const box = $('#verses');
  const b = bookByN(box.dataset.book);
  const ref = `${b.name} ${toAr(box.dataset.ch)}:${toAr(v.dataset.v)}`;
  const text = (v.textContent || '').replace(/^\s*\S+\s/,'').trim();
  shareVerse(`«${text}» (${ref})`);
});

async function shareVerse(payload){
  try{ if(navigator.share){ await navigator.share({text:payload}); return; } }catch{}
  try{ await navigator.clipboard.writeText(payload); toast('تم نسخ الآية ✓'); }
  catch{ toast('اضغط مطوّلاً لتحديد الآية ونسخها'); }
}

/* nav buttons */
$('#prevCh').onclick = () => { const box=$('#verses'); location.hash=`#/read/${box.dataset.book}/${+box.dataset.ch-1}`; };
$('#nextCh').onclick = () => { const box=$('#verses'); location.hash=`#/read/${box.dataset.book}/${+box.dataset.ch+1}`; };
addEventListener('keydown', e => {
  if($('#reader').hidden) return;
  if(e.key==='ArrowLeft' && !$('#nextCh').disabled) $('#nextCh').click();
  if(e.key==='ArrowRight'&& !$('#prevCh').disabled) $('#prevCh').click();
});

/* ---- router ---- */
function route(){
  const h = location.hash.replace(/^#\/?/,'');
  const [view, a, b] = h.split('/');
  if(view==='book' && bookByN(a)) return renderChapters(bookByN(a));
  if(view==='read' && bookByN(a)) return renderReader(bookByN(a), b||1);
  if(view==='daily') return showDaily();
  if(view==='theology') return showTheology();
  if(view==='library') return showLibrary();
  show('#home'); scrollTo(0,0);
}
addEventListener('hashchange', route);

$('#chaptersBack').onclick = () => openSidebar(true);
$('#readerBack').onclick   = () => { const box=$('#verses'); location.hash=`#/book/${box.dataset.book}`; };
$('#brandHome').onclick = e => { e.preventDefault(); location.hash=''; };
$('#browseBtn').onclick = () => openSidebar(true);

/* ---- continue reading ---- */
function updateContinue(){
  const last = LS.get('lastPos', null);
  const btn = $('#continueBtn');
  if(last){ btn.hidden=false; btn.textContent=`متابعة القراءة · ${last.name}`; btn.onclick=()=>location.hash=`#/read/${last.b}/${last.c}`; }
  else btn.hidden=true;
}

/* ---- verse of the day ---- */
async function loadVOTD(){
  const day = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5);
  const [b,c,v] = VOTD[day % VOTD.length];
  try{
    const verses = await getChapter(b,c);
    const found = verses.find(x=>x.v===v) || verses[0];
    $('#votdText').textContent = `«${found.text}»`;
    $('#votdRef').textContent = `${bookByN(b).name} ${toAr(c)}:${toAr(found.v)}`;
  }catch{
    $('#votdText').textContent = '«لِأَنَّهُ هَكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لَا يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ بَلْ تَكُونُ لَهُ الْحَيَاةُ الْأَبَدِيَّةُ.»';
    $('#votdRef').textContent = 'يوحنا ٣:١٦';
  }
}
$('#randomBtn').onclick = async () => {
  const b = BOOKS[Math.floor(Math.random()*BOOKS.length)];
  const c = 1+Math.floor(Math.random()*b.ch);
  toast('…جارٍ الاختيار');
  try{
    const verses = await getChapter(b.n,c);
    const v = verses[Math.floor(Math.random()*verses.length)];
    $('#votdText').textContent = `«${v.text}»`;
    $('#votdRef').textContent = `${b.name} ${toAr(c)}:${toAr(v.v)}`;
    $('#toast').hidden=true;
  }catch{ toast('تعذّر الاختيار، حاول تاني'); }
};

/* quicklinks */
$('#quicklinks').addEventListener('click', e => {
  const btn = e.target.closest('[data-go]'); if(!btn) return;
  const [b,c] = btn.dataset.go.split('.');
  location.hash = `#/read/${b}/${c}`;
});

/* ---- search / go-to ---- */
const sOverlay=$('#searchOverlay'), sInput=$('#searchInput'), sRes=$('#searchResults');
function openSearch(o){ sOverlay.hidden=!o; if(o){ sInput.value=''; sRes.replaceChildren(); setTimeout(()=>sInput.focus(),50);} }
$('#searchBtn').onclick=()=>openSearch(true);
{ const hs=$('#heroSearch'); if(hs) hs.onclick=()=>openSearch(true); }
$('#searchClose').onclick=()=>openSearch(false);
sOverlay.addEventListener('click', e=>{ if(e.target===sOverlay) openSearch(false); });
addEventListener('keydown', e=>{ if(e.key==='Escape') openSearch(false); });

function parseRef(q){
  const m = toLat(q.trim()).match(/^(.+?)\s*(\d+)\s*[:،.\s]?\s*(\d+)?\s*$/);
  if(!m) return null;
  const bq = norm(m[1]); if(!bq) return null;
  const book = BOOKS.find(b => { const bn=norm(b.name); return bn===bq||bn.includes(bq)||bq.includes(bn); });
  if(!book) return null;
  return { book, c:Math.min(+m[2],book.ch), v:m[3]?+m[3]:null };
}

function searchCached(q){
  const nq = norm(q); if(nq.length<2) return [];
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i); if(!k.startsWith(CACHE_PREFIX)) continue;
    const parts=k.split(':'); const b=+parts[2], c=+parts[3];
    const verses=LS.get(k,[]);
    for(const v of verses){
      if(norm(v.text).includes(nq)){
        out.push({b,c,v:v.v,text:v.text});
        if(out.length>=40) return out;
      }
    }
  }
  return out;
}

function srItem(go, refLabel, body){
  return el('button', {class:'sr-item', 'data-go':go},
    el('span', {class:'sr-ref', text:refLabel}), body);
}

sInput.addEventListener('input', () => {
  const q = sInput.value.trim();
  const frag = document.createDocumentFragment();
  if(!q){ sRes.replaceChildren(); $('#searchHint').textContent='اكتب اسم سفر ورقم الإصحاح للانتقال فوراً، أو كلمة للبحث داخل ما قرأته.'; return; }
  const ref = parseRef(q);
  if(ref){
    const label = `${ref.book.name} ${toAr(ref.c)}${ref.v?(':'+toAr(ref.v)):''}`;
    frag.append(srItem(`${ref.book.n}/${ref.c}`, 'انتقال ↵', label));
  }
  const hits = searchCached(q);
  hits.forEach(h => {
    const ref2 = `${bookByN(h.b).name} ${toAr(h.c)}:${toAr(h.v)}`;
    frag.append(srItem(`${h.b}/${h.c}`, ref2, h.text));
  });
  $('#searchHint').textContent = hits.length
    ? `${toAr(hits.length)} نتيجة داخل ما قرأته`
    : (ref ? 'اضغط للانتقال' : 'البحث النصّي يشمل الأسفار اللي فتحتها. للبحث الشامل افتح السفر أولاً.');
  sRes.replaceChildren(frag);
});
sRes.addEventListener('click', e=>{
  const it=e.target.closest('.sr-item'); if(!it) return;
  openSearch(false);
  location.hash = `#/read/${it.dataset.go}`;
});
sInput.addEventListener('keydown', e=>{
  if(e.key==='Enter'){ const first=sRes.querySelector('.sr-item'); if(first) first.click(); }
});

/* ---- daily readings (Katameros, same-origin JSON; auto-updated by CI) ---- */
let dailyData = null;
async function getDaily(){
  if(dailyData) return dailyData;
  const res = await fetch('./data/reading-today.json', {cache:'no-cache'});
  if(!res.ok) throw new Error('daily');
  dailyData = await res.json();
  return dailyData;
}
function htmlToText(html){
  if(!html) return '';
  try{ return new DOMParser().parseFromString(html,'text/html').body.textContent.replace(/\n{3,}/g,'\n\n').trim(); }
  catch{ return html.replace(/<[^>]+>/g,'').trim(); }
}
const isSynax = t => (t||'').includes('سنكسار');

async function loadDailyTeaser(){
  try{
    const d = await getDaily();
    if(d.copticDate) $('#dailyDate').textContent = `قطمارس · ${d.copticDate}`;
    let saint=null;
    (d.sections||[]).forEach(s=>(s.subSections||[]).forEach(sub=>{
      if(isSynax(sub.title)) (sub.readings||[]).forEach(r=>{ if(!saint && r.title) saint=r.title.trim(); });
    }));
    if(saint) $('#saintName').textContent = saint;
  }catch{ /* file may not exist offline */ }
}

function renderDaily(d){
  const body = $('#dailyBody'); body.replaceChildren();
  $('#copticDate').textContent = d.copticDate ? `التاريخ القبطي · ${d.copticDate}` : '';
  (d.sections||[]).forEach((sec,i)=>{
    const wrap = el('div', {class:'dr-section'+(i===0?' open':'')});
    const head = el('button', {class:'dr-section-head'}, el('span',{text:sec.title||''}), el('span',{class:'chev',text:'‹'}));
    head.onclick = () => wrap.classList.toggle('open');
    const inner = el('div', {class:'dr-section-body'});
    (sec.subSections||[]).forEach(sub=>{
      const subEl = el('div', {class:'dr-sub'});
      if(sub.title) subEl.append(el('div',{class:'dr-sub-title',text:sub.title}));
      const syn = isSynax(sub.title);
      (sub.readings||[]).forEach(r=>{
        const hasPassages = r.passages && r.passages.length;
        if(syn || (!hasPassages && r.html)){
          if(r.title) subEl.append(el('div',{class:'dr-synax-title',text:r.title.trim()}));
          const t = htmlToText(r.html);
          if(t) subEl.append(el('div',{class:'dr-synax',text:t}));
        } else {
          if(r.introduction) subEl.append(el('div',{class:'dr-intro',text:htmlToText(r.introduction)}));
          (r.passages||[]).forEach(p=>{
            subEl.append(el('div',{class:'dr-ref',text:`${p.bookTranslation||''} ${p.ref||''}`.trim()}));
            const vbox = el('div',{class:'dr-verses'});
            (p.verses||[]).forEach(v=> vbox.append(el('span',{class:'vnum',text:toAr(v.number)}), (v.text||'').trim()+' '));
            subEl.append(vbox);
          });
          if(r.conclusion) subEl.append(el('div',{class:'dr-intro',text:htmlToText(r.conclusion)}));
        }
      });
      inner.append(subEl);
    });
    wrap.append(head, inner);
    body.append(wrap);
  });
}

async function showDaily(){
  show('#loading');
  try{ renderDaily(await getDaily()); show('#daily'); scrollTo(0,0); }
  catch{ $('#errorMsg').textContent='تعذّر تحميل قراءات اليوم.'; show('#errorState'); $('#retryBtn').onclick=()=>showDaily(); }
}
$('#dailyCard').onclick = () => location.hash='#/daily';
$('#saintCard').onclick = () => location.hash='#/daily';
$('#dailyBack').onclick  = () => location.hash='';

/* ---- theology (العقيدة): original short explainers + verse links + authoritative source ---- */
const THEOLOGY = [
  { title:'الثالوث القدّوس',
    intro:'اللهُ واحدٌ في جوهره، مثلّثُ الأقانيم: الآبُ والابنُ والروحُ القُدُس — ثلاثةُ أقانيمَ متساوون في الجوهرِ والمجدِ والأزلية، إلهٌ واحدٌ لا ثلاثةُ آلهة.',
    verses:[{l:'متى ٢٨:١٩',b:40,c:28},{l:'يوحنا ١:١',b:43,c:1},{l:'٢كورنثوس ١٣:١٤',b:47,c:13}] },
  { title:'سرّ التجسّد',
    intro:'ابنُ اللهِ الكلمةُ صار إنساناً كاملاً من غيرِ أن يتغيّرَ لاهوتُه؛ اتّحدَ اللاهوتُ بالناسوتِ اتّحاداً بغيرِ اختلاطٍ ولا امتزاجٍ ولا تغيير — طبيعةٌ واحدةٌ من طبيعتين (بحسبِ الإيمانِ القبطيِّ الأرثوذكسي)، إلهٌ كاملٌ وإنسانٌ كامل.',
    verses:[{l:'يوحنا ١:١٤',b:43,c:1},{l:'فيلبي ٢:٦',b:50,c:2},{l:'١تيموثاوس ٣:١٦',b:54,c:3}] },
  { title:'الفداء والخلاص',
    intro:'بصليبِ المسيحِ وقيامتِه افتدانا من الخطيةِ والموتِ وصالحَنا مع الآب. الخلاصُ نعمةٌ تُقبَلُ بالإيمانِ العاملِ بالمحبة، ونحياهُ في الكنيسةِ وأسرارِها.',
    verses:[{l:'يوحنا ٣:١٦',b:43,c:3},{l:'رومية ٥:٨',b:45,c:5},{l:'أفسس ٢:٨',b:49,c:2}] },
  { title:'الأسرار السبعة',
    intro:'الأسرارُ المقدّسةُ سبعة: المعموديةُ، الميرونُ، الإفخارستيا (التناوُل)، التوبةُ والاعترافُ، مسحةُ المرضى، الكهنوتُ، الزيجة — وسائطُ نعمةٍ منظورةٌ لبركةٍ غيرِ منظورة.',
    verses:[{l:'متى ٢٨:١٩',b:40,c:28},{l:'يوحنا ٦:٥٤',b:43,c:6},{l:'يعقوب ٥:١٤',b:59,c:5}] },
  { title:'المجامع المسكونية',
    intro:'تعترفُ الكنيسةُ القبطيةُ الأرثوذكسيةُ بالمجامعِ المسكونيةِ الثلاثةِ الأولى: نيقية (٣٢٥م) ضدّ آريوس، والقسطنطينية (٣٨١م)، وأفسس (٤٣١م) ضدّ نسطور — التي ثبّتت الإيمانَ بلاهوتِ الابنِ والروحِ القدسِ ووحدانيةِ شخصِ المسيح، ومنها قانونُ الإيمان.',
    verses:[{l:'يوحنا ١٧:٢١',b:43,c:17},{l:'أفسس ٤:٥',b:49,c:4}] },
  { title:'الكتاب المقدّس والوحي',
    intro:'الكتابُ المقدّسُ كلمةُ اللهِ الموحى بها: أسفارُ العهدِ القديمِ والجديدِ والأسفارِ القانونيةِ الثانية، تقرؤها الكنيسةُ في ضوءِ التقليدِ الرسوليِّ وتفسيرِ الآباء.',
    verses:[{l:'٢تيموثاوس ٣:١٦',b:55,c:3},{l:'٢بطرس ١:٢١',b:61,c:1}] },
];

function renderTheology(){
  const body=$('#theologyBody'); const frag=document.createDocumentFragment();
  THEOLOGY.forEach((t,i)=>{
    const wrap=el('div',{class:'th-topic'+(i===0?' open':'')});
    const head=el('button',{class:'th-head'},el('span',{text:t.title}),el('span',{class:'chev',text:'‹'}));
    head.onclick=()=>wrap.classList.toggle('open');
    const inner=el('div',{class:'th-body'});
    inner.append(el('div',{class:'th-intro',text:t.intro}));
    const vrow=el('div',{class:'th-verses'});
    t.verses.forEach(v=>{ const btn=el('button',{text:v.l}); btn.onclick=()=>{ location.hash=`#/read/${v.b}/${v.c}`; }; vrow.append(btn); });
    inner.append(vrow);
    inner.append(el('a',{class:'th-more',href:'https://st-takla.org',target:'_blank',rel:'noopener noreferrer',text:'اقرأ أكثر من مصدر معتمد ↗'}));
    wrap.append(head,inner); frag.append(wrap);
  });
  body.replaceChildren(frag);
}
function showTheology(){ renderTheology(); show('#theology'); scrollTo(0,0); }

/* ---- library (المكتبة): curated external sources — we link, we don't host ---- */
const LIBRARY = [
  { cat:'📖 التفاسير', items:[
    {title:'تفسير الكتاب المقدّس — أبونا تادرس يعقوب ملطي', author:'القمص تادرس يعقوب ملطي', src:'coptic-treasures.com', url:'https://coptic-treasures.com'},
    {title:'تفاسير الكتاب المقدّس', author:'مكتبة الأنبا تكلا', src:'st-takla.org', url:'https://st-takla.org'},
  ]},
  { cat:'📜 آبائيّات وكتابات الآباء', items:[
    {title:'كتابات آباء الكنيسة', author:'كنوز قبطية', src:'coptic-treasures.com', url:'https://coptic-treasures.com'},
    {title:'Church Fathers (نصوص مجال عام)', author:'CCEL', src:'ccel.org', url:'https://ccel.org/fathers'},
  ]},
  { cat:'✝ العقيدة والدفاعيّات', items:[
    {title:'اللاهوت العقيدي والدفاعيات', author:'مكتبة الأنبا تكلا', src:'st-takla.org', url:'https://st-takla.org'},
  ]},
  { cat:'👥 سِيَر القديسين', items:[
    {title:'السنكسار وسِيَر القديسين', author:'مكتبة الأنبا تكلا', src:'st-takla.org', url:'https://st-takla.org'},
    {title:'قديس اليوم — داخل نور الكلمة', author:'من السنكسار', src:'داخلي', url:'#/daily'},
  ]},
  { cat:'🕊 روحيّات وكتب عامة', items:[
    {title:'المكتبة المسيحية الحرة', author:'مكتبة عامة', src:'christianlib.com', url:'https://christianlib.com'},
  ]},
];

function renderLibrary(){
  const body=$('#libraryBody'); const frag=document.createDocumentFragment();
  LIBRARY.forEach(cat=>{
    const sec=el('div',{class:'lib-cat'});
    sec.append(el('div',{class:'lib-cat-title',text:cat.cat}));
    const grid=el('div',{class:'lib-grid'});
    cat.items.forEach(it=>{
      const internal=it.url.charAt(0)==='#';
      const card=el('a',{class:'lib-item',href:it.url},
        el('span',{class:'li-title',text:it.title}),
        el('span',{class:'li-author',text:it.author}),
        el('span',{class:'li-src',text:internal?'↳ '+it.src:it.src+' ↗'}));
      if(internal){ card.onclick=(e)=>{ e.preventDefault(); location.hash=it.url; }; }
      else { card.target='_blank'; card.rel='noopener noreferrer'; }
      grid.append(card);
    });
    sec.append(grid); frag.append(sec);
  });
  body.replaceChildren(frag);
}
function showLibrary(){ renderLibrary(); show('#library'); scrollTo(0,0); }

/* entry + back wiring */
$('#theologyCard').onclick = () => location.hash='#/theology';
$('#libraryCard').onclick  = () => location.hash='#/library';
$('#theologyBack').onclick = () => location.hash='';
$('#libraryBack').onclick  = () => location.hash='';

/* ---- toast ---- */
let toastT;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2600); }

/* ---- boot ---- */
initTheme(); applyFont(); buildSidebar(); updateContinue(); loadVOTD(); loadDailyTeaser(); route();
