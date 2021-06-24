require('dotenv').config()
const axios = require('axios')
const addOAuthInterceptor  = require('axios-oauth-1.0a').default
const mentionURL = `https://api.twitter.com/2/users/${process.env.USER_ID}/mentions`
const dmURL = 'https://api.twitter.com/1.1/direct_messages/events/new.json'
const bearerToken = `Bearer ${process.env.BEARER}`
const winston = require('winston')

const getMentions = async (params) => {
  const config = {
    method: 'get',
    url: mentionURL,
    headers: {
      'Authorization': bearerToken,
    },
    params: params
  }
  let res
  try {
    res = await axios(config)

  } catch (err) {
    winston.error({timestamp: new Date().toString(), error: err, type: 'mentions'})
    return false
  }
  return res.data
}
const postDirectMessage = async (event) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    }
  }
  const client = axios.create();

  const options = {
    algorithm: 'HMAC-SHA1',
    includeBodyHash: false,
    key: `${process.env.API_KEY}`,
    secret: `${process.env.API_SECRET}`,
    token: `${process.env.ACCESS_TOKEN}`,
    tokenSecret: `${process.env.ACCESS_TOKEN_SECRET}`
  }
  addOAuthInterceptor(client, options)

  let res
  try {
    res = await client.post(dmURL, {event}, config)

  } catch (err) {
    winston.error({timestamp: new Date().toString(), error: err, type: 'directmessage'})
    return false
  }
  return res.data

}
module.exports = {getMentions, postDirectMessage}
