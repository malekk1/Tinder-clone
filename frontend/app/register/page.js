"use client";

import React, { useState } from "react";
import StepTwo from "../components/StepTwo";
import StepOne from "../components/StepOne";

const Register = () => {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    birth_date: "",
    image: "",
    description: "",
    gender: "",
    interested_gender: "",
    age_range: [18, 100],
  });
  const [stepTwo, setStepTwo] = useState(false);
  const [error, setError] = useState(null);

  return (
    <>
      {stepTwo ? (
        <StepTwo
          userData={userData}
          setStepTwo={setStepTwo}
          setError={setError}
        />
      ) : (
        <StepOne
          userData={userData}
          setStepTwo={setStepTwo}
          setUserData={setUserData}
          error={error}
        />
      )}
    </>
  );
};

export default Register;
