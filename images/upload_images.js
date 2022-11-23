const fs = require('fs');
const admin = require('firebase-admin');
const glob = require('glob');

const IMAGES = "images";
const IMAGE_LABEL_RECORDS = "image_label_records";

admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
})
const db = admin.firestore();
const imagesCollection = db.collection(IMAGES);
const imageLabelRecordsCollection = db.collection(IMAGE_LABEL_RECORDS);

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

const uploadRecords = async(labelSnapshot, imageToLabel) => {
    // console.log(imageToLabel); // debug
    var cnt = 0;
    const INITIAL_RECORD_WEIGHT = 1000;
    for (const [imageId, labelName] of Object.entries(imageToLabel)) {
        for (const label of labelSnapshot) {
            if (label["name"] === labelName) {
                const ref = imageLabelRecordsCollection.doc();
                var record = {};
                record["id"] = ref.id;
                record["image_id"] = imageId;
                record["label_id"] = label["id"];
                record["weight"] = INITIAL_RECORD_WEIGHT
                await ref.set(record, {merge: true});
                ++cnt;
                console.log("Image Label Record Done: ", record);
                break;
            }
        }
    }
    if (cnt === Object.keys(imageToLabel).length) {
        console.log("Length verified. All images are labelled.");
    }
}

const getAllLabels = async() => {
    const labelCollection = db.collection("labels");
    const labelSnapshot = await labelCollection.get();
    return labelSnapshot.docs.map(doc => doc.data());
}

glob("*.json", (error, files) => {
    if (error) {
        console.log(error);
        return;
    }
    getAllLabels().then(labelSnapshot => {
        for (const f of files) {
            const rawData = fs.readFileSync(f);
            const jsonData = JSON.parse(rawData);
            uploadImages(jsonData).then(
                imageToLabel => uploadRecords(labelSnapshot, imageToLabel)
            );
        }
    });
});
