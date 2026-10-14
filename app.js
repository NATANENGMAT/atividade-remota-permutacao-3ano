'use strict';
const roster = {
  '3º1': 'Adriel Roberto|Adrielly Pimenta|Alberto Lima|Ana Paula|Clara Beatriz|Clara Victoria|Eduardo Rodrigues|Ester Alanna|Gabriel Moreira|Giovanni Queiroz|Hillary Kimily|Isabella Rocha|Isabelly Oliveira|Isabelly Socorro|Joana Carvalho|Joao Vitor|Julia Daniella|Julia Melo|Kaira Heloisa|Kamilly Vitoria|Keiber Alexander|Luciano Osorio|Luis Gustavo|Marcela Gabriela|Maria Flor|Marjorie Vitoria|Marlyson Nascimento|Maxwell Siqueira|Melissa Freitas|Natan Jacquiminouth|Pedro Lucas|Perola Poliany|Rayanne Clarisse|Salomao Aiallo|Samuel Seminario|Samylle Ermelinda|Sarah Oliveira|Savio Henrrique|Ycaro Gabriel|NATANAEL MELHOR ALUNO'.split('|'),
  '3º2': 'Alvaro Henrique|Ana Carine|Ana Luisa|Andre Joaquim|Bruna Leticia|Derick Henrick|Edson Rufino|Esther Vitoria|Fernanda Beatriz|Gabriele Ohane|Geovanna Sales|Guilherme Rocha|Gustavo Alexander|Hannyel Barreto|Isabella Silva|Isis Medeiros|Joao Gabriel|Joao Victor|Julio Cesar|Katherinne Felicia|Kaua Fellipe|Kelly Cristine|Lohanna Bernardes|Lunna Keissy|Marcus Vinicius|Maria Eduarda|Maria Fernanda|Maria Gabrielly|Maria Julia|Miguel De Lima|Nilton Cezar|Rachel Dos Santos|Rubia Nicole|Samuel Silva|Singled Lindaura|Sofia Magalhaes|Victoria Gabrielle|Waleska Lohana|NATANAEL MELHOR ALUNO'.split('|')
};
const classroom = document.querySelector('#classroom');
const student = document.querySelector('#student');
let example = 'LULA';
let step = 0;
let activeIdentity = '';
let quizState = {answers: {}, completed: false, lessonComplete:false};
let submitting = false;
const checkpoints = {};
const fraction = (numerator, denominator) => `<span class="fraction"><span>${numerator}</span><span>${denominator}</span></span>`;
function tiles(word, distinguish = false, swap = false) {
  const letter = word === 'LULA' ? 'L' : 'S';
  let occurrence = 0;
  if (swap) {
    const before = word === 'LULA' ? '<span class="tile">U</span><span class="tile">A</span>' : [...'CLARI'].map(character => `<span class="tile">${character}</span>`).join('');
    const after = word === 'LULA' ? '' : '<span class="tile">E</span>';
    return `<div class="tiles">${before}<span class="swap"><span class="tile blue">${letter}<sub>1</sub></span><span class="tile red">${letter}<sub>2</sub></span></span>${after}</div>`;
  }
  return `<div class="tiles">${[...word].map(character => {
    const repeated = character === letter;
    if (repeated) occurrence += 1;
    return `<span class="tile ${repeated ? distinguish ? occurrence === 1 ? 'blue' : 'red' : 'same' : ''}">${character}${repeated && distinguish ? `<sub>${occurrence}</sub>` : ''}</span>`;
  }).join('')}</div>`;
}
function stages(word) {
  const small = word === 'LULA';
  const total = small ? 4 : 8;
  const repeated = small ? 'L' : 'S';
  const gross = small ? '24' : '40.320';
  const product = small ? '4 × 3' : '8 × 7 × 6 × 5 × 4 × 3';
  const full = small ? '4 × 3 × 2 × 1' : '8 × 7 × 6 × 5 × 4 × 3 × 2 × 1';
  const result = small ? '12' : '20.160';
  const sequence = [
    {title:'Primeiro, conte as letras.',body:`${tiles(word)}<p>A palavra <strong>${word}</strong> possui <strong>${total} letras</strong>. A letra <strong>${repeated}</strong> aparece <strong>2 vezes</strong>.</p><span class="fact">Total: ${total} · Repetição: 2</span>`},
    {title:'O numerador conta o total bruto.',body:`${tiles(word,true)}<p>Imagine que todas as letras fossem diferentes. Teríamos ${total} escolhas para a primeira posição, depois ${total-1}, e assim por diante.</p><div class="formula">${total}! = ${full}</div><span class="fact">${gross} arranjos com as letras identificadas</span>`},
    {title:'Dê uma identidade às letras iguais.',body:`${tiles(word,true)}<p>Pintamos um <strong>${repeated}₁ de azul</strong> e o outro <strong>${repeated}₂ de vermelho</strong>. O cálculo de ${total}! considera que trocar essas letras cria outro arranjo.</p><span class="fact">As cores servem apenas para enxergar a troca.</span>`},
    {title:'Veja a troca entre as duas letras.',body:`${tiles(word,true,true)}<p>Observe somente as duas letras <strong>${repeated}</strong> coloridas. As outras letras ficam paradas. Você pode clicar em <strong>Rever animação</strong> para observar a troca outra vez.</p><div class="reveal-word" hidden>${tiles(word)}<p>Sem as cores e os índices, a sequência de letras continua igual.</p></div>`},
    {title:'O denominador corrige o excesso.',body:`${tiles(word)}<p>Na palavra real, as letras ${repeated} são idênticas. Para eliminar a duplicação, dividimos o total bruto pelas <strong>2! trocas internas</strong>.</p><div class="formula">P = ${fraction(`${total}!`,'2!')}</div><span class="fact">Numerador: conta tudo · Denominador: corrige repetições</span>`},
    {title:'Abra o fatorial só até o 2!.',body:`<p>Como ${total}! = ${product} × 2!, podemos escrever:</p><div class="formula">P = ${fraction(`${product} × 2!`,'2!')}</div><p>O mesmo fator <strong>2!</strong> aparece no numerador e no denominador. Dividir esse fator por ele mesmo resulta em 1.</p>`},
    {title:'Cancele e conclua.',body:`<div class="formula">P = ${fraction(`${product} × <span class="cancel">2!</span>`,'<span class="cancel">2!</span>')}</div><div class="formula">P = ${product}</div><strong class="result">${result} anagramas</strong><p>Contamos todas as possibilidades e retiramos as trocas invisíveis entre letras iguais.</p>`}
  ];
  const prompts = [
    {question:`Repare nas peças destacadas: há duas letras ${repeated} iguais nesta palavra?`,options:['Sim','Não'],answer:0,right:`Isso! Os dois ${repeated} são iguais. Eles ocupam duas posições, mas representam a mesma letra.`,wrong:`Olhe novamente as peças verdes: a letra ${repeated} aparece duas vezes.`,reveal:false},
    {question:`Neste ${total}!, as letras coloridas estão sendo tratadas como diferentes?`,options:['Sim','Não'],answer:0,right:`Sim! Por isso, o cálculo bruto de ${total}! conta separadamente as trocas entre ${repeated}₁ e ${repeated}₂.`,wrong:`Observe os índices 1 e 2 e as cores: neste cálculo, estamos imaginando que as letras são diferentes.`},
    {question:`Se apagarmos as cores e os índices, os dois ${repeated} continuam diferentes?`,options:['Sim','Não'],answer:1,right:`Exato! As marcas só ajudam a acompanhar as peças. Sem elas, temos dois ${repeated} idênticos.`,wrong:`As cores e os índices são marcas de observação. Apagando essas marcas, os dois caracteres são a mesma letra.`},
    {question:`Depois de trocar apenas os dois ${repeated}, mantendo as outras letras paradas, surge uma sequência de letras diferente?`,options:['Sim','Não'],answer:1,right:`Não! A sequência fica igual. Essa troca foi contada no total bruto, mas não cria um anagrama novo. Cada anagrama aparece 2! = 2 vezes nessa contagem.`,wrong:`Acompanhe as duas peças: só os ${repeated} trocam de posição. Tire as cores mentalmente. Como são a mesma letra, a sequência não muda.`,reveal:true},
    {question:'O 2! embaixo da fração está ali para retirar as contagens repetidas?',options:['Sim','Não'],answer:0,right:`Isso! Dividimos por 2! porque cada anagrama foi contado duas vezes nas trocas dos ${repeated}.`,wrong:'Repare: o numerador conta tudo. O denominador divide esse total para eliminar as contagens duplicadas.'},
    {question:'Você vê o mesmo fator 2! multiplicando em cima e aparecendo embaixo?',options:['Sim','Não'],answer:0,right:'Sim! Como 2! ÷ 2! = 1, esses fatores podem ser cancelados. Os outros fatores ficam.',wrong:'Olhe para o final do numerador e para o denominador: ambos têm 2!. É esse fator comum que vamos cancelar.'},
    {question:`Depois de cancelar os 2!, o produto que ficou é ${product}?`,options:['Sim','Não'],answer:0,right:`Exatamente! O produto restante é ${result}. Agora contamos cada anagrama uma única vez.`,wrong:`Compare a linha da fração com a linha seguinte: só o fator 2! foi cancelado. Sobrou ${product}.`}
  ];
  return sequence.map((entry,index) => ({...entry,prompt:[0,3].includes(index) ? prompts[index] : null}));
}
function renderStage() {
  const sequence = stages(example);
  const current = sequence[step];
  document.querySelector('#stage-content').innerHTML = `<h3 id="stage-title">${current.title}</h3>${current.body}`;
  const prompt = current.prompt;
  const saved = checkpoints[`${example}-${step}`];
  const checkpoint = document.querySelector('#checkpoint');
  checkpoint.hidden = !prompt;
  if (prompt) {
  checkpoint.innerHTML = `<p class="eyebrow">PARE E OBSERVE</p><h4>${prompt.question}</h4><div class="checkpoint-options" role="group" aria-label="Responda à pergunta da etapa">${prompt.options.map((option,index) => `<button type="button" class="secondary" data-choice="${index}" aria-pressed="${saved?.choice === index}">${option}</button>`).join('')}</div><p class="checkpoint-feedback" role="status"></p><p class="fine checkpoint-help">Responda para continuar. Se errar, observe novamente e tente outra vez.</p>`;
  for (const button of checkpoint.querySelectorAll('[data-choice]')) {
    button.addEventListener('click', () => {
      const choice = Number(button.dataset.choice);
      checkpoints[`${example}-${step}`] = {choice,correct:choice === prompt.answer};
      showCheckpointFeedback(prompt);
    });
  }
  showCheckpointFeedback(prompt);
  } else {
    checkpoint.replaceChildren();
    document.querySelector('#next').disabled = false;
  }
  document.querySelector('#example-label').textContent = `EXEMPLO ${example === 'LULA' ? '01' : '02'} · ${example}`;
  document.querySelector('#step-count').textContent = `ETAPA ${step+1} DE ${sequence.length}`;
  document.querySelector('#progress-fill').style.width = `${(step+1)/sequence.length*100}%`;
  document.querySelector('#previous').disabled = step === 0;
  document.querySelector('#next').textContent = step < sequence.length-1 ? 'Próxima etapa →' : example === 'LULA' ? 'Explorar CLARISSE →' : 'Ver os exercícios →';
  document.querySelector('#lula-tab').setAttribute('aria-pressed', String(example === 'LULA'));
  document.querySelector('#clarisse-tab').setAttribute('aria-pressed', String(example === 'CLARISSE'));
  if (!document.querySelector('#lesson').hidden) {
    const title = document.querySelector('#stage-title');
    title.tabIndex = -1;
    title.focus({preventScroll:true});
    title.scrollIntoView({behavior:'smooth',block:'start'});
  }
}
function showCheckpointFeedback(prompt) {
  const saved = checkpoints[`${example}-${step}`];
  const feedback = document.querySelector('.checkpoint-feedback');
  feedback.textContent = saved ? saved.correct ? prompt.right : prompt.wrong : '';
  feedback.classList.toggle('try-again', Boolean(saved && !saved.correct));
  for (const button of document.querySelectorAll('[data-choice]')) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.choice) === saved?.choice));
  }
  document.querySelector('#next').disabled = !saved?.correct;
  const reveal = document.querySelector('.reveal-word');
  if (reveal) reveal.hidden = !saved?.correct;
}
function setExample(word) { example = word; step = 0; renderStage(); }
classroom.addEventListener('change', () => {
  student.replaceChildren(new Option(classroom.value ? 'Selecione seu nome' : 'Primeiro, escolha a turma',''));
  student.disabled = !classroom.value;
  for (const name of roster[classroom.value] || []) student.add(new Option(name,name));
  document.querySelector('#lesson').hidden = true;
  try { sessionStorage.removeItem('permutacao-identificacao'); } catch {}
});
student.addEventListener('change', () => { document.querySelector('#lesson').hidden = true; });
document.querySelector('#identify').addEventListener('submit', event => {
  event.preventDefault();
  if (!(roster[classroom.value] || []).includes(student.value)) return;
  const identity = `${classroom.value}:${student.value}`;
  if (identity !== activeIdentity) {
    activeIdentity = identity;
    for (const key of Object.keys(checkpoints)) delete checkpoints[key];
    step = 0;
    quizState = {answers:{},completed:false,lessonComplete:false};
    try {
      const savedQuiz = JSON.parse(localStorage.getItem(`permutacao-v2:${activeIdentity}`));
      if (savedQuiz && typeof savedQuiz.answers === 'object' && savedQuiz.answers) {
        quizState.answers = Object.fromEntries(Object.entries(savedQuiz.answers).filter(([key,value]) => /^[1-5]$/.test(key) && ['A','B','C','D'].includes(value)));
        quizState.receipt = savedQuiz.receipt || null;
        quizState.submissionId = savedQuiz.submissionId || null;
        quizState.lessonComplete = savedQuiz.lessonComplete === true;
        quizState.completed = Boolean(savedQuiz.receipt?.id && Object.keys(quizState.answers).length === 5);
      }
    } catch {}
    renderQuiz();
  }
  document.querySelector('#greeting').textContent = `${student.value} · Turma ${classroom.value}`;
  document.querySelector('#lesson').hidden = false;
  try { sessionStorage.setItem('permutacao-identificacao',JSON.stringify({classroom:classroom.value,student:student.value})); } catch {}
  renderStage();
  document.querySelector('#lesson').scrollIntoView({behavior:'smooth',block:'start'});
});
document.querySelector('#lula-tab').addEventListener('click', () => setExample('LULA'));
document.querySelector('#clarisse-tab').addEventListener('click', () => setExample('CLARISSE'));
document.querySelector('#previous').addEventListener('click', () => { if(step>0) step-=1; renderStage(); });
document.querySelector('#replay').addEventListener('click',renderStage);
document.querySelector('#next').addEventListener('click', () => {
  if (stages(example)[step].prompt && !checkpoints[`${example}-${step}`]?.correct) return;
  if(step<stages(example).length-1) { step+=1; renderStage(); }
  else if(example==='LULA') setExample('CLARISSE');
  else {
    quizState.lessonComplete = true;
    persistQuiz();
    renderQuiz();
    document.querySelector('#exercises').scrollIntoView({behavior:'smooth'});
  }
});
const questions = [
  {text:`A palavra NATÁLIA tem 7 letras, sendo 3 iguais a A quando desconsideramos o acento. O total de anagramas é calculado por ${fraction('7!','3!')}. Seguindo a mesma lógica matemática, qual expressão representa a quantidade de anagramas da palavra AGATA?`,options:[fraction('5!','2!'),'5!',fraction('5!','3!'),fraction('5!','3! × 2!')],answer:'C',explanation:'AGATA tem 5 letras no total e 3 letras A. O numerador é 5! e o denominador é 3!.',calculation:`${fraction('5!','3!')} = 5 × 4 = 20`},
  {text:'Qual é a expressão fatorial que representa corretamente o cálculo do número de anagramas possíveis para a palavra JACIMAR?',options:['7!',fraction('7!','2!'),fraction('7!','3!'),fraction('7!','2! × 2!')],answer:'B',explanation:'JACIMAR tem 7 letras. A letra A aparece 2 vezes; as outras letras aparecem uma vez cada.',calculation:`${fraction('7!','2!')} = 2.520`},
  {text:'Ao embaralhar as letras da palavra MARIA, algumas combinações serão idênticas devido à repetição de letras. Qual expressão calcula o número de anagramas únicos dessa palavra?',options:[fraction('5!','2!'),fraction('5!','3!'),'5!',fraction('5!','2! × 2!')],answer:'A',explanation:'MARIA tem 5 letras, com 2 letras A. Dividimos o total bruto de 5! pelas 2! trocas entre os A.',calculation:`${fraction('5!','2!')} = 60`},
  {text:`Quando há mais de uma letra repetida, multiplicamos os fatoriais das repetições no denominador. A palavra <strong>ARARA</strong> tem 5 letras: 3 letras A e 2 letras R. Assim, usamos ${fraction('5!','3! × 2!')} para calcular o total de anagramas. Qual é a expressão correta para a quantidade de anagramas da palavra NATANAEL?`,options:[fraction('8!','3!'),fraction('8!','3! × 2!'),fraction('8!','2! × 2!'),fraction('8!','3! × 2! × 2!')],answer:'B',explanation:'NATANAEL tem 8 letras. O A aparece 3 vezes e o N aparece 2 vezes. As duas repetições precisam ser corrigidas.',calculation:`${fraction('8!','3! × 2!')} = 3.360`},
  {text:'Uma urna contém 6 bolas, sendo 4 azuis e 2 laranjas. Ao retirar todas as bolas, uma a uma, qual expressão calcula o número de sequências de cores diferentes que podem ser formadas?',hint:'A lógica é a mesma das letras repetidas: bolas da mesma cor são consideradas idênticas na sequência de cores.',options:[fraction('6!','4!'),fraction('6!','2!'),fraction('6!','4! × 2!'),fraction('4! × 2!','6!')],answer:'C',explanation:'São 6 bolas no total. As 4 azuis são idênticas entre si na sequência de cores, assim como as 2 laranjas. Dividimos por 4! × 2!.',calculation:`${fraction('6!','4! × 2!')} = ${fraction('6 × 5','2 × 1')} = 15`}
];
function persistQuiz() {
  try {
    localStorage.setItem(`permutacao-v2:${activeIdentity}`,JSON.stringify(quizState));
    document.querySelector('#save-note').textContent = quizState.completed ? 'Entrega registrada no banco de dados do professor.' : 'Rascunho salvo neste navegador. Clique em Entregar atividade para enviar ao professor.';
  } catch {
    document.querySelector('#save-note').textContent = quizState.completed ? 'Entrega registrada no banco de dados do professor.' : 'Este navegador não permitiu salvar o rascunho. Mantenha esta página aberta e entregue quando terminar.';
  }
}
function updateQuizProgress() {
  document.querySelector('#quiz-progress').textContent = `${Object.keys(quizState.answers).length} de 5 respondidas`;
}
function renderQuiz() {
  document.querySelector('#quiz').hidden = !quizState.lessonComplete;
  document.querySelector('#quiz-locked').hidden = quizState.lessonComplete;
  const list = document.querySelector('#question-list');
  list.replaceChildren();
  questions.forEach((question,index) => {
    const number = index+1;
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'quiz-question card';
    fieldset.id = `question-${number}`;
    fieldset.disabled = quizState.completed;
    fieldset.innerHTML = `<legend>Questão ${number}</legend><p class="question-text">${question.text}</p>${question.hint ? `<p class="question-hint">Dica: ${question.hint}</p>` : ''}<div class="answer-options">${question.options.map((option,optionIndex) => {
      const letter = String.fromCharCode(65+optionIndex);
      return `<label class="answer-option"><input type="radio" name="question-${number}" value="${letter}" ${quizState.answers[number] === letter ? 'checked' : ''} required><span class="option-letter">${letter}</span><span class="option-math">${option}</span></label>`;
    }).join('')}</div>`;
    fieldset.addEventListener('change', event => {
      if (quizState.completed) return;
      quizState.answers[number] = event.target.value;
      document.querySelector('#quiz-message').textContent = '';
      updateQuizProgress();
      persistQuiz();
    });
    list.append(fieldset);
  });
  updateQuizProgress();
  document.querySelector('#quiz-message').textContent = '';
  document.querySelector('#finish-quiz').hidden = quizState.completed;
  document.querySelector('#quiz-result').hidden = !quizState.completed;
  if (quizState.completed) renderResults();
}
function renderResults() {
  const correct = quizState.receipt.acertos;
  const result = document.querySelector('#quiz-result');
  result.hidden = false;
  result.innerHTML = `<p class="eyebrow">ENTREGA CONFIRMADA</p><h2 id="result-title">${correct} de 5 acertos</h2><p id="result-student"></p><p>Sua atividade foi registrada para o professor. Confira as resoluções abaixo.</p><p class="fine" id="receipt-date"></p><div class="corrections">${questions.map((question,index) => {
    const selected = quizState.answers[index+1];
    const matched = selected === question.answer;
    return `<article class="correction ${matched ? 'correct' : 'review'}"><h3>Questão ${index+1} · ${matched ? 'Você acertou' : 'Vamos revisar'}</h3><p>Sua resposta: <strong>${selected}</strong> · Alternativa correta: <strong>${question.answer}</strong></p><p>${question.explanation}</p><div class="formula">${question.calculation}</div></article>`;
  }).join('')}</div><a class="button-link" href="entregas.html">Ver lista de entregas →</a>`;
  document.querySelector('#result-student').textContent = `${student.value} · Turma ${classroom.value}`;
  document.querySelector('#receipt-date').textContent = `Registrada em ${new Date(quizState.receipt.enviado_em).toLocaleString('pt-BR',{timeZone:'America/Manaus'})} (Manaus). Comprovante: ${quizState.receipt.id}`;
}
document.querySelector('#quiz').addEventListener('submit', async event => {
  event.preventDefault();
  if (!activeIdentity || quizState.completed || submitting || !quizState.lessonComplete) return;
  if (Object.keys(quizState.answers).length !== 5) {
    document.querySelector('#quiz-message').textContent = 'Responda às cinco questões antes de concluir.';
    return;
  }
  submitting = true;
  const button = document.querySelector('#finish-quiz');
  button.disabled = true;
  button.textContent = 'Registrando sua entrega…';
  classroom.disabled = true;
  student.disabled = true;
  for (const fieldset of document.querySelectorAll('.quiz-question')) fieldset.disabled = true;
  if (!quizState.submissionId) quizState.submissionId = crypto.randomUUID();
  persistQuiz();
  try {
    const config = window.ACTIVITY_CONFIG;
    const response = await fetch(`${config.endpoint}/entregar`,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({id:quizState.submissionId,turma:classroom.value,nome:student.value,alternativas:[1,2,3,4,5].map(number=>quizState.answers[number])}),signal:AbortSignal.timeout(25000)});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Não foi possível registrar a entrega. Tente novamente.');
    quizState.receipt = result;
    quizState.completed = true;
    persistQuiz();
    renderQuiz();
    document.querySelector('#quiz-result').focus();
  } catch(error) {
    document.querySelector('#quiz-message').textContent = error.name === 'TimeoutError' || error.name === 'TypeError' ? 'Não recebemos a confirmação do envio. Confira a internet e tente novamente; suas escolhas foram preservadas.' : error.message;
  } finally {
    submitting = false;
    button.disabled = false;
    button.textContent = 'Entregar atividade →';
    classroom.disabled = false;
    student.disabled = false;
    for (const fieldset of document.querySelectorAll('.quiz-question')) fieldset.disabled = quizState.completed;
  }
});
try {
  const saved=JSON.parse(sessionStorage.getItem('permutacao-identificacao'));
  if(saved && (roster[saved.classroom] || []).includes(saved.student)) {
    classroom.value=saved.classroom;
    classroom.dispatchEvent(new Event('change'));
    student.value=saved.student;
    document.querySelector('#identify').requestSubmit();
  }
} catch {}
renderStage();
