import { Composition, Still } from "remotion";
import { FeatureSpotlight, type Shot } from "./compositions/formats/feature-spotlight";
import { FeatureImage, type Slide } from "./compositions/formats/feature-image";
import { FeaturePost, type Post } from "./compositions/formats/feature-post";
import { ASPECT_RATIOS } from "../aspect-ratios.mjs";
import { FilmComposition } from "./compositions/formats/film";
import { FILMS as DIRECTED } from "./films.generated";
import { VOICEOVER_FILMS } from "./voiceover-films.generated";
import { SituationCarouselSlide } from "./compositions/formats/situation-carousel";
import { CAROUSELS } from "./carousels.generated";
import { IllustrationGallery } from "./compositions/dev/illustration-gallery";
import { FindsPinStill } from "./compositions/formats/finds-pin";
import { FINDS_PINS } from "../pinterest/maple-main-finds";
import { findsPinId } from "../pinterest/finds-ids";
import DRAFTPACE_PINS from "../pinterest/draftpace/pins.generated.json";
import type { PinArt } from "./compositions/formats/finds-pin";

const FILMS = [...DIRECTED, ...VOICEOVER_FILMS];

// Every product's shot files. Static imports, not a glob: webpack needs to
// see each path literally, and this is a short, honest list of what's
// actually live rather than magic directory scanning.
import mmrSpotlight from "../shots/monthly-money-reset/feature-spotlight.shot.json";
import mmrCarousel from "../shots/monthly-money-reset/feature-carousel.shot.json";
import mmrPosts from "../shots/monthly-money-reset/feature-posts.json";
import pfcSpotlight from "../shots/personal-finance-companion/feature-spotlight.shot.json";
import pfcPosts from "../shots/personal-finance-companion/feature-posts.json";
import hmcSpotlight from "../shots/home-management-companion/feature-spotlight.shot.json";
import hmcPosts from "../shots/home-management-companion/feature-posts.json";
import plaSpotlight from "../shots/personal-life-affairs-companion/feature-spotlight.shot.json";
import plaPosts from "../shots/personal-life-affairs-companion/feature-posts.json";
import hscSpotlight from "../shots/homeschooling-companion/feature-spotlight.shot.json";
import hscPosts from "../shots/homeschooling-companion/feature-posts.json";
import alsSpotlight from "../shots/alongside/feature-spotlight.shot.json";
import alsPosts from "../shots/alongside/feature-posts.json";
import trvSpotlight from "../shots/travel-companion/feature-spotlight.shot.json";
import trvPosts from "../shots/travel-companion/feature-posts.json";
import vmcSpotlight from "../shots/vehicle-maintenance-companion/feature-spotlight.shot.json";
import vmcPosts from "../shots/vehicle-maintenance-companion/feature-posts.json";
import fhbSpotlight from "../shots/family-health-binder/feature-spotlight.shot.json";
import fhbPosts from "../shots/family-health-binder/feature-posts.json";

const ALL_SPOTLIGHTS = [
  mmrSpotlight, pfcSpotlight, hmcSpotlight, plaSpotlight, hscSpotlight, alsSpotlight, trvSpotlight, vmcSpotlight, fhbSpotlight,
] as unknown as Shot[];

const ALL_POSTS = [mmrPosts, pfcPosts, hmcPosts, plaPosts, hscPosts, alsPosts, trvPosts, vmcPosts, fhbPosts] as unknown as {
  id: string;
  posts: Post[];
}[];

const carousel = mmrCarousel as { id: string; slides: Slide[] };

// Posts are designed for a taller canvas (headline stack + UI element both
// need vertical room) — square is deliberately left out here, unlike the
// plain carousel slides.
const POST_RATIOS = ASPECT_RATIOS.filter((r) => r.name !== "square");

