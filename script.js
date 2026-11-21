// Declara uma constante usada pelo script.
const ecopontos = [
  // Executa uma instrução da lógica da página.
  {
    // Executa uma instrução da lógica da página.
    nome: 'Ecoponto Parque das Américas',
    // Executa uma instrução da lógica da página.
    endereco: 'R. Geovani Batista Lorenzetto, 85, Mauá - SP',
  // Executa uma instrução da lógica da página.
  },
  // Executa uma instrução da lógica da página.
  {
    // Executa uma instrução da lógica da página.
    nome: 'Ecoponto Jardim Cerqueira Leite',
    // Executa uma instrução da lógica da página.
    endereco: 'R. Washingthon Luiz, 2200, Mauá - SP',
  // Executa uma instrução da lógica da página.
  },
  // Executa uma instrução da lógica da página.
  {
    // Executa uma instrução da lógica da página.
    nome: 'PEV Jardim Zaíra',
    // Executa uma instrução da lógica da página.
    endereco: 'Av. Washington Luiz, s/n, Mauá - SP',
  // Fecha o bloco de código atual.
  }
// Executa uma instrução da lógica da página.
];

// Declara uma constante usada pelo script.
const GOOGLE_MAPS_API_KEY = 'AIzaSyBIFO8AudnvgO9NYIijovjXhzZDxpx8zqk';
// Declara uma variável cujo valor pode mudar.
let mapaAtivo;
// Declara uma variável cujo valor pode mudar.
let geocodificadorMapa;
// Declara uma variável cujo valor pode mudar.
let limitesEcopontos;
// Declara uma variável cujo valor pode mudar.
let marcadorBusca;

// Define uma função reutilizável com uma parte da lógica.
function exibirMensagemApi() {
  // Declara uma constante usada pelo script.
  const mapaEl = document.getElementById('mapa');

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (!mapaEl) return;

  // Executa uma instrução da lógica da página.
  mapaEl.innerHTML = `
    <div class="mapa-vazio">
      Configure sua chave da Google Maps em <strong>script.js</strong> para ativar o mapa.<br>
      Substitua <strong>SUA_CHAVE_DO_GOOGLE_MAPS</strong> pela sua API key.
    </div>
  `;
// Fecha o bloco de código atual.
}

