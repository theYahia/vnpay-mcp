# vnpay-mcp

MCP server for VNPay payment gateway (Vietnam). Supports payment URL generation, transaction queries, refunds, tokenized payments, and IPN verification with HMAC-SHA512 signing.

## Tools (8)

| Tool | Description |
|---|---|
| `create_payment_url` | Generate a VNPay payment URL |
| `query_transaction` | Query transaction status |
| `refund` | Refund a transaction |
| `get_bank_list` | Get supported bank list |
| `create_token` | Create a card token |
| `pay_with_token` | Pay using stored token |
| `query_token` | Query token information |
| `verify_ipn` | Verify IPN callback signature |

## Quick Start

```json
{
  "mcpServers": {
    "vnpay": {
      "command": "npx",
      "args": ["-y", "@theyahia/vnpay-mcp"],
      "env": {
        "VNPAY_TMN_CODE": "<YOUR_TMN_CODE>",
        "VNPAY_HASH_SECRET": "<YOUR_HASH_SECRET>"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VNPAY_TMN_CODE` | Yes | Terminal code from VNPay |
| `VNPAY_HASH_SECRET` | Yes | Hash secret for HMAC-SHA512 signing |
| `VNPAY_PRODUCTION` | No | Set to "true" for production |

## Demo Prompts

- "Create a VNPay payment URL for 100,000 VND"
- "Query transaction status for order vnp-123"
- "Get list of supported Vietnamese banks"
- "Verify this IPN callback: vnp_TxnRef=..."

## License

MIT
