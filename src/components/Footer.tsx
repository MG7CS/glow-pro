import { Link } from "react-router-dom";
import { getBizUrl } from "@/lib/bizUrl";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-1.5 mb-3">
              <span className="text-primary text-lg font-bold tracking-tight">Glow</span>
              <span className="text-foreground text-lg font-bold tracking-tight">Pro</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">Find any stylist or salon in Rwanda</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">For professionals</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={getBizUrl()}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Join as a professional
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GlowPro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
