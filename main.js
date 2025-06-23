document.addEventListener("DOMContentLoaded", async function () {
  // consts
  const limitLoading1 = 5;
  const limitLoading2 = 10;

  // Container principal
  const titleElement = document.getElementById("title");
  if (!titleElement) return;

  const containerPrincipal = document.createElement("div");
  containerPrincipal.id = "playlist-container";

  titleElement.insertAdjacentElement("afterend", containerPrincipal);

  // Loading
  const loading = document.createElement("div");
  loading.className = "loading-visible";

  const spinner = document.createElement("div");
  spinner.className = "spinner";

  const loadingText = document.createElement("h3");
  loadingText.textContent = "Carregando Músicas...";

  loading.appendChild(spinner);
  loading.appendChild(loadingText);

  containerPrincipal.appendChild(loading);

  // Musicas
  const sheet = '1Xr3zBjYQYFV9ACutlksbecSY3T5fWnkQAHGoob5juLo'
  const sheet2JsonUrl = 'https://api.sheets2json.com/v1/doc/?url='
  let musicasArray = []

  const tabs = [
    ['Entrada do noivo', 'entrada_noivo'],
    ['Entrada dos pais', 'entrada_pais'],
    ['Entrada da noiva', 'entrada_noiva'],
    ['Entrada das alianças', 'entrada_aliancas'],
    ['Entrada dos padrinhos', 'entrada_padrinhos'],
    ['Entrada de plaquinha ou florist', 'floristas'],
    ['comunhão', 'comunhao'],
    ['Beijo', 'beijo'],
    ['Assinaturas', 'assinatura'],
    ['Saida', 'saida'],
    ['Cumprimentos', 'cumprimentos'],
    ['Entrada da Biblia', 'entrada_biblia'],
    ['Salmo', 'salmo'],
    ['Santa Ceia', 'santa_ceia'],
    ['Entrada da sagrada familia', 'entrada_sagrada_familia'],
    ['Homenagem ao falecido', 'homenagem_falecido'],
    ['Entrada de nossa senhora', 'entrada_nossa_senhora'],
    ['Aclamação ao Evangelho', 'aclamacao_evangelho'],
    ['Oração', 'oracao']
  ]

  const primeirosTabs = tabs.slice(0, limitLoading1);
  const segundosTabs = tabs.slice(limitLoading1, limitLoading2);
  const terceirosTabs = tabs.slice(limitLoading2);

  for (let i = 0; i < primeirosTabs.length; i++) {
    const tab = primeirosTabs[i][0];
    const key = primeirosTabs[i][1]
    const musicas = await fetchSheetData(sheet, tab)
    musicasArray = [
      ...musicasArray,
      ...musicas.slice(1).map(m => [...m, key])
    ];
    musicasArray = [...musicasArray, ...musicas.slice(1).map(m => [...m, key])]
  }

  let musicas = getMusicasfromArray(musicasArray)

  loading.className = "loading-invisible";

  // Filtros
  const filtroWrapper = document.createElement("div");
  filtroWrapper.className = "filtro-wrapper";

  const select = document.createElement("select");
  select.id = "filtro-estilo";
  select.className = "select-filtro";
  const opt = document.createElement("option");
  opt.value = "";
  opt.textContent = "Selecionar estilo";
  select.appendChild(opt);

  const estilosUnicos = [...new Set(musicas.map(m => m.estilo.toUpperCase()))];
  estilosUnicos.forEach(estilo => {
    const estiloSplited = estilo.split('/')
    estiloSplited.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.trim();
      opt.textContent = v.trim();
      select.appendChild(opt);
    })
  });

  const botaoFiltrar = document.createElement("button");
  botaoFiltrar.textContent = "Filtrar";
  botaoFiltrar.className = "botao-filtrar";

  const botaoReset = document.createElement("button");
  botaoReset.textContent = "Mostrar Tudo";
  botaoReset.className = "botao-reset";

  const searchTextContainer = document.createElement("div");
  searchTextContainer.className = "search-text-wrapper";

  const inputSearchText = document.createElement("input");
  inputSearchText.id = "input-search-text";
  inputSearchText.type = "text"
  inputSearchText.placeholder = "Pesquisar..."
  inputSearchText.className = "input-search-text";

  filtroWrapper.appendChild(inputSearchText);
  filtroWrapper.appendChild(select);
  filtroWrapper.appendChild(botaoFiltrar);
  filtroWrapper.appendChild(botaoReset);

  containerPrincipal.appendChild(searchTextContainer);

  select.addEventListener("change", (e) => {
    if (e.target.value) {
      select.style.color = '#F5BD50'
      select.style.fontWeight = 700;
      select.style.borderColor = '#F5BD50';
      botaoFiltrar.click()
    } else {
      select.style.color = '#475569'
      select.style.fontWeight = 400;
      select.style.borderColor = '#475569';
    }
  })

  inputSearchText.addEventListener("input", (e) => {
    if (select.selectedIndex) select.remove(select.selectedIndex);
    const otherElements = Array.from(momentDiv.children);
    otherElements?.forEach(el => el.className = '')
    const value = e.target.value;
    const filtradas = musicas.filter(m => m.nome.toLowerCase().includes(value.toLowerCase())
      || m.descricao.toLowerCase().includes(value.toLowerCase()));

    select.style.display = value ? 'none' : 'block'
    botaoReset.style.display = value ? 'none' : 'inline'
    momentDiv.className = value ? 'moment-musicas moment-musicas-disabled' : 'moment-musicas'
    select.style.color = '#475569'
    select.style.fontWeight = 400;
    select.style.borderColor = '#475569';
    renderizarMusicas(containerPrincipal, filtradas, listaMusicas);
  });

  containerPrincipal.appendChild(filtroWrapper);

  botaoFiltrar.addEventListener("click", () => {
    const otherElements = Array.from(momentDiv.children);
    const selected = otherElements?.find(el => Array.from(el.classList).some(el => el === 'selected'))?.id || ''
    inputSearchText.value = ""
    const estiloSelecionado = select.value;
    const filtradas = musicas.filter(m => m.estilo.toLowerCase().includes(estiloSelecionado.toLowerCase()) && m.momento.includes(selected));
    renderizarMusicas(containerPrincipal, filtradas, listaMusicas);
  });

  botaoReset.addEventListener("click", () => {
    if (select.selectedIndex) select.remove(select.selectedIndex);
    const otherElements = Array.from(momentDiv.children);
    otherElements?.forEach(el => el.className = '')
    inputSearchText.value = ""
    select.style.color = '#475569'
    select.style.fontWeight = 400;
    select.style.borderColor = '#475569';
    renderizarMusicas(containerPrincipal, musicas, listaMusicas);
  });

  // Container de Lista de Musicas e Momentos
  const container = document.createElement("div");
  container.className = "container-musicas";
  containerPrincipal.appendChild(container);

  // Lista de Musicas
  const listaMusicas = document.createElement("div");
  listaMusicas.id = "lista-musicas";
  listaMusicas.className = "lista-musicas";
  const listaMusicasContainer = document.createElement("div")
  listaMusicasContainer.className = "lista-musicas-container";
  listaMusicasContainer.appendChild(listaMusicas);
  container.appendChild(listaMusicasContainer);

  // Momentos
  const momentDiv = document.createElement("div");
  momentDiv.className = "moment-musicas";
  container.appendChild(momentDiv);

  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DO NOIVO", "entrada_noivo.png", "entrada_noivo")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DOS PAIS", "entrada_pais.png", "entrada_pais")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA NOIVA", "entrada_noiva-scaled.jpg", "entrada_noiva")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DAS ALIANÇAS", "entrada_aliancas-scaled.jpg", "entrada_aliancas")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DOS PADRINHOS", "entrada_padrinhos-scaled.jpg", "entrada_padrinhos")
  criaBotaoMomento(botaoFiltrar, momentDiv, "FLORISTAS", "floristas-scaled.jpg", "floristas")
  criaBotaoMomento(botaoFiltrar, momentDiv, "COMUNHÃO", "comunhao-scaled.jpg", "comunhao")
  criaBotaoMomento(botaoFiltrar, momentDiv, "BEIJO", "beijo.jpg", "beijo")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ASSINATURA", "assinatura-scaled.jpg", "assinatura")
  criaBotaoMomento(botaoFiltrar, momentDiv, "SAÍDA", "saida-scaled.jpg", "saida")
  criaBotaoMomento(botaoFiltrar, momentDiv, "CUMPRIMENTOS", "cumprimentos.jpg", "cumprimentos")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA BÍBLIA", "entrada_biblia.jpg", "entrada_biblia")
  criaBotaoMomento(botaoFiltrar, momentDiv, "SALMO", "salmo.jpg", "salmo")
  criaBotaoMomento(botaoFiltrar, momentDiv, "SANTA CEIA", "santa_ceia-scaled.jpg", "santa_ceia")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA SAGRADA FAMÍLIA", "entrada_sagrada_familia.jpg", "entrada_sagrada_familia")
  criaBotaoMomento(botaoFiltrar, momentDiv, "HOMENAGEM AO FALECIDO", "homenagem_falecido.jpg", "homenagem_falecido")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA NOSSA SENHORA", "entrada_nossa_senhora.jpg", "entrada_nossa_senhora")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ACLAMAÇÃO AO EVANGELHO", "aclamacao_evangelio.jpg", "aclamacao_evangelho")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ORAÇÃO", "oracao.jpg", "oracao")

  renderizarMusicas(containerPrincipal, musicas, listaMusicas);

  // Get another musics
  const buttons = momentDiv.children
  Array.from(buttons).slice(limitLoading1).map(el => { el.className = 'loading' })

  musicasArray = await getMusicasArray(segundosTabs, sheet2JsonUrl, sheet)
  musicas = [...musicas, ...getMusicasfromArray(musicasArray)]
  Array.from(buttons).slice(0, limitLoading2).map(el => { el.className = '' })
  renderizarMusicas(containerPrincipal, musicas, listaMusicas);

  musicasArray = await getMusicasArray(terceirosTabs, sheet2JsonUrl, sheet)
  musicas = [...musicas, ...getMusicasfromArray(musicasArray)]
  Array.from(buttons).slice(limitLoading2).map(el => { el.className = '' })
  renderizarMusicas(containerPrincipal, musicas, listaMusicas);

});

