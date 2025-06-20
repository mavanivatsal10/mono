import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";

export default function Layout({ handleSubmit, children, type, formProp }) {
  const { userData } = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      navigate("/");
    }
  }, [userData]);

  const form = formProp;
  const onSubmit = handleSubmit;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center gap-4 lg:w-1/3 sm:w-1/2 w-full bg-white p-8 rounded-2xl shadow-md">
        <Form {...form}>
          <form
            className="flex flex-col gap-4 w-full items-center"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {children}
            <Button type="submit" className="w-full">
              {type === "login" ? "Login" : "Signup"}
            </Button>
          </form>
        </Form>
        {type === "login" ? (
          <p>
            Don't have an account?{" "}
            <u>
              <Link to="/signup">Signup</Link>
            </u>{" "}
            for free
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <u>
              <Link to="/login">Log In</Link>
            </u>{" "}
            !
          </p>
        )}
      </div>
    </div>
  );
}
