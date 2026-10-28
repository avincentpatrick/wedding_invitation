// All invitation content lives here. Edit this file, nothing else, to change wording.
window.WEDDING = {
  couple: {
    bride: "Jailene Faye C. Rojas",
    groom: "Vincent Patrick T. Albestros",
    brideShort: "Jelai",
    groomShort: "Vince",
    short: "Vince & Jelai",
    initials: "V & J",
    hashtag: "#conVinceJelaitoMarry"
  },
  // Local date and time of the ceremony (Asia/Manila)
  date: "2027-08-28",
  ceremonyStart: "15:00",
  timezoneOffset: "+08:00",
  arriveBy: "2:30 PM",
  ceremony: {
    time: "3:00 PM",
    name: "Minor Basilica of the National Shrine of Our Lady of Mount Carmel",
    address: "Broadway corner 5th St, Mariana, Quezon City, Metro Manila",
    map: "https://maps.app.goo.gl/4bLnHFerkGSQBLtD6"
  },
  reception: {
    time: "5:30 PM",
    name: "Le Reve Pool and Events Venue",
    address: "28 Sgt. Esguerra Ave, Diliman, Quezon City, Metro Manila",
    map: "https://maps.app.goo.gl/ahUoUx17TGbnTg9SA"
  },
  dressCode: {
    wording: "Formal or semi-formal",
    palette: [
      { name: "Sage", hex: "#9CAF88" },
      { name: "Cream", hex: "#F5F0E6" },
      { name: "Dusty rose", hex: "#D8A7B1" }
    ],
    avoid: "white and ivory, which are reserved for the bride"
  },
  rsvp: {
    deadline: "2027-01-15",
    // "demo" shows a confirmation without saving. Set to "apps-script" once the backend is deployed.
    mode: "demo",
    endpoint: "",
    askNames: true,
    allowPlusOnes: false,
    defaultSeats: 1
  },
  program: [
    { time: "2:30 PM", title: "Guests arrive", note: "Please be seated by 2:45 PM." },
    { time: "3:00 PM", title: "Ceremony", note: "Minor Basilica of Our Lady of Mount Carmel" },
    { time: "5:30 PM", title: "Reception", note: "Le Reve Pool and Events Venue" },
    { time: "6:30 PM", title: "Dinner", note: "Program to follow" },
    { time: "8:00 PM", title: "Dancing and photos", note: "" }
  ],
  story: [
    { year: "", title: "How we met", text: "Tell us how it started and this is where it will go. Two or three short paragraphs read best on a phone." },
    { year: "", title: "The proposal", text: "Where, when and how. Guests love this part." },
    { year: "2027", title: "The wedding", text: "28 August 2027, Quezon City." }
  ],
  faq: [
    { q: "Can I bring my children?", a: "We are keeping the celebration to the guests named on each invitation, including the children we have listed. Thank you for understanding." },
    { q: "Is there a gift registry?", a: "Your presence is our present. If you wish to give, a monetary gift is appreciated." },
    { q: "What should I wear?", a: "Formal or semi-formal attire in sage, cream or dusty rose. Please avoid white and ivory." },
    { q: "Can I take photos during the ceremony?", a: "We are having an unplugged ceremony. Please keep phones and cameras away until the recessional. The reception is open for photos." },
    { q: "Is there parking?", a: "Parking details will be added here." },
    { q: "Can I change my RSVP?", a: "Yes. Open your personal link again and update your answer any time before 15 January 2027." }
  ],
  // Fill from the Entourage tab. Leave empty to hide the section.
  entourage: [],
  gift: "Your presence is our present. If you wish to give, a monetary gift is appreciated.",
  site: "https://avincentpatrick.github.io/wedding_invitation/"
};
