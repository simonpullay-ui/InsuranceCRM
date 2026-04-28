import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CrmLeadPayload = {
  pipeline_id?: string;
  stage_id?: string;
  phone?: string;
  date_of_birth?: string;
  email?: string;
  lead_type?: string;
  state?: string;
  address?: string;
  age?: string;
  gender?: string;
  marital_status?: string;
  lead_name?: string;
  notes?: unknown;
  status?: string;
  last_outcome?: string | null;
  last_contacted_at?: string | null;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = (await request.json()) as CrmLeadPayload;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
  }

  const updates: Record<string, unknown> = {};
  if (payload.pipeline_id !== undefined) updates.pipeline_id = payload.pipeline_id;
  if (payload.stage_id !== undefined) updates.stage_id = payload.stage_id;
  if (payload.phone !== undefined) updates.phone = payload.phone;
  if (payload.date_of_birth !== undefined) updates.date_of_birth = payload.date_of_birth;
  if (payload.email !== undefined) updates.email = payload.email;
  if (payload.lead_type !== undefined) updates.lead_type = payload.lead_type;
  if (payload.state !== undefined) updates.state = payload.state;
  if (payload.address !== undefined) updates.address = payload.address;
  if (payload.age !== undefined) updates.age = payload.age;
  if (payload.gender !== undefined) updates.gender = payload.gender;
  if (payload.marital_status !== undefined) updates.marital_status = payload.marital_status;
  if (payload.lead_name !== undefined) updates.lead_name = payload.lead_name;
  if (payload.notes !== undefined) updates.notes = payload.notes;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.last_outcome !== undefined) updates.last_outcome = payload.last_outcome;
  if (payload.last_contacted_at !== undefined) updates.last_contacted_at = payload.last_contacted_at;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("crm_leads")
    .update(updates)
    .eq("id", id)
    .eq("account_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
