import { clsx } from "@/lib/clsx";
import { ORIGIN, altitudeBand } from "@/lib/org";

/**
 * ORIGIN MAP — a small locator panel for the origin, sized to sit beside a
 * page header on a deep surface.
 *
 * WHAT THIS IS NOT. It is not a survey, and it deliberately does not imitate a
 * printed city-map poster. Those posters carry a drawn street network, centre
 * coordinates, elevation, area and population. For Amaro, `ORIGIN.geo` is
 * null — no coordinates are confirmed — and no area or population figure has
 * been supplied either. Drawing a street network, or printing a plausible
 * latitude, would be inventing a geographic record, which the trust rule
 * forbids as squarely as it forbids inventing a cupping score.
 *
 * So the graphic is an abstract highland contour motif, marked decorative and
 * hidden from the accessibility tree. It carries no geographic claim. Every
 * fact printed on the panel is read from `ORIGIN` and is already published
 * elsewhere on the site: the name, the zone, the country and the verified
 * altitude band.
 *
 * WHEN COORDINATES ARE CONFIRMED, set `ORIGIN.geo` and this panel can gain a
 * real locator — a true marker position and a printed latitude/longitude —
 * without any other page changing.
 */
export function OriginMap({ className }: { className?: string }) {
  return (
    <figure className={clsx("flex flex-col gap-5", className)}>
      {/* Decorative. The contours describe no surveyed terrain, so they carry
          no meaning for a screen reader and are hidden from it. */}
      <svg
        viewBox="0 0 320 300"
        aria-hidden="true"
        className="h-auto w-full overflow-visible"
      >
        <defs>
          {/* Fades the contour field out at the edges so the panel dissolves
              into the surface instead of sitting in an implied frame. */}
          <radialGradient id="origin-map-fade" cx="49%" cy="50%" r="64%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="58%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="origin-map-mask">
            <rect x="0" y="0" width="320" height="300" fill="url(#origin-map-fade)" />
          </mask>
        </defs>

        <g mask="url(#origin-map-mask)" fill="none" stroke="#F0E2CB">
          {/* Contour field: nested organic rings, opacity falling outward, so
              the eye reads highland relief without any road or boundary. */}
          <g strokeWidth="0.9">
            <path
              d="M184.8 150.0C184.9 151.9 184.7 154.1 184.0 156.0C183.3 157.8 182.0 159.7 180.6 161.3C179.2 162.9 177.3 164.4 175.4 165.7C173.5 166.9 171.3 168.1 169.0 168.8C166.7 169.5 164.1 169.9 161.7 170.0C159.3 170.0 156.8 169.5 154.5 169.0C152.3 168.4 150.2 167.6 148.2 166.8C146.1 166.0 144.1 165.3 142.1 164.3C140.1 163.3 137.9 162.3 136.2 160.9C134.5 159.5 132.8 157.8 131.8 156.0C130.8 154.2 130.3 152.0 130.2 150.0C130.1 148.0 130.6 145.8 131.4 143.9C132.2 142.0 133.4 140.0 135.0 138.5C136.5 136.9 138.6 135.5 140.8 134.5C142.9 133.5 145.4 132.9 147.7 132.4C150.0 131.9 152.3 131.7 154.6 131.4C156.9 131.2 159.2 130.9 161.5 131.0C163.9 131.0 166.4 131.2 168.7 131.8C170.9 132.4 173.2 133.4 175.1 134.6C177.0 135.8 178.5 137.4 179.8 139.1C181.2 140.7 182.3 142.4 183.1 144.3C183.9 146.1 184.6 148.1 184.8 150.0Z"
              strokeOpacity="0.500"
            />
            <path
              d="M204.3 150.0C204.2 153.3 203.2 156.9 201.7 160.0C200.1 163.1 197.6 166.0 195.1 168.6C192.5 171.2 189.6 173.5 186.5 175.6C183.3 177.7 180.0 179.8 176.3 181.2C172.5 182.5 168.3 183.5 164.2 183.7C160.2 183.9 155.9 183.2 152.0 182.4C148.2 181.6 144.6 180.2 141.1 178.9C137.5 177.6 134.1 176.3 130.7 174.6C127.3 172.9 123.6 171.0 120.8 168.6C118.0 166.2 115.3 163.3 113.7 160.1C112.0 157.0 111.2 153.4 111.0 150.0C110.8 146.6 111.3 142.9 112.6 139.6C113.9 136.3 115.9 132.9 118.6 130.3C121.4 127.6 125.2 125.4 128.9 123.8C132.6 122.2 137.0 121.5 140.9 120.8C144.8 120.1 148.6 119.9 152.4 119.5C156.2 119.2 159.9 118.6 163.8 118.5C167.7 118.5 172.1 118.4 176.0 119.3C179.9 120.1 184.0 121.6 187.4 123.6C190.7 125.5 193.7 128.1 196.2 130.9C198.6 133.6 200.7 136.7 202.0 139.9C203.4 143.1 204.3 146.7 204.3 150.0Z"
              strokeOpacity="0.433"
            />
            <path
              d="M224.7 150.0C224.2 154.8 221.9 159.8 219.2 164.0C216.4 168.2 212.2 171.8 208.4 175.3C204.6 178.7 200.7 181.7 196.4 184.6C192.2 187.5 187.9 190.6 183.0 192.7C178.0 194.8 172.3 196.5 166.7 197.2C161.1 197.8 155.0 197.2 149.5 196.4C143.9 195.5 138.6 193.8 133.4 192.1C128.2 190.3 123.0 188.4 118.2 185.8C113.4 183.3 108.5 180.3 104.8 176.7C101.0 173.1 97.9 168.7 95.9 164.2C93.9 159.8 92.9 154.8 92.7 150.0C92.5 145.2 92.9 140.1 94.6 135.5C96.2 130.9 98.9 126.0 102.6 122.2C106.4 118.5 111.8 115.3 117.1 113.2C122.4 111.0 128.7 110.2 134.2 109.3C139.7 108.4 144.9 108.2 150.2 107.7C155.5 107.2 160.6 106.3 166.1 106.2C171.6 106.1 177.6 105.9 183.2 106.9C188.9 107.9 194.8 109.8 199.8 112.4C204.7 115.0 209.4 118.5 213.2 122.3C216.9 126.2 220.3 130.7 222.2 135.3C224.2 139.9 225.2 145.2 224.7 150.0Z"
              strokeOpacity="0.367"
            />
            <path
              d="M245.8 150.0C244.7 156.2 240.7 162.7 236.6 168.0C232.5 173.3 226.3 177.5 221.1 181.6C216.0 185.8 210.9 189.2 205.6 192.8C200.2 196.4 195.2 200.3 189.2 203.2C183.1 206.1 176.1 208.8 169.1 210.0C162.0 211.3 154.2 211.3 146.8 210.7C139.4 210.1 132.0 208.6 124.9 206.5C117.8 204.5 110.4 201.9 104.2 198.4C98.0 194.9 91.9 190.3 87.6 185.3C83.3 180.3 80.3 174.1 78.4 168.2C76.5 162.3 76.0 156.1 76.0 150.0C76.0 143.9 76.4 137.6 78.3 131.8C80.3 125.9 83.2 119.6 87.7 114.8C92.2 109.9 99.0 105.7 105.6 102.8C112.2 99.9 120.2 98.7 127.2 97.4C134.3 96.1 141.0 95.8 147.9 95.0C154.7 94.3 161.4 93.2 168.5 93.1C175.6 93.0 183.3 93.0 190.6 94.3C197.8 95.7 205.4 98.2 212.0 101.4C218.6 104.7 225.0 109.0 230.1 113.8C235.3 118.7 240.3 124.5 242.9 130.6C245.5 136.6 246.8 143.8 245.8 150.0Z"
              strokeOpacity="0.300"
            />
            <path
              d="M266.4 150.0C264.9 157.7 259.4 165.7 254.0 172.0C248.6 178.3 240.4 183.2 233.9 188.0C227.3 192.8 221.0 196.7 214.6 200.9C208.1 205.1 202.3 209.8 195.1 213.3C187.9 216.9 179.8 220.4 171.3 222.3C162.8 224.3 153.4 225.1 144.2 225.1C134.9 225.0 125.1 224.1 115.8 222.0C106.6 219.9 96.6 216.9 88.8 212.3C81.0 207.7 73.7 201.3 69.0 194.6C64.4 187.9 62.3 179.7 60.9 172.2C59.6 164.8 60.3 157.3 60.8 150.0C61.4 142.7 62.1 135.5 64.4 128.6C66.7 121.6 69.6 114.1 74.6 108.2C79.7 102.3 87.1 96.9 94.7 93.0C102.3 89.1 111.5 87.0 119.9 85.0C128.3 82.9 136.7 81.7 145.2 80.6C153.8 79.5 162.4 78.2 171.2 78.3C180.1 78.3 189.6 79.0 198.4 81.1C207.1 83.1 215.9 86.6 223.9 90.7C231.8 94.8 239.7 99.9 246.2 105.8C252.7 111.7 259.4 118.6 262.7 126.0C266.1 133.4 267.8 142.3 266.4 150.0Z"
              strokeOpacity="0.233"
            />
            <path
              d="M285.0 150.0C283.4 159.0 277.0 168.4 270.8 175.8C264.5 183.3 254.9 189.1 247.2 194.7C239.5 200.4 232.1 205.0 224.5 209.9C216.9 214.7 209.8 219.9 201.3 224.0C192.9 228.1 183.5 232.0 173.6 234.5C163.6 237.0 152.7 238.6 141.6 239.2C130.4 239.7 118.1 239.8 106.6 237.7C95.2 235.7 82.2 232.4 72.7 226.8C63.1 221.3 54.5 212.8 49.5 204.4C44.6 195.9 43.6 185.4 43.2 176.3C42.7 167.2 45.1 158.4 46.6 150.0C48.1 141.6 49.5 133.7 52.3 125.8C55.2 117.9 58.2 109.6 63.6 102.7C69.0 95.7 76.7 89.3 84.9 84.2C93.0 79.1 102.8 75.4 112.4 72.1C121.9 68.7 131.8 65.9 142.2 64.1C152.5 62.2 163.6 60.5 174.4 60.9C185.2 61.3 196.7 63.2 206.9 66.4C217.1 69.6 226.7 74.7 235.7 80.1C244.6 85.4 253.3 91.5 260.7 98.5C268.2 105.5 276.2 113.4 280.3 122.0C284.3 130.6 286.6 141.0 285.0 150.0Z"
              strokeOpacity="0.167"
            />
            <path
              d="M300.3 150.0C298.8 160.1 292.4 170.7 286.0 179.3C279.5 188.0 269.8 195.0 261.5 201.9C253.2 208.8 245.1 214.7 236.3 220.5C227.5 226.3 218.8 232.1 208.7 236.6C198.7 241.2 187.6 244.8 176.0 247.5C164.4 250.2 152.1 252.0 139.0 252.9C126.0 253.8 111.5 254.7 97.8 252.7C84.2 250.7 68.2 247.4 57.0 240.9C45.7 234.5 35.5 224.1 30.2 214.0C25.0 204.0 24.9 191.1 25.2 180.4C25.5 169.7 29.6 159.5 32.3 150.0C34.9 140.5 37.4 131.9 41.0 123.2C44.7 114.5 48.2 105.7 54.1 97.9C59.9 90.1 67.7 82.7 76.1 76.3C84.6 69.8 94.4 64.2 104.8 59.2C115.3 54.1 126.6 48.8 138.8 45.8C151.0 42.7 165.1 40.2 178.1 40.9C191.1 41.6 205.0 45.2 216.6 50.0C228.2 54.7 238.2 62.2 247.8 69.2C257.3 76.2 266.0 83.7 273.8 92.0C281.6 100.2 290.2 109.0 294.6 118.7C299.0 128.4 301.7 139.9 300.3 150.0Z"
              strokeOpacity="0.100"
            />
          </g>

          {/* The high point of the contour field. Deliberately a plain mark and
              not a map pin or crosshair: it is not plotted against a
              coordinate, so it must not borrow the vocabulary of one. */}
          <circle cx="158" cy="150" r="8" strokeOpacity="0.45" strokeWidth="0.9" />
          <circle cx="158" cy="150" r="3.2" fill="#F0E2CB" stroke="none" />
        </g>
      </svg>

      <figcaption className="flex flex-col gap-2">
        <span className="font-display text-[1.75rem] leading-none tracking-[0.02em] text-alabaster">
          {ORIGIN.name}
        </span>
        <span className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]">
          {ORIGIN.zone} · {ORIGIN.country}
        </span>
        <span
          data-numeric
          className="mt-1 font-sans text-[0.8125rem] text-[#cfd9d6]"
        >
          {altitudeBand()} masl
        </span>
      </figcaption>
    </figure>
  );
}
