# Agate — fact coverage research (Step 0)

Question: can all 78 multiplication facts be reached by *real* sports numbers,
given that questions must present `a × b` and not merely a famous product?

## Finding 1: the scoring-value set is bigger than it looks

A fact is reachable by a vivid "count × scoring value" line if either operand is
a real scoring value. Verified values across the four sports:

| Value | What it is | Source |
|---|---|---|
| 1 | extra point; free throw; a goal; a run | league rules |
| 2 | safety; basketball field goal; two-point conversion | NFL/NBA rules |
| 3 | three-pointer; NFL field goal; a league win (modern soccer) | NFL/NBA/FIFA |
| 4 | grand slam; four-point play | MLB/NBA |
| 6 | touchdown | NFL |
| 7 | **converted touchdown** (TD + extra point) | NFL |
| 8 | **touchdown + two-point conversion** | NFL, confirmed |
| 9 | innings in a regulation game (structural) | MLB |

7 and 8 are the important ones and were nearly missed. Both are things fans say
out loud — "a seven-point game", "an eight-point play". Confirmed:
<https://en.wikipedia.org/wiki/Two-point_conversion>

Because the deck key is an unordered pair, any fact containing 1,2,3,4,6,7,8,9
has a vivid scoring story. **Non-native operands are only 5, 10, 11, 12.**

## Finding 2: the ceilings, verified

| Family | Ceiling | Who |
|---|---|---|
| three-pointers, one player | 14 | Klay Thompson, 2018-10-29 |
| field goals, one player | 36 | Wilt Chamberlain, 1962-03-02 |
| free throws, one player | 28 | Chamberlain |
| NFL field goals, one player | 8 | Rob Bironas, 2007-10-21 |
| touchdowns, one player | 6 | Nevers 1929, Jones 1951, Sayers 1965, Kamara 2020 |
| **touchdowns, one team** | **10** | Washington vs NY Giants, 1966-11-27 (72 pts) |
| home runs, one player | 4 | 21 players, ever |

The 1966 game checks out internally: 10 TD (60) + 9 extra points (9) + 1 field
goal (3) = 72. Team touchdowns being capped at 10, not 6, is what lets the
converted-TD frame reach `7 × 10 = 70`.

## Finding 3: the true hard tail is 10 facts, not 21

Pairs drawn only from {5, 10, 11, 12}:

    5x5=25   5x10=50   5x11=55   5x12=60
    10x10=100  10x11=110  10x12=120
    11x11=121  11x12=132  12x12=144

Both operands must be counts. Frames found so far:

- `5 x 5` — **5 overtimes x 5 minutes = 25 minutes of overtime.** Real:
  Bucks vs SuperSonics, 1989, went 5OT. NBA overtime is 5 minutes.
  Cross-check: the 6OT game of 1951-01-06 ran 78 minutes = 48 regulation + 30 OT.
- `11 x 12`, `12 x 12` — conference schedule math: a 12-team conference, an
  11-game round robin, a 12-game college regular season. Needs a specific real
  league confirmed.
- The remaining ~7 have no vivid framing yet and would need the duller but
  genuinely real "N games at exactly M per game" split, sourced per fact.

## Sources consulted
- <https://en.wikipedia.org/wiki/List_of_National_Football_League_records_(individual)>
- <https://en.wikipedia.org/wiki/List_of_highest-scoring_NFL_games>
- <https://en.wikipedia.org/wiki/Two-point_conversion>
- <https://en.wikipedia.org/wiki/List_of_NBA_single-game_3-point_scoring_leaders>
- <https://www.mlb.com/news/a-look-at-four-home-run-games-in-mlb-history-c234977182>
- <https://en.wikipedia.org/wiki/2026_FIFA_World_Cup>
- <https://en.wikipedia.org/wiki/Joe_DiMaggio's_56-game_hitting_streak>

## Finding 4: the last 7 facts are coverable — exact playoff splits

Scanned NBA playoff totals 2005–2025 (basketball-reference.com, read to verify,
not harvested) for lines where `total ÷ games` is an exact integer and both
numbers land in the 12×12 table. 40 candidates across the 7 open facts. Best of
each, chosen for name recognition:

