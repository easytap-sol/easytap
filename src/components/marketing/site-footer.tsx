// /home/mandela/projects/mesh/easytap/src/components/marketing/site-footer.tsx
export function SiteFooter() {
  return (
    <footer className="border-t bg-white/95 backdrop-blur-sm py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                E
              </div>
              <span className="text-xl font-bold text-primary">EasyTap Solutions</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
              Licensed Digital Credit Provider. Your #1 Digital Lender in Kenya.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-semibold text-foreground mb-2">Company</span>
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How it Works</a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Rates</a>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-semibold text-foreground mb-2">Legal</span>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Compliance</a>
            </div>
          </div>

          {/* Contact & Copyright */}
          <div className="text-center md:text-right">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Contact: support@easytap.co.ke</p>
              <p className="text-sm text-muted-foreground">USSD: *483*321#</p>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EasyTap Solutions Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}