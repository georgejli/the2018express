import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const NextShowTicker = () => {
  const [tickerContent, setTickerContent] = useState("NEXT SHOW: SUN, MAY 31 2026");

  useEffect(() => {
    const fetchText = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ticker_text")
        .single();

      if (data?.value) {
        setTickerContent(data.value);
      }
    };
    fetchText();
  }, []);

  return (
    <div className="overflow-hidden bg-primary py-3">
      <div className="animate-scroll flex whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="mx-8 font-display text-lg tracking-tight text-primary-foreground md:text-xl"
          >
            {tickerContent}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NextShowTicker;
