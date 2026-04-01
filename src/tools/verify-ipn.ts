import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const verifyIpnSchema = z.object({
  query_string: z.string().describe("Full query string from VNPay IPN callback URL"),
});

export async function handleVerifyIpn(params: z.infer<typeof verifyIpnSchema>): Promise<string> {
  const urlParams = new URLSearchParams(params.query_string);
  const secureHash = urlParams.get("vnp_SecureHash") ?? "";
  urlParams.delete("vnp_SecureHash");
  urlParams.delete("vnp_SecureHashType");
  const entries: Record<string, string> = {};
  for (const [key, value] of urlParams.entries()) entries[key] = value;
  const sorted = client.sortObject(entries);
  const signData = new URLSearchParams(sorted).toString();
  const expectedHash = client.signHmac512(signData);
  const isValid = secureHash === expectedHash;
  return JSON.stringify({
    valid: isValid,
    response_code: urlParams.get("vnp_ResponseCode"),
    transaction_no: urlParams.get("vnp_TransactionNo"),
    amount: Number(urlParams.get("vnp_Amount") ?? 0) / 100,
    order_id: urlParams.get("vnp_TxnRef"),
  }, null, 2);
}
