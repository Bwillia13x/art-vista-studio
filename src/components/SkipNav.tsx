export default function SkipNav() {
  const skipLinks = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#navigation", label: "Skip to navigation" },
    { href: "#services", label: "Skip to services" },
    { href: "#booking", label: "Skip to booking" },
  ];

  return (
    <div className="skip-nav-container">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-6 focus:py-3 focus:text-primary-foreground focus:shadow-xl focus:shadow-primary/50 focus:ring-2 focus:ring-primary-foreground/20 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 font-medium"
          style={{ top: `${skipLinks.indexOf(link) * 4 + 1}rem` }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
