"use client";
import { useState, useEffect, useContext } from "react";
import React from "react";
import PairsList from "./PairsList";
import ChatList from "./ChatList";
import axios from "axios";
import { AuthContext } from "./AuthProvider";
import ChatDisplay from "./ChatDisplay";

const leftBar = ({
  setClickedUser,
  clickedUser,
  reloadChatMembers,
  setReloadChatMembers,
}) => {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState("matches");
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    setMatches(user.matches);
  }, [user]);

  return (
    <div className="w-1/3 h-[calc(100vh-5em)]">
      <div className="left-buttons-container">
        <button
          className={view === "matches" ? "active" : "left-buttons"}
          onClick={() => setView("matches")}
        >
          Pary
        </button>
        <button
          className={view === "chat" ? "active" : "left-buttons"}
          onClick={() => setView("chat")}
        >
          Chat
        </button>
      </div>
      <div className="overflow-y-auto">
        {view === "matches" ? (
          matches.map((val, ind) => {
            return (
              <div key={ind}>
                <PairsList match={val} setClickedUser={setClickedUser} />
              </div>
            );
          })
        ) : (
          <ChatList
            user={user}
            clickedUser={clickedUser}
            setClickedUser={setClickedUser}
            reloadChatMembers={reloadChatMembers}
            setReloadChatMembers={setReloadChatMembers}
          />
        )}
      </div>
    </div>
  );
};

export default leftBar;
