import React from "react";
import { RTBFForm } from "@/components/rtbf-form";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Please Forget Me
          </h1>
          <p className="text-xl md:text-2xl text-slate-300">
            AIs are learning about you. Exercise your Right To Be Forgotten.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <RTBFForm />
        </div>
      </section>
    </main>
  );
}
