---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-20"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **Second season loop** — the first test of live progression and retirement. Does promotion to League One feel different? Do player arcs surface as intended? Likely to catch balance issues (growth rate, retirement frequency, revenue scaling).

## Short Term (Next 2–4 Weeks)

1. **Frontend test suite** — zero component-level coverage; good hygiene before the game grows further.
2. **#27 Hub tile action flags** — stale routing on Command Centre tiles (quick fix).
3. **Facility revenue scaling by league tier** — current formula caps at ~£4k/wk, breaks down once charisma stars arrive in Championship/PL. Prerequisite for multi-league work.

## Questions / Unknowns

- **Second season balance** — are players growing/declining at a noticeable rate over 1–2 seasons? Is retirement frequency right (expected ~1–2 retirements per season from a 16-player squad)?
- **publicPotential semantics** — now that `truePotential` is a career-arc cursor, `publicPotential` should be a noisy read of that. Low-priority Scout Network update to close #30 fully.
- **Morale event surfacing** — morale events fire correctly; question remains whether the news ticker should log milestones ("Squad spirits high after 3-match winning run") as passive flavour.
