/**
 * SAST – Signal Anomaly & Security Tracking — App Logic
 *
 * Architecture:
 *   App          – global state object
 *   Theme        – dark/light toggle + CSS variable swap
 *   Auth         – login / signup / logout / session check (PHP + demo fallback)
 *   Navigation   – SPA-style section switching + sub-tabs
 *   Data         – fetch from PHP API with full dummy fallback
 *   Charts       – 12 Chart.js instances, lazily created, theme-aware
 *   Counters     – animated numeric count-up on overview metrics
 */

/* ═══════════════════════════════════════════════════════════════
   1. GLOBAL STATE
   ═══════════════════════════════════════════════════════════════ */
const App = {
    theme : localStorage.getItem('sast_theme') || 'dark',
    token : localStorage.getItem('sast_token') || null,
    user  : null,
    data  : {},           // cached section payloads
    charts: {},           // live Chart instances (keyed by canvas id)
    drawn : new Set(),    // tracks which charts have been initialised
};

/* ═══════════════════════════════════════════════════════════════
   2. DUMMY DATA GENERATORS  (used when PHP backend is absent)
   ═══════════════════════════════════════════════════════════════ */
function dummyOverview() {
    const labels=[], rps=[];
    for (let i=0; i<288; i++) {                 // 288 × 5 min = 24 h
        const h = Math.floor(i/12), m = (i%12)*5;
        labels.push(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));
        let b = 70 + (m%30);
        if (h>=8  && h<=11) b = 650+(h-8)*80;
        if (h>=12 && h<=13) b = 480;
        if (h>=14 && h<=17) b = 700+(h-14)*60;
        if (h>=18 && h<=21) b = 380-(h-18)*55;
        rps.push(b + Math.floor(Math.random()*75 - 25));
    }
    const tot = rps.reduce((a,v)=>a+v*5, 0);
    return {
        metrics:{
            total_requests:tot, peak_rps:Math.max(...rps),
            avg_rps:+(rps.reduce((a,v)=>a+v,0)/rps.length).toFixed(1),
            active_bots:14, duration_hours:24, success_rate:97.4,
            failures:Math.floor(tot*.026),
        },
        http_methods:{ GET:Math.floor(tot*.72), POST:Math.floor(tot*.18), PUT:Math.floor(tot*.05), DELETE:Math.floor(tot*.03), PATCH:Math.floor(tot*.02) },
        rps_timeline:{ labels, rps },
    };
}

function dummyTraffic() {
    const days=[], vol=[];
    for (let d=6; d>=0; d--) {
        const dt=new Date(); dt.setDate(dt.getDate()-d);
        days.push(dt.toLocaleDateString('en-US',{month:'short',day:'numeric'}));
        vol.push(180000+Math.floor(Math.random()*140000));
    }
    return {
        volume_7d:{ labels:days, data:vol },
        devices  :{ labels:['Mobile','Desktop','Tablet'], data:[42,51,7] },
        browsers :{ labels:['Chrome','Safari','Firefox','Edge','Opera','Other'], data:[52.1,21.3,12.0,8.5,3.2,2.9] },
        protocols:{ labels:['HTTP','HTTPS','HTTP/2','HTTP/3'], data:[4.4,56.2,26.2,13.1] },
        mobile_os:{ labels:['iOS','Android','Win Mobile','Other'], data:[38.1,54.3,4.2,3.4] },
    };
}

function dummySecurity() {
    const labels=[], app=[], net=[];
    for (let i=0; i<24; i++) {
        labels.push(String(i).padStart(2,'0')+':00');
        let [ab,nb] = [40,25];
        if(i===2){ab=320;nb=180;} if(i===9){ab=210;nb=90;} if(i===15){ab=280;nb=150;}
        app.push(ab+Math.floor(Math.random()*35-10));
        net.push(nb+Math.floor(Math.random()*28-8));
    }
    const tA=app.reduce((a,v)=>a+v,0), tN=net.reduce((a,v)=>a+v,0);
    return {
        app_layer:{
            change_pct:-12.4, total_24h:tA,
            timeline:{ labels, data:app },
            types:[
                {type:'SQL Injection', count:Math.floor(tA*.32)},
                {type:'XSS',           count:Math.floor(tA*.24)},
                {type:'CSRF',          count:Math.floor(tA*.18)},
                {type:'Path Traversal',count:Math.floor(tA*.14)},
                {type:'Other',         count:Math.floor(tA*.12)},
            ],
        },
        net_layer:{
            change_pct:8.7, total_24h:tN,
            timeline:{ labels, data:net },
            types:[
                {type:'DDoS (Volumetric)', count:Math.floor(tN*.41)},
                {type:'SYN Flood',         count:Math.floor(tN*.28)},
                {type:'UDP Flood',         count:Math.floor(tN*.18)},
                {type:'IP Spoofing',       count:Math.floor(tN*.13)},
            ],
        },
    };
}

function dummyConnectivity() {
    const labels=[], dl=[], ul=[], lat=[], iqi=[];
    for (let i=0; i<12; i++) {
        labels.push(String(6+i).padStart(2,'0')+':00');
        const d = 110+Math.floor(Math.random()*80)+(i<4?20:(i<8?40:10));
        dl.push(+(d+Math.sin(i)*15).toFixed(1));
        ul.push(+(d*.34+Math.floor(Math.random()*10-5)).toFixed(1));
        lat.push(12+Math.floor(Math.random()*20));
        iqi.push(+(60+d/2.2).toFixed(1));
    }
    return {
        current:{ iqi:iqi[11], download:dl[11], upload:ul[11], latency:lat[11] },
        timeline:{ labels, download:dl, upload:ul, latency:lat, iqi },
    };
}

