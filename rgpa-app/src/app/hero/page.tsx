import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowRight, Play, Search, MapPin, Star, Building2 } from "lucide-react"
import Link from "next/link"

export default function HeroPage() {
  return (
    <div className="flex flex-col gap-20 bg-muted/20 pb-20">
      <div className="bg-background py-8 text-center border-b">
        <h1 className="text-2xl font-bold">Hero Section Variations</h1>
        <p className="text-muted-foreground">Select the style that best fits your vision</p>
      </div>

      {/* Style 1: Classic Center */}
      <section className="relative">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 1: Classic Center
        </div>
        <div className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop"
            alt="Hero background"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white hover:bg-white/20 border-0">
              Award Winning Real Estate
            </Badge>
            <h1 className="mx-auto max-w-4xl font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Discover Your Perfect <span className="text-blue-400">Sanctuary</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
              Experience the pinnacle of luxury living with our curated collection of exclusive properties. Designed for those who seek the extraordinary.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base">
                View Properties
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent text-white border-white hover:bg-white hover:text-black">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Style 2: Modern Split Left */}
      <section className="relative bg-background">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 2: Modern Split Left
        </div>
        <div className="container mx-auto grid min-h-[600px] max-w-7xl grid-cols-1 items-center gap-12 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-2">
              <div className="h-1 w-12 bg-blue-600"></div>
              <span className="font-semibold uppercase tracking-wider text-blue-600">Revifi Real Estate</span>
            </div>
            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
              Where Architecture Meets <span className="italic text-muted-foreground">Lifestyle</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              We specialize in transforming spaces into living works of art. From historic restorations to modern marvels, we bring your vision to life.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="gap-2">
                Start Your Project <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-4 px-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="h-full w-full rounded-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">500+ Happy Clients</p>
                  <div className="flex text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-square lg:h-[600px] lg:w-full">
            <div className="absolute right-0 top-0 h-[90%] w-[90%] overflow-hidden rounded-2xl bg-muted shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600596542815-e32c187f6326?q=80&w=2673&auto=format&fit=crop"
                alt="Interior"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-12 left-0 w-[60%] rounded-xl bg-background p-6 shadow-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">Latest Project</p>
                  <p className="text-sm text-muted-foreground">The Franklin Grand</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style 3: Overlay Card */}
      <section className="relative">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 3: Overlay Card
        </div>
        <div className="relative h-[700px] w-full">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2574&auto=format&fit=crop"
            alt="Modern home"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-start container mx-auto px-4 lg:px-8">
            <div className="max-w-xl rounded-none bg-background/95 backdrop-blur-sm p-10 shadow-lg sm:rounded-xl">
              <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
                Redefining Modern Living Spaces
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Innovative designs that blend seamlessly with nature. Discover homes that inspire and rejuvenate.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-8">
                <div>
                  <p className="text-3xl font-bold text-foreground">150+</p>
                  <p className="text-sm text-muted-foreground">Projects Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">15</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </div>
              </div>
              <div className="mt-8">
                <Button className="w-full sm:w-auto h-12 text-base">
                  View Our Portfolio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style 4: Minimal Typographic */}
      <section className="relative bg-background py-24">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 4: Minimal Typographic
        </div>
        <div className="container mx-auto max-w-7xl px-4 text-center lg:px-8">
          <Badge variant="outline" className="mb-8 px-4 py-1 text-sm uppercase tracking-widest">
            Established 2010
          </Badge>
          <h1 className="mx-auto max-w-5xl font-serif text-6xl font-medium tracking-tight sm:text-7xl lg:text-8xl">
            Design that speaks <br className="hidden sm:block" />
            <span className="text-muted-foreground">for itself.</span>
          </h1>
          <p className="mx-auto mt-12 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            We believe in the power of simplicity. Our approach to real estate development focuses on clean lines, sustainable materials, and timeless aesthetics.
          </p>
          <div className="mt-12 flex justify-center">
             <div className="h-24 w-[1px] bg-border"></div>
          </div>
        </div>
      </section>

      {/* Style 5: Dark Mode Split */}
      <section className="relative bg-slate-950 text-white">
        <div className="absolute top-0 left-0 z-10 bg-white text-black px-4 py-1 font-mono text-sm">
          Style 5: Dark Mode Split
        </div>
        <div className="container mx-auto flex min-h-[600px] max-w-7xl flex-col-reverse lg:flex-row">
          <div className="flex flex-1 flex-col justify-center p-8 lg:p-16">
            <h1 className="mb-6 font-serif text-5xl font-bold">
              Luxury in Every Detail
            </h1>
            <p className="mb-8 text-lg text-slate-400">
              From the foundation to the finishing touches, we ensure excellence. Our commitment to quality is unwavering.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <h3 className="font-bold">Premium Locations</h3>
                  <p className="text-sm text-slate-500">Hand-picked sites in prime neighborhoods.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <h3 className="font-bold">Expert Craftsmanship</h3>
                  <p className="text-sm text-slate-500">Built by master builders with decades of experience.</p>
                </div>
              </div>
            </div>
            <Button className="mt-10 w-fit bg-white text-black hover:bg-slate-200">
              Schedule Consultation
            </Button>
          </div>
          <div className="relative min-h-[300px] flex-1 lg:min-h-auto">
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop"
              alt="Luxury dark interior"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Style 6: Grid Collage */}
      <section className="relative bg-background py-16">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 6: Grid Collage
        </div>
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop"
                  alt="House 1"
                  className="aspect-[4/5] w-full rounded-lg object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=2670&auto=format&fit=crop"
                  alt="House 2"
                  className="mt-8 aspect-[4/5] w-full rounded-lg object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:pl-12">
              <h1 className="mb-6 font-serif text-5xl font-bold text-foreground">
                Curated Spaces for Modern Life
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Explore our diverse portfolio of residential and commercial properties. Each project is a unique reflection of its environment.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-2xl font-bold text-blue-600">98%</p>
                  <p className="text-sm font-medium">Client Satisfaction</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-2xl font-bold text-blue-600">24/7</p>
                  <p className="text-sm font-medium">Support & Service</p>
                </div>
              </div>
              <Button size="lg" className="mt-8">
                View Gallery
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Style 7: Search Focus */}
      <section className="relative">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 7: Search Focus
        </div>
        <div className="relative flex h-[500px] flex-col items-center justify-center bg-slate-100">
           <div className="absolute inset-0 overflow-hidden">
             <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
             <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
           </div>
           
           <div className="relative z-10 w-full max-w-3xl px-4 text-center">
             <h1 className="mb-2 font-serif text-4xl font-bold text-foreground sm:text-5xl">
               Find Your Dream Home
             </h1>
             <p className="mb-8 text-muted-foreground">
               Search through thousands of listings in your favorite locations.
             </p>
             
             <div className="flex flex-col gap-2 rounded-xl bg-background p-2 shadow-lg sm:flex-row">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                 <Input 
                   placeholder="City, Neighborhood, or Zip" 
                   className="h-12 border-0 bg-transparent pl-10 focus-visible:ring-0" 
                 />
               </div>
               <div className="h-px w-full bg-border sm:h-12 sm:w-px"></div>
               <Button size="lg" className="h-12 px-8">
                 Search
               </Button>
             </div>
             
             <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
               <span>Popular:</span>
               <Link href="#" className="underline hover:text-foreground">Downtown</Link>
               <Link href="#" className="underline hover:text-foreground">Lakefront</Link>
               <Link href="#" className="underline hover:text-foreground">Suburbs</Link>
               <Link href="#" className="underline hover:text-foreground">New Construction</Link>
             </div>
           </div>
        </div>
      </section>

      {/* Style 8: Full Screen Video Style */}
      <section className="relative">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 8: Full Screen Video Style
        </div>
        <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            alt="Video placeholder"
          />
          
          <div className="relative z-10 text-center text-white">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <Play className="h-8 w-8 fill-current pl-1" />
              </div>
            </div>
            <h1 className="font-serif text-5xl font-bold sm:text-7xl">
              Experience Revifi
            </h1>
            <p className="mt-4 text-xl font-light text-white/80">
              Watch our story
            </p>
          </div>
          
          <div className="absolute bottom-10 left-0 w-full text-center text-white/50">
            <p className="text-sm uppercase tracking-widest">Scroll to explore</p>
            <div className="mx-auto mt-4 h-12 w-[1px] bg-white/20"></div>
          </div>
        </div>
      </section>

      {/* Style 9: Asymmetric Creative */}
      <section className="relative bg-[#f5f5f0] py-24">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 9: Asymmetric Creative
        </div>
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row">
            <div className="lg:w-1/3 pt-12">
              <h1 className="font-serif text-6xl font-medium leading-none text-foreground">
                Art of <br />
                <span className="ml-12 italic text-muted-foreground">Living</span>
              </h1>
              <div className="mt-12 space-y-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Our philosophy is rooted in the belief that spaces shape our lives. We design environments that elevate the human experience.
                </p>
                <Link href="#" className="inline-flex items-center gap-2 border-b border-black pb-1 text-lg font-medium hover:opacity-70">
                  Read our Manifesto <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative lg:w-2/3">
              <div className="grid grid-cols-2 gap-4">
                 <div className="pt-12">
                    <img 
                      src="https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=2000&auto=format&fit=crop" 
                      className="w-full rounded-sm object-cover aspect-[3/4]"
                      alt="Artistic interior"
                    />
                 </div>
                 <div>
                    <img 
                      src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" 
                      className="w-full rounded-sm object-cover aspect-[3/4]"
                      alt="Artistic detail"
                    />
                    <div className="mt-4 p-4 bg-white shadow-sm">
                      <p className="font-serif text-xl italic">"The details are not the details. They make the design."</p>
                      <p className="mt-2 text-sm text-muted-foreground">— Charles Eames</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style 10: Corporate / Trust */}
      <section className="relative bg-white py-20">
        <div className="absolute top-0 left-0 z-10 bg-black text-white px-4 py-1 font-mono text-sm">
          Style 10: Corporate / Trust
        </div>
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="lg:w-1/2">
               <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                 <Badge variant="secondary" className="bg-white text-blue-600 hover:bg-white">New</Badge> 2024 Market Report Available
               </div>
               <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight text-slate-900">
                 Investing in the Future of Real Estate
               </h1>
               <p className="mt-6 text-lg text-slate-600">
                 Revifi provides institutional-grade investment opportunities and development services. We build wealth through strategic property acquisition.
               </p>
               <div className="mt-8 flex flex-wrap gap-4">
                 <Button className="h-12 px-6 bg-slate-900 text-white hover:bg-slate-800">
                   Investor Relations
                 </Button>
                 <Button variant="outline" className="h-12 px-6">
                   Our Track Record
                 </Button>
               </div>
               <div className="mt-12 grid grid-cols-3 gap-8 border-t pt-8">
                 <div>
                   <h3 className="text-2xl font-bold text-slate-900">$2.5B</h3>
                   <p className="text-sm text-slate-500">Assets Managed</p>
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-slate-900">12%</h3>
                   <p className="text-sm text-slate-500">Avg Return</p>
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-slate-900">50+</h3>
                   <p className="text-sm text-slate-500">Markets</p>
                 </div>
               </div>
            </div>
            <div className="relative lg:w-1/2">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100 p-2">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop" 
                  className="rounded-xl object-cover shadow-lg"
                  alt="Corporate building"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
