export const leadFieldOptions = [
  "lead_name",
  "phone",
  "date_of_birth",
  "email",
  "lead_type",
  "state",
  "address",
  "age",
  "gender",
  "marital_status",
] as const;

export type LeadFieldKey = (typeof leadFieldOptions)[number];

export type LeadNote = {
  id: string;
  createdAt: string;
  body: string;
  type: "manual" | "outcome" | "system";
};

export type Lead = {
  id: string;
  pipelineId: string;
  stageId: string;
  lead_name: string;
  phone: string;
  date_of_birth: string;
  email: string;
  lead_type: string;
  state: string;
  address: string;
  age: string;
  gender: string;
  marital_status: string;
  notes: LeadNote[];
  lastOutcome: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PipelineStage = {
  id: string;
  name: string;
  color: string;
};

export type Pipeline = {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
};

export type ScriptTemplate = {
  id: string;
  name: string;
  body: string;
};

export type TextTemplate = {
  id: string;
  name: string;
  message: string;
  imageUrls: string[];
};

export type OutcomeButton = {
  id: string;
  label: string;
  noteTemplate: string;
};

export type DialSession = {
  id: string;
  name: string;
  createdAt: string;
  batchSize: number;
  completedDials: number;
  connectedDials: number;
  outcomes: Record<string, number>;
  notes: string;
};

export type CRMSettings = {
  visibleLeadFields: LeadFieldKey[];
};

export type CRMState = {
  pipelines: Pipeline[];
  leads: Lead[];
  settings: CRMSettings;
  scriptTemplates: ScriptTemplate[];
  textTemplates: TextTemplate[];
  outcomeButtons: OutcomeButton[];
  dialSessions: DialSession[];
};

export const CRM_STORAGE_KEY = "policyflow-crm-state-v1";

export const fieldLabels: Record<LeadFieldKey, string> = {
  lead_name: "Lead Name",
  phone: "Number",
  date_of_birth: "Date of Birth",
  email: "Email",
  lead_type: "Lead Type",
  state: "State",
  address: "Address",
  age: "Age",
  gender: "Gender",
  marital_status: "Marital Status",
};

export const sampleState: CRMState = {
  pipelines: [
    {
      id: "pipeline-fresh",
      name: "Fresh Internet Leads",
      description: "New inbound and purchased leads for first-touch calls.",
      stages: [
        { id: "stage-new", name: "New", color: "#2563eb" },
        { id: "stage-working", name: "Working", color: "#f59e0b" },
        { id: "stage-follow-up", name: "Follow Up", color: "#7c3aed" },
        { id: "stage-app", name: "App Started", color: "#10b981" },
        { id: "stage-closed", name: "Closed", color: "#0f766e" },
      ],
    },
    {
      id: "pipeline-recycle",
      name: "Recycle Leads",
      description: "Older leads being rotated in daily dial batches.",
      stages: [
        { id: "stage-recycle-new", name: "Queue", color: "#475569" },
        { id: "stage-recycle-contacted", name: "Contacted", color: "#0891b2" },
        { id: "stage-recycle-nurture", name: "Nurture", color: "#9333ea" },
        { id: "stage-recycle-winback", name: "Win Back", color: "#ea580c" },
      ],
    },
  ],
  leads: [
    createLead({
      id: "lead-1",
      pipelineId: "pipeline-fresh",
      stageId: "stage-new",
      lead_name: "Marie Thompson",
      phone: "(904) 555-0118",
      date_of_birth: "1966-08-21",
      email: "marie.thompson@example.com",
      lead_type: "Final Expense",
      state: "FL",
      address: "118 Arbor Trace, Jacksonville, FL",
      age: "58",
      gender: "Female",
      marital_status: "Married",
      notes: [
        note("Imported from final expense list."),
      ],
    }),
    createLead({
      id: "lead-2",
      pipelineId: "pipeline-fresh",
      stageId: "stage-working",
      lead_name: "James Holloway",
      phone: "(214) 555-0160",
      date_of_birth: "1972-03-17",
      email: "james.holloway@example.com",
      lead_type: "Mortgage Protection",
      state: "TX",
      address: "42 Fox Run, Dallas, TX",
      age: "54",
      gender: "Male",
      marital_status: "Single",
      notes: [
        note("Requested call back after work hours."),
      ],
      lastOutcome: "Callback Requested",
    }),
    createLead({
      id: "lead-3",
      pipelineId: "pipeline-fresh",
      stageId: "stage-follow-up",
      lead_name: "Sharon Diaz",
      phone: "(602) 555-0134",
      date_of_birth: "1961-11-08",
      email: "sharon.diaz@example.com",
      lead_type: "Medicare Supplement",
      state: "AZ",
      address: "778 Vista Lane, Phoenix, AZ",
      age: "63",
      gender: "Female",
      marital_status: "Widowed",
      notes: [
        note("Asked for benefit review and card text."),
      ],
      lastOutcome: "Interested",
    }),
    createLead({
      id: "lead-4",
      pipelineId: "pipeline-recycle",
      stageId: "stage-recycle-new",
      lead_name: "Robert Green",
      phone: "(770) 555-0129",
      date_of_birth: "1959-05-03",
      email: "robert.green@example.com",
      lead_type: "Final Expense",
      state: "GA",
      address: "65 Ashwood Dr, Atlanta, GA",
      age: "65",
      gender: "Male",
      marital_status: "Married",
      notes: [
        note("Rotated back into batch after 45 days."),
      ],
    }),
  ],
  settings: {
    visibleLeadFields: ["lead_name", "phone", "lead_type", "state", "age", "marital_status"],
  },
  scriptTemplates: [
    {
      id: "script-1",
      name: "Warm Intro",
      body:
        "Hi {{lead_name}}, this is Simon with Auralis. I’m calling because you were looking into {{lead_type}} options in {{state}}. I have your date of birth as {{date_of_birth}} and want to make sure I’m tailoring the right coverage review for you.",
    },
  ],
  textTemplates: [
    {
      id: "text-1",
      name: "Business Card Follow-Up",
      message:
        "Hi {{lead_name}}, this is Simon. Here’s my business card so you can save my info before our next call. Reply here any time with questions.",
      imageUrls: ["https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80"],
    },
  ],
  outcomeButtons: [
    { id: "outcome-no-answer", label: "No Answer", noteTemplate: "No answer on {{timestamp}}." },
    { id: "outcome-not-interested", label: "Not Interested", noteTemplate: "Lead said not interested on {{timestamp}}." },
    { id: "outcome-callback", label: "Callback Requested", noteTemplate: "Requested a callback on {{timestamp}}." },
  ],
  dialSessions: [
    {
      id: "dial-1",
      name: "Morning Batch A",
      createdAt: new Date().toISOString(),
      batchSize: 100,
      completedDials: 37,
      connectedDials: 9,
      outcomes: {
        "No Answer": 18,
        "Not Interested": 7,
        "Callback Requested": 6,
      },
      notes: "Started with Florida final expense leads.",
    },
  ],
};

export function createLead(
  input: Omit<Lead, "createdAt" | "updatedAt" | "lastContactedAt" | "lastOutcome"> &
    Partial<Pick<Lead, "createdAt" | "updatedAt" | "lastContactedAt" | "lastOutcome">>,
): Lead {
  const timestamp = new Date().toISOString();

  return {
    ...input,
    lastOutcome: input.lastOutcome ?? null,
    lastContactedAt: input.lastContactedAt ?? null,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export function note(body: string, type: LeadNote["type"] = "manual"): LeadNote {
  return {
    id: createId("note"),
    createdAt: new Date().toISOString(),
    body,
    type,
  };
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDefaultStageId(pipeline: Pipeline | undefined) {
  return pipeline?.stages[0]?.id ?? "";
}

export function renderTemplate(template: string, lead: Lead) {
  const values: Record<string, string> = {
    lead_name: lead.lead_name,
    phone: lead.phone,
    date_of_birth: lead.date_of_birth,
    email: lead.email,
    lead_type: lead.lead_type,
    state: lead.state,
    address: lead.address,
    age: lead.age,
    gender: lead.gender,
    marital_status: lead.marital_status,
    timestamp: new Date().toLocaleString(),
  };

  return template.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_match, key: string) => values[key] ?? "");
}

export function formatFieldValue(field: LeadFieldKey, lead: Lead) {
  return lead[field] || "—";
}

export function buildSmsHref(template: TextTemplate, lead: Lead) {
  const message = renderTemplate(template.message, lead);
  const imageSection = template.imageUrls.length ? `\n\nImages:\n${template.imageUrls.join("\n")}` : "";
  const body = encodeURIComponent(`${message}${imageSection}`);
  const phone = lead.phone.replace(/[^\d+]/g, "");

  return `sms:${phone}?&body=${body}`;
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      if (current.length || row.length) {
        row.push(current.trim());
        rows.push(row);
      }
      current = "";
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.length > 0));
}

export function exportLeadsToCsv(leads: Lead[]) {
  const headers = leadFieldOptions;
  const lines = [
    headers.join(","),
    ...leads.map((lead) =>
      headers
        .map((field) => `"${String(lead[field] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];

  return lines.join("\n");
}

export function mergeImportedLeads(
  rows: string[][],
  pipelineId: string,
  stageId: string,
) {
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((column) => column.trim().toLowerCase());

  return dataRows.map((columns) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, columns[index] ?? ""]));
    return createLead({
      id: createId("lead"),
      pipelineId,
      stageId,
      lead_name: record.lead_name || record.name || "Imported Lead",
      phone: record.phone || record.number || "",
      date_of_birth: record.date_of_birth || record.dob || "",
      email: record.email || "",
      lead_type: record.lead_type || "Imported",
      state: record.state || "",
      address: record.address || "",
      age: record.age || "",
      gender: record.gender || "",
      marital_status: record.marital_status || "",
      notes: [note("Imported from CSV.", "system")],
    });
  });
}