function dummyBots() {
    return {
        bots:[
            {name:'Googlebot',          requests:18200, ai:false},
            {name:'GPT-4o / OpenAI',    requests:9400,  ai:true},
            {name:'ChatGPT-User',       requests:7600,  ai:true},
            {name:'Bingbot',            requests:5300,  ai:false},
            {name:'Claude / Anthropic', requests:4500,  ai:true},
            {name:'Perplexity AI',      requests:3900,  ai:true},
            {name:'Gemini / Google',    requests:3100,  ai:true},
            {name:'Yandex',             requests:2200,  ai:false},
            {name:'Baidu',              requests:1800,  ai:false},
            {name:'DuckDuckBot',        requests:1600,  ai:false},
        ],
        robots_txt_agents:['GPT-4o / OpenAI','ChatGPT-User','Claude / Anthropic','Perplexity AI','Gemini / Google'],
    };
}

function dummyTools() {
    const M=['GET','POST','PUT','DELETE','PATCH'],
          R=['US-East','US-West','EU-West','Asia-Pacific','South America'],
          P=['HTTPS','HTTP/2','HTTP/3','HTTP'],
          D=['Desktop','Mobile','Tablet'],
          rows=[];
    for (let i=0; i<50; i++) {
        rows.push({
            id:i+1,
            time:'2026-02-01 '+String(Math.floor(Math.random()*24)).padStart(2,'0')+':'+String(Math.floor(Math.random()*60)).padStart(2,'0')+':'+String(Math.floor(Math.random()*60)).padStart(2,'0'),
            method:M[Math.floor(Math.random()*5)],
            status:Math.random()<.97?200:(Math.random()<.5?404:500),
            protocol:P[Math.floor(Math.random()*4)],
            device:D[Math.floor(Math.random()*3)],
            region:R[Math.floor(Math.random()*5)],
            latency:(8+Math.floor(Math.random()*312))+' ms',
        });
    }
    return {
        explorer:rows,
        reports:[
            {id:1,title:'January 2026 Monthly Report',  type:'monthly',  date:'2026-01-31',size:'2.4 MB'},
            {id:2,title:'December 2025 Monthly Report', type:'monthly',  date:'2025-12-31',size:'2.1 MB'},
            {id:3,title:'Q4 2025 Quarterly Report',     type:'quarterly',date:'2025-12-31',size:'5.8 MB'},
            {id:4,title:'2025 Annual Report',           type:'yearly',   date:'2025-12-31',size:'12.3 MB'},
            {id:5,title:'November 2025 Monthly Report', type:'monthly',  date:'2025-11-30',size:'1.9 MB'},
        ],
    };
}

/* ═══════════════════════════════════════════════════════════════
   3. BOOTSTRAP  (runs once on DOMContentLoaded)
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    applyTheme();
    bindGlobalEvents();
    await loadData();
    checkAuth();
    showPage('overview');
});

/* ═══════════════════════════════════════════════════════════════
   4. THEME
   ═══════════════════════════════════════════════════════════════ */
function applyTheme() {
    document.documentElement.setAttribute('data-theme', App.theme);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = App.theme === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
    App.theme = App.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sast_theme', App.theme);
    applyTheme();
}

/* ═══════════════════════════════════════════════════════════════
   5. DATA LOADING
   ═══════════════════════════════════════════════════════════════ */
async function loadData() {
    const sections = ['overview','traffic','sentinel_shield','security','connectivity','bots','tools'];
    const fallbacks = { 
        overview:dummyOverview, 
        traffic:dummyTraffic, 
        sentinel_shield:dummySentinelShield,
        security:dummySecurity, 
        connectivity:dummyConnectivity, 
        bots:dummyBots, 
        tools:dummyTools 
    };
    await Promise.all(sections.map(async s => {
        try {
            const r = await fetch('php/api.php?section='+s);
            if (!r.ok) throw 0;
            App.data[s] = await r.json();
        } catch { App.data[s] = fallbacks[s](); }
    }));
}

/* ═══════════════════════════════════════════════════════════════
   6. AUTH
   ═══════════════════════════════════════════════════════════════ */
async function checkAuth() {
    if (!App.token) { syncAuthUI(false); return; }
    try {
        const r = await fetch('php/auth.php?action=check', { headers:{'Authorization':'Bearer '+App.token} });
        const d = await r.json();
        if (d.authenticated) { App.user=d.user; syncAuthUI(true); }
        else { App.token=null; localStorage.removeItem('sast_token'); syncAuthUI(false); }
    } catch {
        // Demo fallback – auto-login
        App.user = {username:'Demo', email:'demo@sast.io'};
        syncAuthUI(true);
    }
}

function syncAuthUI(on) {
    const loginBtn  = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userSpan  = document.getElementById('userSpan');
    const sidebar   = document.getElementById('sidebar');
    const main      = document.querySelector('.main');

    if (on) {
        loginBtn  && (loginBtn.style.display  = 'none');
        logoutBtn && (logoutBtn.style.display = 'flex');
        if (userSpan) { userSpan.style.display='flex'; userSpan.textContent=App.user?.username||''; }
        sidebar && sidebar.classList.remove('sidebar--off');
        main    && main.classList.remove('main--nosb');
        // hide auth pages
        document.querySelectorAll('.auth-pg').forEach(p => p.style.display='none');
    } else {
        loginBtn  && (loginBtn.style.display  = 'flex');
        logoutBtn && (logoutBtn.style.display = 'none');
        userSpan  && (userSpan.style.display  = 'none');
        sidebar && sidebar.classList.add('sidebar--off');
        main    && main.classList.add('main--nosb');
    }
}

async function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPass').value;
    const msg   = document.getElementById('loginMsg');
    clearMsg(msg);

    if (!email || !pass) return showMsg(msg, 'Please fill in all fields.', 'err');

    try {
        const r = await fetch('php/auth.php?action=login', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email,password:pass}),
        });
        const d = await r.json();
        if (d.success) {
            App.token = d.token; App.user = d.user;
            localStorage.setItem('sast_token', d.token);
            syncAuthUI(true); showPage('overview');
        } else showMsg(msg, d.error||'Login failed.', 'err');
    } catch {
        // Demo fallback
        App.user = {username:'Demo', email};
        App.token = 'demo';
        localStorage.setItem('sast_token','demo');
        syncAuthUI(true); showPage('overview');
    }
}

