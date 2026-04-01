import { createHmac } from "node:crypto";

const SANDBOX_URL = "https://sandbox.vnpayment.vn";
const PROD_URL = "https://pay.vnpay.vn";
const TIMEOUT = 15_000;

export class VNPayClient {
  public tmnCode: string;
  private hashSecret: string;
  public baseUrl: string;

  constructor() {
    this.tmnCode = process.env.VNPAY_TMN_CODE ?? "";
    this.hashSecret = process.env.VNPAY_HASH_SECRET ?? "";
    if (!this.tmnCode || !this.hashSecret) {
      throw new Error(
        "Environment variables VNPAY_TMN_CODE and VNPAY_HASH_SECRET are required."
      );
    }
    this.baseUrl = process.env.VNPAY_PRODUCTION === "true" ? PROD_URL : SANDBOX_URL;
  }

  signHmac512(data: string): string {
    return createHmac("sha512", this.hashSecret).update(data).digest("hex");
  }

  sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== "") sorted[key] = obj[key];
    }
    return sorted;
  }

  async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`VNPay HTTP ${response.status}: ${text}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("VNPay: request timeout (15s).");
      }
      throw error;
    }
  }
}
