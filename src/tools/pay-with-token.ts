import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const payWithTokenSchema = z.object({
  order_id: z.string().describe("Unique order ID"),
  amount: z.number().positive().describe("Amount in VND"),
  token: z.string().describe("Stored card token"),
  order_info: z.string().describe("Order description"),
  ip_addr: z.string().default("127.0.0.1").describe("Customer IP address"),
});

export async function handlePayWithToken(params: z.infer<typeof payWithTokenSchema>): Promise<string> {
  const requestId = "tok-" + Date.now();
  const createDate = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const signData = [requestId, "2.1.0", "token_pay", client.tmnCode, params.order_id, params.amount * 100, createDate, params.ip_addr, params.order_info].join("|");
  const body = {
    vnp_RequestId: requestId, vnp_Version: "2.1.0", vnp_Command: "token_pay",
    vnp_TmnCode: client.tmnCode, vnp_TxnRef: params.order_id,
    vnp_Amount: String(params.amount * 100), vnp_OrderInfo: params.order_info,
    vnp_Token: params.token, vnp_CreateDate: createDate, vnp_IpAddr: params.ip_addr,
    vnp_SecureHash: client.signHmac512(signData),
  };
  const result = await client.request("POST", "/merchant_webapi/api/transaction", body);
  return JSON.stringify(result, null, 2);
}
