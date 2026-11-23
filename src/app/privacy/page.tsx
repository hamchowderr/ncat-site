import { APP_URL, COMPANY, CONTACT_EMAIL, CONTACT_HREF, LEGAL_UPDATED } from "@/lib/contact";
import { DocPage, docMetadata } from "@/components/DocPage";

export const metadata = docMetadata(
  "Privacy Policy",
  "What Takewon collects, why, who helps run it, how long it is kept, and how to see, change or delete it.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <DocPage
      title="Privacy Policy"
      updated={LEGAL_UPDATED}
      lead={
        <>
          {COMPANY} builds and runs Takewon. This page says what we collect when you use takewon.com, the Takewon dashboard at{" "}
          {APP_URL.replace("https://", "")} and the Takewon connector for AI chat apps, what we do with it, and what you can do about it.
        </>
      }
    >
      <h2>What we collect</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th scope="col">What</th>
            <th scope="col">Examples</th>
            <th scope="col">Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account details</td>
            <td>Name, email address, password (stored only as a hash), or your Google profile if you sign in with Google</td>
            <td>To sign you in and tell you about your account</td>
          </tr>
          <tr>
            <td>Team details</td>
            <td>Team name, who is on it and their roles, invitations, clients you add</td>
            <td>To share work inside your team and keep other teams out</td>
          </tr>
          <tr>
            <td>Your content</td>
            <td>Videos, audio and images you upload or link, the clips, captions, transcripts and other files made from them</td>
            <td>To do the work you ask for and give you the results</td>
          </tr>
          <tr>
            <td>Automations and runs</td>
            <td>The automations you build, each run&apos;s steps, approvals and comments</td>
            <td>To run them, show you how they went and ask the right people to review</td>
          </tr>
          <tr>
            <td>Agent chats</td>
            <td>What you ask the Takewon agent and what it answers, including voice notes sent from team chat apps</td>
            <td>To answer you and keep the conversation going</td>
          </tr>
          <tr>
            <td>Connections</td>
            <td>Tokens for services you connect (for example Slack, Discord, Dropbox, Zoom or Google Meet), stored encrypted</td>
            <td>To fetch recordings and send results where you asked</td>
          </tr>
          <tr>
            <td>AI app connections</td>
            <td>Which AI apps you allowed to reach your team, when, and the keys your team made for them (stored only as a hash)</td>
            <td>So those apps can act for you, and so you can see and remove them</td>
          </tr>
          <tr>
            <td>Usage and security records</td>
            <td>Sign-in attempts, IP address, browser, error logs</td>
            <td>To keep accounts safe, stop abuse and fix problems</td>
          </tr>
          <tr>
            <td>Messages to us</td>
            <td>Early-access sign-ups, emails to {CONTACT_EMAIL}, videos you try on the website</td>
            <td>To answer you and show you what Takewon does</td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not sell your information, use it for advertising, or use your content to train AI models. We only use it to run Takewon for you.
      </p>

      <h2>AI chat apps</h2>
      <p>
        When you connect an AI chat app (such as Claude or ChatGPT) to Takewon, that app sends us only what it needs for the tool it calls: for example
        which automation to start or which approval to decide. It can only reach the team you chose when you allowed it, and only what your account
        can do there. What you type into that app is handled by the app&apos;s maker under their own privacy policy; we never ask the app for your chat
        history or other conversations. You can remove an app&apos;s access at any time under Settings, MCP in the dashboard.
      </p>

      <h2>Who helps us run Takewon</h2>
      <p>We share information only with the services that run Takewon for us, and only what each one needs:</p>
      <ul>
        <li>
          <strong>Hosting:</strong> Vercel (the website and dashboard), Hostinger (the servers that store data and process media), Cloudflare (domain
          names).
        </li>
        <li>
          <strong>Storage:</strong> the file storage your team connects, or ours if your team uses Takewon&apos;s.
        </li>
        <li>
          <strong>AI:</strong> Anthropic, which runs the model behind the Takewon agent. Your chats with the agent, and the details of your work it needs
          to answer, are sent to it.
        </li>
        <li>
          <strong>Email:</strong> toSend, which delivers sign-in, invitation and alert emails.
        </li>
        <li>
          <strong>Services you connect:</strong> when you connect Slack, Discord, Telegram, Microsoft, Zoom, Google, Dropbox or another service, we send
          and receive what that connection is for.
        </li>
      </ul>
      <p>We may also share information when the law requires it, or to protect people from harm.</p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Your account, team, automations and content: for as long as the account exists. A file or automation you delete in the dashboard is removed.</li>
        <li>When an account is deleted, we remove its data within 30 days, except what the law requires us to keep.</li>
        <li>Videos tried on the website: deleted after 7 days.</li>
        <li>Voice notes: deleted as soon as they are turned into text.</li>
        <li>Security records: only as long as they are needed to keep accounts safe.</li>
      </ul>
      <p>If you run your own copy of Takewon on your own server, your data stays there and this policy covers only what you send us directly.</p>

      <h2>Your choices</h2>
      <p>
        You can see and change your account details under Account settings, and delete your own content in the dashboard. To get a copy of your data, or
        to delete your account and everything in it, email <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a> from the address on the account. We answer within 30
        days. Depending on where you live, you may have further rights over your information; ask us and we will help.
      </p>

      <h2>Security</h2>
      <p>
        Traffic is encrypted, passwords and keys are stored only as hashes, connection tokens are encrypted, and each team&apos;s data is kept apart.
        No system is perfectly safe; if something goes wrong that affects your information, we will tell you.
      </p>

      <h2>Children</h2>
      <p>Takewon is not for children under 13, and we do not knowingly collect their information.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we update the date at the top, and we email account holders about any change that matters.</p>

      <h2>Contact</h2>
      <p>
        Questions about privacy: <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>.
      </p>
    </DocPage>
  );
}
