// A&A Creations — Shared Pricing Data
// Single source of truth for package/add-on pricing, used by the invoicing
// tool to auto-fill amounts. Keep this in sync with the pricing workbook
// and pricing.html if prices ever change.

const PACKAGES = [
  { key: "starter", name: "Starter Package", price: 7999 },
  { key: "growth", name: "Growth Package", price: 19999 },
  { key: "custom", name: "Custom Package (base)", price: 34999 },
];

const ADDONS = [
  { key: "whatsapp", name: "WhatsApp Business Setup", price: 1999 },
  { key: "extra-page", name: "Extra Page", price: 1999 },
  { key: "copywriting", name: "Copywriting (per page)", price: 1499 },
  { key: "logo", name: "Custom Logo Design", price: 3999 },
  { key: "extra-revision", name: "Extra Revision Round", price: 1499 },
  { key: "rush", name: "Rush Delivery", price: 4999 },
  { key: "seo", name: "Basic SEO Setup", price: 2999 },
  { key: "gbp", name: "Google Business Profile Setup", price: 1999 },
  { key: "ai-geo", name: "AI/GEO Visibility Package", price: 3999 },
  { key: "booking", name: "Booking/Appointment System", price: 4999 },
  { key: "payments", name: "Online Payments (up to 20 products)", price: 7999 },
  { key: "language", name: "Additional Language", price: 3999 },
  { key: "care-plan", name: "Monthly Care Plan", price: 799 },
  { key: "growth-plan", name: "Monthly Growth Plan", price: 2499 },
  { key: "ads-setup", name: "Meta/Google Ads Setup (one-time)", price: 4499 },
  { key: "review-mgmt-setup", name: "Review Management Setup", price: 1999 },
  { key: "content-calendar", name: "Social Content Calendar Setup", price: 2999 },
];

module.exports = { PACKAGES, ADDONS };
