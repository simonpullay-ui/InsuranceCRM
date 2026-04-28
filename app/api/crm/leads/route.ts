import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LeadStatus = "active" | "working" | "dormant" | "closed";

type CrmLeadPayload = {
  lead_name: string;
  pipeline_id: string;
  stage_id: string;
  phone: string;
  date_of_birth: string;
  email: string;
  lead_type: string;
  state: string;
  address: string;
  age: string;
  gender: string;
  marital_status: string;
  notes: unknown;
  status: LeadStatus;
  last_outcome: string | null;
  last_contacted_at: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("account_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ leads: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as CrmLeadPayload;
  if (!payload?.lead_name || !payload?.pipeline_id || !payload?.stage_id) {
    return NextResponse.json({ error: "Missing required lead fields." }, { status: 400 });
  }

  const body = {
    account_id: user.id,
    branch_id: null,
    lead_name: payload.lead_name,
    pipeline_id: payload.pipeline_id,
    stage_id: payload.stage_id,
    phone: payload.phone,
    date_of_birth: payload.date_of_birth,
    email: payload.email,
    lead_type: payload.lead_type,
    state: payload.state,
    address: payload.address,
    age: payload.age,
    gender: payload.gender,
    marital_status: payload.marital_status,
    status: payload.status ?? "active",
    notes: payload.notes ?? [],
    metadata: payload.metadata ?? {},
    last_outcome: payload.last_outcome,
    last_contacted_at: payload.last_contacted_at,
    created_by: user.id,
  };

  const { data, error } = await supabase.from("crm_leads").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
