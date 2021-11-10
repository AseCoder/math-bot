const discord = require('discord.js');

class Bot {
	constructor() {
		const client = new discord.Client({ intents: ['GUILD_MESSAGES', 'GUILDS'] });

		client.on('ready', () => {
			console.log('bot ready');
			client.user.setPresence({ activities: [{ name: '\`$ (math) \`', type: 'LISTENING' }] });
		});

		client.on('messageCreate', async message => {
			if (!message.content.includes('\`$')) return;
			if (message.author.bot) return;
			console.log(message.content);

			// parse content
			let content = message.content;
			let charsBeforeContent = 0;
			let maths = [];
			while (content.length) {
				const startIndex = content.indexOf('\`$');

				if (content[startIndex - 1] === '\\') {
					charsBeforeContent += startIndex + 3;
					content = content.slice(startIndex + 3);
				} else {
					if (startIndex < 0) {
						content = '';
						continue;
					}

					charsBeforeContent += startIndex + 2;
					content = content.slice(startIndex + 2);

					let afterEquation = content;
					let charsBeforeEnd = charsBeforeContent;
					let endIndex;
					while (afterEquation.length && !endIndex) {
						const possibleEndIndex = afterEquation.indexOf('`');


						if (afterEquation[possibleEndIndex - 1] === '\\') {
							afterEquation = afterEquation.slice(possibleEndIndex + 1);
							charsBeforeEnd += possibleEndIndex + 1;
						} else {
							endIndex = charsBeforeEnd + possibleEndIndex;
							afterEquation = '';
							maths.push(message.content.slice(charsBeforeContent, endIndex));
							content = content.slice((charsBeforeEnd + possibleEndIndex) - charsBeforeContent);
							charsBeforeContent = endIndex;
						}
					}
				}
			}
			console.log(maths);
			maths = maths.filter(x => x.length > 0);
			if (maths.length === 0) return;
			const buffer = await this.doMath(maths);
			const attachment = new discord.MessageAttachment(buffer, 'math.png');
			message.reply({ files: [attachment] });
		});

		client.login('');

		this.doMath;
	}
}
module.exports = Bot;