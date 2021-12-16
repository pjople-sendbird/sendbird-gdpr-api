const fs = require('fs')
const {
  JSON_FILE_PATH,
  JSON_FILENAME,
  COMPLETED_REQUESTS_FILE_PATH,
  COMPLETED_REQUESTS_CSV_FILE_PATH,
  COMPLETED_REQUESTS_CSV_FILENAME
} = require("./constants")

function appendToFile(data = {}) {
  // * data = {status, files, requestId}
  return new Promise(resolve => {
    if (!Object.keys(data).length) {
      resolve('\n❌ No data written.')
      return
    }
    // get previous data from JSON file and merge with data
    fs.readFile(JSON_FILE_PATH, function (err, existingData) {
      if (err) {
        resolve(`\n❌ ${JSON_FILENAME} file read error`)
        return
      }
      var json = JSON.parse(
        existingData?.length
          ? existingData
          : '{"requests": []}'
        )
      const existingRequest = json.requests.find(_ => _.requestId === data.requestId)
      if (data.requests && data.requests.length) {
        // merge request data
        json.requests = [...json.requests, ...data.requests]
      } else if (json.requests && existingRequest) {
        if (existingRequest.status !== data.status) {
          // merge request with updated data if it exists
          // and write to another file
          const updatedCompletedRequest = { ...existingRequest, ...data }
          updateCompletedRequests(updatedCompletedRequest).then(resolve)
        }
        return
      } else {
        // otherwise just append the new request data
        json.requests.push(data)
      }
      fs.writeFile(JSON_FILE_PATH, JSON.stringify(json), (err) => {
        resolve(err
          ? `\n❌ ${JSON_FILENAME} file write error`
          : `\n✅ ${JSON_FILENAME} file write success`);
      });
    })
  })
}

function updateCompletedRequests(request) {
  return new Promise(resolve => {
    fs.readFile(COMPLETED_REQUESTS_FILE_PATH, function (err, data) {
      if (err) {
        resolve(`\n❌ ${COMPLETED_REQUESTS_FILE_PATH} file read error`)
        return
      }

      const completedRequests = JSON.parse(
        data && data?.length
          ? data
          : '{"requests": []}'
        )
      let requestExists = false
      const updatedRequests = completedRequests.requests.map(_ => {
        if (_.requestId === request.requestId) {
          requestExists = true
          return request
        }
        return _
      })
      if (!requestExists) {
        completedRequests.requests.push(request)
      } else {
        completedRequests.requests = updatedRequests
      }

      fs.writeFile(COMPLETED_REQUESTS_FILE_PATH, JSON.stringify(completedRequests), (err) => {
        resolve(err
          ? `\n❌ ${COMPLETED_REQUESTS_FILE_PATH} file write error`
          : `\n✅ ${COMPLETED_REQUESTS_FILE_PATH} file write success`);
      });
    })
  })
}

var userExportRequests = []
function exportForUserWasRequested(userId) {
  return new Promise(resolve => {
    if (!userExportRequests.length) {
      fs.readFile(JSON_FILE_PATH, function (err, existingData) {
        if (err) {
          resolve(`\n❌ ${JSON_FILENAME} file read error`)
          return
        }
        // store requests for user in memory
        // more than one requests could have been made - 'access' and/or 'delete'
        var json = JSON.parse(existingData)
        userExportRequests = json.requests || []
        resolve(userExportRequests.find(_ => _.user_id === userId))
      })
    } else {
      resolve(userExportRequests.find(_ => _.user_id === userId))
    }
  })
}

function exportToCsv() {
  console.log(`\nℹ️ Exporting to CSV file...`);
  return new Promise(resolve => {
    fs.readFile(COMPLETED_REQUESTS_FILE_PATH, function (err, data) {
      if (err) {
        resolve(`\n❌ ${COMPLETED_REQUESTS_FILE_PATH} file read error`)
        return
      }
      const json = JSON.parse(data || '')
      let csvString = ''

      if (json.requests && json.requests.length) {
        json.requests.forEach(request => {
          csvString += `${request.requestId}, ${request.user_id}, ${request.status}, ${request.created_at}, ${request?.files?.url}, ${request?.files?.expires_at}\n`
        })
      }

      if (csvString) {
        fs.writeFile(COMPLETED_REQUESTS_CSV_FILE_PATH, csvString, (err) => {
          resolve(err
            ? `\n❌ ${COMPLETED_REQUESTS_CSV_FILENAME} file write error`
            : `\n✅ ${COMPLETED_REQUESTS_CSV_FILENAME} file write success`);
        });
      }
      console.log(`\n✅ Finished exporting to CSV file!`);
    })
  })
}

// formatted output: YYYY-MM-DD
function formatDateString(date) {
  const dateFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const parts = dateFormat.formatToParts(date);
  const formattedDateArray = []
  for (var i = parts.length - 1; i >= 0; i--) {
    if (parts[i].type !== 'literal') {
      formattedDateArray.push(parts[i].value)
    }
  }
  return formattedDateArray.join('-')
}

module.exports = {
  appendToFile,
  exportForUserWasRequested,
  exportToCsv,
  formatDateString
}