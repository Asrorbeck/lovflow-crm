import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useTelegramBackButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initBackButton = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;

        // Initialize WebApp
        tg.ready();

        try {
          // Show back button
          tg.BackButton.show();

          // Handle back button click
          tg.BackButton.onClick(() => {
            navigate(-1);
          });
        } catch (error) {
          console.error("❌ Error setting up back button:", error);
        }
      }
    };

    // Try to initialize immediately
    initBackButton();

    // Also try after delays in case the script loads later
    const timeoutId1 = setTimeout(initBackButton, 500);
    const timeoutId2 = setTimeout(initBackButton, 2000);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);

      if (window.Telegram && window.Telegram.WebApp) {
        try {
          window.Telegram.WebApp.BackButton.hide();
        } catch (error) {
          console.error("❌ Error hiding back button:", error);
        }
      }
    };
  }, [navigate]);
};
