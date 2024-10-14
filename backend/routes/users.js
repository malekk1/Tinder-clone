const { Router } = require("express");
const recordRoutes = Router();
const dbo = require("../db/conn");

const { editSchema } = require("../validation/validationSchema");

recordRoutes.get("/user/:email", async function (req, res) {
  try {
    let db_connect = dbo.getDb();
    const myquery = { email: req.params.email.toLowerCase() };

    const result = await db_connect.collection("users").findOne(myquery);
    if (!result) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }
    const { password, ...otherDetails } = result;
    res.status(200).json({ ...otherDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

recordRoutes.get("/chat_members", async (req, res) => {
  const { userId } = req.query;
  let db_connect = dbo.getDb();

  try {
    const messages = db_connect.collection("messages");
    const users = db_connect.collection("users");

    const foundMembers = await messages
      .find({
        $or: [{ user_from_id: userId }, { user_to_id: userId }],
      })
      .toArray();

    const wynik = [];
    foundMembers.forEach((dokument) => {
      if (dokument.user_from_id !== userId) {
        wynik.push({ id: dokument.user_from_id, time: dokument.time });
      }

      if (dokument.user_to_id !== userId) {
        wynik.push({ id: dokument.user_to_id, time: dokument.time });
      }
    });
    wynik.sort((a, b) => new Date(b.time) - new Date(a.time));

    const posortowaneId = wynik.reduce((acc, item) => {
      if (acc.includes(item.id)) {
        return acc;
      } else {
        acc.push(item.id);
      }
      return acc;
    }, []);

    const members = await users
      .find({ email: { $in: posortowaneId } })
      .toArray();

    const result = members.map((member) => {
      const { password, matches, ...otherDetails } = member;
      return otherDetails;
    });

    const new_list = posortowaneId.reduce((acc, item) => {
      result.find((member) => {
        if (member.email.toLowerCase() === item.toLowerCase()) {
          acc.push(member);
        }
      });
      return acc;
    }, []);
    res.status(200).send(new_list);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

recordRoutes.get("/findUser/:email", async function (req, res) {
  try {
    const db = dbo.getDb();
    const collection = db.collection("users");

    age1 = parseInt(req.query.ageRange[0]);
    age2 = parseInt(req.query.ageRange[1]);

    const owner = await collection.findOne({
      email: req.params.email.toLowerCase(),
    });

    if (!owner) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }

    const user = await collection
      .aggregate([
        {
          $addFields: {
            birth_date: {
              $toDate: "$birth_date",
            },
            age: {
              $floor: {
                $divide: [
                  {
                    $subtract: [new Date(), { $toDate: "$birth_date" }],
                  },
                  31557600000,
                ],
              },
            },
          },
        },
        {
          $match: {
            gender: req.query.genderInterest,
            email: {
              $nin: [...req.query.emails, req.params.email],
            },
            age: {
              $gt: age1,
              $lt: age2,
            },
          },
        },
        {
          $project: {
            age: 0,
          },
        },
        {
          $limit: 1,
        },
      ])
      .toArray();

    if (user.length === 0) {
      console.log("Brak uzytkownikow.");
      return res.status(404).json({ message: "Cannot find user" });
    }

    const { password, ...otherDetails } = user[0];

    res.status(200).json({ ...otherDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

recordRoutes.put("/edit_profile/:email", async (req, res) => {
  const { email, ...otherDetails } = req.body.values;

  let db_connect = dbo.getDb();
  try {
    const { isValid, errors } = await editSchema.validate(otherDetails);
    if (errors) {
      return res.status(400).json({ errors });
    }

    const owner = await db_connect
      .collection("users")
      .findOne({ email: req.params.email.toLowerCase() });
    if (!owner) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }

    const isUpdateNeeded = Object.keys(req.body.values).some((key) => {
      if (key === "age_range") {
        return (
          owner[key][0] !== req.body.values[key][0] ||
          owner[key][1] !== req.body.values[key][1]
        );
      } else {
        return owner[key] !== req.body.values[key];
      }
    });

    if (!isUpdateNeeded) {
      return res.status(409).send("Values are the same");
    }

    const users = db_connect.collection("users");
    const query = { email: req.params.email.toLowerCase() };
    const updateDocument = {
      $set: { ...otherDetails },
    };

    const user = await users.updateOne(query, updateDocument);
    const { password, ...rest } = user;
    res.status(200).send("User updated successfully");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

recordRoutes.delete("/deleteAccount/:email", async (req, res) => {
  const userEmailToDelete = req.params.email;
  let db_connect = dbo.getDb();

  try {
    const users = db_connect.collection("users");
    const result = await users.deleteOne({ email: userEmailToDelete });
    if (result.deletedCount === 0) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send({ message: "User deleted successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = recordRoutes;
