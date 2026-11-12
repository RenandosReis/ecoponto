const ecopontos = [
  {
    nome: 'Ecoponto Parque das Américas',
    endereco: 'R. Geovani Batista Lorenzetto, 85, Mauá - SP',
  },
  {
    nome: 'Ecoponto Jardim Cerqueira Leite',
    endereco: 'R. Washingthon Luiz, 2200, Mauá - SP',
  },
  {
    nome: 'PEV Jardim Zaíra',
    endereco: 'Av. Washington Luiz, s/n, Mauá - SP',
  }
];

const GOOGLE_MAPS_API_KEY = 'AIzaSyBIFO8AudnvgO9NYIijovjXhzZDxpx8zqk';
let mapaAtivo;
let geocodificadorMapa;
let limitesEcopontos;
let marcadorBusca;

function exibirMensagemApi() {
  const mapaEl = document.getElementById('mapa');

  if (!mapaEl) return;

  mapaEl.innerHTML = `
    <div class="mapa-vazio">
      Configure sua chave da Google Maps em <strong>script.js</strong> para ativar o mapa.<br>
      Substitua <strong>SUA_CHAVE_DO_GOOGLE_MAPS</strong> pela sua API key.
    </div>
  `;
}

function buscarEnderecoNoMapa(event) {
  event.preventDefault();

  const campoBusca = document.getElementById('busca-endereco');
  const statusBusca = document.getElementById('status-busca-mapa');
  const consulta = campoBusca.value.trim();
  const somenteNumeros = consulta.replace(/\D/g, '');
  const pareceCep = /^[\d\s.-]+$/.test(consulta);

  if (!consulta) {
    statusBusca.textContent = 'Digite um CEP ou o nome de uma rua.';
    campoBusca.focus();
    return;
  }

  if (pareceCep && somenteNumeros.length !== 8) {
    statusBusca.textContent = 'O CEP deve ter 8 números. Você também pode buscar pelo nome da rua.';
    campoBusca.focus();
    return;
  }

  if (!geocodificadorMapa || !mapaAtivo) {
    statusBusca.textContent = 'A busca no mapa está indisponível no momento. Recarregue a página e tente novamente.';
    return;
  }

  statusBusca.textContent = 'Buscando endereço...';
  const ehCep = somenteNumeros.length === 8 && pareceCep;
  const enderecoBusca = ehCep
    ? `${somenteNumeros}, Mauá, SP, Brasil`
    : `${consulta}, Mauá, SP, Brasil`;

  geocodificadorMapa.geocode({
    address: enderecoBusca,
    componentRestrictions: { country: 'BR' },
  }, (resultados, status) => {
    if (status !== 'OK' || !resultados || !resultados[0]) {
      if (status === 'REQUEST_DENIED') {
        statusBusca.textContent = 'A busca por endereço exige faturamento ativo no Google Cloud e a API Geocoding habilitada.';
      } else if (status === 'OVER_QUERY_LIMIT') {
        statusBusca.textContent = 'A busca atingiu o limite temporário. Aguarde um pouco e tente novamente.';
      } else if (status === 'ZERO_RESULTS') {
        statusBusca.textContent = 'Não encontramos esse endereço em Mauá. Confira o CEP ou tente outra forma de escrever a rua.';
      } else {
        statusBusca.textContent = 'Não foi possível buscar esse endereço. Confira os dados e tente novamente.';
      }
      return;
    }

    const resultado = resultados[0];
    const localizacao = resultado.geometry.location;
    mapaAtivo.panTo(localizacao);
    mapaAtivo.setZoom(16);

    if (marcadorBusca) {
      marcadorBusca.setMap(null);
    }

    marcadorBusca = new google.maps.Marker({
      position: localizacao,
      map: mapaAtivo,
      title: `Endereço buscado: ${resultado.formatted_address}`,
      animation: google.maps.Animation.DROP,
    });
    statusBusca.textContent = `Endereço encontrado: ${resultado.formatted_address}. Os ecopontos continuam listados abaixo.`;
  });
}

function limparBuscaMapa() {
  const campoBusca = document.getElementById('busca-endereco');
  const statusBusca = document.getElementById('status-busca-mapa');

  campoBusca.value = '';
  statusBusca.textContent = '';

  if (marcadorBusca) {
    marcadorBusca.setMap(null);
    marcadorBusca = null;
  }

  if (mapaAtivo && limitesEcopontos && !limitesEcopontos.isEmpty()) {
    mapaAtivo.fitBounds(limitesEcopontos);
  } else if (mapaAtivo) {
    mapaAtivo.setCenter({ lat: -23.6683, lng: -46.4616 });
    mapaAtivo.setZoom(12);
  }
}

