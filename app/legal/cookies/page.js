import LongFormPage from '../../_components/LongForm';
const SECTIONS = [
      { id: "what", title: "What cookies we use", body: [
        "A cookie is a small file your browser stores on your device. We use cookies for two reasons:",
        { ol: [
          "**Essential** — to keep you signed in and the service secure. These are always on.",
          "**Analytics** — to understand which features get used so we can improve them. Turn off anytime.",
        ]},
        "We do not use advertising or cross-site tracking cookies. We do not sell data to advertisers.",
      ]},
      { id: "list", title: "Specific cookies", body: [
        { table: { headers: ["Name", "Purpose", "Duration", "Type"], rows: [
          ["cwpa_session", "Keeps you signed in", "30 days", "Essential"],
          ["cwpa_csrf", "Anti-CSRF token", "Session", "Essential"],
          ["cwpa_cookies_v1", "Stores your cookie preference", "1 year", "Essential"],
          ["ph_*", "PostHog anonymized analytics", "1 year", "Analytics"],
        ]} },
      ]},
      { id: "manage", title: "Manage your preferences", body: [
        "Use the toggles above, or clear cookies from your browser settings. Most browsers let you set a global rule to block third-party cookies; we work fine under that setting.",
      ]},
      { id: "manage-control", title: " ", body: [{ h3: "Set your preferences" }] },
    ];
export const metadata = { title: "Cookie Policy \u2014 CHATWITHPDFAI" };
export default function Page() {
  return <LongFormPage eyebrow={""} title={""} lede={""} lastUpdated={""} sections={SECTIONS} />;
}