async function doSignup() {
    const user  = document.getElementById('signupUser').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pass  = document.getElementById('signupPass').value;
    const msg   = document.getElementById('signupMsg');
    clearMsg(msg);

    if (!user||!email||!pass) return showMsg(msg,'All fields are required.','err');
    if (pass.length<6) return showMsg(msg,'Password must be at least 6 characters.','err');

    try {
        const r = await fetch('php/auth.php?action=signup', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username:user,email,password:pass}),
        });
        const d = await r.json();
        if (d.success) { showMsg(msg,'Account created! Redirecting…','ok'); setTimeout(()=>showAuthPage('login'),1600); }
        else showMsg(msg, d.error||'Signup failed.','err');
    } catch {
        showMsg(msg,'Account created! Redirecting…','ok');
        setTimeout(()=>showAuthPage('login'),1400);
    }
}

async function doLogout() {
    try { await fetch('php/auth.php?action=logout',{method:'POST',headers:{'Authorization':'Bearer '+(App.token||'')}}); } catch {}
    App.token=null; App.user=null;
    localStorage.removeItem('sast_token');
    syncAuthUI(false);
    showAuthPage('login');
}

function showAuthPage(which) {
    document.querySelectorAll('.pg').forEach(s => s.classList.remove('on'));
    document.querySelectorAll('.auth-pg').forEach(p => p.style.display='none');
    document.getElementById(which==='login'?'loginPg':'signupPg').style.display='flex';
}

function showMsg(el, txt, type) {
    if (!el) return;
    el.textContent = txt;
    el.className = 'auth-msg ' + type;
}
function clearMsg(el) { if(el) el.className='auth-msg'; }

/* ═══════════════════════════════════════════════════════════════
   7. NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
function showPage(id) {
    // Hide all page sections & auth pages
    document.querySelectorAll('.pg').forEach(s => s.classList.remove('on'));
    document.querySelectorAll('.auth-pg').forEach(p => p.style.display='none');
    // Show target
    const target = document.getElementById(id);
    if (target) target.classList.add('on');

    // Highlight nav
    document.querySelectorAll('[data-page]').forEach(el => el.classList.toggle('on', el.dataset.page===id));

    // Close mobile sidebar
    if (window.innerWidth <= 1024) toggleSidebar(false);

    // Render charts
    requestAnimationFrame(() => renderPage(id));
}

function toggleSidebar(force) {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('overlay');
    const open = force !== undefined ? force : !sb.classList.contains('on');
    sb.classList.toggle('on', open);
    ov && ov.classList.toggle('on', open);
}

/* ═══════════════════════════════════════════════════════════════
   8. GLOBAL EVENT BINDINGS
   ═══════════════════════════════════════════════════════════════ */
function bindGlobalEvents() {
    // Theme
    document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);

    // Nav links (top + sidebar + bottom)
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', e => { e.preventDefault(); showPage(el.dataset.page); });
    });

    // Hamburger + overlay
    document.getElementById('hamburger')?.addEventListener('click', () => toggleSidebar());
    document.getElementById('overlay')?.addEventListener('click', () => toggleSidebar(false));

    // Auth buttons
    document.getElementById('doLoginBtn')?.addEventListener('click', doLogin);
    document.getElementById('doSignupBtn')?.addEventListener('click', doSignup);
    document.getElementById('logoutBtn')?.addEventListener('click', doLogout);
    document.getElementById('loginBtn')?.addEventListener('click', () => showAuthPage('login'));
    document.getElementById('goSignup')?.addEventListener('click', e=>{ e.preventDefault(); showAuthPage('signup'); });
    document.getElementById('goLogin')?.addEventListener('click',  e=>{ e.preventDefault(); showAuthPage('login'); });

    // Enter key on auth inputs
    document.getElementById('loginPass')?.addEventListener('keydown', e=>{ if(e.key==='Enter') doLogin(); });
    document.getElementById('signupPass')?.addEventListener('keydown', e=>{ if(e.key==='Enter') doSignup(); });

    // Sub-tabs (traffic & security)
    document.querySelectorAll('.stab').forEach(tab => {
        tab.addEventListener('click', () => {
            const container = tab.closest('.ph')?.parentElement;
            if (!container) return;
            // Deactivate siblings
            tab.closest('.stabs').querySelectorAll('.stab').forEach(t => t.classList.remove('on'));
            tab.classList.add('on');
            // Show matching sub-section
            const key = tab.dataset.sub;
            container.querySelectorAll('.sub').forEach(s => s.style.display = s.dataset.sub===key ? 'block' : 'none');
            // Re-render charts for newly visible sub
            requestAnimationFrame(() => renderPage(container.closest('.pg')?.id));
        });
    });

    // Tools tabs (explorer / reports)
    document.querySelectorAll('.ttab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ttab').forEach(t => t.classList.remove('on'));
            tab.classList.add('on');
            const v = tab.dataset.view;
            document.querySelectorAll('.tview').forEach(el => el.style.display = el.dataset.view===v ? 'block' : 'none');
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   9. CHART THEME HELPERS
   ═══════════════════════════════════════════════════════════════ */
function tc() {                             // theme colours for Chart.js
    const dark = App.theme === 'dark';
    return {
        grid:  dark ? 'rgba(30,42,63,.7)'  : 'rgba(200,210,222,.4)',
        text:  dark ? '#7d8fa3'            : '#5a6577',
        tipBg: dark ? '#111827'            : '#ffffff',
        tipBd: dark ? '#1e2a3f'            : '#dde3ec',
    };
}

function baseOpts(extra={}) {
    const c = tc();
    return {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{
            legend:{ display:false },
            tooltip:{ backgroundColor:c.tipBg, titleColor:'#f0f4ff', bodyColor:'#7d8fa3', borderColor:c.tipBd, borderWidth:1, cornerRadius:8, titleFont:{size:11}, bodyFont:{size:11} },
        },
        scales:{
            x:{ ticks:{ color:c.text, font:{size:10}, maxRotation:0 }, grid:{ color:c.grid } },
            y:{ ticks:{ color:c.text, font:{size:10} }, grid:{ color:c.grid } },
        },
        animation:{ duration:800, easing:'easeOutQuart' },
        ...extra,
    };
}