// Define uma função reutilizável com uma parte da lógica.
function buscarEnderecoNoMapa(event) {
  // Executa uma instrução da lógica da página.
  event.preventDefault();

  // Declara uma constante usada pelo script.
  const campoBusca = document.getElementById('busca-endereco');
  // Declara uma constante usada pelo script.
  const statusBusca = document.getElementById('status-busca-mapa');
  // Declara uma constante usada pelo script.
  const consulta = campoBusca.value.trim();
  // Declara uma constante usada pelo script.
  const somenteNumeros = consulta.replace(/\D/g, '');
  // Declara uma constante usada pelo script.
  const pareceCep = /^[\d\s.-]+$/.test(consulta);

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (!consulta) {
    // Executa uma instrução da lógica da página.
    statusBusca.textContent = 'Digite um CEP ou o nome de uma rua.';
    // Executa uma instrução da lógica da página.
    campoBusca.focus();
    // Executa uma instrução da lógica da página.
    return;
  // Fecha o bloco de código atual.
  }

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (pareceCep && somenteNumeros.length !== 8) {
    // Executa uma instrução da lógica da página.
    statusBusca.textContent = 'O CEP deve ter 8 números. Você também pode buscar pelo nome da rua.';
    // Executa uma instrução da lógica da página.
    campoBusca.focus();
    // Executa uma instrução da lógica da página.
    return;
  // Fecha o bloco de código atual.
  }

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (!geocodificadorMapa || !mapaAtivo) {
    // Executa uma instrução da lógica da página.
    statusBusca.textContent = 'A busca no mapa está indisponível no momento. Recarregue a página e tente novamente.';
    // Executa uma instrução da lógica da página.
    return;
  // Fecha o bloco de código atual.
  }

  // Executa uma instrução da lógica da página.
  statusBusca.textContent = 'Buscando endereço...';
  // Declara uma constante usada pelo script.
  const ehCep = somenteNumeros.length === 8 && pareceCep;
  // Declara uma constante usada pelo script.
  const enderecoBusca = ehCep
    // Executa uma instrução da lógica da página.
    ? `${somenteNumeros}, Mauá, SP, Brasil`
    // Executa uma instrução da lógica da página.
    : `${consulta}, Mauá, SP, Brasil`;

  // Executa uma instrução da lógica da página.
  geocodificadorMapa.geocode({
    // Executa uma instrução da lógica da página.
    address: enderecoBusca,
    // Executa uma instrução da lógica da página.
    componentRestrictions: { country: 'BR' },
  // Executa uma instrução da lógica da página.
  }, (resultados, status) => {
    // Executa o código abaixo somente quando esta condição é verdadeira.
    if (status !== 'OK' || !resultados || !resultados[0]) {
      // Executa o código abaixo somente quando esta condição é verdadeira.
      if (status === 'REQUEST_DENIED') {
        // Executa uma instrução da lógica da página.
        statusBusca.textContent = 'A busca por endereço exige faturamento ativo no Google Cloud e a API Geocoding habilitada.';
      // Executa uma instrução da lógica da página.
      } else if (status === 'OVER_QUERY_LIMIT') {
        // Executa uma instrução da lógica da página.
        statusBusca.textContent = 'A busca atingiu o limite temporário. Aguarde um pouco e tente novamente.';
      // Executa uma instrução da lógica da página.
      } else if (status === 'ZERO_RESULTS') {
        // Executa uma instrução da lógica da página.
        statusBusca.textContent = 'Não encontramos esse endereço em Mauá. Confira o CEP ou tente outra forma de escrever a rua.';
      // Executa uma instrução da lógica da página.
      } else {
        // Executa uma instrução da lógica da página.
        statusBusca.textContent = 'Não foi possível buscar esse endereço. Confira os dados e tente novamente.';
      // Fecha o bloco de código atual.
      }
      // Executa uma instrução da lógica da página.
      return;
    // Fecha o bloco de código atual.
    }

    // Declara uma constante usada pelo script.
    const resultado = resultados[0];
    // Declara uma constante usada pelo script.
    const localizacao = resultado.geometry.location;
    // Executa uma instrução da lógica da página.
    mapaAtivo.panTo(localizacao);
    // Executa uma instrução da lógica da página.
    mapaAtivo.setZoom(16);

    // Executa o código abaixo somente quando esta condição é verdadeira.
    if (marcadorBusca) {
      // Executa uma instrução da lógica da página.
      marcadorBusca.setMap(null);
    // Fecha o bloco de código atual.
    }

    // Executa uma instrução da lógica da página.
    marcadorBusca = new google.maps.Marker({
      // Executa uma instrução da lógica da página.
      position: localizacao,
      // Executa uma instrução da lógica da página.
      map: mapaAtivo,
      // Executa uma instrução da lógica da página.
      title: `Endereço buscado: ${resultado.formatted_address}`,
      // Executa uma instrução da lógica da página.
      animation: google.maps.Animation.DROP,
    // Fecha o bloco de código atual.
    });
    // Executa uma instrução da lógica da página.
    statusBusca.textContent = `Endereço encontrado: ${resultado.formatted_address}. Os ecopontos continuam listados abaixo.`;
  // Fecha o bloco de código atual.
  });
// Fecha o bloco de código atual.
}

