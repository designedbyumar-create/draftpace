"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * The product's four store images, as a gallery.
 *
 * WHAT THIS REPLACED
 *
 * Nine `slug === "..."` ternary branches picking a bespoke phone mockup
 * per product, repeated in two places on the page. Every new product meant
 * two more branches. The images are generated from those same mockups, so
 * nothing is lost by addressing them by slug instead of by import.
 *
 * The first image is eagerly loaded and priority-hinted: it is the largest
 * thing above the fold on a page whose whole job is to sell what it shows.
 */
export default function ProductGallery({ slug, title, accent }: { slug: string; title: string; accent: string }) {
  const [active, setActive] = useState(0);
  const images = [1, 2, 3, 4].map((n) => `/store/${slug}-${n}-${n === 1 ? "cover" : "screen"}.webp`);

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <Image
          src={images[active]}
          alt={active === 0 ? title : `${title}, screen ${active + 1}`}
          width={1400}
          height={1050}
          priority={active === 0}
          className="block w-full"
        />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of 4`}
            aria-current={i === active}
            className="overflow-hidden rounded-xl border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: i === active ? accent : "var(--border)", outlineColor: accent }}
          >
            <Image src={src} alt="" width={350} height={263} className="block w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
