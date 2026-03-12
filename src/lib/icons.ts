import {
  Building2,
  Paintbrush,
  Lightbulb,
  Users,
  Wrench,
  Hammer,
  Home,
  Ruler,
  PenTool,
  Sparkles,
  Shield,
  Briefcase,
  HardHat,
  Layers,
  Search,
  Star,
  Gift,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Paintbrush,
  Lightbulb,
  Users,
  Wrench,
  Hammer,
  Home,
  Ruler,
  PenTool,
  Sparkles,
  Shield,
  Briefcase,
  HardHat,
  Layers,
  Search,
  Star,
  Gift,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Building2
}
