const fetch = require('node-fetch');
const { APP_ID, API_TOKEN, USER_LIMIT, REQUEST_THROTTLING_TIMEOUT } = require('./constants');
const registerAccessRequestsForUsers = require('./registerAccessRequestsForUsers');

module.exports = async function retrieveUsers(_next = null) {
  const apiRoute = `https://api-${APP_ID}.sendbird.com/v3/users?active_mode=all&show_bot=${true}&limit=${USER_LIMIT}${_next ? `&token=${_next}` : ''}`

  const response = await fetch(apiRoute, {
    method: "GET",
    headers: { 'Api-Token': API_TOKEN }
  })

  if (response.status !== 200) {
    console.log("\n❌ Failed request: ", response.status + " - " + response.statusText)
    return
  }

  const { users, next } = await response.json()
  console.log(`\nℹ️ ${users.length} users successfully fetched.`);

  // start registering access requests for all users
  await registerAccessRequestsForUsers(users)
  if (next) {
    // delay next call to fetch next batch of users by:
    // REQUEST_THROTTLING_TIMEOUT * amount of users
    // (after 16 minutes for throttling timeout of 10 seconds and 100 users)
    setTimeout(async function (next) {
      await retrieveUsers(next)
    }.bind(this, next), REQUEST_THROTTLING_TIMEOUT * users.length)
  }
}
