const arabicNumber = value => new Intl.NumberFormat('ar-SA').format(value);

const initiatives = {
  awareness: {
    label: 'مسار التوعية والإرشاد', title: 'وعيٌ يحمي الاختيار',
    text: 'مبادرات وقائية ونمائية تمنح الطالب معرفة مناسبة لعمره، وتساعده على التعامل الواعي مع المواقف اليومية.',
    items: [['أنا آمن رقميًا','توعية عملية بالخصوصية والروابط والاحتيال الإلكتروني.'],['نفسي أولًا','مهارات فهم المشاعر وطلب المساندة وإدارة الضغوط.'],['قراري مسؤوليتي','خطوات مبسطة لاتخاذ القرار وحل المشكلات.']]
  },
  achievement: {
    label: 'مسار التحصيل الدراسي', title: 'نخطط اليوم، لنتفوق غدًا',
    text: 'برامج تتعامل مع التعثر مبكرًا وتبني لدى الطالب أدوات مستدامة للتعلم والإنجاز.',
    items: [['رفيق التفوق','مساندة أقران منظمة لتبادل الخبرة والتحفيز.'],['خطتي الدراسية','بناء جدول واقعي ومتابعة أسبوعية للأهداف.'],['جاهز للاختبار','تدريب على الاستذكار وإدارة القلق ووقت الاختبار.']]
  },
  behavior: {
    label: 'مسار السلوك الإيجابي', title: 'قيمٌ تُرى في أفعالنا',
    text: 'ممارسات تعزز الانتماء والاحترام والمسؤولية، وتحتفي بالسلوك الإيجابي في المجتمع المدرسي.',
    items: [['قيمة الأسبوع','تطبيق سلوكي أسبوعي لقيمة مختارة.'],['رفقًا نسمو','رسائل ومواقف لتعزيز الرفق والحد من التنمر.'],['سفير الإيجابية','تكريم الطلاب أصحاب الأثر الإيجابي الملحوظ.']]
  }
};

const quiz = [
  {category:'وعي رقمي', question:'ما أفضل تصرف عند استلام رابط مجهول المصدر؟', answers:['فتحه سريعًا لمعرفة محتواه','إرساله إلى الأصدقاء للتأكد','تجاهله والتحقق من المرسل أولًا','حفظه وفتحه لاحقًا'], correct:2, note:'رائع! التحقق من المصدر يحمي بياناتك وأجهزتك.'},
  {category:'تحصيل دراسي', question:'أي طريقة تساعد أكثر على تثبيت المعلومات؟', answers:['قراءة الدرس مرة واحدة','المراجعة المتباعدة واختبار النفس','الدراسة لساعات دون توقف','تأجيل المراجعة لليلة الاختبار'], correct:1, note:'صحيح؛ المراجعة المتباعدة واسترجاع المعلومة من أقوى أساليب التعلم.'},
  {category:'سلوك إيجابي', question:'رأيت زميلًا جديدًا يجلس وحده، ما المبادرة الأفضل؟', answers:['انتظار أن يبدأ هو الحديث','دعوتُه للمشاركة والتعرّف إليه','تجاهل الموقف لأنه لا يخصني','الاكتفاء بالابتسام من بعيد'], correct:1, note:'أحسنت! المبادرة بالترحيب تصنع بيئة مدرسية أكثر أمانًا وانتماءً.'}
];

let currentQuestion = 0, score = 0, answered = false;
const questionText = document.querySelector('#question-text');
const answersBox = document.querySelector('#answers');
const nextButton = document.querySelector('#next-question');
const feedback = document.querySelector('#quiz-feedback');

function renderQuestion(){
  const item = quiz[currentQuestion]; answered = false;
  document.querySelector('#quiz-category').textContent = item.category;
  document.querySelector('#question-number').textContent = arabicNumber(currentQuestion + 1);
  document.querySelector('#quiz-progress').style.width = `${((currentQuestion + 1) / quiz.length) * 100}%`;
  questionText.textContent = item.question; feedback.textContent = ''; nextButton.disabled = true;
  nextButton.textContent = currentQuestion === quiz.length - 1 ? 'عرض النتيجة' : 'السؤال التالي';
  answersBox.innerHTML = '';
  item.answers.forEach((answer,index)=>{
    const button = document.createElement('button'); button.type='button'; button.className='answer';
    button.textContent = answer; button.addEventListener('click',()=>selectAnswer(index,button)); answersBox.append(button);
  });
}

