import { APP_URL, CONTACT_EMAIL, CONTACT_HREF, LEGAL_UPDATED } from "@/lib/contact";
import Link from "next/link";
import { DocPage, docMetadata } from "@/components/DocPage";

export const metadata = docMetadata(
  "Support",
  "How to get help with Takewon: one email address, what to include, and where to look first.",
  "/support",
);

export default function SupportPage() {
  return (
    <DocPage
      title="Support"
      updated={LEGAL_UPDATED}
      lead={
        <>
          Email <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a> for anything: a question, a problem, a run that failed, or deleting your account. A person answers.
        </>
      }
    >
      <h2>What to include</h2>
      <ul>
        <li>The email address on your Takewon account and your team&apos;s name.</li>
        <li>What you did, what you expected, and what happened instead.</li>
        <li>For a run that went wrong, a link to it from the dashboard. It shows us every step and its log.</li>
        <li>For an AI chat app, which app it was (Claude, ChatGPT, Cursor or another) and what you asked it.</li>
      </ul>
      <p>Never send your password or a key. We will never ask for them.</p>

      <h2>Look here first</h2>
      <ul>
        <li>
          <strong>A run failed:</strong> open it in the dashboard at <a href={APP_URL}>{APP_URL.replace("https://", "")}</a>. The step that stopped says why.
        </li>
        <li>
          <strong>Connecting an AI chat app:</strong> see <Link href="/docs/ai-apps">Use Takewon from AI apps</Link>.
        </li>
        <li>
          <strong>Plans and prices:</strong> see <Link href="/pricing">Pricing</Link>.
        </li>
      </ul>

      <h2>Privacy and your data</h2>
      <p>
        To get a copy of your data or delete your account, email us from the address on the account. The <Link href="/privacy">Privacy Policy</Link>{" "}
        explains what we keep and for how long.
      </p>

      <h2>Security</h2>
      <p>
        Found a security problem? Email <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a> with &ldquo;Security&rdquo; in the subject. We reply quickly and
        credit you if you want.
      </p>
    </DocPage>
  );
}
