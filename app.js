require('dotenv').config()
const {TwitterClient} = require('twitter-api-client')
const browserObject = require('./helpers/browser')
const TwitterBot = require('./controllers/TwitterBot')
const browserInstance = browserObject.startBrowser()
const CronJob = require('cron').CronJob
const options = require('./helpers/file')
const {v4: uuidv4} = require('uuid')
let lastMention

const imgur = require('./controllers/imgurApi')

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
  return options.writeJSON(data)
}
const job = new CronJob('*/10 * * * * *', async () => {
  let mentionList
  try {
    mentionList = await TwitterBot.checkMentions(twitterClient, lastMention)
  } catch (err) {
    mentionList = []
    console.log(err)
  }
  if (mentionList.length !== 0) {
    if (mentionList[0].id != lastMention) {
      lastMention = mentionList[0].id
      await setLastMention(lastMention)
      for (let mention of mentionList)
        new TwitterBot(browserInstance, twitterClient, mention.in_reply_to_status_id_str, mention.user.id_str).start()
    }
  }
}, null, true, 'Europe/Istanbul')

onStart().then(r => console.log("Program has started..."))





