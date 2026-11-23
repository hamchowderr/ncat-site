import { APP_URL, CONTACT_EMAIL, CONTACT_HREF, LEGAL_UPDATED, MCP_URL } from "@/lib/contact";
import Link from "next/link";
import { DocPage, docMetadata } from "@/components/DocPage";

export const metadata = docMetadata(
  "Use Takewon from AI apps",
  "Connect Claude, ChatGPT, Cursor or any app that speaks MCP to Takewon, then run automations, check runs and approve work from the chat.",
  "/docs/ai-apps",
);

const TOOLS: { group: string; items: [string, string][] }[] = [
  {
    group: "Look things up",
    items: [
      ["List automations", "Every automation in the team, on or off, and what starts it."],
      ["Describe an automation", "Its steps and settings."],
      ["List step types", "The steps an automation can use."],
      ["List uploads", "The team's recent uploads."],
      ["Check a run", "A run's steps, its finished files and anything waiting for review."],
      ["List runs", "Recent runs and how they went."],
      ["List approvals", "Work waiting for someone to decide."],
      ["List workflows", "Chains of automations and how each is reviewed."],
    ],
  },
  {
    group: "Make and change",
    items: [
      ["Create an automation", "Saves a new draft. Nothing runs until it is published."],
      ["Set up a follow-on automation", "A draft that starts when another automation finishes."],
      ["Change an automation", "Edits the draft."],
      ["Publish an automation", "Makes the draft the version that runs."],
      ["Switch an automation on or off", "Starts or stops it running by itself."],
      ["Set up a workflow", "Groups linked automations and sets their review."],
      ["Switch a workflow on or off", "Every automation in it at once."],
    ],
  },
  {
    group: "Run and review",
    items: [
      ["Start an automation", "On an upload or a link to a file."],
      ["Approve or send back", "Decides waiting work, with a reason when sending back."],
    ],
  },
];

export default function AiAppsPage() {
  return (
    <DocPage
      title="Use Takewon from AI apps"
      updated={LEGAL_UPDATED}
      lead={
        <>
          Takewon has a connector for AI chat apps. Connect it once and you can run your team&apos;s automations, follow their runs and approve work by
          asking in Claude, ChatGPT, Cursor or any app that connects to remote MCP servers.
        </>
      }
    >
      <h2>Before you start</h2>
      <p>
        You need a Takewon account and a team. The app acts as you, in the one team you pick when you allow it, and can do only what your account can do
        there.
      </p>

      <h2>The address</h2>
      <p>Every app uses the same address:</p>
      <p>
        <code>{MCP_URL}</code>
      </p>
      <p>
        The dashboard shows it too, with steps for each app, under Settings, MCP at{" "}
        <a href={`${APP_URL}/settings/mcp`}>{APP_URL.replace("https://", "")}/settings/mcp</a>.
      </p>

      <h2>Connect an app</h2>
      <h3>Claude</h3>
      <ol>
        <li>On the web or in the desktop app, open Settings, then Connectors, and choose Add custom connector.</li>
        <li>Name it Takewon and paste the address.</li>
        <li>Choose Connect. Takewon opens to sign in; pick the team and choose Allow.</li>
      </ol>
      <h3>ChatGPT</h3>
      <ol>
        <li>Open Settings, then Apps &amp; Connectors, then Advanced settings, and switch on Developer mode.</li>
        <li>Choose Create, name it Takewon, paste the address and pick OAuth.</li>
        <li>Sign in to Takewon, pick the team and choose Allow. Turn it on in a chat.</li>
      </ol>
      <h3>Cursor, VS Code, Claude Code and others</h3>
      <p>
        Add a remote MCP server with the address above. The app opens Takewon to sign in. For Claude Code, run{" "}
        <code>claude mcp add --transport http takewon {MCP_URL}</code>.
      </p>
      <h3>n8n</h3>
      <ol>
        <li>In an AI Agent node, add the MCP Client Tool. Set Endpoint to the address above and Server Transport to HTTP Streamable.</li>
        <li>Set Authentication to MCP OAuth2 and make a new MCP OAuth2 API credential. Leave Register Client Automatically on and paste the address above into Server URL.</li>
        <li>Choose Connect my account, sign in to Takewon, pick the team and choose Allow.</li>
      </ol>
      <p>Every app signs in this way. There are no API keys to make or look after.</p>

      <h2>What you can ask</h2>
      <ul>
        <li>&ldquo;Run my captions automation on my latest upload.&rdquo;</li>
        <li>&ldquo;How did that run go?&rdquo; The finished files come back as links, and play in the chat where the app supports it.</li>
        <li>&ldquo;Is anything waiting for my review?&rdquo;</li>
        <li>&ldquo;Build an automation that adds captions and a vertical crop to every new upload.&rdquo;</li>
      </ul>
      <p>Before anything that changes, switches, starts, sends or decides something, the app asks you to confirm. Only creating a draft runs without asking.</p>

      <h2>Every tool</h2>
      {TOOLS.map((t) => (
        <table className="doc-table" key={t.group} aria-label={t.group}>
          <thead>
            <tr>
              <th scope="col">{t.group}</th>
              <th scope="col">What it does</th>
            </tr>
          </thead>
          <tbody>
            {t.items.map(([name, what]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      <h2>What it doesn&apos;t do</h2>
      <ul>
        <li>It doesn&apos;t post to social networks. Runs give you files; you post them.</li>
        <li>It doesn&apos;t make videos from a text prompt. It works on your team&apos;s own recordings.</li>
        <li>It can&apos;t reach another team, or anything your account can&apos;t.</li>
      </ul>

      <h2>Remove access</h2>
      <p>
        Under Settings, MCP in the dashboard, every app you allowed is listed. Remove one and it stops working at once. Removing the connector in the app
        does the same from that side.
      </p>

      <h2>Help</h2>
      <p>
        Something not working? Email <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>, or see <Link href="/support">Support</Link>. How we handle data from AI
        apps is in the <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </DocPage>
  );
}
