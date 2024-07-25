"use client";
import { Logo } from "@/components/Logo";
import { MadeBy } from "@/components/MadeBy";
import { LoginForm } from "@/components/Login";
import { License } from "@/components/License";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center w-screen h-dvh">
      <Logo />
      <MadeBy />
      <LoginForm />
      <License />
    </main>
  );
}
