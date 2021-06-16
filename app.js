require('dotenv').config()
const {TwitterClient} = require('twitter-api-client')
const browserObject = require('./helpers/browser')
const TwitterBot = require('./controllers/TwitterBot')
const browserInstance = browserObject.startBrowser()
const CronJob = require('cron').CronJob
const options = require('./helpers/file')
const { v4: uuidv4 } = require('uuid')
let lastMention

const twitterClient = new TwitterClient({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET
})

const onStart = async () => {
  const data = await options.readJSON()
  lastMention = data.last_mention
}
const setLastMention = async (mentionId) => {
  const data = await options.readJSON()
  data.last_mention = mentionId
  options.writeJSON(data)
}
const job = new CronJob('*/5 * * * * *', async () => {
  console.log('Searcing mentions...')
  let mentionList = await TwitterBot.checkMentions(twitterClient, lastMention)
  if (mentionList.length !== 0) {
    mentionList.pop()
    lastMention = mentionList[0].id
    // await setLastMention(lastMention)
    for (let mention of mentionList)
      new TwitterBot(browserInstance, twitterClient, mention.in_reply_to_status_id_str, mention.user.id_str).start()
  }
  else console.log('There is no new mentions :((((')
}, null, true, 'Europe/Istanbul')

onStart().then(r => console.log("Program has started..."))





