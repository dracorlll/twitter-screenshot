require('dotenv').config()
const browserObject = require('./helpers/browser')
const twitterBot = require('./controllers/twitterBot')
const browserInstance = browserObject.startBrowser()
const CronJob = require('cron').CronJob
const options = require('./helpers/file')
require('./helpers/logger')()
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
    for (let mention of mentions.tweets)
       twitterBot.start(browserInstance, mention.tweet, mention.user)
  }
  else console.log('There is no new mention...')

}, null, false, 'Europe/Istanbul')

// const generateToken = new CronJob(`0 0 * * * *`, async () => {
//   job.stop()
//   await imgur.generateAccessToken()
//   job.start()
// }, null, true, 'Europe/Istanbul')

onStart().then(r => {
  console.log("Program has started...")
  job.start()
})


