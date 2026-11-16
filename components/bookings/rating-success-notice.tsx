"use client";

import { useEffect, useState } from "react";

export function RatingSuccessNotice({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisible(false);

      const url = new URL(window.location.href);
      url.searchParams.delete("rated");
      const query = url.searchParams.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${query ? `?${query}` : ""}${url.hash}`,
      );
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
      {message}
    </p>
  );
}
