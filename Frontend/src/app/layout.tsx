import React from "react";
import TopBar from "../components/TopBar";
import "../styles/globals.css";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-graphite via-graphite to-charcoal text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <TopBar />
        <main className="mt-10 flex flex-1 items-start justify-center">
          {children}
        </main>
      </div>
    </div>
  );
}
