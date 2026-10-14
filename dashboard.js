'use strict';
const config = window.ACTIVITY_CONFIG;
const isTeacher = document.body.dataset.page === 'teacher';
let records = [];
let loading = false;
let teacherSession = null;
const message = document.querySelector('#dashboard-message');
const dateText = value => value ? new Date(value).toLocaleString('pt-BR',{timeZone:'America/Manaus'}) : '—';
function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function filteredRecords() {
  const selectedClass = document.querySelector('#filter-class').value;
  const search = normalize(document.querySelector('#filter-name').value.trim());
  const status = document.querySelector('#filter-status').value;
  return records.filter(row => (!selectedClass || row.turma === selectedClass) && (!search || normalize(row.nome).includes(search)) && (!status || row.entregue === (status === 'yes')));
}
function render() {
  const selectedClass = document.querySelector('#filter-class').value;
  const group = records.filter(row => !selectedClass || row.turma === selectedClass);
  const delivered = group.filter(row => row.entregue).length;
  const stats = document.querySelector('#stats');
  stats.replaceChildren();
  for(const [number,label] of [[group.length,'Alunos'],[delivered,'Entregues'],[group.length-delivered,'Pendentes']]) {
    const card=document.createElement('div');card.className='stat';
    const total=document.createElement('strong');total.textContent=number;
    const caption=document.createElement('span');caption.textContent=label;
    card.append(total,caption);stats.append(card);
  }
  const rows=document.querySelector('#student-rows');rows.replaceChildren();
  for(const record of filteredRecords()) {
    const row=document.createElement('tr');
    const data=[record.turma,record.nome,record.entregue ? 'Entregue' : 'Pendente'];
    if(isTeacher) data.push(record.entregue ? `${record.acertos}/5` : '—',record.alternativas?.join(' · ') || '—',dateText(record.enviado_em));
    data.forEach((text,index)=>{const cell=document.createElement('td');if(index===2){const badge=document.createElement('span');badge.className=`badge ${record.entregue ? 'yes':'no'}`;badge.textContent=text;cell.append(badge);}else cell.textContent=text;row.append(cell);});
    rows.append(row);
  }
  if(!rows.children.length){const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=isTeacher?6:3;cell.textContent='Nenhum aluno encontrado com esses filtros.';row.append(cell);rows.append(row);}
}
async function authRequest(path,body) {
  const response=await fetch(`${config.supabaseUrl}/auth/v1/${path}`,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  if(!response.ok) throw new Error(result.msg || result.error_description || result.message || 'Não foi possível entrar. Confira os dados.');
  return result;
}
function saveSession(session) {
  teacherSession=session;
  try {if(session)sessionStorage.setItem('permutacao-teacher',JSON.stringify(session));else sessionStorage.removeItem('permutacao-teacher');} catch {}
}
async function refreshSession() {
  if(!teacherSession) throw new Error('Entre no painel para continuar.');
  if(teacherSession.expires_at*1000 < Date.now()+60000) {
    const result=await authRequest('token?grant_type=refresh_token',{refresh_token:teacherSession.refresh_token});
    saveSession(result);
  }
}
function showLogin() {
  if(!isTeacher)return;
  records=[];document.querySelector('#student-rows').replaceChildren();document.querySelector('#stats').replaceChildren();
  document.querySelector('#dashboard').hidden=true;document.querySelector('#teacher-login').hidden=false;
}
async function loadRecords() {
  if(loading || (isTeacher && !teacherSession))return;
  loading=true;document.querySelector('#refresh').disabled=true;
  try {
    if(isTeacher)await refreshSession();
    const headers={apikey:config.publishableKey};
    if(isTeacher)headers.Authorization=`Bearer ${teacherSession.access_token}`;
    const response=await fetch(`${config.endpoint}/${isTeacher?'professor':'status'}`,{headers,signal:AbortSignal.timeout(20000)});
    const result=await response.json();
    if(!response.ok) {if(response.status===401 && isTeacher){saveSession(null);showLogin();}throw new Error(result.error || 'Não foi possível atualizar.');}
    records=result.alunos;
    if(isTeacher){document.querySelector('#teacher-login').hidden=true;document.querySelector('#dashboard').hidden=false;}
    render();message.textContent='';
    document.querySelector('#updated').textContent=`Atualizado em ${dateText(result.atualizado_em)} (Manaus). Atualização automática a cada 30 segundos.`;
  } catch(error) {
    const text=error.name==='TypeError' || error.name==='TimeoutError' ? 'Não foi possível atualizar. Confira a conexão e tente novamente. A lista exibida pode estar desatualizada.' : error.message;
    message.textContent=text;
    if(isTeacher && document.querySelector('#dashboard').hidden)document.querySelector('#login-message').textContent=text;
  } finally {loading=false;document.querySelector('#refresh').disabled=false;}
}
for(const id of ['filter-class','filter-name','filter-status'])document.querySelector(`#${id}`).addEventListener('input',render);
document.querySelector('#refresh').addEventListener('click',loadRecords);
if(isTeacher) {
  document.querySelector('#teacher-email').value=config.teacherEmail;
  try{teacherSession=JSON.parse(sessionStorage.getItem('permutacao-teacher'));}catch{}
  const fragment=new URLSearchParams(location.hash.slice(1));
  if(fragment.get('access_token') && fragment.get('refresh_token')) {
    saveSession({access_token:fragment.get('access_token'),refresh_token:fragment.get('refresh_token'),expires_at:Math.floor(Date.now()/1000)+Number(fragment.get('expires_in')||3600)});
    history.replaceState(null,'',location.pathname);
  }
  document.querySelector('#login-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=document.querySelector('#sign-in');button.disabled=true;
    const loginMessage=document.querySelector('#login-message');loginMessage.textContent='Entrando…';
    try{const session=await authRequest('token?grant_type=password',{email:config.teacherEmail,password:document.querySelector('#teacher-password').value});saveSession(session);document.querySelector('#teacher-password').value='';await loadRecords();}
    catch(error){loginMessage.textContent=error.message;}finally{button.disabled=false;}
  });
  document.querySelector('#sign-up').addEventListener('click',async()=>{
    const password=document.querySelector('#teacher-password');
    if(!password.reportValidity())return;
    const button=document.querySelector('#sign-up');button.disabled=true;
    const loginMessage=document.querySelector('#login-message');loginMessage.textContent='Criando seu acesso…';
    try{const result=await authRequest(`signup?redirect_to=${encodeURIComponent(new URL('professor.html',location.href).href)}`,{email:config.teacherEmail,password:password.value});password.value='';if(result.access_token){saveSession(result);await loadRecords();}else loginMessage.textContent='Confira seu e-mail e confirme o cadastro. Depois, volte aqui e entre com a senha que você escolheu.';}
    catch(error){loginMessage.textContent=error.message;}finally{button.disabled=false;}
  });
  document.querySelector('#sign-out').addEventListener('click',async()=>{
    const token=teacherSession?.access_token;saveSession(null);showLogin();
    document.querySelector('#login-message').textContent='Você saiu do painel.';
    if(token)try{await fetch(`${config.supabaseUrl}/auth/v1/logout?scope=local`,{method:'POST',headers:{apikey:config.publishableKey,Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000)});}catch{}
  });
  document.querySelector('#export').addEventListener('click',()=>{
    const escape=value=>`"${String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')}"`;
    const lines=[['Turma','Aluno','Situação','Acertos','Q1','Q2','Q3','Q4','Q5','Entrega (Manaus)'],...filteredRecords().map(row=>[row.turma,row.nome,row.entregue?'Entregue':'Pendente',row.entregue?row.acertos:'',...(row.alternativas || ['','','','','']),row.enviado_em?dateText(row.enviado_em):''])];
    const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(line=>line.map(escape).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='entregas-permutacao.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  if(teacherSession)loadRecords();
} else loadRecords();
setInterval(()=>{if(!document.hidden)loadRecords();},30000);
