const fs = require('fs');
const fetch = require('node-fetch');
const { APP_ID, API_TOKEN, REQUEST_THROTTLING_TIMEOUT } = require('./constants');
const { appendToFile, formatDateString, exportForUserWasRequested } = require('./utils.js')

module.exports = async function registerAccessRequestsForUsers(users = []) {
  if (!users.length) {
    return
  }
  const user = users.pop(); // get last item in array - mutates the array
  const userWasRequested = await exportForUserWasRequested(user.user_id);

  if (userWasRequested) {
    console.log(`\nℹ️  Export for user ${user.user_id} has already been requested!`);
    setTimeout(async function (users) {
      await registerAccessRequestsForUsers(users)
      // Rate limits for POST requests are limited twice as much as GET requests
      // https://sendbird.com/docs/chat/v3/platform-api/guides/rate-limits#2-plan-based-limits
    }.bind(this, users), REQUEST_THROTTLING_TIMEOUT * 2)
    return
  }

  console.log(`\nℹ️  Registering data access request for user ${user.user_id}`);

  const apiRoute = `https://api-${APP_ID}.sendbird.com/v3/privacy/gdpr`
  const response = await fetch(apiRoute, {
    method: "POST",
    headers: { 'Api-Token': API_TOKEN },
    body: JSON.stringify({
      action: 'access',
      user_id: user.user_id,
    })
  })

  if (response.status !== 200) {
    console.log("\n❌  Failed request: ", response.status + " - " + response.statusText)
    if (response.status === 429) {
      console.log("\n⏳  Waiting for request throttling timeout for user: ", user.user_id)
      setTimeout(async function (users) {
        await registerAccessRequestsForUsers(users)
      }.bind(this, [...users, user]), REQUEST_THROTTLING_TIMEOUT * 3)
    }
    return
  }

  const { request_id, user_id, status, created_at, action } = await response.json()
  console.log(`\nℹ️  New '${action}' request with
    request_id: '${request_id}', status: '${status}' for user_id: '${user_id}'`);

  const data = {
    requestId: request_id,
    user_id,
    action,
    status,
    created_at: formatDateString(created_at),
  }

  const result = await appendToFile(data)
  console.log(result)

  setTimeout(async function (users) {
    await registerAccessRequestsForUsers(users)
    // Rate limits for POST requests are limited twice as much as GET requests
    // https://sendbird.com/docs/chat/v3/platform-api/guides/rate-limits#2-plan-based-limits
  }.bind(this, users), REQUEST_THROTTLING_TIMEOUT)
}
