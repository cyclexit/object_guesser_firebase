// This script does NOT generate the quizzes completely randomly.
// If this script is re-used, please do the duplication check!

const fs = require('fs');
const admin = require('firebase-admin');

const LABELS = "labels";
const IMAGE_LABEL_RECORDS = "image_label_records";
const MULTIPLE_CHOICE_QUIZZES = "multiple_choice_quizzes";

admin.initializeApp({
    credential: admin.credential.cert(require('../../credentials.json'))
})
const db = admin.firestore();
const labelsCollection = db.collection(LABELS); // get all correct answers
const imageLabelRecordsCollection = db.collection(IMAGE_LABEL_RECORDS); // get category_id
const multipleChoiceQuizzesCollection = db.collection(MULTIPLE_CHOICE_QUIZZES);

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
    // points: 200, 100, 50, ...
    const MAX_POINTS = 200;
    // one correct answer looks like: {"label": {...}, "points": 100}
    var correctAnswers = [];
    var curId = id;
    var dist = 1;
    while (true) {
        var correctAnswer = {};
        correctAnswer["label_id"] = curId;
        correctAnswer["points"] = Math.floor(MAX_POINTS / dist);
        correctAnswers.push(correctAnswer);
        dist *= 2;
        curId = labels[curId]["parent_id"];
        if (labels[curId]["root_id"] === curId) {
            var rootAnswer = {};
            rootAnswer["label_id"] = curId;
            rootAnswer["points"] = Math.floor(MAX_POINTS / dist);
            correctAnswers.push(rootAnswer);
            break;
        }
    }
    // console.log(correctAnswer);
    return correctAnswers;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const generateChoices = (correctAnswers, labels) => {
    const TOTAL_CHOICES = 4;
    const CORRECT_CHOICES = getRandomIntInclusive(1, Math.min(3, correctAnswers.length));
    const WRONG_CHOICES = TOTAL_CHOICES - CORRECT_CHOICES;

    var choices = [];
    // add correct choices
    var pickedIds = [];
    for (var i = 0; i < CORRECT_CHOICES; ++i) {
        choices.push(correctAnswers[i]["label_id"]);
        pickedIds.push(correctAnswers[i]["label_id"]);
    }

    // add wrong choices
    const labelIds = Object.keys(labels);
    // console.log(labelIds);
    for (var i = 0; i < WRONG_CHOICES; ++i) {
        var randomIdx = getRandomIntInclusive(0, labelIds.length - 1);
        while (pickedIds.includes(labelIds[randomIdx])) {
            randomIdx = getRandomIntInclusive(0, labelIds.length - 1);
        }
        choices.push(labelIds[randomIdx]);
        pickedIds.push(labelIds[randomIdx]);
    }

    return choices;
}

const generateQuizzes = async(imageLabelRecords, labels) => {
    var allJsonData = {"quizzes": []}; // for the debug purpose
    for (const rec of imageLabelRecords) {
        var quiz = {};
        quiz["image_id"] = rec["image_id"];
        quiz["category_id"] = labels[rec["label_id"]]["root_id"];
        const correctAnswers = getCorrectAnswers(rec["label_id"], labels);
        quiz["correct_answers"] = correctAnswers;
        quiz["choices"] = generateChoices(correctAnswers, labels);

        var maxPoints = 0;
        for (const ans of correctAnswers) {
            if (quiz["choices"].includes(ans["label_id"])) {
                maxPoints = Math.max(maxPoints, ans["points"]);
            }
        }
        quiz["max_points"] = maxPoints;

        const ref = multipleChoiceQuizzesCollection.doc();
        quiz["id"] = ref.id;
        await ref.set(quiz, {merge: true});
        allJsonData["quizzes"].push(quiz);
    }
    console.log(allJsonData);
    fs.writeFileSync(MULTIPLE_CHOICE_QUIZZES.concat(".json"), JSON.stringify(allJsonData, null, 4));
    return allJsonData;
}

getData().then(data => {
    const imageLabelRecords = data["imageLabelRecords"];
    const labels = data["labels"];
    generateQuizzes(imageLabelRecords, labels);
});
