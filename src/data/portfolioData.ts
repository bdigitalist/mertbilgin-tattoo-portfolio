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

// Placeholder portfolio items - replace with your own projects
export const portfolioItems: GridItem[] = [
  {
    id: "project-1",
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    alt: "Abstract geometric shapes",
    title: "Geometric Dreams",
    category: "Brand Identity",
    year: "2024",
    description: "A visual exploration of form and color for a tech startup."
  },
  {
    id: "project-2",
    src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
    alt: "Minimalist architecture",
    title: "Urban Canvas",
    category: "Web Design",
    year: "2024",
    description: "Immersive digital experience for an architectural studio."
  },
  {
    id: "project-3",
    src: "https://images.unsplash.com/photo-1634017839464-5c339bbe3f35?w=800&q=80",
    alt: "Digital art piece",
    title: "Neural Paths",
    category: "Art Direction",
    year: "2023",
    description: "Generative art collection exploring AI aesthetics."
  },
  {
    id: "project-4",
    src: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&q=80",
    alt: "Typography design",
    title: "Type Lab",
    category: "Typography",
    year: "2023",
    description: "Experimental typeface design for print and digital."
  },
  {
    id: "project-5",
    src: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80",
    alt: "Motion graphics",
    title: "Flow State",
    category: "Motion",
    year: "2023",
    description: "Animated brand identity for a meditation app."
  },
  {
    id: "project-6",
    src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
    alt: "Gradient artwork",
    title: "Chromatic",
    category: "Digital Art",
    year: "2023",
    description: "NFT collection featuring fluid gradients and forms."
  },
  {
    id: "project-7",
    src: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&q=80",
    alt: "3D render",
    title: "Dimensions",
    category: "3D Design",
    year: "2022",
    description: "Product visualization for a luxury watch brand."
  },
  {
    id: "project-8",
    src: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&q=80",
    alt: "Abstract patterns",
    title: "Pattern Play",
    category: "Branding",
    year: "2022",
    description: "Visual identity system for a fashion label."
  },
  {
    id: "project-9",
    src: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
    alt: "Neon lights",
    title: "Neon Nights",
    category: "Photography",
    year: "2022",
    description: "Editorial photography series in Tokyo."
  },
  {
    id: "project-10",
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    alt: "Retro gaming",
    title: "Pixel Perfect",
    category: "UI Design",
    year: "2022",
    description: "Retro-inspired interface for a gaming platform."
  },
  {
    id: "project-11",
    src: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80",
    alt: "Marble texture",
    title: "Material World",
    category: "Packaging",
    year: "2021",
    description: "Premium packaging design for skincare brand."
  },
  {
    id: "project-12",
    src: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&q=80",
    alt: "Typography experiment",
    title: "Letter Forms",
    category: "Typography",
    year: "2021",
    description: "Kinetic typography for music video."
  }
];

// Personal information - customize with your details
export const personalInfo = {
  location: "BASED IN ITALY,",
  tagline: "WORKING GLOBALLY.",
  timezone: "CET",
  description: "WHAT APPEARS HERE IS NOT A SHOWCASE, BUT THE TRACE OF A PRACTICE. EACH PROJECT IS A MOMENT OF EXPLORATION, A DIALOGUE BETWEEN VISION AND EXECUTION.",
  expertise: [
    "ART DIRECTION",
    "WEB DESIGN + DEV",
    "WEBFLOW DEVELOPMENT"
  ],
  socials: [
    { label: "AWWWARDS", href: "#" },
    { label: "LINKEDIN", href: "#" },
    { label: "CONTACTS", href: "#" }
  ],
  cta: [
    { label: "THE ARCHIVE", href: "#" },
    { label: "THE PROFILE", href: "#" }
  ]
};
