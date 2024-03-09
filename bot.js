// carrega as variáveis de ambiente do .env
require("dotenv").config();

const mongoose = require("mongoose");

const {
    MONGO_URI,
    GUILD_ID,
    TOKEN_BOT
} = process.env;

// Conecta no banco do mongo na nuvem
mongoose.connect(MONGO_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Como se criasse uma tabela num banco relacional (SQL)
const PontoSchema = new mongoose.Schema({
    userId: String,
    nickname: String,
    pontos: Number
});
const Ponto = mongoose.model('Ponto', PontoSchema);

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
 ],
});

const prefix = "!uai";
const token = TOKEN_BOT;
const canaisRegistados = ['1212482170585874444']; 

// Evento de inicialização do bot
client.once('ready', () => {
    console.log('Bot está online!');
});

// Evento de registro de pontos
client.on('messageCreate', async message => {
    const guild = client.guilds.cache.get(GUILD_ID);
    const member = guild.members.cache.get(message.author.id);
    let { nickname } = member;
    
    if (!nickname) {
        nickname = message.author.globalName;
    }

    if (canaisRegistados.includes(message.channel.id) && message.content.startsWith(prefix)) {
        const userId = message.author.id;

        try {
            const pontoExistente = await Ponto.findOne({ userId });
            if (!pontoExistente) {
                const newPonto = new Ponto({
                    userId,
                    nickname,
                    pontos: 1
                });

                newPonto.save();
            } else {
                pontoExistente.nickname = nickname;
                ++pontoExistente.pontos;
                pontoExistente.save();
            }
        } catch (err) {
            console.error(err);
        }
    }
});


// Conectar ao Discord
client.login(token);