function renderizarMusicas(containerPrincipal, lista, listaMusicas, paginaAtual = 1, itensPorPagina = 14) {
  listaMusicas.innerHTML = "";

  if (!lista) return

  const totalPaginas = Math.ceil(lista.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginaMusicas = lista?.slice(inicio, fim);


  paginaMusicas.forEach((musica) => {
    const item = document.createElement("div");
    const uploadsUrl = "https://institutomusicaldanilomenezes.com/wp-content/uploads"
    const imagens = [
      uploadsUrl + "/2025/05/entrada_aliancas-scaled.jpg",
      uploadsUrl + "/2025/05/DSC0001-1-scaled.jpg",
      uploadsUrl + "/2025/05/IMG_0555-1-scaled.jpg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.13.39-1.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.13.42-1-e1750533255823.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.13.44-1.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.13.51-1-e1750513115140.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.13.53-1.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.14.02-1.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.14.14-1-e1750515117979.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.14.37-1-e1750511757466.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.14.49-1.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.14.52-2.jpeg",
      uploadsUrl + "/2025/05/WhatsApp-Image-2025-04-24-at-15.15.00-1-1.jpeg",
      uploadsUrl + "/2024/05/piano-tutor-header-program-bg.jpg",
      uploadsUrl + "/2024/06/image-7-5.png",
      uploadsUrl + "/2024/07/adff61a091a3317ac0d823ff0fec1790-scaled.jpeg",
      uploadsUrl + "/2024/07/71be657984395351d27a26a6ca6dc2f3-scaled.jpeg"
    ];
    const index = getFixedIndexFromMusicName(musica.nome + musica.descricao, imagens.length) || 0
    const defaultMusicUrl = imagens[index];
    item.className = "musica-card";

    item.innerHTML = `
      <img src="${musica.imagem || defaultMusicUrl}" alt="${musica.nome}" class="img-${index}">
      <div class="info">
        <h3>${musica.nome}</h3>
        <p>${musica.descricao.length > 75 ? (musica.descricao.substring(0, 75) + '...') : musica.descricao}</p>
        <p><strong>Tags:</strong> ${musica.artista}</p>
        <p><strong>Sugestão:</strong> ${getMomentText(musica.momento).toLowerCase()}</p>
        <div class="botoes">
          <span class="estilo-tag">${musica.estilo}</span>
          ${musica?.video ? '<a href="' + musica.video + '" target="_blank">Assistir</a>' : ''}
        </div>
      </div>
    `;
    listaMusicas.appendChild(item);
  });

  const paginacao = document.getElementById("paginacao") || document.createElement("div");
  paginacao.innerHTML = "";
  paginacao.className = "paginacao";
  paginacao.id = "paginacao";

  function adicionarBotao(pagina, texto = null, ativo = false) {
    const botao = document.createElement("button");
    botao.textContent = texto || pagina;
    botao.className = "botao-pagina";
    if (ativo) botao.classList.add("ativo");
    botao.addEventListener("click", () => {
      renderizarMusicas(containerPrincipal, lista, listaMusicas, pagina, itensPorPagina);
    });
    paginacao.appendChild(botao);
  }

  adicionarBotao(1, null, paginaAtual === 1);

  if (paginaAtual > 4) {
    const pontos = document.createElement("span");
    pontos.textContent = "...";
    pontos.className = "pontos";
    paginacao.appendChild(pontos);
  }

  for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
    if (i > 1 && i < totalPaginas) {
      adicionarBotao(i, null, i === paginaAtual);
    }
  }

  if (paginaAtual < totalPaginas - 3) {
    const pontos = document.createElement("span");
    pontos.textContent = "...";
    pontos.className = "pontos";
    paginacao.appendChild(pontos);
  }

  if (totalPaginas > 1) {
    adicionarBotao(totalPaginas, null, paginaAtual === totalPaginas);
  }

  containerPrincipal.insertAdjacentElement("afterend", paginacao);
}

