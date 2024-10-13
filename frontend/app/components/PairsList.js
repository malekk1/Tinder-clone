import React, { useContext, useEffect, useState } from "react";
const { AuthContext } = require("./AuthProvider");
import axios from "axios";
import { MdOutlineMessage } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";

const PairsList = ({ match, setClickedUser }) => {
  const { dispatch, user } = useContext(AuthContext);
  const [matches, setMatches] = useState(null);
  const [deleteMatch, setDeleteMatch] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/getMatch/${match.email}`, {
        withCredentials: true,
      })
      .then((res) => {
        setMatches(res.data.matchingUser);
      })
      .catch((err) => console.log(err.response.data.message));
  }, [match]);

  useEffect(() => {
    const handleDeleteMatch = async () => {
      if (deleteMatch) {
        try {
          await axios.delete(
            `http://localhost:5000/deleteMatch/${user.email}`,
            {
              data: { email: deleteMatch },
              withCredentials: true,
            }
          );

          await axios.put(
            `http://localhost:5000/updateDislikes/${user.email}`,
            {
              data: { newDislike: deleteMatch },
            },
            { withCredentials: true }
          );

          const res = await axios.get(
            `http://localhost:5000/user/${user.email}`,
            {
              withCredentials: true,
            }
          );
          console.log(res.data);
          dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
        } catch (error) {
          console.error(error);
        }
      }
    };
    handleDeleteMatch();
  }, [deleteMatch]);

  return (
    <div className="pl-2 pr-2 flex flex-col">
      {matches && (
        <div>
          <div>
            <div className="mt-2 hover:bg-gray-50 rounded-md">
              <div className="flex justify-between">
                <div className="flex flex-row gap-2">
                  <img
                    src={matches.image}
                    alt="match_image"
                    className="rounded-full"
                    style={{ width: "3rem", height: "3rem" }}
                  />
                  <div className="flex gap-1 ">
                    <p className=" font-bold pt-3 pb-3">{matches.first_name}</p>
                    <p className=" font-bold pt-3 pb-3">
                      {new Date().getFullYear() -
                        new Date(matches.birth_date).getFullYear()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-[1em] justify-center align-center">
                  <button
                    className=" hover:bg-gray-200 hover:cursor-pointer rounded-md p-2"
                    onClick={() => {
                      setClickedUser(matches);
                    }}
                  >
                    <MdOutlineMessage />
                  </button>
                  <button
                    className=" hover:bg-gray-200 hover:cursor-pointer rounded-md p-2"
                    onClick={() => {
                      setDeleteMatch(matches.email);
                    }}
                  >
                    <FaRegTrashAlt className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PairsList;
