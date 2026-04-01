import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;
process.env.VNPAY_TMN_CODE = "TESTCODE";
process.env.VNPAY_HASH_SECRET = "TESTSECRET";

describe("vnpay-mcp tools", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("create_payment_url generates URL", async () => {
    const { handleCreatePaymentUrl } = await import("../create-payment-url.js");
    const result = await handleCreatePaymentUrl({ order_id: "ord-1", amount: 100000, order_info: "Test", return_url: "https://ex.com/return", ip_addr: "127.0.0.1", locale: "vn" });
    const parsed = JSON.parse(result);
    expect(parsed.payment_url).toContain("vnpayment.vn");
    expect(parsed.order_id).toBe("ord-1");
  });

  it("query_transaction queries order", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ vnp_ResponseCode: "00", vnp_TransactionStatus: "00" }) });
    const { handleQueryTransaction } = await import("../query-transaction.js");
    const result = await handleQueryTransaction({ order_id: "ord-1", trans_date: "20260401120000", ip_addr: "127.0.0.1" });
    expect(JSON.parse(result).vnp_ResponseCode).toBe("00");
  });

  it("refund processes refund", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ vnp_ResponseCode: "00" }) });
    const { handleRefund } = await import("../refund.js");
    const result = await handleRefund({ order_id: "ord-1", amount: 50000, trans_date: "20260401120000", trans_type: "02", ip_addr: "127.0.0.1", create_by: "system" });
    expect(JSON.parse(result).vnp_ResponseCode).toBe("00");
  });

  it("get_bank_list retrieves banks", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ([{ bankCode: "NCB", bankName: "Ngan hang NCB" }]) });
    const { handleGetBankList } = await import("../get-bank-list.js");
    const result = await handleGetBankList({});
    expect(JSON.parse(result)[0].bankCode).toBe("NCB");
  });

  it("create_token generates token URL", async () => {
    const { handleCreateToken } = await import("../create-token.js");
    const result = await handleCreateToken({ order_id: "tok-1", amount: 10000, return_url: "https://ex.com/return", ip_addr: "127.0.0.1" });
    expect(JSON.parse(result).token_url).toContain("vnpayment.vn");
  });

  it("pay_with_token charges token", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ vnp_ResponseCode: "00", vnp_TransactionNo: "t123" }) });
    const { handlePayWithToken } = await import("../pay-with-token.js");
    const result = await handlePayWithToken({ order_id: "ord-2", amount: 50000, token: "tok_abc", order_info: "Test", ip_addr: "127.0.0.1" });
    expect(JSON.parse(result).vnp_ResponseCode).toBe("00");
  });

  it("query_token retrieves token info", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ vnp_ResponseCode: "00", vnp_CardNumber: "****1234" }) });
    const { handleQueryToken } = await import("../query-token.js");
    const result = await handleQueryToken({ token: "tok_abc", ip_addr: "127.0.0.1" });
    expect(JSON.parse(result).vnp_CardNumber).toBe("****1234");
  });

  it("verify_ipn validates signature", async () => {
    const { handleVerifyIpn } = await import("../verify-ipn.js");
    const result = await handleVerifyIpn({ query_string: "vnp_TxnRef=ord-1&vnp_Amount=10000000&vnp_ResponseCode=00&vnp_SecureHash=invalid" });
    const parsed = JSON.parse(result);
    expect(parsed.valid).toBe(false);
    expect(parsed.order_id).toBe("ord-1");
  });

  it("handles HTTP errors gracefully", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => "Bad Request" });
    const { handleQueryTransaction } = await import("../query-transaction.js");
    await expect(handleQueryTransaction({ order_id: "bad", trans_date: "20260401", ip_addr: "127.0.0.1" })).rejects.toThrow("VNPay HTTP 400");
  });
});