function criaBotaoMomento(botaoFiltrar, momentDiv, txt, img, id) {
  const el = document.createElement("div");
  const elImg = document.createElement("img");
  const elSpan = document.createElement("spam");
  elSpan.innerHTML = txt
  elImg.src = `https://institutomusicaldanilomenezes.com/wp-content/uploads/2025/05/${img}`
  el.id = id
  el.appendChild(elImg)
  el.appendChild(elSpan)
  momentDiv.appendChild(el);
  el.addEventListener("click", () => {
    const otherElements = Array.from(momentDiv.children);
    otherElements?.forEach(el => {
      if (el.id !== id && !el.className.includes('loading')) el.className = ''
    })
    if (Array.from(el.classList).some(el => el === 'selected')) {
      el.className = ''
    } else {
      el.className = 'selected'
    }
    botaoFiltrar.click();
  });
}

function getMusicasfromArray(musicasArray) {
  // TODO: get image from api
  return musicasArray
    .map(m => ({ nome: m?.[0], momento: m?.[8], descricao: m?.[1], estilo: m?.[2], artista: m?.[4], video: m?.[5] || '', imagem: '' }))
    .filter((m) => m.nome && m.momento && m.descricao && m.estilo && m.artista)
}

async function getMusicasArray(tabs, sheet2JsonUrl, sheet) {
  let musicasArray = []
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i][0];
    const key = tabs[i][1]
    const musicas = await fetchSheetData(sheet, tab)
    musicasArray = [...musicasArray, ...musicas.slice(1).map(m => [...m, key])]
  }
  return musicasArray
}

