import LoginButton from "./loginButton";
import LogoutButton from "./logoutButton";
import { getAccessTokenSilently, useAuth0 } from "@auth0/auth0-react";

const Header = () => {
const { isAuthenticated } = useAuth0();
//   const { user, getAccessTokenSilently } = useAuth0();

//     const fetchAccessToken = async () => {
//     try {
//       const token = await getAccessTokenSilently(
//         {
//           audience: "urn:labthingy:api",}
//       );
//       console.log("Access Token:", token);
//     } catch (error) {
//       console.error("Error fetching access token:", error);
//     }

  return (
    <header className="w-full max-w-6xl mx-auto flex items-center justify-between px-6 py-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Lab Thingy
      </h1>
      <nav>
        {isAuthenticated ? (
          <LogoutButton />
        ) : (
          <LoginButton />
        )}
      </nav>
    </header>
  );
}

export default Header;