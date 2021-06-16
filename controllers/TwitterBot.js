const Jimp = require('jimp')
const { v4: uuidv4 } = require('uuid');
const viewPort = {width: 1920, height: 1080, deviceScaleFactor: 2}
const imgur = require('../controllers/imgurApi')

module.exports = class TwitterBot {
  #browserInstance
  #twitterClient
  #tweetId
  #userId
  constructor(browserInstance, twitterClient, tweetId, userId) {
    this.#browserInstance = browserInstance
    this.#twitterClient = twitterClient
    this.#tweetId = tweetId
    this.#userId = userId
  }

  async start() {
    console.log("adli işlemler başlatıldı")
    let imagePath = await this.#takeScreenshot()
    console.log("Image Path: ", imagePath)
    let crop = await this.#imageCrop(imagePath)
    console.log("Image Cropped: ", crop)
    let imageLink = await imgur.uploadImage(imagePath)
    console.log("Image Uploaded", imageLink)
    let dm = await this.#postDirectMessage(imageLink)
    console.log("Direct Message Posted: ", dm)
    return true

  }
 
  static async checkMentions(twitterClient, lastMention){
    const options = {since_id: lastMention, trim_user: true}
    return await twitterClient.tweets.statusesMentionsTimeline(options)
  }

  async #takeScreenshot() {
    const imagesHaveLoaded = async () => {
      return Array.from(document.querySelectorAll('iframe')[0].contentDocument.images).every((i) => i.complete)
    }
    const browser = await this.#browserInstance
    const html = '<div id="container"></div>'
    const imagePath = `tests/${this.#tweetId}${uuidv4()}.png`
    const screenshotOptions = {path: imagePath, fullPage: true, omitBackground: true}
    const tweetOptions = JSON.stringify({theme: 'dark', align: 'center'}).toString()
    const page = await browser.newPage()
    await page.setViewport(viewPort);
    await page.setContent(html)
    await page.addScriptTag({path: './public/javascripts/widgets.js'});
    const evalString = `twttr.widgets.createTweet("${this.#tweetId}", document.getElementById("container"), ${tweetOptions})`
    await page.evaluate(evalString)
    await page.waitForFunction(imagesHaveLoaded)
    await page.screenshot(screenshotOptions);
    await page.close()
    return imagePath
  }
  async #postDirectMessage(link) {
    const event = {
      message_create: {
        target: {
          recipient_id: "1299470533197787136"
        },
        message_data: {
          text: `Screenshot link: ${link}`
        }
      },
      type: "message_create"
    }
    await this.#twitterClient.directMessages.eventsNew({event})
    return true
  }

  async #imageCrop(imagePath) {
    let image = await Jimp.read(imagePath)
    let crop = await image.autocrop().writeAsync(imagePath)
    return true
  }
}