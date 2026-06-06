"use client";

import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { update } = useSession();

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      const result = await loginAction(null, formData);
      if (result.success) {
        await update();
        router.push("/");
        router.refresh();
      } else {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Visual pane */}
      <div
        className="relative flex-1 min-w-0 flex flex-col justify-between p-10 overflow-hidden"
        style={{ display: "flex" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(145deg, rgba(12,13,15,.62), rgba(12,13,15,.30) 45%, rgba(12,13,15,.72))" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <BrandMark size={30} hole="#15171c" />
            <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-white leading-none">
              Image<span className="font-normal">Gallery</span>
            </span>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] text-white m-0">
            Every photo, beautifully in place.
          </h2>
          <p className="text-[15px] mt-3.5 leading-relaxed" style={{ color: "rgba(255,255,255,.78)" }}>
            Upload, browse and organize your memories into albums — all in one calm, private gallery.
          </p>
        </div>
      </div>

      {/* Form pane */}
      <div
        className="flex items-center justify-center p-8"
        style={{ flex: "0 0 clamp(380px, 38%, 520px)" }}
      >
        <div className="w-full max-w-[360px]">
          <h1 className="font-display text-[30px] font-semibold tracking-[-0.02em] m-0">
            Welcome back
          </h1>
          <p className="text-[14.5px] text-muted-foreground mt-2 mb-7">
            Sign in to access your photos.
          </p>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {serverError && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
                  {serverError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-[13.5px] font-medium">Email</Label>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <>
                      <Input id="email" placeholder="name@example.com" type="email" disabled={isPending} {...field} />
                      {fieldState.error && <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-[13.5px] font-medium">Password</Label>
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <>
                      <Input id="password" placeholder="••••••••" type="password" disabled={isPending} {...field} />
                      {fieldState.error && <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              <Button variant="brand" size="lg" type="submit" className="w-full mt-1.5" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Signing in…" : "Sign in"}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-2">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold" style={{ color: "var(--brand)" }}>
                  Sign up
                </Link>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