// Define uma função reutilizável com uma parte da lógica.
function limparBuscaMapa() {
  // Declara uma constante usada pelo script.
  const campoBusca = document.getElementById('busca-endereco');
  // Declara uma constante usada pelo script.
  const statusBusca = document.getElementById('status-busca-mapa');

  // Executa uma instrução da lógica da página.
  campoBusca.value = '';
  // Executa uma instrução da lógica da página.
  statusBusca.textContent = '';

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (marcadorBusca) {
    // Executa uma instrução da lógica da página.
    marcadorBusca.setMap(null);
    // Executa uma instrução da lógica da página.
    marcadorBusca = null;
  // Fecha o bloco de código atual.
  }

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (mapaAtivo && limitesEcopontos && !limitesEcopontos.isEmpty()) {
    // Executa uma instrução da lógica da página.
    mapaAtivo.fitBounds(limitesEcopontos);
  // Executa uma instrução da lógica da página.
  } else if (mapaAtivo) {
    // Executa uma instrução da lógica da página.
    mapaAtivo.setCenter({ lat: -23.6683, lng: -46.4616 });
    // Executa uma instrução da lógica da página.
    mapaAtivo.setZoom(12);
  // Fecha o bloco de código atual.
  }
// Fecha o bloco de código atual.
}

// Define uma função reutilizável com uma parte da lógica.
function initMap() {
  // Declara uma constante usada pelo script.
  const mapaEl = document.getElementById('mapa');

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (!mapaEl) return;

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'SUA_CHAVE_DO_GOOGLE_MAPS') {
    // Executa uma instrução da lógica da página.
    exibirMensagemApi();
    // Executa uma instrução da lógica da página.
    return;
  // Fecha o bloco de código atual.
  }

  // Executa uma instrução da lógica da página.
  mapaAtivo = new google.maps.Map(mapaEl, {
    // Executa uma instrução da lógica da página.
    center: { lat: -23.6683, lng: -46.4616 },
    // Executa uma instrução da lógica da página.
    zoom: 12,
    // Executa uma instrução da lógica da página.
    mapTypeControl: false,
    // Executa uma instrução da lógica da página.
    streetViewControl: false,
    // Executa uma instrução da lógica da página.
    fullscreenControl: true,
  // Fecha o bloco de código atual.
  });

  // Executa uma instrução da lógica da página.
  geocodificadorMapa = new google.maps.Geocoder();
  // Executa uma instrução da lógica da página.
  limitesEcopontos = new google.maps.LatLngBounds();
  // Declara uma constante usada pelo script.
  const infoWindow = new google.maps.InfoWindow();

  // Executa uma instrução da lógica da página.
  ecopontos.forEach((ecoponto, index) => {
    // Executa uma instrução da lógica da página.
    geocodificadorMapa.geocode({ address: ecoponto.endereco }, (results, status) => {
      // Executa o código abaixo somente quando esta condição é verdadeira.
      if (status !== 'OK' || !results[0]) {
        // Executa uma instrução da lógica da página.
        console.warn(`Não foi possível localizar: ${ecoponto.nome}`);
        // Executa uma instrução da lógica da página.
        return;
      // Fecha o bloco de código atual.
      }

      // Declara uma constante usada pelo script.
      const localizacao = results[0].geometry.location;
      // Declara uma constante usada pelo script.
      const marcador = new google.maps.Marker({
        // Executa uma instrução da lógica da página.
        position: localizacao,
        // Executa uma instrução da lógica da página.
        map: mapaAtivo,
        // Executa uma instrução da lógica da página.
        title: ecoponto.nome,
        // Executa uma instrução da lógica da página.
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      // Fecha o bloco de código atual.
      });

      // Executa uma instrução da lógica da página.
      limitesEcopontos.extend(localizacao);
      // Executa uma instrução da lógica da página.
      mapaAtivo.fitBounds(limitesEcopontos);

      // Declara uma constante usada pelo script.
      const itemLista = document.querySelector(`.lista-ecopontos li[data-index="${index}"]`);

      // Executa o código abaixo somente quando esta condição é verdadeira.
      if (itemLista) {
        // Conecta uma ação do usuário a uma função de resposta.
        itemLista.addEventListener('click', () => {
          // Executa uma instrução da lógica da página.
          mapaAtivo.setZoom(16);
          // Executa uma instrução da lógica da página.
          mapaAtivo.panTo(localizacao);
          // Executa uma instrução da lógica da página.
          infoWindow.setContent(`
            <div>
              <strong>${ecoponto.nome}</strong><br>
              <span>${ecoponto.endereco}</span>
            </div>
          `);
          // Executa uma instrução da lógica da página.
          infoWindow.open({ anchor: marcador, map: mapa });
        // Fecha o bloco de código atual.
        });
      // Fecha o bloco de código atual.
      }

      // Executa uma instrução da lógica da página.
      marcador.addListener('click', () => {
        // Executa uma instrução da lógica da página.
        infoWindow.setContent(`
          <div>
            <strong>${ecoponto.nome}</strong><br>
            <span>${ecoponto.endereco}</span>
          </div>
        `);
        // Executa uma instrução da lógica da página.
        infoWindow.open({ anchor: marcador, map: mapa });
      // Fecha o bloco de código atual.
      });
    // Fecha o bloco de código atual.
    });
  // Fecha o bloco de código atual.
  });
