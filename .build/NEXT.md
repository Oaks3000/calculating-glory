---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-03"
---

# Calculating Glory - Next Steps

## Immediate (This Session/Week)

1. Wire up full playable loop: game start → week 20 → resolve club events via Social Feed → advance week → see match results in league table
2. Fix root package.json workspace scripts (`--workspace=frontend` fails, needs `--workspace=@calculating-glory/frontend`)
3. Test the end-to-end flow in browser — confirm state updates propagate from domain through useGameState to UI

## Short Term (Next 2-4 Weeks)

1. UI polish pass — error states, loading indicators, responsive layout on 1366x768
2. Math challenge flow refinement — hint levels, answer validation, feedback
3. Club event narrative copy — flesh out Social Feed chat bubbles for all 15 event templates
4. Negotiation flow — Agent Rodriguez conversation threads with math-gated outcomes
5. Practice mode — Marcus Webb free math drills for business acumen improvement

## Questions / Unknowns

- Is the 3-week loop sufficient for the MVP demo, or do stakeholders want a longer playable segment?
- What's the deployment target? (School network, hosted URL, standalone Chromebook app?)
- Are there specific Year 7 curriculum topics to prioritise in the first math challenges?
