import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { evaluateProductUpdates } from "./updatesEvaluators";

/**
 * A minimal fake query result: chainable (every filter method returns
 * itself) and thenable (awaiting it at any point in the chain resolves
 * to the configured {data, error}) — mirrors how Supabase's real
 * PostgrestFilterBuilder behaves, without needing the real client.
 */
function fakeResult(data: unknown, error: unknown = null) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    not: () => chain,
    lte: () => chain,
    then: (resolve: (v: { data: unknown; error: unknown }) => void) => resolve({ data, error }),
  };
  return chain;
}

function fakeSupabase(tableResults: Record<string, unknown>): SupabaseClient {
  return {
    from: (table: string) => tableResults[table] ?? fakeResult([]),
  } as unknown as SupabaseClient;
}

const NOW = new Date("2026-09-06T12:00:00Z");

describe("evaluateProductUpdates — alongside", () => {
  it("maps deriveAttention's stateless signals into update payloads, skipping the ready signal", async () => {
    const supabase = fakeSupabase({
      als_items: fakeResult([
        {
          id: "i1",
          kind: "thread",
          title: "Taxes",
          note: null,
          status: "open",
          next_at: "2026-09-10",
          user_chosen_date: false,
          every_months: null,
          waiting_on: null,
          last_touched_at: null,
          left_off_note: null,
          next_step: null,
          created_at: "2026-01-01T00:00:00Z",
        },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "alongside", "instance-1", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      title: "Worth a look",
      url: "/app/products/alongside/item/i1",
      dedupeKey: "i1:coming-up",
    });
  });
});

describe("evaluateProductUpdates — homeschooling-companion", () => {
  it("flags a child with a real last-logged date past the quiet threshold", async () => {
    const supabase = fakeSupabase({
      hsc_children: fakeResult([{ id: "c1", name: "Mia" }]),
      hsc_task_events: fakeResult([{ child_id: "c1", on_date: "2026-08-20" }]),
    });

    const payloads = await evaluateProductUpdates(supabase, "homeschooling-companion", "instance-1", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].title).toBe("Haven't logged anything for Mia in a while");
    expect(payloads[0].url).toBe("/app/products/homeschooling-companion/kids/c1");
  });

  it("never flags a child with zero logged events — a brand-new child is not 'gone quiet'", async () => {
    const supabase = fakeSupabase({
      hsc_children: fakeResult([{ id: "c1", name: "Mia" }]),
      hsc_task_events: fakeResult([]),
    });

    const payloads = await evaluateProductUpdates(supabase, "homeschooling-companion", "instance-1", NOW);
    expect(payloads).toHaveLength(0);
  });

  it("stays quiet for a child logged recently, under the threshold", async () => {
    const supabase = fakeSupabase({
      hsc_children: fakeResult([{ id: "c1", name: "Mia" }]),
      hsc_task_events: fakeResult([{ child_id: "c1", on_date: "2026-09-05" }]),
    });

    const payloads = await evaluateProductUpdates(supabase, "homeschooling-companion", "instance-1", NOW);
    expect(payloads).toHaveLength(0);
  });
});

describe("evaluateProductUpdates — travel-companion", () => {
  it("flags a trip starting within the upcoming window", async () => {
    const supabase = fakeSupabase({
      trv_trips: fakeResult([{ id: "t1", title: "Japan", destination_summary: "Tokyo", starts_at: "2026-09-12" }]),
    });

    const payloads = await evaluateProductUpdates(supabase, "travel-companion", "instance-1", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].title).toBe("Your trip to Tokyo starts in 6 days");
    expect(payloads[0].dedupeKey).toBe("travelTripUpcoming:t1");
  });

  it("ignores a trip far outside the window", async () => {
    const supabase = fakeSupabase({
      trv_trips: fakeResult([{ id: "t1", title: "Japan", destination_summary: "Tokyo", starts_at: "2027-01-01" }]),
    });

    const payloads = await evaluateProductUpdates(supabase, "travel-companion", "instance-1", NOW);
    expect(payloads).toHaveLength(0);
  });
});

describe("evaluateProductUpdates — personal-life-affairs-companion", () => {
  it("flags an item due for review", async () => {
    const supabase = fakeSupabase({
      pla_items: fakeResult([{ id: "p1", label: "Will", next_review_at: "2026-09-01T00:00:00Z" }]),
    });

    const payloads = await evaluateProductUpdates(supabase, "personal-life-affairs-companion", "instance-1", NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].title).toBe("It's time to review Will");
    expect(payloads[0].dedupeKey).toBe("pla_reviewDue:p1:2026-09-01");
  });
});
