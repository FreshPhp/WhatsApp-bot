const {
 'default':
   makeWASocket,
   DisconnectReason,
   useSingleFileAuthState
} = require('@adiwajshing/baileys');
const fs = require('fs');
const P = require('pino');
const {
  state,
  saveState
} = useSingleFileAuthState('session.json');
const {
 getAdmins,
 getMembers
} = require('./lib/utils');

const {
valueJSON,
sleep,
} = require('./lib/functions');

const { menup } = require('./menu')

const ban = JSON.parse(fs.readFileSync('./database/banned.json'));

prefix = ['#', '.', '/', '!'];

function connectToWhatsapp() {
  const fresh = makeWASocket({
    printQRInTerminal: true,
    logger: P({level: 'info'}),
    auth: state,
 });
  
fresh.ev.on('connection.update', update => {
  console.log(update);
  if (update.connection == 'close') {
    if (update.lastDisconnect.error.hasOwnProperty('output') ? update.lastDisconnect.error.output.statusCode != DisconnectReason.loggedOut : true) {
      console.log('conexão fechada, reconectando...');
      connectToWhatsapp();
    } else if (update.lastDisconnect.error.output.statusCode == DisconnectReason.loggedOut) {
      console.log('desconectado, reconectando...');
      connectToWhatsapp();
    }
  } else if (update.connection == 'open') {
    console.log('conexão aberta');
  }
});
fresh.ev.on('creds.update', saveState);

fresh.ev.on('messages.upsert', async updateM => {
  if (updateM.type != 'notify') return;
  const mek = updateM.messages[0];
  if (!mek.key.participant) mek.key.participant = mek.key.remoteJid;
  mek.key.participant = mek.key.participant.replace(/:[0-9]+/gi, '');
  if (mek.key.fromMe) return;
  if (!mek.message) return;
  const from = mek.key.remoteJid;
  const info = mek.message;
  const type = Object.keys(info);
  
  const body = type == 'conversation' && info.conversation ? info.conversation : type == 'extendedTextMessage' && info.extendedTextMessage.text ? info.extendedTextMessage.text : type == 'imageMessage' && info.imageMessage.caption ? info.imageMessage.caption : type == 'videoMessage' && info.videoMessage.caption ? info.videoMessage.caption : type == "buttonsResponseMessage" && info.buttonsResponseMessage.selectedButtonId ? info.buttonsResponseMessage.selectedButtonId : type == "listResponseMessage" && info.listResponseMessage.singleSelectReply.selectedRowId ? info.listResponseMessage.singleSelectReply.selectedRowId :  '';
  
   const enviar = text => {
    fresh.sendMessage(from, {text: text}, {quoted: mek});
   };
   
   const mentions = (teks, memberr, id) => {
(id == null || id == undefined || id == false) ? fresh.sendMessage(from, {
text: teks.trim(), contextInfo: {
"mentionedJid": memberr
}}): fresh.sendMessage(from, {
text: teks.trim(), contextInfo: {
"mentionedJid": memberr
}}, {
quoted: mek
})
}
  
  const args = body.trim().split(/ +/).slice(1)
  const q = args.join(' ')
  const isCommand= body.startsWith(prefix)
   const botNumber = fresh.user.id.replace(/:[0-9]+/gi, '');
   const owner = "seu-numero-todo-junto-sem-simbolos@s.whatsapp.net";
   const metadata = await fresh.groupMetadata(from);
   const isGroup = mek.key.remoteJid.endsWith('g.us');
   const groupName = isGroup ? groupMetadata.subject: ''
   const sender = mek.key.participant;
   const pushname = mek.pushName;
   const isOwner = sender != owner;
   const groupMembers = isGroup ? metadata.participants : [];
   const isAdmins = isGroup ? getAdmins(groupMembers) : [];
   const isMemberAdmin = isGroup ? isAdmins.indexOf(sender) > -1 : false;
   const isBotAdmin = isGroup ? isAdmins.indexOf(botNumber) > -1 : false;
   const allMembers = isGroup ? getMembers(groupMembers) : [];
const timestamp = speed();
const latensi = speed() - timestamp
   const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
  const isBanned = ban.includes(sender) 
  
  
  
  
   let mess = {
				wait: `_*Já estou enviando, ${pushname}...*_`,
}
   //log
   console.log(mek.key);
   console.log(info);
   
   
   //CONFERE MEMBRO BANIDO 
  if (isCommand && isBanned) {
const buttonMessageBanned = {
    text: '𝐕𝐎𝐂Ê 𝐄𝐒𝐓Á 𝐁𝐀𝐍𝐈𝐃𝐎!',
    footer: 'Fale com meu criador para resolver isto.',
    templateButtons: []
};
console.log('\x1b[1;31m~\x1b[1;37m>', '[', color('BAN', "red"), ']', color('Ignorando', "yellow"), 'comando', color('do', "yellow"), color(pushname), 'Horas', color(moment.tz('America/Sao_Paulo').format('HH:mm:ss'), 'yellow'))
return fresh.sendMessage(from, buttonMessageBanned, {quoted:mek});
}
  
  
 if (prefix.indexOf(body.slice(0, 1)) < 0) return;
  
   switch (command) {
     
     case 'menu':
await fresh.sendPresenceUpdate('available', from) 
const buttons = [
    {index: 1, urlButton: {displayText: 'GitHub do Bot 🤖', url: 'https://github.com/FreshPhp/WhatsApp-bot'}},
    {index: 2, urlButton: {displayText: 'REST Apis ⭐', url: 'https://fresh-apis.herokuapp.com'}},
    {index: 3, quickReplyButton: {displayText: 'BLOCK INFINIT', id: 'blockinfinit'}},
    {index: 4, quickReplyButton: {displayText: 'BLOCK SPAM', id: 'blockspam'}},
]
const buttonMessageTeste = {
	image: {url:"./bot.jpg"},
    caption: menup,
    footer: `❖ Você pode modificar o menu na pasta _menu.js_`,
    templateButtons: buttons,
    headerType: 4
};
fresh.sendMessage(from, buttonMessageTeste, {quoted:mek})
break

     case 'eval':
    if (isOwner) return enviar('recurso so pro dono');
      try {
      eval(`(async () => {
          try {
           ${body.slice(6)};
          } catch(err) {
           enviar(String(err));
          }
        })();`);
      } catch(err) {
       enviar(String(err));
     }
     break;
     
     case 'mek':
     fresh.sendMessage(from, {text: JSON.stringify(updateM, null, '\t')});
     break;
     
case 'addban':
if (!isOwner) return enviar('Recurso somente para meu criador!');
if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return 
mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
pru = '.\n'
for (let _ of mentioned) {
pru += `@${_.split('@')[0]}\n`
}
ban.push(`${mentioned}`)
fs.writeFileSync('./database/banned.json', JSON.stringify(ban))
ban = `_[ ! ] O user: @${mentioned[0].split('@')[0]}_\n_Acaba de ser BANIDO e não poderá usar nenhum comando deste ChatBot!_`
fresh.sendMessage(from, {text:ban, mentions:[mentioned]}, {quoted:mek})
//enviar(susp)
break

case 'unban':
if (!isOwner) return enviar('Recurso somente para meu criador!');
if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return 
mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
pru = '.\n'
for (let _ of mentioned) {
pru += `@${_.split('@')[0]}\n`
}
ban.splice(`${mentioned}`)
fs.writeFileSync('./database/banned.json', JSON.stringify(ban))
ban = `_[ ! ] O User: @${mentioned[0].split('@')[0]}_\n_Acaba de ser DESBANIDO e poderá novamente usar os comandos do ChatBot!_`
fresh.sendMessage(from, {text:ban, mentions:[mentioned]}, {quoted:mek})
break;


case 'spamblock':case 'blockspam':
if (isGroup) return reply('Use esse comando no pv')
if(!args[0]) return reply('Coloque o número do alvo\nExemplo: .blockspam +55 11 9999-9999') 
alvo = q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`
for(let i = 50;i !== 0; i -= 1){ 
await fresh.updateBlockStatus(alvo, 'block')
await fresh.updateBlockStatus(alvo, 'unblock')
}
fresh.sendMessage(sender, {text:"pronto"});
break;



case 'blockinfinit':
if (isGroup) return reply('Use esse comando no pv')
if(!args[0]) return reply('Coloque o número do alvo\nExemplo: .blockinfinit +55 11 9999-9999')
alvo = q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`
for(let i = 0;i < 999; i++){ 
await fresh.updateBlockStatus(alvo, 'block') 
 await fresh.updateBlockStatus(alvo, 'unblock')
}
fresh.sendMessage(sender, {text:"pronto"});
break;


case 'bcgp':case'divu':
if (!isGroup) return reply('Comando apenas para grupos')
if (!q) return reply('Coloque a mensagem que você deseja enviar a todos os membros desse grupo!\nExemplo: .bcgp Salve meu contato ae')
for(let i of groupMembers){
await sleep(2000)
fresh.sendMessage(i.id, {text:q, footer:'- Transmissão à todos os membros do grupo -', templateButtons:[]});
}
break;



case 'nuke':
if (!isGroup) return reply('Comando somente para grupos!')
if (!isBotGroupAdmins) return reply('O bot precisa se tornar um adm')
if (!isGroupAdmins && !isOwner) return reply('*Acesso negado!\nSomente administradores podem usar este recurso*')
buttos = [
    {index: 1, quickReplyButton: {displayText: '. ARQUIVAR .', id: 'arquivargrupo'}},
]
const ssexu = {
    text: '𝑫𝑬𝑺𝑬𝑱𝑨 𝑨𝑹𝑸𝑼𝑰𝑽𝑨𝑹 𝑬𝑺𝑻𝑬 𝑮𝑹𝑼𝑷𝑶 ⁉️',
    footer: `❖ ATENÇÃO: Após apertar o botão de arquivar a operação não poderá ser cancelada!`,
    templateButtons: buttos
};
fresh.sendMessage(from, ssexu, {quoted:mek})
break



case 'arquivargrupo':case 'killgroup':case'killgp':
if (!isGroup) return reply('Comando somente para grupos!')
if (!isBotGroupAdmins) return reply('O bot precisa se tornar um adm')
if (!isGroupAdmins && !isOwner) return reply('Comando somente para administradores!')
sexo = fs.readFileSync('./bot.jpg')
senderr = sender.replace('@s.whatsapp.net', '')
sla = await fresh.groupMetadata(groupId)
reply(`_*[ ! ] Arquivando grupo ${groupName}...*_`)
console.log('ARQUIVANDO GRUPO...')
await sleep(100)
await fresh.groupSettingUpdate(from, 'announcement')
await sleep(500)
fresh.groupUpdateSubject(from, `Arquivado by ${pushname}`)
await fresh.updateProfilePicture(from, sexo)
try {
fresh.groupUpdateDescription(from, `𝐌𝐞𝐭𝐡𝐨𝐝 𝐛𝐲: 𝐅𝐫𝐞𝐬𝐡\nArquivado por: ${pushname}\nNúmero: wa.me/${senderr}`)
for (let obj of groupMembers) {
	if (sender.includes(obj.id) || botNumber.includes(obj.id)) {
 console.log('\nRemovendo membro: ',obj.id)
} else {
await fresh.groupParticipantsUpdate(from, [obj.id], 'remove')
}
}
reply('Grupo arquivado com sucesso mestre!')
} catch (e){
	console.log(e)
	}
break;



     default:
   }
 });
}
connectToWhatsapp();
