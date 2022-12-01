// This script generates the quizzes completely randomly.
// Hence, this script can be reused without any duplication check.

const fs = require('fs');
const admin = require('firebase-admin');

const LABELS = "labels";
const MULTIPLE_CHOICE_QUIZZES = "multiple_choice_quizzes";
const INPUT_QUIZZES = "input_quizzes";
const SELECTION_QUIZZES = "selection_quizzes";
const GAMES = "games";

admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
});
const db = admin.firestore();
const labelsCollection = db.collection(LABELS);
const multipleChoiceQuizzesCollection = db.collection(MULTIPLE_CHOICE_QUIZZES);
const inputQuizzesCollection = db.collection(INPUT_QUIZZES);
const selectionQuizzesCollection = db.collection(SELECTION_QUIZZES);
const gamesCollection = db.collection(GAMES);

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

const getQuizzesByCategory = async(categoryIds) => {
    const multipleChoiceSnapshot = await multipleChoiceQuizzesCollection.get();
    const inputSnapshot = await inputQuizzesCollection.get();
    const selectionSnapshot = await selectionQuizzesCollection.get();

    var mc = {};
    var input = {};
    var selection = {};
    for (const catId of categoryIds) {
        mc[catId] = [];
        input[catId] = [];
        selection[catId] = [];
    }

    multipleChoiceSnapshot.docs.forEach(doc => {
        const quiz = doc.data();
        mc[quiz["category_id"]].push(quiz["id"]);
    });
    inputSnapshot.docs.forEach(doc => {
        const quiz = doc.data();
        input[quiz["category_id"]].push(quiz["id"]);
    });
    selectionSnapshot.docs.forEach(doc => {
        const quiz = doc.data();
        selection[quiz["category_id"]].push(quiz["id"]);
    });

    return {
        "multiple_choice": mc,
        "input": input,
        "selection": selection
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

    var allJsonData = {}; // for debug purpose
    const categoryIds = await getCategoryIds();
    const quizzes = await getQuizzesByCategory(categoryIds);
    console.log(quizzes); // debug

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

// execution starts here
generateGames();