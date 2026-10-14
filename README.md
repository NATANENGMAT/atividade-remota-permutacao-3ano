# Atividade remota: permutação com repetição

Professor Natanael · turmas 3º1 e 3º2.

O site está em `dist/`. Para publicar no GitHub Pages, envie o conteúdo dessa pasta à raiz do repositório e selecione a publicação pela branch `main`, pasta `/ (root)`.

## Alunos

1. Selecionar a turma e o nome.
2. Percorrer a explicação de LULA e CLARISSE. Há somente duas perguntas de observação por exemplo; a simplificação não tem perguntas.
3. Responder às cinco questões e clicar em **Entregar atividade**.
4. Aguardar **Entrega confirmada**. Somente essa confirmação significa que o professor recebeu as respostas.
5. Consultar `entregas.html` para verificar o status online.

O rascunho permanece no navegador em caso de falha de conexão. Repetir o mesmo envio não duplica a entrega; uma segunda entrega não sobrescreve a primeira.

## Professor

Abrir `professor.html`. No primeiro acesso, o professor escolhe sua senha, cria o acesso com o e-mail autorizado e confirma a mensagem enviada pelo Supabase. Esse acesso é separado da conta do painel do Supabase.

O painel permite filtrar por turma, nome e situação; consultar alternativas, acertos e data da entrega; e baixar os registros filtrados em CSV. Alunos não têm acesso a notas ou respostas pela lista pública.

## Supabase

Projeto: `bxvuqwnmqooxaoexnjty` (`terceiroremota14`).

- `public.permutacao_alunos`: 79 registros de turma e nome.
- `public.permutacao_entregas`: uma entrega por aluno, com alternativas, acertos e data.
- As duas tabelas têm RLS e não concedem acesso direto às chaves públicas.
- A função de servidor `atividade-permutacao` valida os envios e corrige as alternativas. Sua chave de serviço vem das variáveis do ambiente Supabase e nunca é enviada ao navegador.
- `/status`: somente nomes, turmas e situação de entrega.
- `/entregar`: valida e registra as cinco alternativas.
- `/professor`: exige sessão Supabase válida, e-mail confirmado e correspondência com o e-mail autorizado.

`dist/config.js` contém somente configuração pública. Nunca adicione uma chave `service_role` ou `sb_secret_...` ao site.

O SQL aplicado está em `database/permutacao.sql` e o código da função em `supabase/functions/atividade-permutacao/index.js`. Não execute o SQL novamente em um projeto já configurado.

Antes da publicação, configurar no Supabase Auth a URL do site e a URL de retorno `professor.html` do GitHub Pages. A publicação pública aguarda aprovação do proprietário, pois expõe o site e a lista de nomes com status.
