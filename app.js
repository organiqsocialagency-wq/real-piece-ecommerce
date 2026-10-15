'use strict';
const products = [
  {id:'east-blue-west-coast',name:'East Blue / West Coast',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/east-blue-logo-front.png',tag:'GREAT ERA',gallery:[{src:'assets/east-blue-logo-front.png',label:'Logo davanti · stampa dietro'},{src:'assets/east-blue-print.png',label:'Dettaglio stampa'},{src:'assets/east-blue-label.png',label:'Etichetta Real Piece'},{src:'assets/great-era-emienel-boyz.png',label:'Grafica originale'}],description:'East Blue incontra la West Coast. Il logo Real Piece davanti, la ciurma e il segno rosso sul retro.'},
  {id:'dracula',name:'Dracula',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-dracula.png',tag:'GREAT ERA',description:'Uno sguardo taglia il buio. Dracula incontra gli occhi del più grande spadaccino.'},
  {id:'hulkwhite',name:'Hulkwhite',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-hulkwhite.png',tag:'GREAT ERA',description:'Il baffo più famoso dei mari incontra un’icona del ring. Un omaggio alla forza di Barbabianca.'},
  {id:'roger',name:'Great Era / Roger',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-roger.png',tag:'GREAT ERA',description:'Il tesoro è là fuori. Da quella frase è cominciata la Grande Era della Pirateria.'},
  {id:'real-pulp',name:'Real Pulp',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-real-pulp.png',tag:'GREAT ERA',description:'Manga, cinema pulp e un titolo che dice tutto: Real Piece.'},
  {id:'nika-rupestre',name:'Nika Rupestre',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-nika.png',tag:'GREAT ERA',description:'La danza di Nika come un segno inciso nella pietra. Libertà dall’inizio dei tempi.'},
  {id:'trafalgar-46',name:'Trafalgar 46',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-trafalgar.png',tag:'GREAT ERA',description:'Trafalgar Law cambia corsia. Dal mare alla pista, sempre senza chiedere permesso.'},
  {id:'vegapunk',name:'Vegapunk',price:45,color:'Nero',hex:'#141414',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-vegapunk.png',tag:'GREAT ERA',description:'La mela, la mente e un’idea fuori scala. Scienza e Grand Line sullo stesso capo.'}
];
const sizes=['XS','S','M','L','XL','XXL','3XL','4XL','5XL'];
const money = value => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(value);
const $ = selector => document.querySelector(selector);
let category='all',activeProduct=null,toastTimer;
let cart=[];
try{const saved=JSON.parse(localStorage.getItem('real-piece-cart')||'[]');if(Array.isArray(saved))cart=saved.filter(x=>products.some(p=>p.id===x.id)&&sizes.includes(x.size)&&Number.isInteger(x.quantity)&&x.quantity>0&&x.quantity<=20).map(({id,size,quantity})=>({id,size,quantity}));}catch{}
function saveCart(){try{localStorage.setItem('real-piece-cart',JSON.stringify(cart));}catch{}$('#cart-count').textContent=cart.reduce((n,x)=>n+x.quantity,0);renderCart();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function openDialog(id){const d=$(id);if(!d.open)d.showModal();}
function productVisual(p,mode='card'){
  return `<span class="product-visual product-visual-${mode}"><img class="mockup-photo" src="${p.image}" alt="${p.name}: T-shirt nera vista davanti e dietro" ${mode==='card'?'loading="lazy"':''} draggable="false">${p.artwork?`<img class="mockup-print" src="${p.artwork}" alt="" ${mode==='card'?'loading="lazy"':''} draggable="false">`:''}</span>`;
}
function renderProducts(){
  const query=$('#search').value.trim().toLocaleLowerCase('it');
  let list=products.filter(p=>(category==='all'||p.category===category)&&`${p.name} ${p.color}`.toLocaleLowerCase('it').includes(query));
  const sort=$('#sort').value;
  if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);
  $('#product-grid').innerHTML=list.length?list.map(p=>`<article class="product-card"><button type="button" class="catalog-image-button" data-product="${p.id}" aria-label="Apri scheda ${p.name}"><span class="catalog-media">${productVisual(p)}</span><span class="product-tag">${p.tag}</span></button><div class="product-info"><button class="product-name" data-product="${p.id}">${p.name}</button><span class="price">${money(p.price)}</span></div><p class="product-meta"><span class="swatch" style="background:${p.hex}"></span>${p.color} · Unisex</p><button type="button" class="button button-dark specular-cta product-cart-cta" data-product="${p.id}" aria-label="Aggiungi ${p.name} al carrello: scegli la taglia">Aggiungi al carrello <span aria-hidden="true">+</span></button></article>`).join(''):'<div class="empty-results"><p>Nessuna T-shirt trovata.</p><button class="text-button" id="reset-filters">Mostra tutta la collezione</button></div>';
  $('#result-status').textContent=`${list.length} prodotti visualizzati`;
}
document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  document.querySelectorAll('.specular-cta').forEach(button=>{
    const r=button.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const nearestX=Math.max(r.left,Math.min(e.clientX,r.right));
    const nearestY=Math.max(r.top,Math.min(e.clientY,r.bottom));
    const distance=Math.hypot(e.clientX-nearestX,e.clientY-nearestY);
    const intensity=Math.pow(Math.max(0,1-distance/250),2);
    button.style.setProperty('--spec-x',`${Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))}%`);
    button.style.setProperty('--spec-y',`${Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))}%`);
    button.style.setProperty('--spec-strength',`${Math.round(30+70*intensity)}%`);
    button.style.setProperty('--spec-soft-strength',`${Math.round(4+11*intensity)}%`);
  });
},{passive:true});
function setCategory(value){category=value;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===value);b.setAttribute('aria-pressed',String(b.dataset.filter===value));});renderProducts();}
function showProduct(id){
  const p=products.find(p=>p.id===id);
  if(!p)return;
  activeProduct=p;
  const gallery=p.artwork
    ? `<div class="product-gallery"><div id="gallery-stage" class="gallery-stage">${productVisual(p,'detail')}</div><div class="gallery-thumbnails" role="group" aria-label="Immagini prodotto"><button type="button" data-gallery-view="mockup" aria-label="Fronte e retro" aria-pressed="true"><img src="${p.image}" alt=""><span>Fronte / retro</span></button><button type="button" data-gallery-view="artwork" aria-label="Grafica originale" aria-pressed="false"><img src="${p.artwork}" alt=""><span>Stampa originale</span></button><button type="button" data-gallery-view="logo" aria-label="Logo sul davanti" aria-pressed="false"><img src="assets/real-piece-front-logo.png" alt=""><span>Logo davanti</span></button></div></div>`
    : `<div class="product-gallery"><img id="gallery-main" class="gallery-main" src="${p.image}" alt="${p.name} — Fronte e retro"><div class="gallery-thumbnails" role="group" aria-label="Immagini prodotto">${p.gallery.map((photo,i)=>`<button type="button" data-gallery-index="${i}" aria-label="${photo.label}" aria-pressed="${i===0}"><img src="${photo.src}" alt=""><span>${photo.label}</span></button>`).join('')}</div></div>`;
  $('#product-detail').innerHTML=`<div class="product-detail-grid">${gallery}<div class="detail-copy"><p class="eyebrow red">REAL PIECE / GREAT ERA</p><h2 id="product-title">${p.name}</h2><div class="detail-price">${money(p.price)}</div><p class="detail-description">${p.description}</p><p class="product-meta"><span class="swatch" style="background:${p.hex}"></span>${p.color} · Vestibilità unisex</p><form id="add-form"><div class="size-label"><span id="size-heading">Seleziona la taglia</span><button type="button" class="text-button" data-info="sizes">Guida taglie</button></div><fieldset class="size-options" aria-labelledby="size-heading">${sizes.map(s=>`<label><input type="radio" name="size" value="${s}" required><span>${s}</span></label>`).join('')}</fieldset><button type="submit" class="button button-dark specular-cta">Aggiungi al carrello <span aria-hidden="true">+</span></button></form><p class="demo-note">Mockup e prezzo dimostrativi. Gli acquisti non sono ancora attivi.</p></div></div>`;
  openDialog('#product-dialog');
}
function addToCart(id,size){if(!products.some(p=>p.id===id)||!sizes.includes(size))throw new Error('Prodotto o taglia non validi');const row=cart.find(x=>x.id===id&&x.size===size);if(row&&row.quantity>=20){toast('Hai raggiunto il limite di 20 pezzi per taglia.');return false;}if(row)row.quantity++;else cart.push({id,size,quantity:1});saveCart();return true;}
function renderCart(){const total=cart.reduce((sum,x)=>sum+products.find(p=>p.id===x.id).price*x.quantity,0);$('#cart-content').innerHTML=cart.length?`${cart.map((item,index)=>{const p=products.find(p=>p.id===item.id);return `<div class="cart-item"><div class="cart-item-visual">${productVisual(p,'cart')}</div><div><h3>${p.name}</h3><p>${p.color} / Taglia ${item.size}</p><p>${money(p.price)}</p><div class="cart-item-bottom"><div class="quantity"><button data-quantity="${index}" data-delta="-1" aria-label="Riduci quantità ${p.name}" ${item.quantity===1?'disabled':''}>−</button><span>${item.quantity}</span><button data-quantity="${index}" data-delta="1" aria-label="Aumenta quantità ${p.name}" ${item.quantity===20?'disabled':''}>+</button></div><button class="remove-item" data-remove="${index}" aria-label="Rimuovi ${p.name} taglia ${item.size}">Rimuovi</button></div></div></div>`;}).join('')}<div class="total-line"><span>Subtotale</span><strong>${money(total)}</strong></div><button class="button button-dark cart-checkout specular-cta" id="checkout">Riepilogo </button><p class="demo-note">Concept store: nessun pagamento verrà richiesto.<br>Carrello salvato su questo dispositivo.</p>`:'<div class="empty-cart"><p>Il carrello è ancora vuoto.<br>Quale T-shirt porti a bordo?</p><button class="button button-dark" id="continue-shopping">Esplora la collezione </button></div>';}
const info={sizes:{title:'La tua vestibilità.',body:'<p>Misure del petto pubblicate nella <a href="https://www.amazon.it/dp/B09QH23G12?th=1&psc=1" target="_blank" rel="noreferrer">tabella taglie del modello ALRRGPB</a> indicato per queste maglie.</p><table><thead><tr><th>Taglia</th><th>Petto</th></tr></thead><tbody><tr><td>XS</td><td>44 cm</td></tr><tr><td>S</td><td>47 cm</td></tr><tr><td>M</td><td>50 cm</td></tr><tr><td>L</td><td>53 cm</td></tr><tr><td>XL</td><td>56 cm</td></tr><tr><td>XXL</td><td>59 cm</td></tr><tr><td>3XL</td><td>63 cm</td></tr><tr><td>4XL</td><td>66 cm</td></tr><tr><td>5XL</td><td>71 cm</td></tr></tbody></table><p>La scheda non riporta la lunghezza del capo. Prima della vendita, verifica le misure sui capi reali.</p>'},shipping:{title:'Spedizioni e resi.',body:'<p>Lo shop è in fase di anteprima e non accetta ordini. Costi, tempi di spedizione e condizioni di reso saranno pubblicati prima dell’apertura delle vendite.</p>'},privacy:{title:'La tua privacy.',body:'<p>Questa anteprima non raccoglie dati di pagamento e non invia ordini. Il carrello viene salvato solo nel browser del tuo dispositivo. Puoi svuotarlo rimuovendo i prodotti o cancellando i dati del sito.</p><p>I caratteri sono forniti da Google Fonts. Non sono presenti strumenti di analisi o pubblicità. L’informativa completa del negozio sarà disponibile all’apertura delle vendite.</p>'}};
function showInfo(key){const content=info[key];if(!content)return;$('#info-content').innerHTML=`<p class="eyebrow red">REAL PIECE / INFORMAZIONI</p><h2 id="info-title">${content.title}</h2>${content.body}`;openDialog('#info-dialog');}
document.addEventListener('click',e=>{const viewButton=e.target.closest('[data-gallery-view]');if(viewButton&&activeProduct?.artwork){const view=viewButton.dataset.galleryView;const source=view==='artwork'?activeProduct.artwork:'assets/real-piece-front-logo.png';$('#gallery-stage').innerHTML=view==='mockup'?productVisual(activeProduct,'detail'):`<img class="gallery-standalone" src="${source}" alt="${activeProduct.name} — ${view==='artwork'?'stampa originale':'logo davanti'}">`;document.querySelectorAll('[data-gallery-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===viewButton)));}const galleryButton=e.target.closest('[data-gallery-index]');if(galleryButton&&activeProduct?.gallery){const photo=activeProduct.gallery[Number(galleryButton.dataset.galleryIndex)];if(photo){$('#gallery-main').src=photo.src;$('#gallery-main').alt=activeProduct.name+' — '+photo.label;document.querySelectorAll('[data-gallery-index]').forEach(b=>b.setAttribute('aria-pressed',String(b===galleryButton)));}}const product=e.target.closest('[data-product]');if(product)showProduct(product.dataset.product);const close=e.target.closest('[data-close]');if(close)close.closest('dialog').close();const filter=e.target.closest('[data-filter]');if(filter)setCategory(filter.dataset.filter);const catLink=e.target.closest('[data-category]');if(catLink)setCategory(catLink.dataset.category);const infoLink=e.target.closest('[data-info]');if(infoLink)showInfo(infoLink.dataset.info);const qty=e.target.closest('[data-quantity]');if(qty){const row=cart[Number(qty.dataset.quantity)];if(row)row.quantity=Math.max(1,Math.min(20,row.quantity+Number(qty.dataset.delta)));saveCart();}const remove=e.target.closest('[data-remove]');if(remove){cart.splice(Number(remove.dataset.remove),1);saveCart();}if(e.target.closest('#continue-shopping')){$('#cart-dialog').close();$('#collezione').scrollIntoView();}if(e.target.closest('#reset-filters')){$('#search').value='';setCategory('all');}if(e.target.closest('#checkout')){const total=cart.reduce((sum,x)=>sum+products.find(p=>p.id===x.id).price*x.quantity,0);$('#info-content').innerHTML=`<p class="eyebrow red">ANTEPRIMA DEL TUO ORDINE</p><h2 id="info-title">Il tuo riepilogo.</h2><p>${cart.map(x=>`${products.find(p=>p.id===x.id).name} · ${x.size} · ${x.quantity} pz`).join('<br>')}</p><div class="total-line"><span>Subtotale</span><strong>${money(total)}</strong></div><p>Gli acquisti non sono ancora attivi. Nessun ordine è stato inviato e nessun importo è stato addebitato.</p><button class="button button-dark" data-close>Torna al carrello</button>`;openDialog('#info-dialog');}if(e.target.closest('#card-nav-content a'))closeCardNav();});
document.addEventListener('submit',e=>{if(e.target.id==='add-form'){e.preventDefault();const size=new FormData(e.target).get('size');if(addToCart(activeProduct.id,size)){$('#product-dialog').close();openDialog('#cart-dialog');}}});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#cart-toggle').addEventListener('click',()=>openDialog('#cart-dialog'));
function closeCardNav(){$('#card-nav').removeAttribute('data-open');$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-label','Apri menu');$('#card-nav-content').hidden=true;}
$('#menu-toggle').addEventListener('click',()=>{const open=$('#menu-toggle').getAttribute('aria-expanded')==='true';if(open)closeCardNav();else{$('#card-nav').setAttribute('data-open','');$('#menu-toggle').setAttribute('aria-expanded','true');$('#menu-toggle').setAttribute('aria-label','Chiudi menu');$('#card-nav-content').hidden=false;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCardNav();});
document.addEventListener('click',e=>{if(!e.target.closest('#card-nav'))closeCardNav();});
$('.gooey-nav')?.addEventListener('click',e=>{
  const item=e.target.closest('[data-gooey-index]');
  if(!item)return;
  document.querySelectorAll('.gooey-nav [data-gooey-index]').forEach(link=>link.removeAttribute('aria-current'));
  item.setAttribute('aria-current','page');
});
$('#search-toggle').addEventListener('click',()=>{$('#search-area').hidden=false;$('#collezione').scrollIntoView();$('#search').focus({preventScroll:true});});
$('#clear-search').addEventListener('click',()=>{$('#search').value='';$('#search-area').hidden=true;renderProducts();$('#search-toggle').focus({preventScroll:true});});
$('#search').addEventListener('input',renderProducts);$('#sort').addEventListener('change',renderProducts);
const countdownTarget=Date.parse('2027-02-01T00:00:00+01:00');
const countdownDigits={days:3,hours:2,minutes:2,seconds:2};
function rollCountdownDigit(slot,next){
  const previous=slot.dataset.digit;
  const rail=slot.firstElementChild;
  if(previous===undefined){rail.style.transition='none';rail.style.transform=`translateY(-${10+next}em)`;}
  else if(Number(previous)!==next){
    const step=(Number(previous)-next+10)%10;
    rail.style.transition='transform .65s cubic-bezier(.2,.75,.25,1)';
    rail.style.transform=`translateY(-${10+Number(previous)-step}em)`;
    clearTimeout(slot._rebaseTimer);
    slot._rebaseTimer=setTimeout(()=>{rail.style.transition='none';rail.style.transform=`translateY(-${10+next}em)`;},680);
  }
  slot.dataset.digit=String(next);
}
function updateCountdown(){
  const remaining=Math.max(0,Math.ceil((countdownTarget-Date.now())/1000));
  const values={days:Math.floor(remaining/86400),hours:Math.floor(remaining%86400/3600),minutes:Math.floor(remaining%3600/60),seconds:remaining%60};
  for(const [unit,width] of Object.entries(countdownDigits)){
    const container=document.querySelector(`[data-countdown="${unit}"]`);
    const digits=String(values[unit]).padStart(width,'0');
    if(container.children.length!==digits.length)container.innerHTML=[...digits].map(()=>`<span class="countdown-digit"><span class="countdown-digit-rail">${Array.from({length:30},(_,i)=>`<span>${i%10}</span>`).join('')}</span></span>`).join('');
    [...container.children].forEach((slot,i)=>rollCountdownDigit(slot,Number(digits[i])));
  }
  $('#countdown-accessible').textContent=`Mancano ${values.days} giorni, ${values.hours} ore e ${values.minutes} minuti all'inizio di febbraio 2027.`;
}
updateCountdown();
setInterval(updateCountdown,1000);
renderProducts();saveCart();
if(document.modelContext?.registerTool){for(const tool of [{name:'list_real_piece_products',description:'Elenca i prodotti dimostrativi Real Piece. Non effettua acquisti.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({products:products.map(({id,name,price,color,category})=>({id,name,price,color,category})),sizes})},{name:'stage_real_piece_cart_item',description:'Aggiunge un prodotto al carrello locale dimostrativo e apre il carrello. Non invia ordini o pagamenti.',inputSchema:{type:'object',properties:{id:{type:'string',enum:products.map(p=>p.id)},size:{type:'string',enum:sizes}},required:['id','size'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input!=='object')throw new Error('Input non valido');const added=addToCart(input.id,input.size);openDialog('#cart-dialog');return {added,cart,checkoutEnabled:false};}}]){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}}}
