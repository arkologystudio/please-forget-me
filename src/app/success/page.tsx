import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircledIcon className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Request Submitted Successfully!
          </h1>

          <div className="space-y-4 text-slate-600">
            <p className="text-lg">
              Your request has been sent to the selected organizations.
            </p>

            <p>
              We&apos;ve sent a confirmation email to your inbox with details
              about your request. Organizations typically respond within 14-28
              days.
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-500">
            <p>Need to submit another request?</p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
