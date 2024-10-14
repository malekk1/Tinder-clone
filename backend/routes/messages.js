const { Router } = require("express");
const dbo = require("../db/conn");
const recordRoutes = Router();
const ObjectId = require("mongodb").ObjectId;

const { messagesValidationSchema } = require("../validation/validationSchema");

recordRoutes.get("/messages", async (req, res) => {
  let db_connect = dbo.getDb();

  try {
    const { userId, correspondingUserId } = req.query;

    const user1 = await db_connect
      .collection("users")
      .findOne({ email: userId.toLowerCase() });
    const user2 = await db_connect
      .collection("users")
      .findOne({ email: correspondingUserId.toLowerCase() });

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }
    const messages = db_connect.collection("messages");
    const query = {
      user_from_id: userId.toLowerCase(),
      user_to_id: correspondingUserId.toLowerCase(),
    };
    const foundMessages = await messages.find(query).toArray();

    res.status(200).send(foundMessages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

recordRoutes.post("/message", async (req, res) => {
  let db_connect = dbo.getDb();
  try {
    const message = req.body.message;

    const { errors } = await messagesValidationSchema.validate(message);

    if (errors) {
      return res.status(400).json({ errors });
    }
    const user1 = await db_connect
      .collection("users")
      .findOne({ email: message.user_from_id });
    const user2 = await db_connect
      .collection("users")
      .findOne({ email: message.user_to_id });

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }

    const messages = db_connect.collection("messages");

    const insertedMessage = await messages.insertOne(message);
    res.status(200).send(insertedMessage);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

recordRoutes.delete("/deleteMessage/:_id", async (req, res) => {
  let db_connect = dbo.getDb();
  console.log(req.params);

  try {
    const messages = db_connect.collection("messages");

    const query = { _id: new ObjectId(req.params._id) };
    const existMessage = await messages.findOne(query);
    console.log(existMessage);
    if (!existMessage) {
      return res.status(404).send("Message not found");
    }
    await messages.deleteOne(query);
    res.status(200).send({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

module.exports = recordRoutes;
