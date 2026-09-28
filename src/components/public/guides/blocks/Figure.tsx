import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  layout?: "inline" | "aside";
};

/**
 * A picture that supports the text and never replaces it.
 *
 * Tall images are the design problem. A 2:3 image at the width of the
 * column is about a thousand pixels of scroll that pushes the text out of
 * view, so the default here is a narrow figure that floats beside the
 * text on a wide screen and sits centred, capped, on a phone. Width and
 * height are always set, so the space is reserved and nothing jumps when
 * the image arrives. It lazy-loads: no figure is above the fold, so none
 * competes with the headline for the largest paint.
 */
export default function Figure({ src, alt, caption, width, height, layout = "inline" }: Props) {
  const aside = layout === "aside";
  return (
    <figure
      className={[
        "mt-7 mb-2",
        aside ? "mx-auto max-w-[300px] lg:float-right lg:mb-4 lg:ml-8 lg:mr-0 lg:mt-2 lg:w-[260px]" : "mx-auto max-w-[520px]",
      ].join(" ")}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={aside ? "(min-width: 1024px) 260px, 300px" : "(min-width: 640px) 520px, 100vw"}
        className="h-auto w-full rounded-[var(--radius-lg)] border border-[var(--border)]"
      />
      {caption && <figcaption className="mt-2 text-body-sm leading-snug text-[var(--muted)]">{caption}</figcaption>}
    </figure>
  );
}
