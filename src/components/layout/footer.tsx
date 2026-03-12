import Link from "next/link"
import { Instagram, Facebook, Youtube } from "lucide-react"

const navigation = {
  company: [
    { name: "About", href: "/about" },
    { name: "Properties", href: "/properties" },
    { name: "Sell", href: "/sell-your-property" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight">RG Property Advisors</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Greater Cleveland&apos;s top 1% real estate advisors. Experts in Lakewood, Bay Village,
              and the surrounding Cleveland Metro area.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Keller Williams Citywide</li>
              <li>2001 Crocker Rd #200</li>
              <li>Westlake, OH 44145</li>
              <li>
                <a href="tel:216-408-3082" className="transition-colors hover:text-foreground">
                  (216) 408-3082
                </a>
              </li>
              <li>
                <a href="mailto:info@rgpropertyadvisors.com" className="transition-colors hover:text-foreground">
                  info@rgpropertyadvisors.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RG Property Advisors. All rights reserved.
          </p>
          <div className="mt-4 flex items-center space-x-6 md:mt-0">
            <a
              href="https://www.facebook.com/rgpropertyadvisors/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/rg_property_advisors/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href="https://www.youtube.com/channel/UCqTLNow6xy4neD2ueVZhNqQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </a>
            {navigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
