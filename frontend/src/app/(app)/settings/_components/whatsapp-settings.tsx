"use client";

import * as React from "react";
import { CheckCircle2, Eye, EyeOff, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  hasAccessToken: boolean;
}

export function WhatsAppSettings() {
  const [config, setConfig] = React.useState<WhatsAppConfig>({
    enabled: false,
    phoneNumberId: "",
    businessAccountId: "",
    hasAccessToken: false,
  });
  const [accessToken, setAccessToken] = React.useState("");
  const [showToken, setShowToken] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/whatsapp/config", { cache: "no-store" });
        const data = (await response.json()) as { config?: WhatsAppConfig; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Unable to load WhatsApp settings");
        if (!cancelled && data.config) setConfig(data.config);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Unable to load WhatsApp settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/whatsapp/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: config.enabled,
          phoneNumberId: config.phoneNumberId,
          businessAccountId: config.businessAccountId,
          accessToken,
        }),
      });

      const data = (await response.json()) as { config?: WhatsAppConfig; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to save WhatsApp settings");
      if (data.config) setConfig(data.config);
      setAccessToken("");
      toast.success(config.enabled ? "WhatsApp is enabled" : "WhatsApp has been disabled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save WhatsApp settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">WhatsApp</CardTitle>
              <p className="text-xs text-slate-400">Automated member messaging</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            aria-label="Enable WhatsApp"
            onClick={() => setConfig((current) => ({ ...current, enabled: !current.enabled }))}
            disabled={loading || saving}
            className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              config.enabled ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                config.enabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {config.enabled ? "WhatsApp is enabled for this gym" : "WhatsApp is currently disabled"}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add the Meta WhatsApp credentials below. Once enabled and saved, Fitaah will use this gym&apos;s configured number for WhatsApp messaging.
            </p>
          </div>
          <Badge
            variant="outline"
            className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              config.enabled
                ? "border-emerald-200 bg-white text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            {config.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="whatsapp-phone-number-id" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phone Number ID
            </label>
            <Input
              id="whatsapp-phone-number-id"
              value={config.phoneNumberId}
              onChange={(event) => setConfig((current) => ({ ...current, phoneNumberId: event.target.value }))}
              placeholder="Meta Phone Number ID"
              disabled={loading || saving}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp-business-account-id" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              WhatsApp Business Account ID
            </label>
            <Input
              id="whatsapp-business-account-id"
              value={config.businessAccountId}
              onChange={(event) => setConfig((current) => ({ ...current, businessAccountId: event.target.value }))}
              placeholder="Meta WABA ID"
              disabled={loading || saving}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="whatsapp-access-token" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Access Token
            </label>
            <div className="relative">
              <Input
                id="whatsapp-access-token"
                type={showToken ? "text" : "password"}
                value={accessToken}
                onChange={(event) => setAccessToken(event.target.value)}
                placeholder={config.hasAccessToken ? "Saved securely — enter a new token only to replace it" : "Meta access token"}
                disabled={loading || saving}
                autoComplete="new-password"
                className="h-11 rounded-xl pr-11"
              />
              <button
                type="button"
                onClick={() => setShowToken((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showToken ? "Hide access token" : "Show access token"}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] leading-5 text-slate-400">
              Never share this token with members or expose it in client-side code.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {config.enabled && config.hasAccessToken ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Credentials configured
              </>
            ) : (
              "Save your Meta credentials to activate messaging."
            )}
          </div>
          <Button
            type="button"
            onClick={() => void save()}
            disabled={loading || saving}
            className="h-11 rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            {saving ? "Saving..." : "Save WhatsApp Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
