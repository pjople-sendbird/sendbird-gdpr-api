const fs = require('fs')
const getUsers = require('./getUsers');
const {
  COMPLETED_REQUESTS_FILE_PATH,
  COMPLETED_REQUESTS_CSV_FILE_PATH,
  JSON_FILE_PATH
} = require('./constants');

(async function init() {
  // initialise output files - create them if they don't exist
  try {
    await fs.promises.readFile(JSON_FILE_PATH)
  } catch (_) {
    await fs.promises.writeFile(JSON_FILE_PATH, JSON.stringify({requests: []}))
  }
  try {
    await fs.promises.readFile(COMPLETED_REQUESTS_FILE_PATH)
  } catch (_) {
    await fs.promises.writeFile(COMPLETED_REQUESTS_FILE_PATH, JSON.stringify({requests: []}))
  }
  try {
    await fs.promises.readFile(COMPLETED_REQUESTS_CSV_FILE_PATH)
  } catch (_) {
    await fs.promises.writeFile(COMPLETED_REQUESTS_CSV_FILE_PATH, '')
  }

  // begin fetching users
  getUsers()
})()
