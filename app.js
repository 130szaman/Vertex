// Simple content store for demo lessons (you will add more in files or CMS later)
const LESSONS = {
  "cell-structure": {
    title: "Cell Structure (Biology)",
    steps: [
      "Cells are the smallest unit of life.",
      "Some cells have a nucleus (eukaryotes), others do not (prokaryotes).",
      "Mitochondria make energy in many cells (ATP)."
    ],
    question: "What is the powerhouse of the cell?",
    choices: ["Nucleus", "Mitochondrion", "Ribosome", "Cell wall"],
    correctIndex: 1,
    hint: "It produces ATP.",
    links: [
      {text: "NCBI", href: "https://www.ncbi.nlm.nih.gov/"},
      {text: "Google Scholar", href: "https://scholar.google.com"}
    ],
    chartData: [0,1,3,2,5]
  },
  "photosynthesis-basic": {
    title: "Photosynthesis (Biology)",
    steps: [
      "Plants use sunlight to make food in chloroplasts.",
      "Chlorophyll captures light energy.",
      "Photosynthesis makes glucose and oxygen."
    ],
    question: "Where in the plant cell does photosynthesis happen?",
    choices: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
    correctIndex: 1,
    hint: "It contains chlorophyll.",
    links: [
      {text: "Plant Biology - NCBI", href: "https://www.ncbi.nlm.nih.gov/"}
    ],
    chartData: [1,2,3,4,5]
  }
};

// UI elements
const search = document.getElementById('search');
const cards = Array.from(document.querySelectorAll('.topic-card'));
const openButtons = document.querySelectorAll('.open-lesson');
const lesson = document.getElementById('lesson');
const lessonTitle = document.getElementById('lessonTitle');
const stepsList = document.getElementById('stepsList');
const questionText = document.getElementById('questionText');
const choicesDiv = document.getElementById('choices');
const hintDiv = document.getElementById('hint');
const answerDiv = document.getElementById('answer');
const showHintBtn = document.getElementById('showHint');
const showAnswerBtn = document.getElementById('showAnswer');
const linksList = document.getElementById('linksList');
const closeBtn = document.getElementById('closeLesson');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const apElements = document.querySelectorAll('.ap-only');

// Search filter
if (search) {
  search.addEventListener('input', ()=>{
    const q = search.value.trim().toLowerCase();
    cards.forEach(card=>{
      const title = card.querySelector('h2').textContent.toLowerCase();
      const body = card.querySelector('p').textContent.toLowerCase();
      card.style.display = (title.includes(q) || body.includes(q) || q === '') ? '' : 'none';
    });
  });
}

// Open lesson buttons
openButtons.forEach(btn=>{
  btn.addEventListener('click', () => {
    const lessonId = btn.dataset.lesson;
    openLesson(lessonId);
  });
});

if (closeBtn) closeBtn.addEventListener('click', ()=> lesson.hidden = true);

// Load lesson content into lesson area
function openLesson(id){
  const data = LESSONS[id];
  if (!data) return;
  lessonTitle.textContent = data.title;
  stepsList.innerHTML = '';
  data.steps.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = s;
    stepsList.appendChild(li);
  });
  // question + choices
  questionText.textContent = data.question;
  choicesDiv.innerHTML = '';
  data.choices.forEach((c, i)=>{
    const b = document.createElement('button');
    b.textContent = c;
    b.className = 'smallBtn';
    b.addEventListener('click', ()=>{
      if (i === data.correctIndex) {
        answerDiv.hidden = false;
        answerDiv.textContent = "Correct! " + data.choices[data.correctIndex];
      } else {
        answerDiv.hidden = false;
        answerDiv.textContent = "Try again.";
      }
    });
    choicesDiv.appendChild(b);
  });
  hintDiv.hidden = true;
  hintDiv.textContent = data.hint;
  answerDiv.hidden = true;
  answerDiv.textContent = "";
  linksList.innerHTML = '';
  data.links.forEach(l=>{
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = l.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = l.text;
    li.appendChild(a);
    linksList.appendChild(li);
  });

  // simple chart example using Chart.js (if loaded)
  setTimeout(()=>{ // wait for lesson area to be visible
    const canvas = document.getElementById('demoChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window._demoChart) window._demoChart.destroy();
    window._demoChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0','1','2','3','4'],
        datasets: [{label: 'Sample data', data: data.chartData, borderColor:'#2b7a78', backgroundColor:'rgba(43,122,120,0.12)'}]
      },
      options:{responsive:true, maintainAspectRatio:false}
    });
  }, 50);

  lesson.hidden = false;
  lesson.scrollIntoView({behavior:'smooth'});
}

// Hint / reveal
if (showHintBtn) showHintBtn.addEventListener('click', ()=> hintDiv.hidden = false);
if (showAnswerBtn) showAnswerBtn.addEventListener('click', ()=> {
  // reveal official answer for the currently opened lesson (best effort)
  const key = Object.keys(LESSONS).find(k => LESSONS[k].title === lessonTitle.textContent);
  const data = key ? LESSONS[key] : LESSONS["cell-structure"];
  answerDiv.hidden = false;
  answerDiv.textContent = "Answer: " + data.choices[data.correctIndex];
});

// ---------- Netlify Identity (simple gating) ----------
function initIdentity(){
  if (!window.netlifyIdentity) return;
  const netlifyIdentity = window.netlifyIdentity;
  netlifyIdentity.on('init', user => {
    updateUI(user);
  });
  netlifyIdentity.on('login', user => {
    netlifyIdentity.close();
    updateUI(user);
  });
  netlifyIdentity.on('logout', () => {
    updateUI(null);
  });
  netlifyIdentity.init();
  if (loginBtn) loginBtn.addEventListener('click', ()=> netlifyIdentity.open());
  if (logoutBtn) logoutBtn.addEventListener('click', ()=> netlifyIdentity.logout());
}

function updateUI(user){
  if (user) {
    if (loginBtn) loginBtn.hidden = true;
    if (logoutBtn) logoutBtn.hidden = false;
    const roles = (user.app_metadata && user.app_metadata.roles) || [];
    const hasAP = roles.includes('AP');
    apElements.forEach(el => el.hidden = !hasAP);
  } else {
    if (loginBtn) loginBtn.hidden = false;
    if (logoutBtn) logoutBtn.hidden = true;
    apElements.forEach(el => el.hidden = true);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initIdentity();
});
