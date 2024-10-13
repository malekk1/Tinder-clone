"use client";

import React, { useState, useContext, useLayoutEffect } from "react";
import { Formik, Field, ErrorMessage, Form } from "formik";
import tinder_logo_white from "../../public/tinder_logo_white.png";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/components/AuthProvider";
import axios from "axios";
import { useCookies } from "react-cookie";

export default function Login() {
  const { loading, error, dispatch, user } = useContext(AuthContext);
  const [cookie, setCookie, removeCookie] = useCookies(null);

  const router = useRouter();

  const schema = Yup.object().shape({
    email: Yup.string()
      .required("Email jest wymagany")
      .email("Nieprawidłowy Email"),
    password: Yup.string()
      .required("Hasło jest wymagane")
      .min(6, "Hasło musi miec conajmniej 6 znakow"),
  });
  useLayoutEffect(() => {
    if (user) router.push("/mainPage");
  }, []);

  const handleSubmit = async (values) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.get("http://localhost:5000/login", {
        params: values,
      });

      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
      setCookie("auth_token", res.data.token);
      router.push("/mainPage");
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    }
  };
  return (
    <div className="login_page">
      <div className="flex justify-center p-8">
        <img src={tinder_logo_white.src} className="w-[20rem] h-[5rem]" />
      </div>
      <div className="form_container">
        {error && <div className="text-red-500">{error}</div>}
        <Formik
          validationSchema={schema}
          initialValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="login_input">
                <Field
                  name="email"
                  placeholder="Email"
                  type="email"
                  className="w-1/2 border border-black border-solid"
                />
                {errors.email && touched.email ? (
                  <div className="text-red-500">{errors.email}</div>
                ) : (
                  <div className="h-[1.5rem] mt-0 p-0"></div>
                )}
              </div>
              <div className="login_input">
                <Field
                  name="password"
                  placeholder="Hasło"
                  className="w-1/2 border border-black border-solid"
                  type="password"
                />
                {errors.password && touched.password ? (
                  <div className="text-red-500">{errors.password}</div>
                ) : (
                  <div className="h-[1.5rem] mt-0 p-0"></div>
                )}
              </div>

              <button type="submit">Zaloguj się</button>
            </Form>
          )}
        </Formik>
        <div className="register_button">
          <div>Nie posiadasz Konta?</div>
          <button onClick={() => router.push("/register")}>Utworz Konto</button>
        </div>
      </div>
    </div>
  );
}
