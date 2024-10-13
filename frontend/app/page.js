"use client";

import Image from "next/image";

import { useState, useLayoutEffect, use } from "react";
import Login from "./login/page";
import MainPage from "./mainPage/page";
import AuthProvider from "@/app/components/AuthProvider";

import { Main } from "next/document";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyApp() {
  const router = useRouter();
  useLayoutEffect(() => {
    router.push("/login");
  }, []);
  return <div></div>;
}
