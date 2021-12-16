# [Sendbird Data privacy Platform API docs](https://sendbird.com/docs/chat/v3/platform-api/guides/data-privacy)


> This script is useed to **register GDPR data access requests** to the Sendbird API and **export JSON and CSV files** with all the requests and their statuses.

> The **Sendbird GDPR API** is used for this script. Learn more about it in the [documentation](https://sendbird.com/docs/chat/v3/platform-api/guides/data-privacy).

The exported data contains all information that is held by Sendbird for each user for a specific Application ID.
The output from the API is a URL that points to a zip folder that contains json files - [example output format](https://drive.google.com/drive/folders/1IbWr5RAe70WUrkKgAHjY0OZ-6osEVE1j?usp=sharing).

## Run


1. Add your App ID and API token in the `APP_ID` and `API_TOKEN` variables respectively inside the `constants.js` file.
    > You can get your own Application ID and API token from the [Sendbird Dashboard](https://dashboard.sendbird.com/) after you have selected your Application from the top left dropdown and under **Settings**.

2. Install node dependencies by running the following from the root of the project

    ```sh
    npm i
    ```

3. From the root directory of this project run inside the terminal the following to start registering data access requests for all users:

    ```bash
    node index.js
    ```

4.  When registering a GDPR data access request with the Sendbird GDPR API, the data request is returned with the HTTP response along with its details (i.e. request ID, status, creation date). This data is then stored by the script in a json file locally called `export-requests.json`. To change the filename alter the `JSON_FILENAME` varialbe inside of the `constants.js` file.

    > All JSON and CSV files will be automatically generated if they do not already exist.

5. At this point, once the above script has finished, Sendbird servers are busy extracting and zipping all the requested information. It generally takes from 1 to 3 hours for the exports to be completed.

6. Since we can't get a notification about when the exports are ready we need to check proactively using the following command:

    ```bash
    node updateRequestsStatus.js
    ```

    The above command will check all registered requests inside the `export-requests.json` file and will output any completed ones in the `completed-requests.json` and `completed-requests.csv` files in JSON and CSV formats respectively. To change the filenames alter the `COMPLETED_REQUESTS_FILENAME` and `COMPLETED_REQUESTS_CSV_FILENAME` variables inside the `constants.js` file respectively.

7. Once the requests have been written in the above `completed-requests.json` and `completed-requests.csv` files, you can import the CSV file inside a spreadsheet or simply use the JSON file in another program to download all zip folders by requesting the URL saved at `requests[].files.url` for each request inside the JSON file.


## Considerations

1. All requests used in this script to the Sendbird API are rate-limited and you can alter the request timeout with the `REQUEST_THROTTLING_TIMEOUT` variable inside the `constants.js` file. [Learn more here](https://sendbird.com/docs/chat/v3/platform-api/guides/rate-limits#2-plan-based-limits).

2. To register **`delete`** GDPR requests, change ~~`action: 'access'`~~ to `action: 'delete'` within the `registerAccessRequestsForUsers.js` file. Then change the function to register a delete action for all 100 users (max) in a single API call (use `user_ids` instead of `user_id` in the request body).

3. To delete all data access requests, simply run the following from the root of the project:

    ```sh
    node cancelRequests.js
    ```