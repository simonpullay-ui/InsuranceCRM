import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(sanitizeJobPayload(payload))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateAll();
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateAll();
  return NextResponse.json({ success: true });
}

function revalidateAll() {
  revalidatePath("/jobs");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

function sanitizeJobPayload(payload: Record<string, unknown>) {
  return {
    customer_name: payload.customer_name,
    job_number: payload.job_number,
    branch: payload.branch,
    division: payload.division,
    lead_source: payload.lead_source,
    project_manager: payload.project_manager,
    installer_crew: payload.installer_crew,
    contract_amount: Number(payload.contract_amount ?? 0),
    deposit_amount: payload.deposit_amount === null ? null : Number(payload.deposit_amount ?? 0),
    deposit_collected_date: payload.deposit_collected_date,
    final_payment_date: payload.final_payment_date,
    payment_status: payload.payment_status,
    install_status: payload.install_status,
    job_status: payload.job_status,
    scheduled_install_date: payload.scheduled_install_date,
    install_start_date: payload.install_start_date,
    install_end_date: payload.install_end_date,
    notes: payload.notes,
  };
}
