import React from "react";
import { useState } from "react";
import axios from "axios";

const ChatInput = ({
  user,
  clickedUser,
  fetchMessages,
  setReloadChatMembers,
  reloadChatMembers,
}) => {
  const [textArea, setTextArea] = useState("");

  const addMessage = async () => {
    if (textArea === "") return;
    const message = {
      time: new Date(),
      user_from_id: user.email,
      user_to_id: clickedUser.email,
      message: textArea,
    };

    try {
      await axios.post("http://localhost:5000/message", { message });
      fetchMessages();
      setReloadChatMembers(!reloadChatMembers);
      setTextArea("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="chat-input">
      <textarea
        value={textArea}
        placeholder="Napisz wiadomosc..."
        onChange={(e) => setTextArea(e.target.value)}
      />
      <button className="secondary-button" onClick={addMessage}>
        Wyslij
      </button>
    </div>
  );
};

export default ChatInput;
