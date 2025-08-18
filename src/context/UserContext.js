import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({
    name: "Пользователь",
    photo: null,
    username: null,
  });

  useEffect(() => {
    const isTelegramAvailable = window.Telegram && window.Telegram.WebApp;
    if (
      isTelegramAvailable &&
      window.Telegram.WebApp.initDataUnsafe?.user?.id
    ) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUserId(telegramUser.id);

      setUserData({
        name:
          telegramUser.first_name || telegramUser.username || "Пользователь",
        photo: telegramUser.photo_url || null,
        username: telegramUser.username,
      });
    } else {
      setUserId(6503537991); // test uchun mock ID
    }
  }, []);

  return (
    <UserContext.Provider value={{ userId, userData }}>
      {children}
    </UserContext.Provider>
  );
};
