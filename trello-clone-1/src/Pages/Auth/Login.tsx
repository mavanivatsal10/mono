import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";
import axios from "axios";
import Layout from "./components/Layout";

export default function Login() {
  const { baseURL, setUserData } = useContext(GlobalContext);
  const [userNotFound, setUserNotFound] = useState(false);

  const schema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(3, "Password too short"),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const response = await axios.get(`${baseURL}/users`);
      const currentUser = response.data.find(
        (user) => user.email === data.email && user.password === data.password
      );
      if (!currentUser) {
        setUserNotFound(true);
      }
      const dateFormattedUser = {
        ...currentUser,
        startDate: new Date(currentUser.startDate),
        endDate: new Date(currentUser.endDate),
      };
      setUserData(dateFormattedUser ? dateFormattedUser : null);
      window.localStorage.setItem(
        "userData",
        JSON.stringify(dateFormattedUser ? dateFormattedUser : null)
      );
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  };

  return (
    <Layout handleSubmit={onSubmit} type="login" formProp={form}>
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
              <Input placeholder="Password" {...field} type="password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {userNotFound && (
        <p className="text-red-500 text-sm">
          User not found. Please check your email and password.
        </p>
      )}
    </Layout>
  );
}
