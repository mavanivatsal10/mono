import { Link, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { type JSX } from "react";
import { loginUerWithEmailAndPassword, loginWithGoogle } from "../lib/firebase";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(3, "Password too short"),
});

export default function Login(): JSX.Element {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (loading) return <div>Loading...</div>;
  if (user) navigate("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center gap-4 lg:w-1/3 sm:w-1/2 w-full bg-white p-8 rounded-2xl">
        <Form {...form}>
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={form.handleSubmit(() =>
              loginUerWithEmailAndPassword(
                form.getValues("email"),
                form.getValues("password")
              )
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
        <div className="flex items-center justify-center gap-2 w-full">
          <Separator className="flex-1" />
          <div className="text-sm text-gray-400">OR</div>
          <Separator className="flex-1" />
        </div>
        <Button
          variant="outline"
          className="hover:bg-gray-100 transition w-full"
          onClick={loginWithGoogle}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-gray-700">
            Sign in with Google
          </span>
        </Button>
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
