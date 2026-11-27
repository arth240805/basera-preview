import type { City } from "@/lib/dropnest";

/** Indian cities offered as suggestions while typing. */
export const INDIAN_CITIES: string[] = [
  "Agartala","Agra","Ahmedabad","Ahmednagar","Aizawl","Ajmer","Akola","Aligarh","Allahabad (Prayagraj)","Alwar","Ambala","Amravati","Amritsar","Anand","Anantapur","Asansol","Aurangabad","Bareilly","Belagavi","Bengaluru","Bhagalpur","Bharuch","Bhavnagar","Bhilai","Bhiwadi","Bhopal","Bhubaneswar","Bikaner","Bilaspur","Bokaro","Chandigarh","Chennai","Coimbatore","Cuttack","Darbhanga","Davanagere","Dehradun","Delhi","Dhanbad","Dharwad","Dibrugarh","Durgapur","Erode","Faridabad","Gandhinagar","Gangtok","Gaya","Ghaziabad","Goa (Panaji)","Gorakhpur","Greater Noida","Gulbarga (Kalaburagi)","Guntur","Gurugram","Guwahati","Gwalior","Haldwani","Hubli","Hyderabad","Imphal","Indore","Itanagar","Jabalpur","Jaipur","Jalandhar","Jalgaon","Jammu","Jamnagar","Jamshedpur","Jhansi","Jodhpur","Jorhat","Junagadh","Kakinada","Kanpur","Kannur","Karnal","Kochi","Kolhapur","Kolkata","Kollam","Kota","Kozhikode","Kurnool","Kurukshetra","Lucknow","Ludhiana","Madurai","Manipal","Mangaluru","Mathura","Meerut","Mohali","Moradabad","Mumbai","Muzaffarpur","Mysuru","Nagpur","Nanded","Nashik","Navi Mumbai","Nellore","New Delhi","Noida","Panchkula","Panipat","Patiala","Patna","Pondicherry","Pune","Raipur","Rajahmundry","Rajkot","Ranchi","Rohtak","Roorkee","Rourkela","Saharanpur","Salem","Sangli","Secunderabad","Shillong","Shimla","Siliguri","Solapur","Sonipat","Srinagar","Surat","Thane","Thiruvananthapuram","Thrissur","Tiruchirappalli","Tirunelveli","Tirupati","Udaipur","Ujjain","Vadodara","Varanasi","Vellore","Vijayawada","Visakhapatnam","Warangal",
];

const NCR = ["delhi", "new delhi", "gurugram", "gurgaon", "noida", "greater noida", "ghaziabad", "faridabad"];
const MUMBAI = ["mumbai", "navi mumbai", "thane", "bombay"];

/** Delivery zone for any typed city name; unknown cities fall back to "Other". */
export function cityZone(name: string): City {
  const n = name.trim().toLowerCase();
  if (NCR.includes(n)) return "Delhi NCR";
  if (MUMBAI.includes(n)) return "Mumbai";
  if (n === "bangalore" || n === "bengaluru") return "Bengaluru";
  if (n === "hyderabad" || n === "secunderabad") return "Hyderabad";
  if (n === "pune") return "Pune";
  if (n === "kota") return "Kota";
  return "Other";
}

/** Cities matching the typed text: names starting with it first, then names containing it. */
export function suggestCities(query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return INDIAN_CITIES.slice(0, limit);
  const starts = INDIAN_CITIES.filter((c) => c.toLowerCase().startsWith(q));
  const contains = INDIAN_CITIES.filter((c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q));
  return [...starts, ...contains].slice(0, limit);
}
