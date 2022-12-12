const fs = require('fs');
const admin = require('firebase-admin');

const MULTIPLE_CHOICE_QUIZZES = "multiple_choice_quizzes";
const SELECTION_QUIZZES = "selection_quizzes";

admin.initializeApp({
    credential: admin.credential.cert(require('../../credentials.json'))
});
const db = admin.firestore();
const multipleChoiceQuizzesCollection = db.collection(MULTIPLE_CHOICE_QUIZZES);
const selectionQuizzesCollection = db.collection(SELECTION_QUIZZES);

multipleChoiceQuizzesCollection.listDocuments()
    .then((docs) => docs.forEach(async ref => {
        const quiz = await ref.get().then(v => v.data());
        var maxPoints = 0;
        for (const ans of quiz["correct_answers"]) {
            const choices = Array.from(quiz["choices"]);
            if (choices.includes(ans["label_id"])) {
                maxPoints = Math.max(maxPoints, ans["points"]);
            }
        }
        quiz["max_points"] = maxPoints;
        // console.log(quiz);
        ref.set(quiz, {merge: true});
    }));

selectionQuizzesCollection.listDocuments()
    .then((docs) => docs.forEach(async ref => {
        const quiz = await ref.get().then(v => v.data());
        var maxPoints = 0;
        for (const ans of quiz["correct_answers"]) {
            maxPoints += ans["points"];
        }
        quiz["max_points"] = maxPoints;
        // console.log(quiz);
        ref.set(quiz, {merge: true});
    }));
