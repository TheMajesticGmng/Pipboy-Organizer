/* Pip-Boy Radio V1.4.6: Fallout.fm presets and custom audio streams.
   No proxying, downloading, or hidden third-party players. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const versionLabel=document.querySelector('.subbrand');
  if(versionLabel)versionLabel.textContent=versionLabel.textContent.replace(/V\s*1\.[0-9.]+/,'V 1.4.6');
  const player = $('radio-player');
  const stationList = $('station-list');
  const radioView = document.querySelector('#view-radio [data-subview="listen"]');
  if (!player || !stationList || !radioView || $('fallout-stations')) return;
  const falloutBase = 'https://fallout.fm:8444/';
  const fallout = [
    ['Main Station',1], ['Fallout 76 Classical',9],
    ['Fallout 76 General',10], ['Fallout 4 Classical Radio',7],
    ['Fallout 4 Diamond City Radio',6], ['Fallout 4 MWTCF',8],
    ['Fallout 3 Galaxy News Radio',2], ['Fallout NV Radio New Vegas',3],
    ['Fallout 2 OST',4], ['Fallout 1 OST',5]
  ].map((s,i)=>({
    id:'fallout-'+i, name:s[0], provider:'Fallout.fm',
    urls:[falloutBase+'falloutfm'+s[1]+'.ogg'], home:'https://fallout.fm/'
  }));
  const allPresets=fallout;
  const style=document.createElement('style');
  style.textContent=[
    '.radio-tuner{border:1px solid #547b4c;background:#071c0c;padding:15px;margin:12px 0 16px}',
    '.radio-dial-mark{letter-spacing:.12em;font-size:11px;color:#98c988}',
    '.radio-tuned-name{font-size:clamp(15px,3vw,22px);font-weight:bold;min-height:28px;padding:9px 0}',
    '#radio-dial{accent-color:#b4f7a2;width:100%;height:28px}',
    '.radio-frequency-ruler{display:flex;justify-content:space-between;gap:6px;font-size:10px;color:#91bd80;margin:2px 0 14px}',
    '.radio-fallout-list{margin:8px 0 17px}',
    '.radio-fallout-list .station{gap:12px}',
    '.radio-fallout-list .station .item-title{font-size:14px}',
    '.radio-fallout-list .station.is-playing{background:#193d1d;box-shadow:inset 3px 0 #b3f5a3;padding-left:9px}',
    '.radio-source-row{display:flex;flex-wrap:wrap;gap:14px;margin:5px 0 0;font-size:12px}',
    '.radio-source-row a{color:#c8f7ad}',
    '#radio-extra-status{font-size:12px;color:#add8a1;min-height:18px;margin-top:9px}',
    '.radio-volume{margin:14px 0;padding:12px;border:1px solid #477b43;background:#071a0a}',
    '.radio-volume-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}',
    '.radio-volume-top label{margin:0;color:#b4f7a2;font-weight:bold;letter-spacing:.08em}',
    '.radio-volume-top output{font-weight:bold;font-size:16px;color:#cbffb6;min-width:46px;text-align:right}',
    '.radio-volume-controls{display:flex;align-items:center;gap:12px}',
    '#radio-volume-slider{flex:1;min-width:80px;width:100%;accent-color:#b4f7a2;cursor:pointer;padding:0;min-height:26px}',
    '#radio-volume-mute{flex:0 0 auto;min-width:83px}',
    '.radio-tuner .btn:focus-visible{outline:2px solid white}',
    '@media(max-width:500px){.radio-tuner{padding:10px}.radio-fallout-list .station{grid-template-columns:1fr auto}}'
  ].join('\n');
  document.head.appendChild(style);

  const tuner=document.createElement('div');
  tuner.className='radio-tuner';
  tuner.innerHTML=
    '<div class="row spread"><strong>⌁ FREQUENCY TUNER</strong><span class="pill">10 PRESETS</span></div>'+
    '<div class="radio-dial-mark">SELECT FREQUENCY / THEN TUNE</div>'+
    '<div id="radio-tuned-name" class="radio-tuned-name" aria-live="polite"></div>'+
    '<label for="radio-dial">RADIO DIAL</label>'+
    '<input id="radio-dial" type="range" min="0" max="9" step="1" value="0" />'+
    '<div class="radio-frequency-ruler"><span>FALLOUT.FM · 01</span><span>FALLOUT.FM · 10</span></div>'+
    '<button id="radio-tune-selected" type="button" class="btn primary">▶ TUNE FREQUENCY</button>'+
    '<div id="radio-extra-status" role="status" aria-live="polite"></div>'+
    '<div class="radio-source-row"><a id="radio-source-page" target="_blank" rel="noopener noreferrer" href="https://fallout.fm/">OPEN STATION SITE ↗</a>'+
    '<a id="radio-stream-direct" target="_blank" rel="noopener noreferrer" href="https://fallout.fm/">OPEN DIRECT STREAM ↗</a></div>';
  const nowPanel=radioView.querySelector('.panel');
  nowPanel.parentNode.insertBefore(tuner,nowPanel.nextSibling);

  const panel=document.createElement('div');
  panel.id='fallout-stations';
  panel.className='panel';
  panel.style.marginTop='16px';
  const heading=document.createElement('h2');
  heading.textContent='FALLOUT.FM · 10 WASTELAND FREQUENCIES';
  panel.appendChild(heading);
  const description=document.createElement('p');
  description.className='quiet';
  description.textContent='Direct public Ogg streams from Fallout.fm. Connection and playback depend on the source server and browser codec support.';
  panel.appendChild(description);
  const holder=document.createElement('div');
  holder.className='radio-fallout-list';
  fallout.forEach((st,i)=>{
    const row=document.createElement('div');
    row.className='station';
    row.dataset.stationId=st.id;
    const wrap=document.createElement('div');
    const title=document.createElement('div');title.className='item-title';title.textContent=st.name;
    const meta=document.createElement('div');meta.className='item-meta';meta.textContent='CH '+String(i+1).padStart(2,'0')+' · FALLOUT.FM';
    wrap.append(title,meta);
    const button=document.createElement('button');
    button.type='button';button.className='btn mini primary';
    button.textContent='▶ TUNE';button.dataset.falloutPlay=st.id;
    row.append(wrap,button);holder.appendChild(row);
  });
  panel.appendChild(holder);
  const before=stationList.closest('.panel');
  before.parentNode.insertBefore(panel,before);

  // Radio volume is intentionally controlled on the shared audio element:
  // it applies to presets, custom frequencies, and source fallbacks alike.
  const volumeStorageKey='pipboy-radio-volume-v145';
  const volumePanel=document.createElement('div');
  volumePanel.className='radio-volume';
  volumePanel.innerHTML=
    '<div class="radio-volume-top"><label for="radio-volume-slider">VOL · RADIO VOLUME</label>'+
    '<output id="radio-volume-value" for="radio-volume-slider">100%</output></div>'+
    '<div class="radio-volume-controls">'+
    '<input id="radio-volume-slider" type="range" min="0" max="100" step="1" value="100" aria-label="Radio volume from 0 to 100 percent">'+
    '<button type="button" class="btn mini" id="radio-volume-mute" aria-pressed="false">MUTE</button>'+
    '</div>';
  player.insertAdjacentElement('afterend',volumePanel);
  const volumeSlider=$('radio-volume-slider');
  const volumeValue=$('radio-volume-value');
  const muteButton=$('radio-volume-mute');
  let lastAudible=75;
  function readSavedVolume(){
    try{
      const stored=localStorage.getItem(volumeStorageKey);
      if(!stored)return {volume:100,muted:false};
      const obj=JSON.parse(stored);
      return {
        volume:Math.max(0,Math.min(100,Number.isFinite(Number(obj.volume))?Math.round(Number(obj.volume)):100)),
        muted:!!obj.muted
      };
    }catch {return {volume:100,muted:false};}
  }
  function saveVolume(){
    try{localStorage.setItem(volumeStorageKey,JSON.stringify({volume:Math.round(player.volume*100),muted:player.muted}));}
    catch{ /* Storage may be disabled; the controls still work. */ }
  }
  function renderVolume(){
    const amount=player.muted?0:Math.round(player.volume*100);
    volumeSlider.value=String(amount);
    volumeValue.textContent=amount+'%';
    const muted=player.muted||player.volume===0;
    muteButton.textContent=muted?'UNMUTE':'MUTE';
    muteButton.setAttribute('aria-pressed',String(muted));
  }
  const initialVolume=readSavedVolume();
  player.volume=initialVolume.volume/100;
  player.muted=initialVolume.muted;
  if(initialVolume.volume>0)lastAudible=initialVolume.volume;
  renderVolume();
  volumeSlider.addEventListener('input',()=>{
    const level=Math.max(0,Math.min(100,Number(volumeSlider.value)||0));
    player.volume=level/100;
    player.muted=level===0;
    if(level>0)lastAudible=level;
    renderVolume();saveVolume();
  });
  muteButton.addEventListener('click',()=>{
    if(player.muted||player.volume===0){
      if(player.volume===0)player.volume=lastAudible/100;
      player.muted=false;
    }else{
      lastAudible=Math.round(player.volume*100);
      player.muted=true;
    }
    renderVolume();saveVolume();
  });
  player.addEventListener('volumechange',()=>{
    if(!player.muted&&player.volume>0)lastAudible=Math.round(player.volume*100);
    renderVolume();saveVolume();
  });

  const oldInfo=nowPanel.querySelector('.info');
  if(oldInfo)oldInfo.textContent='Radio streams play inside the Pip-Boy when supported. Fallout.fm broadcasts Ogg audio, which some browsers cannot play. YouTube/Spotify web pages are not audio-stream URLs.';
  const dial=$('radio-dial');
  const dialName=$('radio-tuned-name');
  const extra=$('radio-extra-status');
  const current=$('radio-current');
  const feedback=$('radio-feedback');
  const sourcePage=$('radio-source-page');
  const direct=$('radio-stream-direct');
  let selected=fallout[0],currentStation=null,attemptIndex=0,timer=null,session=0,heard=false,attemptGeneration=0,lastFailedGeneration=-1;

  function updateDial(){
    dialName.textContent=selected.name;
    sourcePage.href=selected.home||selected.urls[0];
    direct.href=selected.urls[0];
  }
  function choose(st){
    selected=st;
    const i=allPresets.findIndex(x=>x.id===st.id);
    if(i>=0)dial.value=i;
    updateDial();
  }
  function stopTimeout(){if(timer!==null){clearTimeout(timer);timer=null;}}
  function customStation(id){
    try{
      const save=JSON.parse(localStorage.getItem('wanderer-personal-terminal-v1')||'{}');
      const station=(save.stations||[]).find(x=>x.id===id);
      if(!station||!/^https?:\/\//i.test(station.url))return null;
      return {id:station.id,name:station.name,provider:'Custom',urls:[station.url],home:station.url};
    }catch{return null;}
  }
  function setFeedback(text){feedback.textContent=text;extra.textContent=text;}
  function markPlaying(){
    holder.querySelectorAll('[data-station-id]').forEach(row=>
      row.classList.toggle('is-playing',!!currentStation&&row.dataset.stationId===currentStation.id));
  }
  function trySource(){
    if(!currentStation)return;
    stopTimeout();
    heard=false;
    const ownSession=session;
    const ownAttempt=++attemptGeneration;
    const url=currentStation.urls[attemptIndex];
    direct.href=url;
    player.pause();
    player.removeAttribute('src');
    player.src=url;
    player.load();
    current.textContent=currentStation.name.toUpperCase();
    markPlaying();
    setFeedback('CONNECTING · '+currentStation.provider+' · SOURCE '+(attemptIndex+1)+'/'+currentStation.urls.length);
    timer=setTimeout(()=>{
      if(ownSession===session&&ownAttempt===attemptGeneration&&!heard)failOver('No audio received within 15 seconds');
    },15000);
    const playPromise=player.play();
    if(playPromise&&typeof playPromise.catch==='function'){
      playPromise.catch(error=>{
        if(ownSession!==session||ownAttempt!==attemptGeneration)return;
        if(error.name==='AbortError')return;
        if(error.name==='NotAllowedError'){
          stopTimeout();
          setFeedback('Playback blocked by browser. Tap the audio play control to start.');
          return;
        }
        failOver('Playback failed: '+(error.name||'unsupported stream'));
      });
    }
  }
  function failOver(reason){
    if(!currentStation||lastFailedGeneration===attemptGeneration)return;
    lastFailedGeneration=attemptGeneration;
    stopTimeout();
    if(attemptIndex+1<currentStation.urls.length){
      attemptIndex++;
      setFeedback(reason+' · TRYING BACKUP '+(attemptIndex+1)+'/'+currentStation.urls.length);
      trySource();
    }else{
      player.pause();
      setFeedback('STREAM UNAVAILABLE · '+reason+'. Try OPEN STATION SITE or OPEN DIRECT STREAM. Your browser may not support Ogg audio.');
    }
  }
  function tune(st){
    if(!st||!st.urls||!st.urls.length)return;
    session++;
    currentStation=st;attemptIndex=0;
    choose(st);
    if(st.provider==='Fallout.fm'&&player.canPlayType('audio/ogg; codecs="vorbis"')===''){
      extra.textContent='This browser might not support Ogg. Trying anyway.';
    }
    trySource();
  }
  dial.addEventListener('input',()=>{choose(allPresets[Number(dial.value)]||fallout[0]);});
  $('radio-tune-selected').addEventListener('click',()=>tune(selected));
  holder.addEventListener('click',e=>{
    const btn=e.target.closest('[data-fallout-play]');if(!btn)return;
    const st=fallout.find(x=>x.id===btn.dataset.falloutPlay);
    if(st)tune(st);
  });
  // Capture controls before the existing legacy handler, which only tries one URL.
  stationList.addEventListener('click',e=>{
    const btn=e.target.closest('[data-station-play]');
    if(!btn)return;
    const id=btn.dataset.stationPlay;
    const station=customStation(id);
    if(!station)return; // Preserve original behavior when a custom entry is not in storage.
    e.preventDefault();
    e.stopImmediatePropagation();
    tune(station);
  },true);
  player.addEventListener('playing',()=>{
    if(!currentStation)return;
    heard=true;stopTimeout();
    setFeedback('ON AIR · '+currentStation.name);
  });
  player.addEventListener('error',()=>{
    if(currentStation)failOver('Audio connection or codec error');
  });
  player.addEventListener('stalled',()=>{
    if(currentStation&&!heard)extra.textContent='BUFFERING · Waiting for the stream source…';
  });
  $('radio-stop').addEventListener('click',()=>{
    session++;stopTimeout();currentStation=null;markPlaying();setFeedback('RADIO OFF');
  });
  updateDial();
})();