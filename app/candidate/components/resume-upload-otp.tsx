"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyOtp } from "@/lib/otp/candidate-verify-otp";

interface ResumeUploadOTPProps {
  candidateID: string;
}

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time passcode must be 6 characters.",
  }),
});

function ResumeUploadOTP({ candidateID }: ResumeUploadOTPProps) {
  const [otpValue, setOtpValue] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit", // Change validation mode to onSubmit
    defaultValues: {
      pin: "",
    },
  });

  // Verify OTP and hndle return value verifyOtp
  const verifyOTP = async (otp: string) => {
    const actionType = "upload";
    const result = await verifyOtp(candidateID, otp, actionType);
    console.log("OTP verification result:", result);
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    verifyOTP(data.pin);

    // TODO: Begin onboard process to ingest resume and direct to the next page
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <div>
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="text-white font-semibold">
                      <InputOTP
                        maxLength={6}
                        {...field}
                        value={otpValue}
                        onChange={(value) => {
                          setOtpValue(value); // Maintain local state
                          form.setValue("pin", value, {
                            shouldValidate: false,
                          }); // Update form state without triggering validation
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="ring-0" />
                          <InputOTPSlot index={1} className="ring-0" />
                          <InputOTPSlot index={2} className="ring-0" />
                          <InputOTPSlot index={3} className="ring-0" />
                          <InputOTPSlot index={4} className="ring-0" />
                          <InputOTPSlot index={5} className="ring-0" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormDescription className="text-white">
                    Please enter the one-time passcode we sent to your email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={otpValue.length !== 6}>
            Confirm
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ResumeUploadOTP;
