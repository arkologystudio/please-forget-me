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
  organisations,
  reasons,
  rtbfFormSchema,
  type RTBFFormValues,
} from "@/schemas/rtbf-form-schema";
import { Progress } from "@/components/ui/progress";
import CountrySelect from "@/components/ui/country-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

// import { SignatureCanvas } from "@/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitRTBF } from "@/app/actions/submit-rtbf";
import { requestEmailVerification, verifyEmailCode } from "@/app/actions/email-verification";

export function RTBFForm() {
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

  const form = useForm<RTBFFormValues>({
    resolver: zodResolver(rtbfFormSchema),
    defaultValues: {
      organisations: [],
      reasons: [],
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      birthDate: "",
      prompts: [],
      evidence: {
        openai: { chatLinks: [] },
        anthropic: { chatLinks: [] },
        meta: { chatLinks: [] },
      },
      authorization: false,
      signature: "",
    },
    mode: "onChange",
  });
  //////////////////////////////
  // FORM STEPS VALIDATION
  //////////////////////////////
  const isStep1Valid = () => {
    const values = form.getValues();
    const isValid =
      values.organisations.length > 0 && values.reasons.length > 0;
    if (!isValid) {
      console.log("Step 1 is not valid:", values);
    }
    return isValid;
  };

  const isStep2Valid = () => {
    const values = form.getValues();
    const isValid = (values.prompts?.length ?? 0) > 0;
    if (!isValid) {
      console.log("Step 2 is not valid:", values);
    }
    return isValid;
  };

  const isStep3Valid = () => {
    const values = form.getValues();
    const isValid = !!(
      values.firstName?.trim() &&
      values.lastName?.trim() &&
      values.email?.trim() &&
      values.birthDate?.trim() &&
      values.country?.trim()
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
      console.log("Step 4 is not valid:", values);
    }
    return isValid;
  };

  //////////////////////////////
  // FORM SUBMISSION
  //////////////////////////////
  async function onSubmit(data: RTBFFormValues) {
    console.log("Form submission started", { data, isValid: form.formState.isValid });
    try {
      setIsSubmitting(true);
      
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
      const response = await submitRTBF(data);
      console.log("submitRTBF response:", response);

      if (!response.success) {
        throw new Error(response.error || "Failed to submit request");
      }

      toast({
        title: "Success!",
        description: "Your request has been submitted successfully.",
      });
      
      window.location.href = '/success';
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred while submitting your request',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSendVerificationCode = async () => {
    try {
      const userEmail = form.getValues("email");
      const result = await requestEmailVerification(userEmail);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification code');
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
      const result = await verifyEmailCode(userEmail, verificationCode);

      if (!result.success) {
        throw new Error(result.error || 'Invalid verification code');
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

  const generateSummaryCard = (formData: RTBFFormValues) => {
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
              <p className="text-muted-foreground">Right to Be Forgotten</p>
            </div>
            <div>
              <p className="font-medium">Est. Response Time</p>
              <p className="text-muted-foreground">14-28 days</p>
            </div>
            <div>
              <p className="font-medium">Prompts Provided</p>
              <p className="text-muted-foreground">
                {formData.prompts?.length || 0} prompt(s)
              </p>
            </div>
            <div>
              <p className="font-medium">Selected Reasons</p>
              <p className="text-muted-foreground">
                {formData.reasons.length} reason(s)
              </p>
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
      {step === 1 ? (
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Right To Be Forgotten
          </h2>
          <p className="text-muted-foreground">
            This request, if successful, ensures that AI Language Models refrain
            from answering questions or revealing personal information about
            you.
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
                    <div className="space-y-4">
                      <p>
                        Please remove my personal data from your systems, for
                        the following reasons:
                      </p>
                      <FormField
                        control={form.control}
                        name="reasons"
                        rules={{
                          required: "Please select at least one reason",
                        }}
                        render={() => (
                          <FormItem>
                            <div className="space-y-2">
                              {reasons.map((reason) => (
                                <FormField
                                  key={reason.id}
                                  control={form.control}
                                  name="reasons"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            reason.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            const value = field.value || [];
                                            return checked
                                              ? field.onChange([
                                                  ...value,
                                                  reason.id,
                                                ])
                                              : field.onChange(
                                                  value.filter(
                                                    (val) => val !== reason.id
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <div className="flex items-center space-x-2">
                                        <FormLabel className="text-sm">
                                          {reason.label}
                                        </FormLabel>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="w-80 text-sm">
                                                {reason.tooltip}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
            <div className="space-y-4 border-b pb-4 mb-6">
              <h3 className="font-medium">System Interaction Details</h3>
              <p>
                The following information assists organisations to identify and
                remove your personal data from their systems.
              </p>
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
            </div>

            <div className="space-y-4">
              {form.watch("organisations").map((organisationId) => {
                const organisation = organisations.find(
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
                      className="hidden px-4 py-3 space-y-4 border-t"
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
            <div className="space-y-2">
              <h3 className="font-medium">Personal Information</h3>
              <p>
                The following information is included in your Right to be
                Forgotten request to ensure organisations can 1) identify you
                and 2) remove your personal data from their systems.
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

            {/* <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <PhoneInput placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

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
        )}

        {step === 4 && (
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
                  disabled={cardIndex === form.getValues("organisations").length - 1}
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
                        onCheckedChange={(checked) => field.onChange(checked === true)}
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

              {/* <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature</FormLabel>
                    <FormControl>
                      <SignatureCanvas
                        {...field}
                        isConfirmed={isSignatureConfirmed}
                        onConfirmChange={(confirmed) => {
                          console.log("Confirm change called:", confirmed);
                          setIsSignatureConfirmed(confirmed);
                        }}
                        onSignatureChange={(value) => {
                          console.log(
                            "Signature change called:",
                            value.slice(0, 50) + "..."
                          );
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!isVerified || isSubmitting}
                >
                 Next
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 5 && (
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
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!isVerified || isSubmitting || !form.formState.isValid}

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
