export const CHECKOUT_STEPS = [
  {
    number: 1,
    id: "travel",
    path: "travel",
    title: "Travel Details",
    subtitle: "Plan Your Trip",
  },
  {
    number: 2,
    id: "hotel",
    path: "hotel",
    title: "Hotel & Room",
    subtitle: "Choose Your Stay",
  },
  {
    number: 3,
    id: "add-ons",
    path: "add-ons",
    title: "Add-ons",
    subtitle: "Enhance Your Trip",
  },
  {
    number: 4,
    id: "travellers",
    path: "travellers",
    title: "Travellers",
    subtitle: "Traveller Information",
  },
  {
    number: 5,
    id: "review",
    path: "review",
    title: "Review",
    subtitle: "Review Your Booking",
  },
  {
    number: 6,
    id: "payment",
    path: "payment",
    title: "Payment",
    subtitle: "Secure Checkout",
  },
  {
    number: 7,
    id: "confirmation",
    path: "confirmation",
    title: "Confirmation",
    subtitle: "Booking Confirmed",
  },
];

export const AVAILABLE_ADDONS = [
  {
    id: "addon-transfer",
    title: "Airport Transfer (Roundtrip)",
    description: "Private luxury AC vehicle transfer between airport and hotel.",
    price: 2499,
    priceUnit: "per booking",
    type: "per_booking",
  },
  {
    id: "addon-insurance",
    title: "Comprehensive Travel Insurance",
    description: "Full coverage for medical emergencies, luggage loss & flight delays.",
    price: 1299,
    priceUnit: "per person",
    type: "per_person",
  },
  {
    id: "addon-city-tour",
    title: "Private City Sightseeing Tour",
    description: "Full-day guided private tour with entry tickets and lunch included.",
    price: 3999,
    priceUnit: "per person",
    type: "per_person",
  },
  {
    id: "addon-cultural-night",
    title: "VIP Cultural Dinner & Show",
    description: "Exclusive evening dinner experience with traditional music & performances.",
    price: 1899,
    priceUnit: "per person",
    type: "per_person",
  },
];

export const ROOM_TYPES = [
  {
    id: "deluxe-sea-view",
    name: "Deluxe Sea View Room",
    description: "King bed, ocean balcony, breakfast included, free high-speed Wi-Fi.",
    badge: "Most Popular",
    priceMultiplier: 1.0,
    features: ["King Bed", "Ocean View", "Breakfast Included", "Free Wi-Fi", "Balcony"],
  },
  {
    id: "executive-suite",
    name: "Executive Luxury Suite",
    description: "Spacious living lounge, panoramic city views, club lounge access.",
    badge: "Premium Upgrade",
    priceMultiplier: 1.25,
    features: ["King Bed", "Living Room", "Club Lounge Access", "Jacuzzi", "24/7 Butler"],
  },
  {
    id: "family-suite",
    name: "Two-Bedroom Family Suite",
    description: "2 Connecting bedrooms, ideal for families, full kitchen amenities.",
    badge: "Best for Families",
    priceMultiplier: 1.4,
    features: ["2 Bedrooms", "Kitchenette", "Balcony", "Free Laundry", "Kids Amenities"],
  },
];

export const TRIP_TYPES = {
  SOLO: "solo",
  COUPLE: "couple",
  FAMILY: "family",
};

export const TRIP_TYPE_LABELS = {
  [TRIP_TYPES.SOLO]: "Solo Trip",
  [TRIP_TYPES.COUPLE]: "Couple Trip",
  [TRIP_TYPES.FAMILY]: "Family Trip",
};

export const TRIP_TYPE_OPTIONS = [
  {
    id: TRIP_TYPES.SOLO,
    title: "SOLO TRIP",
    subtitle: "1 Traveller",
    description: "1 Adult",
    adults: 1,
    children: 0,
    infants: 0,
  },
  {
    id: TRIP_TYPES.COUPLE,
    title: "COUPLE TRIP",
    subtitle: "2 Travellers",
    description: "2 Adults",
    adults: 2,
    children: 0,
    infants: 0,
  },
  {
    id: TRIP_TYPES.FAMILY,
    title: "FAMILY TRIP",
    subtitle: "Custom Group",
    description: "Choose your travellers",
    adults: 2,
    children: 0,
    infants: 0,
  },
];

