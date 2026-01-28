(function(){
  var BANK = (window.QUIZ_BANK || []).slice(); // 복사
  var score = 0, idx = 0, picked = [], selected = null, checked = false;
  var best = +(localStorage.getItem('quizBest')||0);

  var els = {
    countSel: document.getElementById('countSel'),
    best: document.getElementById('best'),
    qnum: document.getElementById('qnum'),
    qtotal: document.getElementById('qtotal'),
    score: document.getElementById('score'),
    bar: document.getElementById('bar'),
    question: document.getElementById('question'),
    choices: document.getElementById('choices'),
    submit: document.getElementById('submitBtn'),
    next: document.getElementById('nextBtn'),
    restart: document.getElementById('restartBtn'),
    result: document.getElementById('result')
  };
  els.best.textContent = best;

  function shuffle(arr){
    for (var i=arr.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var t = arr[i]; arr[i]=arr[j]; arr[j]=t;
    }
    return arr;
  }
  function pickN(n){
    var pool = shuffle(BANK.slice());
    if (n==='all') return pool;
    n = Math.min(pool.length, +n);
    return pool.slice(0,n);
  }

  function start(){
    score = 0; idx = 0; checked=false; selected=null;
    picked = pickN(els.countSel.value);
    els.qtotal.textContent = picked.length;
    els.score.textContent = score;
    els.result.style.display = 'none';
    load();
  }

  function load(){
    var cur = picked[idx];
    els.qnum.textContent = idx+1;
    els.question.textContent = cur.q;
    els.choices.innerHTML = '';
    selected = null; checked = false;
    els.submit.disabled = true; els.next.disabled = true;

    // 보기 섞기: 보기 순서가 섞여도 정답 인덱스 추적
    var optionIdx = [0,1,2,3].slice(0, cur.options.length);
    shuffle(optionIdx);
    cur._map = optionIdx; // 보여주는 순서
    for (var k=0;k<optionIdx.length;k++){
      (function(showPos){
        var realIdx = optionIdx[showPos];
        var btn = document.createElement('button');
        btn.className = 'choice'; btn.type='button';
        btn.textContent = cur.options[realIdx];
        btn.onclick = function(){
          if (checked) return;
          // 선택 토글
          var nodes = els.choices.querySelectorAll('.choice');
          for (var i=0;i<nodes.length;i++) nodes[i].classList.remove('selected');
          btn.classList.add('selected');
          selected = realIdx;
          els.submit.disabled = false;
        };
        els.choices.appendChild(btn);
      })(k);
    }
    progress();
  }

  function progress(){
    var p = (idx / picked.length) * 100;
    els.bar.style.width = p + '%';
  }

  function submit(){
    if (checked || selected===null) return;
    checked = true;
    var cur = picked[idx];
    var correct = cur.a;

    // 표시
    var nodes = els.choices.querySelectorAll('.choice');
    for (var i=0;i<nodes.length;i++){
      var label = nodes[i].textContent;
      // label을 다시 실제 인덱스로 역매핑
      var realIdx = cur.options.indexOf(label);
      if (realIdx === correct) nodes[i].classList.add('correct');
      if (realIdx === selected && selected !== correct) nodes[i].classList.add('incorrect');
      nodes[i].disabled = true;
    }

    if (selected === correct){
      score++; els.score.textContent = score;
    }
    els.next.disabled = false;

    // 마지막 문제면 결과 보이기 준비
    if (idx === picked.length-1){
      els.next.textContent = '결과 보기';
    } else {
      els.next.textContent = '다음 문제';
    }
  }

  function next(){
    if (!checked) return;
    if (idx < picked.length-1){
      idx++; load();
    } else {
      finish();
    }
  }

  function finish(){
    // 진행바 100%
    els.bar.style.width = '100%';
    // 베스트 갱신
    if (score > best){
      best = score; localStorage.setItem('quizBest', best);
      els.best.textContent = best;
    }
    // 오답 복습
    var wrong = [];
    for (var i=0;i<picked.length;i++){
      var q = picked[i];
      // 내부에 사용한 _user와 _correct 표시 저장해두지 않았다면 스코어로 유추가 어려움 ->
      // 간단히 다시 정답만 요약 제공
      // (확장: 제출 시 _user 저장하도록 변경)
    }
    // 제출 시 저장되도록 보강
    // 아래는 간단한 기록 로직
    if (!picked[0]._userTracked){
      // 이번 세션 동안 제출 때 기록하도록 이벤트 패치
    }

    // 실제 기록을 위해 score 계산 때 userSelected 기록해두자
  }

  // --- 제출 시 사용자 선택 기록하도록 패치 ---
  var _submit = submit;
  submit = function(){
    if (checked || selected===null) return;
    var cur = picked[idx];
    cur._user = selected; // 기록
    _submit();
  };

  function renderResult(){
    var total = picked.length;
    var html = '<div class="card" style="margin-top:6px"><span class="pill">최종 점수 '+score+' / '+total+'</span>';
    html += '<ul class="review">';
    for (var i=0;i<picked.length;i++){
      var q = picked[i];
      if (q._user === q.a) continue;
      html += '<li><b>'+escapeHTML(q.q)+'</b><br><span class="muted">정답: '+escapeHTML(q.options[q.a])+'</span></li>';
    }
    html += '</ul></div>';
    els.result.innerHTML = html;
    els.result.style.display = 'block';
  }

  function escapeHTML(s){
    return String(s).replace(/[&<>\"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function finish(){
    els.bar.style.width = '100%';
    if (score > best){
      best = score; localStorage.setItem('quizBest', best);
      els.best.textContent = best;
    }
    renderResult();
    els.submit.disabled = true;
    els.next.disabled = true;
    els.question.textContent = '🎉 퀴즈 완료!';
    els.choices.innerHTML = '';
  }

  // 이벤트
  els.submit.addEventListener('click', submit);
  els.next.addEventListener('click', next);
  els.restart.addEventListener('click', start);
  els.countSel.addEventListener('change', start);

  // 숫자키 1–4 단축키
  window.addEventListener('keydown', function(e){
    var map = {'1':0,'2':1,'3':2,'4':3};
    if (map[e.key]===undefined) return;
    var btns = els.choices.querySelectorAll('.choice');
    if (btns[map[e.key]]) btns[map[e.key]].click();
  });

  // 시작
  start();
})();
