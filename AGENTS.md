# Prototype Instructions

Dragging Snoopy must track the held pointer directly, retaining the grab offset and allowing him across content while held. Clamp to viewport, then choose a clear resting position on release. Keep grab/grabbing cursor and a raised shadow; a short click still opens controls. Do not apply obstacle avoidance mid-drag.

## Snoopy usability refinement, 16 October
- Stable header Snoopy button opens a fixed compact control panel, with project guide/ball/camera as the three main actions. Other tricks live under More things to try. Clear Resume/Wake states replace unexplained disabled menus; Escape restores opener focus.
- Ordinary background clicks and project hovers do not summon/chase Snoopy. Idle wandering and automatic down-scroll performances are quiet; explicit tools still work. Preserve the three-second upward-scroll portal return and original doghouse intro.

## Snoopy playground expansion
- Game-informed actions follow notice/preparation/contact/recovery. Real authored page landmarks offer inspect/camera verbs; only the actual volleyball offers ball play. Keep ordinary project navigation intact.
- New generated transparent action sheet adds hanging, climbing, camera-holding and crouched landing poses. Preserve original walking/sleep/wake defaults. This is a pose set with procedural motion, not a full frame-by-frame action animation set.
- Hero Snoopy’s tools opens the companion menu. Explore this page, Take a photo and Play ball operate on actual visible elements; camera is a temporary framing moment, not a saved image export.
- Use safe margins/above/below stations and camera viewing positions; blocked walking routes to an explicit station may use a brief fade/portal arrival at the clear target. Keep the separate upward-scroll three-second return rule unchanged.

Upward scrolling should pass Snoopy instead of having him chase immediately. After three seconds without further scrolling he returns from the bottom through a small red portal. Further scrolling restarts the wait; user interaction cancels it. Stay, nap, menus and reduced motion suppress the effect.

Snoopy playground direction: user wants a highly animated, capable character that treats the website as his playground, with expanding skills and swing-down movement. Current local skill selector reads scroll distance, idle time and visible projects; user controls retain priority. Preserve the original character and white/red portfolio.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Creator canvas demo
- Main display word is CREATOR, selected by the user. Warm ivory, black, doghouse red.
- Separate experimental canvas; preserve original JTAVU homepage and intro.
- Real project screenshots and existing pixel Snoopy sprite. Objects move; projects open details; Snoopy introduces an additional project.
- Active canvas background uses supplied Thomas Lefebvre blurred-color photograph, warmed and lightened with a cream base so black CREATOR stays clear. Keep all accent colors red. Preserve current layout, projects, objects, and interactions when changing this background.
- Color refinement: retain richer photographic colors; replace the dark brown/oxblood patch with the photograph's middle orange. Use warm-blur-orange.png at 88% opacity instead of washing out the whole background.
- Latest direction: return active Creator canvas to white; disable photographic background. Retain red accents, existing layout and interactions.
- Scroll website: preserve white CREATOR canvas as opening. Canvas project objects scroll to project chapters; Work/About/Beyond Work/Contact navigation uses same-page anchors.
- Selected work uses All, Websites, Design, Research with overlapping project tags. Two supplied project previews get large chapters; remaining real projects use a compact index. No invented process images, outcomes, or film portfolio entries.
- Connected entry flow: root URL opens preserved JTAVU doghouse introduction; Snoopy wake and Explore reveal the Creator canvas and scroll portfolio. Header JTAVU replays homepage. Direct section hash URLs skip intro. Intro is bundled as an isolated same-origin frame to preserve its original styling and animation without affecting the canvas.
- Snoopy is a persistent interactive companion after the doghouse intro: follows open-space clicks, reacts to project hover and scroll chapters, draggable, arrow-key movable, pet/tour/stay/nap menu. Reuse existing pixel sprite and movement physics. Pause companion while project dialog is open; keep controls unobstructed; respect reduced motion and touch scrolling.
- Snoopy QA: protect readable headings as well as controls, freeze menu/stay motion immediately, retain position across dialogs, restore keyboard focus, constrain popover to available viewport height. Project details have their own clickable contextual Snoopy while global companion pauses.
- Scroll companion tools: Snoopy catches up after scrolling; larger downward scrolls can trigger a ladder climb through clear space. His menu includes Climb over here and Help build. Use the generated red ladder and hammer assets; hammer accompanies the real Science Fair Club addition. Stop tools for menu, drag, sleep, Stay, resize and reduced motion. Preserve the white canvas and connected doghouse.

