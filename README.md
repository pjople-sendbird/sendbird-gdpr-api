# [Sendbird Data privacy Platform API docs](https://sendbird.com/docs/chat/v3/platform-api/guides/data-privacy)

## Important information

1. This script is converting the responses from the API to CSV format and outputs it to a `data.csv` file which keeps record of all the requests and their statuses. However, for requesting exported data from the Sendbird API, the output zip folders will be `.json` files ([example output format](https://drive.google.com/drive/folders/1IbWr5RAe70WUrkKgAHjY0OZ-6osEVE1j?usp=sharing)).

2. All requests used in this script to the Sendbird API are rate-limited. [Learn more here](https://sendbird.com/docs/chat/v3/platform-api/guides/rate-limits#2-plan-based-limits).

3. To register **`delete`** GDPR requests, change ~~`action: 'access'`~~ to `action: 'delete'` within the `registerAccessRequestsForUsers.js` file. Then change the function to register a delete action for all 100 users (max) in a single API call (use `user_ids` instead of `user_id` in the request body ).

## Install

From the root directory of this project run inside the terminal:

```bash
npm i
```

## Run

1. Update the `constants.js` file with your `APP_ID` and `API_TOKEN`

2. From the root directory of this project run inside the terminal:

    ```bash
    node index.js
    ```

3. Once the previous command is finished, run the following to fetch and update the output CSV file with requests' statuses

    ```bash
    node updateRequestsStatus.js
    ```