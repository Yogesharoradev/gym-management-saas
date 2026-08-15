"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { createGymSchema, type CreateGymInput } from "@/lib/validation/gym";

interface CreateGymResponse {
  gym?: {
    id: string;
    name: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export default function NewGymPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGymInput>({
    resolver: zodResolver(createGymSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      logo: null,
      admin: {
        name: "",
        email: "",
        password: "",
      },
    },
  });

  async function onSubmit(values: CreateGymInput) {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/gyms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email || "",
          phone: values.phone || "",
          address: values.address || "",
          logo: values.logo || null,
          admin: {
            name: values.admin.name,
            email: values.admin.email,
            password: values.admin.password,
          },
        }),
      });

      const data = (await response.json()) as CreateGymResponse;

      if (!response.ok) {
        setServerError(data.error ?? "Unable to create gym. Please try again.");
        return;
      }

      setSuccessMessage(
        `${data.gym?.name ?? "Gym"} has been created successfully.`,
      );

      // Give the user a short success state before returning to the list.
      window.setTimeout(() => {
        router.replace("/super-admin/gyms");
        router.refresh();
      }, 700);
    } catch {
      setServerError(
        "Something went wrong while creating the gym. Please try again.",
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="outline" size="icon" className="mt-1 h-9 w-9 shrink-0">
          <Link href="/super-admin/gyms" aria-label="Back to gyms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div>
          <p className="overline">Platform</p>

          <h1 className="mt-2 font-heading text-3xl font-black tracking-tighter">
            Create New Gym
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Add a gym and create its initial administrator account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Server error */}
        {serverError ? (
          <div
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <div>
              <p className="font-semibold">Unable to create gym</p>
              <p className="mt-0.5">{serverError}</p>
            </div>
          </div>
        ) : null}

        {/* Success */}
        {successMessage ? (
          <div
            className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {/* Gym Information */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <CardTitle className="text-base">Gym Information</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Basic information about the gym.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            {/* Gym Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Gym Name <span className="text-destructive">*</span>
              </Label>

              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="name"
                  placeholder="Iron Pulse Fitness"
                  className="pl-9"
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                />
              </div>

              {errors.name ? (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            {/* Gym Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Gym Email</Label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="hello@gym.in"
                  className="pl-9"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>

              {errors.email ? (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className="pl-9"
                  {...register("phone")}
                  aria-invalid={Boolean(errors.phone)}
                />
              </div>

              {errors.phone ? (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <textarea
                  id="address"
                  rows={3}
                  placeholder="Enter complete gym address"
                  className="flex min-h-[90px] w-full resize-y rounded-md border border-input bg-background px-9 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("address")}
                  aria-invalid={Boolean(errors.address)}
                />
              </div>

              {errors.address ? (
                <p className="text-xs text-destructive">
                  {errors.address.message}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Gym Admin */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <CardTitle className="text-base">Gym Administrator</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create the initial administrator account for this gym.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            {/* Admin Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-name">
                Admin Name <span className="text-destructive">*</span>
              </Label>

              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="admin-name"
                  placeholder="Rahul Sharma"
                  className="pl-9"
                  {...register("admin.name")}
                  aria-invalid={Boolean(errors.admin?.name)}
                />
              </div>

              {errors.admin?.name ? (
                <p className="text-xs text-destructive">
                  {errors.admin.name.message}
                </p>
              ) : null}
            </div>

            {/* Admin Email */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">
                Admin Email <span className="text-destructive">*</span>
              </Label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@gym.in"
                  className="pl-9"
                  {...register("admin.email")}
                  aria-invalid={Boolean(errors.admin?.email)}
                />
              </div>

              {errors.admin?.email ? (
                <p className="text-xs text-destructive">
                  {errors.admin.email.message}
                </p>
              ) : null}

              <p className="text-xs text-muted-foreground">
                This email will be used to sign in to the GymOS console.
              </p>
            </div>

            {/* Admin Password */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="admin-password">
                Temporary Password <span className="text-destructive">*</span>
              </Label>

              <div className="relative max-w-md">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter a strong password"
                  className="pr-10 pl-9"
                  {...register("admin.password")}
                  aria-invalid={Boolean(errors.admin?.password)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.admin?.password ? (
                <p className="max-w-md text-xs text-destructive">
                  {errors.admin.password.message}
                </p>
              ) : null}

              <p className="text-xs text-muted-foreground">
                This password is used for the initial administrator login.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription note */}
        <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Subscription:</span>{" "}
          New gyms are created with an active subscription. The current backend
          automatically starts a 30-day subscription period.
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            <Link href="/super-admin/gyms">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Create Gym
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
