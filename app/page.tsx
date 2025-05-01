"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { Cookie } from "puppeteer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";

export default () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Missing credentials!");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch("/api/mission/cookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const cookies: Cookie[] = await response.json();
      if (cookies) {
        const REFRESH_TOKEN = cookies.find((cookie) => cookie.name === "oauth-abw_refresh_token");
        if (REFRESH_TOKEN) {
          localStorage.setItem("REFRESH_TOKEN", REFRESH_TOKEN.value);
          router.replace(`/mission/unassigned?refreshToken=${REFRESH_TOKEN?.value}`);
        }
      }
    } catch (error) {
      console.error(`LOGIN_ERROR=${error}`);
      alert(error);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div id="form" className="grid gap-5">
        <div className="grid max-w-sm items-center gap-1.5">
          <Label className="font-['Poppins-SemiBold',Helvetica] font-semibold" htmlFor="username">
            Username
          </Label>
          <Input
            className="w-[300px] font-['Poppins',Helvetica] focus-visible:ring-1"
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="grid max-w-sm items-center gap-1.5">
          <Label className="font-['Poppins-SemiBold',Helvetica] font-semibold" htmlFor="password">
            Password
          </Label>
          <div className="relative w-full">
            <Input
              className="w-[300px] font-['Poppins', Helvetica] focus-visible:ring-1 pr-10"
              type={show ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!show && <Eye onClick={() => setShow((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />}
            {show && <EyeClosed onClick={() => setShow((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />}
          </div>
        </div>
        <Button
          className="w-[300px] cursor-pointer bg-[#14213d] hover:bg-[#14213d] rounded-[3px] text-neutral-200 font-['Poppins-SemiBold',Helvetica] font-semibold text-sm"
          disabled={isLoading}
          onClick={handleLogin}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};
