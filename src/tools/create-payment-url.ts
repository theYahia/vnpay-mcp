import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const createPaymentUrlSchema = z.object({
  order_id: z.string().describe("Unique order reference"),
  amount: z.number().positive().describe("Amount in VND"),
  order_info: z.string().describe("Order description"),
  return_url: z.string().url().describe("Return URL after payment"),
  ip_addr: z.string().default("127.0.0.1").describe("Customer IP address"),
  locale: z.enum(["vn", "en"]).default("vn").describe("Language"),
  bank_code: z.string().optional().describe("Bank code (empty = user selects on VNPay)"),
});

export async function handleCreatePaymentUrl(params: z.infer<typeof createPaymentUrlSchema>): Promise<string> {
  const date = new Date();
  const createDate = date.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const vnpParams: Record<string, string> = {
    vnp_Version: "2.1.0", vnp_Command: "pay", vnp_TmnCode: client.tmnCode,
    vnp_Amount: String(params.amount * 100), vnp_CreateDate: createDate,
    vnp_CurrCode: "VND", vnp_IpAddr: params.ip_addr, vnp_Locale: params.locale,
    vnp_OrderInfo: params.order_info, vnp_OrderType: "other",
    vnp_ReturnUrl: params.return_url, vnp_TxnRef: params.order_id,
  };
  if (params.bank_code) vnpParams.vnp_BankCode = params.bank_code;
  const sorted = client.sortObject(vnpParams);
  const signData = new URLSearchParams(sorted).toString();
  const signature = client.signHmac512(signData);
  sorted.vnp_SecureHash = signature;
  const paymentUrl = client.baseUrl + "/paymentv2/vpcpay.html?" + new URLSearchParams(sorted).toString();
  return JSON.stringify({ payment_url: paymentUrl, order_id: params.order_id }, null, 2);
}