// Fecha o bloco de código atual.
}

// Define uma função reutilizável com uma parte da lógica.
function carregarGoogleMaps() {
  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (!document.getElementById('mapa')) return;

  // Declara uma constante usada pelo script.
  const script = document.createElement('script');
  // Executa uma instrução da lógica da página.
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
  // Executa uma instrução da lógica da página.
  script.async = true;
  // Executa uma instrução da lógica da página.
  script.defer = true;
  // Executa uma instrução da lógica da página.
  document.body.appendChild(script);
// Fecha o bloco de código atual.
}

// Conecta uma ação do usuário a uma função de resposta.
window.addEventListener('DOMContentLoaded', carregarGoogleMaps);
// Declara uma constante usada pelo script.
const formBuscaMapa = document.getElementById('form-busca-mapa');
// Declara uma constante usada pelo script.
const botaoLimparBuscaMapa = document.getElementById('limpar-busca-mapa');

// Executa o código abaixo somente quando esta condição é verdadeira.
if (formBuscaMapa) {
  // Conecta uma ação do usuário a uma função de resposta.
  formBuscaMapa.addEventListener('submit', buscarEnderecoNoMapa);
// Fecha o bloco de código atual.
}

// Executa o código abaixo somente quando esta condição é verdadeira.
if (botaoLimparBuscaMapa) {
  // Conecta uma ação do usuário a uma função de resposta.
  botaoLimparBuscaMapa.addEventListener('click', limparBuscaMapa);
// Fecha o bloco de código atual.
}

