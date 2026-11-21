// Declara uma constante usada pelo script.
const formDenuncia = document.getElementById('form-denuncia');
// Declara uma constante usada pelo script.
const statusDenuncia = document.getElementById('status-denuncia');

// Conecta uma ação do usuário a uma função de resposta.
formDenuncia.addEventListener('submit', async (event) => {
  // Executa uma instrução da lógica da página.
  event.preventDefault();
  // Declara uma constante usada pelo script.
  const botao = formDenuncia.querySelector('button[type="submit"]');
  // Declara uma constante usada pelo script.
  const dados = Object.fromEntries(new FormData(formDenuncia));

  // Executa uma instrução da lógica da página.
  botao.disabled = true;
  // Executa uma instrução da lógica da página.
  statusDenuncia.textContent = 'Enviando...';

  // Executa uma instrução da lógica da página.
  try {
    // Declara uma constante usada pelo script.
    const resposta = await fetch('/api/denuncias', {
      // Executa uma instrução da lógica da página.
      method: 'POST',
      // Executa uma instrução da lógica da página.
      headers: { 'Content-Type': 'application/json' },
      // Executa uma instrução da lógica da página.
      body: JSON.stringify(dados),
    // Fecha o bloco de código atual.
    });
    // Declara uma constante usada pelo script.
    const resultado = await resposta.json();

    // Executa o código abaixo somente quando esta condição é verdadeira.
    if (!resposta.ok) {
      // Executa uma instrução da lógica da página.
      throw new Error(resultado.erro || 'Não foi possível registrar a denúncia.');
    // Fecha o bloco de código atual.
    }

    // Executa uma instrução da lógica da página.
    formDenuncia.reset();
    // Executa uma instrução da lógica da página.
    statusDenuncia.textContent = 'Denúncia registrada neste computador. Ela não foi enviada às autoridades.';
  // Executa uma instrução da lógica da página.
  } catch (erro) {
    // Executa uma instrução da lógica da página.
    statusDenuncia.textContent = `${erro.message} Inicie o servidor com: python server.py`;
  // Executa uma instrução da lógica da página.
  } finally {
    // Executa uma instrução da lógica da página.
    botao.disabled = false;
  // Fecha o bloco de código atual.
  }
// Fecha o bloco de código atual.
});
