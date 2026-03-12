export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "RG Property Advisors",
    description:
      "Greater Cleveland's top 1% real estate advisors. Specializing in residential, multi-family, distressed assets, and vacant land in Lakewood, Bay Village, Westlake, and the surrounding Cleveland Metro area.",
    url: "https://rgpropertyadvisors.com",
    telephone: "+12164083082",
    email: "info@rgpropertyadvisors.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2001 Crocker Rd #200",
      addressLocality: "Westlake",
      addressRegion: "OH",
      postalCode: "44145",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.4553,
      longitude: -81.9179,
    },
    areaServed: [
      { "@type": "City", name: "Lakewood", addressRegion: "OH" },
      { "@type": "City", name: "Bay Village", addressRegion: "OH" },
      { "@type": "City", name: "Westlake", addressRegion: "OH" },
      { "@type": "City", name: "Cleveland", addressRegion: "OH" },
    ],
    sameAs: [
      "https://www.facebook.com/rgpropertyadvisors/",
      "https://www.instagram.com/rg_property_advisors/",
      "https://www.youtube.com/channel/UCqTLNow6xy4neD2ueVZhNqQ",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "16:30",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "RG Property Advisors Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Residential Real Estate",
            description:
              "Expert guidance buying and selling homes in Lakewood, Bay Village, and surrounding Cleveland areas.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Multi-Family Properties",
            description:
              "Townhome development, mixed-use, and office space acquisitions and sales.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Distressed Assets",
            description:
              "Acquisition, renovation, and disposition of investment properties.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Vacant Land",
            description:
              "Expert guidance on zoning, purchasing, and construction for vacant land.",
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
      name: "RG Property Advisors",
      url: "https://rgpropertyadvisors.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "2001 Crocker Rd #200",
        addressLocality: "Westlake",
        addressRegion: "OH",
        postalCode: "44145",
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
      name: "RG Property Advisors",
      url: "https://rgpropertyadvisors.com",
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
