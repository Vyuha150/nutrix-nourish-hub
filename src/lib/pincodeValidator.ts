/**
 * Indian Postal PIN Code & Delivery Address Validation (Frontend)
 */

export interface PostOfficeInfo {
  name: string;
  branchType?: string;
  deliveryStatus?: string;
  district: string;
  state: string;
}

export interface PincodeLookupResult {
  valid: boolean;
  pincode: string;
  state: string;
  district: string;
  postOffices: string[];
  allDistricts?: string[];
  error?: string;
}

export interface AddressValidationResult {
  valid: boolean;
  mismatch: boolean;
  pincode: string;
  expectedState: string;
  expectedDistrict: string;
  postOffices: string[];
  enteredState: string;
  enteredDistrict: string;
  enteredLocality?: string;
  errorMessage?: string;
  mismatchReason?: string;
  suggestedDistricts?: string[];
}

const PIN_PREFIX_DATA: Record<string, { state: string; districts: string[]; primaryDistrict: string; postOffices: string[] }> = {
  "11": { state: "Delhi", districts: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi", "Shahdara"], primaryDistrict: "New Delhi", postOffices: ["Connaught Place", "G.P.O.", "Chanakyapuri", "Karol Bagh", "Lajpat Nagar", "Rohini", "Dwarka", "Saket", "Vasant Kunj"] },
  "12": { state: "Haryana", districts: ["Gurugram", "Faridabad", "Rohtak", "Sonipat", "Panipat", "Karnal", "Hisar", "Ambala", "Panchkula", "Rewari", "Jhajjar"], primaryDistrict: "Gurugram", postOffices: ["Gurugram H.O", "DLF Cyber City", "Faridabad NIT", "Sector 14"] },
  "13": { state: "Haryana", districts: ["Ambala", "Panchkula", "Yamunanagar", "Kurukshetra", "Kaithal"], primaryDistrict: "Ambala", postOffices: ["Ambala Cantt", "Panchkula H.O", "Kurukshetra"] },
  "14": { state: "Punjab", districts: ["Ludhiana", "Jalandhar", "Hoshiarpur", "Nawanshahr", "Rupnagar", "SAS Nagar", "Mohali"], primaryDistrict: "Ludhiana", postOffices: ["Ludhiana H.O", "Jalandhar City", "Mohali Phase 7"] },
  "15": { state: "Punjab", districts: ["Bathinda", "Firozpur", "Faridkot", "Fazilka", "Muktsar", "Mansa"], primaryDistrict: "Bathinda", postOffices: ["Bathinda H.O", "Firozpur Cantt"] },
  "16": { state: "Chandigarh", districts: ["Chandigarh", "Mohali", "Panchkula"], primaryDistrict: "Chandigarh", postOffices: ["Chandigarh G.P.O", "Sector 17", "Sector 35"] },
  "17": { state: "Himachal Pradesh", districts: ["Shimla", "Solan", "Kangra", "Mandi", "Kullu", "Hamirpur", "Bilaspur", "Una"], primaryDistrict: "Shimla", postOffices: ["Shimla G.P.O", "Solan H.O", "Dharamshala"] },
  "18": { state: "Jammu and Kashmir", districts: ["Jammu", "Udhampur", "Kathua", "Rajouri", "Poonch", "Samba", "Reasi"], primaryDistrict: "Jammu", postOffices: ["Jammu H.O", "Gandhi Nagar", "Udhampur"] },
  "19": { state: "Jammu and Kashmir", districts: ["Srinagar", "Baramulla", "Anantnag", "Pulwama", "Budgam", "Kupwara"], primaryDistrict: "Srinagar", postOffices: ["Srinagar G.P.O", "Baramulla", "Anantnag"] },
  "20": { state: "Uttar Pradesh", districts: ["Gautam Buddha Nagar", "Ghaziabad", "Aligarh", "Bulandshahr", "Mathura", "Hathras", "Etah"], primaryDistrict: "Gautam Buddha Nagar", postOffices: ["Noida Sector 62", "Greater Noida", "Ghaziabad H.O", "Aligarh City"] },
  "21": { state: "Uttar Pradesh", districts: ["Prayagraj", "Allahabad", "Fatehpur", "Pratapgarh", "Kaushambi"], primaryDistrict: "Prayagraj", postOffices: ["Prayagraj H.O", "Civil Lines"] },
  "22": { state: "Uttar Pradesh", districts: ["Lucknow", "Varanasi", "Faizabad", "Ayodhya", "Barabanki", "Rae Bareli", "Sultanpur"], primaryDistrict: "Lucknow", postOffices: ["Lucknow G.P.O", "Hazratganj", "Varanasi Cantt", "Ayodhya H.O"] },
  "23": { state: "Uttar Pradesh", districts: ["Mirzapur", "Sonbhadra", "Chandauli", "Ghazipur"], primaryDistrict: "Mirzapur", postOffices: ["Mirzapur H.O"] },
  "24": { state: "Uttarakhand", districts: ["Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Pauri Garhwal", "Tehri"], primaryDistrict: "Dehradun", postOffices: ["Dehradun G.P.O", "Haridwar H.O", "Rishikesh", "Nainital"] },
  "25": { state: "Uttar Pradesh", districts: ["Meerut", "Muzaffarnagar", "Saharanpur", "Baghpat", "Shamli"], primaryDistrict: "Meerut", postOffices: ["Meerut City", "Saharanpur H.O"] },
  "26": { state: "Uttar Pradesh", districts: ["Bareilly", "Pilibhit", "Shahjahanpur", "Budaun"], primaryDistrict: "Bareilly", postOffices: ["Bareilly H.O", "Civil Lines"] },
  "27": { state: "Uttar Pradesh", districts: ["Gorakhpur", "Basti", "Deoria", "Azamgarh", "Mau", "Ballia", "Kushinagar"], primaryDistrict: "Gorakhpur", postOffices: ["Gorakhpur H.O", "Azamgarh"] },
  "28": { state: "Uttar Pradesh", districts: ["Agra", "Jhansi", "Firozabad", "Mainpuri", "Lalitpur", "Jalaun"], primaryDistrict: "Agra", postOffices: ["Agra Fort", "Tajganj", "Jhansi H.O"] },
  "30": { state: "Rajasthan", districts: ["Jaipur", "Alwar", "Sikar", "Jhunjhunu", "Dausa"], primaryDistrict: "Jaipur", postOffices: ["Jaipur G.P.O", "Malviya Nagar", "Mansarovar", "Alwar H.O"] },
  "31": { state: "Rajasthan", districts: ["Udaipur", "Kota", "Bhilwara", "Chittorgarh", "Bundi"], primaryDistrict: "Udaipur", postOffices: ["Udaipur H.O", "Kota City"] },
  "32": { state: "Rajasthan", districts: ["Bharatpur", "Dholpur", "Karauli", "Sawai Madhopur"], primaryDistrict: "Bharatpur", postOffices: ["Bharatpur H.O"] },
  "33": { state: "Rajasthan", districts: ["Bikaner", "Sri Ganganagar", "Churu", "Hanumangarh"], primaryDistrict: "Bikaner", postOffices: ["Bikaner H.O"] },
  "34": { state: "Rajasthan", districts: ["Jodhpur", "Pali", "Barmer", "Jaisalmer", "Nagaur", "Jalore"], primaryDistrict: "Jodhpur", postOffices: ["Jodhpur H.O", "Ratanada", "Jaisalmer"] },
  "36": { state: "Gujarat", districts: ["Rajkot", "Jamnagar", "Bhavnagar", "Junagadh", "Porbandar", "Amreli", "Surendranagar"], primaryDistrict: "Rajkot", postOffices: ["Rajkot H.O", "Jamnagar", "Bhavnagar"] },
  "37": { state: "Gujarat", districts: ["Kutch", "Bhuj", "Gandhidham"], primaryDistrict: "Kutch", postOffices: ["Bhuj H.O", "Gandhidham"] },
  "38": { state: "Gujarat", districts: ["Ahmedabad", "Gandhinagar", "Mehsana", "Sabarkantha", "Patan", "Banaskantha"], primaryDistrict: "Ahmedabad", postOffices: ["Ahmedabad G.P.O", "Navrangpura", "Satellite", "Gandhinagar Sector 11"] },
  "39": { state: "Gujarat", districts: ["Surat", "Vadodara", "Bharuch", "Valsad", "Navsari", "Anand", "Kheda"], primaryDistrict: "Surat", postOffices: ["Surat H.O", "Vadodara H.O", "Alkapuri", "Anand"] },
  "40": { state: "Maharashtra", districts: ["Mumbai", "Mumbai Suburban", "Thane", "Raigad", "Palghar", "Goa", "North Goa", "South Goa"], primaryDistrict: "Mumbai", postOffices: ["Mumbai G.P.O", "Nariman Point", "Bandra West", "Andheri East", "Borivali West", "Thane H.O", "Panaji H.O"] },
  "41": { state: "Maharashtra", districts: ["Pune", "Satara", "Solapur", "Kolhapur", "Sangli", "Ahmednagar"], primaryDistrict: "Pune", postOffices: ["Pune H.O", "Shivajinagar", "Kothrud", "Hadapsar", "Viman Nagar", "Kolhapur"] },
  "42": { state: "Maharashtra", districts: ["Nashik", "Dhule", "Jalgaon", "Nandurbar"], primaryDistrict: "Nashik", postOffices: ["Nashik H.O", "Jalgaon"] },
  "43": { state: "Maharashtra", districts: ["Chhatrapati Sambhajinagar", "Aurangabad", "Jalna", "Nanded", "Latur", "Parbhani", "Beed"], primaryDistrict: "Chhatrapati Sambhajinagar", postOffices: ["Aurangabad H.O", "Nanded"] },
  "44": { state: "Maharashtra", districts: ["Nagpur", "Amravati", "Wardha", "Akola", "Chandrapur", "Yavatmal", "Bhandara"], primaryDistrict: "Nagpur", postOffices: ["Nagpur G.P.O", "Dharampeth", "Amravati"] },
  "45": { state: "Madhya Pradesh", districts: ["Indore", "Ujjain", "Dewas", "Dhar", "Khargone", "Ratlam"], primaryDistrict: "Indore", postOffices: ["Indore G.P.O", "Vijay Nagar", "Ujjain H.O"] },
  "46": { state: "Madhya Pradesh", districts: ["Bhopal", "Sehore", "Vidisha", "Raisen", "Hoshangabad"], primaryDistrict: "Bhopal", postOffices: ["Bhopal G.P.O", "MP Nagar", "Arera Colony"] },
  "47": { state: "Madhya Pradesh", districts: ["Gwalior", "Morena", "Bhind", "Shivpuri", "Guna"], primaryDistrict: "Gwalior", postOffices: ["Gwalior H.O", "Lashkar"] },
  "48": { state: "Madhya Pradesh", districts: ["Jabalpur", "Satna", "Rewa", "Katni", "Sagar", "Chhindwara"], primaryDistrict: "Jabalpur", postOffices: ["Jabalpur H.O", "Civil Lines"] },
  "49": { state: "Chhattisgarh", districts: ["Raipur", "Durg", "Bilaspur", "Bhilai", "Rajnandgaon", "Korba", "Raigarh"], primaryDistrict: "Raipur", postOffices: ["Raipur H.O", "Durg", "Bhilai Sector 1"] },
  "50": { state: "Telangana", districts: ["Hyderabad", "Ranga Reddy", "Medchal Malkajgiri", "Secunderabad", "Warangal", "Nalgonda", "Karimnagar", "Nizamabad", "Khammam"], primaryDistrict: "Hyderabad", postOffices: ["Hyderabad G.P.O", "Banjara Hills", "Jubilee Hills", "Secunderabad H.O", "Hitec City", "Gachibowli", "Kukatpally"] },
  "51": { state: "Andhra Pradesh", districts: ["Chittoor", "Tirupati", "Kadapa", "Anantapur", "Kurnool", "Nellore"], primaryDistrict: "Tirupati", postOffices: ["Tirupati H.O", "Kurnool H.O", "Anantapur"] },
  "52": { state: "Andhra Pradesh", districts: ["Vijayawada", "Guntur", "Krishna", "Prakasam"], primaryDistrict: "Krishna", postOffices: ["Vijayawada H.O", "Guntur H.O", "Governorpet"] },
  "53": { state: "Andhra Pradesh", districts: ["Visakhapatnam", "East Godavari", "West Godavari", "Kakinada", "Rajahmundry", "Vizianagaram"], primaryDistrict: "Visakhapatnam", postOffices: ["Visakhapatnam H.O", "Rajahmundry H.O", "Kakinada"] },
  "56": { state: "Karnataka", districts: ["Bengaluru Urban", "Bengaluru", "Bangalore", "Bengaluru Rural", "Kolar", "Tumakuru", "Ramanagara", "Chikkaballapur"], primaryDistrict: "Bengaluru Urban", postOffices: ["Bengaluru G.P.O", "Indiranagar", "Koramangala", "Jayanagar", "Whitefield", "HSR Layout", "Malleshwaram", "Electronic City", "Rajajinagar", "Yelahanka", "Marathahalli", "BTM Layout", "JP Nagar"] },
  "57": { state: "Karnataka", districts: ["Dakshina Kannada", "Mangaluru", "Udupi", "Shivamogga", "Chikkamagaluru", "Hassan", "Mysuru", "Kodagu", "Mandya"], primaryDistrict: "Mysuru", postOffices: ["Mysuru H.O", "Mangaluru H.O", "Udupi", "Hassan"] },
  "58": { state: "Karnataka", districts: ["Dharwad", "Hubballi", "Belagavi", "Vijayapura", "Bagalkote", "Gadag", "Uttara Kannada", "Haveri"], primaryDistrict: "Dharwad", postOffices: ["Hubballi H.O", "Belagavi H.O", "Dharwad"] },
  "59": { state: "Karnataka", districts: ["Kalaburagi", "Ballari", "Raichur", "Koppal", "Bidar", "Yadgir"], primaryDistrict: "Kalaburagi", postOffices: ["Kalaburagi H.O", "Ballari H.O"] },
  "60": { state: "Tamil Nadu", districts: ["Chennai", "Kanchipuram", "Tiruvallur", "Chengalpattu", "Vellore"], primaryDistrict: "Chennai", postOffices: ["Chennai G.P.O", "T. Nagar", "Anna Nagar", "Adyar", "Mylapore", "Velachery", "Tambaram"] },
  "61": { state: "Tamil Nadu", districts: ["Thanjavur", "Tiruchirappalli", "Nagapattinam", "Tiruvarur", "Pudukkottai"], primaryDistrict: "Tiruchirappalli", postOffices: ["Tiruchirappalli H.O", "Thanjavur"] },
  "62": { state: "Tamil Nadu", districts: ["Madurai", "Dindigul", "Theni", "Virudhunagar", "Sivaganga", "Ramanathapuram"], primaryDistrict: "Madurai", postOffices: ["Madurai H.O", "Tallakulam"] },
  "63": { state: "Tamil Nadu", districts: ["Salem", "Dharmapuri", "Krishnagiri", "Namakkal", "Erode", "Tirupattur"], primaryDistrict: "Salem", postOffices: ["Salem H.O", "Hosur H.O", "Erode"] },
  "64": { state: "Tamil Nadu", districts: ["Coimbatore", "Tiruppur", "Nilgiris", "Udhagamandalam"], primaryDistrict: "Coimbatore", postOffices: ["Coimbatore H.O", "RS Puram", "Tiruppur H.O", "Ooty"] },
  "67": { state: "Kerala", districts: ["Kozhikode", "Kannur", "Kasaragod", "Malappuram", "Wayanad"], primaryDistrict: "Kozhikode", postOffices: ["Kozhikode H.O", "Kannur H.O", "Calicut"] },
  "68": { state: "Kerala", districts: ["Ernakulam", "Kochi", "Thrissur", "Palakkad", "Idukki", "Lakshadweep"], primaryDistrict: "Ernakulam", postOffices: ["Kochi H.O", "Ernakulam H.O", "Thrissur", "Palakkad"] },
  "69": { state: "Kerala", districts: ["Thiruvananthapuram", "Kollam", "Alappuzha", "Pathanamthitta", "Kottayam"], primaryDistrict: "Thiruvananthapuram", postOffices: ["Thiruvananthapuram G.P.O", "Kollam H.O", "Kottayam", "Alappuzha"] },
  "70": { state: "West Bengal", districts: ["Kolkata", "South 24 Parganas", "North 24 Parganas", "Howrah", "Hooghly"], primaryDistrict: "Kolkata", postOffices: ["Kolkata G.P.O", "Park Street", "Salt Lake", "Howrah H.O", "Alipore", "Ballygunge"] },
  "71": { state: "West Bengal", districts: ["Burdwan", "Purba Bardhaman", "Paschim Bardhaman", "Asansol", "Durgapur", "Birbhum", "Bankura", "Purulia"], primaryDistrict: "Paschim Bardhaman", postOffices: ["Asansol H.O", "Durgapur"] },
  "72": { state: "West Bengal", districts: ["Midnapore", "Paschim Medinipur", "Purba Medinipur", "Kharagpur", "Haldia"], primaryDistrict: "Paschim Medinipur", postOffices: ["Midnapore H.O", "Kharagpur"] },
  "73": { state: "West Bengal", districts: ["Darjeeling", "Jalpaiguri", "Siliguri", "Cooch Behar", "Alipurduar", "Kalimpong", "Sikkim"], primaryDistrict: "Darjeeling", postOffices: ["Siliguri H.O", "Darjeeling", "Gangtok"] },
  "75": { state: "Odisha", districts: ["Khurda", "Bhubaneswar", "Puri", "Cuttack", "Ganjam", "Nayagarh"], primaryDistrict: "Khurda", postOffices: ["Bhubaneswar H.O", "Puri H.O", "Cuttack G.P.O"] },
  "76": { state: "Odisha", districts: ["Berhampur", "Koraput", "Rayagada", "Kalahandi"], primaryDistrict: "Ganjam", postOffices: ["Berhampur H.O"] },
  "77": { state: "Odisha", districts: ["Sambalpur", "Rourkela", "Sundargarh", "Jharsuguda", "Balangir", "Bargarh"], primaryDistrict: "Sundargarh", postOffices: ["Rourkela H.O", "Sambalpur"] },
  "78": { state: "Assam", districts: ["Kamrup Metropolitan", "Guwahati", "Kamrup", "Nagaon", "Sonitpur", "Dibrugarh", "Jorhat", "Silchar", "Cachar"], primaryDistrict: "Kamrup Metropolitan", postOffices: ["Guwahati G.P.O", "Dispur", "Dibrugarh", "Silchar"] },
  "79": { state: "Meghalaya", districts: ["East Khasi Hills", "Shillong", "Aizawl", "Imphal", "Kohima", "Agartala", "Itanagar"], primaryDistrict: "East Khasi Hills", postOffices: ["Shillong G.P.O", "Agartala", "Aizawl", "Kohima", "Imphal"] },
  "80": { state: "Bihar", districts: ["Patna", "Nalanda", "Bhojpur", "Buxar", "Rohtas", "Kaimur"], primaryDistrict: "Patna", postOffices: ["Patna G.P.O", "Kankarbagh", "Danapur", "Bihar Sharif"] },
  "81": { state: "Bihar", districts: ["Bhagalpur", "Banka", "Munger", "Jamui", "Lakhisarai", "Deoghar", "Dumka"], primaryDistrict: "Bhagalpur", postOffices: ["Bhagalpur H.O", "Deoghar"] },
  "82": { state: "Bihar", districts: ["Gaya", "Jehanabad", "Aurangabad", "Nawada", "Arwal"], primaryDistrict: "Gaya", postOffices: ["Gaya H.O"] },
  "83": { state: "Jharkhand", districts: ["Ranchi", "East Singhbhum", "Jamshedpur", "Hazaribagh", "Ramgarh", "Palamu"], primaryDistrict: "Ranchi", postOffices: ["Ranchi G.P.O", "Jamshedpur H.O", "Bistupur"] },
  "84": { state: "Bihar", districts: ["Muzaffarpur", "Vaishali", "Saran", "Siwan", "Gopalganj", "Darbhanga", "Samastipur"], primaryDistrict: "Muzaffarpur", postOffices: ["Muzaffarpur H.O", "Darbhanga"] },
  "85": { state: "Bihar", districts: ["Purnia", "Katihar", "Saharsa", "Madhepura", "Kishanganj", "Araria", "Supaul"], primaryDistrict: "Purnia", postOffices: ["Purnia H.O", "Katihar"] },
};

const STATE_ALIASES: Record<string, string> = {
  "delhi": "delhi",
  "new delhi": "delhi",
  "nct of delhi": "delhi",
  "national capital territory of delhi": "delhi",
  "karnataka": "karnataka",
  "bangalore": "karnataka",
  "maharashtra": "maharashtra",
  "bombay": "maharashtra",
  "tamil nadu": "tamil nadu",
  "madras": "tamil nadu",
  "telangana": "telangana",
  "andhra pradesh": "andhra pradesh",
  "uttar pradesh": "uttar pradesh",
  "up": "uttar pradesh",
  "uttarakhand": "uttarakhand",
  "uttaranchal": "uttarakhand",
  "west bengal": "west bengal",
  "bengal": "west bengal",
  "wb": "west bengal",
  "odisha": "odisha",
  "orissa": "odisha",
  "gujarat": "gujarat",
  "rajasthan": "rajasthan",
  "madhya pradesh": "madhya pradesh",
  "mp": "madhya pradesh",
  "kerala": "kerala",
  "punjab": "punjab",
  "haryana": "haryana",
  "bihar": "bihar",
  "jharkhand": "jharkhand",
  "chhattisgarh": "chhattisgarh",
  "assam": "assam",
  "jammu and kashmir": "jammu and kashmir",
  "jammu & kashmir": "jammu and kashmir",
  "j&k": "jammu and kashmir",
  "chandigarh": "chandigarh",
  "goa": "goa",
  "puducherry": "puducherry",
  "pondicherry": "puducherry",
};

export const normalizeString = (str: string): string => {
  return (str || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const normalizeState = (state: string): string => {
  const norm = normalizeString(state);
  return STATE_ALIASES[norm] || norm;
};

export const isDistrictMatch = (enteredDistrict: string, targetDistricts: string[]): boolean => {
  const normEntered = normalizeString(enteredDistrict);
  if (!normEntered) return false;

  for (const d of targetDistricts) {
    const normTarget = normalizeString(d);
    if (
      normEntered === normTarget ||
      normTarget.includes(normEntered) ||
      normEntered.includes(normTarget)
    ) {
      return true;
    }

    if (
      (normEntered.includes("bangalore") || normEntered.includes("bengaluru")) &&
      (normTarget.includes("bangalore") || normTarget.includes("bengaluru"))
    ) return true;

    if (
      (normEntered.includes("mumbai") || normEntered.includes("bombay")) &&
      (normTarget.includes("mumbai") || normTarget.includes("bombay"))
    ) return true;

    if (
      (normEntered.includes("chennai") || normEntered.includes("madras")) &&
      (normTarget.includes("chennai") || normTarget.includes("madras"))
    ) return true;

    if (
      (normEntered.includes("kolkata") || normEntered.includes("calcutta")) &&
      (normTarget.includes("kolkata") || normTarget.includes("calcutta"))
    ) return true;

    if (
      (normEntered.includes("gurgaon") || normEntered.includes("gurugram")) &&
      (normTarget.includes("gurgaon") || normTarget.includes("gurugram"))
    ) return true;

    if (
      (normEntered.includes("noida") || normEntered.includes("gautam buddha nagar")) &&
      (normTarget.includes("noida") || normTarget.includes("gautam buddha nagar"))
    ) return true;

    if (
      (normEntered.includes("prayagraj") || normEntered.includes("allahabad")) &&
      (normTarget.includes("prayagraj") || normTarget.includes("allahabad"))
    ) return true;

    if (
      (normEntered.includes("mysore") || normEntered.includes("mysuru")) &&
      (normTarget.includes("mysore") || normTarget.includes("mysuru"))
    ) return true;

    if (
      (normEntered.includes("mangalore") || normEntered.includes("mangaluru")) &&
      (normTarget.includes("mangalore") || normTarget.includes("mangaluru"))
    ) return true;

    if (
      (normEntered.includes("pune") || normEntered.includes("poona")) &&
      (normTarget.includes("pune") || normTarget.includes("poona"))
    ) return true;

    if (
      (normEntered.includes("hyderabad") || normEntered.includes("secunderabad") || normEntered.includes("ranga reddy")) &&
      (normTarget.includes("hyderabad") || normTarget.includes("secunderabad") || normTarget.includes("ranga reddy"))
    ) return true;
  }

  return false;
};

export async function lookupPincode(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = String(pincode || "").trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      valid: false,
      pincode: cleanPin,
      state: "",
      district: "",
      postOffices: [],
      error: "PIN code must be a 6-digit number starting with 1-9.",
    };
  }

  // 1. Try online India Post directory with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as any[];
      if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const offices = data[0].PostOffice as any[];
        const firstOffice = offices[0] || {};
        const state = String(firstOffice.State || firstOffice.state || "");
        const district = String(firstOffice.District || firstOffice.district || "");
        const allDistricts = Array.from(new Set(offices.map((o) => String(o.District || o.district || "")).filter(Boolean)));
        const postOfficeNames = offices.map((o) => String(o.Name || o.name || "")).filter(Boolean);

        return {
          valid: true,
          pincode: cleanPin,
          state,
          district,
          allDistricts,
          postOffices: postOfficeNames,
        };
      }
    }
  } catch (_err) {
    // Timeout or network error, fallback to prefix data
  }

  // 2. Authoritative prefix fallback
  const prefix2 = cleanPin.slice(0, 2);
  const matchedPrefix = PIN_PREFIX_DATA[prefix2];

  if (matchedPrefix) {
    return {
      valid: true,
      pincode: cleanPin,
      state: matchedPrefix.state,
      district: matchedPrefix.primaryDistrict,
      allDistricts: matchedPrefix.districts,
      postOffices: matchedPrefix.postOffices,
    };
  }

  return {
    valid: false,
    pincode: cleanPin,
    state: "",
    district: "",
    postOffices: [],
    error: "Invalid PIN code. No postal records found for this PIN code in India.",
  };
}

