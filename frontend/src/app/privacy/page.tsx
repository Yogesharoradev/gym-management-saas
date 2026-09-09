import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Privacy Policy | Fitaah",
  description: "Privacy Policy for the Fitaah gym management platform.",
};

const sections = [
  {
    title: "1. Information We Process",
    content: (
      <div className="space-y-3">
        <p>Depending on how Fitaah is used, the platform may process:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>gym account information such as name, email address and login details;</li>
          <li>member information entered by a gym, such as name, contact details and membership records;</li>
          <li>attendance, membership, renewal, payment and weight/progress records entered into the platform;</li>
          <li>technical and security information needed to operate, protect and troubleshoot the service.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "2. How We Use Information",
    content: (
      <p>We use information to provide and operate Fitaah, authenticate users, maintain gym and member records, generate reports and receipts, support account recovery, communicate service-related information, improve reliability and protect the platform against misuse or unauthorized access.</p>
    ),
  },
  {
    title: "3. Gym Responsibilities",
    content: (
      <p>Each gym is responsible for the personal information it chooses to collect from its members and enter into Fitaah. Gyms should provide appropriate notices to their members and obtain any permissions or consents required under applicable law.</p>
    ),
  },
  {
    title: "4. Data Sharing",
    content: (
      <p>We do not sell personal information. Information may be processed by service providers that help us host, secure, maintain or deliver Fitaah, and may be disclosed where required by law, to protect legal rights or security, or in connection with a legitimate business transfer.</p>
    ),
  },
  {
    title: "5. Data Security",
    content: (
      <p>We use reasonable technical and organizational safeguards designed to protect information against unauthorized access, loss, misuse or alteration. No internet-based system can guarantee absolute security, so users should also protect their credentials and devices.</p>
    ),
  },
  {
    title: "6. Data Retention",
    content: (
      <p>We retain information for as long as reasonably necessary to provide the service, maintain legitimate business and security records, meet contractual obligations, resolve disputes and comply with applicable legal requirements. Retention periods may vary depending on the type of information.</p>
    ),
  },
  {
    title: "7. Account and Data Requests",
    content: (
      <p>Subject to applicable law and the role of the relevant gym, users may request access, correction or deletion of personal information. Gym members should normally contact their gym first for information controlled by that gym. You may also contact Fitaah for privacy-related assistance.</p>
    ),
  },
  {
    title: "8. Cookies and Sessions",
    content: (
      <p>Fitaah may use cookies or similar browser storage that are necessary for authentication, session security and essential platform functionality. We do not use these essential technologies to sell personal information.</p>
    ),
  },
  {
    title: "9. Third-Party Services",
    content: (
      <p>Fitaah may rely on third-party infrastructure and service providers for functions such as hosting, database services and transactional email. Their processing is governed by their applicable terms and privacy practices as well as our arrangements with them.</p>
    ),
  },
  {
    title: "10. Changes to This Policy",
    content: (
      <p>We may update this Privacy Policy as Fitaah evolves or applicable requirements change. The current version will be published on this page with its effective date.</p>
    ),
  },
  {
    title: "11. Contact Us",
    content: (
      <p>For privacy questions or requests, contact us at <a className="font-medium text-emerald-600 hover:text-emerald-700" href="mailto:support@fitaah.in">support@fitaah.in</a>.</p>
    ),
  },
];

export default function PrivacyPage() {
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
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">Legal</p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-slate-500">Effective date: 9 September 2026</p>
          <p className="mt-5 text-base leading-7 text-slate-600">This Privacy Policy explains how information is processed when gyms and authorized users use the Fitaah gym management platform.</p>
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
