import React from "react";
import { RTBFForm } from "@/components/rtbf-form";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <section className="bg-slate-900 text-white py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg md:text-xl text-slate-200 mb-6">
              Dear &lt;Company&gt;,
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Please Forget Me.
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mt-8">
              AIs are learning about you. Exercise your Right To Be Forgotten.
            </p>
          </div>
        </section>

        <section className="bg-slate-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6 text-slate-700">
              <p className="text-lg leading-relaxed">
                In today&apos;s increasingly AI-driven world, it is likley your personal data is being used to train Large Language Models and other AI systems. Under data protection regulations such as Europe&apos;s <a href="https://gdpr-info.eu/art-17-gdpr/" className="text-blue-600 hover:text-blue-800 underline">GDPR</a> you may have the legal right to request removal of your personal data from these systems.
              </p>

              <p className="text-lg leading-relaxed">
                <i>Please Forget Me</i> helps you exercise your <i>Right to be Forgotten</i> with major AI companies by assisting with request creation and submission. Whether your data was processed without consent, contains inaccuracies, or you&apos;re concerned about its impact on your privacy, you can request its removal.
              </p>

              <p className="text-lg leading-relaxed text-slate-500">
                Note: While the <i>Right to be Forgotten</i> is a fundamental right under regulations such as GDPR, companies may have legitimate grounds to retain certain data.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <RTBFForm />
        </div>
      </section>
    </main>
  );
}
