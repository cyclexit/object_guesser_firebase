const fs = require('fs');

// NOTE: `parent_id` and `root_id` will be replaced by hash id from firebase in the end
//        and `id` will be added as the firebase hash id
const rawData = fs.readFileSync('labels.json');
const labels = JSON.parse(rawData);
console.log(labels);
