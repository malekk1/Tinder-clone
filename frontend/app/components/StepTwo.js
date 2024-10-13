import React, { use, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";

const StepTwo = ({ userData, setStepTwo, setError }) => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      image: "",
      description: "",
      gender: "",
      interested_gender: "",
      age_range: [18, 100],
    },
    validationSchema: Yup.object({
      image: Yup.string()
        .required("Zdjecie jest wymagane")
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
          message: "Nie jest to zdjecie",
        }),
      description: Yup.string().required("Opis jest wymagany").min(10),
      gender: Yup.string().required("Płeć jest wymagana"),
      interested_gender: Yup.string().required("Płeć jest wymagana"),
    }),

    onSubmit: async (values) => {
      const data = { ...userData, ...values };
      await axios
        .post("http://localhost:5000/register", data)
        .then((res) => {
          alert("Zarejestrowano pomyślnie");
          router.push("/login");
        })
        .catch((err) => {
          if (err.response.status === 400) {
            setError("Email jest zajęty");
            setStepTwo(false);
          } else if (err.response.status === 400) {
            setError("Błedne dane");
            setStepTwo(false);
          } else {
            setError("Coś poszło nie tak");
            setStepTwo(false);
          }
        });
    },
  });
  return (
    <div className="edit-page">
      <h1 className="text-white font-bold text-[2em]">Rejestracja</h1>
      <div className="edit-container">
        <h2 className="pb-[2em] text-[1.25em] font-bold">Krok 2</h2>
        <form onSubmit={formik.handleSubmit}>
          <div>
            <label htmlFor="image">Zdjecie:</label>
            <input
              id="image"
              name="image"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.image}
            />
            {formik.errors.image && formik.touched.image ? (
              <div className="text-red-500 font-bold">
                {formik.errors.image}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>

          <div>
            <label htmlFor="description">Opis:</label>
            <textarea
              id="description"
              name="description"
              onChange={formik.handleChange}
              value={formik.values.description}
            />
            {formik.errors.description && formik.touched.description ? (
              <div className="text-red-500 font-bold">
                {formik.errors.description}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>

          <div>
            <label htmlFor="gender">Płeć:</label>
            <select
              id="gender"
              name="gender"
              onChange={formik.handleChange}
              value={formik.values.gender}
            >
              <option value="">Wybierz płeć</option>
              <option value="Male">Mężczyzna</option>
              <option value="Female">Kobieta</option>
            </select>
            {formik.errors.gender && formik.touched.gender ? (
              <div className="text-red-500 font-bold">
                {formik.errors.gender}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>
          <div>
            <label htmlFor="interested_gender">Interesujaca cie płeć:</label>
            <select
              id="interested_gender"
              name="interested_gender"
              onChange={formik.handleChange}
              value={formik.values.interested_gender}
            >
              <option value="">Wybierz płeć</option>
              <option value="Male">Mężczyzna</option>
              <option value="Female">Kobieta</option>
            </select>
            {formik.touched.interested_gender &&
            formik.errors.interested_gender ? (
              <div className="text-red-500 font-bold">
                {formik.errors.interested_gender}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>

          <div>
            <label htmlFor="age_range">
              Podaj interesujacy cię wiek uzytkowników:
            </label>
            <div className="age-range-container">
              <div>
                <label htmlFor="">Min:</label>
                <input
                  id="age_range[0]"
                  name="age_range[0]"
                  type="number"
                  min={18}
                  max={100}
                  onChange={formik.handleChange}
                  value={formik.values.age_range[0]}
                />
              </div>
              <div>
                <label htmlFor="">Max:</label>
                <input
                  id="age_range[1]"
                  name="age_range[1]"
                  type="number"
                  min={18}
                  max={100}
                  onChange={formik.handleChange}
                  value={formik.values.age_range[1]}
                />
              </div>
            </div>
          </div>
          <div className="buttons">
            <button onClick={() => setStepTwo(false)}>Powrót</button>
            <button type="submit">Zatwierdź</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepTwo;
