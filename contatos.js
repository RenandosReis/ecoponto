// Declara uma constante usada pelo script.
const formContato = document.getElementById('form-contato');
// Declara uma constante usada pelo script.
const dialogoContato = document.getElementById('confirmacao-contato');
// Declara uma constante usada pelo script.
const resumoContato = document.getElementById('resumo-contato');
// Declara uma constante usada pelo script.
const linkConfirmacao = document.getElementById('confirmar-contato');
// Declara uma constante usada pelo script.
const statusContato = document.getElementById('status-contato');

// Conecta uma ação do usuário a uma função de resposta.
formContato.addEventListener('submit', (event) => {
  // Executa uma instrução da lógica da página.
  event.preventDefault();

  // Declara uma constante usada pelo script.
  const dados = new FormData(formContato);
  // Declara uma constante usada pelo script.
  const nome = dados.get('nome').trim();
  // Declara uma constante usada pelo script.
  const email = dados.get('email').trim();
  // Declara uma constante usada pelo script.
  const assunto = dados.get('assunto').trim();
  // Declara uma constante usada pelo script.
  const mensagem = dados.get('mensagem').trim();

  // Executa uma instrução da lógica da página.
  resumoContato.textContent = `Assunto: ${assunto}\nE-mail para resposta: ${email}\n\n${mensagem}`;
  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (nome) {
    // Executa uma instrução da lógica da página.
    resumoContato.textContent = `Nome: ${nome}\n${resumoContato.textContent}`;
  // Fecha o bloco de código atual.
  }

  // Declara uma constante usada pelo script.
  const corpo = [
    // Executa uma instrução da lógica da página.
    nome ? `Nome: ${nome}` : '',
    // Executa uma instrução da lógica da página.
    `E-mail para resposta: ${email}`,
    // Executa uma instrução da lógica da página.
    '',
    // Executa uma instrução da lógica da página.
    mensagem,
  // Executa uma instrução da lógica da página.
  ].filter(Boolean).join('\n');
  // Declara uma constante usada pelo script.
  const parametros = `subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  // Executa uma instrução da lógica da página.
  linkConfirmacao.href = `mailto:contato@ecomovimento.maua.br?${parametros}`;
  // Executa uma instrução da lógica da página.
  dialogoContato.showModal();
// Fecha o bloco de código atual.
});

// Conecta uma ação do usuário a uma função de resposta.
document.getElementById('voltar-contato').addEventListener('click', () => {
  // Executa uma instrução da lógica da página.
  dialogoContato.close();
// Fecha o bloco de código atual.
});

// Conecta uma ação do usuário a uma função de resposta.
linkConfirmacao.addEventListener('click', () => {
  // Executa uma instrução da lógica da página.
  statusContato.textContent = 'Seu aplicativo de e-mail deve abrir com a mensagem pronta. O envio só acontece quando você clicar em Enviar por lá.';
  // Executa uma instrução da lógica da página.
  dialogoContato.close();
// Fecha o bloco de código atual.
});
