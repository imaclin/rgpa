import Link from "next/link"
import { Instagram } from "lucide-react"

const navigation = {
  company: [
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Services", href: "/services" },
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
              <span className="font-serif text-2xl font-bold tracking-tight">REVIFI</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Revitalizing the great buildings of yesterday for a better tomorrow. 
              Specializing in historic building rehabilitation in Cleveland, Ohio.
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
              <li>5900 Detroit Ave.</li>
              <li>Cleveland, Ohio 44102</li>
              <li>
                <a href="tel:216-302-7741" className="transition-colors hover:text-foreground">
                  (216) 302-7741
                </a>
              </li>
              <li>
                <a href="mailto:info@revifi.com" className="transition-colors hover:text-foreground">
                  info@revifi.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} REVIFI. All rights reserved.
          </p>
          <div className="mt-4 flex items-center space-x-6 md:mt-0">
            <a
              href="https://www.instagram.com/revifiproperties"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
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