export async function validateIndianAddress(
  pincode: string,
  state: string,
  district: string,
  locality?: string
): Promise<AddressValidationResult> {
  const lookup = await lookupPincode(pincode);

  if (!lookup.valid) {
    return {
      valid: false,
      mismatch: false,
      pincode,
      expectedState: "",
      expectedDistrict: "",
      postOffices: [],
      enteredState: state,
      enteredDistrict: district,
      enteredLocality: locality,
      errorMessage: lookup.error || "Invalid Indian postal PIN code.",
    };
  }

  const normEnteredState = normalizeState(state);
  const normExpectedState = normalizeState(lookup.state);

  const stateMatches =
    !normEnteredState ||
    normEnteredState === normExpectedState ||
    normExpectedState.includes(normEnteredState) ||
    normEnteredState.includes(normExpectedState);

  const candidateDistricts = lookup.allDistricts || [lookup.district];
  const districtMatches = !district || isDistrictMatch(district, candidateDistricts);

  if (!stateMatches) {
    return {
      valid: true,
      mismatch: true,
      pincode,
      expectedState: lookup.state,
      expectedDistrict: lookup.district,
      postOffices: lookup.postOffices,
      enteredState: state,
      enteredDistrict: district,
      enteredLocality: locality,
      mismatchReason: `PIN code ${pincode} belongs to ${lookup.state}, but you entered "${state}".`,
      suggestedDistricts: candidateDistricts,
    };
  }

  if (!districtMatches && district.trim().length > 0) {
    return {
      valid: true,
      mismatch: true,
      pincode,
      expectedState: lookup.state,
      expectedDistrict: lookup.district,
      postOffices: lookup.postOffices,
      enteredState: state,
      enteredDistrict: district,
      enteredLocality: locality,
      mismatchReason: `PIN code ${pincode} belongs to district "${lookup.district}" in ${lookup.state}, but you entered district "${district}".`,
      suggestedDistricts: candidateDistricts,
    };
  }

  return {
    valid: true,
    mismatch: false,
    pincode,
    expectedState: lookup.state,
    expectedDistrict: lookup.district,
    postOffices: lookup.postOffices,
    enteredState: state,
    enteredDistrict: district,
    enteredLocality: locality,
    suggestedDistricts: candidateDistricts,
  };
}
