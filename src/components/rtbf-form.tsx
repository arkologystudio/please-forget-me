"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { companies, reasons, rtbfFormSchema, type RTBFFormValues } from "@/lib/schemas/rtbf-form-schema"
import { Progress } from "@/components/ui/progress"
import CountrySelect from "@/components/ui/country-select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { PhoneInput } from "@/components/ui/phone-input"

export function RTBFForm() {
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 4

  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0))

  const form = useForm<RTBFFormValues>({
    resolver: zodResolver(rtbfFormSchema),
    defaultValues: {
      companies: [],
      reasons: [],
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      phone: "",
      evidence: {},
      authorization: false,
      signature: "",
    },
    mode: "onChange",
  })

  async function onSubmit(data: RTBFFormValues) {
    try {
      const response = await fetch('/api/submit-rtbf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit request')
      }
      
      // Handle success (e.g., show success message, redirect)
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Error submitting form:', error)
    }
  }

  const selectedCompanyNames = form.watch("companies").map(
    id => companies.find(c => c.id === id)?.label
  ).join(", ")

  // Helper function to generate the letter
  function generateLetter(data: RTBFFormValues) {
    const selectedCompanies = data.companies.map(id => 
      companies.find(c => c.id === id)
    ).filter(Boolean)
    
    const selectedReasons = data.reasons.map(id =>
      reasons.find(r => r.id === id)
    ).filter(Boolean)

    return `Dear ${selectedCompanies.map(c => c?.label).join(", ")},

I am writing to request the deletion of personal data under Article 17 of the General Data Protection Regulation (GDPR) on behalf of ${data.firstName} ${data.lastName}.

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country}

Reasons for Deletion:
${selectedReasons.map(r => `- ${r?.label}`).join("\n")}

${data.evidence.openai?.length ? `\nChatGPT Evidence Links:\n${data.evidence.openai.join("\n")}` : ""}
${data.evidence.anthropic?.length ? `\nClaude Evidence Links:\n${data.evidence.anthropic.join("\n")}` : ""}
${data.evidence.meta?.length ? `\nLLama Evidence Links:\n${data.evidence.meta.join("\n")}` : ""}

I look forward to receiving confirmation that you have complied with my request.

Best regards,
${data.firstName} ${data.lastName}`
  }

  // Custom validation for step 1
  const isStep1Valid = () => {
    const values = form.getValues()
    return values.companies.length > 0 && values.reasons.length > 0
  }

  return (
    <Form {...form}>
      <Progress value={((step-1) / (TOTAL_STEPS-1)) * 100} className="mb-6" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <>
            <FormField
              control={form.control}
              name="companies"
              rules={{ required: "Please select at least one company" }}
              render={() => (
                <FormItem>
                  <FormLabel>Dear,</FormLabel>
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <FormField
                        key={company.id}
                        control={form.control}
                        name="companies"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(company.id)}
                                onCheckedChange={(checked) => {
                                  const value = field.value || []
                                  return checked
                                    ? field.onChange([...value, company.id])
                                    : field.onChange(value.filter((val) => val !== company.id))
                                }}
                                disabled={company.id === "anthropic" || company.id === "meta"}
                              />
                            </FormControl>
                            <FormLabel className={company.id === "anthropic" || company.id === "meta" ? "text-gray-500" : ""}>
                              {company.label} {company.id === "anthropic" || company.id === "meta" ? "(Coming Soon)" : ""}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
              <p>I'd like to be forgotten, for the following reasons:</p>
            </div>
            <FormField
              control={form.control}
              name="reasons"
              rules={{ required: "Please select at least one reason" }}
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
                                checked={field.value?.includes(reason.id)}
                                onCheckedChange={(checked) => {
                                  const value = field.value || []
                                  return checked
                                    ? field.onChange([...value, reason.id])
                                    : field.onChange(value.filter((val) => val !== reason.id))
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center space-x-2">
                              <FormLabel className="text-sm">{reason.label}</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="w-80 text-sm">{reason.tooltip}</p>
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
                </FormItem>
              )}
            />
            <div className="flex space-x-2">
              <Button type="button" onClick={nextStep} disabled={!isStep1Valid()}>Continue</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <p>The following personal information is submitted to {selectedCompanyNames} in the Right to be Forgotten request.</p>
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
              name="country"
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
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
            />

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
              <Button 
                type="button" 
                onClick={nextStep} 
                disabled={!form.getValues("firstName") || !form.getValues("lastName") || !form.getValues("email") || !form.getValues("country")}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-4">
              {form.watch("companies").includes("openai") && (
                <>
                  <FormField
                    control={form.control}
                    name="evidence.openai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ChatGPT Chat Links (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://chat.openai.com/..."
                            onChange={(e) => field.onChange([...field.value || [], e.target.value])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evidence.prompts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ChatGPT Prompts</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tell me about yourself, What's my name, What do you know about me"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="evidence.urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL(s) containing the personal information (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/page-with-personal-info"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
              <Button type="button" onClick={nextStep}>Continue</Button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">That&apos;s it! Based on the information you provided, the following letter has been compiled:</h3>
              </div>

              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <pre className="whitespace-pre-wrap font-sans">
                  {generateLetter(form.getValues())}
                </pre>
              </div>

              <FormField
                control={form.control}
                name="authorization"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I represent that the information in this request is accurate and that I am authorized to submit it
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Type your full name" />
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
                  type="submit"
                  className="flex-1"
                  disabled={!form.watch("authorization") || !form.watch("signature")}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </>
        )}
      </form>
    </Form>
  )
} 