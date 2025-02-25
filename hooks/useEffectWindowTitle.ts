import { WindowSettings } from "@/interfaces";
import { useEffect } from "react";
import icon from "@/img/naruto-icon.png";

export default function (window: WindowSettings) {
  useEffect(() => {
    document.title = window;
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = icon.src;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = icon.src;
      document.head.appendChild(newLink);
    }
  }, []);
}