| Fact | Line | Product |
|---|---|---|
| 5×10 | **Nikola Jokić**, 2021 playoffs — 5 assists a game across 10 games | 50 |
| 5×11 | **Bradley Beal**, 2014 playoffs — 5 rebounds a game across 11 games | 55 |
| 5×12 | **Dirk Nowitzki**, 2008 playoffs — 12 rebounds a game across 5 games | 60 |
| 10×10 | **Otto Porter Jr.**, 2015 playoffs — 10 points a game across 10 games | 100 |
| 10×11 | **Jae Crowder**, 2018 playoffs — 10 points a game across 11 games | 110 |
| 10×12 | **Deron Williams**, 2008 playoffs — 10 assists a game across 12 games | 120 |
| 11×11 | **Maurice Harkless**, 2016 playoffs — 11 points a game across 11 games | 121 |

Alternates exist for most: Kobe Bryant (50 free throws / 10 games), Donovan
Mitchell (50 threes / 10 games), Allen Iverson (50 assists / 5 games), Marcus
Camby, Mike Conley, Bobby Portis. `10×10` and `11×11` had exactly one hit each
in the window — widening the year range or the stat list would improve the names.

**Honest weaknesses of this set**, all of which fall on 7 facts out of 78:
- All NBA. No variety of sport in this corner.
- Several are role players. Nobody wonders how many rebounds Andray Blatche got,
  so the "you want to know" motivation is weakest exactly here.
- One sentence shape for all seven.
- It asks about an average, a subtler idea than a scoreboard.

Verification against a second source still pending for every line above.

## Decisions (2026-08-24)

1. **Widen the scan before committing the tail.** The 7 lines in Finding 4 are
   provisional. Extend past 2005–2025 and past the NBA — MLB season splits, NFL,
   soccer — and prefer names a kid might have heard. Sport variety is the point;
   a better-known role player is not.
2. **Second-source only the fragile lines**: the tail picks, the 1966 ten-touchdown
   game, the 1989 5OT game. Scoring values are league rules and stand on their own.
3. **Drop conference-schedule math** for `11 x 12` and `12 x 12`. Not worth naming a
   real conference to prop up a dull frame — find other real lines instead.
   **This puts them back in the tail: 9 facts to place, not 7.** Of the previously
   framed set only `5 x 5` (5 overtimes x 5 minutes) survives.
4. **Fork Lattice wholesale** into `games/agate/`. One self-contained index.html per
   game, per CLAUDE.md; the two diverge as soon as questions carry prose and sources.
   No shared module, no mode toggle inside Lattice.

## Finding 5: the tail, reframed off performance averages (2026-08-24)

Acting on decisions 1 and 3. Finding 4's seven NBA per-game-average lines are
**superseded** — kept below only as alternates. The replacement principle: stop
looking for a player who averaged M over N games, and look instead for a *rule*
that puts N groups of M on the field. Rules are verifiable from a rulebook,
they carry no name-recognition problem, and they spread across sports.

| Fact | Frame | Both operands real because |
|---|---|---|
| 5×10 = 50 | **All five starters in double figures.** A standard broadcast line: 5 starters × 10 points = 50 before anyone does anything special. | 5 on the floor (rule); 10 = "double figures" (idiom) |
| 5×11 = 55 | **The Ashes.** Five Tests, eleven a side — 55 places in the XI across a series. | 5-Test series (format); 11 a side (Law 1) |
| 5×12 = 60 | **An NBA quarter is 60 team-minutes.** Coaches divide 240 minutes a game — 5 players × 48; per quarter that is 5 × 12. | 5 on the floor; 12-minute quarter |
| 10×10 = 100 | **The NFL field: ten first downs long.** 100 yards between the goal lines, 10 yards to a first down. | both from the rulebook |
| 10×11 = 110 | **The CFL field: eleven first downs long.** Canada's field is 110 yards; three downs to gain the same 10. | both from the CFL rulebook |
| 10×12 = 120 | **Goalpost to goalpost is 120 yards** — 100 plus two 10-yard end zones. | rulebook |
| 11×11 = 121 | **Eleven on offence, eleven on defence: 121 one-on-one matchups on every snap.** | rulebook (computed — see weaknesses) |
| 11×12 = 132 | **A Scottish Premiership matchday.** Twelve clubs, eleven a side: 132 players out there at once. | 12-club league; 11 a side |
| 12×12 = 144 | **Canadian football is twelve a side** — same snap, 144 matchups. | CFL rulebook (computed) |

`5 × 5 = 25` from Finding 3 survives untouched. That makes the full tail ten
facts, of which nine are new here.

Sports represented: NBA 3 (with 5×5), NFL 3, CFL 2, cricket 1, soccer 1.

### Two deliberate pairs

`100/110` and `121/144` are the same question asked of the NFL and the CFL. That
repetition is the point: the two codes differ by exactly ten yards and one
player, so the pairs teach the contrast while they drill. Splitting them across
unrelated sports would lose that.

