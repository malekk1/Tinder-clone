"use client";

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import axios from "axios";

import ChatInput from "./ChatInput";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { AuthContext } from "./AuthProvider";

const ChatDisplay = ({
  clickedUser,
  setClickedUser,
  setReloadChatMembers,
  reloadChatMembers,
}) => {
  const bottomDivRef = useRef();
  const [messages, setMessages] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchMessages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/messages", {
        params: { userId: user.email, correspondingUserId: clickedUser.email },
      });
      const userMessages = response.data.map((message) => ({
        _id: message._id,
        name: user.first_name,
        img: user.image,
        message: message.message,
        time: message.time,
      }));

      const responseClickedUser = await axios.get(
        "http://localhost:5000/messages",
        {
          params: {
            userId: clickedUser.email,
            correspondingUserId: user.email,
          },
        }
      );
      const clickedUserMessages = responseClickedUser.data.map((message) => ({
        _id: message._id,
        name: clickedUser.first_name,
        img: clickedUser.image,
        message: message.message,
        time: message.time,
      }));

      setMessages([...userMessages, ...clickedUserMessages]);
    } catch (error) {
      console.log(error);
    }
  };

  useLayoutEffect(() => {
    const lastMessage =
      bottomDivRef.current.children[bottomDivRef.current.children.length - 1];

    if (lastMessage) {
      lastMessage.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [clickedUser]);

  const descendingOrderMessages = messages?.sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:5000/deleteMessage/${messageId}`);
      fetchMessages();
      setReloadChatMembers(!reloadChatMembers);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-2/3 h-[calc(100%-4rem)] border-l-gray-500">
      <div className="chat-info">
        <div>
          <img
            src={clickedUser?.image}
            className="rounded-full w-[4rem] h-[4rem]"
          />
          <h1>{clickedUser?.first_name}</h1>
        </div>

        <button
          className="w-[5rem] h-[5rem]"
          onClick={() => {
            setClickedUser(null);
          }}
        >
          <IoCloseCircleOutline className="text-red-500 w-[3rem] h-[3rem] hover:text-red-700" />
        </button>
      </div>
      <div className="chat-display" ref={bottomDivRef}>
        {descendingOrderMessages.length === 0 && (
          <div className="mr-[auto] ml-[auto] mt-[1rem] font-bold text-gray-500">
            Przywitaj sie z {clickedUser?.first_name}
          </div>
        )}
        {descendingOrderMessages.map((message, index) => (
          <div
            key={index}
            className={
              message.name === user.first_name
                ? "user_message"
                : "not_user_message"
            }
          >
            {index === 0 ? (
              <div>
                <div className="img-container">
                  <img src={message.img} alt={message.name + " profile"} />
                </div>
              </div>
            ) : (
              descendingOrderMessages[index - 1]?.name !== message.name && (
                <div>
                  <div className="img-container">
                    <img src={message.img} alt={message.name + " profile"} />
                  </div>
                </div>
              )
            )}
            {user.first_name === message.name ? (
              <div>
                <button
                  className=" hover:bg-gray-200 hover:cursor-pointer rounded-md p-2"
                  onClick={() => deleteMessage(message._id)}
                >
                  <FaRegTrashAlt className="text-red-600" />
                </button>
                <p>{message.message}</p>
              </div>
            ) : (
              <p>{message.message}</p>
            )}
          </div>
        ))}
      </div>

      <ChatInput
        user={user}
        clickedUser={clickedUser}
        fetchMessages={fetchMessages}
        setReloadChatMembers={setReloadChatMembers}
        reloadChatMembers={reloadChatMembers}
      />
    </div>
  );
};

export default ChatDisplay;
