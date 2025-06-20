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
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { use, useContext, useEffect } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";
import axios from "axios";

export default function Login() {
  const { baseURL, userData, setUserData } = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      navigate("/");
    }
  }, [userData]);

  const schema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(3, "Password too short"),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const response = await axios.get(`${baseURL}/users`);
      const currentUser = response.data.find(
        (user) => user.email === data.email && user.password === data.password
      );
      setUserData(currentUser ? currentUser : null);
      window.localStorage.setItem(
        "userData",
        JSON.stringify(currentUser ? currentUser : null)
      );
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center gap-4 lg:w-1/3 sm:w-1/2 w-full bg-white p-8 rounded-2xl shadow-md -translate-y-8">
        <Form {...form}>
          <form
            className="flex flex-col gap-4 w-full items-center"
            onSubmit={form.handleSubmit(onSubmit)}
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
        <p>
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
