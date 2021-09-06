const APP_ID = "<APP_ID>";
const API_TOKEN = "<API_TOKEN>";
const USER_LIMIT = 10;
const GDPR_REQUEST_LIMIT = 100;
// https://sendbird.com/docs/chat/v3/platform-api/guides/rate-limits#2-plan-based-limits
const REQUEST_THROTTLING_TIMEOUT = 100;
const CSV_FILE_PATH = "./data.csv";
const CSV_COLUMN_NAMES = [
  "Request ID",
  "User ID",
  "Action",
  "Request created at",
  "File",
  "Status",
]

module.exports = {
  APP_ID,
  API_TOKEN,
  USER_LIMIT,
  GDPR_REQUEST_LIMIT,
  REQUEST_THROTTLING_TIMEOUT,
  CSV_FILE_PATH,
  CSV_COLUMN_NAMES
}