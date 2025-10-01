// Telegram WebApp utility functions

export const isTelegramWebApp = () => {
  return window.Telegram && window.Telegram.WebApp;
};

export const getTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const initTelegramWebApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    // Initialize the WebApp
    tg.ready();

    // Set up the main button if needed
    tg.MainButton.setText("Главная");
    tg.MainButton.onClick(() => {
      window.location.href = "/";
    });

    return tg;
  }
  return null;
};

export const showBackButton = (onClick) => {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.BackButton.show();
      tg.BackButton.onClick(onClick);
      return true;
    } catch (error) {
      console.error("Error showing back button:", error);
      return false;
    }
  }
  return false;
};

export const hideBackButton = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.BackButton.hide();
      return true;
    } catch (error) {
      console.error("Error hiding back button:", error);
      return false;
    }
  }
  return false;
};

export const showMainButton = (text = "Главная", onClick) => {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.MainButton.setText(text);
      if (onClick) {
        tg.MainButton.onClick(onClick);
      }
      tg.MainButton.show();
      return true;
    } catch (error) {
      console.error("Error showing main button:", error);
      return false;
    }
  }
  return false;
};

export const hideMainButton = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.MainButton.hide();
      return true;
    } catch (error) {
      console.error("Error hiding main button:", error);
      return false;
    }
  }
  return false;
};
