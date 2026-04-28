import { PhoneCall, LockKeyhole, Mail } from "lucide-react";
import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface relative overflow-hidden p-8 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.14),transparent_26%)]" />
          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-sky-900">
              <PhoneCall className="size-4" />
              PolicyFlow CRM
            </div>
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">
                Life Insurance Sales Workspace
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 lg:text-6xl">
                Work leads faster, stay organized, and keep every dial moving.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Manage drag-and-drop pipelines, run phone scripts, send business card texts,
                and track the pace of your daily calling sessions in one place.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Flexible pipelines", "Create multiple lead pipelines and custom stages for each one."],
                ["Built for calling", "Move through scripts, log outcomes, and rotate leads in batches."],
                ["Text-ready follow-up", "Launch business card templates right from the lead profile."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-3xl border border-white/70 bg-white/75 p-5">
                  <h2 className="font-semibold text-slate-950">{title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Sign in
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Access PolicyFlow CRM
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Use your Supabase email and password. Only authenticated users can access the CRM.
            </p>
          </div>

          <form action={loginAction} className="space-y-5">
            <label className="block">
              <span className="label">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="field pl-11"
                  type="email"
                  name="email"
                  placeholder="ops@company.com"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="label">Password</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="field pl-11"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in to CRM
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
