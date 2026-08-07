import { describe, expect, it, vi, beforeEach } from "vitest";

const mockChain = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

// Reset and re-chain before each test so assertions don't leak between tests.
function resetChain() {
  for (const fn of Object.values(mockChain)) fn.mockReset();
  mockChain.select.mockReturnValue(mockChain);
  mockChain.eq.mockReturnValue(mockChain);
  mockChain.order.mockReturnValue(mockChain);
  mockChain.insert.mockReturnValue(mockChain);
  mockChain.update.mockReturnValue(mockChain);
}

import { listAccounts, createAccount } from "./accounts";

describe("Accounts domain repository — row mapping round-trip", () => {
  beforeEach(() => {
    resetChain();
  });

  it("list() maps snake_case DB rows to camelCase Account entities", async () => {
    mockChain.order.mockResolvedValue({
      data: [
        {
          id: "acc-1",
          name: "Checking",
          type: "checking",
          current_balance_minor: 150000,
          currency: "USD",
          available_for_spending: true,
          balance_as_of_date: "2026-08-08",
          notes: null,
          status: "ready",
          needs_review_reason: null,
          source: "manual",
          import_session_id: null,
          created_at: "2026-08-08T00:00:00Z",
          updated_at: "2026-08-08T00:00:00Z",
        },
      ],
      error: null,
    });

    const result = await listAccounts("instance-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: "acc-1",
        name: "Checking",
        currentBalanceMinorUnits: 150000,
        availableForSpending: true,
      });
    }
  });

  it("list() skips a malformed row rather than failing the whole list", async () => {
    mockChain.order.mockResolvedValue({
      data: [
        { id: "bad", name: null /* invalid: name must be a string */ },
        {
          id: "acc-2",
          name: "Savings",
          type: "savings",
          current_balance_minor: 500000,
          currency: "USD",
          available_for_spending: false,
          balance_as_of_date: "2026-08-08",
          notes: null,
          status: "ready",
          needs_review_reason: null,
          source: "manual",
          import_session_id: null,
          created_at: "2026-08-08T00:00:00Z",
          updated_at: "2026-08-08T00:00:00Z",
        },
      ],
      error: null,
    });

    const result = await listAccounts("instance-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("acc-2");
    }
  });

  it("list() returns a network error result on a query error, distinct from an empty list", async () => {
    mockChain.order.mockResolvedValue({ data: null, error: { message: "connection reset" } });

    const result = await listAccounts("instance-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("network");
    }
  });

  it("create() maps a camelCase patch to snake_case columns before inserting", async () => {
    mockChain.single.mockResolvedValue({
      data: {
        id: "acc-3",
        name: "Cash",
        type: "cash",
        current_balance_minor: 20000,
        currency: "USD",
        available_for_spending: true,
        balance_as_of_date: "2026-08-08",
        notes: null,
        status: "ready",
        needs_review_reason: null,
        source: "manual",
        import_session_id: null,
        created_at: "2026-08-08T00:00:00Z",
        updated_at: "2026-08-08T00:00:00Z",
      },
      error: null,
    });

    const result = await createAccount("instance-1", { name: "Cash", currentBalanceMinorUnits: 20000 });
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Cash", current_balance_minor: 20000, product_instance_id: "instance-1" })
    );
    expect(result.ok).toBe(true);
  });
});
