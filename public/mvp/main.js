import './theme.js'

const $q = sel => document.querySelector(sel)
const $qs = sel => Array.from(document.querySelectorAll(sel))

async function loadData(){
  const base = location.pathname.replace(/\/[^/]*$/, '/')
  const url = new URL('./../data/bengali.json', location.origin + base).toString()
  const res = await fetch(url, { cache: 'no-store' })
  if(!res.ok) throw new Error('Failed to fetch data: ' + res.status)
  return await res.json()
}

function shuffle(a){
  const arr = a.slice()
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]
  }
  return arr
}

function buildQuiz(all){
  if(!Array.isArray(all) || all.length < 4) throw new Error('データが不足しています（4件以上必要）')
  const correct = all[Math.floor(Math.random()*all.length)]
  const distractors = shuffle(all.filter(x=>x.id!==correct.id)).slice(0,3)
  const choices = shuffle([
    { id: correct.id, text: correct.primary_answer },
    ...distractors.map(d=>({ id:d.id, text:d.primary_answer }))
  ])
  return { question: { id: correct.id, native_string: correct.native_string }, choices, correct_answer_id: correct.id }
}

let data = null
let quiz = null
let picked = null

function render(){
  const $question = $q('#question')
  const $choices = $q('#choices')
  const $feedback = $q('#feedback')
  const $next = $q('#next')
  $question.textContent = quiz?.question.native_string || '…'
  $choices.innerHTML = ''
  quiz.choices.forEach(ch => {
    const btn = document.createElement('button')
    btn.className = 'choice'
    btn.textContent = ch.text
    btn.disabled = !!picked
    btn.addEventListener('click', () => pick(ch.id))
    if(picked){
      const isCorrect = ch.id === quiz.correct_answer_id
      const isPicked = ch.id === picked
      btn.classList.add(isCorrect ? 'choice--ok' : isPicked ? 'choice--ng' : '')
    }
    $choices.appendChild(btn)
  })
  if(!picked){
    $feedback.innerHTML = ''
    $next.setAttribute('disabled','true')
  }else{
    const correctText = quiz.choices.find(c=>c.id===quiz.correct_answer_id)?.text || ''
    $feedback.innerHTML = picked===quiz.correct_answer_id
      ? '<span class="chip chip--ok">✓ 正解</span>'
      : `<span class="chip chip--ng">✕ 不正解 <span style="margin-left:4px;color:var(--muted)">答え: ${correctText}</span></span>`
    $next.removeAttribute('disabled')
  }
}

function pick(id){ if(picked) return; picked = id; render() }
function next(){ quiz = buildQuiz(data); picked = null; render() }

async function main(){
  try{
    data = await loadData()
    quiz = buildQuiz(data)
    render()
  }catch(e){
    console.error(e)
    $q('#question').textContent = 'データ読み込みに失敗しました。サーバー経由でアクセスしてください。'
  }
  $q('#next').addEventListener('click', next)
}

main()
