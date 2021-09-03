const getUsers = require('./getUsers');

(function init() {
  // initialise csv file - will delete all previous data
  fs.writeFile(csvFilePath, "Request ID, User ID, Action, Request created at\n", (err) => {
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