/* Pip-Boy map upgrade V1.2: individual POIs, no clustering, live location tracking. */
(function () {
'use strict';
const $=id=>document.getElementById(id);
const DEFAULT={size:32,density:45,visibility:9,selected:[]};
const cats=[
 {id:'restaurant',name:'Restaurants',path:'<path d="M5 2v10m4-10v10m-4-5h4m-2 5v10M17 2c-5 4-5 9 0 10v10"/>' ,tags:[['amenity','restaurant']]},
 {id:'laundry',name:'Laundromats',path:'<rect x="3" y="3" width="18" height="19" rx="2"/><path d="M3 8h18"/><circle cx="12" cy="15" r="5"/><circle cx="7" cy="5.5" r=".5"/><circle cx="10" cy="5.5" r=".5"/>' ,tags:[['shop','laundry'],['shop','dry_cleaning']]},
 {id:'hospital',name:'Hospitals',path:'<path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z"/>' ,tags:[['amenity','hospital']]},
 {id:'pharmacy',name:'Pharmacies',path:'<rect x="5" y="4" width="14" height="16" rx="7" transform="rotate(45 12 12)"/><path d="M7 7l10 10"/>' ,tags:[['amenity','pharmacy'],['shop','chemist']]},
 {id:'fire',name:'Fire stations',path:'<path d="M12 2c2 5 0 7 3 9 1-3 3-3 3-3 0 4 3 6 3 9a9 9 0 0 1-18 0c0-4 2-7 5-9-1 4 2 5 4 7 2-3-1-7 0-13z"/>' ,tags:[['amenity','fire_station']]},
 {id:'eyes',name:'Eye care',path:'<path d="M2 11L4 10m16 0 2 1M9.5 12h5M2 11l1 6h7l2-5 2 5h7l1-6-2-1h-6l-2 2-2-2H4z"/>' ,tags:[['healthcare','optometrist'],['shop','optician']]},
 {id:'airport',name:'Airports',path:'<path d="M12 2l2 8 8 4v3l-9-2-1 7-3-4-3 1-1-2 5-4z"/>' ,tags:[['aeroway','aerodrome']]},
 {id:'baseball',name:'Baseball fields',path:'<circle cx="12" cy="12" r="10"/><path d="M8 4c4 4 4 12 0 16m8-16c-4 4-4 12 0 16M6 8l3 2m-3 3 3 2m9-7-3 2m3 3-3 2"/>' ,tags:[['sport','baseball']]},
 {id:'cars',name:'Car dealerships',path:'<path d="M4 15l2-7h12l2 7v4H4zM7 8l2-4h6l2 4M5 15h14M7 19v2m10-2v2"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>' ,tags:[['shop','car']]},
 {id:'train',name:'Train stations',path:'<rect x="5" y="2" width="14" height="17" rx="3"/><path d="M5 7h14M5 15h14M8 19l-3 3m11-3 3 3"/><circle cx="9" cy="16.5" r=".8"/><circle cx="15" cy="16.5" r=".8"/>' ,tags:[['railway','station']]},
 {id:'grocery',name:'Groceries',path:'<path d="M3 5h3l2 12h11l2-9H7M9 21h.1M18 21h.1M9 13h11"/>' ,tags:[['shop','supermarket'],['shop','grocery']]},
 {id:'cafe',name:'Cafés',path:'<path d="M4 8h14v8a7 7 0 0 1-14 0zM18 9h2c4 0 2 6-2 6M3 21h16M8 2c-2 2 2 3 0 5m5-5c-2 2 2 3 0 5"/>' ,tags:[['amenity','cafe']]},
 {id:'parks',name:'Parks',path:'<path d="M12 2L3 14h6l-5 5h16l-5-5h6zM12 19v4"/>' ,tags:[['leisure','park']]},
 {id:'library',name:'Libraries',path:'<path d="M2 5l10 3 10-3v15l-10 3-10-3zM12 8v15M5 9l5 1m4 0 5-1"/>' ,tags:[['amenity','library']]},
 {id:'museum',name:'Museums',path:'<path d="M2 9l10-6 10 6zM4 20h16M2 22h20M6 10v9m6-9v9m6-9v9"/>' ,tags:[['tourism','museum']]},
 {id:'theater',name:'Theaters',path:'<path d="M3 3h18v15H3zM5 21h14M8 18l-2 3m10-3 2 3M7 8c2-2 4-2 5 0m0 0c1-2 3-2 5 0M7 13c2 2 8 2 10 0"/>' ,tags:[['amenity','theatre'],['amenity','cinema']]},
 {id:'hotel',name:'Hotels',path:'<path d="M2 20V7h3v6h14V9h3v11M2 17h20M5 9h10a3 3 0 0 1 3 3v1H5z"/>' ,tags:[['tourism','hotel'],['tourism','motel']]},
 {id:'gas',name:'Gas stations',path:'<rect x="3" y="5" width="11" height="16" rx="1"/><path d="M4 9h9m1 0 5 3v6c0 3 4 3 4 0V8l-3-3m0 0v5M2 21h14"/>' ,tags:[['amenity','fuel']]},
 {id:'fitness',name:'Gyms',path:'<path d="M2 10v4m4-7v10m12-10v10m4-7v4M2 9h4m0 3h12m0-3h4"/>' ,tags:[['leisure','fitness_centre']]},
 {id:'police',name:'Police',path:'<path d="M12 2l8 3v6c0 6-4 9-8 11-4-2-8-5-8-11V5zM12 7l2 4 4 .5-3 3 .7 4L12 16l-3.7 2.5.7-4-3-3 4-.5z"/>' ,tags:[['amenity','police']]},
 {id:'post',name:'Post offices',path:'<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M3 8l9 7 9-7"/>' ,tags:[['amenity','post_office']]},
 {id:'bank',name:'Banks',path:'<path d="M2 8l10-6 10 6zM3 20h18M2 22h20M6 9v10m6-10v10m6-10v10"/>' ,tags:[['amenity','bank'],['amenity','atm']]},
 {id:'school',name:'Schools',path:'<path d="M2 9l10-6 10 6-10 6zM6 12v6c4 4 8 4 12 0v-6M22 9v8"/>' ,tags:[['amenity','school'],['amenity','university']]},
 {id:'parking',name:'Parking',path:'<rect x="2" y="2" width="20" height="20" rx="2"/><path d="M9 18V6h5c5 0 5 7 0 7H9"/>' ,tags:[['amenity','parking']]},
 {id:'bus',name:'Bus stations',path:'<rect x="4" y="3" width="16" height="17" rx="3"/><path d="M4 12h16M6 20l-1 2m13-2 1 2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>' ,tags:[['amenity','bus_station']]}
];
const core=['restaurant','laundry','hospital','pharmacy'];
const colors='stroke="#abef91" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"';
function svg(cat){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" '+colors+' aria-hidden="true">'+cat.path+'</svg>';}
function escapeHTML(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clamp(x,a,b,f){const n=Number(x);return Number.isFinite(n)?Math.max(a,Math.min(b,Math.round(n))):f;}
let settings={...DEFAULT},map=null,group=null,player=null,watchId=null,hasFix=false,lastFix=null,lastHeading=0,following=true;
let request=null,refreshTimer=null,loading=false,ready=false,resultCache=[],resultBounds=null,started=false,token=0,lastQueryKey='';
const byId=id=>cats.find(c=>c.id===id);
function message(s){$('map-feedback').textContent=s;}
function loadPrefs(){
 const bridge=window.PipMapStore;
 let saved={};
 try{saved=bridge&&bridge.load()?bridge.load():{}}catch(e){}
 settings={size:clamp(saved.size,22,54,32),density:clamp(saved.density,10,110,45),visibility:clamp(saved.visibility,6,15,9),selected:Array.isArray(saved.selected)?saved.selected.filter(s=>!!byId(s)).slice(0,15):[]};
}
function persist(){try{if(window.PipMapStore)window.PipMapStore.save(settings);}catch(e){console.warn('Map settings were not saved',e);}}
function markerIcon(cat,size){
 return L.divIcon({className:'pip-location-pin',html:'<span class="pip-pin-art">'+svg(cat)+'</span>',iconSize:[size,size],iconAnchor:[size/2,size/2],popupAnchor:[0,-size/2]});
}
function positionIcon(heading){
 const deg=Number.isFinite(heading)?heading:0;
 return L.divIcon({className:'pip-you-pin',html:'<span class="pip-you-ring"><span class="pip-you-arrow" style="transform:rotate('+deg+'deg)">▲</span></span>',iconSize:[50,50],iconAnchor:[25,25]});
}
function renderButtons(){
 const make=c=>'<button type="button" class="map-cat-button" data-category="'+c.id+'" aria-pressed="'+settings.selected.includes(c.id)+'" title="'+escapeHTML(c.name)+'">'+svg(c)+'<span>'+escapeHTML(c.name)+'</span></button>';
 $('map-common-cats').innerHTML=cats.filter(c=>core.includes(c.id)).map(make).join('');
 $('map-more-cats').innerHTML=cats.filter(c=>!core.includes(c.id)).map(make).join('');
 $('map-selected-count').textContent=settings.selected.length+' CATEGORIES';
 $('map-size-value').textContent=settings.size+' PX';
 $('map-density-value').textContent=settings.density+' ICONS';
 $('map-visibility-value').textContent='ZOOM '+settings.visibility+'+';
 $('map-size').value=settings.size;
 $('map-density').value=settings.density;
 $('map-visibility').value=settings.visibility;
}
function redraw(){
 if(!map||!group)return;
 group.clearLayers();
 if(map.getZoom()<settings.visibility){
   $('map-place-count').textContent='ICON LAYER HIDDEN — ZOOM IN';
   return;
 }
 if(resultCache.length===0){
   $('map-place-count').textContent=settings.selected.length?'NO RESULTS LOADED':'SELECT A CATEGORY';
   return;
 }
 const center=map.getCenter();
 const visible=resultCache.filter(p=>settings.selected.includes(p.category)&&map.getBounds().contains([p.lat,p.lon]));
 visible.sort((a,b)=>Math.pow(a.lat-center.lat,2)+Math.pow((a.lon-center.lng)*Math.cos(center.lat*Math.PI/180),2)-Math.pow(b.lat-center.lat,2)-Math.pow((b.lon-center.lng)*Math.cos(center.lat*Math.PI/180),2));
 let added=0;const seen=new Set();
 for(const p of visible){
   const unique=p.category+'-'+p.id;
   if(seen.has(unique))continue;
   seen.add(unique);
   const cat=byId(p.category);if(!cat)continue;
   const mark=L.marker([p.lat,p.lon],{icon:markerIcon(cat,settings.size),keyboard:true,title:p.name||cat.name});
   const popup=document.createElement('div');
   const title=document.createElement('strong');title.textContent=p.name||cat.name;popup.appendChild(title);
   const label=document.createElement('div');label.textContent=cat.name;popup.appendChild(label);
   const link=document.createElement('a');link.href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.lat+','+p.lon);
   link.target='_blank';link.rel='noopener noreferrer';link.textContent='Directions ↗';popup.appendChild(link);
   mark.bindPopup(popup);group.addLayer(mark);added++;
   if(added>=settings.density)break;
 }
 $('map-place-count').textContent=added+' INDIVIDUAL LOCATIONS'+(visible.length>added?' · LIMITED BY DENSITY':'');
}
function scheduleFetch(){
 if(!map||!settings.selected.length){resultCache=[];if(group)group.clearLayers();$('map-place-count').textContent='SELECT A CATEGORY';return;}
 clearTimeout(refreshTimer);
 refreshTimer=setTimeout(()=>fetchPlaces(),650);
}
async function fetchPlaces(){
 if(!map||!settings.selected.length)return;
 if(map.getZoom()<10){$('map-place-count').textContent='ZOOM TO LEVEL 10+ TO SEARCH NEW LOCATIONS';redraw();return;}
 const b=map.getBounds(),center=map.getCenter();
 // Limit search footprint so community Overpass servers are not queried for enormous areas.
 const latSpan=Math.min(.34,(b.getNorth()-b.getSouth())/2);
 const lonSpan=Math.min(.45,(b.getEast()-b.getWest())/2);
 const south=(center.lat-latSpan).toFixed(5),north=(center.lat+latSpan).toFixed(5);
 const west=(center.lng-lonSpan).toFixed(5),east=(center.lng+lonSpan).toFixed(5);
 const box=[south,west,north,east].join(',');
 const key=settings.selected.slice().sort().join(',')+'|'+[south,west,north,east].map(n=>Number(n).toFixed(2)).join(',');
 if(key===lastQueryKey && resultCache.length){redraw();return;}
 if(request)request.abort();
 const my=++token,control=new AbortController();request=control;
 const selectors=[];
 for(const id of settings.selected){
   const cat=byId(id);if(!cat)continue;
   for(const [k,v] of cat.tags){
     for(const type of ['node','way','relation'])selectors.push(type+'["'+k+'"="'+v+'"]('+box+');');
   }
 }
 if(!selectors.length)return;
 const query='[out:json][timeout:22];('+selectors.join('')+');out center 900;';
 const timeout=setTimeout(()=>control.abort(),27000);
 $('map-place-count').textContent='SCANNING MAP…';
 try{
   const response=await fetch('https://overpass.kumi.systems/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(query),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:control.signal});
   if(!response.ok)throw new Error('Search service returned '+response.status);
   const data=await response.json();
   if(my!==token)return;
   const parsed=[];
   for(const o of (data.elements||[])){
     const loc=o.lat!=null?o:o.center;if(!loc||!Number.isFinite(loc.lat)||!Number.isFinite(loc.lon))continue;
     for(const id of settings.selected){
       const cat=byId(id);
       if(cat.tags.some(([k,v])=>o.tags?.[k]===v)){
         parsed.push({id:o.type+'-'+o.id,lat:loc.lat,lon:loc.lon,category:id,name:o.tags.name||o.tags.brand||cat.name});
         break;
       }
     }
   }
   resultCache=parsed;lastQueryKey=key;resultBounds=[south,west,north,east];
   redraw();
   if(!parsed.length)message('No matching OpenStreetMap places found in this view. Try another category or area; map data may be incomplete.');
   else message('Showing individual, unclustered OpenStreetMap places. Tap any icon for its name and a directions link. Place data depends on community map coverage.');
 }catch(err){
   if(my!==token)return;
   if(err.name!=='AbortError')message('The public location search is temporarily unavailable. The map and GPS still work; try refreshing places.');
   $('map-place-count').textContent='SEARCH UNAVAILABLE · RETRY';
 }finally{clearTimeout(timeout);if(my===token)request=null;}
}
function categoryClick(e){
 const b=e.target.closest('[data-category]');if(!b)return;
 const id=b.dataset.category;
 settings.selected=settings.selected.includes(id)?settings.selected.filter(x=>x!==id):settings.selected.concat(id);
 persist();renderButtons();resultCache=[];lastQueryKey='';if(map)scheduleFetch();
}
function onDrag(){following=false;updateTrackButtons();}
function updateTrackButtons(){
 $('map-track').textContent=watchId!==null?'■ STOP TRACKING':'▶ LIVE GPS';
 $('map-track').setAttribute('aria-pressed',String(watchId!==null));
 $('map-follow').setAttribute('aria-pressed',String(following));
 $('map-follow').textContent=following?'⌖ FOLLOWING':'⌖ FOLLOW ME';
}
function bearing(a,b){
 const dLon=(b.lng-a.lng)*Math.PI/180,lat1=a.lat*Math.PI/180,lat2=b.lat*Math.PI/180;
 const y=Math.sin(dLon)*Math.cos(lat2),x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
 return (Math.atan2(y,x)*180/Math.PI+360)%360;
}
function positionUpdate(position){
 const lat=position.coords.latitude,lng=position.coords.longitude,acc=position.coords.accuracy;
 let dir=Number(position.coords.heading);
 if(!Number.isFinite(dir)||dir<0){
   if(lastFix&&L.latLng(lat,lng).distanceTo(L.latLng(lastFix.lat,lastFix.lng))>Math.max(8,acc/2))dir=bearing(lastFix,{lat,lng});
   else dir=lastHeading;
 }
 lastHeading=dir;lastFix={lat,lng};hasFix=true;
 if(!map)return;
 if(!player){player=L.marker([lat,lng],{icon:positionIcon(dir),zIndexOffset:10000,title:'Your live position'}).addTo(map);player.bindPopup('YOUR POSITION · GPS');}
 else{player.setLatLng([lat,lng]);player.setIcon(positionIcon(dir));}
 if(following){map.setView([lat,lng],Math.max(map.getZoom(),15),{animate:false});}
 $('map-place').textContent='GPS: '+lat.toFixed(5)+', '+lng.toFixed(5)+' · ±'+Math.round(acc)+' m';
 $('map-track-status').textContent=(watchId===null?'LOCATION FIX':'LIVE TRACKING')+' · ±'+Math.round(acc)+' m';
}
function positionError(err){
 const reasons={1:'Location permission denied.',2:'Position currently unavailable.',3:'GPS timed out. Try again.'};
 message((reasons[err.code]||'Unable to locate you.')+' Location requires browser permission and HTTPS.');
 $('map-track-status').textContent='GPS UNAVAILABLE';
 if(err.code===1)stop();
}
function locateOnce(){
 if(!navigator.geolocation){message('This device/browser cannot provide GPS coordinates.');return;}
 if(!map){message('Map still loading; try again.');return;}
 following=true;updateTrackButtons();
 navigator.geolocation.getCurrentPosition(positionUpdate,positionError,{enableHighAccuracy:true,timeout:18000,maximumAge:10000});
}
function start(){
 if(!navigator.geolocation){message('Your browser does not support location tracking.');return;}
 if(!map){message('Map still loading.');return;}
 if(watchId!==null){stop();return;}
 following=true;
 watchId=navigator.geolocation.watchPosition(positionUpdate,positionError,{enableHighAccuracy:true,timeout:18000,maximumAge:3000});
 updateTrackButtons();
 $('map-track-status').textContent='ACQUIRING GPS…';
 message('Live GPS requested. You may need to allow location access. GPS tracking may pause when your phone locks or the browser goes into the background.');
}
function stop(){
 if(watchId!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watchId);
 watchId=null;updateTrackButtons();$('map-track-status').textContent=hasFix?'LAST KNOWN POSITION · TRACKING OFF':'GPS OFF';
}
function follow(){
 following=true;updateTrackButtons();
 if(lastFix&&map)map.setView([lastFix.lat,lastFix.lng],Math.max(15,map.getZoom()));
 else locateOnce();
}
function open(){
 if(!window.L){
   $('map-canvas').hidden=true;$('map-iframe').hidden=false;
   if(window.pipFallbackMap)window.pipFallbackMap();
   message('Enhanced map is unavailable; using the original OpenStreetMap preview. Check your network connection.');
   return;
 }
 if(ready){setTimeout(()=>map.invalidateSize(),80);return;}
 loadPrefs();renderButtons();ready=true;
 $('map-iframe').hidden=true;$('map-canvas').hidden=false;
 map=L.map('map-canvas',{zoomControl:true,preferCanvas:true,worldCopyJump:true}).setView([41.8781,-87.6298],12);
 const layer=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,minZoom:3,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'});
 layer.addTo(map);group=L.layerGroup().addTo(map);
 map.on('dragstart',onDrag);
 map.on('moveend',()=>{redraw();if(settings.selected.length)scheduleFetch();});
 map.on('zoomend',redraw);
 $('map-common-cats').addEventListener('click',categoryClick);$('map-more-cats').addEventListener('click',categoryClick);
 for(const [id,key] of [['map-size','size'],['map-density','density'],['map-visibility','visibility']]){
   $(id).addEventListener('input',e=>{settings[key]=clamp(e.target.value,key==='size'?22:key==='density'?10:6,key==='size'?54:key==='density'?110:15,DEFAULT[key]);persist();renderButtons();redraw();});
 }
 $('map-refresh').addEventListener('click',()=>{lastQueryKey='';scheduleFetch();});
 $('map-track').addEventListener('click',start);
 $('map-follow').addEventListener('click',follow);
 $('map-stop').addEventListener('click',stop);
 updateTrackButtons();
 setTimeout(()=>map.invalidateSize(),110);
 message('Map ready. Choose a category to load individually marked places. Press Live GPS to follow your position. Location is never stored in your save.');
}
window.PipMap={open,locateOnce,stop};
})();