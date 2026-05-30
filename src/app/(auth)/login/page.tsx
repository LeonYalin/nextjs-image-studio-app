"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is requered"),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const router = useRouter();
  const [ isPending, startTransition ] = useTransition();
  const [ serverError, setServerError ] = useState<string | null>(null);
  const { update } = useSession();

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await loginAction(null, formData);
      if (result.success) {
        await update(); // refresh nextauth cache so it will
        router.push("/");
        router.refresh();
      } else {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your photos</CardDescription>
        </CardHeader>
        <CardContent>
          {/* FormProvider replaces the old shadcn Form wrapper */}
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                  {serverError}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        disabled={isPending}
                        {...field}
                      />
                      {fieldState.error && (
                        <p className="text-xs font-medium text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        disabled={isPending}
                        {...field}
                      />
                      {fieldState.error && (
                        <p className="text-xs font-medium text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Sign Up
                </Link>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
