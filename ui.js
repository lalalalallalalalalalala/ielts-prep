(function(){const T={...tabs};const order=[['Говорение','Speaking'],['Письмо','Writing'],['Чтение','Reading'],['Аудирование','Listening'],['Грамматика','Grammar'],['Словарь C1/C2','Словарь C1/C2'],['Прогресс','Progress']];
for(const k in T)delete tabs[k];order.forEach(([ru,en])=>tabs[ru]=T[en]);
const h=decodeURIComponent(location.hash.slice(1));cur=tabs[h]?h:(tabs[localStorage.lastTab]?localStorage.lastTab:'Говорение')})();
function nav(){const n=document.getElementById('nav');n.setAttribute('role','tablist');n.setAttribute('aria-label','Разделы');n.innerHTML=Object.keys(tabs).map(t=>`<button role="tab" aria-selected="${t==cur}" class="${t==cur?'on':''}" onclick="go('${t}')">${t}</button>`).join('')}
const _go=go;go=function(t){if(!tabs[t])t='Говорение';if(window.speechSynthesis)speechSynthesis.cancel();localStorage.lastTab=t;history.replaceState(null,'','#'+encodeURIComponent(t));_go(t);scrollTo(0,0)};
const TYPE_RU={writing:'Письмо',speaking:'Говорение',reading:'Чтение',listening:'Аудирование'};
const _pr=tabs['Прогресс'];tabs['Прогресс']=function(){_pr();document.querySelectorAll('#app table td:nth-child(2)').forEach(td=>td.textContent=TYPE_RU[td.textContent]||td.textContent)};
