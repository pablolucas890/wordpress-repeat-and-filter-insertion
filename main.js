document.addEventListener("DOMContentLoaded", async function () {
  // Container principal
  const titleElement = document.getElementById("title");
  if (!titleElement) return;
  const containerPrincipal = document.createElement("div");
  containerPrincipal.id = "playlist-container";
  titleElement.insertAdjacentElement("afterend", containerPrincipal);

  // Loading inicial
  const loading = document.createElement("div");
  loading.className = "loading-visible";
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  const loadingText = document.createElement("h3");
  loadingText.textContent = "Carregando Músicas...";
  loading.appendChild(spinner);
  loading.appendChild(loadingText);
  containerPrincipal.appendChild(loading);


  // Busca e criação das músicas
  const tabs = {
    'Entrada do noivo': 'entrada_noivo',
    'Entrada dos pais': 'entrada_pais',
    'Entrada da noiva': 'entrada_noiva',
    'Entrada das alianças': 'entrada_aliancas',
    'Entrada dos padrinhos': 'entrada_padrinhos',
    'Entrada de plaquinha ou florist': 'floristas',
    'comunhão': 'comunhao',
    'Beijo': 'beijo',
    'Assinaturas': 'assinatura',
    'Saida': 'saida',
    'Cumprimentos': 'cumprimentos',
    'Entrada da Biblia': 'entrada_biblia',
    'Salmo': 'salmo',
    'Santa Ceia': 'santa_ceia',
    'Entrada da sagrada familia': 'entrada_sagrada_familia',
    'Homenagem a falecido': 'homenagem_falecido',
    'Entrada de nossa senhora': 'entrada_nossa_senhora',
    'Aclamação ao Evangelho': 'aclamacao_evangelho',
    'Oração': 'oracao'
  }
  const apiMusics = await fetch('http://app.institutomusicaldanilomenezes.com/api/musics').then(res => res.json());
  const musicas = []
  for (const m of apiMusics?.data) {
    const popularMoment = m?.popular_moment?.split(',') || [];
    for (const moment of popularMoment) {
      if (tabs[moment]) {
        musicas.push({
          nome: m.name,
          momento: tabs[moment],
          descricao: m?.description || '',
          estilo: m?.style || 'Católico',
          artista: m.tags,
          video: m.lead_link,
          imagem: m.photo ?
            null
            // TODO: Adicionar a imagem da música
            // `http://app.institutomusicaldanilomenezes.com/api/musics/${m.id}/photo` 
            : null
        });
      }
    }
  }
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
  let arrayEstilos = []
  const estilosUnicos = [...new Set(musicas.map(m => m.estilo.toUpperCase()))];
  estilosUnicos.forEach(estilo => {
    const estiloSplited = [];
    estilo.split('/').forEach((el) => {
      el.split(',').forEach((el2) => {
        estiloSplited.push(el2)
      })
    })
    estiloSplited.forEach(v => {
      const opt = document.createElement("option");
      const formated = v.trim()
      if (!arrayEstilos.some(el => el === formated))
        arrayEstilos.push(formated)
      opt.value = formated;
      opt.textContent = formated;
      select.appendChild(opt);
    })
  });
  arrayEstilos = arrayEstilos.sort()
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
  containerPrincipal.appendChild(filtroWrapper);

  // Events
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
    renderizarMusicas(arrayEstilos, containerPrincipal, filtradas, listaMusicas);
  });

  botaoFiltrar.addEventListener("click", () => {
    const otherElements = Array.from(momentDiv.children);
    const selected = otherElements?.find(el => Array.from(el.classList).some(el => el === 'selected'))?.id || ''
    inputSearchText.value = ""
    const estiloSelecionado = select.value;
    const filtradas = musicas.filter(m => m.estilo.toLowerCase().includes(estiloSelecionado.toLowerCase()) && m.momento.includes(selected));
    renderizarMusicas(arrayEstilos, containerPrincipal, filtradas, listaMusicas);
  });

  botaoReset.addEventListener("click", () => {
    if (select.selectedIndex) select.remove(select.selectedIndex);
    const otherElements = Array.from(momentDiv.children);
    otherElements?.forEach(el => el.className = '')
    inputSearchText.value = ""
    select.style.color = '#475569'
    select.style.fontWeight = 400;
    select.style.borderColor = '#475569';
    renderizarMusicas(arrayEstilos, containerPrincipal, musicas, listaMusicas);
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

  // Renderização dos momentos
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DO NOIVO", "entrada_noivo.png", "entrada_noivo")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DOS PAIS", "entrada_pais.png", "entrada_pais")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DOS PADRINHOS", "entrada_padrinhos-scaled.jpg", "entrada_padrinhos")
  criaBotaoMomento(botaoFiltrar, momentDiv, "FLORISTAS", "floristas-scaled.jpg", "floristas")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA NOIVA", "entrada_noiva-scaled.jpg", "entrada_noiva")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA NOSSA SENHORA", "entrada_nossa_senhora.jpg", "entrada_nossa_senhora")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA SAGRADA FAMÍLIA", "entrada_sagrada_familia.jpg", "entrada_sagrada_familia")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DA BÍBLIA", "entrada_biblia.jpg", "entrada_biblia")
  criaBotaoMomento(botaoFiltrar, momentDiv, "SALMO", "salmo.jpg", "salmo")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ACLAMAÇÃO AO EVANGELHO", "aclamacao_evangelio.jpg", "aclamacao_evangelho")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ENTRADA DAS ALIANÇAS", "entrada_aliancas-scaled.jpg", "entrada_aliancas")
  criaBotaoMomento(botaoFiltrar, momentDiv, "COMUNHÃO", "comunhao-scaled.jpg", "comunhao")
  criaBotaoMomento(botaoFiltrar, momentDiv, "SANTA CEIA", "santa_ceia-scaled.jpg", "santa_ceia")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ORAÇÃO", "oracao.jpg", "oracao")
  criaBotaoMomento(botaoFiltrar, momentDiv, "HOMENAGEM AO FALECIDO", "homenagem_falecido.jpg", "homenagem_falecido")
  criaBotaoMomento(botaoFiltrar, momentDiv, "BEIJO", "beijo.jpg", "beijo")
  criaBotaoMomento(botaoFiltrar, momentDiv, "ASSINATURA", "assinatura-scaled.jpg", "assinatura")
  criaBotaoMomento(botaoFiltrar, momentDiv, "CUMPRIMENTOS", "cumprimentos.jpg", "cumprimentos")
  criaBotaoMomento(botaoFiltrar, momentDiv, "SAÍDA", "saida-scaled.jpg", "saida")
  renderizarMusicas(arrayEstilos, containerPrincipal, musicas, listaMusicas);
});

