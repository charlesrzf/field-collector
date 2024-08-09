import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "@/services/api";

export function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post("login/", data);

      if (response.estaLogado) {
        localStorage.setItem("user", JSON.stringify(response));
        router.push("/forms");
        return;
      }

      toast.error("Credenciais inválidas!");
    } catch (error: any) {
      toast.error(`Algo deu errado! ${error.message}`);
      reset();
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") ?? "[]");
    if (user?.estaLogado) router.push("/forms");
  }, []);

  return (
    <>
      <ToastContainer />

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your username below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Username</Label>
              <Input
                {...register("username")}
                id="username"
                type="text"
                placeholder="username"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password")}
                id="password"
                type="password"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Sign in</Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
