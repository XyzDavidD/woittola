export type CatalogueProduct = {
  name: string;
  type: string;
  slug: string;
  image: string;
  applications: readonly string[];
};

export type ProductCategory = {
  name: string;
  slug: string;
  description: string;
  productCount: number;
  products: readonly CatalogueProduct[];
};

export const productCategories: readonly ProductCategory[] = [
  {
    name: "Patient Chairs",
    slug: "patient-chairs",
    description: "Comfortable seating for wards, rehabilitation, geriatric care and patient rooms.",
    productCount: 12,
    products: [
      { name: "Fero Relax", type: "Care Chair", slug: "fero-relax-1", image: "/images/chair1.png", applications: ["Patient Care", "Rehabilitation"] },
      { name: "Avento High-Low", type: "Patient Chair", slug: "avento-high-low-1", image: "/images/chair1.png", applications: ["Ward Care", "Mobility"] },
      { name: "Domus Care", type: "Geriatric Chair", slug: "domus-care-1", image: "/images/chair1.png", applications: ["Long-term Care", "Patient Care"] },
    ],
  },
  {
    name: "Treatment Chairs",
    slug: "treatment-chairs",
    description: "Ergonomic chairs for dialysis, infusion, chemotherapy and outpatient procedures.",
    productCount: 24,
    products: [
      { name: "MedSeat Pro", type: "Treatment Chair", slug: "medseat-pro-1", image: "/images/chair2.png", applications: ["Dialysis", "Infusion", "Chemotherapy"] },
      { name: "MedSeat Classic", type: "Infusion Chair", slug: "medseat-classic-2", image: "/images/chair2.png", applications: ["Infusion", "Outpatient"] },
      { name: "Relax 3", type: "Dialysis Chair", slug: "relax-3-3", image: "/images/chair2.png", applications: ["Dialysis", "Patient Care"] },
    ],
  },
  {
    name: "Gynecology",
    slug: "gynecology",
    description: "Specialist examination and procedure chairs designed for women’s healthcare.",
    productCount: 9,
    products: [
      { name: "eMotio", type: "Examination Chair", slug: "emotio-1", image: "/images/chair3.png", applications: ["Examination", "Outpatient"] },
      { name: "iDuolys", type: "Procedure Chair", slug: "iduolys-1", image: "/images/chair3.png", applications: ["Procedure", "Examination"] },
      { name: "Elite GYN", type: "Gynecology Chair", slug: "elite-gyn-1", image: "/images/chair3.png", applications: ["Women’s Health", "Procedure"] },
    ],
  },
  {
    name: "Patient Stretchers",
    slug: "patient-stretchers",
    description: "Reliable hydraulic and electric stretchers for transport, examination and imaging.",
    productCount: 11,
    products: [
      { name: "Sprint 200", type: "Hydraulic Stretcher", slug: "sprint-200-1", image: "/images/medical-table-generated.png", applications: ["Transport", "Emergency"] },
      { name: "Elevo", type: "Electric Stretcher", slug: "elevo-1", image: "/images/medical-table-generated.png", applications: ["Patient Care", "Transport"] },
      { name: "X-Ray Pro", type: "Imaging Stretcher", slug: "x-ray-pro-1", image: "/images/medical-table-generated.png", applications: ["Imaging", "Examination"] },
    ],
  },
  {
    name: "Medical Carts",
    slug: "medical-carts",
    description: "Configurable carts for emergency, anaesthesia, dressing and everyday clinical work.",
    productCount: 15,
    products: [
      { name: "Prisma Emergency", type: "Emergency Cart", slug: "prisma-emergency-1", image: "/images/chair3.png", applications: ["Emergency", "Critical Care"] },
      { name: "Practico", type: "Anaesthesia Cart", slug: "practico-1", image: "/images/chair3.png", applications: ["Anaesthesia", "Procedure"] },
      { name: "CareStore", type: "Dressing Cart", slug: "carestore-1", image: "/images/chair3.png", applications: ["Treatment", "Storage"] },
    ],
  },
  {
    name: "Medical Tables",
    slug: "medical-tables",
    description: "Professional examination, ultrasound, tilt and radiology tables for clinical settings.",
    productCount: 14,
    products: [
      { name: "AGA Exam Pro", type: "Examination Table", slug: "aga-exam-pro-1", image: "/images/medical-table-generated.png", applications: ["Examination", "Outpatient"] },
      { name: "Sono Comfort", type: "Ultrasound Table", slug: "sono-comfort-1", image: "/images/medical-table-generated.png", applications: ["Ultrasound", "Imaging"] },
      { name: "Tilt Pro", type: "Tilt Table", slug: "tilt-pro-1", image: "/images/medical-table-generated.png", applications: ["Rehabilitation", "Examination"] },
    ],
  },
  {
    name: "Work Stools",
    slug: "work-stools",
    description: "Ergonomic, height-adjustable seating for clinicians and healthcare operators.",
    productCount: 8,
    products: [
      { name: "Med Stool", type: "Medical Stool", slug: "med-stool-1", image: "/images/work-stool.jpg", applications: ["Examination", "Procedure"] },
      { name: "Operator Comfort", type: "Operator Stool", slug: "operator-comfort-1", image: "/images/work-stool.jpg", applications: ["Clinical Work", "Laboratory"] },
      { name: "Ergo Lift", type: "Saddle Stool", slug: "ergo-lift-1", image: "/images/work-stool.jpg", applications: ["Procedure", "Clinical Work"] },
    ],
  },
  {
    name: "Face Protection",
    slug: "face-protection",
    description: "Clear face shields, protective films and accessories for everyday clinical protection.",
    productCount: 7,
    products: [
      { name: "MeGuard Pro", type: "Face Shield", slug: "meguard-pro-1", image: "/images/face-protection-generated.png", applications: ["Clinical Care", "Protection"] },
      { name: "MeGuard Visor", type: "Protective Visor", slug: "meguard-visor-1", image: "/images/face-protection-generated.png", applications: ["Procedure", "Protection"] },
      { name: "Shield Kit", type: "Protection Set", slug: "shield-kit-1", image: "/images/face-protection-generated.png", applications: ["Clinical Care", "Accessories"] },
    ],
  },
];

export function getProductCategory(slug: string) {
  return productCategories.find((category) => category.slug === slug);
}
