# object_guesser_firebase
Firebase scripts for the project object_guesser

## User Guide
Require Node.js later than 10.0.

1. Run `npm install` to install required packages.
2. Go to the "Project Settings" page on your firebase. Click "Service accounts" section to generate your private key. See this [image](docs/firebase-service-account.jpg) for details.
3. Rename the downloaded json file as `credentials.json` and place it under this project root directory.
4. Run the scripts in the order
   1. `node ./labels/upload_labels.js`
   2. `node ./images/upload_images.js`
