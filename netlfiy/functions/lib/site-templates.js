// A&A Creations — Site Generator: Category Content Library
// Each category defines the copy patterns, CTA language, and section labels
// that make a generated site feel built-for-that-business rather than a
// generic reskin. Add a new category by adding a new entry here — the
// build engine picks it up automatically.

const CATEGORIES = {
  "home-services": {
    label: "Home Services",
    heroCtaText: "Get a Free Quote",
    secondaryCtaText: "See Our Work",
    servicesLabel: "What We Do",
    servicesIntro: "From small repairs to full installations, here's how we can help.",
    contactHeading: "Need something fixed?",
    contactSub: "Tell us what's going on and we'll get back to you with a quote — usually within a few hours.",
    testimonialIntro: "What customers say after we've been out to help.",
    galleryLabel: "Recent Jobs",
    formFields: ["Name", "Phone", "What do you need help with?"],
    defaultServices: [
      { name: "Emergency Repairs", description: "Fast response when something breaks and can't wait." },
      { name: "Installations", description: "Clean, code-compliant installation work, done right the first time." },
      { name: "Maintenance", description: "Regular upkeep to catch small problems before they become big ones." },
    ],
    trustPoints: ["Upfront pricing, no surprises", "Licensed & experienced", "We clean up after ourselves"],
  },

  "restaurant": {
    label: "Restaurant / Café",
    heroCtaText: "View Menu",
    secondaryCtaText: "Order on WhatsApp",
    servicesLabel: "What We Serve",
    servicesIntro: "A taste of what's on the menu.",
    contactHeading: "Come say hello",
    contactSub: "Questions about the menu, a reservation, or a large order? Message us directly.",
    testimonialIntro: "What regulars have to say.",
    galleryLabel: "From Our Kitchen",
    formFields: ["Name", "Phone", "Reservation date/time or question"],
    defaultServices: [
      { name: "Signature Dishes", description: "The ones people come back for." },
      { name: "Daily Specials", description: "Something new to try, every day of the week." },
      { name: "Catering & Large Orders", description: "Feeding a group? We've got you covered." },
    ],
    trustPoints: ["Fresh, made to order", "Dine-in, takeaway & delivery", "Easy WhatsApp ordering"],
  },

  "salon": {
    label: "Salon / Spa",
    heroCtaText: "Book an Appointment",
    secondaryCtaText: "See Our Services",
    servicesLabel: "Our Services",
    servicesIntro: "Treatments designed to help you look and feel your best.",
    contactHeading: "Ready to book?",
    contactSub: "Message us with your preferred date and service and we'll confirm your slot.",
    testimonialIntro: "What clients say after their visit.",
    galleryLabel: "Our Work",
    formFields: ["Name", "Phone", "Preferred service & date"],
    defaultServices: [
      { name: "Hair Styling", description: "Cuts, color, and styling for every occasion." },
      { name: "Skin & Facial Treatments", description: "Treatments tailored to your skin's needs." },
      { name: "Spa Packages", description: "A little time set aside just for you." },
    ],
    trustPoints: ["Trained, experienced staff", "Hygienic, relaxing space", "Easy online booking"],
  },
};

function getCategory(key) {
  return CATEGORIES[key] || CATEGORIES["home-services"];
}

function listCategories() {
  return Object.entries(CATEGORIES).map(([key, val]) => ({ key, label: val.label }));
}

module.exports = { CATEGORIES, getCategory, listCategories };
