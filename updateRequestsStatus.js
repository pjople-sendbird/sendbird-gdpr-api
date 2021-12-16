const fs = require('fs');
const fetch = require('node-fetch');
const {
  JSON_FILE_PATH,
  JSON_FILENAME,
  APP_ID,
  API_TOKEN,
  REQUEST_THROTTLING_TIMEOUT,
} = require('./constants');
const { appendToFile, formatDateString, exportToCsv } = require('./utils');

async function updateRequestsStatus(requests, index = 0) {
  const { requestId } = requests[index]
  console.log(`\nℹ️ Checking request with ID: ${requestId}`);

  const apiRoute = `https://api-${APP_ID}.sendbird.com/v3/privacy/gdpr/${requestId}`

  const response = await fetch(apiRoute, {
    method: "GET",
    headers: { 'Api-Token': API_TOKEN }
  })

  if (response.status !== 200) {
    console.log("\n❌ Failed request: ", response.status + " - " + response.statusText)
    if (response.status === 400) {
      const { message } = await response.json()
      console.log(`❌ Error message: ${message}`)
    }
    return
  }

  const { status, files } = await response.json()

  await appendToFile({
    status,
    files: {
      ...files,
      expires_at: formatDateString(files.expires_at)
    },
    requestId
  })

  setTimeout(async function (index) {
    if (index < requests.length - 1) {
      index++
      await updateRequestsStatus(requests, index)
    } else {
      console.log(`\n✅ Finished checking ${requests.length} request(s)!`);
      exportToCsv()
    }
  }.bind(this, index), REQUEST_THROTTLING_TIMEOUT)
}

// begin script here by reading the previously saved data in .json file
fs.readFile(JSON_FILE_PATH, async function (err, data) {
  if (err) {
    resolve(`\n❌ ${JSON_FILENAME} file read error`)
    return
  }
  const json = JSON.parse(data)
  if (json.requests && json.requests.length) {
    console.log(`\nℹ️ Checking ${json.requests.length} request(s).`);
    await updateRequestsStatus(json.requests)
  }
})