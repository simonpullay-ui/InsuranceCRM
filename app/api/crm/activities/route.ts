import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CrmActivityPayload = {
  lead_id: string;
  activity_type: string;
  outcome: string | null;
  summary: string | null;
  notes: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as CrmActivityPayload;

  const body = {
    account_id: user.id,
    branch_id: null,
    lead_id: payload.lead_id,
    activity_type: payload.activity_type,
    outcome: payload.outcome,
    summary: payload.summary,
    notes: payload.notes,
    metadata: payload.metadata ?? {},
    created_by: user.id,
  };

  const { data, error } = await supabase.from("crm_activities").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
