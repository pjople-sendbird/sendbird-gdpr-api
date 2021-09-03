const fetch = require('node-fetch');
const { APP_ID, API_TOKEN, REQUEST_THROTTLING_TIMEOUT } = require('./constants');
const { writeToFile } = require('./utils.js')

module.exports = async function registerAccessRequestsForUsers(users = []) {
  if (!users.length) {
    return
  }
  const user = users.pop(); // get last item in array - mutates the array
  console.log(`\nℹ️ Registering data access request for user ${user.user_id} .`);

  const apiRoute = `https://api-${APP_ID}.sendbird.com/v3/privacy/gdpr`

  const response = await fetch(apiRoute, {
    method: "POST",
    headers: { 'Api-Token': API_TOKEN },
    body: JSON.parse({
      action: 'access',
      user_id: user.user_id,
    })
  })

  if (response.status !== 200) {
    console.log("\n❌ Failed request: ", response.status + " - " + response.statusText)
    return
  }

  const { request_id, user_id, status, created_at, action } = await response.json()
  console.log(`\nℹ️ New '${action}' request with
    request_id: '${request_id}', status: '${status}' for user_id: '${user_id}'`);

  const data = {
    request_id,
    user_id,
    action,
    created_at: new Date(created_at).toLocaleString()
  }

  writeToFile(data, (result) => {
    console.log(result)
  })

  setTimeout(async function (users) {
    await registerAccessRequestsForUsers(users)
  }.bind(this, users), REQUEST_THROTTLING_TIMEOUT)
}