function renderizarMusicas(arrayEstilos, containerPrincipal, lista, listaMusicas, paginaAtual = 1, itensPorPagina = 14) {
  listaMusicas.innerHTML = "";
  const paletaDeCores = [
    "#1B5E20", "#D84315", "#006064", "#6A1B9A", "#A64B00",
    "#263238", "#0077CC", "#AD1457", "#424242", "#00467a",
    "#FF5722", "#C62828", "#558B2F", "#0F1C2E", "#FF7043",
    "#00838F", "#283593", "#8D6E63", "#212121", "#A1887F",
    "#4527A0", "#005B99", "#9CCC65", "#607D8B", "#D28E00",
    "#1A237E", "#FF9800", "#CC7000", "#37474F", "#E64A19",
    "#78909C", "#FF8C00", "#33691E", "#757575", "#F57C00",
    "#3399FF", "#A64B00", "#FFB100", "#558B2F", "#FFB74D",
    "#AD1457", "#66B2FF", "#D4E157", "#0077CC", "#F5BD50",
    "#C62828", "#283593", "#607D8B", "#263238", "#00467a"
  ];


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

    let indexEstilo = arrayEstilos.indexOf(musica.estilo.toUpperCase())
    indexEstilo = indexEstilo > 50 ? 0 : indexEstilo
    item.innerHTML = `
      <img src="${musica.imagem || defaultMusicUrl}" alt="${musica.nome}" class="img-${index}">
      <div class="info">
        <h3>${musica.nome}</h3>
        <p>${musica.descricao.length > 75 ? (musica.descricao.substring(0, 75) + '...') : musica.descricao}</p>
        <p><strong>Tags:</strong> ${musica.artista}</p>
        <p><strong>Sugestão:</strong> ${getMomentText(musica.momento).toLowerCase()}</p>
        <div class="botoes">
          <span class="estilo-tag" style="background-color: ${paletaDeCores[indexEstilo]};">${musica.estilo}</span>
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
      renderizarMusicas(arrayEstilos, containerPrincipal, lista, listaMusicas, pagina, itensPorPagina);
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