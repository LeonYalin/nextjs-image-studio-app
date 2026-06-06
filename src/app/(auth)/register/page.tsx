"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { registerAction } from "@/lib/actions";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().min(1, "Email is required"),
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
    <div className="flex h-screen w-screen bg-background">
      {/* Visual pane */}
      <div className="relative flex-1 min-w-0 flex flex-col justify-between p-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)",
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
        className="flex items-center justify-center p-8 overflow-y-auto"
        style={{ flex: "0 0 clamp(380px, 38%, 520px)" }}
      >
        <div className="w-full max-w-[360px]">
          <h1 className="font-display text-[30px] font-semibold tracking-[-0.02em] m-0">
            Create your account
          </h1>
          <p className="text-[14.5px] text-muted-foreground mt-2 mb-7">
            Start your personal gallery in seconds.
          </p>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {serverError && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
                  {serverError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-[13.5px] font-medium">Name</Label>
                <Controller
                  name="name"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input id="name" placeholder="Jane Doe" disabled={isPending} {...field} />
                      {fieldState.error && <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-[13.5px] font-medium">Email</Label>
                <Controller
                  name="email"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input id="email" type="email" placeholder="name@example.com" disabled={isPending} {...field} />
                      {fieldState.error && <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-[13.5px] font-medium">Password</Label>
                <Controller
                  name="password"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input id="password" type="password" placeholder="••••••••" disabled={isPending} {...field} />
                      {fieldState.error && <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className="text-[13.5px] font-medium">Confirm password</Label>
                <Controller
                  name="confirmPassword"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" disabled={isPending} {...field} />
                      {fieldState.error && <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              <Button variant="brand" size="lg" type="submit" className="w-full mt-1.5" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Creating…" : "Sign up"}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-2">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
                  Sign in
                </Link>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
