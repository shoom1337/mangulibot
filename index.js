const token = '5923840567:AAEKOV2n97ms9dy2sC7iMvDL9TXoUQVWOhE'
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {polling: true});
const allowedUsers = []


const getManguliEnd = (manguliCounter) => {
    let ending = ''
    const lastNumber = Number(String(manguliCounter).slice(-1))

    if ((lastNumber > 4 && lastNumber <= 10) || !lastNumber || (manguliCounter > 10 && manguliCounter < 20)) {
        ending = 'ок'
    } else if (lastNumber > 1 && lastNumber < 5) {
        ending = 'ки'
    } else if (lastNumber === 1) {
        ending = 'ку'
    }
    return manguliCounter * (manguliCounter < 0 ? -1 : 1) + ' бан' + ending
}

bot.on('message', (msg) => {
    const {from: {id}, entities, text, chat} = msg
    if (text.includes('+') || text.includes('-')) {
        const sender = allowedUsers.find(user => user.id === id)
        const isNumber = Number(text.slice(2))
        if (sender && typeof isNumber === 'number') {
            const symbol = Number(text.slice(1)) >= 0
            const canCounter = (Number(text.slice(2)) * (symbol ? 1 : -1))
            if (canCounter) {
                sender.counter += canCounter
                bot.sendMessage(chat.id, `${sender.username} ${symbol ? 'выпил' : 'проебался на'} ${getManguliEnd(canCounter)} мангулей`);
            } else {
                bot.sendMessage(chat.id, `${sender.username}, хватит хуйню всякую писать`);
            }
        }
    } else if (entities[0].type === 'bot_command') {
        if (text.includes('add_me')) {
            const sender = allowedUsers.find(user => user.id === id)
            if (!sender) {
                allowedUsers.push({id: msg.from.id, username: '@' + msg.from.username, counter: 0})
                bot.sendMessage(chat.id, `Добавлен новый юзер - @${msg.from.username}`);
            }
        } else if (text.includes('delete_me')) {
            const sender = allowedUsers.find(user => user.id === id)
            const index = allowedUsers.indexOf(sender)
            if (sender) {
                allowedUsers.splice(index, 1)
                bot.sendMessage(chat.id, `Удален юзер - @${msg.from.username}. Пока, неудачник!`);
            }
        } else if (allowedUsers.length) {
            if (text.includes('stats')) {
                const statsMessage = `Статистика по мангулям: ${allowedUsers.map(user => `
            ${user.username}: ${user.counter}`)}`
                bot.sendMessage(chat.id, statsMessage);
            } else if (text.includes('all')) {
                if (allowedUsers.length) {
                    const statsMessage = `Всего мангулей выпито: ${allowedUsers.reduce((accum, user) => accum + user.counter, 0)}`
                    bot.sendMessage(chat.id, statsMessage);
                }
            }
        }
    }
});
