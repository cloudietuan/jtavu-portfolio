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

## Resident agent, 9 November: supersedes dock-first scrolling and menu-first behavior
- User direction: Snoopy should be super interactive, his own agent, treating the website as his playground. Autonomy is now the default, not a menu action.
- Content is terrain, not an obstacle. snoopyTerrain.js turns real elements (canvas props, section headings, project images and thumbnails, statements, the contact line) into surfaces; he stands on their top edge and rides them as the page scrolls. He may stand in front of large pictures and small text, never over small controls.
- snoopyAgent.js is his mind: energy and curiosity drives plus a priority list. He strolls, hops, travels to new surfaces, watches and follows a nearby mouse cursor, walks to a project the visitor lingers on, naps after 45 idle seconds and wakes on any input. Authored local behavior, not an LLM.
- Visibility rule kept from 27 October: he must never go missing. If his surface scrolls away while the page is still moving, or no safe surface exists, he waits in the corner dock and hops back on when the page is quiet.
- Pause, reduced motion, nap and Keep Snoopy in his corner (session preference) all return the earlier predictable dock behavior. Menu tools still work and take priority; he re-lands afterwards. Arrow keys walk him along a surface or hop to another.
- Upward-scroll portal return applies only in corner mode. Do not reintroduce obstacle-avoidance relocation for the resident; add surfaces to TERRAIN instead.
- Variety, 10 November: user wants more animation so he does not repeat one movement. snoopyRoutines.js builds timed routines from existing sheet poses only (sit, lie down with a wink, look around, sniff, wave, cheer, play bow, chase tail) with randomized holds and pose variants plus procedural lean, lift and squash. The agent picks routines by mood (tired, calm, playful) and skips his last two. Jumps crouch, fly with a random airborne pose, and land in a crouch. Walk pace varies (amble, walk, trot). He waves at a newly arrived cursor at most every 25 seconds.
- User likes the doghouse intro; keep it as the entry point in every preview and build.
- Not available: new hand-drawn Snoopy frames. More distinct movement beyond the existing sheets would need an original character with its own full sprite set.

## Physical play and scroll animation, 10 November
- Moving parts: snoopyArticulation.js cuts the standing cel (walk frame 2) at the collar and around the tail, so the head tilts and the tail wags using only existing pixels. Idle he watches the cursor with his head and wags when energetic. New routines: curious (head tilts, ?), happy wag (♪), peek (looks over a ledge). Emote bubbles (! ? ♪ ♥ hi! oof whoa) mark moods.
- Physics: dragging and releasing throws him with the release speed (gravity, wall bounces, header bonk, floor bounce) until a surface catches him; a gentle drop falls straight down. Strolls sometimes head for a ledge with a lower surface beyond it, peek, and step off.
- Scrolling, at the user's request: he always animates while the page moves. On his surface he crouches with arms out and leans like riding it; when scrolling down lifts his surface to the top he steps off and falls, caught by surfaces rising into him; scrolling up hops him to a higher surface. In the corner during a scroll he trots in place. After a long scroll he looks around with a !.
- User does not want a white box around him in the corner. The dock has no card or caption, only a soft shadow at his feet.

## Site polish, 10 November
- User wants the overall site to look better. Done without new content: sections ease in on arrival (reduced motion off), website screenshots sit in a quiet browser frame, project rows tint on hover with a small preview zoom, footer enlarged for legibility, and baked-in browser scrollbars trimmed from the Sunset, Apparel, Maryvale, Science Fair and OncoSync screenshots.
- Open content questions for the user: "Room for what's next" repeats OncoSync; "Beyond work" promises film, photography and volleyball with no images; Berkeley roles are absent.

## Roller-blind intro exit, 11 November
- User wants the doghouse landing to leave like a window blind: on Explore it tugs down, then flies up and reveals the whole website. IntroBlind.jsx wraps the intro frame: tug about 60px, a short hold, then a fast lift (about one second in all), with a red hem bar and centre pull tab along the bottom. Visitors can also drag the tab down and let go to raise it. Replaying the intro from the header drops the blind back down with a small bounce. Reduced motion keeps the original fade.
- The intro's own .intro.reveal slide is disabled (homepage-src/src/styles.css and the built public/homepage CSS) so the doghouse rides up on the blind. The intro's 1.2-second enter message is ignored while the blind is lifting; the blind's own finish removes the intro.

