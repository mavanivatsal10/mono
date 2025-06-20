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
import { useContext, useEffect } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function Signup() {
  const { baseURL, setUserData, userData } = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      navigate("/");
    }
  }, [userData]);

  const schema = z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email(),
      password: z
        .string()
        .min(1, "Password is required")
        .min(3, "Password too short"),
      confirmPassword: z.string().min(1, "Confirm Password is required"),
      position: z.string().min(1, "Position is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const response = await axios.get(`${baseURL}/users`);
      const isFound = response.data.some((user) => user.email === data.email);
      if (isFound) {
        alert("User already exists with this email");
        return;
      }
      const currentUser = {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        password: data.password,
        position: data.position,
        projects: [],
      };
      setUserData(currentUser);
      window.localStorage.setItem(
        "userData",
        JSON.stringify(currentUser ? currentUser : null)
      );
      const res = await axios.post(`${baseURL}/users`, currentUser);
      console.log("User created successfully:", res.data);
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
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Rewrite Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Position" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </Form>
        <p>
          Already have an account?{" "}
          <u>
            <Link to="/login">Log In</Link>
          </u>{" "}
          !
        </p>
      </div>
    </div>
  );
}
