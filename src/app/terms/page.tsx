import { COMPANY, CONTACT_EMAIL, CONTACT_HREF, LEGAL_UPDATED } from "@/lib/contact";
import Link from "next/link";
import { DocPage, docMetadata } from "@/components/DocPage";

export const metadata = docMetadata(
  "Terms of Service",
  "The terms for using Takewon: your account, your content, what is allowed, payment, and what happens if something goes wrong.",
  "/terms",
);

export default function TermsPage() {
  return (
    <DocPage
      title="Terms of Service"
      updated={LEGAL_UPDATED}
      lead={
        <>
          These terms are an agreement between you and {COMPANY} (&ldquo;we&rdquo;) for using Takewon: the website, the dashboard, the agent and the
          connector for AI chat apps. By making an account or using Takewon, you agree to them.
        </>
      }
    >
      <h2>Your account</h2>
      <p>
        You need to be at least 13, and old enough to agree to these terms where you live. Keep your sign-in details safe; you are responsible for what
        happens on your account and on teams you own, including what AI apps you allow to act for you do there. If you make an account for a business,
        you agree for that business.
      </p>

      <h2>Your content</h2>
      <p>
        What you upload, and what Takewon makes from it, stays yours. You give us permission to store, process and copy it only as needed to run Takewon
        for you and your team. You must have the rights to everything you upload, including permission from the people in it where the law requires it.
      </p>

      <h2>What is not allowed</h2>
      <ul>
        <li>Content you have no right to use, or that is illegal, sexual content involving minors, or made to harass or deceive people.</li>
        <li>Getting into accounts, teams or systems that are not yours, or trying to get around limits or security.</li>
        <li>Overloading Takewon or using it to send spam.</li>
        <li>Reselling hosted Takewon as your own service without an agreement with us.</li>
      </ul>
      <p>We may remove content or suspend accounts that break these rules, and will tell you why unless the law or safety stops us.</p>

      <h2>Plans and payment</h2>
      <p>
        Prices are on the <Link href="/pricing">Pricing</Link> page. Monthly plans renew each month until you cancel; cancelling stops the next renewal and
        keeps access until the end of the paid month. A one-time purchase is paid once. Free trials end on their own and never charge you.
      </p>

      <h2>Open source</h2>
      <p>
        Takewon&apos;s code is open source under the GNU Affero General Public License, version 3 or later, and the toolkit it drives has its own open
        source licence. Those licences, not these terms, cover what you may do with the code. These terms cover the hosted service we run.
      </p>

      <h2>Other services</h2>
      <p>
        Takewon can connect to services run by others, such as Slack, Discord, Dropbox, Zoom, Google, Microsoft and AI chat apps. Their own terms apply to
        them, and we are not responsible for how they work.
      </p>

      <h2>AI features</h2>
      <p>
        The Takewon agent and some steps use AI. Its suggestions and drafts can be wrong, so check what it makes before you publish it. Automations it
        builds are saved as drafts until someone publishes them.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We work to keep Takewon running and your data safe, but it is provided as it is, without promises that it will always be available or free of
        errors. We may change or stop features; if a change takes away something you paid for, we will tell you first. Keep your own copies of files that
        matter to you.
      </p>

      <h2>Limits on liability</h2>
      <p>
        As far as the law allows, we are not liable for indirect or consequential losses, lost profits or lost data, and our total liability for any
        claim is limited to what you paid us in the 12 months before it. Nothing here limits rights you have under consumer law that cannot be waived.
      </p>

      <h2>Ending</h2>
      <p>
        You can stop using Takewon and ask us to delete your account at any time. We may end or suspend accounts that break these terms. What you made
        stays yours; the sections on content ownership, liability and the law below continue after the account ends.
      </p>

      <h2>The law that applies</h2>
      <p>These terms are governed by the laws of the State of California, USA, unless the law where you live says otherwise.</p>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms, we update the date at the top and email account holders about changes that matter. Using Takewon after a change means
        you accept it.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>
      </p>
    </DocPage>
  );
}
