export type Company = {
  id: number;
  name: string;
  domain: string;
  industry: string;
  hq_country: string;
  revenue: number;
  employees: number;
  technologies: string[];
  office_locations: string[];
};

export const companies: Company[] = [
  {
    id: 1,
    name: "Innovate Inc.",
    domain: "innovate.com",
    industry: "Technology",
    hq_country: "USA",
    revenue: 120000000,
    employees: 1500,
    technologies: ["React", "Node.js", "AWS", "PostgreSQL", "Stripe"],
    office_locations: ["San Francisco", "New York", "London"]
  },
  {
    id: 2,
    name: "HealthWell",
    domain: "healthwell.io",
    industry: "Healthcare",
    hq_country: "Canada",
    revenue: 75000000,
    employees: 800,
    technologies: ["Angular", "Python", "Google Cloud", "MySQL", "Shopify"],
    office_locations: ["Toronto", "Vancouver"]
  },
  {
    id: 3,
    name: "FinSecure",
    domain: "finsecure.co",
    industry: "Finance",
    hq_country: "UK",
    revenue: 250000000,
    employees: 3000,
    technologies: ["Java", ".NET", "Azure", "SQL Server", "Intercom"],
    office_locations: ["London", "Manchester", "Edinburgh"]
  },
  {
    id: 4,
    name: "E-Shop World",
    domain: "eshopworld.net",
    industry: "E-commerce",
    hq_country: "Ireland",
    revenue: 55000000,
    employees: 600,
    technologies: ["Shopify", "React", "GraphQL", "Stripe", "Zendesk"],
    office_locations: ["Dublin", "Berlin"]
  },
  {
    id: 5,
    name: "TravelGo",
    domain: "travelgo.com",
    industry: "Travel",
    hq_country: "Australia",
    revenue: 30000000,
    employees: 350,
    technologies: ["Vue.js", "PHP", "AWS", "MongoDB"],
    office_locations: ["Sydney", "Melbourne"]
  },
  {
    id: 6,
    name: "AdOptimize",
    domain: "adoptimize.ai",
    industry: "Advertising",
    hq_country: "USA",
    revenue: 90000000,
    employees: 1100,
    technologies: ["Python", "TensorFlow", "Google Cloud", "BigQuery", "React"],
    office_locations: ["Austin", "Chicago"]
  },
  {
    id: 7,
    name: "GreenEnergy Solutions",
    domain: "greenenergy.sol",
    industry: "Energy",
    hq_country: "Germany",
    revenue: 150000000,
    employees: 2200,
    technologies: ["Python", "Java", "Azure", "IoT", "SQL Server"],
    office_locations: ["Berlin", "Munich", "Hamburg"]
  },
  {
    id: 8,
    name: "RealEstate Finder",
    domain: "realestatefinder.com",
    industry: "Real Estate",
    hq_country: "USA",
    revenue: 42000000,
    employees: 550,
    technologies: ["React", "Firebase", "Google Maps API", "Node.js"],
    office_locations: ["Miami", "Los Angeles"]
  },
  {
    id: 9,
    name: "CyberGuard",
    domain: "cyberguard.tech",
    industry: "Cybersecurity",
    hq_country: "Israel",
    revenue: 88000000,
    employees: 900,
    technologies: ["Python", "Go", "AWS", "Kubernetes", "Elasticsearch"],
    office_locations: ["Tel Aviv"]
  },
  {
    id: 10,
    name: "Gamer's Hub",
    domain: "gamershub.io",
    industry: "Gaming",
    hq_country: "Japan",
    revenue: 300000000,
    employees: 4000,
    technologies: ["C++", "Unreal Engine", "Unity", "AWS", "Node.js", "Stripe"],
    office_locations: ["Tokyo", "Kyoto", "Seattle"]
  },
  {
    id: 11,
    name: "UK Travel Co",
    domain: "uktravel.co.uk",
    industry: "Travel",
    hq_country: "UK",
    revenue: 22000000,
    employees: 250,
    technologies: ["Wordpress", "PHP", "MySQL", "jQuery"],
    office_locations: ["London"]
  },
  {
    id: 12,
    name: "Aussie Adverts",
    domain: "aussieads.com.au",
    industry: "Advertising",
    hq_country: "Australia",
    revenue: 15000000,
    employees: 150,
    technologies: ["Google Analytics", "Facebook Ads", "Wordpress"],
    office_locations: ["Perth"]
  }
];

export const allTechnologies = [...new Set(companies.flatMap(c => c.technologies))].sort();
export const allIndustries = [...new Set(companies.map(c => c.industry))].sort();
export const allCountries = [...new Set(companies.map(c => c.hq_country))].sort();
