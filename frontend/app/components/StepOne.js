import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

const StepOne = ({ userData, setStepTwo, setUserData, error }) => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: userData.password,
      birth_date: userData.birth_date,
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("Imie jest wymagane").min(2),
      last_name: Yup.string().required("Nazwisko jest wymagane").min(2),
      email: Yup.string().required("Email jest wymagany").email(),
      password: Yup.string().required("Password jest wymagane").min(6),
      birth_date: Yup.date()
        .required("Data urodzenia jest wymagana")
        .max(new Date()),
    }),
    onSubmit: (values) => {
      setUserData({ ...userData, ...values });
      setStepTwo(true);
    },
  });
  return (
    <div className="edit-page">
      <h1 className="text-white font-bold text-[2em]">Rejestracja</h1>
      <div className="edit-container">
        <h2 className="pb-[2em] text-[1.25em] font-bold">Krok 1</h2>
        {error && <div className="text-red-500">{error}</div>}
        <form onSubmit={formik.handleSubmit}>
          <div>
            <label htmlFor="first_name">Imię:</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.first_name}
            />
            {formik.errors.first_name && formik.touched.first_name ? (
              <div className="text-red-500 font-bold">
                {formik.errors.first_name}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>

          <div>
            <label htmlFor="last_name">Nazwisko:</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.last_name}
            />
            {formik.errors.last_name && formik.touched.last_name ? (
              <div className="text-red-500 font-bold">
                {formik.errors.last_name}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>

          <div>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            {formik.errors.email && formik.touched.email ? (
              <div className="text-red-500 font-bold">
                {formik.errors.email}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>

          <div>
            <label htmlFor="password">Hasło:</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />
            {formik.errors.password && formik.touched.password ? (
              <div className="text-red-500 font-bold">
                {formik.errors.password}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>

          <div>
            <label htmlFor="birth_date">Data Urodzenia:</label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              onChange={formik.handleChange}
              value={formik.values.birth_date}
            />
            {formik.errors.birth_date && formik.touched.birth_date ? (
              <div className="text-red-500 font-bold">
                {formik.errors.birth_date}
              </div>
            ) : (
              <div className="h-[1.5rem] mt-0 p-0"></div>
            )}
          </div>
          <div className="buttons">
            <button onClick={() => router.push("/login")}>
              Wróć do Logowania
            </button>
            <button type="submit">Przejdź Dalej</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepOne;
