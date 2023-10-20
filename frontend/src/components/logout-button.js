import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout, user } = useAuth0();

  const handleLogout = async () => {
    try {
      // Initiate asynchronous deletion process (send a request to delete the pod)
      fetch(`/compute/delete/${user.sub}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      // Logout the user immediately, without waiting for the deletion response
      logout({ logoutParams: { returnTo: window.location.origin } });
    } catch (error) {
      // Handle errors if needed
      console.error("Error initiating deletion process:", error);

      // Logout the user even if the deletion process fails
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
