import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireGymContext } from "@/lib/auth/guards";
import { getMemberById } from "@/lib/data/members";
import { MemberForm } from "../../_components/member-form";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ id: string }> };

export default async function EditMemberPage({ params }: PageProps) {
  const { gym } = await requireGymContext();
  const { id } = await params;
  const member = await getMemberById(gym.id, id);
  if (!member) notFound();
  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/members/${member.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Member profile
          </p>
          <h1 className="mt-1 font-heading text-2xl font-black tracking-tight sm:text-3xl">
            Edit member
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update {member.name}&apos;s profile details.
          </p>
        </div>
      </div>
      <MemberForm mode="edit" member={member} />
    </div>
  );
}
