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

## Awwwards-inspired pass, 12 November
- User asked to look at Awwwards for ideas. Only listing pages and category names were readable (portfolio honors, and element categories such as mouse interaction, microinteractions, transitions, typography, footer design), so these are common award-site patterns, not copies of any one site: a cursor ring that trails the real cursor and labels the action (Drag, Quick take, Toss, Pull); a preview image that follows the pointer over project directory entries; buttons that lean toward the pointer; headings that rise from behind a mask; the hero copy and cards assembling after the intro leaves; and a large footer with an outlined JTAVU wordmark (Snoopy can stand on it) and Berkeley local time. Mouse-only effects are off on touch and under reduced motion; the system cursor is never hidden.

## Calm luxury direction, 12 November: supersedes "autonomy by default" for idle behaviour
- User wants a luxury website with Snoopy as a huge interactive part, without it becoming a game. Agreed principle: the site whispers, Snoopy performs. He is the host of a quiet gallery.
- Snoopy is a calm host by default (session flag jtavu-snoopy-playful, off): quiet routines only (sit, lie down, look around, curious, occasional wag), rests about three times longer, rarely travels, never hops, trots or cheers on his own, does not chase the cursor, and shows only ? ! hi! ♥ emotes as plain italic marks. He still comes to a tapped project, still can be thrown, and still slides when the page scrolls. "Let Snoopy play" in his panel restores the full playful resident; the panel hides the trick lists until then.
- His big moments: the doghouse and blind stunt; the quick-take guide; the full story, which now drops like the blind with Snoopy riding the pull tab and ends in a Next project link (the guide card also has Next); and a farewell wave with "That's the tour. Say hello to John." when the contact band first arrives.
- Decoration trimmed: word ticker removed, cursor ring has no text labels, more white space around each project. No points, collectibles, unlocks or sound.

