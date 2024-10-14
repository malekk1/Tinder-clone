import React, { useContext, useState, useEffect } from "react";
import axios from "axios";

import { AuthContext } from "./AuthProvider";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";

const TinderCard = () => {
  const [foundedUser, setFoundedUser] = useState(null);

  const { user, dispatch } = useContext(AuthContext);

  useEffect(() => {
    let data = null;
    if (user.likes.length === 0 && user.Dislikes.length === 0) {
      data = "";
    } else if (user.Dislikes.length !== 0 && user.likes.length !== 0) {
      data = user.Dislikes.map((dislike) => dislike);
      data.push(...user.likes.map((like) => like));
    } else if (user.Dislikes.length !== 0) {
      data = user.Dislikes.map((dislike) => dislike);
    } else if (user.likes.length !== 0) {
      data = user.likes.map((match) => match);
    }

    axios
      .get(`http://localhost:5000/findUser/${user.email}`, {
        params: {
          genderInterest: user.interested_gender,
          emails: data,
          ageRange: user.age_range,
        },
        withCredentials: true,
      })
      .then((res) => {
        setFoundedUser(res.data);
      })
      .catch(() => {
        console.log("Brak pasujących użytkowników");
        setFoundedUser(null);
      });
  }, [user]);

  const currentDate = new Date();

  const handleLikeOrDislike = async (type) => {
    const endpoint =
      type === "like"
        ? `http://localhost:5000/updateMatches/${user.email}`
        : `http://localhost:5000/updateDislikes/${user.email}`;

    try {
      await axios.put(
        endpoint,
        {
          data: {
            [type === "like" ? "newMatch" : "newDislike"]: foundedUser.email,
          },
        },
        { withCredentials: true }
      );

      const res = await axios.get(`http://localhost:5000/user/${user.email}`, {
        withCredentials: true,
      });
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="main">
      <div className="container">
        {foundedUser ? (
          <div>
            <div className="photo">
              <img
                src={foundedUser?.image}
                alt="user-photo"
                className="user-photo"
              />
            </div>
            <div className="info">
              <div className="name">
                {`${foundedUser?.first_name}  `}

                {currentDate.getFullYear() -
                  new Date(foundedUser?.birth_date).getFullYear()}
              </div>
              <div></div>

              <div className="description">{foundedUser?.description}</div>
            </div>
          </div>
        ) : (
          <div className="h-[29rem] p-4 font-bold">
            Nie znaleźliśmy pasujących użytkowników. Zmień swoje preferencje aby
            zobaczyc nowych uzytkownikow albo odśwież strone.
          </div>
        )}
        <div className="buttons">
          <button
            onClick={() => handleLikeOrDislike("dislike")}
            disabled={foundedUser === null}
          >
            <CloseIcon className="text-red-500" />
          </button>
          <button
            onClick={() => handleLikeOrDislike("like")}
            disabled={foundedUser === null}
          >
            <FavoriteIcon className="text-green-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TinderCard;
