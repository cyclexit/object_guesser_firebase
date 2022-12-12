const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(require('../credentials.json'))
})
const db = admin.firestore();
const collection = db.collection("hello_world");
const doc = collection.doc("YUaXSWOUVKxWVdcUEvm1");

doc.get().then(snapshot => {
    // console.log(snapshot);
    const data = snapshot.data();
    data["image_ref"].get().then(snapshot => {
        const imageData = snapshot.data();
        console.log(imageData);
    });
});
