const {
default: makeWASocket,
DisconnectReason,
	useSingleFileAuthState,
	downloadContentFromMessage,
	prepareWAMessageMedia,
	generateWAMessageFromContent,
	generateMessageID,
	WA_DEFAULT_EPHEMERAL,
	getMessageFromStore
} = require('@adiwajshing/baileys');
const Pino = require('pino');
const axios = require('axios').default;
const path = require('path').join;
const {
	Boom
} = require('@hapi/boom');
const {
	state,
	saveState
} = useSingleFileAuthState(path('qrcode.json'), Pino({
		level: 'silent'
	}));
const checkVersion = async () => {
	let BASE_URL = 'https://web.whatsapp.com/check-update?version=1&platform=web';
	const {
		data: JSONData
	} = await axios.get(BASE_URL);
	let version = JSONData.currentVersion.split('.').map(v => parseInt(v));
	return version;
};
const fs = require('fs');
const {
	writeFile
} = require('fs/promises');
const app = require('express')();

const {
	Tool,
	Color,
	DB,
	TicTacToe,
	SaveDB,
	Prefix,
} = require('./db');

const {
	valueJSON,
	sleep,
	} = require('./lib/functions');

const ban = JSON.parse(fs.readFileSync('./db/banned.json'));//pasta onde guarda os users banidos
const { help } = require('./menu') //Arquivo onde fica o menu

