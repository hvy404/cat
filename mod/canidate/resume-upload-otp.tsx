"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time passcode must be 6 characters.",
  }),
});

function ResumeUploadOTP() {
  const [otpValue, setOtpValue] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("OTP submitted:", data);
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
                  {/* <FormLabel>One-Time Passocde</FormLabel> */}
                  <FormControl>
                    <div className="text-white font-semibold">
                      <InputOTP
                        maxLength={6}
                        {...field}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
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
