import React from "react";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { IoReload } from "react-icons/io5";

const ChatList = ({ user, clickedUser, setClickedUser, reloadChatMembers }) => {
  const [chatMembers, setChatMembers] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:5000/chat_members", {
        params: { userId: user.email },
        withCredentials: true,
      })
      .then((res) => {
        setChatMembers(res.data);
      });
  }, [reloadChatMembers]);
  return (
    <div className="pl-2 pr-2 flex flex-col">
      <div className="">
        {chatMembers.map((matches, index) => (
          <div
            className="mt-2 hover:bg-gray-200 hover:cursor-pointer rounded-md p-2"
            onClick={() => {
              setClickedUser(matches);
            }}
            key={index}
          >
            <div className="flex  gap-1">
              <img
                src={matches.image}
                alt="match_image"
                className="rounded-full"
                style={{ width: "3rem", height: "3rem" }}
              />
              <div className="flex flex-col">
                <p className=" font-bold pb-3 pt-3">{matches.first_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