/* destroy + create helper */
function makeChart(id, config) {
    if (App.drawn.has(id)) return;   // already alive
    App.drawn.add(id);
    const ctx = document.getElementById(id)?.getContext('2d');
    if (!ctx) return;
    if (App.charts[id]) App.charts[id].destroy();
    App.charts[id] = new Chart(ctx, config);
}

/* ═══════════════════════════════════════════════════════════════
   10. PAGE RENDERERS
   ═══════════════════════════════════════════════════════════════ */
function renderPage(id) {
    switch(id) {
        case 'overview':       renderOverview();       break;
        case 'traffic':        renderTraffic();        break;
        case 'sentinel_shield':renderSentinelShield(); break;
        case 'security':       renderSecurity();       break;
        case 'connectivity':   renderConnectivity();   break;
        case 'tools':          renderTools();          break;
    }
}

/* ─── OVERVIEW ─────────────────────────────────────────────── */
function renderOverview() {
    const d = App.data.overview; if (!d) return;
    const m = d.metrics;

    // Animated counters
    countUp('m-totalReq',   m.total_requests);
    countUp('m-peakRps',    m.peak_rps);
    countUp('m-avgRps',     m.avg_rps, 1);
    countUp('m-bots',       m.active_bots);
    countUp('m-dur',        m.duration_hours);
    countUp('m-success',    m.success_rate, 1);
    countUp('m-failures',   m.failures);

    // RPS line chart
    makeChart('chRps', {
        type:'line',
        data:{
            labels: d.rps_timeline.labels,
            datasets:[{
                label:'RPS', data:d.rps_timeline.rps,
                borderColor:'#00e5a0', borderWidth:2,
                backgroundColor:'rgba(0,229,160,.07)',
                fill:true, tension:.35, pointRadius:0, pointHoverRadius:4,
            }],
        },
        options: baseOpts({ scales:{ x:{ ticks:{ maxTicksLimit:14, ...tc() && { color:tc().text, font:{size:10}, maxRotation:0 } } }, y:{ ticks:{ color:tc().text, font:{size:10} } } } }),
    });

    // HTTP method doughnut
    const methods = Object.keys(d.http_methods);
    const vals    = Object.values(d.http_methods);
    makeChart('chMethod', {
        type:'doughnut',
        data:{
            labels:methods,
            datasets:[{ data:vals, backgroundColor:['#00e5a0','#7c6fff','#f5a623','#ff4d4d','#38bdf8'], borderWidth:0 }],
        },
        options:{
            responsive:true, maintainAspectRatio:false, cutout:'64%',
            plugins:{
                legend:{ position:'right', labels:{ color:tc().text, font:{size:10}, padding:10, usePointStyle:true } },
                tooltip:{ backgroundColor:tc().tipBg, titleColor:'#f0f4ff', bodyColor:'#7d8fa3', borderColor:tc().tipBd, borderWidth:1, cornerRadius:8 },
            },
            animation:{ animateRotate:true, duration:900 },
        },
    });
}

/* ─── TRAFFIC ──────────────────────────────────────────────── */
function renderTraffic() {
    const d = App.data.traffic; if (!d) return;

    // Volume bar
    makeChart('chVolume', {
        type:'bar',
        data:{
            labels:d.volume_7d.labels,
            datasets:[{ label:'Requests', data:d.volume_7d.data, backgroundColor:'rgba(0,229,160,.2)', borderColor:'#00e5a0', borderWidth:2, borderRadius:4 }],
        },
        options: baseOpts({ scales:{ x:{ grid:{display:false} }, y:{ ticks:{ callback:v=>(v/1000).toFixed(0)+'k' } } } }),
    });

    // Device pie
    makeChart('chDevice', {
        type:'pie',
        data:{
            labels:d.devices.labels,
            datasets:[{ data:d.devices.data, backgroundColor:['#7c6fff','#00e5a0','#38bdf8'], borderWidth:0 }],
        },
        options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{
                legend:{ position:'right', labels:{ color:tc().text, font:{size:10}, padding:10, usePointStyle:true } },
                tooltip:{ backgroundColor:tc().tipBg, titleColor:'#f0f4ff', bodyColor:'#7d8fa3', borderColor:tc().tipBd, borderWidth:1, cornerRadius:8 },
            },
        },
    });

    // Browsers horizontal bar
    makeChart('chBrowser', {
        type:'bar',
        data:{
            labels:d.browsers.labels,
            datasets:[{ label:'%', data:d.browsers.data, backgroundColor:['#00e5a0','#7c6fff','#f5a623','#38bdf8','#ff4d4d','#34d399'], borderWidth:0, borderRadius:4 }],
        },
        options: baseOpts({ indexAxis:'y', scales:{ x:{ ticks:{ callback:v=>v+'%' } }, y:{ grid:{display:false} } } }),
    });

    // Protocol doughnut
    makeChart('chProto', {
        type:'doughnut',
        data:{
            labels:d.protocols.labels,
            datasets:[{ data:d.protocols.data, backgroundColor:['#ff4d4d','#00e5a0','#7c6fff','#38bdf8'], borderWidth:0 }],
        },
        options:{
            responsive:true, maintainAspectRatio:false, cutout:'60%',
            plugins:{
                legend:{ position:'right', labels:{ color:tc().text, font:{size:9}, padding:8, usePointStyle:true } },
                tooltip:{ backgroundColor:tc().tipBg, titleColor:'#f0f4ff', bodyColor:'#7d8fa3', borderColor:tc().tipBd, borderWidth:1, cornerRadius:8 },
            },
        },
    });

    // Mobile OS bar
    makeChart('chMobOS', {
        type:'bar',
        data:{
            labels:d.mobile_os.labels,
            datasets:[{ label:'%', data:d.mobile_os.data, backgroundColor:['#38bdf8','#34d399','#f5a623','#7d8fa3'], borderWidth:0, borderRadius:4 }],
        },
        options: baseOpts({ scales:{ x:{ grid:{display:false} }, y:{ ticks:{ callback:v=>v+'%' } } } }),
    });

    // Bot table
    renderBotTable();
    renderRobotsTxt();
}