function spotlightCompositionId(shot: Shot) {
  // e.g. "monthly-money-reset" -> "MonthlyMoneyReset-FeatureSpotlight"
  const pascal = shot.product.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
  return `${pascal}-FeatureSpotlight`;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Every film the director planned (director/slate.json -> scripts/direct.mjs) and every voice-over cut (voiceover/ -> scripts/voiceover.mjs). */}
      {FILMS.map((film) => (
        <Composition
          key={film.id}
          id={`Film-${film.id}`}
          component={FilmComposition}
          durationInFrames={film.durationInFrames}
          fps={film.fps}
          width={film.width}
          height={film.height}
          defaultProps={{ film }}
        />
      ))}
      {ALL_SPOTLIGHTS.map((shot) => {
        const lastBeat = shot.beats[shot.beats.length - 1];
        const durationInFrames = lastBeat.startFrame + lastBeat.durationFrames;
        return (
          <Composition
            key={shot.product}
            id={spotlightCompositionId(shot)}
            component={FeatureSpotlight}
            durationInFrames={durationInFrames}
            fps={shot.fps}
            width={shot.width}
            height={shot.height}
            defaultProps={{ shot }}
          />
        );
      })}
      {/* One <Still> per slide x aspect ratio. A carousel is just every
          slide at one ratio; a single post is one slide at one ratio; a
          Pinterest pin is any slide at the "pinterest" ratio. */}
      {carousel.slides.map((slide) =>
        ASPECT_RATIOS.map((ratio) => (
          <Still
            key={`${slide.id}-${ratio.name}`}
            id={`Image-${slide.id}-${ratio.name}`}
            component={FeatureImage}
            width={ratio.width}
            height={ratio.height}
            defaultProps={{ slide }}
          />
        ))
      )}
      {/* The spot illustration set, per product palette: for review only. */}
      {["travel-companion", "monthly-money-reset", "vehicle-maintenance-companion"].map((product) => (
        <Still key={product} id={`Gallery-Illustrations-${product}`} component={IllustrationGallery} width={1960} height={1560} defaultProps={{ product }} />
      ))}
      {/* Maple & Main Finds pins (pinterest/maple-main-finds.ts), 2:3 at 1000x1500, rendered by scripts/render-finds-pins.mjs. */}
      {FINDS_PINS.map((pin, i) => (
        <Still key={i} id={findsPinId(FINDS_PINS, i)} component={FindsPinStill} width={1000} height={1500} defaultProps={{ pin }} />
      ))}
      {/* Draftpace's own pins, waves 2 to 5 (pinterest/draftpace-pins.ts), drawn by scripts/draftpace-pins.mjs --render. */}
      {(DRAFTPACE_PINS as unknown as (PinArt & { file: string })[]).map((pin) => (
        <Still key={pin.file} id={`Pin-dp-${pin.file.replace(/[/.]/g, "-")}`} component={FindsPinStill} width={1000} height={1500} defaultProps={{ pin: { ...pin, byline: "draftpace.com" } }} />
      ))}
      {/* Every situation carousel (scripts/carousels.mjs), one 4:5 still per slide: the size Instagram and Facebook show in full. */}
      {CAROUSELS.flatMap((carousel) =>
        carousel.slides.map((_, index) => (
          <Still
            key={`${carousel.id}-${index}`}
            id={`Carousel-${carousel.id}-${String(index + 1).padStart(2, "0")}`}
            component={SituationCarouselSlide}
            width={1080}
            height={1350}
            defaultProps={{ carousel, index }}
          />
        ))
      )}
      {/* Advertising-weight promotional posts, every product: one post per
          real problemsSolved entry. */}
      {ALL_POSTS.flatMap((file) =>
        file.posts.flatMap((post) =>
          POST_RATIOS.map((ratio) => (
            <Still
              key={`${post.id}-${ratio.name}`}
              id={`Post-${post.id}-${ratio.name}`}
              component={FeaturePost}
              width={ratio.width}
              height={ratio.height}
              defaultProps={{ post }}
            />
          ))
        )
      )}
    </>
  );
};
