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

module.exports = { validationSchema, messagesValidationSchema, editSchema };