function renderBotTable() {
    const d = App.data.bots; if (!d) return;
    const tbody = document.getElementById('botTbody');
    if (!tbody || tbody.dataset.done) return;
    tbody.dataset.done = '1';
    d.bots.forEach(b => {
        const tr = document.createElement('tr');
        tr.className = b.ai ? 'bot-ai' : '';
        tr.innerHTML = `
            <td><span style="display:inline-flex;align-items:center;gap:6px;">
                <span style="font-size:.6rem;padding:1px 6px;border-radius:10px;font-weight:600;background:${b.ai?'#7c6fff':'var(--bs2)'};color:${b.ai?'#fff':'var(--t3)'}">${b.ai?'AI':'BOT'}</span>
                ${b.name}</span></td>
            <td style="font-family:var(--fm);color:var(--t1)">${b.requests.toLocaleString()}</td>
            <td>${b.ai ? '<span style="color:var(--ok);font-weight:600">✓ Listed</span>' : '<span style="color:var(--t3)">—</span>'}</td>`;
        tbody.appendChild(tr);
    });
}

function renderRobotsTxt() {
    const d = App.data.bots; if (!d) return;
    const el = document.getElementById('robotsList');
    if (!el || el.dataset.done) return;
    el.dataset.done = '1';
    d.robots_txt_agents.forEach(a => {
        el.innerHTML += `<div class="ic" style="margin-bottom:8px">
            <div class="ic__ico ic__ico--a2">🤖</div>
            <div><h4>${a}</h4><p>Found in robots.txt — crawl rules are configured for this agent.</p></div>
        </div>`;
    });
}

/* ─── SECURITY ─────────────────────────────────────────────── */
function renderSecurity() {
    const d = App.data.security; if (!d) return;

    // Update badges + totals
    setBadge('chgApp', d.app_layer.change_pct);
    setBadge('chgNet', d.net_layer.change_pct);
    setText('totApp', d.app_layer.total_24h.toLocaleString());
    setText('totNet', d.net_layer.total_24h.toLocaleString());

    // App layer timeline
    makeChart('chAppLine', {
        type:'line',
        data:{
            labels:d.app_layer.timeline.labels,
            datasets:[{ label:'Attacks', data:d.app_layer.timeline.data, borderColor:'#ff4d4d', borderWidth:2, backgroundColor:'rgba(255,77,77,.08)', fill:true, tension:.3, pointRadius:0, pointHoverRadius:4 }],
        },
        options: baseOpts({}),
    });

    // App attack types (horizontal bar)
    makeChart('chAppTypes', {
        type:'bar',
        data:{
            labels:d.app_layer.types.map(t=>t.type),
            datasets:[{ label:'Count', data:d.app_layer.types.map(t=>t.count), backgroundColor:['#ff4d4d','#f5a623','#7c6fff','#38bdf8','#34d399'], borderWidth:0, borderRadius:4 }],
        },
        options: baseOpts({ indexAxis:'y', scales:{ x:{}, y:{ grid:{display:false} } } }),
    });

    // Net layer timeline
    makeChart('chNetLine', {
        type:'line',
        data:{
            labels:d.net_layer.timeline.labels,
            datasets:[{ label:'Attacks', data:d.net_layer.timeline.data, borderColor:'#7c6fff', borderWidth:2, backgroundColor:'rgba(124,111,255,.08)', fill:true, tension:.3, pointRadius:0, pointHoverRadius:4 }],
        },
        options: baseOpts({}),
    });

    // Net attack types (doughnut)
    makeChart('chNetTypes', {
        type:'doughnut',
        data:{
            labels:d.net_layer.types.map(t=>t.type),
            datasets:[{ data:d.net_layer.types.map(t=>t.count), backgroundColor:['#7c6fff','#38bdf8','#f5a623','#ff4d4d'], borderWidth:0 }],
        },
        options:{
            responsive:true, maintainAspectRatio:false, cutout:'60%',
            plugins:{
                legend:{ position:'right', labels:{ color:tc().text, font:{size:9}, padding:8, usePointStyle:true } },
                tooltip:{ backgroundColor:tc().tipBg, titleColor:'#f0f4ff', bodyColor:'#7d8fa3', borderColor:tc().tipBd, borderWidth:1, cornerRadius:8 },
            },
        },
    });
}

