import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 flex items-center justify-between h-16 gap-3">
        <Link to="/" className="flex items-center gap-0.5 shrink-0">
          <span className="text-primary text-xl font-bold tracking-tight">Connect</span>
          <span className="text-foreground text-xl font-bold tracking-tight">Kigali</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="https://biz.connectkigali.com"
            className="text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted px-4 py-2 rounded-full transition-colors whitespace-nowrap"
          >
            List your business
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
