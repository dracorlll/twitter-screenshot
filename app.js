require('dotenv').config()
const browserObject = require('./helpers/browser')
const twitterBot = require('./controllers/twitterBot')
const browserInstance = browserObject.startBrowser()
const CronJob = require('cron').CronJob
const options = require('./helpers/file')
const {v4: uuidv4} = require('uuid')
const interval = 10

let lastMention

const onStart = async () => {
  const data = await options.readJSON()
  lastMention = data.last_mention
}

const setLastMention = async (lastMention) => {
  const data = await options.readJSON()
  data.last_mention = lastMention
  await options.writeJSON(data)
}

const job = new CronJob(`*/${interval} * * * * *`, async () => {
  const params = {
    max_results: 100,
    since_id: lastMention,
    expansions: 'referenced_tweets.id,author_id'
  }
  let mentions = await twitterBot.checkMentions(params)
  if (mentions){
    lastMention = mentions.lastMention
    await setLastMention(lastMention)
    for (let mention of mentions.tweets){
      twitterBot.start(browserInstance, mention.tweet, mention.user)
    }
  }
  else console.log('yeni mention yok')

}, null, true, 'Europe/Istanbul')

onStart().then(r => console.log("Program has started..."))


