"use client";

import Image from "next/image";

type BrandLogoProps = {
  variant?: "navbar" | "footer";
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  variant = "navbar",
  className = "",
  priority = false,
}: BrandLogoProps) {
  const isNavbar = variant === "navbar";

  // Desktop width: 270–280px, max-height: 75px
  // Mobile width: 190–210px, height: auto
  return (
    <div
      className={`inline-flex items-center shrink-0 max-h-[75px] max-w-[210px] sm:max-w-[280px] w-auto ${className}`}
      style={{
        maxWidth: isNavbar ? "280px" : "260px",
        maxHeight: "75px",
      }}
    >
      <Image
        src="/brand/blockcredai-logo.png"
        alt="BlockCredAI — Decentralized Employment Verification"
        width={280}
        height={66}
        priority={priority || isNavbar}
        className="w-[195px] sm:w-[275px] max-w-full h-auto max-h-[75px] object-contain shrink-0 select-none"
        style={{
          width: "auto",
          height: "auto",
          maxWidth: "100%",
          maxHeight: "75px",
          objectFit: "contain",
        }}
        sizes={
          isNavbar
            ? "(max-width: 640px) 210px, 280px"
            : "(max-width: 640px) 210px, 260px"
        }
      />
    </div>
  );
}
