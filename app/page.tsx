"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { Cookie } from "puppeteer";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Both fields are required");
      return;
    }

    try {
      const response = await fetch(
        "https://mission-api-v2.vercel.app/api/mission/cookies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const cookies: Cookie[] = await response.json();
      if (cookies) {
        const REFRESH_TOKEN = cookies.find(
          (cookie) => cookie.name === "oauth-abw_refresh_token"
        );
        if (REFRESH_TOKEN)
          localStorage.setItem("REFRESH_TOKEN", REFRESH_TOKEN.value);
        router.push(`/mission/unassigned?refreshToken=${REFRESH_TOKEN?.value}`); // Change the path as needed
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Username</label>
      <input
        type="text"
        className={styles.input}
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className={styles.label}>Password</label>
      <input
        type="password"
        className={styles.input}
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className={styles.button} onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
