/**
 * The channels Studio publishes to, each with its job (from the plan),
 * what connecting it takes, and whether it is connected: a channel counts
 * as connected only when its credentials are actually present. Reddit and
 * Medium are by hand on purpose: the plan keeps a person in those threads.
 */
export type Channel = {
  id: string;
  name: string;
  kind: "api" | "manual";
  job: string;
  posts: string;
  /** Environment variables whose presence means the connection is configured. */
  env: string[];
  needs: string[];
  meanwhile: string;
  connected: boolean;
};

const CHANNELS: Omit<Channel, "connected">[] = [
  {
    id: "pinterest", name: "Pinterest", kind: "api",
    job: "The traffic engine: people search it like Google and pins keep working for months.",
    posts: "Video pins and image pins, each linking to a guide, on boards by need.",
    env: ["PINTEREST_ACCESS_TOKEN"],
    needs: ["A Pinterest business account", "A Pinterest developer app with Standard access (review takes days to weeks)", "Boards by need: after a death, homeschool records, home maintenance, travel planning, money reset"],
    meanwhile: "Download the film or pin and upload it; Studio drafts the title, description, alt text and tracked link.",
  },
  {
    id: "youtube", name: "YouTube", kind: "api",
    job: "The second-largest search engine: guide-driven Shorts that teach, then hand over to a product.",
    posts: "Shorts, with a title and description drafted from the guide.",
    env: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"],
    needs: ["A Google Cloud project with the YouTube Data API", "OAuth consent for the channel (an audit for public uploads)", "The Draftpace channel"],
    meanwhile: "Upload from the YouTube app; paste the drafted title and description.",
  },
  {
    id: "instagram", name: "Instagram", kind: "api",
    job: "Brand and trust: people feel understood, then follow.",
    posts: "Reels and feed videos; posts and carousels later.",
    env: ["META_APP_ID", "META_APP_SECRET", "INSTAGRAM_BUSINESS_ACCOUNT_ID", "META_PAGE_ACCESS_TOKEN"],
    needs: ["A Meta business portfolio", "An Instagram business account linked to the Facebook Page", "A Meta app with content publishing permission (app review)"],
    meanwhile: "Post from the Instagram app; the drafted caption says where the link is (bio).",
  },
  {
    id: "facebook", name: "Facebook", kind: "api",
    job: "Older audiences where they gather: a credible Page, Reels, and answers in Groups.",
    posts: "Page Reels and feed videos. Groups stay by hand.",
    env: ["META_APP_ID", "META_APP_SECRET", "FACEBOOK_PAGE_ID", "META_PAGE_ACCESS_TOKEN"],
    needs: ["The Draftpace Facebook Page", "The same Meta app as Instagram"],
    meanwhile: "Post from Meta Business Suite with the drafted caption and link.",
  },
  {
    id: "tiktok", name: "TikTok", kind: "api",
    job: "Younger ADHD, homeschool and adulting audiences.",
    posts: "Native-feel videos from the same engine.",
    env: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    needs: ["A TikTok business account", "A TikTok developer app with the Content Posting API (audited before public posts)"],
    meanwhile: "Upload from the TikTok app with the drafted caption.",
  },
  {
    id: "email", name: "Email (Resend)", kind: "api",
    job: "The one audience Draftpace owns: app users who opted in, and guide readers who signed up.",
    posts: "Guide roundups, seasonal checklists, new guides.",
    env: ["RESEND_API_KEY"],
    needs: ["A Resend API key for a separate marketing domain (for example news.draftpace.com)", "Marketing consent in the app and on guides", "A postal address for the footer"],
    meanwhile: "Build and preview emails in Email; sending waits for consent and the key.",
  },
  {
    id: "reddit", name: "Reddit", kind: "manual",
    job: "Authority by being genuinely useful, from a disclosed founder account.",
    posts: "Full answers drafted from the matching guide; you post them yourself.",
    env: [],
    needs: ["Nine helpful answers for every one that mentions Draftpace", "Always disclose", "Never in grief or crisis threads"],
    meanwhile: "By hand, always.",
  },
  {
    id: "medium", name: "Medium", kind: "manual",
    job: "Credibility, low traffic.",
    posts: "The 20 ready articles, then selected guides re-posted with a link back.",
    env: [],
    needs: ["Use Medium's import tool with the guide's URL so the original is credited"],
    meanwhile: "By hand.",
  },
];

export function channelStatus(env: Record<string, string | undefined> = process.env): Channel[] {
  return CHANNELS.map((c) => ({ ...c, connected: c.kind === "api" && c.env.every((k) => !!env[k]) }));
}
