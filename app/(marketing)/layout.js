import Script from "next/script";
import MetaPixel from "@/app/components/MetaPixel";
import CapturaOrigen from "@/app/components/CapturaOrigen";

const CLARITY_PROJECT_ID = "xtnx388cxd";

export default function MarketingLayout({ children }) {
  return (
    <>
      <Script id="ms-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `}
      </Script>
      <MetaPixel />
      <CapturaOrigen />
      {children}
    </>
  );
}