## Sliding down the page, 12 November
- User wants Snoopy to slide down the page. A slide is a seated, friction-limited descent (flingStep with slide: gravity halved, speed capped, sideways drift fading, no bounces) with a quick sit-down plop, a lean back, speed lines above him and a "wheee" emote; it ends in a seated bump before he stands. It never lands back on the surface it started from.
- Scrolling down is now one continuous slide: when his surface nears or jumps past the top he slides down the screen, surfaces rising into him catch him (scroll-aware collision, surface positions refreshed every frame in flight), and he slides on again. At the bottom edge he waits seated for the next surface to scoop him, and hops up if the scroll stops. Downward exploring slides; upward exploring still jumps; ledges are half slides, half hops.
- Checked: full-page wheel scrolls at two speeds on desktop and phone keep him visible in every sample with no corner docking.

## Snoopy swings the blind, 12 November
- User wants Snoopy himself to swing the intro blind down. On Explore: the blind lifts up to 300px, Snoopy leaves the doghouse (intro .snoopy fades on .intro.reveal), leaps up from below the screen and grabs the pull tab ("hup!"), swings on it in the hanging action pose while his weight drags the blind down to about 150px, then lets go ("wheee!"): the blind snaps up and away and he is tossed into the air. The same moment's position and velocity are handed to the live companion (arrival prop), which carries the fall on and lands him on the site. About 2.4 seconds in all.
- Manual tab pulls and keyboard use keep the plain tug-and-raise; reduced motion keeps the fade.
- Variety, 12 November: the user wants the swing better and different each time. introSwing.js (pure, tested in tests/intro-blind.test.mjs at three screen sizes) holds three stunts, never the same twice in a row (sessionStorage): running leap (runs in along the revealed strip, crouches, leaps, pumps his legs to swing higher, lets go at a peak, sometimes with a somersault "ta-da!"), bungee (three ever-deeper bounces, "boing… BOING!", then flung high), and two tugs (the blind springs back and yanks him up, "whoa!", then a harder kicking pull, "got it!"). The pull tab swings with him; he is anchored by the hands while hanging and by the feet on the ground. All stunts keep him on screen and end in the companion handoff.

## Design pass, 12 November
- User asked for edits throughout the site to make it look a lot better. Added: red reading-progress line under the header and current-section highlight in the nav; pill filters; a slow ticker of words between the project list and the next section; "Still in the making" as a full-width warm ivory band; Beyond and About as two-column layouts (heading left, content right); Contact as a full-width doghouse-red closing band with white type and pill links. Palette stays white, ivory, black and red. No new content was invented.

## Snoopy as guide and site organisation, 12 November
- User wants Snoopy to act as a guide: tapping a project or topic gives quick context. SnoopyGuide.jsx shows "Snoopy's quick take": for a project, its number, tags, status, role, What it is, John's part and (if present) Where it stands, with Full story (the existing dialog), Take me there and Visit; for a filter topic, a one-line summary with a count and chips for its projects. All text comes from projects.js. Snoopy travels to the tapped project and stays beside it until the card closes (Escape, ×, or a tap elsewhere). Card sits beside him on wide screens and is a bottom sheet under 700px. Project images, titles, directory entries and filter pills open the quick take; "Project details" / "Explore project" still open the full story directly.
- Organisation: a numbered project directory (01 to 06) under the filters, the same numbers on each project's kicker, and the header nav reordered to match the page (Work, Beyond, About, Contact).

## Hero redesign, 12 November: supersedes the skewed collage layout
- User disliked how the CREATOR opening looked and asked for a redesign of my choosing. The hero (main.canvas.hero-v2) keeps CREATOR, the white canvas and the draggable objects, reorganised: copy on the left (name, Berkeley '30, Economics & Data Science kicker; the tagline; one line of what he makes; See the work and About John buttons); CREATOR straight and full width along the bottom; Sunset Nails and the two apparel pieces as matching white-framed cards standing on top of the word; the volleyball resting on it; camera and chrome in front at the ends; one quiet control line beneath. The clipped vertical JTAVU edge is removed. Sizes come from container units so the word always fits; phones hide the second apparel card.
- Apparel cards use crops of the existing apparel screenshot (apparel-front.jpg, apparel-back.jpg).
