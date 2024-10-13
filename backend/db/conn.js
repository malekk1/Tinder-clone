const { MongoClient } = require("mongodb");
const Db = process.env.MONGO_URI;
console.log(Db);
const client = new MongoClient(Db);

var _db;

module.exports = {
  connectToServer: async function (callback) {
    console.log("test");

    try {
      await client.connect();
    } catch (e) {
      console.error(e);
    }

    _db = client.db("tinder");

    try {
      var count = await _db.collection("users").findOne({});
    } catch (e) {
      console.error(e);
    }

    if (_db !== undefined) {
      return true;
    }
  },
  getDb: function () {
    return _db;
  },
};
