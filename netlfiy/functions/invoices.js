// A&A Creations — Invoicing System API
// Backed by Netlify Blobs, same pattern as leads-store.js. Handles
// creating invoices (with auto-incrementing invoice numbers), listing/
// filtering, updating status/payments, and deletion.

const { getStore } = require("@netlify/blobs");
const { PACKAGES, ADDONS } = require("./lib/pricing-data");

const INVOICE_STORE = "aa-invoices";
const INVOICES_KEY = "all-invoices";
const COUNTER_KEY = "invoice-counter";

const VALID_STATUSES = ["Draft", "Sent", "Paid", "Overdue", "Cancelled"];

async function loadAllInvoices() {
  const store = getStore({ name: INVOICE_STORE, consistency: "strong" });
  const data = await store.get(INVOICES_KEY, { type: "json" });
  return data || [];
}

async function saveAllInvoices(invoices) {
  const store = getStore({ name: INVOICE_STORE, consistency: "strong" });
  await store.setJSON(INVOICES_KEY, invoices);
}

async function nextInvoiceNumber() {
  const store = getStore({ name: INVOICE_STORE, consistency: "strong" });
  const current = await store.get(COUNTER_KEY, { type: "json" });
  const next = (current || 0) + 1;
  await store.setJSON(COUNTER_KEY, next);
  return `AA-INV-${String(next).padStart(4, "0")}`;
}

function calculateTotals(lineItems, discountPct, taxPct) {
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0);
  const discountAmt = subtotal * ((Number(discountPct) || 0) / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = afterDiscount * ((Number(taxPct) || 0) / 100);
  const total = afterDiscount + taxAmt;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmt: Math.round(discountAmt * 100) / 100,
    taxAmt: Math.round(taxAmt * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  try {
    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters || {};

      if (params.pricing === "true") {
        return { statusCode: 200, headers, body: JSON.stringify({ packages: PACKAGES, addons: ADDONS }) };
      }

      const invoices = await loadAllInvoices();
      let filtered = invoices;
      if (params.status) filtered = filtered.filter((inv) => inv.status === params.status);
      if (params.leadId) filtered = filtered.filter((inv) => inv.leadId === params.leadId);

      filtered.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

      const stats = {
        total: invoices.length,
        totalInvoiced: invoices.reduce((s, i) => s + (i.total || 0), 0),
        totalPaid: invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0),
        totalOutstanding: invoices.filter((i) => ["Sent", "Overdue"].includes(i.status)).reduce((s, i) => s + (i.total || 0), 0),
        byStatus: VALID_STATUSES.reduce((acc, s) => {
          acc[s] = invoices.filter((i) => i.status === s).length;
          return acc;
        }, {}),
      };

      return { statusCode: 200, headers, body: JSON.stringify({ invoices: filtered, stats }) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");

      // Update existing invoice (status, payment) if id provided
      if (body.id && body.action === "update") {
        const invoices = await loadAllInvoices();
        const idx = invoices.findIndex((i) => i.id === body.id);
        if (idx === -1) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: "Invoice not found" }) };
        }
        if (body.status) {
          if (!VALID_STATUSES.includes(body.status)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` }) };
          }
          invoices[idx].status = body.status;
        }
        if (body.amountPaid !== undefined) {
          invoices[idx].amountPaid = Number(body.amountPaid) || 0;
        }
        invoices[idx].updatedAt = new Date().toISOString();
        await saveAllInvoices(invoices);
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, invoice: invoices[idx] }) };
      }

      // Create new invoice
      const { clientName, clientPhone, clientEmail, leadId, lineItems, discountPct, taxPct, dueDate, notes, invoiceType } = body;

      if (!clientName) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "clientName is required" }) };
      }
      if (!Array.isArray(lineItems) || lineItems.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "At least one line item is required" }) };
      }
      for (const item of lineItems) {
        if (!item.description || item.qty === undefined || item.unitPrice === undefined) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: "Each line item needs description, qty, and unitPrice" }) };
        }
      }

      const totals = calculateTotals(lineItems, discountPct, taxPct);
      const invoiceNumber = await nextInvoiceNumber();
      const now = new Date().toISOString();

      const VALID_TYPES = ["Quote", "Deposit Invoice", "Final Invoice", "Full Payment Invoice", "Custom"];
      const invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        invoiceType: VALID_TYPES.includes(invoiceType) ? invoiceType : "Full Payment Invoice",
        invoiceNumber,
        clientName,
        clientPhone: clientPhone || "",
        clientEmail: clientEmail || "",
        leadId: leadId || null,
        lineItems,
        discountPct: Number(discountPct) || 0,
        taxPct: Number(taxPct) || 0,
        ...totals,
        amountPaid: 0,
        status: "Draft",
        createdAt: now,
        updatedAt: now,
        dueDate: dueDate || "",
        notes: notes || "",
      };

      const invoices = await loadAllInvoices();
      invoices.push(invoice);
      await saveAllInvoices(invoices);

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, invoice }) };
    }

    if (event.httpMethod === "DELETE") {
      const params = event.queryStringParameters || {};
      if (!params.id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "id query parameter is required" }) };
      }
      const invoices = await loadAllInvoices();
      const filtered = invoices.filter((i) => i.id !== params.id);
      await saveAllInvoices(filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, remaining: filtered.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
