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
import { useContext } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "./components/Layout";

export default function Signup() {
  const { baseURL, setUserData } = useContext(GlobalContext);

  const schema = z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email(),
      password: z
        .string()
        .min(1, "Password is required")
        .min(3, "Password too short"),
      confirmPassword: z.string().min(1, "Confirm Password is required"),
      position: z.enum(["developer", "designer", "manager", "owner"]),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
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
      console.error("Error creating new user:", error);
      setUserData(null);
    }
  };

  return (
    <Layout formProp={form} type="signup" handleSubmit={onSubmit}>
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
              <Input placeholder="Password" {...field} type="password" />
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className={`w-full ${
                  form.formState.errors.position ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Developer </SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </Layout>
  );
}
