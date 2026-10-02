const formDenuncia = document.getElementById('form-denuncia');
const statusDenuncia = document.getElementById('status-denuncia');

formDenuncia.addEventListener('submit', async (event) => {
  event.preventDefault();
  const botao = formDenuncia.querySelector('button[type="submit"]');
  const dados = Object.fromEntries(new FormData(formDenuncia));

  botao.disabled = true;
  statusDenuncia.textContent = 'Enviando...';

  try {
    const resposta = await fetch('/api/denuncias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Não foi possível registrar a denúncia.');
    }

    formDenuncia.reset();
    statusDenuncia.textContent = 'Denúncia registrada neste computador. Ela não foi enviada às autoridades.';
  } catch (erro) {
    statusDenuncia.textContent = `${erro.message} Inicie o servidor com: python server.py`;
  } finally {
    botao.disabled = false;
  }
});