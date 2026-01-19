export interface GridItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  year: string;
  description: string;
  href?: string;
}

// Portfolio items using local imagery
export const portfolioItems: GridItem[] = [
  {
    id: "project-1",
    src: "/imagery/1.PNG",
    alt: "Project 1",
    title: "Project One",
    category: "Photography",
    year: "2024",
    description: "Visual exploration and creative direction."
  },
  {
    id: "project-2",
    src: "/imagery/2.PNG",
    alt: "Project 2",
    title: "Project Two",
    category: "Art Direction",
    year: "2024",
    description: "Brand identity and visual systems."
  },
  {
    id: "project-3",
    src: "/imagery/DSCF0425.JPG",
    alt: "Project 3",
    title: "Project Three",
    category: "Photography",
    year: "2024",
    description: "Documentary and editorial work."
  },
  {
    id: "project-4",
    src: "/imagery/DSCF0503.JPG",
    alt: "Project 4",
    title: "Project Four",
    category: "Photography",
    year: "2024",
    description: "Capturing moments and stories."
  },
  {
    id: "project-5",
    src: "/imagery/DSCF0516.JPG",
    alt: "Project 5",
    title: "Project Five",
    category: "Photography",
    year: "2023",
    description: "Light and composition study."
  },
  {
    id: "project-6",
    src: "/imagery/DSCF0586.PNG",
    alt: "Project 6",
    title: "Project Six",
    category: "Digital Art",
    year: "2023",
    description: "Digital manipulation and effects."
  },
  {
    id: "project-7",
    src: "/imagery/DSCF1070.JPG",
    alt: "Project 7",
    title: "Project Seven",
    category: "Photography",
    year: "2023",
    description: "Portrait and lifestyle photography."
  },
  {
    id: "project-8",
    src: "/imagery/DSCF1086.JPG",
    alt: "Project 8",
    title: "Project Eight",
    category: "Photography",
    year: "2023",
    description: "Editorial and commercial work."
  },
  {
    id: "project-9",
    src: "/imagery/DSCF1221.JPG",
    alt: "Project 9",
    title: "Project Nine",
    category: "Photography",
    year: "2023",
    description: "Environmental portraits."
  },
  {
    id: "project-10",
    src: "/imagery/DSCF1229.JPG",
    alt: "Project 10",
    title: "Project Ten",
    category: "Photography",
    year: "2022",
    description: "Street and urban photography."
  },
  {
    id: "project-11",
    src: "/imagery/DSCF1967.JPG",
    alt: "Project 11",
    title: "Project Eleven",
    category: "Photography",
    year: "2022",
    description: "Travel and exploration."
  },
  {
    id: "project-12",
    src: "/imagery/DSCF2277.JPG",
    alt: "Project 12",
    title: "Project Twelve",
    category: "Photography",
    year: "2022",
    description: "Nature and landscape work."
  },
  {
    id: "project-13",
    src: "/imagery/DSCF9517.jpg",
    alt: "Project 13",
    title: "Project Thirteen",
    category: "Photography",
    year: "2022",
    description: "Intimate moments captured."
  },
  {
    id: "project-14",
    src: "/imagery/DSCF9941 2.JPG",
    alt: "Project 14",
    title: "Project Fourteen",
    category: "Photography",
    year: "2022",
    description: "Personal projects and studies."
  },
  {
    id: "project-15",
    src: "/imagery/IMG_3275.PNG",
    alt: "Project 15",
    title: "Project Fifteen",
    category: "Digital",
    year: "2021",
    description: "Mixed media explorations."
  },
  {
    id: "project-16",
    src: "/imagery/IMG_3487.JPG",
    alt: "Project 16",
    title: "Project Sixteen",
    category: "Photography",
    year: "2021",
    description: "Color and mood studies."
  },
  {
    id: "project-17",
    src: "/imagery/IMG_6883.JPG",
    alt: "Project 17",
    title: "Project Seventeen",
    category: "Photography",
    year: "2021",
    description: "Creative direction work."
  },
  {
    id: "project-18",
    src: "/imagery/IMG_6942.PNG",
    alt: "Project 18",
    title: "Project Eighteen",
    category: "Digital",
    year: "2021",
    description: "Visual experiments."
  },
  {
    id: "project-19",
    src: "/imagery/IMG_8503.jpg",
    alt: "Project 19",
    title: "Project Nineteen",
    category: "Photography",
    year: "2020",
    description: "Documentary series."
  },
  {
    id: "project-20",
    src: "/imagery/IMG_8794.JPG",
    alt: "Project 20",
    title: "Project Twenty",
    category: "Photography",
    year: "2020",
    description: "Personal archive."
  }
];

// Personal information - customize with your details
export const personalInfo = {
  location: "BASED IN ISTANBUL,",
  tagline: "WORKING GLOBALLY.",
  timezone: "TRT",
  description: "WHAT APPEARS HERE IS NOT A SHOWCASE, BUT THE TRACE OF A PRACTICE. EACH PROJECT IS A MOMENT OF EXPLORATION, A DIALOGUE BETWEEN VISION AND EXECUTION.",
  expertise: [
    "TATTOO ART",
    "TATTOO DESIGN",
    "PHOTOGRAPHY"
  ],
  socials: [
    { label: "INSTAGRAM", href: "https://www.instagram.com/mert.coo/" },
    { label: "BEHANCE", href: "#" },
    { label: "CONTACTS", href: "#" }
  ],
  cta: [
    { label: "MY BIO", href: "#" },
    { label: "AVAILIBLE DESIGNS", href: "#" },
    { label: "BOOK / CONTACT", href: "#" }

  ]
};