// Define uma função reutilizável com uma parte da lógica.
function iniciarCarrossel() {
  // Declara uma constante usada pelo script.
  const carrossel = document.querySelector('.carrossel');
  // Declara uma constante usada pelo script.
  const cards = Array.from(document.querySelectorAll('.card-programa'));
  // Declara uma constante usada pelo script.
  const botoesPagina = Array.from(document.querySelectorAll('.carrossel-paginacao button'));

  // Executa o código abaixo somente quando esta condição é verdadeira.
  if (!carrossel || cards.length === 0 || botoesPagina.length !== cards.length) return;

  // Declara uma variável cujo valor pode mudar.
  let indiceAtual = 0;
  // Declara uma variável cujo valor pode mudar.
  let temporizador;
  // Declara uma constante usada pelo script.
  const prefereMovimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Define uma função reutilizável com uma parte da lógica.
  function mostrarCard(indice) {
    // Executa uma instrução da lógica da página.
    indiceAtual = (indice + cards.length) % cards.length;
    // Executa uma instrução da lógica da página.
    cards.forEach((card, index) => {
      // Declara uma constante usada pelo script.
      const ativo = index === indiceAtual;
      // Executa uma instrução da lógica da página.
      card.hidden = !ativo;
      // Executa uma instrução da lógica da página.
      card.classList.toggle('ativo', ativo);
      // Executa uma instrução da lógica da página.
      card.setAttribute('aria-hidden', String(!ativo));
    // Fecha o bloco de código atual.
    });
    // Executa uma instrução da lógica da página.
    botoesPagina.forEach((botao, index) => {
      // Executa o código abaixo somente quando esta condição é verdadeira.
      if (index === indiceAtual) {
        // Executa uma instrução da lógica da página.
        botao.setAttribute('aria-current', 'true');
      // Executa uma instrução da lógica da página.
      } else {
        // Executa uma instrução da lógica da página.
        botao.removeAttribute('aria-current');
      // Fecha o bloco de código atual.
      }
    // Fecha o bloco de código atual.
    });
  // Fecha o bloco de código atual.
  }

  // Define uma função reutilizável com uma parte da lógica.
  function iniciarRotacao() {
    // Executa o código abaixo somente quando esta condição é verdadeira.
    if (prefereMovimentoReduzido || cards.length < 2 || temporizador) return;
    // Executa uma instrução da lógica da página.
    temporizador = window.setInterval(() => mostrarCard(indiceAtual + 1), 5000);
  // Fecha o bloco de código atual.
  }

  // Define uma função reutilizável com uma parte da lógica.
  function pausarRotacao() {
    // Configura uma ação ou evento ligado à janela do navegador.
    window.clearInterval(temporizador);
    // Executa uma instrução da lógica da página.
    temporizador = undefined;
  // Fecha o bloco de código atual.
  }

  // Conecta uma ação do usuário a uma função de resposta.
  carrossel.querySelector('.anterior').addEventListener('click', () => {
    // Executa uma instrução da lógica da página.
    mostrarCard(indiceAtual - 1);
  // Fecha o bloco de código atual.
  });
  // Conecta uma ação do usuário a uma função de resposta.
  carrossel.querySelector('.proximo').addEventListener('click', () => {
    // Executa uma instrução da lógica da página.
    mostrarCard(indiceAtual + 1);
  // Fecha o bloco de código atual.
  });
  // Executa uma instrução da lógica da página.
  botoesPagina.forEach((botao, index) => {
    // Conecta uma ação do usuário a uma função de resposta.
    botao.addEventListener('click', () => mostrarCard(index));
  // Fecha o bloco de código atual.
  });

  // Conecta uma ação do usuário a uma função de resposta.
  carrossel.addEventListener('mouseenter', pausarRotacao);
  // Conecta uma ação do usuário a uma função de resposta.
  carrossel.addEventListener('mouseleave', iniciarRotacao);
  // Conecta uma ação do usuário a uma função de resposta.
  carrossel.addEventListener('focusin', pausarRotacao);
  // Conecta uma ação do usuário a uma função de resposta.
  carrossel.addEventListener('focusout', (evento) => {
    // Executa o código abaixo somente quando esta condição é verdadeira.
    if (!carrossel.contains(evento.relatedTarget)) iniciarRotacao();
  // Fecha o bloco de código atual.
  });
  // Conecta uma ação do usuário a uma função de resposta.
  document.addEventListener('visibilitychange', () => {
    // Executa o código abaixo somente quando esta condição é verdadeira.
    if (document.hidden) {
      // Executa uma instrução da lógica da página.
      pausarRotacao();
    // Executa uma instrução da lógica da página.
    } else {
      // Executa uma instrução da lógica da página.
      iniciarRotacao();
    // Fecha o bloco de código atual.
    }
  // Fecha o bloco de código atual.
  });

  // Executa uma instrução da lógica da página.
  mostrarCard(indiceAtual);
  // Executa uma instrução da lógica da página.
  iniciarRotacao();
// Fecha o bloco de código atual.
}

// Conecta uma ação do usuário a uma função de resposta.
window.addEventListener('DOMContentLoaded', iniciarCarrossel);
