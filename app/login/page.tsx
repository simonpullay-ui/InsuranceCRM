import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck, Sparkles, TrendingUp, Waypoints } from "lucide-react";
import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const featureBullets = [
  {
    icon: Waypoints,
    title: "Unified Operations",
    body: "All your tools. One intelligent platform.",
  },
  {
    icon: TrendingUp,
    title: "Smarter Decisions",
    body: "Real-time insights that drive results.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    body: "Enterprise-grade security you can trust.",
  },
  {
    icon: Sparkles,
    title: "Built for Growth",
    body: "Scale your business with confidence.",
  },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(59,130,246,0.22),transparent_24%),radial-gradient(circle_at_72%_82%,rgba(255,255,255,0.96),transparent_18%),radial-gradient(circle_at_80%_18%,rgba(147,197,253,0.25),transparent_20%)]" />

      <div className="relative grid w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/50 bg-white/24 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:grid-cols-[1.18fr_0.82fr]">
        <section className="relative overflow-hidden px-8 py-10 sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_92%,rgba(255,255,255,0.96),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.16),rgba(37,99,235,0.04))]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-4 rounded-full border border-white/60 bg-white/42 px-4 py-3 backdrop-blur-xl">
                <div className="auralis-brand-mark size-12 text-lg font-bold">A</div>
                <div>
                  <p className="auralis-wordmark text-2xl font-semibold text-slate-950">Auralis</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Intelligence Core
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-700/80">
                  Operational Clarity
                </p>
                <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                  Operational Clarity.
                  <br />
                  Powered by Intelligence.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Auralis brings your entire business together in one intelligent platform so
                  you can focus on what matters most.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featureBullets.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-[24px] border border-white/55 bg-white/42 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-700">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-950">{title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-white/16 px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-md rounded-[30px] border border-white/55 bg-white/55 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700/80">
                Welcome Back
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                Sign in to access your Auralis Core account
              </h2>
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
                    placeholder="ops@auralis.com"
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

              <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="remember"
                    value="true"
                    className="size-4 rounded border border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="mailto:support@auralis.com?subject=Password%20reset"
                  className="font-semibold text-blue-700 transition hover:text-blue-600"
                >
                  Forgot password
                </Link>
              </div>

              {error ? (
                <div className="rounded-[18px] border border-rose-200/80 bg-rose-50/85 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="auralis-button-primary w-full">
                Sign In
              </button>
            </form>

            <div className="mt-6 rounded-[20px] border border-white/55 bg-white/45 px-4 py-4 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 font-semibold text-slate-700">
                <ShieldCheck className="size-4 text-blue-600" />
                Your data is protected with enterprise-grade security.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
