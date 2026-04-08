import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const token = `Bearer ${process.env.API_TOKEN}`;
let lastIndex;
let musics;

if (fs.existsSync('lastIndex.txt')) {
  lastIndex = parseInt(fs.readFileSync('lastIndex.txt', 'utf8'));
} else {
  lastIndex = 0;
  fs.writeFileSync('lastIndex.txt', lastIndex.toString());
}

if (fs.existsSync('musics.json')) {
  musics = JSON.parse(fs.readFileSync('musics.json', 'utf8'));
} else {
  musics = [];
  fs.writeFileSync('musics.json', JSON.stringify(musics, null, 2));
}

async function savePhoto(photo, filePath) {
  const response = await fetch(photo);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);
  return buffer;
}

for (let i = lastIndex; i < musics.length; i++) {
  const music = musics[i];
  const name = music.name;
  const photo = music.photo;

  if (name) {
    const formData = new FormData();
    if (music?.name)
      formData.append('name', music.name);
    if (music?.description)
      formData.append('description', music.description);
    if (music?.popular_moment)
      formData.append('popular_moment', music.popular_moment);
    if (music?.style)
      formData.append('style', music.style);
    if (music?.tags)
      formData.append('tags', music.tags);
    if (music?.lead_link)
      formData.append('lead_link', music.lead_link);
    if (music?.popular_instruments)
      formData.append('popular_instruments', music.popular_instruments);
    if (music?.emphasis_instruments)
      formData.append('emphasis_instruments', music.emphasis_instruments);
    if (music?.popular_formation)
      formData.append('popular_formation', music.popular_formation);
    if (music?.popular_model)
      formData.append('popular_model', music.popular_model);
    if (music?.popular_place)
      formData.append('popular_place', music.popular_place);
    if (music?.popular_time)
      formData.append('popular_time', music.popular_time);
    if (music?.popular_environment)
      formData.append('popular_environment', music.popular_environment);

    console.log(`-------------------------------- ${i + 1} of ${musics.length} --------------------------------`);
    console.log('Trying to save music:', name);
    if (photo) {
      try {
        const extension = photo.split('.').pop();
        const fileName = `${music.name.toLowerCase().replace(/ /g, '-')}.${extension}`;
        const filePath = `./assets/website/${fileName}`;
        const photoBuffer = await savePhoto(photo, filePath);
        formData.append('photo', new Blob([photoBuffer]), fileName);
        console.log('Photo saved successfully from music:', name);
      } catch (error) {
        console.log('Failed to save photo from music:', name);
      }
    }

    try {
      const response = await fetch('http://app.institutomusicaldanilomenezes.com/api/musics', {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Music saved successfully:', name);
          console.log(data);
        } catch (error) {
          console.log('Failed to parse response from music:', name);
          const body = await response.text();
          console.log(body.substring(0, 100));
          process.exit(1);
        }
      } else {
        console.log('Failed to save music:', name);
        try {
          const json = await response.json();
          const errors = json?.errors;
          const name = errors?.name?.join(', ');
          if (name && name.includes('Já existe uma música cadastrada com este nome.')) {
            console.log('Music already exists:', name);
          } else {
            console.log(json);
            process.exit(1);
          }
        } catch (error) {
          console.log('Failed to parse response from music:', error);
          const body = await response.text();
          console.log(body.substring(0, 100));
          process.exit(1);
        }
      }
    } catch (error) {
      console.log('Failed to save music:', error);
      process.exit(1);
    }
  } else {
    console.log('Music has no name:', music);
  }
  fs.writeFileSync('lastIndex.txt', (i + 1).toString());
  console.log('Waiting 4 seconds before next music...');
  await new Promise(resolve => setTimeout(resolve, 4000));
}
