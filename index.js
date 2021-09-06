const fs = require('fs');
const getUsers = require('./getUsers');
const { CSV_FILE_PATH, CSV_COLUMN_NAMES } = require('./constants');

(function init() {
  // initialise csv file - will delete all previous data
  fs.writeFile(CSV_FILE_PATH, CSV_COLUMN_NAMES.join(', ') + "\n", (err) => {
    if (!err) {
      console.log('\n✅ Write header success');
    }
    else {
      console.log('\n❌ Write header error');
    }
  })

  // begin fetching
  getUsers()
})()