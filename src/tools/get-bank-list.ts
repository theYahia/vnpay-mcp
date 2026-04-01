import { z } from "zod";
import { VNPayClient } from "../client.js";
const client = new VNPayClient();

export const getBankListSchema = z.object({});

export async function handleGetBankList(_params: z.infer<typeof getBankListSchema>): Promise<string> {
  const result = await client.request("GET", "/paymentv2/bankList");
  return JSON.stringify(result, null, 2);
}
