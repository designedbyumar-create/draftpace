import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { evaluateProductUpdates } from "./updatesEvaluators";

/**
 * A minimal fake query result: chainable and thenable, mirroring how
 * Supabase's real PostgrestFilterBuilder behaves, without needing the
 * real client.
 *
 * Every filter genuinely filters the row array, rather than being
 * no-op'd through. This replaced a version where `.eq()` (and every
 * other filter) simply returned the chain untouched: a query that
 * filtered on the wrong column value looked identical, in every test
 * here, to one that filtered on the right one. That gap is exactly how
 * `evaluatePersonalLifeAffairsUpdates`'s `.eq("status", "active")` sat
 * broken (the column stopped accepting "active" after migration
 * 202608220001 renamed it to "established") without a single test
 * failing.
 */
function fakeResult(rows: Record<string, unknown>[], error: unknown = null) {
  let filtered = rows;
  const chain = {
    select: () => chain,
    eq: (column: string, value: unknown) => {
      filtered = filtered.filter((row) => row[column] === value);
      return chain;
    },
    neq: (column: string, value: unknown) => {
      filtered = filtered.filter((row) => row[column] !== value);
      return chain;
    },
    in: (column: string, values: unknown[]) => {
      filtered = filtered.filter((row) => values.includes(row[column]));
      return chain;
    },
    not: (column: string, operator: string, value: unknown) => {
      if (operator === "is" && value === null) {
        filtered = filtered.filter((row) => row[column] !== null && row[column] !== undefined);
      }
      return chain;
    },
    lte: (column: string, value: unknown) => {
      filtered = filtered.filter((row) => (row[column] as string) <= (value as string));
      return chain;
    },
    then: (resolve: (v: { data: unknown; error: unknown }) => void) => resolve({ data: error ? null : filtered, error }),
  };
  return chain;
}

function fakeSupabase(tableResults: Record<string, unknown>): SupabaseClient {
  return {
    from: (table: string) => tableResults[table] ?? fakeResult([]),
  } as unknown as SupabaseClient;
}

