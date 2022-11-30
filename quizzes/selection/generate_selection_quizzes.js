const fs = require('fs');
const admin = require('firebase-admin');

const LABELS = "labels";
const IMAGE_LABEL_RECORDS = "image_label_records";
const IMAGES = "images";
const SELECTION_QUIZZES = "selection_quizzes";

admin.initializeApp({
    credential: admin.credential.cert(require('../../credentials.json'))
});
const db = admin.firestore();
const labelsCollection = db.collection(LABELS); // get all correct answers
const imageLabelRecordsCollection = db.collection(IMAGE_LABEL_RECORDS); // get category_id
const imagesCollection = db.collection(IMAGES);
const selectionQuizzes = db.collection(SELECTION_QUIZZES);

// generate the quiz for labelled images
const getData = async() => {
    const imageLabelRecordSnapshot = await imageLabelRecordsCollection.get();
    const labelSnapshot = await labelsCollection.get();
    const imageSnapshot = await imagesCollection.get();

    // {image_id: label_id}
    var imageLabelRecords = {};
    imageLabelRecordSnapshot.docs.forEach(doc => {
        const data = doc.data();
        imageLabelRecords[data["image_id"]] = data["label_id"];
    });
    var labels = {};
    labelSnapshot.docs.forEach(doc => {
        const data = doc.data();
        labels[data["id"]] = data;
    });

    return {
        "images": imageSnapshot.docs.map(doc => doc.data()),
        "imageLabelRecords": imageLabelRecords,
        "labels": labels,
    };
}

// shuffled and select the first 9 images
const getNineImages = (images) => {
    const TOTAL_IMAGES = 9;
    const shuffledImages = images.sort((a, b) => 0.5 - Math.random());
    const nineImages = shuffledImages.slice(0, TOTAL_IMAGES);
    return nineImages;
}

const getDisplayLabel = (nineImages, imageLabelRecords, labels) => {
    var labelCounter = {};
    for (const img of nineImages) {
        const imgLabelId = imageLabelRecords[img["id"]];

        var curLabelId = imgLabelId;
        // console.log(curLabelId);
        while (true) {
            if (Object.keys(labelCounter).includes(curLabelId)) {
                labelCounter[curLabelId].push(img["id"]);
            } else {
                labelCounter[curLabelId] = [img["id"]];
            }
            curLabelId = labels[curLabelId]["parent_id"];

            if (curLabelId === labels[curLabelId]["root_id"]) {
                if (Object.keys(labelCounter).includes(curLabelId)) {
                    labelCounter[curLabelId].push(img["id"]);
                } else {
                    labelCounter[curLabelId] = [img["id"]];
                }
                break;
            }
        }
    }
    console.log(labelCounter);
}

const generateQuizzes = async(images, imageLabelRecords, labels) => {
    const TOTAL_QUIZZES = 20;
    const nineImages = getNineImages(images);
    getDisplayLabel(nineImages, imageLabelRecords, labels);
}

// execution starts here
getData().then(data => {
    const images = data["images"];
    const imageLabelRecords = data["imageLabelRecords"];
    const labels = data["labels"];

    // console.log("original: ", images);
    // console.log(imageLabelRecords);
    generateQuizzes(images, imageLabelRecords, labels);
});
