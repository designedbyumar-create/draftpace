"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { billPaymentSchema, type BillPayment } from "../state";

interface BillPaymentRow {
  id: string;
  bill_id: string;
  period: string;
  paid_on: string;
}

function parse(row: BillPaymentRow): Result<BillPayment> {
  const parsed = billPaymentSchema.safeParse({ id: row.id, billId: row.bill_id, period: row.period, paidOn: row.paid_on });
  if (!parsed.success) return err({ kind: "validation", message: parsed.error.issues[0]?.message ?? "Invalid payment shape." });
  return ok(parsed.data);
}

export async function listBillPayments(productInstanceId: string): Promise<Result<BillPayment[]>> {
  const { data, error } = await supabase.from("pfc_bill_payments").select("id, bill_id, period, paid_on").eq("product_instance_id", productInstanceId);
  if (error) return err({ kind: "network", message: error.message });
  const payments: BillPayment[] = [];
  for (const row of (data ?? []) as BillPaymentRow[]) {
    const parsed = parse(row);
    if (parsed.ok) payments.push(parsed.data);
  }
  return ok(payments);
}

export async function markBillPaid(productInstanceId: string, billId: string, period: string, paidOn: string): Promise<Result<BillPayment>> {
  // getSession(), as the record repository does: RLS's auth.uid() = user_id is the real boundary.
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });
  const { data, error } = await supabase
    .from("pfc_bill_payments")
    .insert({ user_id: session.user.id, product_instance_id: productInstanceId, bill_id: billId, period, paid_on: paidOn })
    .select("id, bill_id, period, paid_on")
    .single();
  if (error) return err({ kind: "network", message: error.message });
  return parse(data as BillPaymentRow);
}

export async function unmarkBillPaid(paymentId: string): Promise<Result<true>> {
  const { error } = await supabase.from("pfc_bill_payments").delete().eq("id", paymentId);
  if (error) return err({ kind: "network", message: error.message });
  return ok(true);
}
