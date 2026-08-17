import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MemberForm } from "../_components/member-form";

export default function NewMemberPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/members" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Member directory</p>
          <h1 className="mt-1 font-heading text-2xl font-black tracking-tight sm:text-3xl">Add member</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create a clean profile before assigning a membership.</p>
        </div>
      </div>
      <MemberForm mode="create" />
    </div>
  );
}
