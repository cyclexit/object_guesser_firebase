const fs = require('fs');
const admin = require('firebase-admin');
const glob = require('glob');

const IMAGES = "images";
const ADMIN_LABEL_RECORDS = "admin_label_records";

admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
})
const db = admin.firestore();
const imagesCollection = db.collection(IMAGES);
const adminLabelRecordsCollection = db.collection(ADMIN_LABEL_RECORDS);

const uploadImages = async(jsonData) => {
    const imageDataList = jsonData["images"];
    var imageToLabel = {};
    for (const imageData of imageDataList) {
        const ref = imagesCollection.doc();
        var img = {};
        img["id"] = ref.id;
        img["url"] = imageData["url"];
        imageToLabel[img["id"]] = imageData["label"];
        await ref.set(img, {merge: true});
        console.log("Image Done: ", img);
    }
    return imageToLabel;
}

const updateLabelId = async(imageToLabel) => {
    console.log(imageToLabel); // debug
}

glob("*.json", (error, files) => {
    if (error) {
        console.log(error);
        return;
    }
    for (const f of files) {
        const rawData = fs.readFileSync(f);
        const jsonData = JSON.parse(rawData);
        uploadImages(jsonData).then(
            imageToLabel => updateLabelId(imageToLabel)
        );
    }
});
