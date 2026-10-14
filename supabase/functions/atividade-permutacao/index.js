const PUBLIC_KEY = "sb_publishable_gv_lK9K2hrReKQvC-5Ou7Q_vI9c1NwI";
const PROJECT_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const TEACHER_EMAIL = 'natanael.igor.nogueira@prof.am.gov.br';
const ANSWERS = ['C','B','A','B','C'];
const origins = new Set(['https://natanengmat.github.io','https://permutacao-prof-natanael-3ano.natan032526.chatgpt.site','http://127.0.0.1:4176']);
function response(data, status, origin) {
 return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey, authorization, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Cache-Control':'no-store','Vary':'Origin'}});
}
async function database(path, options={}) {
 const result = await fetch(PROJECT_URL+'/rest/v1/'+path,{...options,headers:{apikey:SERVICE_KEY,Authorization:'Bearer '+SERVICE_KEY,'Content-Type':'application/json',Prefer:'return=representation',...options.headers}});
 if(!result.ok) { const error=new Error('Falha ao consultar os registros. Tente novamente.');error.status=result.status;throw error; }
 return result.status===204 ? null : await result.json();
}
async function teacher(request) {
 const authorization=request.headers.get('authorization') || '';
 if(!authorization.startsWith('Bearer ')) return false;
 const result=await fetch(PROJECT_URL+'/auth/v1/user',{headers:{apikey:PUBLIC_KEY,Authorization:authorization}});
 if(!result.ok) return false;
 const user=await result.json();
 return user.email?.toLowerCase()===TEACHER_EMAIL && Boolean(user.email_confirmed_at);
}
Deno.serve(async request => {
 const origin=request.headers.get('origin') || '';
 if(origin && !origins.has(origin)) return response({error:'Origem não autorizada.'},403,'null');
 if(request.method==='OPTIONS') return response({},200,origin);
 if(request.headers.get('apikey')!==PUBLIC_KEY) return response({error:'Chave de acesso inválida.'},401,origin);
 const route=new URL(request.url).pathname.split('/').filter(Boolean).at(-1);
 try {
  if(request.method==='GET' && (route==='status' || route==='professor')) {
   const admin=route==='professor';
   if(admin && !(await teacher(request))) return response({error:'Entre com a conta confirmada do professor.'},401,origin);
   const [students,submissions]=await Promise.all([
    database('permutacao_alunos?select=id,turma,nome&order=turma,nome'),
    database('permutacao_entregas?select='+ (admin ? 'id,aluno_id,alternativas,acertos,enviado_em' : 'aluno_id'))
   ]);
   const byStudent=new Map(submissions.map(item=>[item.aluno_id,item]));
   return response({alunos:students.map(student=>{
    const submitted=byStudent.get(student.id);
    return {id:student.id,turma:student.turma,nome:student.nome,entregue:Boolean(submitted),...(admin && submitted ? {alternativas:submitted.alternativas,acertos:submitted.acertos,enviado_em:submitted.enviado_em}: {})};
   }),atualizado_em:new Date().toISOString()},200,origin);
  }
  if(request.method==='POST' && route==='entregar') {
   const bodyText=await request.text();
   if(bodyText.length>4096) return response({error:'Envio muito grande.'},413,origin);
   let body;try{body=JSON.parse(bodyText);}catch{return response({error:'Envio inválido.'},400,origin);}
   const {id,turma,nome,alternativas}=body;
   if(typeof id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !['3º1','3º2'].includes(turma) || typeof nome!=='string' || nome.length>100 || !Array.isArray(alternativas) || alternativas.length!==5 || alternativas.some(answer=>!['A','B','C','D'].includes(answer))) return response({error:'Escolha seu nome e responda às cinco questões.'},400,origin);
   const studentId=turma+':'+nome;
   const students=await database('permutacao_alunos?id=eq.'+encodeURIComponent(studentId)+'&select=id');
   if(students.length!==1) return response({error:'Nome não encontrado nesta turma.'},400,origin);
   const previous=await database('permutacao_entregas?aluno_id=eq.'+encodeURIComponent(studentId)+'&select=id,alternativas,acertos,enviado_em');
   const receipt=item=>({id:item.id,acertos:item.acertos,total:5,enviado_em:item.enviado_em,gabarito:ANSWERS});
   if(previous.length) {
    if(previous[0].id===id && JSON.stringify(previous[0].alternativas)===JSON.stringify(alternativas)) return response(receipt(previous[0]),200,origin);
    return response({error:'Esta atividade já foi entregue para este nome e turma. Consulte o professor se precisar corrigir sua identificação.'},409,origin);
   }
   const score=alternativas.reduce((count,answer,index)=>count+Number(answer===ANSWERS[index]),0);
   try {
    const rows=await database('permutacao_entregas',{method:'POST',body:JSON.stringify({id,aluno_id:studentId,alternativas,acertos:score})});
    return response(receipt(rows[0]),201,origin);
   } catch(error) {
    if(error.status===409) return response({error:'Já existe uma entrega para este aluno. Atualize a lista ou consulte o professor.'},409,origin);
    throw error;
   }
  }
  return response({error:'Recurso não encontrado.'},404,origin);
 } catch { return response({error:'Não foi possível acessar os registros agora. Suas respostas continuam no navegador; tente novamente.'},503,origin); }
});

