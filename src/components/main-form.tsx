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
  MainFormSchema,
  type MainFormValues,
} from "@/schemas/main-form-schema";
import { Progress } from "@/components/ui/progress";
import CountrySelect from "@/components/ui/country-select";

// import { SignatureCanvas } from "@/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitRequest } from "@/app/actions/submit-request";
import {
  requestEmailVerification,
  verifyEmailCode,
} from "@/app/actions/email-verification";
import { organisations, organisationsWithEvidenceFields } from "@/constants/organisation";
import { z } from "zod";
import { personalInfoFormSchema, PersonalInfoFormValues } from "@/schemas/personal-info-form-schema";
import { rtbhFormSchema, RTBHFormValues } from "@/schemas/rtbh-form-schema";

export function MainForm({ selectedForms, closeForm }: { selectedForms: string[], closeForm: () => void }) {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;
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

  const form = useForm<PersonalInfoFormValues & RTBHFormValues>({
    resolver: zodResolver(
      z.object({
        ...personalInfoFormSchema.shape,
        ...(selectedForms.includes("RTBH") ? rtbhFormSchema.shape : {}),
      })
    ),
    defaultValues: {
      organisations: [],
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      birthDate: "",
      authorization: false,
      ...(selectedForms.includes("RTBH") && {
        prompts: [],
        evidence: {},
      }),
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
    if (!selectedForms.includes("RTBH")) return true;
    
    const values = form.getValues();
    const isValid = !!(
      values.prompts?.length > 0 &&
      Object.keys(values.evidence || {}).length > 0
    );
    
    if (!isValid) {
      console.log("Step 3 is not valid:", values);
    }
    return isValid;
  };

  const isStep4Valid = () => {
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
  async function onSubmit(data: PersonalInfoFormValues & RTBHFormValues) {
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

      console.log("Calling submitRTBF...");
      const requests = selectedForms.map((form) => requests[form]);
      console.log("requests:", requests);
      const response = await submitRequest(data, requests);
      console.log("submitRTBF response:", response);

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

  const generateSummaryCard = (formData: MainFormValues) => {
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
              <p className="font-medium">Requests</p>
              <div className="text-muted-foreground">
                {selectedForms.map((form) => (
                  <p key={form}>
                    {form === "RTBF" ? "Right to Be Forgotten (Right to Erasure)" : 
                     form === "RTBH" ? "Right to Be Hidden" :
                     form === "RTOOT" ? "Opt Out of AI Training" : form}
                  </p>
                ))}
              </div>
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

const step1 = () => {
  if (step !== 1) return null;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Select Organisations
        </h2>
        <p className="font-medium text-muted-foreground">
          Which organisations would you like this request to?
        </p>
        <div className="h-px bg-border mt-6" />
      </div>
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
                      form.setValue("organisations", [], { shouldValidate: true });
                    } else {
                      form.setValue("organisations", allOrgs, { shouldValidate: true });
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
      <Progress
          value={((step - 1) / (TOTAL_STEPS - 1)) * 100}
          className="mb-6 animate-in fade-in duration-500"
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
  );
};

const step2 = () => {
  if (step !== 2) return null;

  return (
    <>
            <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Personal Information
        </h2>
        <p className="font-medium text-muted-foreground">
        The following information is included in your Right to be
                Forgotten request to ensure organisations can 1) identify you
                and 2) remove your personal data from their systems.
        </p>
        <div className="h-px bg-border mt-6" />
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
            <Progress
          value={((step - 1) / (TOTAL_STEPS - 1)) * 100}
          className="mb-6 animate-in fade-in duration-500"
        />

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="button"
                onClick={selectedForms.includes("RTBH") ? nextStep : () => setStep(step+2)}
                disabled={!isStep2Valid()}
              >
                Continue
              </Button>
            </div>
          </>
  )
}

const step3 = () => {
  console.log("Selected Forms", selectedForms);
  console.log("Step", step);
  if (step !== 3 || !selectedForms.includes("RTBH")) return null;
  return (
    <>
              <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
        System Interaction Details (Right to be Hidden)
        </h2>
        <p className="font-medium text-muted-foreground">
        The following information assists AI organisations to prevent their models from revealing your personal information.
        </p>
        <div className="h-px bg-border mt-6" />
            </div>

              <FormField
                control={form.control}
                name="prompts"
                rules={{ required: "At least one prompt is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="prompts">
                      Prompts Used (Separate by comma)
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="prompts"
                        placeholder="Prompts that reveal your personal data (e.g., 'Where does Joe Shmoe live?')"
                        value={field.value?.[field.value.length - 1] || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          field.onChange(newValue ? [newValue] : []);
                        }}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="space-y-4">
              {form.watch("organisations").map((organisationId) => {
                const organisation = organisationsWithEvidenceFields.find(
                  (c) => c.slug === organisationId
                );
                if (!organisation) return null;

                return (
                  <div key={organisationId} className="border rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        const element = document.getElementById(
                          `org-content-${organisationId}`
                        );
                        element?.classList.toggle("hidden");
                      }}
                      className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors rounded-lg"
                    >
                      <h3 className="font-medium">
                        {organisation.label} Evidence
                      </h3>
                      <svg
                        className="w-5 h-5 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <div
                      id={`org-content-${organisationId}`}
                      className="hidden px-4 py-3 space-y-4 border-t bg-slate-50"
                    >
                      {organisation.evidenceFields.chatLinks && (
                        <FormField
                          control={form.control}
                          name={`evidence.${organisationId}.chatLinks`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor={`${organisation.slug}-chatlinks`}
                              >
                                {organisation.evidenceFields.chatLinks?.label}
                              </FormLabel>
                              <div className="space-y-2">
                                {(!field.value?.length
                                  ? [""]
                                  : field.value
                                ).map((link, index) => (
                                  <div key={index} className="flex gap-2">
                                    <FormControl>
                                      <Input
                                        id={`${organisation.slug}-chatlinks-${index}`}
                                        placeholder={
                                          organisation.evidenceFields.chatLinks
                                            ?.placeholder
                                        }
                                        value={link}
                                        onChange={(e) => {
                                          const newLinks = [
                                            ...(field.value || []),
                                          ];
                                          newLinks[index] = e.target.value;
                                          field.onChange(newLinks);
                                        }}
                                      />
                                    </FormControl>
                                    {(field.value || []).length > 1 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          const newLinks =
                                            field.value?.filter(
                                              (_, i) => i !== index
                                            ) || [];
                                          field.onChange(newLinks);
                                        }}
                                      >
                                        ✕
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    field.onChange([
                                      ...(field.value || []),
                                      "",
                                    ]);
                                  }}
                                >
                                  Add Another Link
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name={`evidence.${organisationId}.additionalNotes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor={`${organisation.slug}-additional-notes`}
                            >
                              Additional Notes (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                id={`${organisation.slug}-additional-notes`}
                                placeholder="Any additional context or information..."
                                value={field.value || ""}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Progress
          value={((step - 1) / (TOTAL_STEPS - 1)) * 100}
          className="mb-6 animate-in fade-in duration-500"
        />

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStep3Valid()}
              >
                Continue
              </Button>
            </div>
            </>
  )
}


const step4 = () => {
  if (step !== 4) return null;

  return (
    <>
            <div className="space-y-8">
              
            <h2 className="text-2xl font-bold tracking-tight">
          Review Requests
        </h2>
              
        <div className="h-px bg-border" />

      <p className="text-sm text-muted-foreground">
                  Request {cardIndex + 1} of{" "}
                  {form.getValues("organisations").length}
                </p>

              {generateSummaryCard(form.getValues())}
              {form.getValues("organisations").length > 1 && (
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
              </div>)}

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
              <Progress
          value={((step - 1) / (TOTAL_STEPS - 1)) * 100}
          className="mb-6 animate-in fade-in duration-500"
        />

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!isStep4Valid()}
                  onClick={nextStep}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
  )
}

const step5 = () => {
  if (step !== 5) return null;

  return (
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
                <Button type="button" variant="outline" onClick={selectedForms.includes("RTBH") ? prevStep : () => setStep(step-2)}>
                  Back
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!isVerified || isSubmitting}
                  onClick={() => onSubmit(form.getValues())}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </>
  )
}

  ////////////
  // FORM
  ////////////
  return (
    <Form {...form}>
      

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <button
        type="button"
        onClick={closeForm}
        className="relative float-right -mt-4 -mr-4 w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 border border-border rounded-full transition-colors"
        aria-label="Close form"
      >
        <span className="sr-only">Close</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      {step1()}
      {step2()}
      {step3()}
      {step4()}
      {step5()}
      </form>
    </Form>
  );
}
