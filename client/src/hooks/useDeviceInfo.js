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
      let id = 12345;

      const ua = navigator.userAgent;

      let os = "Windows";

      let browser = "Chrome";

      let ipAddress = "169.254.80.48";

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
