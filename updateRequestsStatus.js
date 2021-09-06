const fs = require('fs');
const fetch = require('node-fetch');
const { APP_ID, API_TOKEN, GDPR_REQUEST_LIMIT, REQUEST_THROTTLING_TIMEOUT, CSV_FILE_PATH } = require('./constants');
const readline = require('readline');
const { spaces } = require('./utils.js');

async function updateRequestsStatus(_next = null) {
  const apiRoute = `https://api-${APP_ID}.sendbird.com/v3/privacy/gdpr?limit=${GDPR_REQUEST_LIMIT}${_next ? `&token=${_next}` : ''}`

  const response = await fetch(apiRoute, {
    method: "GET",
    headers: { 'Api-Token': API_TOKEN }
  })

  if (response.status !== 200) {
    console.log("\n❌ Failed request: ", response.status + " - " + response.statusText)
    return
  }

  const { requests, next } = await response.json()
  console.log(`\nℹ️ Retrieved ${requests.length} requests.`);

  const data = requests.map(({
    request_id,
    user_ids,
    user_id,
    created_at,
    action,
    status,
    files
  }) => ({
    request_id,
    user_ids: user_ids && user_ids.length ? [...user_ids] : [user_id],
    action,
    file: files?.url,
    status,
    created_at: new Date(created_at).toLocaleString()
  }))

  await updateCsvWithRequestStatus(data)

  setTimeout(async function (next) {
    if (next) {
      await updateRequestsStatus(next)
    }
  }.bind(this, next), REQUEST_THROTTLING_TIMEOUT)
}

// update each request_id in csv file with its status
function updateCsvWithRequestStatus(updatedData) {
  return new Promise(resolve => {
    const readStream = fs.createReadStream(CSV_FILE_PATH, "utf8");
    const lineReader = readline.createInterface({ input: readStream });
    let fileLengthRead = 0

    lineReader.on('line', function (line) {
      lineReader.pause()
      const matches = line.match(/[^,]+[a-z]*$/g)
      const updatedRequest = updatedData.find(request => line.indexOf(request.request_id) !== -1)
      const prevStatus = matches && matches[0].trim().replace("\n", '')
      const currStatus = updatedRequest?.status
      if (matches
        && matches.length
        && updatedRequest
        && prevStatus !== currStatus
      ) {
        console.log(`\nℹ️ Updating status for request ${updatedRequest.request_id}: ${prevStatus} ➡ ${currStatus}`);
        var updatedLine = line.replace(prevStatus, currStatus + spaces(prevStatus, currStatus))

        if (currStatus === 'done') {
          updatedLine = updatedLine.replace('N/A', updatedRequest.file.toString())
        }

        const writeFile = fs.openSync(CSV_FILE_PATH, 'r+');
        fs.writeSync(writeFile, updatedLine, fileLengthRead + 1, 'utf-8');
        fs.close(writeFile)
        fileLengthRead += updatedLine.length
        lineReader.resume()
      } else {
        fileLengthRead += line.length
        lineReader.resume()
      }
    });

    lineReader.on('close', () => {
      resolve()
    })
  })
}

updateRequestsStatus()
