"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  Download,
  FileText,
  Filter,
  GripVertical,
  Mail,
  Phone,
  PhoneCall,
  Plus,
  Send,
  Settings2,
  Upload,
  UserRound,
  Workflow,
} from "lucide-react";
import {
  CRM_STORAGE_KEY,
  buildSmsHref,
  createId,
  createLead,
  exportLeadsToCsv,
  fieldLabels,
  formatFieldValue,
  getDefaultStageId,
  leadFieldOptions,
  mergeImportedLeads,
  note,
  parseCsv,
  renderTemplate,
  sampleState,
  type CRMState,
  type DialSession,
  type Lead,
  type LeadFieldKey,
  type OutcomeButton,
  type Pipeline,
  type ScriptTemplate,
  type TextTemplate,
} from "@/lib/crm";
import { cn } from "@/lib/utils";

type CRMView = "dashboard" | "pipelines" | "dialer" | "settings";

type CRMWorkspaceProps = {
  view: CRMView;
};

const emptyLeadForm = {
  lead_name: "",
  phone: "",
  date_of_birth: "",
  email: "",
  lead_type: "",
  state: "",
  address: "",
  age: "",
  gender: "",
  marital_status: "",
};

export function CRMWorkspace({ view }: CRMWorkspaceProps) {
  const [state, setState] = useState<CRMState>(sampleState);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activePipelineId, setActivePipelineId] = useState(sampleState.pipelines[0]?.id ?? "");
  const [selectedLeadId, setSelectedLeadId] = useState(sampleState.leads[0]?.id ?? "");
  const [activeScriptId, setActiveScriptId] = useState(sampleState.scriptTemplates[0]?.id ?? "");
  const [activeTextTemplateId, setActiveTextTemplateId] = useState(sampleState.textTemplates[0]?.id ?? "");
  const [activeDialSessionId, setActiveDialSessionId] = useState(sampleState.dialSessions[0]?.id ?? "");
  const [newPipelineName, setNewPipelineName] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [newOutcomeLabel, setNewOutcomeLabel] = useState("");
  const [newOutcomeTemplate, setNewOutcomeTemplate] = useState("");
  const [newLeadValues, setNewLeadValues] = useState(emptyLeadForm);
  const [pipelineFilter, setPipelineFilter] = useState("");
  const [newScriptName, setNewScriptName] = useState("");
  const [newScriptBody, setNewScriptBody] = useState("");
  const [newTextTemplateName, setNewTextTemplateName] = useState("");
  const [newTextTemplateBody, setNewTextTemplateBody] = useState("");
  const [newTextTemplateImages, setNewTextTemplateImages] = useState("");
  const [newDialBatchName, setNewDialBatchName] = useState("");
  const [newDialBatchSize, setNewDialBatchSize] = useState("100");
  const [importMessage, setImportMessage] = useState("");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(CRM_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CRMState;
        setState(parsed);
        setActivePipelineId(parsed.pipelines[0]?.id ?? "");
        setSelectedLeadId(parsed.leads[0]?.id ?? "");
        setActiveScriptId(parsed.scriptTemplates[0]?.id ?? "");
        setActiveTextTemplateId(parsed.textTemplates[0]?.id ?? "");
        setActiveDialSessionId(parsed.dialSessions[0]?.id ?? "");
      } catch {
        window.localStorage.removeItem(CRM_STORAGE_KEY);
      }
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(state));
  }, [hasHydrated, state]);

  const pipelines = state.pipelines;
  const activePipeline = pipelines.find((pipeline) => pipeline.id === activePipelineId) ?? pipelines[0];
  const leadsForActivePipeline = state.leads.filter((lead) => lead.pipelineId === activePipeline?.id);
  const filteredLeads = leadsForActivePipeline.filter((lead) => {
    if (!pipelineFilter.trim()) {
      return true;
    }

    const query = pipelineFilter.toLowerCase();
    return [
      lead.lead_name,
      lead.phone,
      lead.email,
      lead.lead_type,
      lead.state,
    ].some((value) => value.toLowerCase().includes(query));
  });
  const selectedLead =
    state.leads.find((lead) => lead.id === selectedLeadId) ??
    filteredLeads[0] ??
    state.leads[0] ??
    null;
  const activeScript =
    state.scriptTemplates.find((template) => template.id === activeScriptId) ?? state.scriptTemplates[0] ?? null;
  const activeTextTemplate =
    state.textTemplates.find((template) => template.id === activeTextTemplateId) ?? state.textTemplates[0] ?? null;
  const activeDialSession =
    state.dialSessions.find((session) => session.id === activeDialSessionId) ?? state.dialSessions[0] ?? null;
  const dialerLeadQueue = useMemo(() => {
    const workingStages = new Set(activePipeline?.stages.slice(0, 3).map((stage) => stage.id) ?? []);
    return state.leads.filter(
      (lead) => lead.pipelineId === activePipeline?.id && workingStages.has(lead.stageId),
    );
  }, [activePipeline?.id, activePipeline?.stages, state.leads]);
  const dialerLeadIndex = Math.max(
    0,
    dialerLeadQueue.findIndex((lead) => lead.id === selectedLead?.id),
  );
  const dashboardStats = buildDashboardStats(state);

  function updateState(recipe: (current: CRMState) => CRMState) {
    setState((current) => recipe(current));
  }

  function handleLeadChange(field: keyof typeof emptyLeadForm, value: string) {
    setNewLeadValues((current) => ({ ...current, [field]: value }));
  }

  function addPipeline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newPipelineName.trim();
    if (!trimmed) {
      return;
    }

    const pipelineId = createId("pipeline");
    const stageId = createId("stage");

    updateState((current) => ({
      ...current,
      pipelines: [
        ...current.pipelines,
        {
          id: pipelineId,
          name: trimmed,
          description: "Custom pipeline for a new lead flow.",
          stages: [{ id: stageId, name: "New", color: "#2563eb" }],
        },
      ],
    }));
    setActivePipelineId(pipelineId);
    setNewPipelineName("");
  }

  function addStage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newStageName.trim();
    if (!trimmed || !activePipeline) {
      return;
    }

    updateState((current) => ({
      ...current,
      pipelines: current.pipelines.map((pipeline) =>
        pipeline.id === activePipeline.id
          ? {
              ...pipeline,
              stages: [
                ...pipeline.stages,
                { id: createId("stage"), name: trimmed, color: randomStageColor() },
              ],
            }
          : pipeline,
      ),
    }));
    setNewStageName("");
  }

  function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePipeline) {
      return;
    }

    const stageId = getDefaultStageId(activePipeline);
    const lead = createLead({
      id: createId("lead"),
      pipelineId: activePipeline.id,
      stageId,
      notes: [note("Lead created manually.", "system")],
      ...newLeadValues,
    });

    updateState((current) => ({
      ...current,
      leads: [lead, ...current.leads],
    }));
    setSelectedLeadId(lead.id);
    setNewLeadValues(emptyLeadForm);
  }

  function moveLeadToStage(leadId: string, stageId: string) {
    updateState((current) => ({
      ...current,
      leads: current.leads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              stageId,
              updatedAt: new Date().toISOString(),
              notes: [...lead.notes, note(`Moved to ${findStageName(current.pipelines, lead.pipelineId, stageId)}.`, "system")],
            }
          : lead,
      ),
    }));
  }

  function toggleVisibleField(field: LeadFieldKey) {
    updateState((current) => {
      const visible = current.settings.visibleLeadFields.includes(field)
        ? current.settings.visibleLeadFields.filter((item) => item !== field)
        : [...current.settings.visibleLeadFields, field];

      return {
        ...current,
        settings: {
          ...current.settings,
          visibleLeadFields: visible,
        },
      };
    });
  }

  function addScript(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newScriptName.trim() || !newScriptBody.trim()) {
      return;
    }

    const template: ScriptTemplate = {
      id: createId("script"),
      name: newScriptName.trim(),
      body: newScriptBody.trim(),
    };

    updateState((current) => ({
      ...current,
      scriptTemplates: [template, ...current.scriptTemplates],
    }));
    setActiveScriptId(template.id);
    setNewScriptName("");
    setNewScriptBody("");
  }

  async function importScriptFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const body = await file.text();
    setNewScriptBody(body);
    if (!newScriptName) {
      setNewScriptName(file.name.replace(/\.[^/.]+$/, ""));
    }
    event.target.value = "";
  }

  function addTextTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTextTemplateName.trim() || !newTextTemplateBody.trim()) {
      return;
    }

    const template: TextTemplate = {
      id: createId("text-template"),
      name: newTextTemplateName.trim(),
      message: newTextTemplateBody.trim(),
      imageUrls: newTextTemplateImages
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    updateState((current) => ({
      ...current,
      textTemplates: [template, ...current.textTemplates],
    }));
    setActiveTextTemplateId(template.id);
    setNewTextTemplateName("");
    setNewTextTemplateBody("");
    setNewTextTemplateImages("");
  }

  function addOutcomeButton(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newOutcomeLabel.trim() || !newOutcomeTemplate.trim()) {
      return;
    }

    const button: OutcomeButton = {
      id: createId("outcome"),
      label: newOutcomeLabel.trim(),
      noteTemplate: newOutcomeTemplate.trim(),
    };

    updateState((current) => ({
      ...current,
      outcomeButtons: [...current.outcomeButtons, button],
    }));
    setNewOutcomeLabel("");
    setNewOutcomeTemplate("");
  }

  function applyOutcome(button: OutcomeButton) {
    if (!selectedLead) {
      return;
    }

    const outcomeText = renderTemplate(button.noteTemplate, selectedLead);
    updateState((current) => ({
      ...current,
      leads: current.leads.map((lead) =>
        lead.id === selectedLead.id
          ? {
              ...lead,
              lastOutcome: button.label,
              lastContactedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              notes: [...lead.notes, note(outcomeText, "outcome")],
            }
          : lead,
      ),
      dialSessions: current.dialSessions.map((session) =>
        session.id === activeDialSession?.id
          ? {
              ...session,
              completedDials: session.completedDials + 1,
              connectedDials:
                button.label === "No Answer" ? session.connectedDials : session.connectedDials + 1,
              outcomes: {
                ...session.outcomes,
                [button.label]: (session.outcomes[button.label] ?? 0) + 1,
              },
            }
          : session,
      ),
    }));

    const nextLead = dialerLeadQueue[dialerLeadIndex + 1];
    if (nextLead) {
      setSelectedLeadId(nextLead.id);
    }
  }

  function addDialBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session: DialSession = {
      id: createId("dial-session"),
      name: newDialBatchName.trim() || `Batch ${state.dialSessions.length + 1}`,
      createdAt: new Date().toISOString(),
      batchSize: Number(newDialBatchSize || "0"),
      completedDials: 0,
      connectedDials: 0,
      outcomes: {},
      notes: "New dial session started.",
    };

    updateState((current) => ({
      ...current,
      dialSessions: [session, ...current.dialSessions],
    }));
    setActiveDialSessionId(session.id);
    setNewDialBatchName("");
    setNewDialBatchSize("100");
  }

  function exportActivePipeline() {
    if (!activePipeline) {
      return;
    }

    const leads = state.leads.filter((lead) => lead.pipelineId === activePipeline.id);
    const csv = exportLeadsToCsv(leads);
    downloadFile(`${activePipeline.name.toLowerCase().replace(/\s+/g, "-")}-leads.csv`, csv, "text/csv");
  }

  async function importLeads(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !activePipeline) {
      return;
    }

    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) {
      setImportMessage("No rows found in the selected file.");
      event.target.value = "";
      return;
    }

    const imported = mergeImportedLeads(rows, activePipeline.id, getDefaultStageId(activePipeline));
    updateState((current) => ({
      ...current,
      leads: [...imported, ...current.leads],
    }));
    setImportMessage(`Imported ${imported.length} leads into ${activePipeline.name}.`);
    event.target.value = "";
  }

  if (!hasHydrated) {
    return (
      <section className="surface p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Loading Auralis</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Preparing your workspace, live pipelines, and operator controls.
        </h1>
      </section>
    );
  }

  return (
    <div className="auralis-scroll space-y-6">
      {view === "dashboard" ? (
        <>
          <section className="surface p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Auralis Control Center
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Keep every opportunity, script, and call block moving in one view.
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-600">
                  Auralis keeps your operating rhythm clear with multiple pipelines, drag-and-drop stages,
                  fast outcomes, script merge fields, and outreach controls in one intelligence layer.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <QuickLink href="/pipelines" icon={<Workflow className="size-4" />} label="Open Pipelines" />
                <QuickLink href="/dialer" icon={<PhoneCall className="size-4" />} label="Open Dialer" />
              </div>
            </div>
            <div className="mt-6 grid grid-auto-fit gap-4">
              <MetricCard label="Total Leads" value={dashboardStats.totalLeads} hint="Across all pipelines." />
              <MetricCard label="Active Pipelines" value={dashboardStats.totalPipelines} hint="Custom workflows ready to use." />
              <MetricCard label="Calls Logged Today" value={dashboardStats.todayDials} hint="Outcomes captured in dial sessions." />
              <MetricCard label="Text Templates" value={dashboardStats.totalTextTemplates} hint="Business card or follow-up templates." />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="surface p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Pipeline Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    Stage counts by pipeline
                  </h2>
                </div>
                <Link href="/pipelines" className="text-sm font-semibold text-blue-700">
                  Manage pipeline
                </Link>
              </div>
              <div className="mt-5 space-y-4">
                {state.pipelines.map((pipeline) => (
                  <div key={pipeline.id} className="surface-muted p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{pipeline.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{pipeline.description}</p>
                      </div>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        {state.leads.filter((lead) => lead.pipelineId === pipeline.id).length} leads
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {pipeline.stages.map((stage) => (
                        <div key={stage.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">{stage.name}</span>
                            <span
                              className="size-3 rounded-full"
                              style={{ backgroundColor: stage.color }}
                            />
                          </div>
                          <p className="mt-2 text-2xl font-bold text-slate-950">
                            {state.leads.filter((lead) => lead.stageId === stage.id && lead.pipelineId === pipeline.id).length}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Dial Tracking</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Recent dial batches</h2>
              <div className="mt-5 space-y-3">
                {state.dialSessions.map((session) => {
                  const completion = session.batchSize ? Math.round((session.completedDials / session.batchSize) * 100) : 0;
                  return (
                    <div key={session.id} className="surface-muted p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{session.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{new Date(session.createdAt).toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-950">{completion}% complete</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-[linear-gradient(90deg,#0891b2,#0f766e)]" style={{ width: `${Math.min(100, completion)}%` }} />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {session.completedDials} of {session.batchSize} dials logged. Connected: {session.connectedDials}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
        </>
      ) : null}

      {view === "pipelines" ? (
        <>
          <section className="surface p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Leads Pipeline
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Build multiple pipelines and drag leads through every stage.
                </h1>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="auralis-button-secondary">
                  <span className="flex items-center gap-2"><Upload className="size-4" /> Import Leads</span>
                  <input type="file" accept=".csv,text/csv" onChange={importLeads} className="hidden" />
                </label>
                <button type="button" onClick={exportActivePipeline} className="auralis-button-secondary">
                  <span className="inline-flex items-center gap-2"><Download className="size-4" /> Export Leads</span>
                </button>
                <Link href="/settings" className="auralis-button-secondary">
                  <span className="inline-flex items-center gap-2"><Settings2 className="size-4" /> Card Fields</span>
                </Link>
              </div>
            </div>
            {importMessage ? <p className="mt-4 text-sm font-medium text-emerald-700">{importMessage}</p> : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="surface p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {state.pipelines.map((pipeline) => (
                    <button
                      key={pipeline.id}
                      type="button"
                      onClick={() => setActivePipelineId(pipeline.id)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition",
                        activePipeline?.id === pipeline.id
                          ? "bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white shadow-[0_14px_32px_rgba(37,99,235,0.22)]"
                          : "border border-slate-200 bg-white/72 text-slate-700",
                      )}
                    >
                      {pipeline.name}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="field pl-11"
                    placeholder="Search leads"
                    value={pipelineFilter}
                    onChange={(event) => setPipelineFilter(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div className="flex min-w-max gap-4">
                  {activePipeline?.stages.map((stage) => {
                    const stageLeads = filteredLeads.filter((lead) => lead.stageId === stage.id);
                    return (
                      <div
                        key={stage.id}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (draggedLeadId) {
                            moveLeadToStage(draggedLeadId, stage.id);
                            setDraggedLeadId(null);
                          }
                        }}
                        className="w-[320px] shrink-0 rounded-[28px] border border-slate-200 bg-white/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="size-3 rounded-full" style={{ backgroundColor: stage.color }} />
                            <div>
                              <p className="font-semibold text-slate-950">{stage.name}</p>
                              <p className="text-sm text-slate-500">{stageLeads.length} leads</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {stageLeads.map((lead) => (
                            <button
                              key={lead.id}
                              type="button"
                              draggable
                              onDragStart={() => setDraggedLeadId(lead.id)}
                              onClick={() => setSelectedLeadId(lead.id)}
                              className={cn(
                                "w-full rounded-3xl border p-4 text-left transition",
                                selectedLead?.id === lead.id
                                  ? "border-blue-300 bg-blue-50/80 shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
                                  : "border-slate-200 bg-white/88 hover:border-slate-300",
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  {state.settings.visibleLeadFields.map((field, index) => (
                                    <p
                                      key={field}
                                      className={index === 0 ? "text-lg font-semibold text-slate-950" : "mt-1 text-sm text-slate-600"}
                                    >
                                      {index === 0 ? formatFieldValue(field, lead) : `${fieldLabels[field]}: ${formatFieldValue(field, lead)}`}
                                    </p>
                                  ))}
                                </div>
                                <GripVertical className="mt-1 size-4 text-slate-400" />
                              </div>
                              {lead.lastOutcome ? (
                                <p className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                  Last outcome: {lead.lastOutcome}
                                </p>
                              ) : null}
                            </button>
                          ))}
                          {stageLeads.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                              Drop a lead here.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>

            <div className="space-y-6">
              <article className="surface p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Pipeline Setup</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Create pipelines and stages</h2>
                <form onSubmit={addPipeline} className="mt-5 flex gap-3">
                  <input className="field" placeholder="New pipeline name" value={newPipelineName} onChange={(event) => setNewPipelineName(event.target.value)} />
                  <button type="submit" className="auralis-button-primary">
                    <Plus className="size-4" />
                  </button>
                </form>
                <form onSubmit={addStage} className="mt-3 flex gap-3">
                  <input className="field" placeholder="Add stage to active pipeline" value={newStageName} onChange={(event) => setNewStageName(event.target.value)} />
                  <button type="submit" className="auralis-button-secondary">
                    Add
                  </button>
                </form>
              </article>

              <article className="surface p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Add Lead</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Drop a new lead into this pipeline</h2>
                <form onSubmit={addLead} className="mt-5 grid gap-3">
                  {Object.entries(emptyLeadForm).map(([key]) => (
                    <input
                      key={key}
                      className="field"
                      placeholder={fieldLabels[key as LeadFieldKey]}
                      value={newLeadValues[key as keyof typeof emptyLeadForm]}
                      onChange={(event) => handleLeadChange(key as keyof typeof emptyLeadForm, event.target.value)}
                    />
                  ))}
                  <button type="submit" className="auralis-button-primary">
                    Save Lead
                  </button>
                </form>
              </article>

              <LeadProfileCard lead={selectedLead} textTemplate={activeTextTemplate} />
            </div>
          </section>
        </>
      ) : null}

      {view === "dialer" ? (
        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <article className="surface p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Power Dialer Workflow</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Run your script, click outcomes, and move straight to the next lead.
                </h1>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <select className="field" value={activeScriptId} onChange={(event) => setActiveScriptId(event.target.value)}>
                  {state.scriptTemplates.map((script) => (
                    <option key={script.id} value={script.id}>{script.name}</option>
                  ))}
                </select>
                <select className="field" value={activeDialSessionId} onChange={(event) => setActiveDialSessionId(event.target.value)}>
                  {state.dialSessions.map((session) => (
                    <option key={session.id} value={session.id}>{session.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Current Lead</p>
                {selectedLead ? (
                  <>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{selectedLead.lead_name}</h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <p className="flex items-center gap-2"><Phone className="size-4 text-slate-400" /> {selectedLead.phone}</p>
                      <p className="flex items-center gap-2"><Mail className="size-4 text-slate-400" /> {selectedLead.email || "No email"}</p>
                      <p className="flex items-center gap-2"><UserRound className="size-4 text-slate-400" /> {selectedLead.lead_type} • {selectedLead.state}</p>
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {state.outcomeButtons.map((button) => (
                        <button
                          key={button.id}
                          type="button"
                          onClick={() => applyOutcome(button)}
                          className="auralis-button-secondary"
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/80 p-4">
                      <p className="text-sm font-semibold text-blue-800">Next lead control</p>
                      <button
                        type="button"
                        onClick={() => {
                          const nextLead = dialerLeadQueue[dialerLeadIndex + 1];
                          if (nextLead) {
                            setSelectedLeadId(nextLead.id);
                          }
                        }}
                        className="auralis-button-primary mt-3"
                      >
                        Next Lead
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Choose a lead from your active pipeline to start the dial flow.</p>
                )}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Phone Script</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{activeScript?.name ?? "No script selected"}</h2>
                  </div>
                  <FileText className="size-5 text-slate-400" />
                </div>
                <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-base leading-8 text-slate-100">
                  {selectedLead && activeScript ? renderTemplate(activeScript.body, selectedLead) : "Select a lead and script to begin."}
                </div>
              </div>
            </div>
          </article>

          <div className="space-y-6">
            <article className="surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Dial Queue</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Rotating call batch</h2>
              <div className="mt-5 space-y-3">
                {dialerLeadQueue.map((lead, index) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={cn(
                      "w-full rounded-3xl border p-4 text-left transition",
                      selectedLead?.id === lead.id
                        ? "border-blue-300 bg-blue-50/80"
                        : "border-slate-200 bg-white/88 hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{index + 1}. {lead.lead_name}</p>
                        <p className="mt-1 text-sm text-slate-500">{lead.phone} • {lead.lead_type}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {lead.lastOutcome ?? "Untouched"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Batch Tracker</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Measure 300+ calls in organized blocks</h2>
              <form onSubmit={addDialBatch} className="mt-5 grid gap-3">
                <input className="field" placeholder="Session name" value={newDialBatchName} onChange={(event) => setNewDialBatchName(event.target.value)} />
                <input className="field" type="number" min="1" placeholder="Batch size" value={newDialBatchSize} onChange={(event) => setNewDialBatchSize(event.target.value)} />
                <button type="submit" className="auralis-button-primary">
                  Start New Batch
                </button>
              </form>
              {activeDialSession ? (
                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{activeDialSession.name}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {activeDialSession.completedDials} of {activeDialSession.batchSize} dials completed
                  </p>
                  <div className="mt-4 space-y-2">
                    {Object.entries(activeDialSession.outcomes).map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-sm text-slate-700">
                        <span>{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          </div>
        </section>
      ) : null}

      {view === "settings" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <article className="surface p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Card Settings</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Choose what fields show on lead cards</h1>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {leadFieldOptions.map((field) => {
                const active = state.settings.visibleLeadFields.includes(field);
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => toggleVisibleField(field)}
                    className={cn(
                      "rounded-3xl border px-4 py-4 text-left transition",
                      active ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-white",
                    )}
                  >
                    <p className="font-semibold text-slate-950">{fieldLabels[field]}</p>
                    <p className="mt-1 text-sm text-slate-500">{active ? "Visible on cards" : "Hidden from cards"}</p>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="surface p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Outcome Buttons</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create dial outcomes that write notes automatically</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {state.outcomeButtons.map((button) => (
                <span key={button.id} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {button.label}
                </span>
              ))}
            </div>
            <form onSubmit={addOutcomeButton} className="mt-5 grid gap-3">
              <input className="field" placeholder="Button label" value={newOutcomeLabel} onChange={(event) => setNewOutcomeLabel(event.target.value)} />
              <textarea className="field min-h-28" placeholder="Note template. Example: Left voicemail on {{timestamp}}." value={newOutcomeTemplate} onChange={(event) => setNewOutcomeTemplate(event.target.value)} />
              <button type="submit" className="auralis-button-primary">
                Add Outcome Button
              </button>
            </form>
          </article>

          <article className="surface p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Phone Scripts</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Upload or create dynamic scripts</h2>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Use merge fields like <code>{"{{lead_name}}"}</code>, <code>{"{{lead_type}}"}</code>, <code>{"{{state}}"}</code>, and <code>{"{{date_of_birth}}"}</code>.
            </div>
            <form onSubmit={addScript} className="mt-5 grid gap-3">
              <input className="field" placeholder="Script name" value={newScriptName} onChange={(event) => setNewScriptName(event.target.value)} />
              <textarea className="field min-h-40" placeholder="Paste your script here" value={newScriptBody} onChange={(event) => setNewScriptBody(event.target.value)} />
              <label className="auralis-button-secondary">
                <span className="inline-flex items-center gap-2"><Upload className="size-4" /> Upload Script File</span>
                <input type="file" accept=".txt,.md" onChange={importScriptFile} className="hidden" />
              </label>
              <button type="submit" className="auralis-button-primary">
                Save Script
              </button>
            </form>
          </article>

          <article className="surface p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Business Card Text Templates</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Build click-to-text follow-ups for your phone</h2>
            <div className="mt-5 space-y-3">
              {state.textTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setActiveTextTemplateId(template.id)}
                  className={cn(
                    "w-full rounded-3xl border p-4 text-left transition",
                    activeTextTemplateId === template.id ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-white",
                  )}
                >
                  <p className="font-semibold text-slate-950">{template.name}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {template.imageUrls.length} image link{template.imageUrls.length === 1 ? "" : "s"} included
                  </p>
                </button>
              ))}
            </div>
            <form onSubmit={addTextTemplate} className="mt-5 grid gap-3">
              <input className="field" placeholder="Template name" value={newTextTemplateName} onChange={(event) => setNewTextTemplateName(event.target.value)} />
              <textarea className="field min-h-32" placeholder="Text message body with merge fields" value={newTextTemplateBody} onChange={(event) => setNewTextTemplateBody(event.target.value)} />
              <textarea className="field min-h-24" placeholder="One image URL per line. These will be appended as links in the text composer." value={newTextTemplateImages} onChange={(event) => setNewTextTemplateImages(event.target.value)} />
              <button type="submit" className="auralis-button-primary">
                Save Text Template
              </button>
            </form>
          </article>
        </section>
      ) : null}
    </div>
  );
}

function LeadProfileCard({
  lead,
  textTemplate,
}: {
  lead: Lead | null;
  textTemplate: TextTemplate | null;
}) {
  return (
    <article className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Lead Profile</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {lead?.lead_name ?? "Select a lead"}
          </h2>
        </div>
        {lead && textTemplate ? (
          <a
            href={buildSmsHref(textTemplate, lead)}
            className="auralis-button-primary"
          >
            <span className="inline-flex items-center gap-2">
              <Send className="size-4" />
              Send Business Card
            </span>
          </a>
        ) : null}
      </div>
      {lead ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {leadFieldOptions.map((field) => (
              <div key={field} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{fieldLabels[field]}</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{formatFieldValue(field, lead)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Lead Notes</p>
            <div className="mt-4 space-y-3">
              {lead.notes.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.type}</span>
                    <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Click a lead card to open the full profile and texting actions.</p>
      )}
    </article>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: Route;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link href={href} className="auralis-button-secondary">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
    </Link>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="surface p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  );
}

function buildDashboardStats(state: CRMState) {
  const today = new Date().toDateString();
  const todayDials = state.leads.filter((lead) => {
    if (!lead.lastContactedAt) {
      return false;
    }

    return new Date(lead.lastContactedAt).toDateString() === today;
  }).length;

  return {
    totalLeads: state.leads.length,
    totalPipelines: state.pipelines.length,
    totalTextTemplates: state.textTemplates.length,
    todayDials,
  };
}

function findStageName(pipelines: Pipeline[], pipelineId: string, stageId: string) {
  const pipeline = pipelines.find((item) => item.id === pipelineId);
  return pipeline?.stages.find((stage) => stage.id === stageId)?.name ?? "Updated stage";
}

function randomStageColor() {
  const colors = ["#2563eb", "#0891b2", "#7c3aed", "#ea580c", "#10b981", "#f59e0b"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function downloadFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
