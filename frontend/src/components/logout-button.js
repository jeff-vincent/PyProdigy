import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout, user } = useAuth0();

  const handleLogout = async () => {
    try {
      // Fetch request to delete user data
      const response = await fetch(`/compute/delete/${user.sub}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });

      if (response.ok) {
        console.log("User data deleted successfully");
      } else {
        console.error("Failed to delete user data");
      }
    } catch (error) {
      console.error("Error deleting user data:", error);
    }

    // Logout the user after deleting data
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <button onClick={handleLogout} className="ide-button">
      Log Out
    </button>
  );
};

export default LogoutButton;
