"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  hasAccessToken: boolean;
}

interface GymResponse {
  gym?: { id: string; name: string };
  config?: WhatsAppConfig;
  error?: string;
}

export default function GymWhatsAppPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [gymName, setGymName] = React.useState("");
  const [config, setConfig] = React.useState<WhatsAppConfig>({
    enabled: false,
    phoneNumberId: "",
    businessAccountId: "",
    hasAccessToken: false,
  });
  const [accessToken, setAccessToken] = React.useState("");
  const [testNumber, setTestNumber] = React.useState("");
  const [testMessage, setTestMessage] = React.useState("This is a test message from Fitaah.");
  const [showToken, setShowToken] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const gymResponse = await fetch(`/api/admin/gyms/${params.id}`);
        const gymData = (await gymResponse.json()) as GymResponse;
        if (!gymResponse.ok) throw new Error(gymData.error ?? "Gym not found");

        const configResponse = await fetch(`/api/admin/gyms/${params.id}/whatsapp`, {
          cache: "no-store",
        });
        const configData = (await configResponse.json()) as GymResponse;
        if (!configResponse.ok) {
          throw new Error(configData.error ?? "Unable to load WhatsApp configuration");
        }

        if (cancelled) return;
        setGymName(gymData.gym?.name ?? "Gym");
        if (configData.config) setConfig(configData.config);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load WhatsApp configuration");
        router.replace(`/super-admin/gyms/${params.id}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  async function save() {
    if (config.enabled && (!config.phoneNumberId.trim() || !config.businessAccountId.trim())) {
      toast.error("Phone Number ID and WhatsApp Business Account ID are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/gyms/${params.id}/whatsapp`, {
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
      if (!response.ok) throw new Error(data.error ?? "Unable to save WhatsApp configuration");
      if (data.config) setConfig(data.config);
      setAccessToken("");
      toast.success(config.enabled ? "WhatsApp enabled for this gym" : "WhatsApp disabled for this gym");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save WhatsApp configuration");
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    if (!testNumber.trim()) {
      toast.error("Enter a test recipient number");
      return;
    }

    setTesting(true);
    try {
      const response = await fetch(`/api/admin/gyms/${params.id}/whatsapp/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testNumber, message: testMessage }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to send test message");
      toast.success("WhatsApp test message sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send test message");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={`/super-admin/gyms/${params.id}/edit`}>
        <Button variant="ghost" size="sm" className="text-xs">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Edit Gym
        </Button>
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">WhatsApp Configuration</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{gymName}</h1>
            <p className="mt-1 text-sm text-white/60">Manage the WhatsApp number used for this gym.</p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200/70 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <CardTitle className="text-base">WhatsApp Account</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Enable messaging for this gym only.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.enabled}
              onClick={() => setConfig((current) => ({ ...current, enabled: !current.enabled }))}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 items-center rounded-full p-1 transition-colors ${config.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${config.enabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={config.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
            {config.hasAccessToken && <span className="text-xs text-emerald-600">Credentials configured</span>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number ID</label>
              <Input value={config.phoneNumberId} onChange={(event) => setConfig((current) => ({ ...current, phoneNumberId: event.target.value }))} placeholder="Meta Phone Number ID" disabled={saving} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">WhatsApp Business Account ID</label>
              <Input value={config.businessAccountId} onChange={(event) => setConfig((current) => ({ ...current, businessAccountId: event.target.value }))} placeholder="Meta WABA ID" disabled={saving} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Token</label>
              <div className="relative">
                <Input type={showToken ? "text" : "password"} value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder={config.hasAccessToken ? "Saved token — enter only to replace it" : "Meta access token"} autoComplete="new-password" disabled={saving} className="pr-11" />
                <button type="button" onClick={() => setShowToken((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showToken ? "Hide access token" : "Show access token"}>
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Stored server-side and never returned to the browser.</p>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <Button onClick={() => void save()} disabled={saving} className="bg-emerald-600 font-bold hover:bg-emerald-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Save WhatsApp Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Send Test Message</CardTitle>
          <p className="text-xs text-slate-500">Use this only after the Meta credentials are configured.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={testNumber} onChange={(event) => setTestNumber(event.target.value)} placeholder="Recipient WhatsApp number with country code" disabled={testing} />
            <Input value={testMessage} onChange={(event) => setTestMessage(event.target.value)} placeholder="Test message" disabled={testing} />
          </div>
          <Button onClick={() => void sendTest()} disabled={testing || !config.enabled} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Test WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
