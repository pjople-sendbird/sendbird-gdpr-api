const fs = require('fs')
const { CSV_FILE_PATH } = require('./constants');

module.exports.getCommaSeparatedData = function (data) {
  return `${data.request_id}, ${data.user_id}, ${data.action}, ${data.created_at}\n`
}

module.exports.writeToFile = function (data = {}, callback) {
  if (!Object.keys(data).length) {
    return
  }
  fs.appendFile(CSV_FILE_PATH, getCommaSeparatedData(data), (err) => {
    if (!err) {
      callback('\n✅ Write success');
    }
    else {
      callback('\n❌ Write error');
    }
  });
}
