
async function carregarPost() {
    const container = document.getElementById("post");
    const parametros = new URLSearchParams(window.location.search);
    const slug = parametros.get("slug");

    if (!slug) {
        container.textContent = "Postagem não encontrada.";
        return;
    }

    try {
        const resposta = await fetch(`/api/posts/${encodeURIComponent(slug)}`);

        if (!resposta.ok) {
            throw new Error("Postagem não encontrada.");
        }

        const post = await resposta.json();

        container.innerHTML = `
            <span>${post.categoria || ""}</span>
            <h1>${post.titulo}</h1>
            <p>${post.autor || ""}</p>
            <p>${post.criado_em ? new Date(post.criado_em).toLocaleDateString("pt-BR") : ""}</p>
            ${post.imagem_url ? `<img src="${post.imagem_url}" alt="${post.titulo}">` : ""}
            <div>${post.conteudo || ""}</div>
        `;
    } catch (erro) {
        container.textContent = "Não foi possível carregar a postagem.";
        console.error(erro);
    }
}

carregarPost();
