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

const getCorrectAnswers = (id, labels) => {
    // points: 100, 50, 25, ...
    const MAX_POINTS = 100;
    // one correct answer looks like: {"label": {...}, "points": 100}
    var correctAnswers = [];
    var curId = id;
    var dist = 1;
    while (true) {
        var correctAnswer = {};
        correctAnswer["label"] = labels[curId];
        correctAnswer["points"] = Math.floor(MAX_POINTS / dist);
        correctAnswers.push(correctAnswer);
        dist *= 2;
        curId = labels[curId]["parent_id"];
        if (labels[curId]["root_id"] === curId) {
            var rootAnswer = {};
            rootAnswer["label"] = labels[curId];
            rootAnswer["points"] = Math.floor(MAX_POINTS / dist);
            correctAnswers.push(rootAnswer);
            break;
        }
    }
    console.log(correctAnswer);
    return correctAnswers;
}

const generateQuizzes = async(imageLabelRecords, labels) => {
    var allJsonData = {"quizzes": []}; // written to the file for the debug purpose
    for (const rec of imageLabelRecords) {
        var quiz = {};
        quiz["image_id"] = rec["image_id"];
        quiz["category_id"] = labels[rec["label_id"]]["root_id"];
        quiz["correct_answers"] = getCorrectAnswers(rec["label_id"], labels);
        allJsonData["quizzes"].push(quiz);
    }
    console.log(allJsonData);
    fs.writeFileSync("input_quizzes.json", JSON.stringify(allJsonData, null, 4));
    return allJsonData;
}

getData().then(data => {
    const imageLabelRecords = data["imageLabelRecords"];
    const labels = data["labels"];
    generateQuizzes(imageLabelRecords, labels);
});
