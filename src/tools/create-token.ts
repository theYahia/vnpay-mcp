import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const createTokenSchema = z.object({
  order_id: z.string().describe("Order ID for token creation"),
  amount: z.number().positive().describe("Amount in VND"),
  return_url: z.string().url().describe("Return URL"),
  ip_addr: z.string().default("127.0.0.1").describe("Customer IP address"),
});

export async function handleCreateToken(params: z.infer<typeof createTokenSchema>): Promise<string> {
  const createDate = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const vnpParams: Record<string, string> = {
    vnp_Version: "2.1.0", vnp_Command: "token_create",
    vnp_TmnCode: client.tmnCode, vnp_Amount: String(params.amount * 100),
    vnp_CreateDate: createDate, vnp_CurrCode: "VND", vnp_IpAddr: params.ip_addr,
    vnp_Locale: "vn", vnp_OrderInfo: "Token for " + params.order_id, vnp_OrderType: "other",
    vnp_ReturnUrl: params.return_url, vnp_TxnRef: params.order_id,
  };
  const sorted = client.sortObject(vnpParams);
  const signData = new URLSearchParams(sorted).toString();
  sorted.vnp_SecureHash = client.signHmac512(signData);
  const paymentUrl = client.baseUrl + "/paymentv2/vpcpay.html?" + new URLSearchParams(sorted).toString();
  return JSON.stringify({ token_url: paymentUrl, order_id: params.order_id }, null, 2);
}
