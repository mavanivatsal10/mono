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
import { useForm } from "react-hook-form";

export default function Login() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = () => {
    // check if user exists in json server
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center gap-4 lg:w-1/3 sm:w-1/2 w-full bg-white p-8 rounded-2xl">
        <Form {...form}>
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={form.handleSubmit(() =>
              onSubmit(form.getValues("email"), form.getValues("password"))
            )}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                  {}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
        <p className="mt-4">
          Don't have an account?{" "}
          <u>
            <Link to="/signup">Signup</Link>
          </u>{" "}
          for free
        </p>
      </div>
    </div>
  );
}
