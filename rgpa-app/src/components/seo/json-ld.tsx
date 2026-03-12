export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: "REVIFI",
    description:
      "Designers and contractors specializing in the revitalization of old properties. Historic building rehabilitation and community-centric real estate development in Cleveland, Ohio.",
    url: "https://revifi.com",
    telephone: "+12163027741",
    email: "info@revifi.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "5900 Detroit Ave.",
      addressLocality: "Cleveland",
      addressRegion: "OH",
      postalCode: "44102",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.4822,
      longitude: -81.7329,
    },
    areaServed: {
      "@type": "City",
      name: "Cleveland",
      sameAs: "https://en.wikipedia.org/wiki/Cleveland",
    },
    sameAs: ["https://www.instagram.com/revifiproperties"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$$$",
    image: "https://revifi.com/revifi-logo.png",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "REVIFI Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Commercial Building Restoration",
            description:
              "Expert restoration services for commercial buildings including historic preservation, structural repair, and adaptive reuse.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Interior Design",
            description:
              "Full-service interior design including space planning, custom furniture, material selection, and lighting design.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Project Consultation",
            description:
              "Expert project consultation including feasibility studies, budget planning, timeline development, and project management.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Property Acquisition",
            description:
              "Streamlined property acquisition including market analysis, due diligence, negotiation, and closing coordination.",
          },
        },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ServiceJsonLdProps {
  name: string
  description: string
  url: string
}

export function ServiceJsonLd({ name, description, url }: ServiceJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "GeneralContractor",
      name: "REVIFI",
      url: "https://revifi.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "5900 Detroit Ave.",
        addressLocality: "Cleveland",
        addressRegion: "OH",
        postalCode: "44102",
        addressCountry: "US",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Cleveland",
      sameAs: "https://en.wikipedia.org/wiki/Cleveland",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ProjectJsonLdProps {
  name: string
  description: string
  url: string
  image?: string
  location?: string
}

export function ProjectJsonLd({
  name,
  description,
  url,
  image,
  location,
}: ProjectJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    url,
    ...(image && { image }),
    ...(location && {
      contentLocation: {
        "@type": "Place",
        name: location,
      },
    }),
    creator: {
      "@type": "Organization",
      name: "REVIFI",
      url: "https://revifi.com",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
