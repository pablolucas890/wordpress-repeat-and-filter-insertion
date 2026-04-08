import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

let musics;
const sheet = process.env.INSTRUMENTS_SHEET_URL;
const sheet2JsonUrl = 'https://api.sheets2json.com/v1/doc/?url='
const tabs = [['Vídeos do Insta', '']]

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

for (const tab of tabs) {
  const tabEncoded = encodeURIComponent(tab[0]);
  const url = sheet2JsonUrl + `${sheet}&sheet=${tabEncoded}`;
  const musicas = await fetchWithCors(url);
  if (musicas && Array.isArray(musicas)) {
    for (const m of musicas.slice(3)) {
      const musicName = m?.[0];
      if (musicName) {
        const music = musics.find(m => m.name === musicName);
        if (music) {
          const musicIndex = musics.findIndex(m => m.name === musicName);
          if (musicIndex !== -1) {
            musics[musicIndex].popular_instruments = m?.[1];
            musics[musicIndex].emphasis_instruments = m?.[2];
            musics[musicIndex].popular_formation = m?.[3];
            musics[musicIndex].popular_model = m?.[4]?.toLowerCase()?.trim() === 'cantado' ? 'sung' : m?.[4]?.toLowerCase()?.trim() === 'instrumental' ? 'instrumental' : ''
            musics[musicIndex].popular_place = m?.[5];
            musics[musicIndex].popular_time = m?.[6]?.toLowerCase()?.trim() === 'manhã' ? 'morning' : m?.[6]?.toLowerCase()?.trim() === 'tarde' ? 'afternoon' : m?.[6]?.toLowerCase()?.trim() === 'noite' ? 'night' : ''
            musics[musicIndex].popular_environment = m?.[7]?.toLowerCase()?.trim() === 'ar livre' ? 'outdoor' : m?.[7]?.toLowerCase()?.trim() === 'igreja' ? 'church' : m?.[7]?.toLowerCase()?.trim() === 'salão' ? 'hall' : ''
            fs.writeFileSync('musics.json', JSON.stringify(musics, null, 2));
          }
        }
      }
    }
  }
  // Delay de 10 segundos entre cada tab
  await new Promise(resolve => setTimeout(resolve, 10000));
}