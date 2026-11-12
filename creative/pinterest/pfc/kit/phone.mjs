/**
 * A phone showing a strip of a REAL app screenshot. Nothing is redrawn:
 * the screenshot is placed as it is (390 px wide captures) and `y0`..`y1`
 * pick which part of it shows, in the capture's own pixels. Crop above the
 * Next.js dev badge and the tab bar (kids/workspace: y < 780; record: the
 * card regions the idea names).
 *
 *   phone({ src: screen("workspace"), y0: 60, y1: 780, width: 470, tilt: 8 })
 *
 * `closed: false` (default) leaves the bottom open so the layout can bleed
 * the phone off the page or hide its foot behind a band; `closed: true`
 * rounds the bottom off for a whole phone.
 */
export function phone({ src, y0, y1, width = 470, tilt = 0, closed = false, x = 0, y = 0, shadow = true, bezel = "#1b1820", appBg = "#f4f2ee", id = "ph" }) {
  const k = width / 390;
  const screenH = Math.round((y1 - y0) * k);
  const b = 15; // bezel
  const strip = 46; // status strip with the island, in the app's own background colour
  const w = width + b * 2;
  const h = screenH + strip + b * 2;
  const r = 66;
  return `
  <div class="${id}" data-check="phone" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${tilt}deg);transform-origin:50% 100%;${shadow ? "filter:drop-shadow(0 38px 54px rgba(10,5,14,.5)) drop-shadow(0 6px 10px rgba(10,5,14,.35));" : ""}">
    <div style="position:absolute;inset:0;background:${bezel};border-radius:${r}px ${r}px ${closed ? r : 0}px ${closed ? r : 0}px;box-shadow:inset 0 0 0 2px #3a3540,inset 0 0 0 5px #0e0c11"></div>
    <div style="position:absolute;left:${w - 2}px;top:${Math.round(h * 0.2)}px;width:5px;height:84px;background:#2c2832;border-radius:0 3px 3px 0"></div>
    <div style="position:absolute;left:-3px;top:${Math.round(h * 0.16)}px;width:5px;height:56px;background:#2c2832;border-radius:3px 0 0 3px"></div>
    <div style="position:absolute;left:-3px;top:${Math.round(h * 0.16) + 74}px;width:5px;height:56px;background:#2c2832;border-radius:3px 0 0 3px"></div>
    <div style="position:absolute;left:${b}px;top:${b}px;width:${width}px;height:${strip + screenH}px;border-radius:${r - b}px ${r - b}px ${closed ? r - b : 0}px ${closed ? r - b : 0}px;overflow:hidden;background:${appBg}">
      <div style="height:${strip}px;position:relative"><div style="position:absolute;left:50%;top:13px;width:116px;height:30px;margin-left:-58px;border-radius:20px;background:#0b0a0d"></div></div>
      <div style="position:relative;width:${width}px;height:${screenH}px;overflow:hidden"><img src="${src}" style="position:absolute;left:0;top:${-Math.round(y0 * k)}px;width:${width}px;height:auto;display:block" alt=""></div>
    </div>
  </div>`;
}
