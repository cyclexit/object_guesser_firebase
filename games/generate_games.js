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

const generateGames = async() => {
    const categoryIds = await getCategoryIds();
    const quizzes = await getAllQuizzes();
}
