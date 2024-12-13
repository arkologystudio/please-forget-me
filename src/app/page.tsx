'use client';

import React from "react";
import { RTBFForm } from "@/components/rtbf-form";

export default function Home() {
  const [showMore, setShowMore] = React.useState(false);

  const scrollToForm = () => {
    const formSection = document.getElementById('form-section');
    formSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-8 h-screen flex flex-col justify-end pb-4 ">
        <div className={`flex flex-col md:flex-row items-end justify-between gap-12 mb-24 transition-all duration-1000 ${showMore ? 'mb-24' : 'mb-0'}`}>
          <div className="space-y-4">
            <div>
              <div className="relative">
                <p className={`text-2xl md:text-4xl leading-tight text-slate-700 max-w-3xl font-bold flex items-center`}>
                  AIs are learning about you.
                  <span
                    onClick={() => setShowMore(!showMore)}
                    className="text-base text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-4 cursor-pointer border border-slate-300 rounded-full px-3 py-1"
                  >
                    Me?
                  </span>
                </p>
                <div className={`transition-all duration-500 ${showMore ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'} overflow-hidden`}>
                  <p className="text-lg text-slate-600 max-w-3xl mt-4">
                    Yes, you. Today, it is likley your personal data is being used without your consent to train Large Language Models and other AI systems. Under data protection regulations such as Europe's GDPR you may have the legal right to request removal of your personal data from these systems.
                  </p>
                  <p className="text-lg text-slate-600 max-w-3xl mt-4">
                    Whether your data was processed without consent, contains inaccuracies, or you're concerned about its impact on your privacy, you can request its removal.
                  </p>
                </div>
              </div>
              <p className="text-2xl md:text-4xl leading-tight text-slate-700 max-w-3xl mt-8">
                Please Forget Me helps exercise your Right To Be Forgotten from major AI companies, including OpenAI, Meta and Google.
              </p>
            </div>

            
          </div>
          
          <button 
            onClick={scrollToForm}
            className="text-xl md:text-2xl text-slate-900 hover:text-slate-700 underline transition-colors"
          >
            Forget Me
          </button>
        </div>
      </div>

      <div id="form-section" className="container mx-auto px-8 py-16 max-w-2xl">
        <RTBFForm />
      </div>
    </div>
  );
}
