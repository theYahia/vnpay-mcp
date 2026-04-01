import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const queryTokenSchema = z.object({
  token: z.string().describe("Card token to query"),
  ip_addr: z.string().default("127.0.0.1").describe("IP address"),
});

export async function handleQueryToken(params: z.infer<typeof queryTokenSchema>): Promise<string> {
  const requestId = "qtok-" + Date.now();
  const createDate = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const signData = [requestId, "2.1.0", "token_query", client.tmnCode, params.token, createDate, params.ip_addr].join("|");
  const body = {
    vnp_RequestId: requestId, vnp_Version: "2.1.0", vnp_Command: "token_query",
    vnp_TmnCode: client.tmnCode, vnp_Token: params.token,
    vnp_CreateDate: createDate, vnp_IpAddr: params.ip_addr,
    vnp_SecureHash: client.signHmac512(signData),
  };
  const result = await client.request("POST", "/merchant_webapi/api/transaction", body);
  return JSON.stringify(result, null, 2);
}
