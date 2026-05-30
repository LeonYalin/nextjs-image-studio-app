// src/app/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { registerAction } from "@/lib/actions";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(4, "Password must be at least 4 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Initialize methods object to pass down into FormProvider context
  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await registerAction(null, formData);

      if (result.success) {
        router.push("/login");
      } else {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join our gallery app to safely store your photos</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 2. Wrap your layout inside the primitive FormProvider */}
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">

              {serverError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                  {serverError}
                </div>
              )}

              {/* FIELD: FULL NAME */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Controller
                  name="name"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input id="name" placeholder="John Doe" disabled={isPending} {...field} />
                      {fieldState.error && (
                        <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* FIELD: EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Controller
                  name="email"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input id="email" type="email" placeholder="name@example.com" disabled={isPending} {...field} />
                      {fieldState.error && (
                        <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* FIELD: PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Controller
                  name="password"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input id="password" type="password" placeholder="••••••••" disabled={isPending} {...field} />
                      {fieldState.error && (
                        <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* FIELD: CONFIRM PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Controller
                  name="confirmPassword"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input id="confirmPassword" type="password" placeholder="••••••••" disabled={isPending} {...field} />
                      {fieldState.error && (
                        <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isPending}>
                {isPending ? "Creating Account..." : "Register"}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
