"use client";
import React, { useState, useRef, useEffect, useContext } from "react";

import logo from "@/public/tinder_logo.png";
import { AuthContext } from "@/app/components/AuthProvider";
import MenuList from "@/app/components/MenuList";

const navBar = ({ setClickedUser }) => {
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  let menuRef = useRef();

  useEffect(() => {
    let handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  return (
    <div className="flex justify-between items-center w-full h-20 border-b-2 border-gray-300">
      <div className="flex items-center justify-between">
        <div
          className="hover:cursor-pointer"
          onClick={() => setClickedUser(null)}
        >
          <img src={logo.src} className="h-[3rem]"></img>
        </div>
      </div>
      <div className="flex">
        <div
          className="menu-trigger"
          onClick={() => {
            setOpen(!open);
          }}
        >
          <img src={user.image}></img>
          <p>Profil</p>
        </div>
        <div
          className={`dropdown-menu ${open ? "active" : "inactive"}`}
          ref={menuRef}
        >
          <MenuList />
        </div>
      </div>
    </div>
  );
};

export default navBar;
