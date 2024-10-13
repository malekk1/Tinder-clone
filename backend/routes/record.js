const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const Yup = require("yup");

const validationSchema = Yup.object({
  first_name: Yup.string().required("First name is required").min(2),
  last_name: Yup.string().required("Last name is required").min(2),
  email: Yup.string().required("Email is required").email(),
  password: Yup.string().required("Password is required").min(6),
  birth_date: Yup.date().required("Birth date is required").max(new Date()),
  image: Yup.string()
    .required("Image is required")
    .url()
    .test({
      name: "is-image-url",
      test: (value) => {
        if (!value) {
          return true;
        }

        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
        const lowerCasedValue = value.toLowerCase();

        return imageExtensions.some((extension) =>
          lowerCasedValue.endsWith(extension)
        );
      },
      message: "Not a valid image URL",
    }),
  description: Yup.string().required("Description is required").min(10),
  gender: Yup.string().required("Gender is required"),
  interested_gender: Yup.string().required("Interested gender is required"),
});

const messagesValidationSchema = Yup.object({
  user_from_id: Yup.string().required("User from ID is required").email(),
  user_to_id: Yup.string().required("User to ID is required").email(),
  message: Yup.string().required("Message is required"),
  time: Yup.date()
    .required("Time is required")
    .test("is-future-date", "Invalid time", function (value) {
      const currentDate = new Date();
      return Yup.date().isType(value) && value <= currentDate;
    }),
});

const editSchema = Yup.object({
  first_name: Yup.string().required("First name is required").min(2),
  last_name: Yup.string().required("Last name is required").min(2),
  birth_date: Yup.date().required("Birth date is required").max(new Date()),
  image: Yup.string()
    .required("Image is required")
    .url()
    .test({
      name: "is-image-url",
      test: (value) => {
        if (!value) {
          return true;
        }

        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
        const lowerCasedValue = value.toLowerCase();

        return imageExtensions.some((extension) =>
          lowerCasedValue.endsWith(extension)
        );
      },
      message: "Not a valid image URL",
    }),
  description: Yup.string().required("Description is required").min(10),
  gender: Yup.string().required("Gender is required"),
  interested_gender: Yup.string().required("Interested gender is required"),
  age_range: Yup.array().required("Age range is required").min(2),
});

async function validateUserData(userData) {
  try {
    await validationSchema.validate(userData, { abortEarly: false });

    return { isValid: true, errors: null };
  } catch (error) {
    const errors = error.inner.map((err) => ({
      path: err.path,
      message: err.message,
    }));

    return { isValid: false, errors };
  }
}

const verifyToken = (req, res, next) => {
  if (!req.headers.cookie)
    return res.status(401).json({ message: "Unauthorized" });
  const token = req.headers.cookie.split("=")[1];
  try {
    jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) return res.status(403).json({ message: "Token is not valid" });

      if (user.email === req.params.email) {
        next();
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    res.status(500).json({ message: error.message });
  }
});

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

recordRoutes.get("/login", async (req, res) => {
  let db_connect = dbo.getDb();

  const email = req.query.email;

  try {
    const user = await db_connect
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    const isPasswordCorrect =
      req.query.email.toLowerCase() === user.email.toLowerCase() &&
      req.query.password === user.password;
    if (!user) return res.status(404).json({ message: "User doesn't exist!" });

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Incorrect Password!" });

    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      process.env.JWT
    );

    const { password, ...otherDetails } = user;
    res
      .status(200)

      .json({ details: { ...otherDetails }, token: token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

recordRoutes.post("/register", async (req, res) => {
  let db_connect = dbo.getDb();

  const data = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    birth_date: req.body.birth_date,
    image: req.body.image,
    description: req.body.description,
    gender: req.body.gender,
    interested_gender: req.body.interested_gender,
    age_range: req.body.ageRange,
  };

  const { isValid, errors } = await validateUserData(data);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  const newData = {
    ...data,
    matches: [],
    Dislikes: [],
    likes: [],
  };

  try {
    let { email } = req.body;
    email = email.toLowerCase();
    const existingUser = await db_connect
      .collection("users")
      .findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exist" });
    }

    await db_connect
      .collection("users")
      .insertOne(newData)
      .then((result) => {
        console.log(result);
        return res.status(201).json({ message: "Registration successful" });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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

recordRoutes.delete("/deleteMessage/:_id", async (req, res) => {
  let db_connect = dbo.getDb();
  console.log(req.params);

  try {
    const messages = db_connect.collection("messages");

    const query = { _id: new ObjectId(req.params._id) };
    const existMessage = await messages.findOne(query);
    if (!existMessage) {
      return res.status(404).send("Message not found");
    }
    const message = await messages.deleteOne({
      query,
    });
    res.status(200).send({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = recordRoutes;
