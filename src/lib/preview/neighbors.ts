// Per-metro neighbor city lists for the Service Area page.
// Drives "Cities we serve" section + LocalBusiness.areaServed schema.
//
// Curated for the top 30 US metros where most LeadHound pulls land. For any
// city not in the map, we fall back to a generic "{city} and surrounding area"
// pattern so the page still renders.

type NeighborMap = Record<
  string,
  {
    state: string;
    nearby: string[];
  }
>;

export const METRO_NEIGHBORS: NeighborMap = {
  // Texas
  Austin: {
    state: "TX",
    nearby: [
      "Round Rock",
      "Cedar Park",
      "Pflugerville",
      "Leander",
      "Lakeway",
      "Bee Cave",
      "Westlake",
      "Buda",
      "Kyle",
      "Georgetown",
      "Manor",
      "Spicewood",
    ],
  },
  Houston: {
    state: "TX",
    nearby: [
      "Sugar Land",
      "Katy",
      "The Woodlands",
      "Pearland",
      "Pasadena",
      "Spring",
      "Cypress",
      "Tomball",
      "Humble",
      "League City",
    ],
  },
  Dallas: {
    state: "TX",
    nearby: [
      "Plano",
      "Irving",
      "Frisco",
      "Garland",
      "Mesquite",
      "Carrollton",
      "Richardson",
      "Allen",
      "McKinney",
      "Lewisville",
    ],
  },
  "San Antonio": {
    state: "TX",
    nearby: [
      "New Braunfels",
      "Schertz",
      "Boerne",
      "Helotes",
      "Live Oak",
      "Universal City",
      "Cibolo",
      "Converse",
    ],
  },
  // California
  "Los Angeles": {
    state: "CA",
    nearby: [
      "Pasadena",
      "Glendale",
      "Burbank",
      "Long Beach",
      "Santa Monica",
      "Culver City",
      "West Hollywood",
      "Beverly Hills",
      "Inglewood",
      "Torrance",
    ],
  },
  "San Diego": {
    state: "CA",
    nearby: [
      "La Mesa",
      "El Cajon",
      "Chula Vista",
      "National City",
      "Coronado",
      "Carlsbad",
      "Encinitas",
      "Oceanside",
      "Poway",
    ],
  },
  "San Francisco": {
    state: "CA",
    nearby: [
      "Oakland",
      "Berkeley",
      "Daly City",
      "South San Francisco",
      "San Mateo",
      "Burlingame",
      "Pacifica",
    ],
  },
  Sacramento: {
    state: "CA",
    nearby: ["Folsom", "Roseville", "Rocklin", "Elk Grove", "Citrus Heights", "Carmichael"],
  },
  // Pacific Northwest
  Seattle: {
    state: "WA",
    nearby: ["Bellevue", "Redmond", "Kirkland", "Renton", "Tacoma", "Everett", "Bothell", "Issaquah"],
  },
  Portland: {
    state: "OR",
    nearby: ["Beaverton", "Hillsboro", "Lake Oswego", "Tigard", "Gresham", "Vancouver"],
  },
  // Mountain
  Denver: {
    state: "CO",
    nearby: [
      "Aurora",
      "Lakewood",
      "Centennial",
      "Highlands Ranch",
      "Westminster",
      "Englewood",
      "Arvada",
      "Thornton",
    ],
  },
  Phoenix: {
    state: "AZ",
    nearby: ["Scottsdale", "Tempe", "Mesa", "Chandler", "Gilbert", "Glendale", "Peoria", "Surprise"],
  },
  "Salt Lake City": {
    state: "UT",
    nearby: ["West Valley City", "Sandy", "Murray", "Draper", "Holladay", "South Jordan"],
  },
  // South
  Atlanta: {
    state: "GA",
    nearby: ["Marietta", "Sandy Springs", "Roswell", "Alpharetta", "Decatur", "Smyrna", "Dunwoody"],
  },
  Nashville: {
    state: "TN",
    nearby: ["Brentwood", "Franklin", "Hendersonville", "Mount Juliet", "Smyrna", "Murfreesboro"],
  },
  Charlotte: {
    state: "NC",
    nearby: ["Concord", "Huntersville", "Matthews", "Mint Hill", "Pineville", "Cornelius"],
  },
  Raleigh: {
    state: "NC",
    nearby: ["Cary", "Apex", "Durham", "Wake Forest", "Holly Springs", "Garner"],
  },
  Asheville: {
    state: "NC",
    nearby: ["Hendersonville", "Black Mountain", "Weaverville", "Arden", "Fairview"],
  },
  Charleston: {
    state: "SC",
    nearby: ["Mount Pleasant", "North Charleston", "Summerville", "Goose Creek", "James Island"],
  },
  Savannah: {
    state: "GA",
    nearby: ["Pooler", "Rincon", "Tybee Island", "Richmond Hill", "Garden City"],
  },
  Athens: {
    state: "GA",
    nearby: ["Watkinsville", "Bogart", "Bishop", "Winterville", "Statham"],
  },
  // Midwest
  Chicago: {
    state: "IL",
    nearby: [
      "Evanston",
      "Oak Park",
      "Schaumburg",
      "Naperville",
      "Aurora",
      "Skokie",
      "Cicero",
      "Lombard",
    ],
  },
  Minneapolis: {
    state: "MN",
    nearby: ["Saint Paul", "Bloomington", "Edina", "Minnetonka", "Eagan", "Plymouth", "Maple Grove"],
  },
  // Florida
  Miami: {
    state: "FL",
    nearby: ["Coral Gables", "Hialeah", "Doral", "Miami Beach", "Aventura", "North Miami"],
  },
  Tampa: {
    state: "FL",
    nearby: ["St. Petersburg", "Clearwater", "Brandon", "Riverview", "Wesley Chapel", "Largo"],
  },
  Orlando: {
    state: "FL",
    nearby: ["Winter Park", "Kissimmee", "Apopka", "Altamonte Springs", "Sanford", "Lake Mary"],
  },
  Jacksonville: {
    state: "FL",
    nearby: ["St. Augustine", "Orange Park", "Atlantic Beach", "Fernandina Beach", "Ponte Vedra"],
  },
  // Northeast
  Boston: {
    state: "MA",
    nearby: ["Cambridge", "Quincy", "Newton", "Brookline", "Somerville", "Medford", "Waltham"],
  },
  "New York": {
    state: "NY",
    nearby: ["Brooklyn", "Queens", "The Bronx", "Staten Island", "Yonkers", "Hoboken", "Jersey City"],
  },
  Philadelphia: {
    state: "PA",
    nearby: ["Camden", "Cherry Hill", "King of Prussia", "Bensalem", "Norristown", "Upper Darby"],
  },
};

export function getNeighbors(
  city: string | null
): { state: string; nearby: string[] } | null {
  if (!city) return null;
  const exact = METRO_NEIGHBORS[city];
  if (exact) return exact;
  // Try case-insensitive lookup.
  const found = Object.entries(METRO_NEIGHBORS).find(
    ([k]) => k.toLowerCase() === city.toLowerCase()
  );
  return found ? found[1] : null;
}
