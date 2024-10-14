import React from "react";
import { AuthContext } from "./AuthProvider";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const MenuList = () => {
  const router = useRouter();
  const { user, dispatch } = useContext(AuthContext);
  const handleLogout = () => {
    dispatch({ type: "LOGOUT", payload: null });
  };

  const handleDeleteAccount = async () => {
    await axios
      .delete(`http://localhost:5000/deleteAccount/${user.email}`, {
        withCredentials: true,
      })
      .then((res) => {
        dispatch({ type: "LOGOUT", payload: null });
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <h3>
        {user.first_name} {user.last_name}
        <br />
      </h3>
      <ul>
        <li className="hover:cursor-pointer hover:bg-gray-50">Mój Profil</li>
        <li
          className="hover:cursor-pointer hover:bg-gray-50"
          onClick={() => {
            router.push("/mainPage/settings");
          }}
        >
          Edytuj Profil
        </li>
        <li
          onClick={handleLogout}
          className="hover:text-red-600 hover:cursor-pointer hover:bg-gray-50"
        >
          Wyloguj
        </li>
        <li
          className="hover:text-red-600 hover:cursor-pointer hover:bg-gray-50"
          //onClick={handleDeleteAccount}
        >
          Usuń Konto
        </li>
      </ul>
    </>
  );
};

export default MenuList;
