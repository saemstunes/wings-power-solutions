import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Phone, ArrowUp } from "lucide-react";

const FloatingButtons = () => {
  const { t } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openWhatsApp = () => {
    const message = encodeURIComponent(t("whatsapp.prefilledMessage"));
    window.open(`https://wa.me/254718234222?text=${message}`, "_blank");
  };

  const callPhone = () => {
    window.open("tel:+254718234222", "_self");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`
          group w-12 h-12 rounded-full 
          flex items-center justify-center 
          transition-all duration-300 ease-out
          backdrop-blur-xl
          bg-foreground/10 dark:bg-foreground/15
          border border-foreground/20 dark:border-foreground/25
          shadow-lg shadow-foreground/5 dark:shadow-black/20
          hover:bg-foreground/20 dark:hover:bg-foreground/25
          hover:scale-110 hover:shadow-xl
          ${showBackToTop 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <ArrowUp className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors" />
      </button>

      {/* Phone Call Button */}
      <button
        onClick={callPhone}
        className="
          group w-12 h-12 rounded-full 
          flex items-center justify-center 
          transition-all duration-300 ease-out
          backdrop-blur-xl
          bg-foreground/10 dark:bg-foreground/15
          border border-foreground/20 dark:border-foreground/25
          shadow-lg shadow-foreground/5 dark:shadow-black/20
          hover:bg-foreground/20 dark:hover:bg-foreground/25
          hover:scale-110 hover:shadow-xl
        "
        aria-label={t("contact.info.phone")}
        title="Call us"
      >
        <Phone className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors" />
      </button>

      {/* WhatsApp Button */}
      <button
        onClick={openWhatsApp}
        className="
          group w-14 h-14 rounded-full 
          flex items-center justify-center 
          transition-all duration-300 ease-out
          backdrop-blur-xl
          bg-[#25D366]/90 dark:bg-[#25D366]/80
          border border-[#25D366]/40 dark:border-[#25D366]/50
          shadow-lg shadow-[#25D366]/20 dark:shadow-[#25D366]/30
          hover:bg-[#25D366] dark:hover:bg-[#25D366]
          hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/30
        "
        aria-label={t("whatsapp.tooltip")}
        title={t("whatsapp.tooltip")}
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </button>
    </div>
  );
};

export default FloatingButtons;
