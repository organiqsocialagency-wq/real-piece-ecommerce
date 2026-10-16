'use strict';
const products = [
  {id:'east-blue-west-coast',name:'East Blue / West Coast',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/east-blue-logo-front.png',artwork:'assets/great-era-emienel-boyz.png',tag:'GREAT ERA',gallery:[{src:'assets/east-blue-print.png',label:'Dettaglio stampa'},{src:'assets/east-blue-label.png',label:'Etichetta Real Piece'}],description:'East Blue incontra la West Coast. Il logo Real Piece davanti, la ciurma e il segno rosso sul retro.'},
  {id:'dracula',name:'Dracula',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-dracula.png',tag:'GREAT ERA',description:'Uno sguardo taglia il buio. Dracula incontra gli occhi del più grande spadaccino.'},
  {id:'hulkwhite',name:'Hulkwhite',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-hulkwhite.png',tag:'GREAT ERA',description:'Il baffo più famoso dei mari incontra un’icona del ring. Un omaggio alla forza di Barbabianca.'},
  {id:'roger',name:'Great Era / Roger',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-roger.png',tag:'GREAT ERA',description:'Il tesoro è là fuori. Da quella frase è cominciata la Grande Era della Pirateria.'},
  {id:'real-pulp',name:'Real Pulp',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-real-pulp.png',tag:'GREAT ERA',description:'Manga, cinema pulp e un titolo che dice tutto: Real Piece.'},
  {id:'nika-rupestre',name:'Nika Rupestre',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-nika.png',tag:'GREAT ERA',description:'La danza di Nika come un segno inciso nella pietra. Libertà dall’inizio dei tempi.'},
  {id:'trafalgar-46',name:'Trafalgar 46',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-trafalgar.png',tag:'GREAT ERA',description:'Trafalgar Law cambia corsia. Dal mare alla pista, sempre senza chiedere permesso.'},
  {id:'vegapunk',name:'Vegapunk',price:35,color:'Nero',hex:'#1e1d22',category:'graphic',image:'assets/great-era-model-blank.png',artwork:'assets/great-era-vegapunk.png',tag:'GREAT ERA',description:'La mela, la mente e un’idea fuori scala. Scienza e Grand Line sullo stesso capo.'}
];
const sizes=['XS','S','M','L','XL','XXL','3XL','4XL','5XL'];
const colors=[
  {name:'Nero',hex:'#1e1d22'},
  {name:'Giallo',hex:'#f2cd3d'},
  {name:'Blu',hex:'#1f5394'},
  {name:'Verde',hex:'#00863a'},
  {name:'Viola',hex:'#4a265e'},
  {name:'Bianco',hex:'#f0f1ec'},
  {name:'Rosso',hex:'#be2435'},
  {name:'Crema',hex:'#dbccb8'},
  {name:'Grigio',hex:'#bebfc2'}
];
const colorByName=name=>colors.find(color=>color.name===name);
const selectedColors=new Map();
const money = value => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(value);
const $ = selector => document.querySelector(selector);
const centsMoney = value => money(value/100);
let welcomeStorage=null;
try{welcomeStorage=localStorage;}catch{}
let welcomeOffer=window.RealPieceWelcome.readOrCreate(welcomeStorage);
let welcomeWasActive=window.RealPieceWelcome.isActive(welcomeOffer);
function isWelcomeActive(){return window.RealPieceWelcome.isActive(welcomeOffer);}
function getCartTotals(){return window.RealPieceCommerce.calculateCart(cart,products,isWelcomeActive());}
function welcomePriceNote(p){return `<p class="welcome-price-note" ${isWelcomeActive()?'':'hidden'}>Con il benvenuto <strong>${money(Math.max(0,p.price-10))}</strong> a capo</p>`;}
function showWelcomeOffer(){
  if(!isWelcomeActive())return;
  welcomeOffer=window.RealPieceWelcome.markSeen(welcomeOffer,welcomeStorage);
  openDialog('#welcome-dialog');
}
function updateWelcomeOffer(){
  const seconds=window.RealPieceWelcome.remainingSeconds(welcomeOffer);
  const active=seconds>0;
  const clock=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  document.querySelectorAll('[data-welcome-clock]').forEach(el=>el.textContent=clock);
  $('#welcome-bar').hidden=!active;
  $('#welcome-ended').hidden=active;
  $('#welcome-offer-price').hidden=!active;
  $('#welcome-shop').textContent=active?'Scegli le tue maglie':'Esplora la collezione';
  if(active!==welcomeWasActive){
    welcomeWasActive=active;
    renderProducts();
    document.querySelectorAll('.detail-copy .welcome-price-note').forEach(el=>el.hidden=!active);
    renderCart();
    if($('#info-dialog').open&&$('#info-content').dataset.orderSummary==='true')showOrderSummary();
  }
}

let category='all',activeProduct=null,activeColor='Nero',toastTimer;
let cart=[];
try{
  const saved=JSON.parse(localStorage.getItem('real-piece-cart')||'[]');
  if(Array.isArray(saved))cart=saved.filter(x=>x&&products.some(p=>p.id===x.id)&&sizes.includes(x.size)&&(x.color===undefined||colorByName(x.color))&&Number.isInteger(x.quantity)&&x.quantity>0&&x.quantity<=20).map(({id,size,color='Nero',quantity})=>({id,size,color,quantity}));
}catch{}
function saveCart(){try{localStorage.setItem('real-piece-cart',JSON.stringify(cart));}catch{}$('#cart-count').textContent=cart.reduce((n,x)=>n+x.quantity,0);renderCart();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function openDialog(id){const d=$(id);if(!d.open)d.showModal();}
function productVisual(p,mode='card',color=selectedColors.get(p.id)||p.color){
  const option=colorByName(color)||colors[0];
  return `<span class="product-visual product-visual-${mode}">${window.renderProductMockup({id:p.id,name:p.name,artwork:p.artwork,color:option.name,hex:option.hex,mode})}</span>`;
}
function refreshProductColor(){
  const p=activeProduct;
  setProductGalleryView('mockup');
  const thumbnail=document.querySelector('[data-gallery-view="mockup"] .gallery-mockup-thumb');
  if(thumbnail)thumbnail.innerHTML=productVisual(p,'thumb',activeColor);
  const card=document.querySelector(`.catalog-image-button[data-product="${p.id}"]`);
  if(card){
    card.querySelector('.catalog-media').innerHTML=productVisual(p,'card',activeColor);
    card.closest('.product-card').querySelector('.product-meta .swatch').style.background=colorByName(activeColor).hex;
  }
}
function setProductGalleryView(view,index){
  if(!activeProduct)return;
  const stage=$('#gallery-stage');
  if(view==='mockup')stage.innerHTML=productVisual(activeProduct,'detail',activeColor);
  else if(view==='logo')stage.innerHTML='<svg class="gallery-logo" viewBox="274 1427 2658 637" role="img" aria-label="Logo Real Piece sul davanti"><image href="assets/real-piece-front-logo.png" width="3200" height="3200"/></svg>';
  else{
    const photo=view==='photo'?activeProduct.gallery?.[index]:{src:activeProduct.artwork,label:'Stampa originale'};
    if(!photo)return;
    stage.innerHTML=`<img class="gallery-standalone" src="${photo.src}" alt="${activeProduct.name} — ${photo.label}">`;
  }
  stage.classList.toggle('is-logo-view',view==='logo');
  document.querySelectorAll('.gallery-thumbnails button').forEach(button=>button.setAttribute('aria-pressed',String(view==='photo'?Number(button.dataset.galleryIndex)===index&&button.hasAttribute('data-gallery-index'):button.dataset.galleryView===view)));
}
function renderProducts(){
  const query=$('#search').value.trim().toLocaleLowerCase('it');
  let list=products.filter(p=>(category==='all'||p.category===category)&&`${p.name} ${colors.map(color=>color.name).join(" ")}`.toLocaleLowerCase('it').includes(query));
  const sort=$('#sort').value;
  if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);
  $('#product-grid').innerHTML=list.length?list.map(p=>`<article class="product-card"><button type="button" class="catalog-image-button" data-reflective-card data-product="${p.id}" aria-label="Apri scheda ${p.name}"><span class="catalog-media">${productVisual(p)}</span><span class="product-tag">${p.tag}</span></button><div class="product-info"><button class="product-name" data-product="${p.id}">${p.name}</button><span class="price">${money(p.price)}</span></div>${welcomePriceNote(p)}<p class="product-meta"><span class="swatch" style="background:${colorByName(selectedColors.get(p.id)||p.color).hex}" aria-hidden="true"></span><button type="button" class="catalog-color-link" data-product="${p.id}" aria-label="Scegli tra 9 colori per ${p.name}">9 colori</button><span>· Unisex</span></p><button type="button" class="button button-dark specular-cta product-cart-cta" data-product="${p.id}" aria-label="Aggiungi ${p.name} al carrello: scegli colore e taglia">Aggiungi al carrello <span aria-hidden="true">+</span></button></article>`).join(''):'<div class="empty-results"><p>Nessuna T-shirt trovata.</p><button class="text-button" id="reset-filters">Mostra tutta la collezione</button></div>';
  $('#result-status').textContent=`${list.length} prodotti visualizzati`;
  window.refreshReflectiveCards?.();
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
  activeColor=selectedColors.get(p.id)||p.color;
  const gallery=`<div class="product-gallery"><div id="gallery-stage" class="gallery-stage">${productVisual(p,'detail',activeColor)}</div><div class="gallery-thumbnails" role="group" aria-label="Immagini prodotto"><button type="button" data-gallery-view="mockup" aria-label="Fronte e retro" aria-pressed="true"><span class="gallery-mockup-thumb">${productVisual(p,'thumb',activeColor)}</span><span>Fronte / retro</span></button><button type="button" data-gallery-view="artwork" aria-label="Grafica originale" aria-pressed="false"><img src="${p.artwork}" alt=""><span>Stampa originale</span></button><button type="button" data-gallery-view="logo" aria-label="Logo sul davanti" aria-pressed="false"><img src="assets/real-piece-front-logo.png" alt=""><span>Logo davanti</span></button>${(p.gallery||[]).map((photo,i)=>`<button type="button" data-gallery-index="${i}" aria-label="${photo.label}" aria-pressed="false"><img src="${photo.src}" alt=""><span>${photo.label}</span></button>`).join('')}</div></div>`;
  $('#product-detail').innerHTML=`<div class="product-detail-grid">${gallery}<div class="detail-copy"><p class="eyebrow red">REAL PIECE / GREAT ERA</p><h2 id="product-title">${p.name}</h2><div class="detail-price">${money(p.price)}</div>${welcomePriceNote(p)}<p class="detail-description">${p.description}</p><p class="product-meta">Vestibilità unisex</p><form id="add-form"><fieldset class="color-options"><legend>Colore: <strong id="selected-color">${activeColor}</strong></legend><div class="color-options-grid">${colors.map(color=>`<label><input type="radio" name="color" value="${color.name}" ${color.name===activeColor?'checked':''} required><span class="color-option"><span class="color-option-swatch" style="--swatch-color:${color.hex}" aria-hidden="true"></span><span>${color.name}</span></span></label>`).join('')}</div></fieldset><div class="size-label"><span id="size-heading">Seleziona la taglia</span><button type="button" class="text-button" data-info="sizes">Guida taglie</button></div><fieldset class="size-options" aria-labelledby="size-heading">${sizes.map(s=>`<label><input type="radio" name="size" value="${s}" required><span>${s}</span></label>`).join('')}</fieldset><button type="submit" class="button button-dark specular-cta">Aggiungi al carrello <span aria-hidden="true">+</span></button></form><p class="product-delivery">Consegna stimata in 1–2 settimane.<br>Spedizione gratis da 50 €, altrimenti 3,70 €.</p><p class="demo-note">Mockup e promozione dimostrativi. Gli acquisti non sono ancora attivi.</p></div></div>`;
  openDialog('#product-dialog');
}
function addToCart(id,size,color='Nero'){
  if(!products.some(p=>p.id===id)||!sizes.includes(size)||!colorByName(color))throw new Error('Prodotto, taglia o colore non validi');
  const row=cart.find(x=>x.id===id&&x.size===size&&x.color===color);
  if(row&&row.quantity>=20){toast('Hai raggiunto il limite di 20 pezzi per colore e taglia.');return false;}
  if(row)row.quantity++;
  else cart.push({id,size,color,quantity:1});
  saveCart();return true;
}
function renderShippingProgress(totals){
  const message=totals.freeShipping?'La spedizione è offerta da noi.':`Ti mancano <strong>${centsMoney(totals.remainingForFreeShippingCents)}</strong> alla spedizione gratuita.`;
  return `<div class="shipping-progress ${totals.freeShipping?'is-free':''}"><p>${message}</p><div class="shipping-progress-track" role="progressbar" aria-label="Importo verso la spedizione gratuita" aria-valuemin="0" aria-valuemax="50" aria-valuenow="${Math.min(50,totals.merchandiseCents/100)}" aria-valuetext="${totals.freeShipping?'Spedizione gratuita raggiunta':centsMoney(totals.remainingForFreeShippingCents)+' mancanti alla spedizione gratuita'}"><span style="width:${totals.freeShippingProgress}%"></span></div><span class="shipping-threshold-note">Gratis da 50 € di prodotti, dopo gli sconti.</span></div>`;
}
function renderShippingCoverage(totals){
  const ours=totals.freeShipping?100:78,theirs=100-ours;
  return `<div class="shipping-coverage"><div class="shipping-coverage-heading"><strong>Alla spedizione pensiamo anche noi.</strong><span>Consegna in 1–2 settimane</span></div><div class="shipping-coverage-track" role="img" aria-label="Real Piece copre il ${ours}% della spedizione, a te il ${theirs}%"><span class="shipping-coverage-us" style="width:${ours}%"></span><span class="shipping-coverage-you" style="width:${theirs}%"></span></div><div class="shipping-coverage-legend"><span><i></i>Real Piece <strong>${ours}%</strong></span><span><i></i>Tu <strong>${theirs}%${totals.freeShipping?'':' · 3,70 €'}</strong></span></div><p>${totals.freeShipping?'Hai raggiunto i 50 €: questa spedizione la copriamo interamente noi.':'Ci dispiace chiederti un contributo. Il carburante pesa anche sui costi di trasporto: per non lasciare tutto il peso a te, Real Piece copre il 78% della spedizione. A te chiediamo solo il 22%, pari a 3,70 €.'}</p><small>Ripartizione dei costi dimostrativa.</small></div>`;
}
function renderOrderCosts(totals){
  return `<div class="order-costs"><div><span>Prodotti (${totals.quantity})</span><span>${centsMoney(totals.subtotalCents)}</span></div>${totals.discountCents?`<div class="order-discount"><span>Benvenuto · 10 € per capo</span><span>−${centsMoney(totals.discountCents)}</span></div>`:''}<div><span>Spedizione</span><span>${totals.freeShipping?'Gratuita':centsMoney(totals.shippingCents)}</span></div><div class="order-grand-total"><strong>Totale</strong><strong>${centsMoney(totals.totalCents)}</strong></div></div>`;
}
function renderCart(){
  const totals=getCartTotals();
  const active=isWelcomeActive();
  $('#cart-content').innerHTML=cart.length?`${active?'<div class="cart-welcome-note"><span>Benvenuto: −10 € su ogni maglia</span><time data-welcome-clock aria-label="Tempo rimanente promozione"></time></div>':''}${renderShippingProgress(totals)}${cart.map((item,index)=>{
    const p=products.find(p=>p.id===item.id);
    return `<div class="cart-item"><div class="cart-item-visual">${productVisual(p,'cart',item.color)}</div><div><h3>${p.name}</h3><p class="cart-item-variant"><span class="swatch" style="background:${colorByName(item.color).hex}" aria-hidden="true"></span>${item.color} / Taglia ${item.size}</p><p>${active?`<del>${money(p.price)}</del> <strong>${money(Math.max(0,p.price-10))}</strong>`:money(p.price)} <span class="cart-unit-note">a capo</span></p><div class="cart-item-bottom"><div class="quantity"><button data-quantity="${index}" data-delta="-1" aria-label="Riduci quantità ${p.name}, ${item.color}, taglia ${item.size}" ${item.quantity===1?'disabled':''}>−</button><span>${item.quantity}</span><button data-quantity="${index}" data-delta="1" aria-label="Aumenta quantità ${p.name}, ${item.color}, taglia ${item.size}" ${item.quantity===20?'disabled':''}>+</button></div><button class="remove-item" data-remove="${index}" aria-label="Rimuovi ${p.name}, ${item.color}, taglia ${item.size}">Rimuovi</button></div></div></div>`;
  }).join('')}${renderOrderCosts(totals)}<button class="button button-dark cart-checkout specular-cta" id="checkout">Riepilogo</button>${renderShippingCoverage(totals)}<p class="demo-note">Concept store: promozione simulata, nessun pagamento verrà richiesto.<br>Carrello salvato su questo dispositivo.</p>`:'<div class="empty-cart"><p>Il carrello è ancora vuoto.<br>Quale T-shirt porti a bordo?</p><p class="empty-shipping-note">Spedizione gratis da 50 €, altrimenti 3,70 €.<br>Consegna stimata in 1–2 settimane.</p><button class="button button-dark" id="continue-shopping">Esplora la collezione</button></div>';
  document.querySelectorAll('#cart-content [data-welcome-clock]').forEach(el=>{const seconds=window.RealPieceWelcome.remainingSeconds(welcomeOffer);el.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;});
}
function showOrderSummary(){
  const totals=getCartTotals();
  $('#info-content').dataset.orderSummary='true';
  $('#info-content').innerHTML=`<p class="eyebrow red">ANTEPRIMA DEL TUO ORDINE</p><h2 id="info-title">Il tuo riepilogo.</h2><p>${cart.map(x=>`${products.find(p=>p.id===x.id).name} · ${x.color} · ${x.size} · ${x.quantity} pz`).join('<br>')}</p>${renderOrderCosts(totals)}<p>Consegna stimata in 1–2 settimane dall’ordine.</p><p>Gli acquisti non sono ancora attivi. Nessun ordine è stato inviato e nessun importo è stato addebitato.</p><button class="button button-dark" data-close>Torna al carrello</button>`;
  openDialog('#info-dialog');
}
const info={sizes:{title:'La tua vestibilità.',body:'<p>Le misure del petto sono espresse in centimetri. Confrontale con quelle di una maglietta che indossi già per scegliere la taglia.</p><table><thead><tr><th>Taglia</th><th>Petto</th></tr></thead><tbody><tr><td>XS</td><td>44 cm</td></tr><tr><td>S</td><td>47 cm</td></tr><tr><td>M</td><td>50 cm</td></tr><tr><td>L</td><td>53 cm</td></tr><tr><td>XL</td><td>56 cm</td></tr><tr><td>XXL</td><td>59 cm</td></tr><tr><td>3XL</td><td>63 cm</td></tr><tr><td>4XL</td><td>66 cm</td></tr><tr><td>5XL</td><td>71 cm</td></tr></tbody></table>'},shipping:{title:'Spedizioni e resi.',body:'<p>La consegna è stimata in <strong>1–2 settimane dall’ordine</strong>.</p><p>Spedizione gratuita da <strong>50 €</strong> di prodotti, dopo gli sconti. Sotto questa soglia il contributo di spedizione è di <strong>3,70 €</strong>.</p><p>Le condizioni di reso saranno pubblicate prima dell’apertura delle vendite. Questa è un’anteprima dimostrativa: gli acquisti non sono ancora attivi.</p>'},privacy:{title:'La tua privacy.',body:'<p>Questa anteprima non raccoglie dati di pagamento e non invia ordini. Il carrello viene salvato solo nel browser del tuo dispositivo. Puoi svuotarlo rimuovendo i prodotti o cancellando i dati del sito.</p><p>I caratteri sono forniti da Google Fonts. Non sono presenti strumenti di analisi o pubblicità. L’informativa completa del negozio sarà disponibile all’apertura delle vendite.</p>'}};
function showInfo(key){const content=info[key];if(!content)return;delete $('#info-content').dataset.orderSummary;$('#info-content').innerHTML=`<p class="eyebrow red">REAL PIECE / INFORMAZIONI</p><h2 id="info-title">${content.title}</h2>${content.body}`;openDialog('#info-dialog');}
document.addEventListener('click',e=>{const viewButton=e.target.closest('[data-gallery-view]');if(viewButton)setProductGalleryView(viewButton.dataset.galleryView);const galleryButton=e.target.closest('[data-gallery-index]');if(galleryButton)setProductGalleryView('photo',Number(galleryButton.dataset.galleryIndex));const product=e.target.closest('[data-product]');if(product)showProduct(product.dataset.product);const close=e.target.closest('[data-close]');if(close)close.closest('dialog').close();const filter=e.target.closest('[data-filter]');if(filter)setCategory(filter.dataset.filter);const catLink=e.target.closest('[data-category]');if(catLink)setCategory(catLink.dataset.category);const infoLink=e.target.closest('[data-info]');if(infoLink)showInfo(infoLink.dataset.info);const qty=e.target.closest('[data-quantity]');if(qty){const row=cart[Number(qty.dataset.quantity)];if(row)row.quantity=Math.max(1,Math.min(20,row.quantity+Number(qty.dataset.delta)));saveCart();}const remove=e.target.closest('[data-remove]');if(remove){cart.splice(Number(remove.dataset.remove),1);saveCart();}if(e.target.closest('#continue-shopping')){$('#cart-dialog').close();$('#collezione').scrollIntoView();}if(e.target.closest('#reset-filters')){$('#search').value='';setCategory('all');}if(e.target.closest('#checkout'))showOrderSummary();if(e.target.closest('#welcome-open'))showWelcomeOffer();if(e.target.closest('#welcome-shop')){$('#welcome-dialog').close();$('#collezione').scrollIntoView();}if(e.target.closest('#card-nav-content a'))closeCardNav();});
document.addEventListener('click',e=>{
  const photo=e.target.closest('[data-review-photo]');
  if(!photo)return;
  $('#review-photo-full').src=photo.dataset.reviewPhoto;
  $('#review-photo-full').alt=photo.dataset.reviewCaption;
  $('#review-photo-caption').textContent=photo.dataset.reviewCaption;
  openDialog('#review-photo-dialog');
});
document.addEventListener('change',e=>{
  if(e.target.matches('#add-form input[name="color"]')&&colorByName(e.target.value)){
    activeColor=e.target.value;
    selectedColors.set(activeProduct.id,activeColor);
    $('#selected-color').textContent=activeColor;
    refreshProductColor();
  }
});
document.addEventListener('submit',e=>{if(e.target.id==='add-form'){e.preventDefault();const values=new FormData(e.target);if(addToCart(activeProduct.id,values.get('size'),values.get('color'))){$('#product-dialog').close();openDialog('#cart-dialog');}}});
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
renderProducts();saveCart();updateWelcomeOffer();
setInterval(updateWelcomeOffer,1000);
document.addEventListener('visibilitychange',updateWelcomeOffer);
if(!welcomeOffer.seen&&isWelcomeActive())showWelcomeOffer();
if(document.modelContext?.registerTool){for(const tool of [{name:'list_real_piece_products',description:'Elenca i prodotti dimostrativi Real Piece. Non effettua acquisti.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({products:products.map(({id,name,price,color,category})=>({id,name,price,color,category,colors:colors.map(option=>option.name)})),sizes,colors})},{name:'stage_real_piece_cart_item',description:'Aggiunge un prodotto al carrello locale dimostrativo e apre il carrello. Non invia ordini o pagamenti.',inputSchema:{type:'object',properties:{id:{type:'string',enum:products.map(p=>p.id)},size:{type:'string',enum:sizes},color:{type:'string',enum:colors.map(option=>option.name),default:'Nero'}},required:['id','size'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input!=='object')throw new Error('Input non valido');const added=addToCart(input.id,input.size,input.color);openDialog('#cart-dialog');return {added,cart,checkoutEnabled:false};}}]){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}}}

// L'anteprima si scopre al passaggio del mouse, da tastiera o con un tocco.
const previewPointer=matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('[data-preview-reveal]').forEach(button=>{
  let hovered=false,pinned=false;
  function updatePreview(){
    const revealed=hovered||pinned;
    button.classList.toggle('is-preview-revealed',revealed);
    button.setAttribute('aria-pressed',String(revealed));
  }
  button.classList.add('is-preview-enhanced');
  button.addEventListener('pointerenter',event=>{
    if(event.pointerType!=='mouse'||!previewPointer.matches)return;
    hovered=true;updatePreview();
  },{passive:true});
  button.addEventListener('pointerleave',()=>{hovered=false;updatePreview();},{passive:true});
  button.addEventListener('pointercancel',()=>{hovered=false;updatePreview();},{passive:true});
  button.addEventListener('blur',()=>{pinned=false;updatePreview();});
  button.addEventListener('click',event=>{
    if(previewPointer.matches&&event.detail!==0)return;
    pinned=!pinned;
    updatePreview();
  });
  previewPointer.addEventListener('change',()=>{hovered=false;pinned=false;updatePreview();});
});
