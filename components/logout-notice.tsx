"use client";
import { useEffect, useState } from "react";
export function LogoutNotice() {
  const [localOnly, setLocalOnly] = useState(false);
  useEffect(() => { setLocalOnly(new URLSearchParams(window.location.search).get("logout") === "local"); }, []);
  return localOnly ? <p className="logout-notice" role="status">You’re signed out on this device. We couldn’t reach the server to complete remote logout.</p> : null;
}
