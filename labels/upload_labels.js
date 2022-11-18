const fs = require('fs');

// NOTE: `parent_id` and `root_id` will be replaced by hash id from firebase in the end
//        and `id` will be added as the firebase hash id
const rawData = fs.readFileSync('labels.json');
const labels = JSON.parse(rawData);

const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
})
const db = admin.firestore();
const collection = db.collection(labels["collection_name"]);

const uploadAll = async() => {
    const nameToId = {};
    for (const label of labels["labels"]) {
        const ref = collection.doc();
        // add the hash id from firebase
        label["id"] = ref.id;
        nameToId[label["name"]] = ref.id;
        await ref.set(label, {merge: true});
    }
    return nameToId;
}

const updateIds = async(nameToId) => {
    console.log(nameToId);
    for (const [_, id] of Object.entries(nameToId)) {
        const ref = collection.doc(id);
        const label = await ref.get().then(v => v.data());
        parentName = label["parent_id"];
        rootName = label["root_id"];
        label["parent_id"] = nameToId[parentName];
        label["root_id"] = nameToId[rootName];
        await ref.set(label, {merge: true});
        console.log("Done:", label);
    }
}

uploadAll().then(nameToId => {
    updateIds(nameToId);
});
