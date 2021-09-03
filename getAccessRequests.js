const fetch = require('node-fetch');
const { APP_ID, API_TOKEN, GDPR_REQUEST_LIMIT, REQUEST_THROTTLING_TIMEOUT } = require('./constants');
const { writeToFile } = require('./utils.js')

module.exports = async function getAccessRequests(_next = null) {
  const apiRoute = `https://api-${APP_ID}.sendbird.com/v3/privacy/gdpr?limit=${GDPR_REQUEST_LIMIT}${_next ? `&token=${_next}` : ''}`

  const response = await fetch(apiRoute, {
    method: "GET",
    headers: { 'Api-Token': API_TOKEN }
  })

  if (response.status !== 200) {
    console.log("\n❌ Failed request: ", response.status + " - " + response.statusText)
    return
  }

  const { requests } = await response.json()
  console.log(`\nℹ️ Retrieved ${requests.length} requests.`);

  const data = requests.map((
    request_id,
    user_ids,
    user_id,
    created_at,
    action,
    files
  ) => ({
    request_id,
    user_ids: user_ids ? [...user_ids] : [user_id],
    action,
    file: files.url,
    created_at: new Date(created_at).toLocaleString()
  }))

  // TODO configure second csv file for listing the requests
  // writeToFile(data, (result) => {
  //   console.log(result)
  // })

  setTimeout(async function (next) {
    await getAccessRequests(next)
  }.bind(this, next), REQUEST_THROTTLING_TIMEOUT)
}