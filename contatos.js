const formContato = document.getElementById('form-contato');
const dialogoContato = document.getElementById('confirmacao-contato');
const resumoContato = document.getElementById('resumo-contato');
const linkConfirmacao = document.getElementById('confirmar-contato');
const statusContato = document.getElementById('status-contato');

formContato.addEventListener('submit', (event) => {
  event.preventDefault();

  const dados = new FormData(formContato);
  const nome = dados.get('nome').trim();
  const email = dados.get('email').trim();
  const assunto = dados.get('assunto').trim();
  const mensagem = dados.get('mensagem').trim();

  resumoContato.textContent = `Assunto: ${assunto}\nE-mail para resposta: ${email}\n\n${mensagem}`;
  if (nome) {
    resumoContato.textContent = `Nome: ${nome}\n${resumoContato.textContent}`;
  }

  const corpo = [
    nome ? `Nome: ${nome}` : '',
    `E-mail para resposta: ${email}`,
    '',
    mensagem,
  ].filter(Boolean).join('\n');
  const parametros = `subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  linkConfirmacao.href = `mailto:contato@ecomovimento.maua.br?${parametros}`;
  dialogoContato.showModal();
});

document.getElementById('voltar-contato').addEventListener('click', () => {
  dialogoContato.close();
});

linkConfirmacao.addEventListener('click', () => {
  statusContato.textContent = 'Seu aplicativo de e-mail deve abrir com a mensagem pronta. O envio só acontece quando você clicar em Enviar por lá.';
  dialogoContato.close();
});
