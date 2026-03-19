---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-19"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **#34 Owner forced out** — design fully locked (trigger: bottom 3 + budget < £10k at week 30+; always bottom NPC club; inherit current state; survival win condition). Worktree `feat/phase-5-8-collapse` ready on main. Start building.

## Short Term (Next 2–4 Weeks)

1. **#30 Player attribute wiring** — wire `charisma` into revenue; confirm attack/defence/teamwork in match sim; decide overallRating derivation formula.
2. **Frontend test suite** — component-level tests; currently no coverage of UI layer.
3. **Second season loop** — promotion to League One / relegation experience now that the season end screen + morale system are both live.
4. **#27 Hub tile action flags** — rerouting stale action flags on Command Centre tiles.

## Questions / Unknowns

- **overallRating derivation** — currently stored independently. Should it be computed from `(attack + defence + teamwork) / 3` weighted by position?
- **Revenue formula** — no charisma contribution yet. What's the right scale before #30 can close?
- **Morale event surfacing** — morale events now fire correctly; question is whether the news ticker should log morale milestones ("Squad spirits high after 3-match winning run") as passive flavour.
