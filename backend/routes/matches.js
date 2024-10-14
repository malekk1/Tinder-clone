const { Router } = require("express");
const recordRoutes = Router();
const dbo = require("../db/conn");



recordRoutes.put(
  "/updateMatches/:email",

  async function (req, res) {
    try {
      let db_connect = dbo.getDb();

      const email = req.params.email.toLowerCase();
      const newMatch = req.body.data.newMatch.toLowerCase();
      const users = db_connect.collection("users");
      const owner = await users.findOne({
        email: email,
      });

      if (!owner) {
        return res.status(404).json({ message: "User doesn't exist!" });
      }
      const matchUser = await users.findOne({
        email: newMatch,
      });

      if (
        owner.matches.filter((match) => match.email === newMatch).length > 0
      ) {
        return res.status(409).send({ message: "Match already exists" });
      }

      if (owner.likes.filter((like) => like === newMatch).length > 0) {
        return res.status(409).send({ message: "Match already exists" });
      }

      if (!matchUser) {
        return res.status(404).json({ message: "User doesn't exist!" });
      }

      const match = await db_connect.collection("users").findOne({
        email: newMatch,
        likes: email,
      });

      if (match) {
        db_connect
          .collection("users")
          .findOneAndUpdate(
            { email: email.toLowerCase() },
            {
              $push: {
                likes: {
                  $each: [newMatch],
                  $position: 0,
                },
                matches: {
                  $each: [{ email: newMatch, date: new Date() }],
                  $position: 0,
                },
              },
            },
            { new: true }
          )
          .then(() => {
            db_connect
              .collection("users")
              .findOneAndUpdate(
                { email: newMatch.toLowerCase() },
                {
                  $push: {
                    matches: {
                      $each: [{ email: email.toLowerCase(), date: new Date() }],
                      $position: 0,
                    },
                  },
                },
                { new: true }
              )
              .then(() => {
                res.status(200).json({ message: "Match added successfully" });
              });
          });
      } else {
        console.log("Aaa");
        db_connect
          .collection("users")
          .findOneAndUpdate(
            { email: email.toLowerCase() },
            {
              $push: {
                likes: newMatch,
              },
            },
            { new: true }
          )
          .then(() => {
            res.status(200).json({ message: "Match added successfully" });
          });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

recordRoutes.put(
  "/updateDislikes/:email",

  async function (req, res) {
    try {
      let db_connect = dbo.getDb();
      const email = req.params.email.toLowerCase();
      const newDislike = req.body.data.newDislike.toLowerCase();

      const users = db_connect.collection("users");
      const owner = await users.findOne({
        email: email,
      });

      if (!owner) {
        return res.status(404).json({ message: "User doesn't exist!" });
      }
      const matchUser = await users.findOne({
        email: newDislike,
      });

      if (owner.Dislikes.filter((match) => match === newDislike).length > 0) {
        return res.status(409).send({ message: "Dislike already exists" });
      }

      if (!matchUser) {
        return res.status(404).json({ message: "User doesn't exist!" });
      }

      db_connect
        .collection("users")
        .updateOne(
          { email: email },
          {
            $push: {
              Dislikes: newDislike,
            },
          }
        )
        .then(() => {
          res.status(200).json({ message: "Dislike added successfully" });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
        });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

recordRoutes.get("/getMatch/:email", async function (req, res) {
  try {
    const db = dbo.getDb();
    const collection = db.collection("users");

    const user = await collection.findOne({
      email: req.params.email.toLowerCase(),
    });

    if (!user) {
      console.log("Użytkownik o danym adresie e-mail nie został znaleziony.");
      return res.status(404).json({ message: "User doesn't exist!" });
    }

    const { password, ...otherDetails } = user;
    res.status(200).json({ matchingUser: { ...otherDetails } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

recordRoutes.delete("/deleteMatch/:email", async (req, res) => {
  const userEmail = req.params.email.toLowerCase();
  let db_connect = dbo.getDb();

  try {
    const users = db_connect.collection("users");
    const owner = await users.findOne({
      email: userEmail,
    });

    if (!owner) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }
    const emailToDelete = req.body.email.toLowerCase();

    const query = { email: userEmail };
    const deleteDocument = {
      $pull: { matches: { email: emailToDelete } },
    };

    await users.updateOne(query, deleteDocument).then((result) => {
      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: "Match not found" });
      } else {
        res.status(200).send({ message: "Match deleted successfully" });
      }
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = recordRoutes;
