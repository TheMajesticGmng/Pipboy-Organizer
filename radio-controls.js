/* Pip-Boy Radio 1.4.6 staging — hide live stream seek bars and expose a single play/pause button.
   Keeps volume, mute, per-station gain boost, Fallout.fm and saved streams intact. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const native=$('radio-player');
  const boosted=$('pip-boosted-player');
  const button=$('radio-stop');
  if(!native||!button||$('pip-radio-transport-ready'))return;

  // A live stream has no meaningful song duration or seek timeline.
  const flag=document.createElement('span');
  flag.id='pip-radio-transport-ready';flag.hidden=true;document.body.appendChild(flag);
  native.removeAttribute('controls');
  native.controls=false;
  if(boosted){boosted.removeAttribute('controls');boosted.controls=false;}
  const css=document.createElement('style');
  css.textContent=[
    '#radio-player,#pip-boosted-player{display:none!important}',
    '#radio-stop{min-width:108px;min-height:42px;font-size:13px}',
    '#radio-stop[aria-pressed="true"]{border-color:#b4f7a2;background:#264c2c}',
    '#radio-feedback{font-size:12px;overflow-wrap:anywhere}',
  ].join('\n');
  document.head.appendChild(css);

  function hasStream(media){
    return !!media && !!media.getAttribute('src');
  }
  function isPlaying(media){
    return hasStream(media)&&!media.paused&&!media.ended;
  }
  function activePlayer(){
    if(isPlaying(boosted))return boosted;
    if(isPlaying(native))return native;
    // A paused boosted stream should resume through its amplified pipeline.
    if(hasStream(boosted))return boosted;
    if(hasStream(native))return native;
    return null;
  }
  function render(){
    const playing=isPlaying(native)||isPlaying(boosted);
    button.textContent=playing?'Ⅱ PAUSE':'▶ PLAY';
    button.setAttribute('aria-label',playing?'Pause radio stream':'Play radio stream');
    button.setAttribute('aria-pressed',String(playing));
    button.title=playing?'Pause the currently tuned station':'Resume the currently tuned station';
  }
  function play(media){
    if(!media)return;
    const promise=media.play();
    if(promise&&typeof promise.catch==='function')
      promise.catch(err=>{
        if(err.name!=='AbortError')$('radio-feedback').textContent='Playback unavailable: '+(err.message||err.name||'unknown error');
        render();
      });
  }
  // Intercept the former STOP button before legacy listeners remove the source.
  // This preserves the current tuned frequency when the listener presses Pause.
  button.addEventListener('click',function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    const current=activePlayer();
    if(isPlaying(native)||isPlaying(boosted)){
      if(isPlaying(native))native.pause();
      if(isPlaying(boosted))boosted.pause();
      $('radio-feedback').textContent='PAUSED · TAP PLAY TO RESUME';
    }else if(current){
      $('radio-feedback').textContent='RESUMING STREAM…';
      play(current);
    }else{
      // No station yet: tune the frequency selected on the dial.
      const tune=$('radio-tune-selected');
      if(tune){$('radio-feedback').textContent='TUNING SELECTED FREQUENCY…';tune.click();}
      else $('radio-feedback').textContent='SELECT A RADIO FREQUENCY FIRST';
    }
    render();
  },true);

  const events=['play','playing','pause','emptied','ended','error','loadstart'];
  for(const media of [native,boosted].filter(Boolean)){
    for(const event of events)media.addEventListener(event,()=>{
      render();
      setTimeout(render,0);
    });
  }
  render();
})();