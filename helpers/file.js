// Engin Yüksel
// 15.06.2021 17:54
const fs = require('fs')
const fileName = 'user.json'

const readJSON = async () => {
  const data = await fs.readFileSync(fileName, 'utf-8')
  return JSON.parse(data.toString())
}

const writeJSON = async (data) => {
  const json = await readJSON()
  for (const [key, value] of Object.entries(data)) {
    json[key] = value
  }
  await fs.writeFileSync(fileName, JSON.stringify(json))
  return true
}

module.exports = {readJSON, writeJSON}