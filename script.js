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

function initMap() {
  const mapaEl = document.getElementById('mapa');

  if (!mapaEl) return;

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'SUA_CHAVE_DO_GOOGLE_MAPS') {
    exibirMensagemApi();
    return;
  }

  const mapa = new google.maps.Map(mapaEl, {
    center: { lat: -23.6683, lng: -46.4616 },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  const bounds = new google.maps.LatLngBounds();
  const infoWindow = new google.maps.InfoWindow();

  ecopontos.forEach((ecoponto, index) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: ecoponto.endereco }, (results, status) => {
      if (status !== 'OK' || !results[0]) {
        console.warn(`Não foi possível localizar: ${ecoponto.nome}`);
        return;
      }

      const localizacao = results[0].geometry.location;
      const marcador = new google.maps.Marker({
        position: localizacao,
        map: mapa,
        title: ecoponto.nome,
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });

      bounds.extend(localizacao);
      mapa.fitBounds(bounds);

      const itemLista = document.querySelector(`.lista-ecopontos li[data-index="${index}"]`);

      if (itemLista) {
        itemLista.addEventListener('click', () => {
          mapa.setZoom(16);
          mapa.panTo(localizacao);
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