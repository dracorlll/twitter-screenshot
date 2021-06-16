require('dotenv').config()
const axios = require('axios');
const FormData = require('form-data');
const options = require('../helpers/file')
const Jimp = require('jimp')

const generateAccessToken = async () => {
  const form = new FormData();
  const data = await options.readJSON()
  form.append('refresh_token', data.refresh_token);
  form.append('client_id', process.env.CLIENT_ID);
  form.append('client_secret', process.env.CLIENT_SECRET);
  form.append('grant_type', 'refresh_token');
  const config = {
    method: 'post',
    url: 'https://api.imgur.com/oauth2/token',
    headers: {
      ...form.getHeaders()
    },
    data : form
  };
  const res = await axios(config)
  options.writeJSON(res.data)
}

const uploadImage = async (imagePath) => {
  const form = new FormData();
  const data = await options.readJSON()
  const image = await Jimp.read(imagePath)
  const buff = await image.getBufferAsync(Jimp.MIME_PNG)
  form.append('image', buff);
  form.append('album', 'NWoVTzS');
  const config = {
    method: 'post',
    url: 'https://api.imgur.com/3/image',
    responseType: 'json',
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
      ...form.getHeaders()
    },
    data : form
  };

  const res = await axios(config)
  return res.data.data.link

}
module.exports = {generateAccessToken, uploadImage}
