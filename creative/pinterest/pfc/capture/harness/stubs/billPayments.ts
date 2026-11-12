// Stand-in for domain/billPayments.ts (Supabase): the fixture's one paid tick.
import { ok, err, type Result } from "@/product-framework/result";
import type { BillPayment } from "@/products/personal-finance-companion/state";
import { BILL_PAYMENTS } from "../fixtures";

export async function listBillPayments(_instance: string): Promise<Result<BillPayment[]>> { return ok(BILL_PAYMENTS); }
export async function markBillPaid(): Promise<Result<BillPayment>> { return err({ kind: "network", message: "capture harness: read-only" }); }
export async function unmarkBillPaid(): Promise<Result<true>> { return err({ kind: "network", message: "capture harness: read-only" }); }
