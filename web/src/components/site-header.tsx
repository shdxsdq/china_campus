"use client";

import Link from "next/link";
import { useState } from "react";

import type { NavigationKey, SiteSettings } from "@/lib/types";

const mainNav = [
  { key: "campus", label: "走进校园", href: "/campus" },
  { key: "news", label: "校园新闻", href: "/news" },
  { key: "notice", label: "校园公告", href: "/notice" },
  { key: "teachers", label: "师资队伍", href: "/teachers" },
] satisfies Array<{
  key: NavigationKey;
  label: string;
  href: string;
}>;

export function SiteHeader({
  activeNav,
  site,
}: {
  activeNav: NavigationKey;
  site: SiteSettings;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <p>{site.welcomeText}</p>
          <nav className="mini-links" aria-label="快捷导航">
            <Link href="/">首页</Link>
            <Link href="/news">校园新闻</Link>
            <Link href="/notice">校园公告</Link>
            <Link href="/gallery">活动相册</Link>
          </nav>
        </div>
      </header>

      <nav className="main-nav">
        <div className="container nav-inner">
          <Link className="brand" href="/">
            <img className="brand-logo" src={site.logoUrl} alt={`${site.schoolName}标识`} />
            <div>
              <h1>{site.schoolName}</h1>
              <p>{site.schoolNameEn}</p>
            </div>
          </Link>

          <button
            className="menu-btn"
            type="button"
            aria-label="打开菜单"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            ☰
          </button>

          <ul className={`nav-links${isOpen ? " open" : ""}`}>
            {mainNav.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={activeNav === item.key ? "active" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
