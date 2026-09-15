/* Presentation overrides. Question bank stays in index.html. */
const progressKey = 'jaeolingo-3d-v1';
userState.streak = 0;
let bestStreak = 0;
try {
  const p = JSON.parse(localStorage.getItem(progressKey) || 'null');
  if (p && typeof p.name === 'string') {
    userState.name = p.name.slice(0,24);
    userState.currentStage = Math.max(1, Math.min(11, Number(p.currentStage) || 1));
    userState.previousStage = userState.currentStage;
    userState.xp = Math.max(0, Number(p.xp) || 0);
    userState.stars = Math.max(0, Number(p.stars) || 0);
    document.getElementById('inputPlayerName').value = userState.name;
    document.getElementById('resumeHint').textContent = `${Math.min(10,userState.currentStage-1)}개 단계 완료 · 이어서 모험할 수 있어요.`;
  }
} catch (_) { /* Browser storage may be unavailable in private mode. */ }
function saveProgress() {
  try { localStorage.setItem(progressKey, JSON.stringify({name:userState.name,currentStage:userState.currentStage,xp:userState.xp,stars:userState.stars})); } catch (_) {}
}
document.getElementById('startForm').addEventListener('submit',e=>{e.preventDefault();handleGameStart();});
const baseStart = handleGameStart;
handleGameStart = function(){baseStart();document.getElementById('labelTotalXp').textContent=userState.xp;document.getElementById('labelTotalStars').textContent=userState.stars;};
getStageNodeCoords = function(stageFloat,w,h){const f=Math.min(9,Math.max(0,stageFloat));return {x:w/2+Math.sin(f*1.5)*w*.24,y:150+f*210};};
renderBiomeDecorations = function(container,w,h){
  container.replaceChildren();
  for(let i=0;i<10;i++){
    const p=getStageNodeCoords(i,w,h);
    const decor=document.createElement('div');decor.className='island-rock';
    decor.style.cssText=`left:${p.x>w/2 ? 18:w-140}px;top:${p.y+16}px;transform:rotate(${i%2?12:-15}deg) scale(${w<500?.63:.88});`;
    container.appendChild(decor);
    if(i%2===0){const cloud=document.createElement('div');cloud.className='cloud';cloud.style.cssText=`left:${w*.4}px;top:${p.y+150}px`;container.appendChild(cloud);}
  }
};
// Keep world height independent of screen aspect ratio so stages stay comfortably spaced.
buildWorldMap = function(){
  const viewport=document.getElementById('mapViewport');mapWidth=viewport.clientWidth||400;mapHeight=2250;
  document.getElementById('mapWorld').style.height=mapHeight+'px';
  const container=document.getElementById('nodesContainer');container.replaceChildren();
  let d='';for(let f=0;f<=9.001;f+=.04){const p=getStageNodeCoords(f,mapWidth,mapHeight);d+=(f===0?'M':'L')+p.x+' '+p.y+' ';}
  const bg=document.getElementById('pathBackground'),fill=document.getElementById('pathFill');bg.setAttribute('d',d);fill.setAttribute('d',d);
  const length=bg.getTotalLength();fill.style.strokeDasharray=length;fill.style.strokeDashoffset=length*(1-Math.min(9,userState.currentStage-1)/9);
  STAGE_CONFIG.forEach((conf,i)=>{
    const p=getStageNodeCoords(i,mapWidth,mapHeight),wrap=document.createElement('div');wrap.className='absolute';wrap.style.cssText=`left:${p.x}px;top:${p.y}px;transform:translate(-50%,-50%)`;
    const button=document.createElement('button');button.type='button';const state=i+1<userState.currentStage?'cleared':i+1===userState.currentStage?'current':'locked';
    button.className='stage-btn '+state+(conf.boss?' boss':'');button.textContent=state==='cleared'?'✓':String(i+1);button.disabled=state!=='current';
    button.setAttribute('aria-label',`${i+1}단계 ${conf.name} · ${state==='locked'?'잠김':state==='cleared'?'완료':'학습 시작'}`);
    if(state==='current')button.setAttribute('aria-current','step');button.onclick=()=>enterStage();
    const label=document.createElement('div');label.className='stage-label';label.textContent=conf.name;wrap.append(button,label);container.appendChild(wrap);
  });
  renderBiomeDecorations(document.getElementById('decorationsLayer'),mapWidth,mapHeight);
  placeAvatarAt(Math.min(9,userState.currentStage-1));
  updateMapBottomUI();
  const done=Math.min(10,userState.currentStage-1);document.getElementById('courseProgress').textContent=done+' / 10';document.getElementById('courseFill').style.width=done*10+'%';
  document.getElementById('coachMessage').textContent=done===10?'모든 모험을 완성했어. 정말 수고했어!':'틀려도 괜찮아. 해설을 읽고 다시 해보자!';
};
placeAvatarAt=function(f){const p=getStageNodeCoords(f,mapWidth,mapHeight),a=document.getElementById('avatarContainer');a.style.left=p.x+'px';a.style.top=p.y+'px';const v=document.getElementById('mapViewport');v.scrollTop=Math.max(0,p.y-v.clientHeight*.38);};
const baseRender=renderQuestionBattle;
renderQuestionBattle=function(){baseRender();document.getElementById('labelMonsterName').textContent='에디와 함께 · '+userState.currentStage+'단계';document.getElementById('battleMonster').textContent='';document.getElementById('battleMonster').setAttribute('aria-label','학습 친구 에디');document.getElementById('battleMonster').setAttribute('role','img');document.getElementById('btnSubmitAnswer').textContent='정답 확인하기';};
const baseSelect=selectOption;
selectOption=function(i,el){baseSelect(i,el);document.querySelectorAll('.option-card').forEach(x=>x.setAttribute('aria-pressed',String(x===el)));};
const baseAnswer=handleAnswerSubmit;
handleAnswerSubmit=function(){if(selectedAnswerIdx===null||isTransitioning)return;const correct=selectedAnswerIdx===userState.currentQueue[0].answer;userState.streak=correct?userState.streak+1:0;bestStreak=Math.max(bestStreak,userState.streak);baseAnswer();};
const baseFeedback=showFeedbackModal;
showFeedbackModal=function(correct,text){baseFeedback(correct,text);document.getElementById('iconFeedback').textContent=correct?'✦':'♡';document.getElementById('titleFeedback').textContent=correct?`정답! +20 XP${userState.streak>1?' · '+userState.streak+'연속':''}`:userState.hp<=0?'에디와 잠깐 쉬어가요':'괜찮아요, 다시 배워봐요';const modal=document.getElementById('modalFeedback');modal.setAttribute('role','status');modal.setAttribute('aria-live','polite');document.getElementById('btnFeedbackContinue').focus({preventScroll:true});};
closeClearModalAndReturn=function(){document.getElementById('modalStageClear').classList.add('hidden');userState.currentStage=Math.min(11,userState.currentStage+1);userState.previousStage=userState.currentStage;saveProgress();document.getElementById('screenBattle').classList.add('hidden');document.getElementById('screenBattle').classList.remove('flex');document.getElementById('screenMap').classList.remove('hidden');document.getElementById('screenMap').classList.add('flex');buildWorldMap();};
const baseClear=showStageClearResult;
showStageClearResult=function(){baseClear();document.getElementById('clearGainedXp').textContent='60';document.getElementById('clearSubtitle').textContent=`${STAGE_CONFIG[userState.currentStage-1].name} 완료 · 최고 ${bestStreak}연속 정답`;};
function showLearningGuide(){
  const overlay=document.createElement('div');overlay.className='guide-overlay';
  overlay.innerHTML='<section class="guide-dialog" role="dialog" aria-modal="true" aria-labelledby="guideTitle"><span class="eyebrow">30분 수업 · 기초 개념 안내</span><h2 id="guideTitle">회계의 첫걸음</h2><p>처음에는 아래 흐름을 이해하는 데 집중하세요. 지도 뒷부분의 심화 단계는 수업 후 이어서 학습할 수 있어요.</p><ol><li>회계 필요성 — 판단에 필요한 정보를 기록해요.</li><li>자산 — 현재 통제하는 경제적 자원이에요.</li><li>부채 — 앞으로 자원을 내어줄 의무예요.</li><li>자본 — 자산에서 부채를 뺀 나머지예요.</li><li>자산 = 부채 + 자본</li><li>거래의 원인과 결과 — 무엇이 왜 변했을까요?</li><li>복식부기 — 거래를 두 측면에서 같은 금액으로 기록해요.</li></ol><p>추천: 도입 5분 → 기초 문제·해설 20분 → 정리 5분.<br>예산 배정액과 현금은 같지 않으며, 군 장비 사례는 개념 이해를 위한 비유입니다.</p><button class="duo-btn" type="button">알겠어요</button></section>';
  document.body.appendChild(overlay);const close=()=>{overlay.remove();document.querySelector('.text-button').focus();};overlay.querySelector('button').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close();};overlay.onkeydown=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();overlay.querySelector('button').focus();}};overlay.querySelector('button').focus();
}
