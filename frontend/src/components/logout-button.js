import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout, user } = useAuth0();

  const handleLogout = async () => {
    try {
      fetch(`/compute/delete/${user.sub}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      logout({ logoutParams: { returnTo: window.location.origin } });
    } catch (error) {
      console.error("Error initiating deletion process:", error);

      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  return (
    <button onClick={handleLogout} className="ide-button">
      Log Out
    </button>
  );
};

export default LogoutButton;