const NOW = new Date("2026-09-06T12:00:00Z");
const INSTANCE_ID = "instance-1";

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
          product_instance_id: INSTANCE_ID,
        },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "alongside", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({
      title: "Worth a look",
      url: "/app/products/alongside/item/i1",
      dedupeKey: "i1:coming-up",
    });
  });

  it("never includes an archived item", async () => {
    const supabase = fakeSupabase({
      als_items: fakeResult([
        {
          id: "i1",
          kind: "thread",
          title: "Taxes",
          note: null,
          status: "archived",
          next_at: "2026-09-10",
          user_chosen_date: false,
          every_months: null,
          waiting_on: null,
          last_touched_at: null,
          left_off_note: null,
          next_step: null,
          created_at: "2026-01-01T00:00:00Z",
          product_instance_id: INSTANCE_ID,
        },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "alongside", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(0);
  });
});

describe("evaluateProductUpdates — homeschooling-companion", () => {
  it("flags a child with a real last-logged date past the quiet threshold", async () => {
    const supabase = fakeSupabase({
      hsc_children: fakeResult([{ id: "c1", name: "Mia", product_instance_id: INSTANCE_ID }]),
      hsc_task_events: fakeResult([{ child_id: "c1", on_date: "2026-08-20", product_instance_id: INSTANCE_ID }]),
    });

    const payloads = await evaluateProductUpdates(supabase, "homeschooling-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].title).toBe("Haven't logged anything for Mia in a while");
    expect(payloads[0].url).toBe("/app/products/homeschooling-companion/kids/c1");
  });

  it("never flags a child with zero logged events — a brand-new child is not 'gone quiet'", async () => {
    const supabase = fakeSupabase({
      hsc_children: fakeResult([{ id: "c1", name: "Mia", product_instance_id: INSTANCE_ID }]),
      hsc_task_events: fakeResult([]),
    });

    const payloads = await evaluateProductUpdates(supabase, "homeschooling-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(0);
  });

  it("stays quiet for a child logged recently, under the threshold", async () => {
    const supabase = fakeSupabase({
      hsc_children: fakeResult([{ id: "c1", name: "Mia", product_instance_id: INSTANCE_ID }]),
      hsc_task_events: fakeResult([{ child_id: "c1", on_date: "2026-09-05", product_instance_id: INSTANCE_ID }]),
    });

    const payloads = await evaluateProductUpdates(supabase, "homeschooling-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(0);
  });
});

describe("evaluateProductUpdates — travel-companion", () => {
  it("flags a trip starting within the upcoming window", async () => {
    const supabase = fakeSupabase({
      trv_trips: fakeResult([
        { id: "t1", title: "Japan", destination_summary: "Tokyo", starts_at: "2026-09-12", status: "planning", product_instance_id: INSTANCE_ID },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "travel-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].title).toBe("Your trip to Tokyo starts in 6 days");
    expect(payloads[0].dedupeKey).toBe("travelTripUpcoming:t1");
  });

  it("ignores a trip far outside the window", async () => {
    const supabase = fakeSupabase({
      trv_trips: fakeResult([
        { id: "t1", title: "Japan", destination_summary: "Tokyo", starts_at: "2027-01-01", status: "planning", product_instance_id: INSTANCE_ID },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "travel-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(0);
  });

  it("ignores a cancelled trip even inside the window", async () => {
    const supabase = fakeSupabase({
      trv_trips: fakeResult([
        { id: "t1", title: "Japan", destination_summary: "Tokyo", starts_at: "2026-09-12", status: "cancelled", product_instance_id: INSTANCE_ID },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "travel-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(0);
  });
});

describe("evaluateProductUpdates — personal-life-affairs-companion", () => {
  it("flags an established item due for review", async () => {
    const supabase = fakeSupabase({
      pla_items: fakeResult([
        { id: "p1", label: "Will", next_review_at: "2026-09-01T00:00:00Z", status: "established", product_instance_id: INSTANCE_ID },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "personal-life-affairs-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].title).toBe("It's time to review Will");
    expect(payloads[0].dedupeKey).toBe("pla_reviewDue:p1:2026-09-01");
  });

  /**
   * The regression this phase exists to add. Migration 202608220001
   * renamed every "active" row to "established" and the evaluator's own
   * filter was never updated to match, so this exact fixture, an item
   * genuinely past its next_review_at, silently matched nothing from the
   * day the migration ran. A fake that no-ops `.eq()` cannot catch this;
   * this one does, because it is the same fixture shape a real database
   * would hold today (no row has been "active" since that migration).
   */
  it("still returns the item once its status reads 'established', not the pre-migration 'active'", async () => {
    const supabase = fakeSupabase({
      pla_items: fakeResult([
        { id: "p1", label: "Will", next_review_at: "2026-09-01T00:00:00Z", status: "established", product_instance_id: INSTANCE_ID },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "personal-life-affairs-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(1);
  });

  it("never flags an item whose review date has not arrived yet", async () => {
    const supabase = fakeSupabase({
      pla_items: fakeResult([
        { id: "p1", label: "Will", next_review_at: "2027-01-01T00:00:00Z", status: "established", product_instance_id: INSTANCE_ID },
      ]),
    });

    const payloads = await evaluateProductUpdates(supabase, "personal-life-affairs-companion", INSTANCE_ID, NOW);
    expect(payloads).toHaveLength(0);
  });

  it("never flags an incomplete, notApplicable or archived item, only an established one", async () => {
    for (const status of ["incomplete", "notApplicable", "archived"]) {
      const supabase = fakeSupabase({
        pla_items: fakeResult([
          { id: "p1", label: "Will", next_review_at: "2026-09-01T00:00:00Z", status, product_instance_id: INSTANCE_ID },
        ]),
      });

      const payloads = await evaluateProductUpdates(supabase, "personal-life-affairs-companion", INSTANCE_ID, NOW);
      expect(payloads, status).toHaveLength(0);
    }
  });
});
