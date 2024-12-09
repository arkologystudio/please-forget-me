import React from "react";
import { RTBFForm } from "@/components/rtbf-form";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg md:text-xl text-slate-400 mb-6">
            Dear &lt;Company&gt;,
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Please Forget Me
          </h1>
          <p className="text-xl md:text-2xl text-slate-300">
            AIs are learning about you. Exercise your Right To Be Forgotten.
          </p>
        </div>
      </section>

      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6 text-slate-700">
            <p className="text-lg leading-relaxed">
              In today&apos;s AI-driven world, your personal data is being used to train <a href="#" className="text-blue-600 hover:text-blue-800 underline">large language models</a> and other AI systems. Under the <a href="https://gdpr-info.eu/art-17-gdpr/" className="text-blue-600 hover:text-blue-800 underline">GDPR&apos;s Right to be Forgotten (Article 17)</a>, you have the legal right to request the deletion of your personal data from these systems.
            </p>

            <p className="text-lg leading-relaxed">
              <i>Please Forget Me</i> helps you exercise your Right to be Forgotten with major AI companies by assisting with request creation and submission. Whether your data was processed without consent, contains inaccuracies, or you're concerned about its impact on your privacy, you can request its removal. Companies must respond to your request within 30 days.
            </p>

            <p className="text-lg leading-relaxed">
              Note: While the <i>Right to be Forgotten</i> is a fundamental right under GDPR, companies may have legitimate grounds to retain certain data. <a href="#" className="text-blue-600 hover:text-blue-800 underline">Learn more about exceptions and limitations here</a>.
            </p>
          </div>
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
