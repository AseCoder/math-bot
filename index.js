const mathjax = require('./mathjax.js');
const fs = require('fs');
const botclass = require('./bot.js');
const bot = new botclass();

console.log(bot);

bot.doMath = async (math) => {
	const buffer = await mathjax(math);
	return buffer;
}