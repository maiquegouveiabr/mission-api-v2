"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { Cookie } from "puppeteer";
import icon from "@/img/naruto-icon.png";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    const isDev = process.env.NODE_ENV === "development";
    const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
    if (!username || !password) {
      alert("Both fields are required!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${url}/api/mission/cookies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const cookies: Cookie[] = await response.json();
      if (cookies) {
        const REFRESH_TOKEN = cookies.find((cookie) => cookie.name === "oauth-abw_refresh_token");
        if (REFRESH_TOKEN) {
          localStorage.setItem("REFRESH_TOKEN", REFRESH_TOKEN.value);
          router.push(`/mission/unassigned?refreshToken=${REFRESH_TOKEN?.value}`);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  useEffect(() => {
    document.title = "Shrek Plus - Referral Manager";
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = icon.src;
      link.className = styles.icon;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = icon.src;
      document.head.appendChild(newLink);
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.labelContainer}>
        <label className={styles.label}>Username</label>
      </div>
      <input
        type="text"
        className={styles.input}
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div className={styles.labelContainer}>
        <label className={styles.label}>Password</label>
      </div>
      <input
        type="password"
        className={styles.input}
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button disabled={isLoading} className={styles.loginButton} onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
