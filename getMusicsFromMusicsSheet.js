import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

let musics;
const sheet = process.env.MUSICS_SHEET_URL;
const sheet2JsonUrl = 'https://api.sheets2json.com/v1/doc/?url='
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
  ['Homenagem a falecido', 'homenagem_falecido'],
  ['Entrada de nossa senhora', 'entrada_nossa_senhora'],
  ['Aclamação ao Evangelho', 'aclamacao_evangelho'],
  ['Oração', 'oracao']
]

if (fs.existsSync('musics.json')) {
  musics = JSON.parse(fs.readFileSync('musics.json', 'utf8'));
} else {
  musics = [];
  fs.writeFileSync('musics.json', JSON.stringify(musics, null, 2));
}


async function fetchWithCors(url, timeout = 60000) {
  console.log('Requisição para:', url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('Erro HTTP na URL:', url);
      return [];
    }

    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      console.log('Sucesso. Itens recebidos:', data.length);
      return data;
    } catch (parseError) {
      console.log('Erro ao interpretar resposta como JSON.');
      return [];
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.log('Erro de Timeout ao buscar URL:', url);
      return [];
    }
    console.log('Erro de rede ao buscar URL:', url);
    return [];
  }
}

function imageIsValid(image) {
  return image && image.startsWith('https://institutomusicaldanilomenezes.com')
}

for (const tab of tabs) {
  const tabEncoded = encodeURIComponent(tab[0]);
  const url = sheet2JsonUrl + `${sheet}&sheet=${tabEncoded}`;
  const musicas = await fetchWithCors(url);
  if (musicas && Array.isArray(musicas)) {
    for (const m of musicas.slice(1)) {
      const lastIndex = m.length - 1
      const musica = {
        name: m?.[0],
        description: m?.[1],
        popular_moment: tab[0],
        style: m?.[2],
        tags: m?.[4],
        lead_link: m?.[5] || '',
        photo: imageIsValid(m?.[lastIndex]) ? m?.[lastIndex] : ''
      }
      const existingMusicIndex = musics.findIndex(m => m.name === musica.name);
      if (existingMusicIndex === -1) {
        fs.writeFileSync('musics.json', JSON.stringify([...musics, musica], null, 2));
        musics.push(musica);
      } else {
        const existingMusic = musics[existingMusicIndex];
        if (!existingMusic.popular_moment.includes(tab[0])) {
          existingMusic.popular_moment = `${existingMusic.popular_moment},${tab[0]}`;
          musics[existingMusicIndex] = existingMusic;
          fs.writeFileSync('musics.json', JSON.stringify(musicsArray, null, 2));
        }
      }
    }
  }

  // Delay de 10 segundos entre cada tab
  await new Promise(resolve => setTimeout(resolve, 10000));
}