import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Please Forget Me</h3>
            <p className="text-sm text-muted-foreground">
              A service of Arkology Studio
            </p>
            <p className="text-sm text-muted-foreground">
              Cape Town, South Africa
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <p className="text-sm text-muted-foreground">
              <a 
                href="mailto:admin@pleaseforget.me"
                className="hover:text-foreground transition-colors"
              >
                admin@pleaseforget.me  
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Arkology. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
