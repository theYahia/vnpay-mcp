import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const queryTransactionSchema = z.object({
  order_id: z.string().describe("Order ID to query"),
  trans_date: z.string().describe("Transaction date (yyyyMMddHHmmss)"),
  ip_addr: z.string().default("127.0.0.1").describe("IP address"),
});

export async function handleQueryTransaction(params: z.infer<typeof queryTransactionSchema>): Promise<string> {
  const requestId = "qry-" + Date.now();
  const createDate = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const vnpParams: Record<string, string> = {
    vnp_RequestId: requestId, vnp_Version: "2.1.0", vnp_Command: "querydr",
    vnp_TmnCode: client.tmnCode, vnp_TxnRef: params.order_id,
    vnp_OrderInfo: "Query order " + params.order_id, vnp_TransactionDate: params.trans_date,
    vnp_CreateDate: createDate, vnp_IpAddr: params.ip_addr,
  };
  const signData = [requestId, "2.1.0", "querydr", client.tmnCode, params.order_id, params.trans_date, createDate, params.ip_addr, "Query order " + params.order_id].join("|");
  vnpParams.vnp_SecureHash = client.signHmac512(signData);
  const result = await client.request("POST", "/merchant_webapi/api/transaction", vnpParams);
  return JSON.stringify(result, null, 2);
}
