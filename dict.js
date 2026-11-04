const V=window.VOCAB,DAY=864e5,IV=[0,1,3,7,14,30,60];
const LS=k=>JSON.parse(localStorage[k]||'{}'),SV=(k,v)=>localStorage[k]=JSON.stringify(v);
let DF={q:'',l:'',t:'',mode:'list',fc:0,flip:0};
const learned=()=>LS('vLearned'),srs=()=>LS('vSRS');
function say(w){if(!window.speechSynthesis)return alert('Озвучка не поддерживается');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang='en-GB';u.rate=.9;speechSynthesis.speak(u)}
function toggleL(w){const L=learned();L[w]?delete L[w]:L[w]=Date.now();SV('vLearned',L);dict()}
function grade(w,ok){const S=srs();const e=S[w]||{b:0};e.b=ok?Math.min(e.b+1,IV.length-1):0;e.due=Date.now()+IV[e.b]*DAY+(ok?0:6e4);S[w]=e;SV('vSRS',S)}
function filtered(){const q=DF.q.toLowerCase();return V.filter(v=>(!DF.l||v.l==DF.l)&&(!DF.t||v.t==DF.t)&&(!q||(v.w+' '+v.ru+' '+v.syn.join(' ')).toLowerCase().includes(q)))}
function dueList(){const S=srs(),n=Date.now();return V.filter(v=>S[v.w]&&S[v.w].due<=n)}
function card(v,L){return `<div class="card"><b style="font-size:20px">${v.w}</b> <small>${v.p} · <span style="background:${v.l=='C2'?'#7b2cbf':'#1f4fd1'};color:#fff;padding:1px 6px;border-radius:6px">${v.l}</span> · ${v.t}</small>
<button class="btn" onclick="say('${v.w}')">🔊</button><button class="btn" style="background:${L[v.w]?'#127a2e':'#888'}" onclick="toggleL('${v.w}')">${L[v.w]?'✓ выучено':'отметить выученным'}</button>
<div><b>${v.ru}</b> — ${v.d}</div><div><i>“${v.ex}”</i></div><small>Синонимы: ${v.syn.join(', ')} · Коллокации: ${v.col.join('; ')}</small></div>`}
function dict(){const topics=[...new Set(V.map(v=>v.t))].sort(),L=learned(),due=dueList().length;
let h=`<div class="card"><h3>Словарь C1/C2 <small>(${V.length} слов · выучено ${Object.keys(L).length} · на повторение ${due})</small></h3>
<input id="dq" placeholder="Поиск (англ./рус.)" value="${DF.q}" oninput="DF.q=this.value;dictBody()" style="padding:8px;width:220px">
<select onchange="DF.l=this.value;dictBody()"><option value="">Все уровни</option>${['C1','C2'].map(x=>`<option ${DF.l==x?'selected':''}>${x}</option>`)}</select>
<select onchange="DF.t=this.value;dictBody()"><option value="">Все темы</option>${topics.map(x=>`<option ${DF.t==x?'selected':''}>${x}</option>`)}</select><br>
${[['list','Список'],['fc','Карточки'],['quiz','Тест'],['srs','Повторение ('+due+')']].map(([m,n])=>`<button class="btn" style="${DF.mode==m?'':'background:#8aa0e0'}" onclick="DF.mode='${m}';dict()">${n}</button>`).join('')}</div><div id="db"></div>`;
app.innerHTML=h;dictBody()}
function dictBody(){const f=filtered(),L=learned(),db=document.getElementById('db');
if(DF.mode=='list')db.innerHTML=f.slice(0,60).map(v=>card(v,L)).join('')+(f.length>60?`<small>Показано 60 из ${f.length} — уточните поиск</small>`:'')+(f.length?'':'<p>Ничего не найдено</p>');
else if(DF.mode=='fc'){if(!f.length)return db.innerHTML='<p>Нет слов</p>';const v=f[DF.fc%f.length];db.innerHTML=`<div class="card" style="text-align:center"><small>${DF.fc%f.length+1}/${f.length}</small><h1>${v.w}</h1><button class="btn" onclick="say('${v.w}')">🔊</button>${DF.flip?card(v,L):'<p><button class="btn" onclick="DF.flip=1;dictBody()">Показать</button></p>'}
<button class="btn" style="background:#b3261e" onclick="grade('${v.w}',0);DF.flip=0;DF.fc++;dictBody()">Не знаю</button><button class="btn" style="background:#127a2e" onclick="grade('${v.w}',1);DF.flip=0;DF.fc++;dictBody()">Знаю</button></div>`}
else quiz(DF.mode=='srs'?dueList():f)}
function lev(a,b){const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]==b[j-1]?0:1));p=t}}return d[b.length]}
function traps(v,n){const C=window.CONFUSE.find(c=>c.slice(0,2).includes(v.w));let pool=V.filter(x=>x.w!=v.w);
let tr=C?pool.filter(x=>C.slice(0,2).includes(x.w)):[];const sim=pool.filter(x=>x.p==v.p&&!tr.includes(x)).map(x=>[lev(x.w,v.w)-(x.w[0]==v.w[0]?1:0)-(x.t==v.t?.5:0),x]).sort((a,b)=>a[0]-b[0]).slice(0,8).map(x=>x[1]);
sim.sort(()=>Math.random()-.5);tr=tr.concat(sim).slice(0,n);return {tr,note:C?C[2]:''}}
let QZ=null;
function quiz(list){const db=document.getElementById('db');if(!list.length)return db.innerHTML='<div class="card">'+(DF.mode=='srs'?'Нет слов на повторение 🎉 Отмечайте «Не знаю» в карточках или ошибайтесь в тесте — такие слова появятся здесь.':'Нет слов')+'</div>';
const v=list[Math.floor(Math.random()*list.length)],type=Math.random()<.5?'mcq':'gap',{tr,note}=traps(v,3);
const opts=[v,...tr].sort(()=>Math.random()-.5);QZ={v,tr,note,type};
const re=new RegExp('\\b'+v.w.split(' ')[0].slice(0,Math.max(4,v.w.length-3))+'\\w*','i');
db.innerHTML=`<div class="card">${type=='mcq'?`<p>Какое значение у слова <b style="font-size:20px">${v.w}</b>? <button class="btn" onclick="say('${v.w}')">🔊</button></p>${opts.map(o=>`<button class="btn" style="display:block;width:100%;text-align:left;background:#e8eefc;color:#1c2333" onclick="ans('${o.w}')">${o.ru} — <small>${o.d}</small></button>`).join('')}`
:`<p>Вставьте слово: <i>${v.ex.replace(re,'_____')}</i></p><small>(${v.ru})</small><br>${opts.map(o=>`<button class="btn" onclick="ans('${o.w}')">${o.w}</button>`).join('')}`}<div id="qr"></div></div>`}
function ans(w){const {v,tr,note}=QZ,ok=w==v.w;grade(v.w,ok);const s=LS('vQuiz');s.n=(s.n||0)+1;s.ok=(s.ok||0)+ok;SV('vQuiz',s);const t=V.find(x=>x.w==w);
qr.innerHTML=`<p class="${ok?'ok':'bad'}"><b>${ok?'✓ Верно!':'✗ Неверно. Правильно: '+v.w}</b></p>${!ok?`<p><b>${w}</b> = ${t.ru} (${t.d}) — ловушка: ${lev(w,v.w)<=3?'похожее написание':'похожая тема/часть речи'}. <b>${v.w}</b> = ${v.ru} (${v.d}).</p>`:''}${note?`<p>💡 ${note}</p>`:''}<p><i>${v.ex}</i></p><small>Коллокации: ${v.col.join('; ')} · Счёт: ${s.ok}/${s.n}</small><br><button class="btn" onclick="dictBody()">Следующий →</button>`;
qr.parentNode.querySelectorAll('button[onclick^=ans]').forEach(b=>b.disabled=true)}
tabs['Словарь C1/C2']=dict;
