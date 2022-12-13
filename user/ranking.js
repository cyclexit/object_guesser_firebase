// This script is used to update the user rankings.
// This script should be scheulded as a periodic task on the sever.

const fs = require('fs');
const admin = require('firebase-admin');

const USER_GAME_HISTORY = "user_game_history";

admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
})
const db = admin.firestore();
const userGameHistoryCollection = db.collection(USER_GAME_HISTORY);

userGameHistoryCollection.orderBy("total_points", 'desc').get().then(snapshot => {
    const users = snapshot.docs.map(doc => {
        data = doc.data();
        data["id"] = doc.id;
        return data;
    });
    for (var [rank, user] of users.entries()) {
        user["rank"] = rank + 1;
        userGameHistoryCollection.doc(user["id"]).set(user, {merge: true});
    }
});
