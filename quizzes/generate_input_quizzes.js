const fs = require('fs');
const admin = require('firebase-admin');

const LABELS = "labels";
const INPUT_QUIZZES = "input_quizzes";
const IMAGE_LABEL_RECORDS = "image_label_records";

admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
})
const db = admin.firestore();
const labelsCollection = db.collection(LABELS); // get all correct answers
const imageLabelRecordsCollection = db.collection(IMAGE_LABEL_RECORDS); // get category_id
const inputQuizzesCollection = db.collection(INPUT_QUIZZES);

// generate the quiz for labelled images
const getData = async() => {
    const imageLabelRecordSnapshot = await imageLabelRecordsCollection.get();
    const labelSnapshot = await labelsCollection.get();
    var labels = {};
    labelSnapshot.docs.forEach(doc => {
        data = doc.data();
        labels[data["id"]] = data;
    })
    return {
        "imageLabelRecords": imageLabelRecordSnapshot.docs.map(doc => doc.data()),
        "labels": labels
    };
}

const generateQuizzes = async(imageLabelRecords, labels) => {
    var allJsonData = {"quizzes": []}; // written to the file for the debug purpose
    return allJsonData;
}

getData().then(data => {
    const imageLabelRecords = data["imageLabelRecords"];
    const labels = data["labels"];
    console.log(imageLabelRecords);
    console.log(labels);
});