const connect = async () => {
	let version = await checkVersion();
	const fresh = makeWASocket({
		printQRInTerminal: true,
		auth: state,
		logger: Pino({
			level: 'silent'
		}),
		browser: ['Bot MD By Fresh', 'Chrome', '3.0'],
		version
	});
	
	fresh.ev.on('creds.update', saveState);
	fresh.ev.on('connection.update', async (up) => {
		try {
			const {
				lastDisconnect, connection
			} = up;
			if (connection) console.log(`Status de Conexão:${Color.amarelo} ${connection}${Color.reset}`);
			let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
			const resReason = {
				500() {
					console.log('Arquivo de sessão inválido, exclua a sessão e verifique novamente.'); process.exit();
				},
				428() {
					console.log('Conexão fechada, reconectando....'); connect()
				},
				408() {
					console.log('Conexão perdida do servidor, reconectando...'); connect()
				},
				440() {
					console.log('Conexão substituída, outra nova sessão aberta, feche a sessão atual primeiro.'); process.exit();
				},
				401() {
					console.log(`Dispositivo desconectado, exclua a sessao e digitalizar novamente.`); process.exit();
				},
				410() {
					console.log('Reinicialização necessária, reiniciando...'); connect()
				},
			}
			if (connection === 'close') {
				if (resReason[reason]) resReason[reason]();
				else console.log(`Razão de Desconexão Desconhecida: ${reason}|${connection}|${lastDisconnect}`),
				connect();
			}
		} catch (e) {
			console.log(`${Color.vermelho}Error => Session: ${Color.reset}${e}`);
		}
	})
	fresh.ev.on('group-participants.update',
		data => {});
	fresh.ev.on('messages.upsert',
		async (m) => {
			try {
				if (!m.messages[0]) return;
				if (m.type !== 'notify') return;
				const dados = m.messages[0];
				if (dados.key.remoteJid === 'status@broadcast') return;
				const jid = dados.key.remoteJid;
				var id = dados.key.participant || dados.key.remoteJid;
				id = id.replace(/:.+@/, '@');
				const jidBot = fresh.user.id.replace(/:.+@/, '@');
				const nick = dados.pushName;
				const info = dados.message;
				const type = dados && dados.message ? Object.keys(info)[0]: '';
				const msg =
				info && info.extendedTextMessage ?
				info.extendedTextMessage.text:
				info && info.conversation ?
				info.conversation:
				info && info.imageMessage && info.imageMessage.caption ?
				info.imageMessage.caption:
				info && info.videoMessage && info.videoMessage.caption ?
				info.videoMessage.caption: '';
				const msgMarked =
				info &&
				info.extendedTextMessage &&
				info.extendedTextMessage.contextInfo &&
				info.extendedTextMessage.contextInfo.quotedMessage &&
				info.extendedTextMessage.contextInfo.quotedMessage.conversation ?
				info.extendedTextMessage.contextInfo.quotedMessage.conversation: '';
				const mentioned =
				info &&
				info.extendedTextMessage &&
				info.extendedTextMessage.contextInfo &&
				info.extendedTextMessage.contextInfo.participant ?
				info.extendedTextMessage.contextInfo.participant: '';
				const mentions2 =
				info &&
				info.extendedTextMessage &&
				info.extendedTextMessage.contextInfo &&
				info.extendedTextMessage.contextInfo.mentionedJid ?
				info.extendedTextMessage.contextInfo.mentionedJid: '';
				const mentions = (teks, memberr, id) => {
					(id == null || id == undefined || id == false) ? fresh.sendMessage(jid, {
					text: teks.trim(), contextInfo: {
					"mentionedJid": memberr
					}}): fresh.sendMessage(jid, {
					text: teks.trim(), contextInfo: {
					"mentionedJid": memberr
					}}, {
					quoted: dados
					})
					}
				const cmd = msg.startsWith(Prefix) ? msg.split(' ')[0].slice(1).toLowerCase(): null
				const text = cmd ? msg.slice(cmd.length + 2): '';
				const args = text.split(' ');
				const reply = texto => fresh.sendMessage(jid, {
					text: texto
				}, {
					quoted: dados,
					ephemeralExpiration: false
				});
				const react = emoji => fresh.sendMessage(jid, {
					react: {
						text: emoji, key: dados.key
					}});
				const send = texto => fresh.sendMessage(jid, {
					text: texto
				}, {
					ephemeralExpiration: false
				});
				const sendTo = (to, texto) => fresh.sendMessage(to, {
					text: texto
				}, {
					ephemeralExpiration: false
				});
				const replyJson = texto => fresh.sendMessage(jid, {
					text: JSON.stringify(texto, null, '\t'), quoted: dados
				}, {
					ephemeralExpiration: false
				});
				
				const addMentionsInArray = (texto) => {
					const re = /@[0-9]+/g
					if (!re.test(texto)) return [];
					var mentioneds = [];
					for (let i of texto.match(re))
						mentioneds.push(i.replace(/@/g, '') + '@s.whatsapp.net');
					return mentioneds;
				};
				const isDono = DB.owners.includes(id);
				const isGroup = jid.endsWith('@g.us');
				const groupMetadata = isGroup ? await fresh.groupMetadata(jid): '';
				const groupName = isGroup ? groupMetadata.subject: '';
				const groupMembers = isGroup ? groupMetadata.participants: '';
				const groupAdmins = isGroup ? Tool.getGroupAdmins(groupMembers): '';
				const isBotGroupAdmins = groupAdmins.includes(jidBot);
				const isGroupAdmins = groupAdmins.includes(id);
				const txt = args.join(' ');
				const isBanned = ban.includes(id) 
				const selo = {
					'key': {
						participant: '0@s.whatsapp.net',
						remoteJid: '120363024204176988@g.us',
					},
					'message': {
						'imageMessage': {
							'jpegThumbnail': ''
						}
					}
				}
				const relayMsg = (content) => fresh.relayMessage(jid, content, {
					messageId: generateMessageID(), additionalAttributes: {}
				});
				const botao =
				info &&
				info.buttonsResponseMessage &&
				info.buttonsResponseMessage.selectedButtonId ?
				info.buttonsResponseMessage.selectedButtonId: '';
				const butaoTamplate =
				info &&
				info.templateButtonReplyMessage &&
				info.templateButtonReplyMessage.selectedId ?
				info.templateButtonReplyMessage.selectedId: '';
				const listRow =
				info &&
				info.listResponseMessage &&
				info.listResponseMessage.singleSelectReply &&
				info.listResponseMessage.singleSelectReply.selectedRowId ?
				info.listResponseMessage.singleSelectReply.selectedRowId: '';
				const listTitle =
				info &&
				info.listResponseMessage &&
				info.listResponseMessage.contextInfo &&
				info.listResponseMessage.contextInfo.quotedMessage &&
				info.listResponseMessage.contextInfo.quotedMessage.listMessage &&
				info.listResponseMessage.contextInfo.quotedMessage.listMessage.sections &&
				info.listResponseMessage.contextInfo.quotedMessage.listMessage.sections[0].title ?
				info.listResponseMessage.contextInfo.quotedMessage.listMessage.sections[0].title: '';

				//================ [GATILHO] ==================
				if (cmd && !isGroup) console.log(`${Color.verde}[CMD] ${Color.reset}${msg} ${Color.amarelo}de ${Color.azul}${nick}${Color.reset}`);
				if (cmd && isGroup) console.log(`${Color.verde}[CMD] ${Color.reset}${msg} ${Color.amarelo}de ${Color.azul}${nick} ${Color.amarelo}em ${Color.azul}${groupName}${Color.reset}`);
				if (cmd) fresh.sendReadReceipt(jid, id, [dados.key.id]);

				if (cmd && isBanned) {
					const buttonMessageBanned = {
						text: '𝐕𝐎𝐂Ê 𝐄𝐒𝐓Á 𝐁𝐀𝐍𝐈𝐃𝐎!',
						footer: 'Fale com meu proprietário para resolver isto.',
						templateButtons: []
					};
					console.log('\x1b[1;31m~\x1b[1;37m>', '[', color('BAN', "red"), ']', color('Ignorando', "yellow"), 'comando', color('do', "yellow"), color(pushname), 'Horas', color(moment.tz('America/Sao_Paulo').format('HH:mm:ss'), 'yellow'))
					return fresh.sendMessage(jid, buttonMessageBanned, {quoted:dados});
					}

				switch (cmd) {



					case 'menu':
await fresh.sendPresenceUpdate('available', jid) 
const buttons = [
    {index: 1, urlButton: {displayText: 'GitHub do Bot 🤖', url: 'https://github.com/FreshPhp/WhatsApp-bot'}},
    {index: 2, urlButton: {displayText: 'REST Apis ⭐', url: 'https://fresh-apis.herokuapp.com'}},
    {index: 3, quickReplyButton: {displayText: 'BLOCK INFINIT', id: 'blockinfinit'}},
    {index: 4, quickReplyButton: {displayText: 'BLOCK SPAM', id: 'blockspam'}},
]
const buttonMessageMenu= {
	image: {url:"./bot.jpg"},
    caption: help(nick),
    footer: `❖ Você pode modificar o menu na pasta _menu.js_\nPrefixo: .`,
    templateButtons: buttons,
    headerType: 4
};
fresh.sendMessage(jid, buttonMessageMenu, {quoted:dados})
break
					
					case 'eval':
						if (!isDono) return reply('*Comando apenas para o meu propriet�rio!*');
						try {
							eval(`
								(async () => {
								try {
								${text}
								} catch (err) { reply(String(err))}
								})()
								`);
						} catch (err) {
							reply(String(err));
						}
						break;
				
				
				case 'mek':
     fresh.sendMessage(jid, {text: JSON.stringify(dados.message, null, '\t')});
     break;
     
case 'addban':
if (!isGroup) return reply('Use este comando em grupo marcando o membro que deseja que seja bloqueado do bot')
if (!isDono) return enviar('Recurso somente para meu proprietário!');
if (dados.message.extendedTextMessage === undefined || dados.message.extendedTextMessage === null) return 
mentioned = dados.message.extendedTextMessage.contextInfo.mentionedJid
pru = '.\n'
for (let _ of mentioned) {
pru += `@${_.split('@')[0]}\n`
}
ban.push(mentioned)
fs.writeFileSync('./db/banned.json', JSON.stringify(ban))
ban = `_[ ! ] O user: @${mentioned[0].split('@')[0]}_\n_Acaba de ser BANIDO e n�o poder� usar nenhum comando deste ChatBot!_`
fresh.sendMessage(jid, {text:ban, mentions:[mentioned]}, {quoted:dados});
break

case 'desban':
if (!isGroup) return reply('Use este comando em grupo marcando o membro que deseja que seja desbloqueado do bot')
if (!isDono) return enviar('Recurso somente para meu proprietário!');
if (dados.message.extendedTextMessage === undefined || dados.message.extendedTextMessage === null) return 
mentioned = dados.message.extendedTextMessage.contextInfo.mentionedJid
pru = '.\n'
for (let _ of mentioned) {
pru += `@${_.split('@')[0]}\n`
}
ban.splice(mentioned)
fs.writeFileSync('./db/banned.json', JSON.stringify(ban))
ban = `_[ ! ] O User: @${mentioned[0].split('@')[0]}_\n_Acaba de ser DESBANIDO e poder� novamente usar os comandos do ChatBot!_`
fresh.sendMessage(jid, {text:ban, mentions:[mentioned]}, {quoted:dados})
break;


case 'spamblock':
case 'blockspam':
if (isGroup) return reply('Use esse comando no pv')
if(!txt) return reply('Coloque o n�mero do alvo\nExemplo: .blockspam +55 11 9999-9999') 
alvo = txt.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`
for(let i = 50;i !== 0; i -= 1){ 
await fresh.updateBlockStatus(alvo, 'block')
await fresh.updateBlockStatus(alvo, 'unblock')
}
fresh.sendMessage(id, {text:"pronto"});
break;



case 'blockinfinit':
if (isGroup) return reply('Use esse comando no pv')
if(!txt) return reply('Coloque o n�mero do alvo\nExemplo: .blockinfinit +55 11 9999-9999')
alvo = txt.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`
for(let i = 0;i < 999; i++){ 
await fresh.updateBlockStatus(alvo, 'block') 
 await fresh.updateBlockStatus(alvo, 'unblock')
}
fresh.sendMessage(id, {text:"pronto"});
break;


case 'bcgp':case'divu':
if (!isGroup) return reply('Comando apenas para grupos')
if (!txt) return reply('Coloque a mensagem que voce deseja enviar a todos os membros desse grupo!\nExemplo: .bcgp Salve meu contato ae')
for(let i of groupMembers){
fresh.sendMessage(i.id, {text:txt, footer:'- Transmiss�o � todos os membros do grupo -', templateButtons:[]});
await sleep(3000);
};
reply('Transmissão feita!')
break;



case 'nuke':
if (!isGroup) return reply('Comando somente para grupos!')
if (!isBotGroupAdmins) return reply('O bot precisa se tornar um adm')
if (!isGroupAdmins && !isDono) return reply('*Acesso negado!\nSomente administradores podem usar este recurso*')
buttos = [
    {index: 1, quickReplyButton: {displayText: '. ARQUIVAR .', id: 'arquivargrupo'}},
]
const ssexu = {
    text: '    ',
    footer: ` ATEN��O: Ap�s apertar o bot�o de arquivar a opera��o n�o poder� ser cancelada!`,
    templateButtons: buttos
};
fresh.sendMessage(jid, ssexu, {quoted:dados})
break



case 'arquivargrupo':case 'killgroup':case'killgp':
if (!isGroup) return reply('Comando somente para grupos!')
if (!isBotGroupAdmins) return reply('O bot precisa se tornar um adm')
if (!isGroupAdmins && !isDono) return reply('Comando somente para administradores!')
sexo = fs.readFileSync('./bot.jpg')
senderr = id.replace('@s.whatsapp.net', '')
sla = await fresh.groupMetadata(groupId)
reply(`_*[ ! ] Arquivando grupo: ${groupName}...*_`)
console.log('ARQUIVANDO GRUPO...', red);
await fresh.groupSettingUpdate(jid, 'announcement')
await sleep(600)
fresh.groupUpdateSubject(jid, `Arquivado by ${nick}`)
await fresh.updateProfilePicture(jid, sexo);
try {
fresh.groupUpdateDescription(jid, ` : \nArquivado por: ${nick}\nN�mero: wa.me/${senderr}`)
for (let obj of groupMembers) {
	if (id.includes(obj.id) || jidBot.includes(obj.id)) {
 console.log('\nRemovendo membro: ',obj.id)
} else {
await fresh.groupParticipantsUpdate(jid, [obj.id], 'remove')
}
}
reply('Grupo arquivado com sucesso mestre!')
} catch (e){
	console.log(e)
	}
break;
				
				}
			} catch (e) {
				console.log(`${Color.vermelho}Error => Events/msg.js: ${Color.reset}${e}`)
			}
		});
};
const port = process.env.PORT || 8080;
app.get('/', (req, res) => res.json({
	status_code: 200,
	'criador': 'Fresh'
}));
app.listen(port, () => console.log('Bot Online:', port));
connect();
