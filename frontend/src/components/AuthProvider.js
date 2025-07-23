import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const token = localStorage.getItem("jwt");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);
        } catch (err) {
          console.error("Invalid token in storage");
          setUser(null);
        }
      }
    }, []);
  
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
  };
  
  export default AuthProvider;
