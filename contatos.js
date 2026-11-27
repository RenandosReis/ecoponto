
const formContato = document.getElementById('form-contato');
const dialogoContato = document.getElementById('confirmacao-contato');
const resumoContato = document.getElementById('resumo-contato');
const statusContato = document.getElementById('status-contato');
const erroContato = document.getElementById('erro-contato');
const botaoVoltar = document.getElementById('voltar-contato');
const acoesDialogo = document.querySelector('.acoes-dialogo');
const sucessoContato = document.getElementById('sucesso-contato');
const conteudoRevisao = document.getElementById('conteudo-revisao');
const botaoFecharSucesso = document.getElementById('fechar-sucesso');

let enviandoContato = false;

formContato.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dados = new FormData(formContato);

    const nome = dados.get('nome').trim();
    const email = dados.get('email').trim();
    const assunto = dados.get('assunto').trim();
    const mensagem = dados.get('mensagem').trim();

    resumoContato.textContent =
        `Nome: ${nome || 'Não informado'}\n` +
        `Assunto: ${assunto}\n` +
        `E-mail: ${email}\n\n${mensagem}`;

    erroContato.textContent = '';

    conteudoRevisao.hidden = false;
    sucessoContato.hidden = true;

    dialogoContato.showModal();
});

botaoVoltar.addEventListener('click', () => {
    dialogoContato.close();
});

botaoFecharSucesso.addEventListener('click', () => {
    dialogoContato.close();
});

const botaoConfirmar = document.getElementById('confirmar-contato');

botaoConfirmar.addEventListener('click', async (event) => {
    event.preventDefault();

    if (enviandoContato) {
        return;
    }

    enviandoContato = true;
    botaoConfirmar.disabled = true;
    botaoConfirmar.textContent = 'Enviando...';

    const dados = new FormData(formContato);

    const nome = dados.get('nome').trim();
    const email = dados.get('email').trim();
    const assunto = dados.get('assunto').trim();
    const mensagem = dados.get('mensagem').trim();

    botaoConfirmar.textContent = 'Enviando...';
    botaoConfirmar.style.pointerEvents = 'none';

    try {
        const resposta = await fetch('/api/contatos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                email,
                assunto,
                mensagem
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Não foi possível enviar a mensagem.');
        }

       conteudoRevisao.hidden = true;
       sucessoContato.hidden = false;
       
        formContato.reset();
    } catch (erro) {
       erroContato.textContent =
        erro.message || 'Erro ao enviar a mensagem. Tente novamente.';
      } finally {
        enviandoContato = false;
        botaoConfirmar.disabled = false;
        botaoConfirmar.textContent = 'Enviar mensagem';
    }
});
