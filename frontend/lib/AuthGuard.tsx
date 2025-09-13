"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }
  return <>{children}</>;
};

export default AuthGuard;
