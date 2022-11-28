const fs = require('fs');
const admin = require('firebase-admin');

const INPUT_QUIZZES = "input_quizzes";

admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
})
const db = admin.firestore();
const inputQuizzesCollection = db.collection(INPUT_QUIZZES);
