# Pipeline

Youtubers and Editors often struggle with collaborations. Uploading videos on youtube while being in travel or in low network areas, is a mountain to climb. Sharing credentials often comes with risk of losing access to account, or channel getting hacked .

Pipeline solves all of this problems in a **single solution**. 

Pipeline is a collaboration platform, where youtubers can onboard themselves on pipeline and create a team of editors, by inviting them by some coupon code. Each editor has access to upload Videos on pipeline (our platform).

Each youtuber gets list of pending videos, those uploaded videos wait for confirmation of youtubers. Once approved, on every approval, a new google OAUTH flow is initiated, thus generating fresh credentials on every upload to youtube action. After successfull upload, tokens are dumped. We as platform dont save any credentials, thus in case, if pipeline get compromised, the clients Youtube accounts remains safe, providing extra layer of security.


### Context
Worker service, handling actual video download from Cloud Provider and upload to youtube. The service is programmed in such a way that we can upload simultaneously n number of videos at single point of time. The system spins n number of workers, which individually is assigned to a single user request only.
The worker count is configurable and can be done using env variables.

## Setup

**Prerequisites:** Node.js 18+, a MongoDB instance (local or Atlas), Google APIs Service accounts, redis .

```bash
git clone https://github.com/Bhargav16exd/pipeline-service.git
cd pipeline-service
npm install
```

Create a `.env` file in the project root:

```env
PORT=port

JWT_SECRET=verysecretjwtsecret

ORIGIN_URL=http://localhost:5173

CLIENT_ID=client_id
CLIENT_SECRET=client_secret
REDIRECT_URL=http://localhost:9000/api/yt/oAuth2Callback

DATABASE_URL=db_url
DATABASE_NAME=pipeline

SERVER_TO_SERVER_TOKEN=server_to_server_token

CONCURRENCY_COUNT=1
```

Run it:

```bash
npm run dev
```

## More Technical Details are available here :  
```bash
https://app.notion.com/p/Projects-39072e56834880f8a442c07055654eec
```

## Author

Built by [**Bhargav16exd**](https://github.com/Bhargav16exd). Issues and PRs welcome if something looks off.