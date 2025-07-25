import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { getAccessTokenSilently, useAuth0 } from "@auth0/auth0-react";

const Header = () => {
const { isAuthenticated } = useAuth0();

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
