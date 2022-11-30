const fs = require('fs');
const admin = require('firebase-admin');
const { assert } = require('console');

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

    var labels = {};
    labelSnapshot.docs.forEach(doc => {
        data = doc.data();
        labels[data["id"]] = data;
    })
    return {
        "imageLabelRecords": imageLabelRecordSnapshot.docs.map(doc => doc.data()),
        "labels": labels,
        "images": imageSnapshot.docs.map(doc => doc.data()),
    };
}

// shuffled and select the first 9 images
const getNineImages = (images) => {
    const TOTAL_IMAGES = 9;
    const shuffledImages = images.sort((a, b) => 0.5 - Math.random());
    const nineImages = shuffledImages.slice(0, TOTAL_IMAGES);
    return nineImages;
}

const generateQuizzes = async(nineImages) => {

}

// execution starts here
getData().then(data => {
    const imageLabelRecords = data["imageLabelRecords"];
    const labels = data["labels"];
    const images = data["images"];

    // console.log("original: ", images);
    // for (var i = 0; i < 1; ++i) {
    //     const nineImages = getNineImages(images);
    //     // assert(nineImages.length === 9);
    //     console.log(nineImages.length);
    //     console.log(`${i}: `, nineImages);
    // }
    // generateQuizzes(imageLabelRecords, labels);
});
