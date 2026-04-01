import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const refundSchema = z.object({
  order_id: z.string().describe("Order ID to refund"),
  amount: z.number().positive().describe("Refund amount in VND"),
  trans_date: z.string().describe("Original transaction date (yyyyMMddHHmmss)"),
  trans_type: z.enum(["02", "03"]).default("02").describe("02=full refund, 03=partial refund"),
  ip_addr: z.string().default("127.0.0.1").describe("IP address"),
  create_by: z.string().default("system").describe("User who creates refund"),
});

export async function handleRefund(params: z.infer<typeof refundSchema>): Promise<string> {
  const requestId = "ref-" + Date.now();
  const createDate = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const vnpParams: Record<string, string> = {
    vnp_RequestId: requestId, vnp_Version: "2.1.0", vnp_Command: "refund",
    vnp_TmnCode: client.tmnCode, vnp_TransactionType: params.trans_type,
    vnp_TxnRef: params.order_id, vnp_Amount: String(params.amount * 100),
    vnp_OrderInfo: "Refund order " + params.order_id, vnp_TransactionDate: params.trans_date,
    vnp_CreateDate: createDate, vnp_CreateBy: params.create_by, vnp_IpAddr: params.ip_addr,
  };
  const signData = [requestId, "2.1.0", "refund", client.tmnCode, params.trans_type, params.order_id, params.amount * 100, "0", params.trans_date, params.create_by, createDate, params.ip_addr, "Refund order " + params.order_id].join("|");
  vnpParams.vnp_SecureHash = client.signHmac512(signData);
  const result = await client.request("POST", "/merchant_webapi/api/transaction", vnpParams);
  return JSON.stringify(result, null, 2);
}
