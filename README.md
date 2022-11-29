# ghost-cache-adapter-cachable-s3
An S3 Storage Adapter for Ghost with built in Local or Redis Caching

WARNING: Still under heavy development. Wait until release is made before using

# Prerequisites:
- Nodejs v16
- Ghost v4+

# Installation
1. Clone the repository
2. `cd` into the project root and run the following commands:
   ```bash
   npm install
   npm run build
   ```
3. Copy contents in the `dist` folder to `content/adapters/storage/ghost-storage-adapter-cachable-s3`

# Configuration
Within your `config.production.json` or `config.development.json` file, configure the following:
```json
"adapters": {
  "storage": {
    "active": "ghost-storage-adapter-cachable-s3",
    "ghost-storage-adapter-cachable-s3": {
      "accessKeyId": "",
      "secretAccessKey": "",
      "sessionToken": "",
      "bucket": "",
      "pathPrefix": ""
    }
  }
}
```

All settings can be set also by using environment variables via Ghost's configuration environment variable syntax. See https://ghost.org/docs/config/ for details

# Developer Resources:
- https://www.stevefenton.co.uk/blog/2013/01/complex-typescript-definitions-made-easy/
- https://www.credera.com/insights/typescript-adding-custom-type-definitions-for-existing-libraries
- https://stackoverflow.com/questions/59728371/typescript-d-ts-file-not-recognized
- https://www.npmjs.com/package/redis
- https://github.com/colinmeinke/ghost-storage-adapter-s3
- https://github.com/saulogt/custom-redis-cache-adapter
- https://ghost.org/docs/config/
- https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html
- https://github.com/hvetter-de/ghost-azurestorage/blob/master/index.js