const fs = require('fs')
const { CSV_FILE_PATH } = require('./constants');

function spaces(prev, curr) {
  if (prev.length < curr.length - 1) {
    return ""
  }

  const numberOfSpaces = prev.length - curr.length + 1
  const tempArray = new Array(numberOfSpaces)
  return tempArray.join(" ") + '\n'
}

function getCommaSeparatedData(data) {
  return `${data.request_id}, ${data.user_id}, ${data.action}, ${data.created_at}, ${data.file || 'N/A'}, ${data.status}\n`
}

function writeToFile(data = {}, callback) {
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

module.exports = {
  spaces,
  getCommaSeparatedData,
  writeToFile
}