/* ─── SENTINEL SHIELD ─────────────────────────────────────────── */
function renderSentinelShield() {
    const d = App.data.sentinel_shield; if (!d) return;
    
    // Update status indicators
    const statusEl = document.getElementById('attackIndicator');
    const phaseEl = document.getElementById('phaseInfo');
    if (statusEl) {
        statusEl.className = `status-indicator ${d.status.attack_detected ? 'status-attack' : 'status-normal'}`;
        statusEl.querySelector('.status-text').textContent = d.status.attack_detected ? 'ATTACK DETECTED' : 'SYSTEM NORMAL';
    }
    if (phaseEl) phaseEl.textContent = `Phase: ${d.status.current_phase.charAt(0).toUpperCase() + d.status.current_phase.slice(1)}`;
    
    // Traffic Rate
    makeChart('chTrafficRate', {
        type:'line',
        data:{
            labels:d.realtime_metrics.traffic_rate.labels,
            datasets:[{ 
                label:'Requests/sec', 
                data:d.realtime_metrics.traffic_rate.data, 
                borderColor:'#3b82f6', 
                borderWidth:2, 
                backgroundColor:'rgba(59,130,246,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // Shannon Entropy
    makeChart('chShannonEntropy', {
        type:'line',
        data:{
            labels:d.realtime_metrics.shannon_entropy.labels,
            datasets:[{ 
                label:'Entropy', 
                data:d.realtime_metrics.shannon_entropy.data, 
                borderColor:'#22c55e', 
                borderWidth:2, 
                backgroundColor:'rgba(34,197,94,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // Hurst Exponent
    makeChart('chHurstExponent', {
        type:'line',
        data:{
            labels:d.realtime_metrics.hurst_exponent.labels,
            datasets:[{ 
                label:'Hurst', 
                data:d.realtime_metrics.hurst_exponent.data, 
                borderColor:'#ec4899', 
                borderWidth:2, 
                backgroundColor:'rgba(236,72,153,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // Burst Intensity
    makeChart('chBurstIntensity', {
        type:'line',
        data:{
            labels:d.realtime_metrics.burst_intensity.labels,
            datasets:[{ 
                label:'Burst', 
                data:d.realtime_metrics.burst_intensity.data, 
                borderColor:'#06b6d4', 
                borderWidth:2, 
                backgroundColor:'rgba(6,182,212,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // Periodicity
    makeChart('chPeriodicity', {
        type:'line',
        data:{
            labels:d.realtime_metrics.periodicity.labels,
            datasets:[{ 
                label:'Periodicity', 
                data:d.realtime_metrics.periodicity.data, 
                borderColor:'#f59e0b', 
                borderWidth:2, 
                backgroundColor:'rgba(245,158,11,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // Frequency Peak
    makeChart('chFrequencyPeak', {
        type:'line',
        data:{
            labels:d.realtime_metrics.frequency_peak.labels,
            datasets:[{ 
                label:'Frequency', 
                data:d.realtime_metrics.frequency_peak.data, 
                borderColor:'#a855f7', 
                borderWidth:2, 
                backgroundColor:'rgba(168,85,247,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // SP Anomaly Score
    makeChart('chSpAnomalyScore', {
        type:'line',
        data:{
            labels:d.realtime_metrics.sp_anomaly_score.labels,
            datasets:[{ 
                label:'Anomaly Score', 
                data:d.realtime_metrics.sp_anomaly_score.data, 
                borderColor:'#ef4444', 
                borderWidth:2, 
                backgroundColor:'rgba(239,68,68,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // ML Attack Probability
    makeChart('chMlAttackProbability', {
        type:'line',
        data:{
            labels:d.realtime_metrics.ml_attack_probability.labels,
            datasets:[{ 
                label:'Attack Probability', 
                data:d.realtime_metrics.ml_attack_probability.data, 
                borderColor:'#6366f1', 
                borderWidth:2, 
                backgroundColor:'rgba(99,102,241,.08)', 
                fill:true, 
                tension:.3, 
                pointRadius:0, 
                pointHoverRadius:4 
            }],
        },
        options: baseOpts({}),
    });
    
    // Feature Importance
    makeChart('chFeatureImportance', {
        type:'bar',
        data:{
            labels:d.analysis.feature_importance.map(f=>f.feature),
            datasets:[{ 
                label:'Importance', 
                data:d.analysis.feature_importance.map(f=>f.importance), 
                backgroundColor:'#14b8a6', 
                borderWidth:0 
            }],
        },
        options: baseOpts({}),
    });
    
    // Detection Comparison
    makeChart('chDetectionComparison', {
        type:'line',
        data:{
            labels:d.realtime_metrics.traffic_rate.labels,
            datasets:[
                { label:'Ground Truth', data: d.realtime_metrics.traffic_rate.data.map(v => v > 400 ? 1 : 0), borderColor:'#84cc16', borderWidth:2, borderDash:[5,5], pointRadius:0 },
                { label:'SP Detection', data: d.realtime_metrics.sp_anomaly_score.data.map(v => v > 0.7 ? 1 : 0), borderColor:'#f97316', borderWidth:2, pointRadius:0 },
                { label:'ML Detection', data: d.realtime_metrics.ml_attack_probability.data.map(v => v > 0.5 ? 1 : 0), borderColor:'#6366f1', borderWidth:2, pointRadius:0 },
            ],
        },
        options: baseOpts({}),
    });
    
    // Render confusion matrices
    renderConfusionMatrix('spMatrix', d.analysis.sp_confusion_matrix);
    renderConfusionMatrix('mlMatrix', d.analysis.ml_confusion_matrix);
    
    // Render mitigation actions
    renderMitigationActions(d.mitigation);
    
    // Render performance metrics
    renderPerformanceMetrics(d.analysis.detection_performance);
    
    // Render thresholds
    renderThresholds(d.thresholds);
}

function renderConfusionMatrix(containerId, matrix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="matrix-grid">
            <div class="matrix-cell cell-tn">${matrix.tn}</div>
            <div class="matrix-cell cell-fp">${matrix.fp}</div>
            <div class="matrix-cell cell-fn">${matrix.fn}</div>
            <div class="matrix-cell cell-tp">${matrix.tp}</div>
        </div>
        <div class="matrix-labels">
            <div class="matrix-label label-predicted">Predicted</div>
            <div class="matrix-label label-actual">Actual</div>
        </div>
    `;
}

function renderMitigationActions(mitigation) {
    const container = document.getElementById('mitigationGrid');
    if (!container) return;
    
    container.innerHTML = mitigation.map(action => `
        <div class="mitigation-item ${action.status}">
            <div class="mitigation-icon">${action.status === 'active' ? '🛡️' : '⏸️'}</div>
            <div class="mitigation-content">
                <h4>${action.action}</h4>
                <p>${action.threshold || action.blocked_ips ? `${action.threshold || action.blocked_ips + ' IPs blocked'}` : 'Standby'}</p>
            </div>
            <div class="mitigation-status">${action.status}</div>
        </div>
    `).join('');
}

function renderPerformanceMetrics(performance) {
    const container = document.getElementById('perfMetrics');
    if (!container) return;
    
    container.innerHTML = `
        <div class="perf-item">
            <span class="perf-label">SP Accuracy</span>
            <span class="perf-value">${performance.sp_accuracy}%</span>
        </div>
        <div class="perf-item">
            <span class="perf-label">ML Accuracy</span>
            <span class="perf-value">${performance.ml_accuracy}%</span>
        </div>
        <div class="perf-item">
            <span class="perf-label">Detection Latency</span>
            <span class="perf-value">${performance.detection_latency_ms}ms</span>
        </div>
        <div class="perf-item">
            <span class="perf-label">False Positive Rate</span>
            <span class="perf-value">${performance.false_positive_rate}%</span>
        </div>
    `;
}

function renderThresholds(thresholds) {
    const container = document.getElementById('thresholdList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="threshold-item">
            <span class="threshold-label">Entropy Threshold</span>
            <span class="threshold-value">${thresholds.entropy_threshold}</span>
        </div>
        <div class="threshold-item">
            <span class="threshold-label">Hurst Threshold</span>
            <span class="threshold-value">${thresholds.hurst_threshold}</span>
        </div>
        <div class="threshold-item">
            <span class="threshold-label">Anomaly Threshold</span>
            <span class="threshold-value">${thresholds.anomaly_threshold}</span>
        </div>
        <div class="threshold-item">
            <span class="threshold-label">ML Decision Boundary</span>
            <span class="threshold-value">${thresholds.ml_decision_boundary}</span>
        </div>
    `;
}

function setBadge(id, pct) {
    const el = document.getElementById(id); if(!el) return;
    const up = pct > 0;
    el.className = 'chg ' + (up ? 'chg--up' : 'chg--dn');
    el.innerHTML = (up?'▲':'▼') + ' ' + Math.abs(pct) + '%';
}
function setText(id, txt) { const el=document.getElementById(id); if(el) el.textContent=txt; }

/* ─── CONNECTIVITY ─────────────────────────────────────────── */
function renderConnectivity() {
    const d = App.data.connectivity; if (!d) return;

    setText('cn-iqi',  d.current.iqi);
    setText('cn-dl',   d.current.download+' Mbps');
    setText('cn-ul',   d.current.upload+' Mbps');
    setText('cn-lat',  d.current.latency+' ms');

    // Speed line
    makeChart('chSpeed', {
        type:'line',
        data:{
            labels:d.timeline.labels,
            datasets:[
                { label:'Download', data:d.timeline.download, borderColor:'#00e5a0', borderWidth:2.5, backgroundColor:'rgba(0,229,160,.07)', fill:true, tension:.35, pointRadius:2, pointHoverRadius:5 },
                { label:'Upload',   data:d.timeline.upload,   borderColor:'#7c6fff', borderWidth:2, backgroundColor:'rgba(124,111,255,.05)', fill:true, tension:.35, pointRadius:2, pointHoverRadius:5 },
            ],
        },
        options:{
            ...baseOpts({}),
            plugins:{
                legend:{ display:true, labels:{ color:tc().text, font:{size:10}, usePointStyle:true } },
                tooltip:{ backgroundColor:tc().tipBg, titleColor:'#f0f4ff', bodyColor:'#7d8fa3', borderColor:tc().tipBd, borderWidth:1, cornerRadius:8 },
            },
            scales:{ y:{ ticks:{ callback:v=>v+' Mbps', color:tc().text, font:{size:10} }, grid:{ color:tc().grid } }, x:{ ticks:{ color:tc().text, font:{size:10} }, grid:{ color:tc().grid } } },
        },
    });

    // IQI trend
    makeChart('chIQI', {
        type:'line',
        data:{
            labels:d.timeline.labels,
            datasets:[{ label:'IQI', data:d.timeline.iqi, borderColor:'#f5a623', borderWidth:2.5, backgroundColor:'rgba(245,166,35,.09)', fill:true, tension:.4, pointRadius:2, pointHoverRadius:5 }],
        },
        options: baseOpts({ scales:{ y:{ min:50, max:100 } } }),
    });

    // Latency bar
    makeChart('chLatency', {
        type:'bar',
        data:{
            labels:d.timeline.labels,
            datasets:[{
                label:'Latency', data:d.timeline.latency,
                backgroundColor:d.timeline.latency.map(v => v<20?'rgba(52,211,153,.45)': v<28?'rgba(245,166,35,.45)':'rgba(255,77,77,.45)'),
                borderWidth:0, borderRadius:3,
            }],
        },
        options: baseOpts({ scales:{ x:{ grid:{display:false} }, y:{ ticks:{ callback:v=>v+' ms' } } } }),
    });
}

/* ─── TOOLS ────────────────────────────────────────────────── */
function renderTools() {
    const d = App.data.tools; if (!d) return;
    renderExplorer(d.explorer);
    renderReports(d.reports);
    bindFilters(d.explorer);
}

function renderExplorer(rows, filtered) {
    const data = filtered || rows;
    const tbody = document.getElementById('expTbody'); if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(r => {
        const sc = r.status===200?'s200':r.status===404?'s404':'s500';
        tbody.innerHTML += `<tr>
            <td>${r.id}</td>
            <td style="font-family:var(--fm);font-size:.74rem">${r.time}</td>
            <td style="font-weight:600;color:var(--a)">${r.method}</td>
            <td class="${sc}">${r.status}</td>
            <td>${r.protocol}</td><td>${r.device}</td><td>${r.region}</td>
            <td style="font-family:var(--fm)">${r.latency}</td>`;
    });
}

function renderReports(reports) {
    const el = document.getElementById('reportList'); if (!el || el.dataset.done) return;
    el.dataset.done = '1';
    const iconMap = { monthly:'📊', quarterly:'📈', yearly:'📋' };
    const classMap = { monthly:'ritem__ico--m', quarterly:'ritem__ico--q', yearly:'ritem__ico--y' };
    reports.forEach(r => {
        el.innerHTML += `<div class="ritem">
            <div class="ritem__l">
                <div class="ritem__ico ${classMap[r.type]}">${iconMap[r.type]}</div>
                <div><h4>${r.title}</h4><p>${r.date} · ${r.type.charAt(0).toUpperCase()+r.type.slice(1)}</p></div>
            </div>
            <div class="ritem__r">
                <span class="ritem__sz">${r.size}</span>
                <button class="btn btn--g btn--sm" onclick="alert('⬇ Downloading: ${r.title}')">⬇ Download</button>
            </div>
        </div>`;
    });
}

function bindFilters(allRows) {
    const btn = document.getElementById('filterApply');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
        let rows = allRows;
        const p = document.getElementById('fProto')?.value;
        const d = document.getElementById('fDevice')?.value;
        const r = document.getElementById('fRegion')?.value;
        if (p) rows = rows.filter(x => x.protocol===p);
        if (d) rows = rows.filter(x => x.device===d);
        if (r) rows = rows.filter(x => x.region===r);
        renderExplorer(allRows, rows);
    });
    document.getElementById('filterReset')?.addEventListener('click', () => {
        ['fProto','fDevice','fRegion'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
        renderExplorer(allRows);
    });
}

/* ═══════════════════════════════════════════════════════════════
   11. SENTINEL SHIELD DUMMY DATA
   ═══════════════════════════════════════════════════════════════ */
function dummySentinelShield() {
    // Generate 500 seconds of data with DDoS attack at t=200-400s
    const timeLabels = [];
    const trafficRate = [];
    const shannonEntropy = [];
    const hurstExponent = [];
    const burstIntensity = [];
    const periodicity = [];
    const frequencyPeak = [];
    const spAnomalyScore = [];
    const mlAttackProbability = [];
    
    for (let i = 0; i < 500; i++) {
        timeLabels.push(i);
        const isAttack = i >= 200 && i <= 400;
        
        // Traffic Rate (requests/sec)
        trafficRate.push(isAttack ? 800 + Math.random() * 100 - 50 : 50 + Math.random() * 50 - 25);
        
        // Shannon Entropy (IP diversity) - drops during attack
        shannonEntropy.push(isAttack ? 2.1 + Math.random() * 0.5 - 0.25 : 4.2 + Math.random() * 0.7 - 0.35);
        
        // Hurst Exponent (self-similarity) - >0.5 during attack
        hurstExponent.push(isAttack ? 0.72 + Math.random() * 0.13 - 0.065 : 0.42 + Math.random() * 0.18 - 0.09);
        
        // Burst Intensity (wavelet-based)
        burstIntensity.push(isAttack ? 0.85 + Math.random() * 0.25 - 0.125 : 0.15 + Math.random() * 0.15 - 0.075);
        
        // Periodicity (auto-correlation)
        periodicity.push(isAttack ? 0.78 + Math.random() * 0.20 - 0.10 : 0.22 + Math.random() * 0.18 - 0.09);
        
        // Frequency Peak (FFT analysis)
        frequencyPeak.push(isAttack ? 0.92 + Math.random() * 0.13 - 0.065 : 0.28 + Math.random() * 0.20 - 0.10);
        
        // SP Anomaly Score (signal processing fusion)
        spAnomalyScore.push(isAttack ? 0.88 + Math.random() * 0.20 - 0.10 : 0.12 + Math.random() * 0.13 - 0.065);
        
        // ML Attack Probability
        mlAttackProbability.push(isAttack ? 0.95 + Math.random() * 0.10 - 0.05 : 0.03 + Math.random() * 0.07 - 0.035);
    }
    
    return {
        status: {
            attack_detected: true,
            attack_start: 200,
            attack_end: 400,
            current_phase: 'mitigation',
            system_health: 'operational',
        },
        realtime_metrics: {
            traffic_rate: { labels: timeLabels, data: trafficRate },
            shannon_entropy: { labels: timeLabels, data: shannonEntropy },
            hurst_exponent: { labels: timeLabels, data: hurstExponent },
            burst_intensity: { labels: timeLabels, data: burstIntensity },
            periodicity: { labels: timeLabels, data: periodicity },
            frequency_peak: { labels: timeLabels, data: frequencyPeak },
            sp_anomaly_score: { labels: timeLabels, data: spAnomalyScore },
            ml_attack_probability: { labels: timeLabels, data: mlAttackProbability },
        },
        analysis: {
            feature_importance: [
                { feature: 'CurrentRate', importance: 0.42 },
                { feature: 'ShannonEntropy', importance: 0.18 },
                { feature: 'HurstExponent', importance: 0.15 },
                { feature: 'BurstIntensity', importance: 0.12 },
                { feature: 'Periodicity', importance: 0.08 },
                { feature: 'FrequencyPeak', importance: 0.05 },
            ],
            sp_confusion_matrix: { tn: 340, fp: 10, fn: 20, tp: 130 },
            ml_confusion_matrix: { tn: 350, fp: 0, fn: 0, tp: 150 },
            detection_performance: {
                sp_accuracy: 94.0,
                sp_precision: 92.9,
                sp_recall: 86.7,
                ml_accuracy: 100.0,
                ml_precision: 100.0,
                ml_recall: 100.0,
                detection_latency_ms: 45,
                false_positive_rate: 0.0,
            },
        },
        mitigation: [
            { action: 'Rate Limit', status: 'active', threshold: '100 req/s' },
            { action: 'IP Block', status: 'active', blocked_ips: 127 },
            { action: 'CAPTCHA', status: 'standby', trigger_threshold: '80%' },
        ],
        thresholds: {
            entropy_threshold: 3.0,
            hurst_threshold: 0.5,
            anomaly_threshold: 0.7,
            ml_decision_boundary: 0.5,
        },
    };
}

/* ═══════════════════════════════════════════════════════════════
   12. ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
function countUp(id, target, dec=0) {
    const el = document.getElementById(id); if (!el) return;
    const dur = 1100, start = performance.now();
    (function step(now) {
        const p = Math.min((now-start)/dur, 1);
        const e = 1 - Math.pow(1-p, 3);           // ease-out cubic
        const v = target * e;
        el.textContent = dec ? v.toFixed(dec) : Math.floor(v).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
    })(start);
}
