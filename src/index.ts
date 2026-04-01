#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPaymentUrlSchema, handleCreatePaymentUrl } from "./tools/create-payment-url.js";
import { queryTransactionSchema, handleQueryTransaction } from "./tools/query-transaction.js";
import { refundSchema, handleRefund } from "./tools/refund.js";
import { getBankListSchema, handleGetBankList } from "./tools/get-bank-list.js";
import { createTokenSchema, handleCreateToken } from "./tools/create-token.js";
import { payWithTokenSchema, handlePayWithToken } from "./tools/pay-with-token.js";
import { queryTokenSchema, handleQueryToken } from "./tools/query-token.js";
import { verifyIpnSchema, handleVerifyIpn } from "./tools/verify-ipn.js";

const server = new McpServer({ name: "vnpay-mcp", version: "1.0.0" });

server.tool("create_payment_url", "Generate a VNPay payment URL.", createPaymentUrlSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreatePaymentUrl(params) }] }));
server.tool("query_transaction", "Query transaction status.", queryTransactionSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleQueryTransaction(params) }] }));
server.tool("refund", "Refund a VNPay transaction.", refundSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleRefund(params) }] }));
server.tool("get_bank_list", "Get list of supported banks.", getBankListSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetBankList(params) }] }));
server.tool("create_token", "Create a card token for recurring payments.", createTokenSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreateToken(params) }] }));
server.tool("pay_with_token", "Pay using a stored card token.", payWithTokenSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handlePayWithToken(params) }] }));
server.tool("query_token", "Query card token information.", queryTokenSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleQueryToken(params) }] }));
server.tool("verify_ipn", "Verify a VNPay IPN callback signature.", verifyIpnSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleVerifyIpn(params) }] }));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[vnpay-mcp] Server started. 8 tools available.");
}
main().catch((error) => { console.error("[vnpay-mcp] Error:", error); process.exit(1); });