### Second-source pass (decision 2)

- **1966, Washington 72–41 New York.** Confirmed independently: 113 combined
  points, 10 Washington touchdowns, Charlie Gogolak's late field goal. The
  internal arithmetic in Finding 2 (60 + 9 + 3 = 72) holds.
- **The 5OT game.** Confirmed and dated precisely: **1989-11-09**, Bucks 155–154
  Sonics — the notes said only "1989". Better: the coverage puts the game at
  **73 minutes**, which is 48 + 5 × 5. That is an independent arithmetic
  confirmation of both the 5-minute overtime and the 25-minute total.

### Honest weaknesses of this set

- **Gridiron-heavy.** Five of ten lean on field or roster structure in American
  or Canadian football.
- **MLB contributes nothing to the tail, and that is structural, not laziness.**
  Baseball's native numbers are 3, 4, 9, 27, 60′6″, 90, 162. It does not
  generate products of 5, 10, 11 and 12. Baseball earns its place elsewhere in
  the deck — a ball's 108 stitches is 9 × 12, and 9 is already native.
- **121 and 144 are computed, not quoted.** Nobody says "121 matchups" out loud;
  it is true arithmetic over a real rule rather than a cited statistic. If that
  fails the standard, the Ryder Cup is the alternate for 144 — 12 a side, and
  Sunday's singles are a blind 12-against-12 draw.
- **50 is a floor, not an equality.** Five starters in double figures guarantees
  *at least* 50. The frame has to say "at least", or say "if each of the five
  scored exactly ten".
- Finding 4's NBA lines (Jokić, Beal, Nowitzki, Porter, Crowder, Williams,
  Harkless) remain available if any frame above is rejected.

### Sources added
- <https://cfldb.ca/rulebook/conduct-of-the-game/the-field/> (110 yards, 12 a side)
- <https://cfldb.ca/rulebook/scrimmage/series-of-downs/> (three downs, 10 yards)
- <https://coversports.com/resources/field-guides/professional-football-field-dimensions-guide> (120 × 53⅓)
- <https://en.wikipedia.org/wiki/Scottish_Premiership> (12 clubs)
- <https://www.denverstiffs.com/2019/10/7/20901964/stat-of-the-week-240-rotation-minutes-per-game> (240 = 5 × 48)
- <https://en.wikipedia.org/wiki/List_of_highest-scoring_NFL_games> (1966, second source)
- <https://www.nba.com/news/week-history-milwaukee-bucks-seattle-sonics-5-overtime-game-1989> (5OT, 73 minutes)
- <https://en.wikipedia.org/wiki/2015_Ashes_series> (five-Test series)

## Finding 6: Finding 1 does not survive contact with Finding 2

Building the deck exposed this. Finding 1 concluded that **any fact containing
1, 2, 3, 4, 6, 7, 8 or 9 has a vivid scoring story**, leaving only 5, 10, 11, 12
as non-native operands. That is true of the *values* and false of the *facts*,
because it never checks the count against the ceilings Finding 2 had already
established. A touchdown is worth 6, but nobody has scored eleven of them, so
`6 × 11` has no touchdown story.

Applying each ceiling to each fact, **19 facts beyond the researched tail** have
no usable scoring frame: 4×9, 4×10, 4×11, 4×12, 5×8, 5×9, 6×11, 6×12, 7×11,
7×12, 8×8, 8×9, 8×10, 8×11, 8×12, 9×9, 9×10, 9×11, 9×12. The pattern is plain
in hindsight — the high-value scores (6, 7, 8) are exactly the ones with low
ceilings, so they fail against exactly the operands that most need help.

All 19 are closed, by the same move that worked for the tail: stop looking for a
score and look for a rule that puts n groups of v on the field.

| Frame | Covers | Verified |
|---|---|---|
| Four bases to a home run | the 4s | rulebook |
| Six balls to an over | 6×11, 6×12 | cricket, Law 17 |
| Rugby sevens, seven a side | 7×11, 7×12 | World Rugby |
| Eight lanes to a heat | all the 8s | World Athletics: eight lanes required |
| Nine a side | 9×9, 9×11 | baseball |
| Four quarters of ten / of twelve | 4×10, 4×12 | WNBA and FIBA 40 min, NBA 48 |
| Ten clubs (KBO), twelve clubs (NPB) | 9×10, 9×12 | league structure |

Coverage is now **78 of 78**, machine-checked: every story's `n × v` equals the
fact it is attached to, and every fact draws the same story each time it is
asked. The check lives in the build session, not in the repo — it reads the
frame table straight out of `games/agate/index.html`.
