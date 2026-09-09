import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Terms of Service | Fitaah",
  description: "Terms of Service for the Fitaah gym management platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: (
      <p>By accessing or using Fitaah, you agree to these Terms of Service. If you do not agree with these terms, you should not use the platform.</p>
    ),
  },
  {
    title: "2. About Fitaah",
    content: (
      <p>Fitaah is a gym management software platform that helps gyms manage operational information such as members, memberships, attendance, payments, renewals, reports and related records. Fitaah provides management software and does not itself provide fitness, medical or training services.</p>
    ),
  },
  {
    title: "3. Accounts and Access",
    content: (
      <p>You are responsible for keeping your login credentials confidential and for activity performed through your account. You must provide accurate information and promptly notify us if you believe your account has been accessed without authorization.</p>
    ),
  },
  {
    title: "4. Gym and Member Data",
    content: (
      <p>Gyms are responsible for the accuracy and lawful collection of the member and business information they enter into Fitaah. You must only upload or process information that you are authorized to use and must comply with applicable privacy and data-protection requirements.</p>
    ),
  },
  {
    title: "5. Subscription and Payments",
    content: (
      <p>Access to Fitaah may be provided under a paid subscription or another agreed commercial arrangement. Applicable pricing, billing periods and payment terms may be communicated separately. Unless required by law or expressly agreed otherwise, fees already paid are non-refundable.</p>
    ),
  },
  {
    title: "6. Suspension or Termination",
    content: (
      <p>We may suspend or restrict access where subscription payments are overdue, the platform is misused, these terms are materially breached, or suspension is reasonably necessary for security or legal reasons. Where appropriate, access may be restored after the relevant issue is resolved.</p>
    ),
  },
  {
    title: "7. Acceptable Use",
    content: (
      <div className="space-y-3">
        <p>You agree not to misuse Fitaah. In particular, you must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>attempt to gain unauthorized access to accounts, systems or data;</li>
          <li>use the service for unlawful, fraudulent or abusive purposes;</li>
          <li>interfere with the security, availability or normal operation of the platform; or</li>
          <li>copy, reverse engineer or exploit the platform except where permitted by applicable law.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "8. Service Availability",
    content: (
      <p>We aim to keep Fitaah reliable and available, but uninterrupted or error-free operation cannot be guaranteed. Maintenance, third-party services, internet connectivity or events outside our reasonable control may occasionally affect availability.</p>
    ),
  },
  {
    title: "9. Intellectual Property",
    content: (
      <p>Fitaah, including its software, branding, interface and original platform content, is owned by or licensed to Fitaah and is protected by applicable intellectual-property laws. These terms do not transfer ownership of the platform to you.</p>
    ),
  },
  {
    title: "10. Limitation of Liability",
    content: (
      <p>To the maximum extent permitted by applicable law, Fitaah will not be liable for indirect, incidental, special or consequential losses arising from use of the platform. Nothing in these terms excludes liability that cannot legally be excluded or limited.</p>
    ),
  },
  {
    title: "11. Changes to These Terms",
    content: (
      <p>We may update these terms as the platform or applicable requirements change. The updated version will be published on this page with a revised effective date. Continued use after an update constitutes acceptance of the revised terms where permitted by law.</p>
    ),
  },
  {
    title: "12. Contact",
    content: (
      <p>For questions about these Terms of Service, contact us at <a className="font-medium text-emerald-600 hover:text-emerald-700" href="mailto:support@fitaah.in">support@fitaah.in</a>.</p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Brand subtitle="Platform" />
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-600">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">Legal</p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-slate-500">Effective date: 9 September 2026</p>
          <p className="mt-5 text-base leading-7 text-slate-600">These Terms of Service govern your access to and use of the Fitaah gym management platform.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                <div className="mt-3 text-sm leading-7 text-slate-600">{section.content}</div>
              </section>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-slate-400">© 2026 Fitaah. All rights reserved.</p>
      </section>
    </main>
  );
}
