// Assessment, Chapter 2: Causality. New studies and data; the book's methods and R functions.
// Like the exam, nothing asks you to write code: parts are written answers, predicting output, or interpreting shown code and output.
const r = String.raw;

export default {
  id: "ch2", short: "Chapter 2", title: "Chapter 2: Causality",
  intro: "Potential outcomes, randomized experiments, confounding, subclassification, before-and-after and difference-in-differences designs, subsetting in R, and descriptive statistics. Every study here is new; the reasoning is the book's.",
  items: [
    {
      id: "c2aud", sec: "2.1–2.2", title: "An audit study of rental housing",
      setup: r`set.seed(2024)
n <- 2400
nm <- c("Omar", "Yusuf", "Fatima", "Aisha", "Connor", "Liam", "Emma", "Claire")
rental <- data.frame(name = sample(nm, n, replace = TRUE))
rental$origin <- ifelse(rental$name %in% nm[1:4], "arab", "anglo")
rental$gender <- ifelse(rental$name %in% c("Omar", "Yusuf", "Connor", "Liam"), "male", "female")
p <- 0.40 - 0.12 * (rental$origin == "arab") - 0.04 * (rental$gender == "male") -
  0.04 * (rental$origin == "arab" & rental$gender == "male")
rental$reply <- rbinom(n, 1, p)
rental$rent <- round(rnorm(n, 1500, 300))
rm(n, nm, p)`,
      context: r`<p>Researchers answered 2,400 online apartment listings with identical inquiry emails. Each email was signed with a first name randomly drawn from eight: four Arab-sounding, four Anglo-sounding, half of each typically male. The data frame <code>rental</code> has one row per inquiry:</p>
<table><tr><td><code>name</code></td><td>first name used</td></tr><tr><td><code>origin</code></td><td><code>"arab"</code> or <code>"anglo"</code> (implied by the name)</td></tr><tr><td><code>gender</code></td><td><code>"female"</code> or <code>"male"</code> (implied by the name)</td></tr><tr><td><code>reply</code></td><td>1 if the landlord replied, 0 otherwise</td></tr><tr><td><code>rent</code></td><td>advertised monthly rent of the listing ($)</td></tr></table>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret this output. What do the margins show, which cells produce each rate, and how large is the gap in percentage points and in percent?`,
          show: r`tab <- table(origin = rental$origin, reply = rental$reply)
addmargins(tab)
anglo <- tab[1, 2] / sum(tab[1, ])   # row 1 is "anglo" (alphabetical)
arab <- tab[2, 2] / sum(tab[2, ])
c(anglo = anglo, arab = arab)
(anglo - arab) * 100                 # gap in percentage points`,
          a: r`<p>Rows are ordered alphabetically (anglo, then arab), and column 2 is <code>reply = 1</code>. A rate is the cell count of replies divided by that row's total. The Anglo rate is about 0.385 and the Arab rate about 0.235, a gap of about <b>15 percentage points</b>. That's points, not percent: in relative terms the Arab rate is about 39% lower.</p>`,
          rubric: ["Reads the margins: row totals per origin, column totals, grand total 2,400","Each rate = replies (column 2, reply = 1) / that row's total; rows are alphabetical so row 1 is anglo","Gap ≈ 15 percentage points","Distinguishes percentage points from percent (Arab rate ≈ 39% lower)"],
        },
        {
          kind: "interpret", q: r`Interpret this output. Why does the first line reproduce the gap from the table, and what do the two subgroup gaps show?`,
          show: r`mean(rental$reply[rental$origin == "anglo"]) - mean(rental$reply[rental$origin == "arab"])
f <- subset(rental, gender == "female")
m <- subset(rental, gender == "male")
mean(f$reply[f$origin == "anglo"]) - mean(f$reply[f$origin == "arab"])  # among female names
mean(m$reply[m$origin == "anglo"]) - mean(m$reply[m$origin == "arab"])  # among male names`,
          a: r`<p>The mean of a 0/1 variable is the proportion of 1s, so <code>mean()</code> on the subset reproduces the table's rate. The gap is about 12 points among female names and about 18 points among male names: male Arab-named applicants face the largest penalty. That's a heterogeneous effect of the treatment (perceived origin) across subgroups.</p>`,
          rubric: ["The mean of a 0/1 variable within a logical subset is the reply rate, so the first line reproduces the 15-point gap","subset() splits the data by gender","Gap ≈ 12 points among female names, ≈ 18 among male names","Interprets the difference as a heterogeneous effect: the largest penalty for male Arab names"],
        },
        {
          kind: "write", q: r`State precisely what the treatment is in this study and what each inquiry's counterfactual is. Does a 15-point gap show that landlords <i>intend</i> to discriminate? What would you say to someone who argues the gap reflects real differences in income between Arab and Anglo applicants?`,
          a: r`<p>The treatment is the landlord's <i>perception</i> of the applicant's origin, manipulated through the name; origin itself is never manipulated (it's immutable). For a given inquiry, the counterfactual is the same email to the same listing signed with a name of the other origin. Because only the name varies and names were randomly assigned, the gap estimates the average causal effect of the name signal on replies. It does not reveal intent: the behavior could come from conscious animus, unconscious bias, or statistical inference from names. The income argument fails here because the emails are identical: income, wording, timing, and everything else are held fixed, and randomization balances listings across groups. It would be a strong objection in an <i>observational</i> comparison of real applicants, where income could confound the comparison.</p>`,
          rubric: ["Treatment = perceived origin via the name, not origin itself","Counterfactual = same inquiry to same landlord with the other name","Gap is a causal effect of the name signal but cannot reveal intent","Income objection fails because emails are identical and assignment random; it would bite in observational data"],
        },
        {
          kind: "interpret", q: r`<code>rent</code> was fixed before any email was sent. Interpret this output: what should it show if the study worked, and why does it matter?`,
          show: r`tapply(rental$rent, rental$origin, mean)`,
          a: r`<p>Because names were randomly assigned, the two groups of listings should be similar on average in every pretreatment characteristic, including rent; you should see averages within a few dollars of each other. This balance check supports the claim that the reply gap isn't driven by Arab-named emails going to different kinds of listings (say, more expensive ones with pickier landlords).</p>`,
          rubric: ["Reads the two mean rents as nearly equal","Expects balance because names were randomly assigned","Explains that this balance check rules out Arab-named emails going to different kinds of listings"],
        },
      ],
    },
    {
      id: "c2log", sec: "2.2.1–2.2.2", title: "Logical and relational operators",
      setup: r``,
      context: r`<p>Logical values coerce to 1 (TRUE) and 0 (FALSE). <code>&amp;</code> and <code>|</code> work element-wise, and <code>&amp;</code> binds more tightly than <code>|</code>.</p>`,
      parts: [
        {
          kind: "predict", q: r`Predict every line of output.`,
          show: r`x <- c(5, -1, 0, 3, -4, 2)
(x >= 0) & (x != 3)
(x < -2) | (x > 4)
sum(x > 0)
mean((x >= -1) & (x <= 2))
TRUE | FALSE & FALSE
(TRUE | FALSE) & FALSE
"Yes" == "yes"`,
          a: r`<ul><li><code>TRUE FALSE TRUE FALSE FALSE TRUE</code>: non-negative and not 3.</li>
<li><code>TRUE FALSE FALSE FALSE TRUE FALSE</code>: only 5 and −4 qualify.</li>
<li>Three elements are positive (5, 3, 2): <code>3</code>.</li>
<li>−1, 0, and 2 are in [−1, 2], so the proportion is 3/6 = <code>0.5</code>.</li>
<li><code>&amp;</code> is evaluated first: <code>TRUE | (FALSE &amp; FALSE)</code> = <code>TRUE</code>.</li>
<li>The parentheses force OR first: <code>TRUE &amp; FALSE</code> = <code>FALSE</code>.</li>
<li>Comparison is case sensitive: <code>FALSE</code>.</li></ul>`,
          rubric: ["Both element-wise logical vectors correct","sum of a logical counts TRUEs (3); mean gives the proportion (0.5)","Applies & before | without parentheses, giving TRUE","Case-sensitive string comparison gives FALSE"],
        },
        {
          kind: "write", q: r`A student writes <code>mean(x = 3)</code> intending "the proportion of elements of <code>x</code> equal to 3." Explain what R actually computes. Then explain what <code>mean(x == 3)</code> and <code>sum((x &lt; 0) | (x &gt; 4))</code> each return, for <code>x</code> from part (a).`,
          a: r`<p><code>=</code> inside a function call names an argument, so <code>mean(x = 3)</code> computes the mean of the number 3 and returns 3. It never compares anything. <code>x == 3</code> is a logical vector (TRUE only for the 3), so <code>mean(x == 3)</code> is the proportion equal to 3: 1/6. <code>(x &lt; 0) | (x &gt; 4)</code> is TRUE for 5, −1, and −4; <code>sum()</code> counts the TRUEs, giving 3.</p>`,
          rubric: ["= assigns an argument value (the mean of 3), not a comparison","mean(x == 3) is the proportion equal to 3 (1/6)","sum() of a logical condition counts TRUEs (3)"],
        },
      ],
    },
    {
      id: "c2fac", sec: "2.2.3–2.2.5", title: "Subsetting, factors, and group means: municipal grants",
      setup: r`set.seed(44)
n <- 900
grants <- data.frame(size = sample(c("small", "large"), n, replace = TRUE, prob = c(0.6, 0.4)),
  region = sample(c("north", "south", "west"), n, replace = TRUE),
  sector = sample(c("health", "roads", "schools"), n, replace = TRUE))
grants$awarded <- rbinom(n, 1, 0.3 + 0.15 * (grants$size == "large") +
  0.1 * (grants$sector == "health") - 0.08 * (grants$region == "west"))
grants$amount <- round(rlnorm(n, log(250), 0.5))
rm(n)`,
      context: r`<p>A state agency received 900 grant applications from municipalities. The data frame <code>grants</code> has:</p>
<table><tr><td><code>size</code></td><td><code>"small"</code> or <code>"large"</code> municipality</td></tr><tr><td><code>region</code></td><td><code>"north"</code>, <code>"south"</code>, or <code>"west"</code></td></tr><tr><td><code>sector</code></td><td><code>"health"</code>, <code>"roads"</code>, or <code>"schools"</code></td></tr><tr><td><code>awarded</code></td><td>1 if funded, 0 otherwise</td></tr><tr><td><code>amount</code></td><td>amount requested ($ thousands)</td></tr></table>`,
      parts: [
        {
          kind: "interpret", q: r`Explain how this code builds <code>type</code>, why <code>class()</code> reports what it does, and how the levels are ordered. Could any row end up as <code>NA</code>?`,
          show: r`grants$type <- NA
grants$type[grants$size == "large" & grants$sector == "health"] <- "LargeHealth"
grants$type[grants$size == "large" & grants$sector != "health"] <- "LargeOther"
grants$type[grants$size == "small" & grants$sector == "health"] <- "SmallHealth"
grants$type[grants$size == "small" & grants$sector != "health"] <- "SmallOther"
class(grants$type)
grants$type <- as.factor(grants$type)
levels(grants$type)
table(grants$type)`,
          a: r`<p>Each assignment writes a label only into the rows where its condition is TRUE. The four conditions are mutually exclusive and exhaustive, so no <code>NA</code> remains. Before conversion the class is <code>"character"</code>. <code>as.factor()</code> creates levels sorted alphabetically: LargeHealth, LargeOther, SmallHealth, SmallOther. <code>table()</code> counts rows per level.</p>`,
          rubric: ["NA fill first, then each line writes a label only where its condition is TRUE","The four conditions are mutually exclusive and exhaustive, so no NA remains","Class is character before as.factor()","Levels are sorted alphabetically; table() counts rows per level"],
        },
        {
          kind: "interpret", q: r`Interpret the output. What does each number mean, and can you conclude that size or sector <i>causes</i> higher award rates?`,
          show: r`grants$type <- NA
grants$type[grants$size == "large" & grants$sector == "health"] <- "LargeHealth"
grants$type[grants$size == "large" & grants$sector != "health"] <- "LargeOther"
grants$type[grants$size == "small" & grants$sector == "health"] <- "SmallHealth"
grants$type[grants$size == "small" & grants$sector != "health"] <- "SmallOther"
grants$type <- as.factor(grants$type)
sort(tapply(grants$awarded, grants$type, mean))`,
          a: r`<p><code>tapply(X, INDEX, FUN)</code> splits <code>awarded</code> by <code>type</code> and applies <code>mean</code>, giving each group's award rate; <code>sort()</code> orders them ascending. Small non-health applications fare worst and large health applications best. These are descriptive differences: nothing here was randomized, so they are not causal effects of size or sector.</p>`,
          rubric: ["tapply(awarded, type, mean): award rate per type (outcome first, grouping second)","sort() orders the rates from lowest to highest","Reads the ranking: SmallOther lowest, LargeHealth highest","The differences are descriptive, not causal: nothing was randomized"],
        },
        {
          kind: "predict", q: r`An analyst wants small municipalities in the north or south. Explain why the two counts differ.`,
          show: r`nrow(subset(grants, size == "small" & region == "north" | region == "south"))
nrow(subset(grants, size == "small" & (region == "north" | region == "south")))`,
          a: r`<p><code>&amp;</code> binds more tightly than <code>|</code>, so the first condition is <code>(small &amp; north) | south</code>: it keeps small northern municipalities plus <i>every</i> southern one, large or small. The second applies "small" to both regions, which is what the analyst meant, so it returns fewer rows. Always parenthesize compound conditions.</p>`,
          rubric: ["Identifies that & is evaluated before |","Says the first count wrongly includes large southern municipalities","Second line is the intended subset"],
        },
        {
          kind: "predict", q: r`Predict the output of the third line, and explain what happens on the last line.`,
          show: r`a <- subset(grants, size == "small" & sector == "roads", select = c("region", "amount"))
b <- grants[grants$size == "small" & grants$sector == "roads", c("region", "amount")]
identical(a, b)
grants[grants$size == "small"]`,
          a: r`<p><code>identical(a, b)</code> is <code>TRUE</code>: both select the same rows (a logical condition) and the same columns (a character vector). Brackets take [rows, columns] separated by a comma and need <code>grants$</code> before each variable; <code>subset()</code> looks names up inside the data frame for you. The last line has no comma, so R treats the logical vector as choosing <i>columns</i>. A vector of length 900 can't index 5 columns, so R stops with "undefined columns selected."</p>`,
          rubric: ["identical() returns TRUE: same rows and columns two ways","Brackets need [rows, columns] and grants$; subset() finds names in the data frame","Without the comma the index selects columns, giving an 'undefined columns selected' error"],
        },
      ],
    },
    {
      id: "c2po", sec: "2.3–2.4.1", title: "Potential outcomes by hand",
      setup: r`y0 <- c(40, 52, 35, 60, 45, 50)
y1 <- c(46, 55, 47, 60, 54, 56)
t <- c(1, 0, 1, 0, 0, 1)`,
      context: r`<p>Six towns (A–F) could run a civic-education program. Suppose, impossibly, that we know both potential outcomes: turnout (%) without the program, \(Y_i(0)\), and with it, \(Y_i(1)\).</p>
<table><tr><td></td><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td></tr>
<tr><td>\(Y_i(0)\)</td><td>40</td><td>52</td><td>35</td><td>60</td><td>45</td><td>50</td></tr>
<tr><td>\(Y_i(1)\)</td><td>46</td><td>55</td><td>47</td><td>60</td><td>54</td><td>56</td></tr></table>
<p>For the code part, these are stored as <code>y0</code>, <code>y1</code>, and a treatment vector <code>t &lt;- c(1, 0, 1, 0, 0, 1)</code>.</p>`,
      parts: [
        {
          kind: "write", q: r`Compute each town's causal effect and the SATE. Which town shows that a zero individual effect is compatible with a positive average effect?`,
          a: r`<p>Effects \(Y_i(1) - Y_i(0)\): A 6, B 3, C 12, D 0, E 9, F 6. \(\text{SATE} = \frac{1}{6}(6+3+12+0+9+6) = 36/6 = 6\) points. Town D has an effect of exactly 0: an average effect describes the sample, not every unit.</p>`,
          rubric: ["All six unit effects correct","SATE = 6","Notes D's zero effect: the SATE is an average, so individual effects can differ"],
        },
        {
          kind: "write", q: r`Treatment is randomly assigned as \(T = (1, 0, 1, 0, 0, 1)\) (A, C, F treated). Write what the researcher actually observes for each town, using \(Y_i = Y_i(T_i)\), and compute the difference-in-means estimate. Why is it so far from the SATE even though assignment was random?`,
          a: r`<p>Observed: A 46, B 52, C 47, D 60, E 45, F 56. The unobserved potential outcomes are A, C, F's \(Y(0)\) and B, D, E's \(Y(1)\). Treated mean = (46+47+56)/3 = 49.67; control mean = (52+60+45)/3 = 52.33. The difference-in-means is <b>−2.67</b>: negative, though every effect is ≥ 0. Randomization guarantees the groups are identical <i>on average over repeated assignments</i>, not in any single draw. With six units this draw happened to put the low-baseline towns (A 40, C 35) in treatment. The estimator is unbiased, but with tiny samples one estimate can be far off.</p>`,
          rubric: ["Observed outcomes correct (treated show Y(1), controls Y(0))","Difference-in-means = −2.67","Explains randomization balances groups on average across repetitions, not in one small draw","Identifies chance imbalance in baseline Y(0) as the reason"],
        },
        {
          kind: "write", q: r`For the same assignment, compute the SATT. Show that difference-in-means = SATT + (mean \(Y(0)\) among treated − mean \(Y(0)\) among controls), and interpret the second term.`,
          a: r`<p>SATT = average effect among A, C, F = (6+12+6)/3 = <b>8</b>. Mean \(Y(0)\) among the treated = (40+35+50)/3 = 41.67; among controls = (52+60+45)/3 = 52.33. Second term = −10.67, and 8 + (−10.67) = −2.67 ✓. The second term is baseline imbalance: how different the treated group would have been from the controls even <i>without</i> treatment. Randomization makes it zero in expectation. In observational data, selection makes it nonzero systematically, and that is selection bias.</p>`,
          rubric: ["SATT = 8 (average effect among treated units only)","Baseline means 41.67 and 52.33; term = −10.67","Verifies the decomposition sums to −2.67","Interprets the term as pre-existing (baseline) difference: zero in expectation under randomization, selection bias otherwise"],
        },
        {
          kind: "write", q: r`Now suppose towns <i>choose</i> the program and the three lowest-turnout towns (A, C, E) opt in. Compute the naive difference-in-means and the selection bias. Which way does self-selection push the estimate, and why might this pattern be realistic?`,
          a: r`<p>Treated observed: A 46, C 47, E 54, mean 49. Controls observed: B 52, D 60, F 50, mean 54. Naive estimate = <b>−5</b>. SATT for A, C, E = (6+12+9)/3 = 9. Baseline means are 40 vs 54, so selection bias = −14 and 9 − 14 = −5 ✓. Self-selection pushes the estimate down, even to the wrong sign, because towns with low baseline turnout were the ones that adopted the program. That's realistic: places with turnout problems are exactly the ones that seek turnout programs. The confounder (low civic engagement) is related to both treatment and outcome.</p>`,
          rubric: ["Naive estimate −5","SATT 9 and selection bias −14 (baseline 40 vs 54)","Explains the downward (sign-flipping) bias from low-baseline towns opting in","Names the confounding logic: baseline engagement drives both adoption and turnout"],
        },
        {
          kind: "interpret", q: r`This code reproduces your hand calculations. Explain what each line computes, and in particular how the second line encodes the fundamental problem of causal inference.`,
          show: r`mean(y1 - y0)                                  # SATE
y <- y1 * t + y0 * (1 - t)                     # observed outcome Y = Y(T)
y
mean(y[t == 1]) - mean(y[t == 0])              # difference-in-means
mean((y1 - y0)[t == 1])                        # SATT`,
          a: r`<p><code>y1 * t + y0 * (1 - t)</code> picks \(Y(1)\) where \(t = 1\) and \(Y(0)\) where \(t = 0\): the fundamental problem written as code. The results match the hand calculations: 6, the observed vector 46 52 47 60 45 56, −2.67, and 8.</p>`,
          rubric: ["mean(y1 - y0) is the SATE (knowable only in this hypothetical)","y1 * t + y0 * (1 - t) keeps the potential outcome matching treatment status: Y = Y(T)","The difference-in-means uses only observed outcomes split by t","The last line averages the effects among t == 1: the SATT"],
        },
      ],
    },
    {
      id: "c2rct", sec: "2.4", title: "Designing a randomized trial: court-date reminders",
      setup: r``,
      context: r`<p>A county court wants to know whether text-message reminders reduce missed court appearances. Over six months, every defendant who listed a mobile number at booking is randomly assigned to one of three conditions: no text (control), a plain reminder ("Your court date is…"), or a reminder that adds "Missing court can lead to a warrant for your arrest." The outcome is whether the defendant appears. Booking records include age, charge severity, and number of prior missed appearances.</p>`,
      parts: [
        {
          kind: "write", q: r`Identify the unit, the treatment(s), the outcome, and the pretreatment covariates. What exactly does random assignment guarantee here, and what does it <i>not</i> guarantee?`,
          a: r`<p>Unit: a defendant with a court date. Treatments: plain reminder and consequences reminder, each compared with no text. Outcome: appearance (binary). Pretreatment covariates: age, charge severity, prior missed appearances (all fixed before assignment, so unaffected by treatment). Randomization guarantees that the three groups are identical <i>on average</i> in all pretreatment characteristics, observed and unobserved, so outcome differences can be attributed to the messages. It does not guarantee balance in any single realization, that the messages were delivered or read, or that the results generalize beyond this county or to defendants without phones.</p>`,
          rubric: ["Correct unit, treatment arms, outcome","Pretreatment covariates identified and why they're unaffected by treatment","Guarantee: groups identical on average in observed AND unobserved traits","Limits: not exact balance in one draw, not delivery/compliance, not generalizability"],
        },
        {
          kind: "write", q: r`A critic says the consequences message works only because defendants realize the court is "watching them," not because of the threat itself. Propose an additional treatment arm that separates these two mechanisms, and explain which comparison isolates which mechanism. What is this concern called?`,
          a: r`<p>This is a Hawthorne-type concern: behavior changes because subjects feel observed. Add an arm with a reminder that adds a monitoring statement without a sanction, e.g. "The court tracks attendance for every case," with no mention of a warrant. Then (monitoring arm − plain reminder) estimates the effect of feeling watched; (consequences arm − monitoring arm) estimates the effect of the explicit threat beyond being watched; and each arm minus control gives its total effect. This mirrors the book's Hawthorne arm in the social pressure study, which isolated "being studied" from "neighbors will know."</p>`,
          rubric: ["Names the Hawthorne effect","Proposes an arm with observation/monitoring language but no threat","Explains which pairwise comparison isolates each mechanism","All arms compared against the shared control for total effects"],
        },
        {
          kind: "write", q: r`Evaluate this study's internal and external validity. Give two specific threats to external validity and one design change that would improve it.`,
          a: r`<p>Internal validity is strong: randomization makes the arms comparable, so the difference in appearance rates is a credible causal estimate for <i>these</i> defendants. External validity is weaker. (1) Sample selection: only defendants who listed a phone number are included, and they likely differ from those who don't (more stable housing and contact, perhaps lower baseline no-show rates), so effects may not hold for the population of all defendants. (2) Setting: one county's courts, case mix, and enforcement practices; a different jurisdiction might respond differently. A remedy: replicate across counties with different populations, or pair texts with mailed reminders so defendants without phones can be included.</p>`,
          rubric: ["Internal validity high because of randomization","Sample selection threat: phone-number holders are not representative","Second threat: single setting, context, or intervention realism","A concrete design change (multi-site replication, broader contact method)"],
        },
      ],
    },
    {
      id: "c2arm", sec: "2.4.2", title: "A multi-arm field experiment: unpaid water bills",
      setup: r`set.seed(31)
n <- 6000
water <- data.frame(letter = sample(c("Control", "Reminder", "Social", "Deadline"), n,
  replace = TRUE, prob = c(0.4, 0.2, 0.2, 0.2)))
water$prior_late <- rbinom(n, 1, 0.35)
water$acct_years <- round(runif(n, 0, 30), 1)
water$bill <- round(rlnorm(n, log(80), 0.4), 2)
eff <- c(Control = 0, Reminder = 0.04, Social = 0.07, Deadline = 0.05)[water$letter]
eff <- eff + ifelse(water$letter == "Social", 0.08 * water$prior_late, 0)
water$paid <- rbinom(n, 1, 0.55 - 0.2 * water$prior_late + eff)
rm(n, eff)`,
      context: r`<p>A city utility randomly assigned 6,000 households with an overdue water bill to receive one of three letters or no letter. The data frame <code>water</code> has:</p>
<table><tr><td><code>letter</code></td><td><code>"Control"</code> (no letter), <code>"Reminder"</code>, <code>"Social"</code> (compares you to neighbors who paid), <code>"Deadline"</code></td></tr><tr><td><code>paid</code></td><td>1 if the bill was paid within 30 days</td></tr><tr><td><code>prior_late</code></td><td>1 if the household paid late at least once in the prior year</td></tr><tr><td><code>acct_years</code></td><td>years the account has been open</td></tr><tr><td><code>bill</code></td><td>amount overdue ($)</td></tr></table>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret this output. What does each number in the second line estimate, why is Control's entry exactly zero, and why can these be read causally?`,
          show: r`tapply(water$paid, water$letter, mean)
tapply(water$paid, water$letter, mean) - mean(water$paid[water$letter == "Control"])`,
          a: r`<p>Subtracting the control rate from every group's rate gives each letter's estimated average treatment effect. Control minus itself is zero by construction. Social has the largest effect (about 10 points), Deadline and Reminder smaller (about 2–3 points). Because letters were randomized, these differences estimate causal effects.</p>`,
          rubric: ["First line: payment rate in each condition","Second line: each letter's rate minus the control rate = its estimated average effect","Control's entry is its own mean minus itself","Social has the largest effect (~10 points); causal because letters were randomized"],
        },
        {
          kind: "interpret", q: r`This is a balance check. Interpret it, including any difference you find notable and which way it could bias the Social letter's estimated effect.`,
          show: r`tapply(water$prior_late, water$letter, mean)
tapply(water$acct_years, water$letter, mean)
tapply(water$bill, water$letter, mean)`,
          a: r`<p>Account age and bill size are nearly identical across conditions. <code>prior_late</code> is about 0.31 in the Social group versus 0.34 in Control: a 3-point imbalance produced by chance (random assignment equalizes groups only <i>on average</i>). It matters because prior lateness strongly predicts not paying, so a Social group with slightly fewer late payers would look better even with no letter, inflating Social's estimated effect a little. That doesn't mean randomization failed. It is a reason to check the effect within <code>prior_late</code> subgroups (subclassification), which part (c) does.</p>`,
          rubric: ["Explains a balance check compares pretreatment means across arms","Notes acct_years and bill are balanced","Spots the ~3-point prior_late imbalance in Social and attributes it to chance","Explains the bias direction (fewer late payers would make Social look better) and suggests checking within subgroups"],
        },
        {
          kind: "interpret", q: r`The analyst estimates the Social letter's effect separately by prior lateness. Interpret both numbers and explain how this bears on the balance check in part (b).`,
          show: r`late <- subset(water, prior_late == 1)
ontime <- subset(water, prior_late == 0)
mean(late$paid[late$letter == "Social"]) - mean(late$paid[late$letter == "Control"])
mean(ontime$paid[ontime$letter == "Social"]) - mean(ontime$paid[ontime$letter == "Control"])`,
          a: r`<p>The Social letter's effect is about 20 points among prior-late households and about 5 points among the rest: strongly heterogeneous. Within each subgroup, <code>prior_late</code> is held fixed, so the part (b) imbalance can't drive these estimates. Both are still clearly positive, so the overall finding survives. Policy implication: the Social letter is most valuable for chronic late payers. Because the subgroup is defined by a pretreatment variable, this comparison is still experimental.</p>`,
          rubric: ["Reads the effects: ≈ 20 points for prior-late households, ≈ 5 for the rest","Interprets the heterogeneity substantively (most useful for chronic late payers)","Within subgroups prior_late is fixed, so the part (b) imbalance can't drive the estimates","Subgrouping on a pretreatment variable keeps the comparison experimental"],
        },
        {
          kind: "write", q: r`Another city wants to adopt the Social letter based on this study. List the conditions under which this city's estimate would transfer, and one reason it might not.`,
          a: r`<p>The estimate transfers if the other city's overdue households resemble these (similar share of chronic late payers, given how much the effect varies with <code>prior_late</code>), if the letter can be delivered the same way, and if the social comparison is credible there (households must believe neighbors mostly pay). It might not transfer if, say, most neighbors in the new city <i>don't</i> pay on time, which would make the comparison message weaker or backfire. That's an external validity concern: internal validity here doesn't guarantee generalization.</p>`,
          rubric: ["Frames the issue as external validity","Uses the heterogeneity finding (composition of prior-late households matters)","Names a concrete reason the effect could differ elsewhere"],
        },
      ],
    },
    {
      id: "c2obs", sec: "2.5.1–2.5.2", title: "Confounding and subclassification: police body cameras",
      setup: r`set.seed(77)
n <- 400
cams <- data.frame(urban = rbinom(n, 1, 0.45))
cams$region <- sample(c("coast", "valley", "hills"), n, replace = TRUE)
cams$camera <- rbinom(n, 1, ifelse(cams$urban == 1, 0.7, 0.2))
cams$complaints <- round(10 + 12 * cams$urban + 2 * (cams$region == "coast") -
  3 * cams$camera + rnorm(n, 0, 3), 1)
rm(n)`,
      context: r`<p>A state offered grants for police body cameras; departments decided for themselves whether to apply. One year later, a researcher compares departments with and without cameras. The data frame <code>cams</code> (400 departments) has:</p>
<table><tr><td><code>camera</code></td><td>1 if the department adopted cameras</td></tr><tr><td><code>complaints</code></td><td>citizen complaints per 100 officers in the following year</td></tr><tr><td><code>urban</code></td><td>1 if the department serves an urban area</td></tr><tr><td><code>region</code></td><td><code>"coast"</code>, <code>"valley"</code>, or <code>"hills"</code></td></tr></table>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret this number. A newspaper reports it as "cameras increase complaints." What design is this, and what assumption would the headline need?`,
          show: r`mean(cams$complaints[cams$camera == 1]) - mean(cams$complaints[cams$camera == 0])`,
          a: r`<p>About +3 complaints per 100 officers. This is a cross-section comparison: treated and control units after treatment. It's causal only if departments with and without cameras are comparable on everything related to complaints except the cameras. Since departments chose to adopt, that's doubtful.</p>`,
          rubric: ["Reads the difference in means (≈ +3 complaints per 100 officers)","Names the cross-section comparison design","States the comparability assumption and doubts it because adoption was self-selected"],
        },
        {
          kind: "interpret", q: r`Interpret these two tables and explain why <code>urban</code> satisfies every part of the definition of a confounder.`,
          show: r`prop.table(table(cams$urban[cams$camera == 1]))
prop.table(table(cams$urban[cams$camera == 0]))`,
          a: r`<p>About 76% of adopters are urban versus about 23% of non-adopters. <code>urban</code> is (1) pretreatment: fixed before any camera decision, so cameras can't affect it; (2) associated with treatment: urban departments adopted far more often; (3) associated with the outcome: urban areas generate many more complaints regardless of cameras. So the naive comparison is largely comparing urban with rural departments: confounding bias.</p>`,
          rubric: ["Reads the tables: ~76% of adopters vs ~23% of non-adopters are urban","Pretreatment: urban status can't be affected by adoption","Associated with treatment (adoption rates differ)","Associated with the outcome (urban areas have more complaints)"],
        },
        {
          kind: "interpret", q: r`The analyst subclassifies on <code>urban</code>, then on region within urban departments. Interpret the output.`,
          show: r`ru <- subset(cams, urban == 0)
ur <- subset(cams, urban == 1)
mean(ru$complaints[ru$camera == 1]) - mean(ru$complaints[ru$camera == 0])
mean(ur$complaints[ur$camera == 1]) - mean(ur$complaints[ur$camera == 0])
for (rg in c("coast", "valley", "hills")) {
  d <- subset(ur, region == rg)
  cat(rg, mean(d$complaints[d$camera == 1]) - mean(d$complaints[d$camera == 0]), "\n")
}`,
          a: r`<p>Within each type of area the sign flips: cameras are associated with about 2.5 (rural) to 3.6 (urban) <i>fewer</i> complaints. The naive +3 was confounding: urban departments both adopt cameras and draw more complaints. Within urban departments, the estimates by region (about −3 to −4) are similar to each other, so region doesn't appear to confound the urban comparison. Stable estimates across finer subclasses raise confidence, but they adjust only for observed variables.</p>`,
          rubric: ["Within-rural and within-urban estimates are both negative (≈ −2.5 and −3.6)","Explains the sign reversal as confounding by urban","Region-level estimates within urban departments are similar: region doesn't confound; stability raises confidence","Notes subclassification adjusts only for observed confounders"],
        },
        {
          kind: "write", q: r`(i) Why can confounding never be ruled out here, even after subclassification? Name a plausible unobserved confounder. (ii) A colleague proposes also subclassifying on "number of use-of-force incidents during the camera year." Why is that a mistake?`,
          a: r`<p>(i) Subclassification compares departments that share values of the variables we measured. Adoption was self-selected, so departments may differ in unmeasured ways related to both adoption and complaints, e.g., a reform-minded chief who both applies for grants and changes training. Only randomization balances unobservables. (ii) Use-of-force incidents during the camera year are <i>post-treatment</i>: cameras may change them. Conditioning on a variable affected by the treatment compares departments that differ in how the treatment worked and can bias the estimate. Confounders must be pretreatment.</p>`,
          rubric: ["Unobserved confounders can't be adjusted for in observational data","Gives a plausible unobserved confounder linked to both adoption and complaints","Identifies use-of-force as post-treatment","Explains why conditioning on post-treatment variables biases the effect"],
        },
      ],
    },
    {
      id: "c2did", sec: "2.5.3", title: "Three designs on one data set: automatic voter registration",
      setup: r`set.seed(5)
avr <- data.frame(state = rep(c("A", "B"), c(60, 80)))
avr$turnBefore <- round(50 + 5 * (avr$state == "A") + rnorm(140, 0, 4), 1)
avr$turnAfter <- round(avr$turnBefore - 3 + 2 * (avr$state == "A") + rnorm(140, 0, 2), 1)`,
      context: r`<p>State A adopted automatic voter registration (AVR) between two midterm elections; neighboring state B did not. The data frame <code>avr</code> has one row per county (60 in A, 80 in B):</p>
<table><tr><td><code>state</code></td><td><code>"A"</code> (adopted AVR) or <code>"B"</code></td></tr><tr><td><code>turnBefore</code></td><td>county turnout (%) in the midterm before AVR</td></tr><tr><td><code>turnAfter</code></td><td>county turnout (%) in the midterm after AVR</td></tr></table>`,
      parts: [
        {
          kind: "interpret", q: r`These lines compute three different estimates of AVR's effect. Name the design each line implements and interpret each number.`,
          show: r`A <- subset(avr, state == "A")
B <- subset(avr, state == "B")
mean(A$turnAfter) - mean(B$turnAfter)                 # cross-section
Adiff <- mean(A$turnAfter) - mean(A$turnBefore)       # before-and-after (A only)
Bdiff <- mean(B$turnAfter) - mean(B$turnBefore)
Adiff
Adiff - Bdiff                                         # difference-in-differences`,
          a: r`<p>Cross-section ≈ +7.7 points, before-and-after ≈ −0.9 points, DiD ≈ +2.2 points. Three designs on the same data give three very different answers, because each relies on a different assumption about the counterfactual.</p>`,
          rubric: ["Line 3 = cross-section (A after − B after) ≈ +7.7","Adiff = before-and-after for A ≈ −0.9","Adiff − Bdiff = difference-in-differences ≈ +2.2","Notes that three designs on the same data disagree because they assume different counterfactuals"],
        },
        {
          kind: "write", q: r`Explain why each estimate differs, in terms of which confounders each design removes and which it leaves in.`,
          a: r`<ul><li><b>Cross-section (+7.7)</b> compares the states after AVR. It is biased by every time-invariant difference between A and B: state A's counties had higher turnout even <i>before</i> AVR (about 5 points higher), and that level difference is wrongly credited to AVR.</li>
<li><b>Before-and-after (−0.9)</b> compares A with itself, so it removes all unit-specific confounders that don't change over time (like A's higher baseline). But it absorbs the common time trend: turnout fell about 3 points everywhere between the two midterms (see B), and that decline is wrongly credited to AVR.</li>
<li><b>DiD (+2.2)</b> uses B's change to estimate the trend A would have followed without AVR, and subtracts it. It removes both time-invariant state differences and the common trend, leaving bias only from time-varying differences between the states.</li></ul>`,
          rubric: ["Cross-section absorbs the pre-existing level difference between states","Before-and-after removes time-invariant confounders but absorbs the time trend","DiD removes both by using the control group's change as the counterfactual trend","Connects each number to its source of bias"],
        },
        {
          kind: "write", q: r`State DiD's key assumption in terms of this study. Give one concrete story that would violate it and say which direction it would bias the estimate. How could earlier elections help?`,
          a: r`<p>Parallel trends: absent AVR, state A's average turnout would have changed by the same amount as state B's. It can't be verified, because A's no-AVR trend is counterfactual. Violation: suppose A also had a hotly contested governor's race in the second midterm, which B didn't. That would raise A's turnout for reasons unrelated to AVR, so DiD would <i>overstate</i> the effect. (A shrinking population of habitual voters in A would bias it the other way.) With turnout from several earlier midterms, you could check whether A and B moved in parallel before AVR. Parallel pre-trends make the assumption more credible but never prove it.</p>`,
          rubric: ["States parallel trends in context (A's counterfactual change equals B's change)","Notes it cannot be directly verified","Concrete time-varying violation with the correct bias direction","Pre-period trends as a credibility check, not proof"],
        },
        {
          kind: "write", q: r`Which quantity does the DiD estimate target: the SATE or the SATT? Write its definition and explain why the distinction matters for a state considering AVR.`,
          a: r`<p>DiD estimates the <b>SATT</b>: \(\text{SATT} = \frac{1}{n_1}\sum_{i=1}^{n} T_i\{Y_i(1) - Y_i(0)\}\), the average effect among the treated units (A's counties), where \(n_1 = \sum_i T_i\). It's built from the treated group's observed change and a counterfactual for <i>that</i> group only. A different state considering AVR is not part of the treated group; if its counties differ (say, lower baseline registration), the effect could be different there. The SATT is not automatically the effect for everyone.</p>`,
          rubric: ["Identifies SATT","Correct formula with the treatment indicator and n1","Explains it is the effect for the treated units only, so generalization to other states is not automatic"],
        },
        {
          kind: "interpret", q: r`The analyst repeats the three estimates with medians. Why is this a useful robustness check, and what does the output tell you?`,
          show: r`A <- subset(avr, state == "A")
B <- subset(avr, state == "B")
median(A$turnAfter) - median(B$turnAfter)
Amed <- median(A$turnAfter) - median(A$turnBefore)
Bmed <- median(B$turnAfter) - median(B$turnBefore)
Amed
Amed - Bmed`,
          a: r`<p>Median versions: cross-section ≈ 6.1, before-and-after ≈ −1.25, DiD ≈ 1.3. The median is robust to outliers: a few counties with unusual swings could drive mean-based estimates but barely move medians. The median DiD is somewhat smaller than the mean DiD but has the same sign, and the ranking of the three designs is unchanged. So the conclusion (a modest positive effect, with cross-section and before-and-after misleading) does not hinge on extreme counties.</p>`,
          rubric: ["Reads the median versions (≈ 6.1, −1.25, 1.3)","Explains the median is less sensitive to outliers","Compares with the mean-based results: same signs and ranking, so the conclusion is robust"],
        },
      ],
    },
    {
      id: "c2dih", sec: "2.5.3", title: "Difference-in-differences by hand",
      setup: r``,
      context: r`<p>A city introduced free transit fares for students; a comparable city did not. The share of students missing more than 10% of school days is:</p>
<table><tr><td></td><td>Before</td><td>After</td></tr><tr><td>Treated city</td><td>0.42</td><td>0.37</td></tr><tr><td>Comparison city</td><td>0.38</td><td>0.36</td></tr></table>`,
      parts: [
        {
          kind: "write", q: r`Compute the cross-section, before-and-after, and DiD estimates. What is the estimated counterfactual chronic-absence rate for the treated city after the policy?`,
          a: r`<p>Cross-section: 0.37 − 0.36 = +0.01 (it even looks harmful). Before-and-after: 0.37 − 0.42 = −0.05. DiD: (0.37 − 0.42) − (0.36 − 0.38) = −0.05 − (−0.02) = <b>−0.03</b>, a 3-point reduction. Counterfactual: the treated city's before value plus the comparison city's change: 0.42 + (−0.02) = <b>0.40</b>. The DiD is then the observed 0.37 minus the counterfactual 0.40.</p>`,
          rubric: ["Cross-section +0.01","Before-and-after −0.05","DiD −0.03 with correct arithmetic","Counterfactual 0.40 = 0.42 + comparison change"],
        },
        {
          kind: "write", q: r`Describe the DiD figure for this example (what's plotted, where the counterfactual point sits, what the brace marks). Then suppose that, absent the policy, the treated city's absence rate would actually have fallen by 0.04 (it was already running attendance campaigns). What is the true effect, and what is DiD's bias?`,
          a: r`<p>The figure plots the absence rate (vertical) at Before and After (horizontal) for both cities: solid points for the treated city at 0.42 and 0.37, open points for the comparison city at 0.38 and 0.36. A dashed line starts at the treated city's 0.42 and runs parallel to the comparison city's line, ending at the counterfactual 0.40. The brace marks the vertical gap between 0.40 and the observed 0.37: the estimated effect. If the treated city would have fallen by 0.04 anyway, its true counterfactual is 0.38, so the true effect is 0.37 − 0.38 = −0.01. DiD's −0.03 overstates the reduction by 0.02 because parallel trends failed: the treated city had its own steeper downward trend.</p>`,
          rubric: ["Describes the axes and both groups' observed points","Counterfactual drawn parallel to the control trend from the treated baseline","True effect −0.01 under the stated trend","Bias of −0.02 (overstatement) due to non-parallel trends"],
        },
      ],
    },
    {
      id: "c2qnt", sec: "2.6.1", title: "Medians, quantiles, and a wage floor",
      setup: r`set.seed(15)
n <- 300
pay <- data.frame(before = sample(c(12, 12.5, 13, 13.5, 14, 15, 16, 17.5), n, replace = TRUE,
  prob = c(0.2, 0.15, 0.15, 0.1, 0.15, 0.1, 0.1, 0.05)))
pay$after <- ifelse(pay$before < 15, 15, pay$before)
pay$after[sample(n, 15)] <- 15.5
rm(n)`,
      context: r`<p>A city raised its minimum wage to $15. The data frame <code>pay</code> records the hourly starting wage at 300 restaurants <code>before</code> and <code>after</code> the change.</p>`,
      parts: [
        {
          kind: "write", q: r`By hand: find the median and mean of {2, 9, 4, 11, 7, 30} using the book's formula. Then replace 30 with 300 and recompute both. What general property does this illustrate, and when would you report the median instead of the mean?`,
          a: r`<p>Sorted: 2, 4, 7, 9, 11, 30. n = 6 is even, so the median is \(\frac{1}{2}(x_{(3)} + x_{(4)}) = (7 + 9)/2 = 8\). The mean is 63/6 = 10.5. With 300: the median is still 8; the mean is 333/6 = 55.5. The median depends only on the middle order statistics, so it is robust to outliers. The mean uses every value's magnitude. Report the median for skewed variables with extreme values (income, wealth, wages), or as a robustness check on mean-based estimates.</p>`,
          rubric: ["Sorts and applies the even-n formula: median 8","Means 10.5 and 55.5","Median unchanged with the outlier: robustness","Appropriate use case for the median"],
        },
        {
          kind: "interpret", q: r`Interpret this output. What happened to wages, and what does an IQR of 0 mean (and not mean)?`,
          show: r`summary(pay$before)
summary(pay$after)
IQR(pay$before)
IQR(pay$after)
quantile(pay$after, probs = seq(from = 0, to = 1, by = 0.1))`,
          a: r`<p>Before, wages spread from $12 to $17.50 with an IQR of $2.50. After, both quartiles equal $15, so the IQR is <b>0</b>: at least half of all restaurants pay exactly $15 (the deciles show it is at least 70%). An IQR of 0 doesn't mean there's no variation (the max is still $17.50); it means the middle 50% of values are identical. The deciles show wages bunch at the new floor and only the top 20% pay more. The policy raised low wages to the minimum but not above it.</p>`,
          rubric: ["Before: wages from $12 to $17.50, IQR $2.50","Reads the deciles: wages bunch at $15 and only the top ~20% pay more","IQR = 0 means the middle half of values are identical, not that there is no variation","Substantive conclusion: wages were raised to the floor but not beyond"],
        },
        {
          kind: "write", q: r`Define quartiles, terciles, quintiles, and deciles by the number of groups each creates. Which percentile is the lower quartile, and what does the IQR measure that the range does not?`,
          a: r`<p>Quantiles cut ordered data into equally sized groups: terciles 3, quartiles 4, quintiles 5, deciles 10, percentiles 100. The lower quartile is the 25th percentile (the median is the 50th, the upper quartile the 75th). The IQR (upper minus lower quartile) is the spread of the middle 50% of the data, so unlike the range (max − min) it is not driven by a single extreme value.</p>`,
          rubric: ["Correct group counts for each quantile type","Lower quartile = 25th percentile","IQR = spread of the middle 50%, robust to extremes unlike the range"],
        },
      ],
    },
    {
      id: "c2sd", sec: "2.6.2", title: "Standard deviation and the root mean square",
      setup: r`set.seed(8)
n <- 500
op <- data.frame(before = round(runif(n, 20, 80)))
op$after <- pmin(100, pmax(0, round(op$before + rnorm(n, 0.5, 18))))
rm(n)`,
      context: r`<p>The data frame <code>op</code> records 500 panel respondents' support (0–100) for a policy <code>before</code> and <code>after</code> a televised debate.</p>`,
      parts: [
        {
          kind: "write", q: r`By hand, for {2, 4, 4, 4, 5, 5, 7, 9}: compute the mean, the RMS, the standard deviation with denominator n and with n − 1, and the variance that <code>var()</code> would report. Which SD does <code>sd()</code> return?`,
          a: r`<p>Mean = 40/8 = 5. RMS = \(\sqrt{(4+16+16+16+25+25+49+81)/8} = \sqrt{232/8} = \sqrt{29} \approx 5.39\). Deviations: −3, −1, −1, −1, 0, 0, 2, 4; squared: 9, 1, 1, 1, 0, 0, 4, 16, which sum to 32. SD with n: \(\sqrt{32/8} = 2\). SD with n − 1: \(\sqrt{32/7} \approx 2.14\). <code>var()</code> uses n − 1: 32/7 ≈ 4.57. <code>sd()</code> returns 2.14 (the n − 1 version). The SD is the RMS of deviations from the mean.</p>`,
          rubric: ["Mean 5 and RMS √29 ≈ 5.39","Sum of squared deviations 32","SD 2 (n) and 2.14 (n − 1)","var() = 4.57; sd() uses n − 1"],
        },
        {
          kind: "interpret", q: r`Interpret these three numbers. Why are the first two so different, what does each say about the debate, and why are the last two nearly equal?`,
          show: r`mean(op$after - op$before)
sqrt(mean((op$after - op$before)^2))
sd(op$after - op$before)`,
          a: r`<p>The mean change is about −0.4 points, essentially zero. The RMS of the change is about 17.7 points. Individual changes are large but go in both directions and cancel in the mean. The mean says the debate didn't move <i>net</i> opinion; the RMS says the typical respondent moved about 18 points one way or the other. Because the mean change is near zero, the SD of the change is almost the same as its RMS.</p>`,
          rubric: ["Mean change ≈ 0 and RMS ≈ 17.7","Explains cancellation of positive and negative changes","Interprets net vs individual-level movement","SD ≈ RMS because the mean change is near zero"],
        },
        {
          kind: "write", q: r`Support after the debate has a mean of 50 and a standard deviation of 18. Using the book's rule of thumb, what range of values should contain almost all respondents? Why is the variance harder to interpret here?`,
          a: r`<p>Few data points lie more than 2–3 SDs from the mean, so almost everyone should fall within about 50 ± 36 to 50 ± 54, i.e. roughly 14 to 86 (and the 0–100 scale caps the rest). The variance is 18² = 324 in squared points: squared units have no natural meaning on a support scale, which is why we report the SD, which is in points.</p>`,
          rubric: ["Applies the 2–3 SD rule to get a range around 50","Variance is in squared units, so not directly interpretable","SD is in the original units"],
        },
      ],
    },
    {
      id: "c2syn", sec: "2.7", title: "Synthesis: choosing a research design",
      setup: r``,
      context: r`<p>For each question below, name the design you would use (RCT, cross-section comparison, subclassification, before-and-after, or difference-in-differences), its key identifying assumption, the confounding it removes and what it leaves, and its estimand.</p>`,
      parts: [
        {
          kind: "write", q: r`(i) A university randomly assigns first-year roommates. Does living with a politically active roommate raise a student's own participation? (ii) Did a state's paid-sick-leave mandate change restaurant employment, given employment counts for that state and a neighboring state before and after?`,
          a: r`<p>(i) A natural RCT: roommate assignment is random, so students with active and inactive roommates are comparable on average. Difference-in-means estimates the SATE among these students. Assumption: assignment is truly random. It removes all confounding (observed and unobserved), but external validity is limited to this university's students. (ii) DiD: compare the change in the mandate state with the change in the neighboring state. Assumption: parallel trends in employment absent the mandate. It removes time-invariant state differences and common shocks but not state-specific shocks in the same period. Estimand: SATT (effect for the mandate state's restaurants).</p>`,
          rubric: ["(i) Random assignment: RCT, SATE, assumption of true randomization","(i) Notes the external validity limit","(ii) DiD with the parallel trends assumption","(ii) What DiD removes vs leaves, and SATT as the estimand"],
        },
        {
          kind: "write", q: r`(iii) Do people who attend a campaign rally turn out at higher rates than those who don't, using one post-election survey? (iv) Did statewide vote-by-mail raise turnout, using that state's turnout in the elections just before and after the switch, with no comparison state?`,
          a: r`<p>(iii) Cross-section comparison, ideally with subclassification on pretreatment variables such as party, age, and past turnout. Assumption: attendees and non-attendees are comparable within subclasses. Self-selection is severe: political interest drives both rally attendance and voting and is hard to measure fully, so confounding can't be ruled out. (iv) Before-and-after. It removes the state's time-invariant characteristics but not time-varying confounders. If, say, the "after" election was a presidential race and the "before" a midterm, turnout would rise anyway. A comparison state that didn't switch would turn this into a DiD and address the common trend.</p>`,
          rubric: ["(iii) Cross-section/subclassification with the comparability assumption","(iii) Self-selection by political interest as the key confounder","(iv) Before-and-after removes time-invariant factors but not time trends","(iv) Proposes adding a comparison state (DiD) and names a time-varying confounder"],
        },
      ],
    },
  ],
};
