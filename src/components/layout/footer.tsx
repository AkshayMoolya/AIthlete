import Link from "next/link";
import { Logo } from "../ui/logo";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Updates", href: "#updates" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#help" },
        { label: "Privacy", href: "#privacy" },
        { label: "Terms", href: "#terms" },
      ],
    },
  ];

  return (
    <footer
      className={`border-t bg-muted/30 py-8 sm:py-12 px-4 sm:px-6 ${className}`}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-6" />
            <p className="text-muted-foreground leading-relaxed text-sm">
              Simple and effective fitness tracking for everyone.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div
              key={section.title}
              className={index === 0 ? "col-span-2 sm:col-span-1" : ""}
            >
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3 text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-8 sm:mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 AIthlete. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
