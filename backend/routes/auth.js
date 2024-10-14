const { Router } = require("express");
const dbo = require("../db/conn");
const recordRoutes = Router();
const jwt = require("jsonwebtoken");
const { validateUserData } = require("../validation/validationSchema");

// async function validateUserData(userData) {
//   try {
//     await validationSchema.validate(userData, { abortEarly: false });

//     return { isValid: true, errors: null };
//   } catch (error) {
//     const errors = error.inner.map((err) => ({
//       path: err.path,
//       message: err.message,
//     }));

//     return { isValid: false, errors };
//   }
// }

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

module.exports = recordRoutes;