function getFixedIndexFromMusicName(str, len) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % (len);
}

function getMomentText(moment) {
  const momentosMap = {
    entrada_noivo: "ENTRADA DO NOIVO",
    entrada_pais: "ENTRADA DOS PAIS",
    entrada_noiva: "ENTRADA DA NOIVA",
    entrada_aliancas: "ENTRADA DAS ALIANÇAS",
    entrada_padrinhos: "ENTRADA DOS PADRINHOS",
    floristas: "FLORISTAS",
    comunhao: "COMUNHÃO",
    beijo: "BEIJO",
    assinatura: "ASSINATURA",
    saida: "SAÍDA",
    cumprimentos: "CUMPRIMENTOS",
    entrada_biblia: "ENTRADA DA BÍBLIA",
    salmo: "SALMO",
    santa_ceia: "SANTA CEIA",
    entrada_sagrada_familia: "ENTRADA DA SAGRADA FAMÍLIA",
    homenagem_falecido: "HOMENAGEM AO FALECIDO",
    entrada_nossa_senhora: "ENTRADA DA NOSSA SENHORA",
    aclamacao_evangelho: "ACLAMAÇÃO AO EVANGELHO",
    oracao: "ORAÇÃO"
  };
  return (momentosMap[moment])
}

async function fetchSheetData(sheetId, tabName) {
  try {
    const proxy = "https://api.allorigins.win/get?url=";
    const target = encodeURIComponent(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${tabName}`);
    const url = proxy + target;

    const res = await fetch(url);
    const data = await res.json();

    const text = data.contents;

    const json = JSON.parse(text.substring(47).slice(0, -2));

    const headers = json.table.cols.map(col => col.label);
    const rows = json.table.rows;

    return rows.map(row =>
      headers.map((_, i) => row.c[i]?.v ?? '')
    );
  } catch (error) {
    return []
  }
}