function initMap() {
  const mapaEl = document.getElementById('mapa');

  if (!mapaEl) return;

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'SUA_CHAVE_DO_GOOGLE_MAPS') {
    exibirMensagemApi();
    return;
  }

  mapaAtivo = new google.maps.Map(mapaEl, {
    center: { lat: -23.6683, lng: -46.4616 },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  geocodificadorMapa = new google.maps.Geocoder();
  limitesEcopontos = new google.maps.LatLngBounds();
  const infoWindow = new google.maps.InfoWindow();

  ecopontos.forEach((ecoponto, index) => {
    geocodificadorMapa.geocode({ address: ecoponto.endereco }, (results, status) => {
      if (status !== 'OK' || !results[0]) {
        console.warn(`Não foi possível localizar: ${ecoponto.nome}`);
        return;
      }

      const localizacao = results[0].geometry.location;
      const marcador = new google.maps.Marker({
        position: localizacao,
        map: mapaAtivo,
        title: ecoponto.nome,
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });

      limitesEcopontos.extend(localizacao);
      mapaAtivo.fitBounds(limitesEcopontos);

      const itemLista = document.querySelector(`.lista-ecopontos li[data-index="${index}"]`);

      if (itemLista) {
        itemLista.addEventListener('click', () => {
          mapaAtivo.setZoom(16);
          mapaAtivo.panTo(localizacao);
          infoWindow.setContent(`
            <div>
              <strong>${ecoponto.nome}</strong><br>
              <span>${ecoponto.endereco}</span>
            </div>
          `);
          infoWindow.open({ anchor: marcador, map: mapa });
        });
      }

      marcador.addListener('click', () => {
        infoWindow.setContent(`
          <div>
            <strong>${ecoponto.nome}</strong><br>
            <span>${ecoponto.endereco}</span>
          </div>
        `);
        infoWindow.open({ anchor: marcador, map: mapa });
      });
    });
  });
}

function carregarGoogleMaps() {
  if (!document.getElementById('mapa')) return;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

window.addEventListener('DOMContentLoaded', carregarGoogleMaps);
const formBuscaMapa = document.getElementById('form-busca-mapa');
const botaoLimparBuscaMapa = document.getElementById('limpar-busca-mapa');

if (formBuscaMapa) {
  formBuscaMapa.addEventListener('submit', buscarEnderecoNoMapa);
}

if (botaoLimparBuscaMapa) {
  botaoLimparBuscaMapa.addEventListener('click', limparBuscaMapa);
}

function iniciarCarrossel() {
  const carrossel = document.querySelector('.carrossel');
  const cards = Array.from(document.querySelectorAll('.card-programa'));
  const botoesPagina = Array.from(document.querySelectorAll('.carrossel-paginacao button'));

  if (!carrossel || cards.length === 0 || botoesPagina.length !== cards.length) return;

  let indiceAtual = 0;
  let temporizador;
  const prefereMovimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mostrarCard(indice) {
    indiceAtual = (indice + cards.length) % cards.length;
    cards.forEach((card, index) => {
      const ativo = index === indiceAtual;
      card.hidden = !ativo;
      card.classList.toggle('ativo', ativo);
      card.setAttribute('aria-hidden', String(!ativo));
    });
    botoesPagina.forEach((botao, index) => {
      if (index === indiceAtual) {
        botao.setAttribute('aria-current', 'true');
      } else {
        botao.removeAttribute('aria-current');
      }
    });
  }

  function iniciarRotacao() {
    if (prefereMovimentoReduzido || cards.length < 2 || temporizador) return;
    temporizador = window.setInterval(() => mostrarCard(indiceAtual + 1), 5000);
  }

  function pausarRotacao() {
    window.clearInterval(temporizador);
    temporizador = undefined;
  }

  carrossel.querySelector('.anterior').addEventListener('click', () => {
    mostrarCard(indiceAtual - 1);
  });
  carrossel.querySelector('.proximo').addEventListener('click', () => {
    mostrarCard(indiceAtual + 1);
  });
  botoesPagina.forEach((botao, index) => {
    botao.addEventListener('click', () => mostrarCard(index));
  });

  carrossel.addEventListener('mouseenter', pausarRotacao);
  carrossel.addEventListener('mouseleave', iniciarRotacao);
  carrossel.addEventListener('focusin', pausarRotacao);
  carrossel.addEventListener('focusout', (evento) => {
    if (!carrossel.contains(evento.relatedTarget)) iniciarRotacao();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pausarRotacao();
    } else {
      iniciarRotacao();
    }
  });

  mostrarCard(indiceAtual);
  iniciarRotacao();
}

window.addEventListener('DOMContentLoaded', iniciarCarrossel);