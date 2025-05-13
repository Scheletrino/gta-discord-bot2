require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios = require('axios');
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
const Parser = require('rss-parser');

dayjs.extend(duration);
const parser = new Parser();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = '!';
const GTA6_RELEASE_DATE = dayjs('2026-05-26T00:00:00');
const NEWS_CHANNEL_ID = process.env.NEWS_CHANNEL_ID;
let lastPostedLink = null;

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
  fetchAndPostNews();
  setInterval(fetchAndPostNews, 3600000);
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.channel.send('🏓 Pong!');
  } else if (command === 'countdown') {
    try {
      const now = dayjs();
      const diff = GTA6_RELEASE_DATE.diff(now);
      if (diff <= 0) {
        return message.channel.send('🕹️ GTA 6 è già uscito!');
      }

      const dur = dayjs.duration(diff);
      const days = dur.days() + dur.months() * 30 + dur.years() * 365;
      const hours = dur.hours();
      const minutes = dur.minutes();

      message.channel.send(`🕒 GTA 6 esce tra ${days} giorni, ${hours} ore e ${minutes} minuti!`);
    } catch (err) {
      console.error('❌ Errore nel countdown:', err);
      message.channel.send('❌ Errore nel calcolare il countdown.');
    }
  } else if (command === 'ultimenews') {
    try {
      const res = await axios.get('https://www.rockstargames.com/newswire.json');
      const news = res.data.assets[0];
      message.channel.send(`📰 Ultima news da Rockstar: ${news.title}
${news.permalink}`);
    } catch (error) {
      console.error(error);
      message.channel.send('❌ Errore nel recupero delle news.');
    }
  } else if (command === 'fan') {
    const roleName = "Fan di GTA 6";
    let role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      try {
        role = await message.guild.roles.create({
          name: roleName,
          reason: 'Ruolo per fan GTA 6'
        });
      } catch (err) {
        console.error(err);
        return message.channel.send('❌ Non posso creare il ruolo.');
      }
    }

    try {
      await message.member.roles.add(role);
      message.channel.send(`✅ Hai ricevuto il ruolo **${roleName}**!`);
    } catch (err) {
      console.error(err);
      message.channel.send('❌ Errore nell'assegnare il ruolo.');
    }
  } else if (command === 'personaggi') {
    message.channel.send('👥 I personaggi confermati finora sono: **Jason** e **Lucia**.');
  } else if (command === 'veicoli') {
    message.channel.send('🚗 Veicoli confermati: auto, moto, elicotteri, barche... e molto altro!');
  } else if (command === 'mappa') {
    message.channel.send('🗺️ GTA 6 sarà ambientato a **Vice City (Leonida State)**. Mappa in aggiornamento appena disponibile.');
  } else if (command === 'minigioco') {
    message.channel.send('🎮 Minigioco: Digita il nome di una città di GTA! (es. Vice City, Los Santos, Liberty City)');
  }
});

async function fetchAndPostNews() {
  try {
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=GTA+VI&hl=it&gl=IT&ceid=IT:it');
    const gtaNews = feed.items.slice(0, 1);

    if (gtaNews.length > 0) {
      const news = gtaNews[0];
      if (news.link !== lastPostedLink && news.title.toLowerCase().includes("gta")) {
        const channel = await client.channels.fetch(NEWS_CHANNEL_ID);
        if (channel) {
          channel.send(`📰 **${news.title}**
${news.link}`);
          lastPostedLink = news.link;
        } else {
          console.log("❌ Canale non trovato.");
        }
      }
    }
  } catch (err) {
    console.error('❌ Errore nel recupero delle notizie:', err);
  }
}

client.login(process.env.DISCORD_TOKEN);

// KEEP ALIVE PER UPTIMEROBOT
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot GTA è online!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server attivo su porta ${PORT}`);
});
