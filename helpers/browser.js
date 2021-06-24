const puppeteer = require('puppeteer')

async function startBrowser() {
  let browser
  try {
    console.log("Opening the browser...")
    browser = await puppeteer.launch({
      defaultViewport: {deviceScaleFactor: 2, width: 800, height: 600},
      args: ['--disable-web-security']
    })
  } catch (err) {
    console.log("Could not create a browser instance => : ", err)
  }
  return browser
}

module.exports = {startBrowser}