## Team integration, 15 October 2026
- Preserve white/red canvas and doghouse. Compact sticky navigation includes direct Canvas access and an accessible Skip to work path.
- Use verified public content: John Vu, Berkeley '30, Economics & Data Science; contact mailto:cloudietuan@gmail.com and https://jtavu.com/resume. Legacy /contact and /about are not registered routes.
- Six project roles/statuses and structured story copy live in projects.js. OncoSync is in development, Maryvale is a proposal, Biology is educational. Four compact archived previews supplement approved Sunset/Apparel artwork; screenshot metrics do not establish verified results.
- Curated expandable experience groups link the full archive; do not flatten every achievement into the homepage.
- Snoopy pause is controlled by the page and persisted only within the session. All autonomous effects yield to pause/reduced motion/direct interaction. Pure snoopyPortal.js owns the exact3sec deadline; full entry strip must be safe before return. Show me a project derives all six entries from projectList.

## Character performance, 22 October 2026
- User wants Snoopy to feel like his own interactive character living within the website. Preserve doghouse entry and white/red portfolio.
- Companion performance has a separate inner animation layer: quiet breathing, pickup lean, landing squash/recovery, greeting bounce, explicit happy dance, pet hearts. User input cancels performances; pause/reduced motion suppress autonomous effects.
- More things to try includes Surprise me: a local context rule chooses the actual visible ball, a visible project camera moment, or a dance. This is authored behavior, not an LLM or self-learning system.

## Ongoing Snoopy character goal, 22 October
- Active user goal: a capable resident character with smooth scrolling and cartoon-inspired movement, local environmental awareness, reusable tools, and polished interruption/recovery.
- Scroll follow now uses document-relative passage in both directions, followed by one portal return three seconds after scrolling stops. Avoid position correction/chasing while the page is moving. If no clear entry strip exists, wait and recheck instead of snapping elsewhere.

## Verified character skills and return behavior, 23 October
- Skill timing lives in snoopySkills.js: preparation, action/contact, recovery on one monotonic clock. Climbing follows the validated corridor directly; generated poses retain the existing character's appearance.
- A crowded bottom edge may use an in-place portal in a clear pocket. It unfolds upward from its floor without crossing text. Three-second scroll quiet time is unchanged; full-page obstruction may postpone entry.
- Plan world actions without treating Snoopy's own control panel as scenery. Tool image loads must never invalidate/cancel their own action; invalidate only actual portfolio/canvas layout images.
- Use less animation is a session preference combined with the device's reduced-motion setting. Disable animated tools, breathing and reactions; keep the project guide available. No collision-solving relocation during reduced-motion scrolling.
- Help build waits for navigation to the opening canvas to settle, then uses the hammer and reveals the real Science Fair Club addition.
- Pause/resume/nap state changes keep useful keyboard focus. Escape works from the whole open panel and returns focus to its opener. Pause, direct input, scroll, dialogs and reduced motion cancel obsolete activity.

## Visibility correction, 27 October — supersedes downward-scroll passage
- User reports Snoopy missing and scroll behavior buggy; previous completion checks did not establish the desired experience.
- During downward reading, keep Snoopy visibly in a stable corner dock. Do not send him offscreen or hide him because no free page pocket exists. Upward passage retains the explicit three-second portal return.
- Resting or interrupted/offscreen companions fall back to a visible dock. Paused/reduced motion use that same predictable rest location. A Bring Snoopy here action explicitly recovers him.
- Reserve a desktop reading gutter and end-of-page space so the persistent character does not cover project actions. Dock remains draggable; the original doghouse entry stays intact.
- The existing four action poses are still not a complete connected character animation set. Do not equate passing movement tests with fulfilling the user's cartoon animation vision.

## Additional character moves, 27 October
- User requests more animations/capabilities. Quick tricks now expose Hop, Zoomies and Take a bow directly in the panel, not under the extended tool list.
- snoopyMoves.js plans bounded moves and samples the shared skill clock. Hop uses crouch/takeoff/landing poses and an actual vertical arc; Zoomies uses the existing eight walking frames along a clear out-and-back runway. When space is tight, stay visible and use a small in-place performance with explanatory speech. Bow stays rooted and accompanies petting hearts.
- New moves must respect reduced motion/pause/nap, yield immediately to scrolling/dragging/menu input, and restore the dock when started there. Keep the downward visibility correction intact. This extends existing artwork with animated sequences; it is not a newly hand-drawn full cartoon sheet.

## Articulated cartoon gestures, 27 October
- User wants actual cartoon body acting, including moving paws and bending into a bow, rather than transforming a single static image.
- Take a bow now uses a jointed canvas renderer: original face/ear cel, planted original feet, rotating torso/neck, presenting paw and far paw behind the back. snoopyBow.js owns the flourish/dip/hold/return timing. Preserve the character likeness; future gestures should articulate body parts rather than substitute whole-image tilting for acting.
