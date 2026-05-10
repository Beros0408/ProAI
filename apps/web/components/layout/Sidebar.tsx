"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, MessageSquare, PenTool, Search, BookTemplate,
  Brain, Users, Workflow, CalendarCheck, CalendarDays, Zap,
  BarChart3, FileText, TrendingUp, Settings,
  ChevronDown, ChevronsLeft, ChevronsRight, Sparkles, Crown,
  Wrench, Briefcase, Cpu, type LucideIcon,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import type { TranslationKey } from "@/lib/i18n/translations"
import { useTheme } from "@/lib/theme/context"

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  icon: LucideIcon
  labelKey: TranslationKey
  badge?: number
}

interface NavSection {
  key: string
  labelKey: TranslationKey
  icon: LucideIcon
  color: string
  glow: string
  items: NavItem[]
}

// ─── Static data ─────────────────────────────────────────────────────────────

const TOP_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/chat",      icon: MessageSquare,   labelKey: "nav.chat", badge: 3 },
]

const SECTIONS: NavSection[] = [
  {
    key: "tools",
    labelKey: "sidebar.tools",
    icon: Wrench,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.12)",
    items: [
      { href: "/content",   icon: PenTool,      labelKey: "nav.content" },
      { href: "/analyze",   icon: Search,       labelKey: "nav.analyze" },
      { href: "/templates", icon: BookTemplate, labelKey: "nav.templates" },
      { href: "/mindmap",   icon: Brain,        labelKey: "nav.mindmap" },
    ],
  },
  {
    key: "business",
    labelKey: "sidebar.business",
    icon: Briefcase,
    color: "#34d399",
    glow: "rgba(52,211,153,0.12)",
    items: [
      { href: "/crm",       icon: Users,         labelKey: "nav.crm", badge: 2 },
      { href: "/workflows", icon: Workflow,      labelKey: "nav.workflows" },
      { href: "/schedule",  icon: CalendarCheck, labelKey: "nav.schedule" },
      { href: "/agenda",    icon: CalendarDays,  labelKey: "nav.agenda" },
    ],
  },
  {
    key: "intelligence",
    labelKey: "sidebar.intelligence",
    icon: Cpu,
    color: "#fb923c",
    glow: "rgba(251,146,60,0.12)",
    items: [
      { href: "/automations", icon: Zap,        labelKey: "nav.automations" },
      { href: "/analytics",   icon: BarChart3,  labelKey: "nav.analytics" },
      { href: "/reports",     icon: FileText,   labelKey: "nav.reports" },
      { href: "/predictions", icon: TrendingUp, labelKey: "nav.predictions" },
    ],
  },
]