## Comic-strip redesign, 12 November: supersedes the calm luxury direction
- User rejected the calm look and the fonts, wants a creative site, wants all numbering removed because it reads as AI-made, and wants the existing words kept. They left the look to me: comic strip (src/comic.css, loaded after styles.css). Thick ink outlines, hard offset shadows that press in on click, yellow and blue caption boxes for labels, halftone dots, cream paper, red plus yellow and sky blue. Fonts: Bowlby One (CREATOR and big headings), Lilita One (titles), Gochi Hand (labels, captions, Snoopy's speech), Nunito (body). No italics-serif pairing.
- No numbering anywhere: section labels, project kickers, directory, guide card and full story carry no 01/02 numbers. Do not reintroduce numbered labels.
- Snoopy is playful by default again (jtavu-snoopy-playful defaults on); the quiet host is the opt-out in his panel.
- Matching pixels: SnoopySprite redraws every pose on one shared 96-cell pixel grid with one palette (ink, cream, collar red), so the walk, wake and action sheets render identically. This re-samples existing art only.
- New routines from existing poses: nod, head shake, dance, stretch, spin.

## Animated pixel cursor, 12 November: supersedes the cursor ring
- User asked to remove the circle around the cursor and use an animated cursor instead. CursorFx.jsx now hides the system cursor for mouse users and draws an original 12 x 17 pixel arrow (ink outline, cream fill) that follows the pointer directly with no lag. States: yellow fill and a tilt over links and buttons, red fill and a wiggle over draggable things (canvas props, Snoopy, the blind's pull tab), a squash plus a burst of red, yellow and ink pixel sparks on click, a short pixel trail when moving fast, and a gentle bob after 2 seconds still. Text fields keep the text cursor. Touch screens and reduced motion keep the normal system cursor. No cursor ring anywhere.
- Fix, 12 November: the pixel cursor vanished inside the project dialog (modal dialogs render in the browser top layer, above any z-index, while the system cursor was hidden). The cursor now lives in a manual popover that re-raises itself whenever a dialog opens; if that is unsupported, the system cursor returns while a dialog is open. The doghouse intro frame keeps the normal system cursor.

## Matching sleep, connected wake-up, zoom stunt, sizes, content, 12 November evening
- Sleeping art now matches standing: the big close-up sleeping face (snoopy-sleep-door.png) is no longer used. Sleep uses the wake sheet's own eyes-closed frames 0 to 2, on the same 96-cell pixel grid and palette, in the intro and in Snoopy's site naps.
- Wake-up is one sprite from asleep to standing: the intro draws Snoopy only with the .snoopy sprite (nothing inside the doghouse SVG, which stretched him). Wake frames are scaled by 1.1 so his head matches the walk sheet when he stands, feet are planted on a smooth path (WAKE_GROUND/wakeShift) so he does not jitter sideways, each new pose gets a tiny squash and settle, and the timing eases through one continuous push up.
- Blind stunt (introSwing.js): every pull opens the same way at the user's request. He runs and zooms off the right side of the landing screen (from where he stood), the blind lifts, he pops up from the bottom near the right edge, zooms along the bottom to the tab with speed lines, leaps and grabs it. The pull still varies (pumping swing, bungee, two tugs), never the same twice in a row.
- Size: Snoopy on the site, and in the stunt, uses the landing screen's size (snoopySize.js: 0.409 of the JTAVU wordmark font). Phones keep a 64px floor because the landing Snoopy is very small there.
- Ear fix: the head cut for nods steps down around the ear (EAR_POCKET), so no piece of ear stays behind.
- New routines: catNap (lies down, dozes with z, blinks awake) and doubleTake.
- Content, at the user's request (minimal, his voice, highlight the best, LinkedIn as sections): new Highlights (ISEF Finalist, eight years at Sunset Nails, Bayu Consulting co-founder, Golden Summit), What I can do for you (three offers with proof chips), and Experience built from his public LinkedIn grouped as Now at Berkeley, Business, Research and awards, Teaching and service, Off the clock. Removed "Room for what's next" (repeated OncoSync) and "Beyond work" (no images). Nav: Canvas, Work, Experience, About, Contact. Hero: "Brands, websites and research." Work-email from LinkedIn is not published. Content lives in src/experience.js; nothing invented.
- User decision: do not add projects that are not on LinkedIn (VolleyTrack Pro, Cue, GUSTAV and so on); he has not done enough on them yet.

## Clearer Snoopy, stretch-then-stand wake-up, flashier site, 12 November night
- User found Snoopy unclear and weird. Cause: the 96-cell pixel grid was too coarse for his face. PIXEL_GRID is now 192 in both sprites: same three-colour palette and pixel look, clean eyes and smile.
- User disliked the sit-up wake animation and chose "stretch then stand": asleep, blinks, eyes open, a long play-bow stretch (CSS stretch on frame 6), crouch, then the standing pose with a shake (CSS wobble). No per-frame squash. Paws are centred on every frame, clamped so wide lying frames stay on the canvas.
- User wants the site a bit flashier: CREATOR letters bounce in after the intro and jump on hover; two rotated comic word bands (yellow and red) scroll sideways between sections; section headings slam in; highlight and offer cards tilt toward the mouse with a glossy highlight; buttons get a shine sweep. Bands use contain:paint and the page clips sideways overflow. All off under reduced motion; tilt is mouse only.

## Live status and jump menu, 12 November late night
- User saw a demo page of four homepage features (physics playground, spotlight cursor, live status, command menu; artifact "JTAVU homepage feature demos") and chose live status and command menu.
- LiveStatus.jsx: "Right now:" line in the hero under the tagline, with a blinking pixel dot and a flip-in for each fact; a compact yellow pill in the header (hidden under 1100px). Facts live in experience.js (nowStatus) and must stay things John is actually doing. Screen readers get the full list once.
- CommandMenu.jsx: K (or Cmd/Ctrl+K, or the yellow Jump button in the header) opens a comic jump menu. Groups: Projects (all from projectList; scrolls the project to centre, re-aims after lazy images shift the layout, then Snoopy runs over with his quick take via a pointer-style click so the card does not steal focus), Go to (sections), Say hi (email, LinkedIn, résumé), Snoopy (dance, spin, wave, cheer, cat nap, double take, his menu, replay the intro). Snoopy tricks use a new companion command, {command:'routine', routine, say}. Arrow keys, Enter, Escape; focus returns to the opener.
- Physics playground and spotlight cursor were not chosen; do not add them unless asked.

## Grounded and realistic Snoopy, better run, resources, tighter and phone-friendly, 13 November
- User saw gaps between Snoopy and what he stands on, especially asleep, and said a dog his size cannot sleep on a volleyball. Fixes: every pose is drawn flush with the bottom of his box (anchor 383 of 384, was 376); surfaces are the visible top, not the element box: prop images use their measured transparent padding (camera 26%, chrome 16%, ball 8%), text uses the top of its capital letters, tilted cards use their slanted edge (tiltedSurface, slope followed while he walks). Jumps aim at the same visible surface. The volleyball is no longer a surface (.canvas .object:not(.ball)).
- Realism (from character-animation guidance: contact shadow, landing compression scaled to fall height, dust, settle): a contact shadow on the surface under him that shrinks and fades as he rises; pixel dust and a deeper, longer squash on harder landings. He only lies down (lieDown, catNap) on surfaces at least 1.4 body widths wide; sleepy on a narrow ledge he travels somewhere roomy first.
- Landing run: a ready beat ("!", rock back, crouch), stride-synced legs (one eight-frame stride per 1.4 body widths, so feet do not slide), a bob on every step, a stronger lean as he speeds up, and dust from his feet; dust when he lands from the pop-up.
- Resources: experience items carry real links (Bayu Instagram, Sunset Nails site and case study, Hinksey supporting research, ISEF to OncoSync and Science Fair Club, Golden Summit event page, team Instagram and apparel); highlights link to OncoSync and Bayu's Instagram. Golden Summit added under Leadership and service.
- Spacing tightened (sections 72px top instead of 110 to 170px). Phones: highlights and offers are swipe rows, the project directory is a swipe row of chips, Experience groups collapse (first open), smaller paddings. Phone page about 8,700px tall instead of 13,000px.
- Phones: Snoopy roams. He was stuck because draggable hero cards counted as controls to avoid (all spots blocked when they overlap on a small screen) and visited surfaces were never revisited; canvas objects are no longer controls, and he revisits surfaces once all nearby ones have been seen.

## Comic WOW pass, Bayu, Paletté and richer experience, 13 November afternoon
- User wants components with more substance and comic WOW factor, and fonts that match. Fonts now: Bangers for headlines, section titles, word bands and sound effects; Luckiest Guy for titles and the CREATOR word (wide enough to span the hero; size is --word × 1.3 and --top is base + word × .98 so the cards and ball stand on its top edge); Comic Neue for body (bold for paragraph copy); Gochi Hand stays for captions.
- WOW effects: starburst sound effects beside the main section headings (WOW!, POW!, ZAP!, BAM!) that pop in on reveal and shake on hover; a burst per Experience group (NEW!, KA-CHING!, WIN!, BAM!, WOW!); ComicPops.jsx pops a random sound effect where any button or link is clicked or tapped (not on Snoopy, the jump menu or hero props; off under reduced motion); action lines burst behind highlight and offer cards on hover; halftone dots on highlight cards; Experience groups are tilted comic panels on desktop; award items carry round badge stickers (FINALIST, 3X, LAB, AP, 3RD, $40K, 200+, 400, 90+ HRS, C, ♪) and AZSEF results show as chips.
- Bayu Consulting is a project (screenshot rendered from the cloudietuan/bayuconsulting repo's index.html, public/assets/bayu-preview.jpg). Live site: https://bayuconsulting.lovable.app/ (given by the user).
- Paletté partnerships email john.vu@team.paletteboutiques.com is published at the user's request (Paletté experience item and the contact band).
- Experience rewritten with real details from LinkedIn and what the user has told me: Research and awards (ISEF team solar tracker, AZSEF three years, ASU engineering internship from the solar car, AP Research capstone, We the People, UA scholarship), Leadership and service (Golden Summit lead organizer, Science Fair Club founder with 400 members, Business Club co-founder, Vietnam food outreach and documentary, English tutoring, junior golf), Off the clock (varsity captain and libero, @gcamensvolleyball with 30K peak profile views, coaching, RSF intramurals; Redline media and photography; tenor section leader and GCA Pops 2026 co-host). Cal Baseball media team intern added under Now at Berkeley.
- VolleyTrack Pro was made with Claude (a January 2026 chat: product blueprint, addendum and a 12-screen React prototype). It is a project of kind blueprint with no public link (url null hides Visit buttons); its preview is a comic title card made from real facts (public/assets/volleytrack-preview.jpg), not a fake screenshot. This supersedes the earlier decision to leave VolleyTrack off.

## Stories by kind of work, 13 November
- User wants each kind of work to be interesting to read as his story. Projects carry a kind (projects.js KINDS): web (LIVE SITE!), design (WEAR IT!), lab for research (EUREKA!), blueprint for prototypes (PROTOTYPE!). Project cards wear the stamp and a matching background (graph paper for research, blueprint grid for prototypes).
- The full story dialog is a four-panel comic strip (ComicStrip.jsx): The idea, My part, What I made, Where it stands, using only the project's own fields, each panel with a sound effect from its kind. Panels look like browser windows for websites, taped sketches for design, graph paper for research and blueprints for prototypes. Two columns on desktop, one on phones.

## Cleaner card hover, 13 November

- John disliked the highlight and service card hover. Removed the action-line burst, the glare sweep and the pointer-driven 3D tilt (the tilt `useEffect` in `ScrollPortfolio.jsx` is gone).
- Hover is now a plain comic lift: the card nudges up and left and its ink shadow deepens. Reduced motion keeps the shadow change only.

## A page for every activity, 13 November
- User wants a page for each activity and nothing linking back to jtavu.com. Every Experience item now has its own comic page at #/a/<slug> (src/activities.js builds the list and slugs from experience.js; src/ActivityPage.jsx renders it): a dotted cover with the group tag and burst, the name, a role and date caption and the item's badge as a starburst; the story as comic panels, one per sentence; AZSEF-style chips as "The scoreboard"; the related project (from a #project-x link) with its screenshot and a link into Work; outside links (Bayu site, Instagram, Sunset Nails site, Paletté email); "More in <group>"; and Previous and Next pages that wrap around. Content is only what experience.js and projects.js already say.
- A résumé page at #/resume lists every group and role, links each to its page, and prints cleanly (Print or save as PDF). The contact Résumé link and the jump menu's résumé go there.
- Experience items link their name and a "Read the story" link to their page. The jump menu has an Activities group. Header nav, Canvas and Go to commands from a page return to the main site and scroll to the section; browser Back works.
- Removed every jtavu.com link: Golden Summit highlight goes to its page, Hinksey links to the Sunset Nails project, Sunset's supporting research goes to the Hinksey page, Maryvale's goes to the AP Research page, OncoSync's roadmap link is gone, and the dialog fallback goes to Experience. tests/activity-pages.test.mjs fails if a jtavu.com link comes back.
- The old site-wide h1 and header rules (giant tilted CREATOR, 75px flex header) are reset inside .activity-page.
- JTAVU Apparel still links to its own site, jtavu.lovable.app; ask before changing that.

## Choir reel, 13 November
- User asked to add the video of him singing from jtavu.com. It is the site's choir performance reel (jtavu.com/assets/choir-reel-BpMEyZXN.mp4, 44 s, 720 x 748), now copied into this repo as public/assets/choir-reel.mp4 (faststart) with a poster frame, so nothing streams from jtavu.com.
- It plays on the Advanced Vocal Ensemble page in a "Watch it / PLAY!" panel (experience items can carry a video: src, poster, caption; ActivityPage renders it with controls, preload none). The Experience list links to it with "Watch me sing".
- The vocal ensemble item now uses the facts from his own jtavu.com write-up: auditioned ensemble, section leading by singing side by side, Superior with Distinction at multiple competitions, Jazz MPA at NAU, festivals at Disney and in Hawaii, 9th to 12th grade, plus the GCA Pops 2026 co-host. The caption does not say which singer he is (not known).

## Contact email, 13 November: supersedes cloudietuan@gmail.com
- User chose jtavu9@gmail.com as the site's contact email (contact band, offers, about, résumé page, jump menu). Earlier notes that mention cloudietuan@gmail.com are out of date. The Paletté partnerships email stays on the Paletté item.

## Awwwards Sites of the Year pass, 15 November
- User asked for inspiration from awwwards.com/websites/sites_of_the_year. Read the winners list (31 sites) and landonorris.com's content: Message from Lando with a signature, On track / Off track split, Helmets Hall of Fame, dated photo captions, Next race module. Bruno Simon's portfolio (drive around a world) and Messenger (play a character) inspired the town. Heavy WebGL (Lusion, Igloo) was rejected as slow on phones and off-style.
- User chose four: (1) A message from John: his LinkedIn About story in a comic speech bubble beside his real photo, signed in handwriting that writes itself in (StorySections.jsx MessageFromJohn, in the About section). (2) Experience behind two doors, On the clock (work, research, leadership) and Off the clock (volleyball, singing, photos), as accessible tabs with counts (ExperienceDoors; the jtavu:experience-door event opens a door). (3) Hall of Fame (HallOfFame.jsx, #hall, after Experience): real posters and awards as tilted taped frames with plaques, All/Posters/Awards filters, a full-size viewer dialog; activity pages show their own frames as "The proof" (hall.js maps items to activity slugs). (4) The town (TownMap.jsx, #town, right after the hero): original comic buildings for Work, Hall of Fame, On the clock, Off the clock and Say hi; tapping one drives a red car there (0.9 s), pops the door, then scrolls in, re-aiming after lazy images move the layout. Arrow keys move between buildings. Building signs and frames are Snoopy terrain.
- Images are copied from his old jtavu.com into public/assets/hall (full and -sm sizes): profile photo; solar tracker, piezo keyboard and solar car posters; AP Research inquiry proposal; Sunset Nails BusinessRate Top 5 2026; Hinksey Labs certificate; NHS; Most Improved Musician 2024; volleyball peer award ("Most likely to start a fish fight club") and varsity certificate; Class of 2026 "most likely to own their own business"; two Kroger Zero Hero certificates. jtavu.com called the Kroger ones President's Volunteer Service Awards, but the images say Kroger Zero Hero (8+ and 20+ hours), so they are labelled as shown. jtavu.com's "Golden Summit poster" is a generic auditorium photo and is not used. The Golden Summit recap video (2 min, real event footage) is compressed to public/assets/golden-summit.mp4 and plays on the Golden Summit page.
- Placeholder photos, at the user's request: activity pages with no real photo, video, project or proof show a clearly labelled "PHOTO COMING SOON" frame. Give an experience item photo:{src,alt,caption} to replace it.
- Jump menu: Town, Hall of Fame and Off the clock added under Go to.

## Comic city behind CREATOR, 15 November: supersedes the town section
- User disliked the separate town buildings and wants buildings where the CREATOR title is, styled like a comic book (named Spider-Man as the feel). The town section, its car and its jump-menu entry are removed (TownMap.jsx deleted).
- HeroCity.jsx draws a comic-cover city inside the hero, behind everything else: a yellow sunburst of action rays and halftone dots in the sky, a pale far skyline, and inked near towers in cream, sky, yellow and pale red with lit window grids, water towers, a blinking antenna and a spired tower. Towers rise from the bottom of the CREATOR word so they show between the letters; heights are capped so every roof clears the header at any screen height. Two left towers hide on phones. Rooftops are Snoopy terrain (.hero-city .tower).
- Only the comic-book style is borrowed; no character, logo, web pattern or other Spider-Man elements.
- The hero copy now sits in a white comic caption panel (ink border, offset shadow, slight tilt) so it reads over the city; it tightens on screens under 820px tall so it never covers the word.

## Public repo and live site, 15 November
- At the user's request the GitHub repo cloudietuan/jtavu-portfolio is public (changed in GitHub settings through his signed-in browser; the API proxy blocks settings writes).
- The site is live on GitHub Pages at https://cloudietuan.github.io/jtavu-portfolio/ from the gh-pages branch. That branch holds the relative-path preview bundle (index.html, main.js, main.css, assets/, homepage/, .nojekyll) with the title "John Vu · JTAVU" and share tags. To update the live site, rebuild the bundle and force-push it to gh-pages. jtavu.com is still separate and unchanged.

## Smaller Snoopy on laptops, 15 November: supersedes "same size as the landing screen" above 700px
- User found Snoopy a bit big on a laptop. snoopySize.js now scales the landing-screen size by LAPTOP_SCALE 0.7 on screens wider than 700px (about 104px at 1440, 93px at 1280, 120px at 1920). Phones keep the full landing size with the 64px floor. The intro stunt sprite uses the same function, so the handoff to the site stays seamless.

## Smooth on phones, 20 November
- User found the site laggy on mobile and wants it really smooth. Measured on an emulated iPhone with 4x CPU slowdown while scrolling; long tasks went from about 21 to 1 to 3 per run.
- The scroll progress line sets --scroll-progress on .site-header only. Never set per-frame custom properties on :root; it restyles the whole page every scroll frame.
- SnoopySprite caches each finished pose (pixel-grid result) by everything that changes the picture; actionProgress is stepped to 1/48 for bow and ladder. Only new poses pay for the pixel read-back.
- Terrain and obstacle rects are measured at most every 300ms and 600ms and kept in page coordinates, shifted by scroll between measurements. Do not go back to measuring every surface each frame while he is in flight.
- Hero props are 480px WebP (volleyball, camera, chrome); Sunset and Apparel screenshots are 1500px WebP; Snoopy sheets are lossless WebP (pixel-identical). The original PNGs stay in the repo but are not loaded.
