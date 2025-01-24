"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token == null) {
      router.push("/");
    } else {
        router.push("/dashboard");
    }
  }, []);
  return <>{children}</>;
};

export default CheckAuth;
