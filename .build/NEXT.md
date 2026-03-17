---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-17"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

Pick one of these as Phase 5.4 — all are self-contained:

1. **#36 NPC poaching** — NPCs can approach players from your squad; 4 response options (accept fee / reject / counter / ignore); teamwork degrades if player is unhappy → squad-wide performance hit → forced sale. Highest gameplay tension.
2. **#29 Manager creation** — manager with strengths/weaknesses attributes; how well they translate owner directives (training focus, formation) into results. Prerequisite for several future features.
3. **#31 Scout facility** — upgrading YOUTH_ACADEMY/scouting unlocks `truePotential` visibility; low levels show ±15 noise, high levels show exact value. Makes the free agent market interesting.

## Short Term (Next 2–4 Weeks)

1. **#32 Club-owned transfers** — sell players to NPC clubs for a transfer fee; fee appears in budget; player moves to NPC roster (news ticker item). Completes the transfer loop.
2. **#34 Owner forced out** — cascade failure re-entry mechanic: your collapse triggers bottom NPC club failing within 1–2 weeks; player parachutes in mid-season at rock bottom; Business Acumen persists, reputation malus attached.
3. **Revenue system** — wire `charisma` aggregate into matchday/commercial revenue (currently deferred, touches revenue systems).
4. **Player development** — `truePotential` + aging: players develop or decline week-to-week. Prerequisite for multi-season play.
5. **#41 Name analogue review** — manual pass on 24 team names + player name bank before external playtest.

## Questions / Unknowns

- **Phase 5.4 pick** — #36 (poaching), #29 (manager), or #31 (scout)? Poaching has most immediate gameplay impact; manager unlocks more depth.
- **Morale system** — morale is now wired into match results (±0.05). What events raise/lower it beyond signing/releasing? Events system? Needs design before a PR touches it.
- **Season end screen** — no promotion/relegation handling yet. Needed before full season playtesting.
- **Stale worktrees** — `cool-kalam`, `phase5-transfers`, `thirsty-archimedes`, `zealous-sutherland` still registered locally. Prune when convenient.
