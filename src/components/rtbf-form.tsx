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
import { generateLetters, generatePreviewLetter } from "@/lib/schemas/rtbf-letter-template"

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
      birthDate: "",
      prompts: [],
      evidence: {
        openai: { chatLinks: [] },
        anthropic: { chatLinks: [] },
        meta: { chatLinks: [] }
      },
      authorization: false,
      signature: "",
    },
    mode: "onChange",
  })

  async function onSubmit(data: RTBFFormValues) {
    try {
      const letters = generateLetters(data)
      
      const response = await fetch('/api/submit-rtbf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: data,
          letters
        }),
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
                  
                  <div className="space-y-4">
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
                                />
                              </FormControl>
                              <FormLabel className={""}>
                                {company.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <p>I'd like to be forgotten.</p>
                    
                    <div className="space-y-4">
                    <p>Please remove my personal data from your systems, for the following reasons:</p>
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
                    </div>
                  </div>
                  <FormMessage />
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
            <div className="space-y-4 border-b pb-4 mb-6">
              <h3 className="font-medium">AI Interaction Details</h3>
              <FormField
                control={form.control}
                name="prompts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompts Used (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter prompts that reveal your personal data (e.g., 'Tell me about <your full name>', 'Where does <full name> live?')"
                        value={field.value?.[field.value.length - 1] || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          field.onChange(newValue ? [newValue] : []);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              {form.watch("companies").map((companyId) => {
                const company = companies.find(c => c.id === companyId)
                if (!company) return null

                return (
                  <div key={companyId} className="space-y-4 border-b pb-4 last:border-b-0">
                    <h3 className="font-medium"><b>{company.label} Evidence</b></h3>
                    
                    {company.evidenceFields.chatLinks && (
                      <FormField
                        control={form.control}
                        name={`evidence.${companyId}.chatLinks`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{company.evidenceFields.chatLinks.label}</FormLabel>
                            <div className="space-y-2">
                              {(!field.value?.length ? [''] : field.value).map((link, index) => (
                                <div key={index} className="flex gap-2">
                                  <FormControl>
                                    <Input 
                                      placeholder={company.evidenceFields.chatLinks?.placeholder}
                                      value={link}
                                      onChange={(e) => {
                                        const newLinks = [...(field.value || [])];
                                        newLinks[index] = e.target.value;
                                        field.onChange(newLinks.filter(Boolean));
                                      }}
                                    />
                                  </FormControl>
                                  {(field.value || []).length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        const newLinks = field.value?.filter((_, i) => i !== index) || [];
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
                                  field.onChange([...(field.value || []), '']);
                                }}
                              >
                                Add Another Link
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name={`evidence.${companyId}.additionalNotes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Any additional context or information..."
                              value={field.value || ''} 
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )
              })}
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
              <Button type="button" onClick={nextStep}>Continue</Button>
            </div>
          </>
        )}

        {step === 3 && (
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
              <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
              <Button 
                type="button" 
                onClick={nextStep} 
                disabled={
                  !form.getValues("firstName") || 
                  !form.getValues("lastName") || 
                  !form.getValues("email") || 
                  !form.getValues("country") ||
                  !form.getValues("birthDate")
                }
              >
                Continue
              </Button>
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
                  {generatePreviewLetter(form.getValues())}
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
                        I confirm that I am the individual whose data this request concerns (the data subject) and I authorize Please Forget Me to submit this request on my behalf.
                      </FormLabel>
                      <FormLabel>
                        I confirm I have read and understood my rights under GDPR Article 17, and I am requesting the erasure of my personal data.
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