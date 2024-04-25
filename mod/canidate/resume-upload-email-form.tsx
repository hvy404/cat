

/**
 * Component for rendering a form to upload a resume with an email input field.
 * Returns email input on callback.
 *
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define the form schema using zod
const FormSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

interface ResumeUploadEmailFormProps {
  onEmailSubmit: (email: string) => void; // Callback prop for when email is submitted
}

export function ResumeUploadEmailForm({
  onEmailSubmit,
}: ResumeUploadEmailFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    onEmailSubmit(data.email); // Call the callback with the email
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="sam@g2xchange.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
