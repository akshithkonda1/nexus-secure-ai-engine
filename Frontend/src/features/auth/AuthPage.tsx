import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs";
import { useSession } from "@/shared/state/session";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof LoginSchema>;

const Providers = {
  google: import.meta.env.VITE_AUTH_GOOGLE_URL || "/api/auth/google",
  facebook: import.meta.env.VITE_AUTH_FACEBOOK_URL || "/api/auth/facebook",
  x: import.meta.env.VITE_AUTH_X_URL || "/api/auth/x",
};

function SocialButtons() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button type="button" variant="secondary" onClick={() => (location.href = Providers.google)}>
        Google
      </Button>
      <Button type="button" variant="secondary" onClick={() => (location.href = Providers.facebook)}>
        Facebook
      </Button>
      <Button type="button" variant="secondary" onClick={() => (location.href = Providers.x)}>
        X
      </Button>
    </div>
  );
}

export default function AuthPage() {
  const { setUser } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  const submit = async (data: LoginForm, endpoint: "/api/auth/login" | "/api/auth/register") => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      alert("Authentication failed");
      return;
    }
    const json = (await res.json()) as { token: string | null; user: { id: string; email: string; name?: string } };
    setUser(json.user, json.token);
    location.assign("/");
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Welcome back</h1>
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="create">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4 mt-4">
          <form onSubmit={handleSubmit((data) => submit(data, "/api/auth/login"))} className="space-y-3">
            <Input
              placeholder="Email"
              type="email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            <Input
              placeholder="Password"
              type="password"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <Button disabled={isSubmitting} className="w-full rounded-xl">
              Sign in
            </Button>
          </form>
          <div className="text-center text-sm text-neutral-500">or continue with</div>
          <SocialButtons />
        </TabsContent>

        <TabsContent value="create" className="space-y-4 mt-4">
          <form onSubmit={handleSubmit((data) => submit(data, "/api/auth/register"))} className="space-y-3">
            <Input
              placeholder="Email"
              type="email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            <Input
              placeholder="Password (min 6)"
              type="password"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <Button disabled={isSubmitting} className="w-full rounded-xl">
              Create account
            </Button>
          </form>
          <div className="text-center text-sm text-neutral-500">or continue with</div>
          <SocialButtons />
        </TabsContent>
      </Tabs>
    </div>
  );
}
