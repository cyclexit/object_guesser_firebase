// This script generates the quizzes completely randomly.
// Hence, this script can be reused without any duplication check.

const fs = require('fs');
const admin = require('firebase-admin');

const LABELS = "labels";
const MULTIPLE_CHOICE_QUIZZES = "multiple_choice_quizzes";
const INPUT_QUIZZES = "input_quizzes";
const SELECTION_QUIZZES = "selection_quizzes";

admin.initializeApp({
    credential: admin.credential.cert(require('../../credentials.json'))
});
const db = admin.firestore();
const labelsCollection = db.collection(LABELS);
const multipleChoiceQuizzesCollection = db.collection(MULTIPLE_CHOICE_QUIZZES);
const inputQuizzesCollection = db.collection(INPUT_QUIZZES);
const selectionQuizzesCollection = db.collection(SELECTION_QUIZZES);

const getCategoryIds = async() => {
    var categoryIds = [];
    const labelSnapshot = await labelsCollection.get();
    const labels = labelSnapshot.docs.map(doc => doc.data());
    for (const label of labels) {
        if (label["id"] === label["root_id"]) {
            categoryIds.push(label["id"]);
        }
    }
    return categoryIds;
}

const getAllQuizzes = async() => {
    const multipleChoiceSnapshot = await multipleChoiceQuizzesCollection.get();
    const inputSnapshot = await inputQuizzesCollection.get();
    const selectionSnapshot = await selectionQuizzesCollection.get();
    return {
        "multiple_choice": multipleChoiceSnapshot.docs.map(doc => doc.data()),
        "input": inputSnapshot.docs.map(doc => doc.data()),
        "selection": selectionSnapshot.docs.map(doc => doc.data())
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const generateGames = async() => {
    const MAX_GAMES_PER_CATEGORY = 10;
    const MAX_QUIZZES_PER_GAME = 10;
    const MULTIPLE_CHOICE_NUM = getRandomIntInclusive(3, 4);
    const INPUT_NUM = getRandomIntInclusive(3, 4);
    const SELECTION_NUM = MAX_QUIZZES_PER_GAME - MULTIPLE_CHOICE_NUM - INPUT_NUM;

    const categoryIds = await getCategoryIds();
    const quizzes = await getAllQuizzes();

    for (const categoryId of categoryIds) {
        var game = {};
        game["category_id"] = categoryId;
        game["quiz_ids"] = [];
        for (var i = 0; i < MAX_GAMES_PER_CATEGORY; ++i) {
            // TODO: implement this
            for (var j = 0; j < MULTIPLE_CHOICE_NUM; ++j) {

            }
            for (var j = 0; j < INPUT_NUM; ++j) {

            }
            for (var j = 0; j < SELECTION_NUM; ++j) {

            }
        }
    }
}
