"use client";

import React, { use, useEffect } from "react";
import LeftBar from "@/app/components/leftBar";
import RightBar from "@/app/components/RightBar";
import NavBar from "@/app/components/navBar";
import ChatDisplay from "@/app/components/ChatDisplay";
import { useRouter } from "next/navigation";
import { useState, useLayoutEffect, useContext } from "react";
import { AuthContext } from "@/app/components/AuthProvider";
import axios from "axios";

const MainPage = () => {
  const router = useRouter();
  const [clickedUser, setClickedUser] = useState(null);
  const [reloadChatMembers, setReloadChatMembers] = useState(false);
  const { dispatch, user } = useContext(AuthContext);
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  useEffect(() => {
    const fetch = async () => {
      await axios
        .get(`http://localhost:5000/user/${user.email}`, {
          withCredentials: true,
        })
        .then((res) => {
          dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
        });
    };
    if (user) {
      fetch();
    }
  }, []);

  return (
    <>
      {user && (
        <div className="flex flex-row flex-wrap h-screen">
          <NavBar setClickedUser={setClickedUser} />
          <LeftBar
            setClickedUser={setClickedUser}
            clickedUser={clickedUser}
            setReloadChatMembers={setReloadChatMembers}
            reloadChatMembers={reloadChatMembers}
          />
          {!clickedUser ? (
            <RightBar />
          ) : (
            <ChatDisplay
              clickedUser={clickedUser}
              setClickedUser={setClickedUser}
              setReloadChatMembers={setReloadChatMembers}
              reloadChatMembers={reloadChatMembers}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MainPage;