function sectionForPath(pathname: string): string | null {
  for (const s of SECTIONS) {
    if (s.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))) {
      return s.key
    }
  }
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { theme } = useTheme()

  const [compact, setCompact] = useState(false)
  const [openKey, setOpenKey] = useState<string | null>(() => sectionForPath(pathname))

  // Auto-open the section that contains the active page on navigation
  useEffect(() => {
    const active = sectionForPath(pathname)
    if (active !== null) setOpenKey(active)
  }, [pathname])

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key))

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ${compact ? "w-[72px]" : "w-[230px]"}`}
      style={{
        background: theme === 'warm' ? '#1f1814' : "var(--sidebar-bg, rgba(5,12,24,0.82))",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRight: theme === 'warm' ? '1px solid rgba(251,146,60,0.08)' : "1px solid var(--border-subtle, rgba(255,255,255,0.05))",
      }}
    >
      {/* ── LOGO ── */}
      <div className="flex items-center justify-between px-4 h-16 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #fb923c)" }}
          >
            P
          </div>
          {!compact && (
            <span className="text-base font-bold" style={{ color: theme === 'warm' ? '#fb923c' : "#0ea5e9" }}>
              ProAI
            </span>
          )}
        </Link>
        {!compact && (
          <Link
            href="/chat"
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{ color: "#a78bfa" }}
            title={t("nav.chat")}
          >
            <Sparkles size={16} />
          </Link>
        )}
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">

        {/* Principal */}
        {!compact && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme === 'warm' ? '#8a7560' : "var(--text-muted, #475569)" }}>
            {t("sidebar.principal")}
          </p>
        )}

        <div className="space-y-1 mb-6">
          {TOP_ITEMS.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 ${compact ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
                style={{
                  background: active ? (theme === 'warm' ? 'rgba(251,146,60,0.1)' : "var(--nav-active-bg)") : "transparent",
                  boxShadow: active ? "0 0 16px rgba(14,165,233,0.08)" : "none",
                }}
              >
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: "var(--nav-indicator)", boxShadow: "0 0 8px rgba(14,165,233,0.5)" }}
                  />
                )}
                <Icon
                  size={17}
                  style={{
                    color: active ? (theme === 'warm' ? '#fb923c' : "var(--nav-active-color)") : "var(--text-muted)",
                    filter: active ? "drop-shadow(0 0 4px rgba(14,165,233,0.4))" : "none",
                  }}
                />
                {!compact && (
                  <>
                    <span
                      className={`text-[13px] flex-1 ${active ? "font-semibold text-[var(--text-primary)]" : "font-medium text-[var(--text-secondary)]"}`}
                      style={{ letterSpacing: active ? "-0.02em" : "normal" }}
                    >
                      {t(item.labelKey)}
                    </span>
                    {item.badge != null && (
                      <span
                        className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: "rgba(251,146,60,0.2)", color: "#fb923c" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {compact && item.badge != null && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: "#fb923c", boxShadow: "0 0 4px rgba(251,146,60,0.5)" }}
                  />
                )}
                {!active && (
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* ── Accordéons ── */}
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const isOpen    = openKey === section.key
            const hasActive = section.items.some(
              (i) => pathname === i.href || pathname.startsWith(i.href + "/")
            )
            const SIcon = section.icon

            return (
              <div key={section.key}>

                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => toggle(section.key)}
                  className={`w-full flex items-center gap-2.5 rounded-xl transition-all duration-200 ${compact ? "justify-center px-2 py-3" : "px-3 py-3"}`}
                  style={{
                    background:  isOpen || hasActive ? section.glow : "transparent",
                    borderLeft:  `3px solid ${isOpen || hasActive ? section.color : "transparent"}`,
                  }}
                >
                  <SIcon size={17} style={{ color: isOpen || hasActive ? section.color : "#64748b" }} />
                  {!compact && (
                    <>
                      <span
                        className="text-[12px] font-bold uppercase tracking-wider flex-1 text-left"
                        style={{ color: isOpen || hasActive ? section.color : "#64748b" }}
                      >
                        {t(section.labelKey)}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                        style={{ color: isOpen ? section.color : "#475569" }}
                      />
                    </>
                  )}
                </button>

                {/* Sub-menu — expanded mode */}
                {!compact && (
                  <div
                    className="overflow-hidden"
                    style={{
                      maxHeight:  isOpen ? "400px" : "0px",
                      opacity:    isOpen ? 1 : 0,
                      transition: "max-height 0.3s ease-in-out, opacity 0.2s ease-in-out",
                    }}
                  >
                    <div className="pl-3 pt-2 space-y-1">
                      {section.items.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/")
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200"
                            style={{ background: active ? section.glow : "transparent", boxShadow: active ? `0 0 12px ${section.color}15` : "none" }}
                          >
                            {active && (
                              <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                                style={{ background: section.color, boxShadow: `0 0 6px ${section.color}80` }}
                              />
                            )}
                            <Icon size={15} style={{ color: active ? section.color : "var(--text-muted)" }} />
                            <span
                              className={`text-[13px] flex-1 ${active ? "font-semibold text-[var(--text-primary)]" : "font-medium text-[var(--text-secondary)]"}`}
                              style={{ letterSpacing: active ? "-0.02em" : "normal" }}
                            >
                              {t(item.labelKey)}
                            </span>
                            {item.badge != null && (
                              <span
                                className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
                                style={{ background: "rgba(251,146,60,0.2)", color: "#fb923c" }}
                              >
                                {item.badge}
                              </span>
                            )}
                            {!active && (
                              <div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                style={{ background: "rgba(255,255,255,0.04)" }}
                              />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-menu — compact mode (icons only) */}
                {compact && isOpen && (
                  <div className="space-y-0.5 mt-1">
                    {section.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(item.href + "/")
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex justify-center py-2 rounded-xl transition-all duration-200"
                          style={{ background: active ? section.glow : "transparent" }}
                          title={t(item.labelKey)}
                        >
                          <Icon size={15} style={{ color: active ? section.color : "#64748b" }} />
                        </Link>
                      )
                    })}
                  </div>
                )}

              </div>
            )
          })}
        </div>
      </nav>

      {/* ── PARAMÈTRES ── */}
      <div className="px-2 pb-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${compact ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
          style={{
            color:      pathname === "/settings" ? "var(--nav-active-color)" : "var(--text-muted)",
            background: pathname === "/settings" ? "var(--nav-active-bg)" : "transparent",
          }}
        >
          <Settings size={17} />
          {!compact && (
            <span className="text-[13px] font-medium" style={{ color: pathname === "/settings" ? "var(--nav-active-color)" : "var(--text-secondary)" }}>
              {t("nav.settings")}
            </span>
          )}
        </Link>
      </div>

      {/* ── RÉDUIRE ── */}
      <div className="px-2 pb-1">
        <button
          type="button"
          onClick={() => setCompact((c) => !c)}
          className={`w-full flex items-center gap-3 rounded-xl py-2.5 transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)] ${compact ? "justify-center px-2" : "px-3"}`}
          style={{ color: "var(--text-muted)" }}
        >
          {compact ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!compact && (
            <span className="text-[11px] font-medium">{t("sidebar.reduce")}</span>
          )}
        </button>
      </div>

      {/* ── UTILISATEUR ── */}
      <div
        className={`mx-2 mb-2 rounded-xl p-3 ${compact ? "px-2" : ""}`}
        style={{
          background: theme === 'warm' ? '#2a2018' : "var(--bg-surface, #111827)",
          border: theme === 'warm' ? '1px solid rgba(251,146,60,0.08)' : "1px solid var(--border-color, rgba(255,255,255,0.06))",
        }}
      >
        <div className={`flex items-center gap-2.5 ${compact ? "justify-center" : ""}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "rgba(14,165,233,0.15)", color: "#38bdf8" }}
          >
            U
          </div>
          {!compact && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t("nav.myspace")}</p>
              <div className="flex items-center gap-1">
                <Crown size={9} style={{ color: "#fb923c" }} />
                <span className="text-[10px]" style={{ color: "#fb923c" }}>{t("nav.freeplan")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
