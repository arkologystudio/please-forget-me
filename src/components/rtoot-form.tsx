"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  rtootFormSchema,
  type RTOOTFormValues,
} from "@/schemas/rtoot-form-schema";
import { Progress } from "@/components/ui/progress";
import CountrySelect from "@/components/ui/country-select";

// import { SignatureCanvas } from "@/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitRTOOT } from "@/app/actions/submit-rtoot";
import {
  requestEmailVerification,
  verifyEmailCode,
} from "@/app/actions/email-verification";
import { organisations } from "@/constants/organisation";

export function RTOOTForm({ closeForm }: { closeForm: () => void }) {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;
  // const [isSignatureConfirmed, setIsSignatureConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const nextCard = () => {
    const selectedOrgs = form.getValues("organisations");
    setCardIndex((prev) => Math.min(prev + 1, selectedOrgs.length - 1));
  };

  const prevCard = () => {
    setCardIndex((prev) => Math.max(prev - 1, 0));
  };

  const form = useForm<RTOOTFormValues>({
    resolver: zodResolver(rtootFormSchema),
    defaultValues: {
      organisations: [],
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      birthDate: "",
      authorization: false,
    },
    mode: "onChange",
  });
  //////////////////////////////
  // FORM STEPS VALIDATION
  //////////////////////////////
  const isStep1Valid = () => {
    const values = form.getValues();
    const isValid = values.organisations.length > 0;
    if (!isValid) {
      console.log("Step 1 is not valid:", values);
    }
    return isValid;
  };

  const isStep2Valid = () => {
    const values = form.getValues();
    const isValid = !!(
      values.firstName?.trim() &&
      values.lastName?.trim() &&
      values.email?.trim() &&
      values.birthDate?.trim() &&
      values.country?.trim()
    );
    if (!isValid) {
      console.log("Step 2 is not valid:", values);
    }
    return isValid;
  };

  const isStep3Valid = () => {
    const values = form.getValues();
    const isValid = !!values.authorization;
    if (!isValid) {
      console.log("Step 3 is not valid:", values);
    }
    return isValid;
  };

  //////////////////////////////
  // FORM SUBMISSION
  //////////////////////////////
  async function onSubmit(data: RTOOTFormValues) {
    console.log("Form submission started", {
      data,
      isValid: form.formState.isValid,
    });
    try {
      setIsSubmitting(true);
      // Add artificial delay for UX
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (!isVerified) {
        console.log("Submission blocked: Email not verified");
        toast({
          title: "Error",
          description: "Please verify your email before submitting",
          variant: "destructive",
        });
        return;
      }

      console.log("Calling submitRTOOT...");
      const response = await submitRTOOT(data);
      console.log("submitRTOOT response:", response);

      if (!response.success) {
        throw new Error(response.error || "Failed to submit request");
      }

      toast({
        title: "Success!",
        description: "Your request has been submitted successfully.",
      });

      window.location.href = "/success";
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while submitting your request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSendVerificationCode = async () => {
    try {
      const userEmail = form.getValues("email");
      if (process.env.NEXT_PUBLIC_IS_DEV === "true") {
        console.log("Skipping email verification in development mode");
      } else {
        const result = await requestEmailVerification(userEmail);
        if (!result.success) {
          throw new Error(result.error || "Failed to send verification code");
        }
      }

      setVerificationSent(true);
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyCode = async () => {
    try {
      const userEmail = form.getValues("email");
      if (process.env.NEXT_PUBLIC_IS_DEV === "true") {
        console.log("Skipping email verification in development mode");
      } else {
        const result = await verifyEmailCode(userEmail, verificationCode);

        if (!result.success) {
          throw new Error(result.error || "Invalid verification code");
        }
      }

      setIsVerified(true);
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateSummaryCard = (formData: RTOOTFormValues) => {
    const selectedOrgs = formData.organisations;
    if (selectedOrgs.length === 0) return null;

    const org = selectedOrgs[cardIndex];
    const orgDetails = organisations.find((o) => o.slug === org);

    return (
      <Card key={org} className="mb-4">
        <CardHeader>
          <CardTitle>{orgDetails?.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Request Type</p>
              <p className="text-muted-foreground">
                Right to Opt Out of AI Training
              </p>
            </div>
            <div>
              <p className="font-medium">Est. Response Time</p>
              <p className="text-muted-foreground">14-28 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  ////////////
  // FORM
  ////////////
  return (
    <Form {...form}>
      <button
        type="button"
        onClick={closeForm}
        className="absolute top-0 right-2 text-xl font-bold"
        aria-label="Close form"
      >
        ×
      </button>
      {step === 1 ? (
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Right to Opt Out of AI Training
          </h2>
          <p className="text-muted-foreground">
            This request, if successful, ensures that your data will not be used
            to train AI models.
          </p>
          <div className="h-px bg-border mt-6" />
        </div>
      ) : (
        <Progress
          value={((step - 1) / (TOTAL_STEPS - 1)) * 100}
          className="mb-6 animate-in fade-in duration-500"
        />
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <>
            <FormField
              control={form.control}
              name="organisations"
              rules={{ required: "Please select at least one organisation" }}
              render={() => (
                <FormItem>
                  <div className="space-y-4">
                    <FormLabel>Dear,</FormLabel>
                    <div className="space-y-2">
                      {organisations.map((organisation) => (
                        <FormField
                          key={organisation.slug}
                          control={form.control}
                          name="organisations"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    organisation.slug
                                  )}
                                  onCheckedChange={(checked) => {
                                    const value = field.value || [];
                                    return checked
                                      ? field.onChange([
                                          ...value,
                                          organisation.slug,
                                        ])
                                      : field.onChange(
                                          value.filter(
                                            (val) => val !== organisation.slug
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className={""}>
                                {organisation.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mb-2"
                        onClick={() => {
                          const allOrgs = organisations.map((org) => org.slug);
                          const currentValue = form.getValues("organisations");
                          if (currentValue.length === organisations.length) {
                            form.setValue("organisations", []);
                          } else {
                            form.setValue("organisations", allOrgs);
                          }
                        }}
                      >
                        {form.getValues("organisations").length ===
                        organisations.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStep1Valid()}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <h3 className="font-medium">Personal Information</h3>
              <p>
                The following information is included in your Right to Opt Out
                of AI Training request to ensure organisations can identify you
                and remove your personal data from their systems.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              rules={{ required: "Email is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              rules={{ required: "Date of birth is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country (Optional)</FormLabel>
                  <FormControl>
                    <CountrySelect
                      onChange={field.onChange}
                      className="w-full"
                      placeholder="Select your country"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStep2Valid()}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">
                  Almost there! Please review your requests below:
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Request {cardIndex + 1} of{" "}
                  {form.getValues("organisations").length}
                </p>
              </div>

              {generateSummaryCard(form.getValues())}

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevCard}
                  disabled={cardIndex === 0}
                >
                  Previous Request
                </Button>
                <Button
                  type="button"
                  onClick={nextCard}
                  disabled={
                    cardIndex === form.getValues("organisations").length - 1
                  }
                >
                  Next Request
                </Button>
              </div>

              <FormField
                control={form.control}
                name="authorization"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        required
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that I am the individual whose data this
                        request concerns and I authorize <i>Please Forget Me</i>{" "}
                        to submit this request on my behalf.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!isStep3Valid()}
                  onClick={nextStep}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">
                  Let&apos;s verify your request to make sure it&apos;s you.
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  We&apos;ll send a verification code to{" "}
                  {form.getValues("email")}
                </p>
              </div>

              <div className="space-y-4">
                {!verificationSent ? (
                  <Button type="button" onClick={handleSendVerificationCode}>
                    Send Verification Code
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      name="verificationCode"
                      render={() => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the code sent to your email"
                              value={verificationCode}
                              onChange={(e) =>
                                setVerificationCode(e.target.value)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={!verificationCode}
                    >
                      Verify Code
                    </Button>
                  </div>
                )}
              </div>
              <div className="h-4" />
              <div className="border-t border-border" />
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <button
                  onClick={() => console.log(form.getValues(), isVerified)}
                >
                  test
                </button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!isVerified || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
