// This script generates the quizzes completely randomly.
// Hence, this script can be reused without any duplication check.

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
const selectionQuizzesCollection = db.collection(SELECTION_QUIZZES);

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

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const getDisplayLabelAndCorrectAnswers = (nineImages, imageLabelRecords, labels) => {
    // {label_id: [correct_image_ids, ...]}
    var labelToImages = {};
    for (const img of nineImages) {
        const imgLabelId = imageLabelRecords[img["id"]];

        var curLabelId = imgLabelId;
        // console.log(curLabelId);
        while (true) {
            if (Object.keys(labelToImages).includes(curLabelId)) {
                labelToImages[curLabelId].push(img["id"]);
            } else {
                labelToImages[curLabelId] = [img["id"]];
            }
            curLabelId = labels[curLabelId]["parent_id"];

            if (curLabelId === labels[curLabelId]["root_id"]) {
                if (Object.keys(labelToImages).includes(curLabelId)) {
                    labelToImages[curLabelId].push(img["id"]);
                } else {
                    labelToImages[curLabelId] = [img["id"]];
                }
                break;
            }
        }
    }
    // console.log("original: ", labelToImages);
    const sortedlabelToImagesList = Object.entries(labelToImages).sort(([, a], [, b]) => a.length - b.length);
    // console.log("sorted: ", sortedlabelToImagesList);
    const randomIdx = getRandomIntInclusive(0, sortedlabelToImagesList.length - 1);
    return {
        "label_id": sortedlabelToImagesList[randomIdx][0],
        "correct_image_ids": sortedlabelToImagesList[randomIdx][1],
    };
}

const generateQuizzes = async(images, imageLabelRecords, labels) => {
    const TOTAL_QUIZZES = 90;
    const TOTAL_POINTS_PER_QUIZ = 300;

    var allJsonData = {"quizzes": []}; // for the debug purpose
    for (var i = 0; i < TOTAL_QUIZZES; ++i) {
        const nineImages = getNineImages(images); // attribute name: selections
        const res = getDisplayLabelAndCorrectAnswers(nineImages, imageLabelRecords, labels);
        // console.log(res);
        const labelId = res["label_id"];
        const correctImageIds = res["correct_image_ids"];
        var quiz = {};
        quiz["label_id"] = labelId;
        quiz["category_id"] = labels[labelId]["root_id"];
        quiz["selections"] = [];
        for (const img of nineImages) {
            quiz["selections"].push(img["id"]);
        }
        quiz["correct_answers"] = []
        for (const correctId of correctImageIds) {
            quiz["correct_answers"].push({
                "image_id": correctId,
                "points": Math.floor(TOTAL_POINTS_PER_QUIZ / correctImageIds.length)
            });
        }
        const ref = selectionQuizzesCollection.doc();
        quiz["id"] = ref.id;
        await ref.set(quiz, {merge: true});
        console.log(quiz);
        allJsonData["quizzes"].push(quiz);
    }
    fs.writeFileSync(SELECTION_QUIZZES.concat(".json"), JSON.stringify(allJsonData, null, 4));
    return allJsonData;
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
