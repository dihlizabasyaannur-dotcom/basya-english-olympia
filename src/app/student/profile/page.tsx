import type { Metadata } from "next";
import { Badge, Card, CardBody, CardHeader, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CEFR_META, type CefrLevel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { JoinClassForm, ProfileForm } from "./profile-forms";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const [{ data: auth }, { data: enrollments }, { data: xp }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("enrollments").select("joined_at, classes(name, school_level)").eq("student_id", profile.id),
    supabase.from("xp_transactions").select("amount, reason, created_at").eq("student_id", profile.id).order("created_at", { ascending: false }).limit(8),
  ]);
  const level = profile.cefr_level as CefrLevel | null;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile" title={profile.full_name} description={auth.user?.email} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader title="Edit profile" />
          <CardBody>
            <ProfileForm defaults={{ full_name: profile.full_name, school_level: profile.school_level ?? "SMP", grade: profile.grade ? String(profile.grade) : "", school_name: profile.school_name ?? "", bio: profile.bio ?? "" }} />
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="English level" />
            <CardBody>
              {level ? (
                <p><Badge tone="gold">{level}</Badge> <span className="ml-1 font-semibold">{CEFR_META[level].name}</span><span className="mt-1 block text-sm text-muted">Placed on {formatDate(profile.cefr_placed_at)} by the placement test. Retake it from Assessments any time.</span></p>
              ) : <p className="text-sm text-muted">Not placed yet — take the BEO Placement Test from Assessments.</p>}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="My classes" description="Enter the code your teacher gave you." />
            <CardBody className="space-y-4">
              <JoinClassForm />
              {(enrollments ?? []).length === 0 ? <p className="text-sm text-muted">You haven&apos;t joined a class yet.</p> : (
                <ul className="space-y-2">
                  {enrollments!.map((e, i) => <li key={i} className="flex justify-between rounded-xl bg-lavender-50 px-3 py-2 text-sm"><span className="font-semibold">{e.classes?.name}</span><span className="text-muted">Joined {formatDate(e.joined_at)}</span></li>)}
                </ul>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Recent XP" description={`Total: ${profile.xp} XP`} />
            <CardBody>
              {(xp ?? []).length === 0 ? <p className="text-sm text-muted">Earn XP by completing quizzes and badges.</p> : (
                <ul className="divide-y divide-line text-sm">
                  {xp!.map((x, i) => <li key={i} className="flex justify-between gap-3 py-2"><span className="truncate">{x.reason}</span><span className="shrink-0 font-semibold text-gold-600">+{x.amount}</span></li>)}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
