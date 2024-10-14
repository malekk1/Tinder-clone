"use client";

import React, { useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "@/app/components/AuthProvider";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
const Settings = () => {
  const router = useRouter();
  const { dispatch, user } = useContext(AuthContext);
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);
  const formik = useFormik({
    initialValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      birth_date: user?.birth_date
        ? new Date(user.birth_date).toISOString().split("T")[0]
        : "",
      image: user?.image,
      description: user?.description,
      gender: user?.gender,
      interested_gender: user?.interested_gender,
      age_range: user?.age_range,
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("Imie jest wymagane").min(2),
      last_name: Yup.string().required("Nazwisko jest wymagane").min(2),
      birth_date: Yup.date()
        .required("Data urodzenia jest wymagana")
        .max(new Date()),
      image: Yup.string().required("Zdjecie jest wymagane").url(),
      description: Yup.string().required("Opis jest wymagany").min(10),
      gender: Yup.string().required("Płeć jest wymagana"),
      interested_gender: Yup.string().required("Płeć jest wymagana"),
      age_range: Yup.number().required("Zakres wieku jest wymagany").min(18),
    }),

    onSubmit: async (values) => {
      function getChangedData(originalData, formData) {
        const changedData = {};

        for (const key in formData) {
          if (
            formData.hasOwnProperty(key) &&
            formData[key].toString() !== originalData[key].toString()
          ) {
            changedData[key] = formData[key];
          }
        }
        changedData["email"] = originalData["email"];
        return changedData;
      }

      const changedData = getChangedData(user, values);
      console.log(changedData);
      await axios
        .put(
          `http://localhost:5000/edit_profile/${user.email}`,
          { values },
          { withCredentials: true }
        )
        .then(async (res) => {
          await axios
            .get(`http://localhost:5000/user/${user.email}`, {
              withCredentials: true,
            })
            .then((res) => {
              alert("Zmiany zostały zapisane");
              dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            });
        })
        .catch((err) => {
          console.log(err);
          alert("Coś poszło nie tak");
        });
    },
  });

  return (
    <>
      {user && (
        <div className="edit-page">
          <div className="edit-container">
            <div className="info">
              <h1>Edytuj swoje dane</h1>
              <IoCloseCircleOutline
                className="text-red-500 w-[3rem] h-[3rem] hover:text-red-700 hover:cursor-pointer"
                onClick={() => router.push("/mainPage")}
              />
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="first_name">Imię:</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values?.first_name}
                />
                {formik.touched.first_name && formik.errors.first_name ? (
                  <div>{formik.errors.first_name}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="last_name">Nazwisko:</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values?.last_name}
                />
                {formik.touched.last_name && formik.errors.last_name ? (
                  <div>{formik.errors.last_name}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="birth_date">Data urodzenia:</label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values?.birth_date}
                />
                {formik.touched.birth_date && formik.errors.birth_date ? (
                  <div>{formik.errors.birth_date}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="image">Zdjęcie:</label>
                <input
                  id="image"
                  name="image"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values?.image}
                />
                {formik.touched.image && formik.errors.image ? (
                  <div>{formik.errors.image}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="description">Twój opis:</label>
                <textarea
                  id="description"
                  name="description"
                  onChange={formik.handleChange}
                  value={formik.values?.description}
                ></textarea>
                {formik.touched.description && formik.errors.description ? (
                  <div>{formik.errors.description}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="gender">Płeć:</label>
                <select
                  id="gender"
                  name="gender"
                  onChange={formik.handleChange}
                  value={formik.values?.gender}
                >
                  <option value="Male">Mężczyzna</option>
                  <option value="Female">Kobieta</option>
                </select>
                {formik.touched.gender && formik.errors.gender ? (
                  <div>{formik.errors.gender}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="interested_gender">
                  Interesujaca cie płeć:
                </label>
                <select
                  id="interested_gender"
                  name="interested_gender"
                  onChange={formik.handleChange}
                  value={formik.values?.interested_gender}
                >
                  <option value="Male">Mężczyzna</option>
                  <option value="Female">Kobieta</option>
                </select>
                {formik.touched.interested_gender &&
                formik.errors.interested_gender ? (
                  <div>{formik.errors.interested_gender}</div>
                ) : null}
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
                      value={formik.values?.age_range[0]}
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
                      value={formik.values?.age_range[1]}
                    />
                  </div>
                </div>
              </div>

              <button type="submit">Zatwierdź</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
