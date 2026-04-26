import { useEffect, useState } from "react";
import crypto from "crypto";

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: "",
    ipAddress: "",
    browser: "",
    os: "",
    userAgent: "",
  });

  useEffect(() => {
    let mounted = true;

    const detect = async () => {
      let id = localStorage.getItem("deviceId");

      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("deviceId", id);
      }

      const ua = navigator.userAgent;

      let os = "Unknown";
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Mac")) os = "MacOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone")) os = "iOS";

      let browser = "Unknown";
      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";

      let ipAddress = "Unknown";
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        ipAddress = data?.ip || "Unknown";
      } catch {
        ipAddress = "Unknown";
      }

      if (!mounted) return;

      setDeviceInfo({
        deviceId: id,
        ipAddress,
        browser,
        os,
        userAgent: ua,
      });
    };

    detect();

    return () => {
      mounted = false;
    };
  }, []);

  return deviceInfo;
}
