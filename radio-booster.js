/* Pip-Boy Radio v1.4.6 — optional cross-origin-safe 1x–10x gain.
   Uses a separate CORS-enabled audio player; never sacrifices original playback. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const native=$('radio-player'),radio=$('view-radio');
  if(!native||!radio||$('pip-gain-control'))return;
  const STORAGE='pipboy-radio-station-boosts-v146';
  let presets={};
  try {
    const obj=JSON.parse(localStorage.getItem(STORAGE)||'{}');
    if(obj&&typeof obj==='object'&&!Array.isArray(obj))presets=obj;
  }catch{}
  const css=document.createElement('style');
  css.textContent=[
    '#pip-gain-control{border:1px solid #467744;background:#091e0c;padding:12px;margin:10px 0 16px}',
    '#pip-gain-control .gain-heading{display:flex;justify-content:space-between;gap:12px;color:#b4f7a2;font-weight:bold;font-size:12px;letter-spacing:.04em}',
    '#pip-gain-control .gain-body{display:flex;gap:12px;align-items:center;margin:8px 0}',
    '#pip-boost-range{flex:1;min-width:80px;accent-color:#b4f7a2;cursor:pointer}',
    '#pip-boost-output{font-size:18px;font-weight:bold;min-width:70px;text-align:right;color:#d7ffc5}',
    '#pip-boost-status{font-size:11px;min-height:18px;color:#aad99b}',
    '#pip-boosted-player{width:100%;margin:11px 0;display:none}',
    '@media(max-width:450px){#pip-gain-control{padding:9px}}'
  ].join('\n');
  document.head.appendChild(css);

  const gainPanel=document.createElement('div');
  gainPanel.id='pip-gain-control';
  gainPanel.innerHTML=
    '<div class="gain-heading"><label for="pip-boost-range">SIGNAL AMPLIFICATION · STATION BOOST</label>'+
    '<span>MAX +20 dB</span></div>'+
    '<div class="gain-body"><input id="pip-boost-range" type="range" min="1" max="10" step="0.5" value="1" aria-label="Station audio gain between one and ten times">'+
    '<output id="pip-boost-output" for="pip-boost-range">1×</output></div>'+
    '<div id="pip-boost-status" role="status" aria-live="polite">1× · NORMAL PLAYBACK</div>'+
    '<small>Boost is saved for each station. Strong gain can distort audio. Start low, especially with headphones. Streaming servers must allow browser audio processing.</small>';

  const originalVolume=$('radio-volume-slider');
  const volumePanel=originalVolume?.closest('.radio-volume');
  if(volumePanel)volumePanel.insertAdjacentElement('afterend',gainPanel);
  else native.insertAdjacentElement('afterend',gainPanel);

  const processed=document.createElement('audio');
  processed.id='pip-boosted-player';
  processed.controls=true;
  processed.preload='none';
  processed.crossOrigin='anonymous';
  native.insertAdjacentElement('afterend',processed);

  const range=$('pip-boost-range'),output=$('pip-boost-output'),status=$('pip-boost-status');
  let ctx=null,sourceNode=null,gain=null,limiter=null;
  let active=false,busy=false,operation=0,currentStream='',boostFor='';
  const rejected=new Set();
  function stationKey(){
    const displayed=$('radio-current')?.textContent?.trim();
    if(displayed&&displayed!=='NO FREQUENCY TUNED')return displayed.toUpperCase();
    const picked=$('radio-tuned-name')?.textContent?.trim();
    return (picked||'DEFAULT').toUpperCase();
  }
  function level(key){
    const x=Number(presets[key]);
    return Number.isFinite(x)?Math.max(1,Math.min(10,Math.round(x*2)/2)):1;
  }
  function save(){
    try{localStorage.setItem(STORAGE,JSON.stringify(presets))}catch{}
  }
  function titleValue(n){return Number(n).toFixed(Number(n)%1?1:0)+'×'}
  function syncKnob(){
    const k=stationKey();boostFor=k;
    const n=level(k);
    range.value=String(n);
    output.textContent=titleValue(n);
    if(!active&&!busy)status.textContent=n===1?'1× · NORMAL PLAYBACK':'BOOST SET '+titleValue(n)+' · PLAY STATION TO APPLY';
  }
  function syncLevels(){
    processed.volume=native.volume;
    processed.muted=native.muted;
  }
  function setup(){
    if(ctx)return;
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)throw Error('Browser does not support Web Audio');
    ctx=new C();
    sourceNode=ctx.createMediaElementSource(processed);
    gain=ctx.createGain();
    limiter=ctx.createDynamicsCompressor();
    limiter.threshold.value=-2;
    limiter.knee.value=0;
    limiter.ratio.value=20;
    limiter.attack.value=0.003;
    limiter.release.value=0.15;
    sourceNode.connect(gain);
    gain.connect(limiter);
    limiter.connect(ctx.destination);
  }
  function hideProcessed(){
    processed.pause();
    processed.removeAttribute('src');
    processed.load();
    processed.style.display='none';
    native.style.display='';
    active=false;
    currentStream='';
  }
  function restore(message){
    operation++;busy=false;
    hideProcessed();
    if(message)status.textContent=message;
    // The normal HTML audio element remains fully independent of the processing graph.
    if(native.src&&native.paused)native.play().catch(()=>{});
  }
  async function activate(){
    const key=stationKey();
    const amount=level(key);
    if(amount<=1)return;
    const stream=native.currentSrc||native.src;
    if(!stream||native.paused||active||busy)return;
    if(rejected.has(key+'|'+stream)){
      status.textContent='BOOST UNAVAILABLE FOR THIS STREAM · NORMAL AUDIO CONTINUES';
      return;
    }
    busy=true;
    const token=++operation;
    boostFor=key;currentStream=stream;
    status.textContent='PREPARING '+titleValue(amount)+' BOOST · CHECKING STREAM COMPATIBILITY…';
    try{
      setup();
      gain.gain.value=amount;
      syncLevels();
      if(ctx.state==='suspended')await ctx.resume();
      if(token!==operation)return;
      native.pause();
      processed.src=stream;
      processed.load();
      // The boosted player requests CORS access. A server that denies it will
      // reject/error, allowing immediate return to independent normal playback.
      await processed.play();
      if(token!==operation)return;
      active=true;busy=false;
      native.style.display='none';
      processed.style.display='block';
      status.textContent=titleValue(amount)+' BOOST ON · DYNAMIC PEAK LIMITER ACTIVE';
    }catch(e){
      if(token!==operation)return;
      rejected.add(key+'|'+stream);
      restore('BOOST NOT SUPPORTED BY THIS STREAM · BACK TO NORMAL PLAYBACK');
      console.warn('Pip-Boy radio boost unavailable:',e?.message||e);
    }
  }
  function updateBoost(){
    const key=stationKey();
    const n=Math.max(1,Math.min(10,Number(range.value)||1));
    presets[key]=n;
    save();
    boostFor=key;
    output.textContent=titleValue(n);
    const stream=native.currentSrc||native.src;
    if(stream)rejected.delete(key+'|'+stream); // explicit retry on manual setting change
    if(active&&gain){
      if(n>1){gain.gain.value=n;status.textContent=titleValue(n)+' BOOST ON · DYNAMIC PEAK LIMITER ACTIVE';return;}
      restore('1× · BOOST OFF · NORMAL PLAYBACK');
      return;
    }
    if(n>1&&!native.paused){activate();return;}
    status.textContent=n===1?'1× · NORMAL PLAYBACK':'BOOST SAVED FOR THIS STATION · TUNE TO APPLY';
  }
  range.addEventListener('input',updateBoost);
  native.addEventListener('volumechange',syncLevels);
  native.addEventListener('loadstart',()=>{
    operation++;busy=false;
    if(active||processed.src)hideProcessed();
  });
  native.addEventListener('playing',()=>{
    if(active||busy)return;
    syncKnob();
    if(level(stationKey())>1)activate();
  });
  processed.addEventListener('error',()=>{
    if(!active&&!busy)return;
    const stream=currentStream,key=boostFor;
    rejected.add(key+'|'+stream);
    restore('STREAM DOES NOT ALLOW BOOST · NORMAL PLAYBACK RESTORED');
  });
  processed.addEventListener('playing',()=>{
    if(active&&gain)status.textContent=titleValue(gain.gain.value)+' BOOST ON · DYNAMIC PEAK LIMITER ACTIVE';
  });
  $('radio-stop')?.addEventListener('click',()=>{
    operation++;busy=false;
    hideProcessed();
    status.textContent='RADIO OFF';
  });
  // Refresh displayed saved boost while exploring frequencies without starting playback.
  $('radio-dial')?.addEventListener('input',()=>{
    if(!active&&!busy)setTimeout(syncKnob,0);
  });
  $('station-list')?.addEventListener('click',()=>{
    if(!active&&!busy)setTimeout(syncKnob,0);
  });
  $('fallout-stations')?.addEventListener('click',()=>{
    if(!active&&!busy)setTimeout(syncKnob,0);
  });
  // Do not allow a failed boost to unexpectedly restart on a delayed native event.
  syncLevels();
  syncKnob();
  const v=document.querySelector('.subbrand');
  if(v)v.textContent=v.textContent.replace(/V\s*1\.[0-9.]+/,'V 1.4.6');
  document.title=document.title.replace(/V1\.[0-9.]+/,'V1.4.6');
})();