const fetch = require('node-fetch');
const fs = require('fs');
const {
  JSON_FILE_PATH,
  JSON_FILENAME,
  APP_ID,
  API_TOKEN,
  REQUEST_THROTTLING_TIMEOUT
} = require('./constants');

async function cancelRequest(requests) {
  if (!requests.length) {
    return
  }
  const request = requests.pop()
  const apiRoute = `https://api-${APP_ID}.sendbird.com/v3/privacy/gdpr/${request.requestId}`

  const response = await fetch(apiRoute, {
    method: "DELETE",
    headers: { 'Api-Token': API_TOKEN }
  })

  if (response.status !== 200) {
    console.log("\n❌ Failed DELETE request: ", response.status + " - " + response.statusText)
    return
  }

  console.log("\n✅ Cancelled request: ", request.requestId)

  setTimeout(async function (requests) {
    await cancelRequest(requests)
  }.bind(this, requests), REQUEST_THROTTLING_TIMEOUT)
}

(async function init() {
  // cancel all requests
  await new Promise(async function resolve {
    fs.readFile(JSON_FILE_PATH, async function (err, existingData) {
      if (err) {
        resolve(`\n❌ ${JSON_FILENAME} file read error`)
      } else {
        var json = JSON.parse(existingData)
        if (json.requests && json.requests.length) {
          await cancelRequest(json.requests)
          resolve()
        }
      }
    })
  })
})()