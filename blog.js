console.log("BLOG.JS CARREGADO");
console.log(document.querySelector(".grid-posts"));
async function carregarPosts() {
    const container = document.querySelector(".grid-posts");

    try {
        const resposta = await fetch("/api/posts");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar postagens.");
        }

        const dados = await resposta.json();
        console.log(dados);
        console.log("Quantidade de posts:", dados.posts.length);

        container.innerHTML = "";

        dados.posts.forEach(post => {
            const card = document.createElement("article");
            card.className = "card-post";

            const titulo = document.createElement("h2");
            titulo.textContent = post.titulo;

            const resumo = document.createElement("p");
            resumo.textContent = post.resumo;

            const categoria = document.createElement("span");
            categoria.textContent = post.categoria;

            const link = document.createElement("a");
            link.href = `post.html?slug=${encodeURIComponent(post.slug)}`;
            link.textContent = "Leia mais";
            const data = document.createElement("p");
            data.className = "data";
            data.textContent = post.criado_em
                ? new Date(post.criado_em).toLocaleDateString("pt-BR")
                : "Data não disponível";

            card.append(imagem, categoria, titulo, data, resumo, link);
            const imagem = document.createElement("img");
            imagem.src = post.imagem_url;
            imagem.alt = post.titulo;
            imagem.className = "imagem-post";
        });

    } catch (erro) {
        container.textContent = "Não foi possível carregar as postagens.";
        console.error(erro);
    }
}

carregarPosts();