function selectAnswer(index,button){
  if(answered) return; answered = true; const item = quiz[currentQuestion];
  [...answersBox.children].forEach((el,i)=>{el.disabled=true;if(i===item.correct)el.classList.add('correct')});
  if(index===item.correct){score++; feedback.textContent=item.note; feedback.style.color='#347d5c'}
  else{button.classList.add('wrong');feedback.textContent='إجابة غير صحيحة، لكنك الآن تعرف الاختيار الأفضل.';feedback.style.color='#b94e3d'}
  nextButton.disabled=false;
}

nextButton.addEventListener('click',()=>{ if(currentQuestion < quiz.length-1){currentQuestion++;renderQuestion()}else finishQuiz() });

function finishQuiz(){
  const percent = Math.round(score/quiz.length*100); const records = JSON.parse(localStorage.getItem('student-guidance-results')||'[]');
  records.unshift({score:percent,date:new Date().toLocaleDateString('ar-SA')}); localStorage.setItem('student-guidance-results',JSON.stringify(records.slice(0,5)));
  questionText.textContent = score===3?'ممتاز! أنت طالب واعٍ 🌟':score===2?'أداء جميل، واصل نموك':'كل محاولة تمنحك معرفة جديدة';
  answersBox.innerHTML=`<div style="text-align:center;padding:16px"><strong style="font-size:58px;color:#ee765f">${arabicNumber(percent)}٪</strong><p>أجبت عن ${arabicNumber(score)} من ${arabicNumber(quiz.length)} إجابات صحيحة.</p></div>`;
  feedback.textContent='تم حفظ النتيجة في سجل الإنجاز على هذا الجهاز.'; feedback.style.color='#347d5c';
  nextButton.textContent='إعادة المسابقة'; nextButton.disabled=false;
  nextButton.onclick=()=>{currentQuestion=0;score=0;nextButton.onclick=null;renderQuestion()};
  renderResults(); showToast('أضيفت نتيجتك إلى لوحة الإنجاز');
}

function renderResults(){
  const records=JSON.parse(localStorage.getItem('student-guidance-results')||'[]'); const list=document.querySelector('#results-list');
  if(!records.length){list.innerHTML='<p class="empty-state">أكمل المسابقة لتظهر نتيجتك هنا.</p>';return}
  list.innerHTML=records.map((r,i)=>`<div class="result-row"><span>محاولة ${arabicNumber(records.length-i)} · ${r.date}</span><b>${arabicNumber(r.score)}٪</b></div>`).join('');
  const avg=Math.round(records.reduce((a,r)=>a+r.score,0)/records.length); document.querySelector('#average-score').textContent=`${arabicNumber(avg)}٪`;
  document.querySelector('#score-donut').style.background=`conic-gradient(var(--coral) ${avg}%,#edf0ec 0)`;
  document.querySelector('#total-participations').textContent=arabicNumber(340+records.length); document.querySelector('#participant-count').textContent=arabicNumber(128+records.length);
}

document.querySelector('#clear-results').addEventListener('click',()=>{localStorage.removeItem('student-guidance-results');renderResults();showToast('تم مسح سجل النتائج')});

const modal=document.querySelector('#initiative-modal');
document.querySelectorAll('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>{
  const data=initiatives[btn.dataset.modal]; document.querySelector('#modal-label').textContent=data.label; document.querySelector('#modal-title').textContent=data.title; document.querySelector('#modal-text').textContent=data.text;
  document.querySelector('#modal-items').innerHTML=data.items.map(i=>`<div class="modal-item"><b>${i[0]}</b><span>${i[1]}</span></div>`).join(''); modal.showModal();
}));
document.querySelector('.modal-close').addEventListener('click',()=>modal.close()); modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});

const menuButton=document.querySelector('.menu-button'), nav=document.querySelector('nav'); menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',open)});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));

const sections=[...document.querySelectorAll('main section[id]')]; const navLinks=[...document.querySelectorAll('nav a')];
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${entry.target.id}`))}}),{rootMargin:'-40% 0px -50%'}); sections.forEach(s=>sectionObserver.observe(s));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

function showToast(text){const toast=document.querySelector('#toast');toast.textContent=text;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2500)}
document.querySelector('#year').textContent=new Date().getFullYear(); renderQuestion(); renderResults();
