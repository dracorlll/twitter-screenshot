const Jimp = require('jimp')
const { v4: uuidv4 } = require('uuid');
const imgur = require('../controllers/imgurApi')
const twitterClient = require('../controllers/twitterApi')
const winston = require('winston')
const getRepliedTweet = (arr) => {
  return arr.find(o => o.type === 'replied_to');
}

const checkMentions = async (params) => {
  let arr = []
  const res = await twitterClient.getMentions(params)
  if (!res)
    return false
  if (res.meta.result_count == 0)
    return false
  for (let mention of res.data){
    if (mention.id > params.since_id)
      arr.push({user: mention.author_id, tweet: getRepliedTweet(mention.referenced_tweets).id})
  }
  return {tweets: arr, lastMention: res.meta.newest_id}
}

const cropImage = async (imagePath) => {
  try {
    let image = await Jimp.read(imagePath)
    await image.autocrop().writeAsync(imagePath)

  } catch (err) {
    winston.error({timestamp: new Date().toString(), error: err})
    return false
  }
  return true
}

const postDirectMessage = async (link, user) => {
  const event = {
    message_create: {
      target: {
        recipient_id: user
      },
      message_data: {
        text: `Screenshot link: ${link}`
      }
    },
    type: "message_create"
  }
  return await twitterClient.postDirectMessage(event)
}

const imagesHaveLoaded = async () => {
  return Array.from(document.querySelectorAll('iframe')[0].contentDocument.images).every((i) => i.complete)
}

const takeScreenshot = async (browserInstance, tweet) => {

  const imagePath = `tests/${tweet}${uuidv4()}.png`

  try{
    const browser = await browserInstance
    const html = '<div id="container"></div>'
    const screenshotOptions = {path: imagePath, fullPage: true, omitBackground: true}
    const tweetOptions = JSON.stringify({theme: 'dark', align: 'center'}).toString()
    const page = await browser.newPage()
    await page.setContent(html)
    await page.addScriptTag({path: './public/javascripts/widgets.js'});
    const evalString = `twttr.widgets.createTweet("${tweet}", document.getElementById("container"), ${tweetOptions})`
    await page.evaluate(evalString)
    await page.waitForFunction(imagesHaveLoaded)
    await page.screenshot(screenshotOptions);
    await page.close()
  }
  catch (err) {
    winston.error({timestamp: new Date().toString(), error: err, type: 'browser'})
    return false
  }
  return imagePath
}

const start = async (browserInstance, tweet, user) => {
  let imagePath = await takeScreenshot(browserInstance, tweet)
  if (!imagePath)
    return false
  let crop = await cropImage(imagePath)
  if (!crop)
    return false

  let imageLink = await imgur.uploadImage(imagePath)
  if (!imageLink)
    return false
  return await postDirectMessage(imageLink, user)
}

module.exports = {start, checkMentions, postDirectMessage}