// Assessment, Chapter 3: Measurement. New studies and data; the book's methods and R functions.
// Like the exam, nothing asks you to write code: parts are written answers, predicting output, or interpreting shown code and output.
const r = String.raw;

export default {
  id: "ch3", short: "Chapter 3", title: "Chapter 3: Measurement",
  intro: "Surveys and sampling, missing data, nonresponse and sensitive questions, plots for one and two variables, z-scores and correlation, latent concepts, matrices and lists, and k-means clustering. Where a problem shows code, its output and plots appear right under it.",
  items: [
    {
      id: "c3svy", sec: "3.1–3.2", title: "A survey of displaced people",
      setup: r`set.seed(303)
n <- 1870
idp <- data.frame(camp = sample(c("Akot", "Bira", "Dulo", "Kesh", "Mora"), n, replace = TRUE,
  prob = c(0.3, 0.2, 0.2, 0.15, 0.15)))
idp$age <- round(pmin(85, 16 + rexp(n, 1 / 17)))
risk <- c(Akot = 0.5, Bira = 0.3, Dulo = 0.2, Kesh = 0.45, Mora = 0.25)[idp$camp]
idp$harass.police <- rbinom(n, 1, risk)
idp$harass.militia <- rbinom(n, 1, pmin(0.9, 0.15 + 0.5 * idp$harass.police * risk + 0.1))
miss.p <- ifelse(idp$camp %in% c("Akot", "Kesh"), 0.06, 0.01)
idp$harass.police[runif(n) < miss.p] <- NA
idp$harass.militia[runif(n) < miss.p * 1.6] <- NA
rm(n, risk, miss.p)`,
      context: r`<p>Researchers interviewed people living in five camps for internally displaced persons. Interviewers contacted 2,150 adults; 280 refused. The data frame <code>idp</code> has one row per completed interview:</p>
<table><tr><td><code>camp</code></td><td>camp name</td></tr><tr><td><code>age</code></td><td>age in years</td></tr><tr><td><code>harass.police</code></td><td>1 if the respondent or family was harassed by police in the past year (<code>NA</code> = no answer)</td></tr><tr><td><code>harass.militia</code></td><td>same, for militia groups</td></tr></table>`,
      parts: [
        {
          kind: "write", q: r`Compute the participation rate and the refusal rate. What kind of nonresponse do the 280 refusals represent, and under what condition do they bias the survey's estimates?`,
          a: r`<p>Completed interviews = 2,150 − 280 = 1,870. Participation rate = 1,870 / 2,150 ≈ <b>87.0%</b>; refusal rate ≈ 13.0%. Refusing the whole survey is <b>unit nonresponse</b>. It biases estimates only if refusers differ systematically from participants on what we measure. For example, if people who were harassed are more fearful of strangers and refuse more often, the survey would understate harassment.</p>`,
          rubric: ["Participation 87.0% (1,870 / 2,150)","Identifies unit nonresponse","Bias condition: respondents differ systematically from refusers","Gives a plausible direction of bias"],
        },
        {
          kind: "interpret", q: r`Interpret this table and the three numbers below it. What distinguishes the joint from the marginal proportions here, and who is excluded from the table?`,
          show: r`tab <- prop.table(table(police = idp$harass.police, militia = idp$harass.militia))
tab
sum(tab[2, ])   # harassed by police (second row)
sum(tab[, 2])   # harassed by militia (second column)
tab[2, 2]       # both`,
          a: r`<p>Each cell is a <i>joint</i> proportion of respondents who answered both questions, so all four cells sum to 1. A <i>marginal</i> proportion is a row or column sum: police ≈ 0.34 (row "1"), militia ≈ 0.33 (column "1"), both ≈ 0.15 (the one cell). These exclude anyone with a missing answer to either question. That is what <code>table()</code> does by default.</p>`,
          rubric: ["Cells are joint proportions summing to 1","Marginal shares are row and column sums (police ≈ 0.34, militia ≈ 0.33)","Both ≈ 0.15 is the single (1, 1) cell","table() silently drops anyone missing either answer"],
        },
        {
          kind: "interpret", q: r`The analyst redoes the table counting missing answers as a category. Interpret the NA row and column, the two sums, and the camp-by-camp rates. Is nonresponse random?`,
          show: r`tab <- prop.table(table(police = idp$harass.police, militia = idp$harass.militia, exclude = NULL))
tab
sum(tab[3, ])   # police question missing (NA row)
sum(tab[, 3])   # militia question missing (NA column)
tapply(is.na(idp$harass.militia), idp$camp, mean)`,
          a: r`<p><code>exclude = NULL</code> adds an <code>&lt;NA&gt;</code> row and column. Police nonresponse is the NA row's sum (about 3%); militia nonresponse is the NA column's sum (about 5%). By camp, militia nonresponse is about 8–9% in Akot and Kesh versus 1–3% elsewhere: it's systematic, concentrated in the camps where harassment is most common. If people who were harassed are the ones skipping the question, analyses that drop the missing answers will understate militia harassment.</p>`,
          rubric: ["exclude = NULL adds the <NA> row and column","Reads police nonresponse (~3%, NA row) and militia nonresponse (~5%, NA column)","tapply(is.na(x), camp, mean) gives each camp's nonresponse rate","Concludes nonresponse is systematic (Akot, Kesh) and explains the resulting bias"],
        },
        {
          kind: "predict", q: r`Work on this toy data frame. Predict every output, then explain why the first two numbers differ.`,
          show: r`df <- data.frame(a = c(1, NA, 3, 4, NA), b = c("x", "y", NA, "x", "y"), c = c(10, 20, 30, NA, 50))
nrow(na.omit(df))
length(na.omit(df$c))
mean(df$c)
mean(df$c, na.rm = TRUE)
mean(is.na(df$a))`,
          a: r`<p><code>na.omit(df)</code> does listwise deletion: it drops any row with at least one missing value. Only row 1 is complete, so 1 row remains. <code>na.omit(df$c)</code> drops missing values from <code>c</code> alone, leaving 4. <code>mean(df$c)</code> is <code>NA</code>; with <code>na.rm = TRUE</code> it is (10+20+30+50)/4 = 27.5. <code>is.na(df$a)</code> is FALSE TRUE FALSE FALSE TRUE, so its mean is 0.4. Listwise deletion threw away four respondents who answered most questions, which is the cost the book warns about.</p>`,
          rubric: ["Listwise deletion leaves 1 row","Variable-level na.omit leaves 4","NA, then 27.5","Proportion missing 0.4","Explains the cost of listwise deletion"],
        },
      ],
    },
    {
      id: "c3hist", sec: "3.3.1–3.3.2", title: "Histograms and density",
      setup: r`set.seed(303)
n <- 1870
idp <- data.frame(camp = sample(c("Akot", "Bira", "Dulo", "Kesh", "Mora"), n, replace = TRUE,
  prob = c(0.3, 0.2, 0.2, 0.15, 0.15)))
idp$age <- round(pmin(85, 16 + rexp(n, 1 / 17)))
idp$hh <- pmin(12, rpois(n, 4.5))
rm(n)`,
      context: r`<p>The displaced-persons survey from the previous problem is loaded as <code>idp</code>, now with <code>age</code> and <code>hh</code> (household size, a whole number from 0 to 12).</p>`,
      parts: [
        {
          kind: "write", q: r`A histogram of 1,000 respondents' ages uses unequal bins: [18, 30) has 240 people, [30, 45) has 300, [45, 65) has 320, and [65, 90) has 140. Compute the density for each bin. Which bin is tallest? Why can a density exceed 1 if age is measured in decades?`,
          a: r`<p>Density = proportion ÷ bin width. [18, 30): 0.24 / 12 = 0.020; [30, 45): 0.30 / 15 = 0.020; [45, 65): 0.32 / 20 = 0.016; [65, 90): 0.14 / 25 = 0.0056. The two youngest bins tie for tallest, even though [45, 65) has the most people, because it is wider. The <i>area</i> of a bin is its proportion, so all areas sum to 1. Measured in decades, the widths become 1.2, 1.5, 2.0, 2.5, so the densities multiply by 10 (e.g. 0.20). For any narrow enough bin (width under 1 unit) a density can exceed 1. Density is proportion per unit of the horizontal axis, not a proportion.</p>`,
          rubric: ["All four densities correct","Most people ≠ tallest bar: wider bins are shorter","Areas are proportions and sum to 1","Density depends on the units of the axis and can exceed 1"],
        },
        {
          kind: "interpret", q: r`Explain what each argument and line does, why <code>breaks</code> is set this way rather than left to R's defaults, and what the plot shows.`,
          show: r`hist(idp$hh, freq = FALSE, breaks = seq(from = -0.5, to = 12.5, by = 1),
     xlab = "Household size", main = "Distribution of household size")
abline(v = median(idp$hh))
text(x = median(idp$hh) + 1, y = 0.2, "median")
median(idp$hh)`,
          a: r`<p><code>freq = FALSE</code> plots density instead of counts. Breaks at −0.5, 0.5, …, 12.5 put each integer value in the center of its own bin, so each bar's height is the proportion of households of exactly that size (width 1). The default bins [0, 1), [1, 2), … are centered on 0.5, 1.5, …, which aren't values household size can take, so bars would not line up with the actual values. <code>abline()</code> and <code>text()</code> add layers to the existing plot.</p>`,
          rubric: ["freq = FALSE plots density instead of counts","breaks = seq(-0.5, 12.5, by = 1) centers one bin on each integer","Default bins would be centered on 0.5, 1.5, …, values household size can't take","abline() and text() add layers to the existing plot; reads the median (4)"],
        },
        {
          kind: "interpret", q: r`The analyst compares two camps' age distributions. Explain why the code uses density rather than frequency and identical axis limits, and interpret the plots.`,
          show: r`par(mfrow = c(1, 2))
hist(idp$age[idp$camp == "Akot"], freq = FALSE, xlim = c(15, 90), ylim = c(0, 0.07),
     xlab = "Age", main = "Akot")
hist(idp$age[idp$camp == "Mora"], freq = FALSE, xlim = c(15, 90), ylim = c(0, 0.07),
     xlab = "Age", main = "Mora")
table(idp$camp)`,
          a: r`<p>Akot has almost twice as many respondents as Mora, so frequency bars would differ in height just because of sample size. Density puts both on a proportion-per-year scale. Identical <code>xlim</code> and <code>ylim</code> let the eye compare the shapes directly; without them R picks different scales and similar distributions can look different. Both distributions are right-skewed: many young adults and a long tail of older respondents.</p>`,
          rubric: ["par(mfrow = c(1, 2)) puts the plots side by side","Density because the camps have different numbers of respondents","Identical xlim/ylim so the shapes can be compared directly","Describes the right skew in both camps"],
        },
      ],
    },
    {
      id: "c3box", sec: "3.3.3–3.3.4", title: "Box plots and saving graphs",
      setup: r`set.seed(17)
dmv <- data.frame(office = rep(c("Central", "East", "North"), c(120, 90, 100)))
dmv$wait <- round(ifelse(dmv$office == "Central", rlnorm(310, log(18), 0.5),
  ifelse(dmv$office == "East", rlnorm(310, log(12), 0.35), rlnorm(310, log(25), 0.3))))
dmv$wait[c(5, 40, 150)] <- NA`,
      context: r`<p>The data frame <code>dmv</code> records waiting times (minutes) for 310 visitors at three licensing offices: <code>office</code> and <code>wait</code> (three waits are missing).</p>`,
      parts: [
        {
          kind: "write", q: r`One office's waits have Min 2, lower quartile 10, median 14, upper quartile 22, and Max 61. The five largest values are 33, 38, 45, 50, 61. Describe the box plot exactly: where the box and line are, where each whisker ends, and which points are drawn as open circles.`,
          a: r`<p>IQR = 22 − 10 = 12, so 1.5 × IQR = 18. The box runs from 10 to 22 with a line at the median, 14. Upper limit: 22 + 18 = 40. The upper whisker ends at the largest value within that limit, <b>38</b>; 45, 50, and 61 lie beyond it and are drawn as open circles. Lower limit: 10 − 18 = −8, below the minimum, so the lower whisker ends at the minimum, <b>2</b>, with no circles below.</p>`,
          rubric: ["IQR 12 and 1.5 × IQR = 18","Box 10–22 with median line at 14","Upper whisker ends at 38 (largest value ≤ 40); 45, 50, 61 are circles","Lower whisker ends at the minimum 2 because the limit is −8"],
        },
        {
          kind: "interpret", q: r`Interpret the box plots and the means. How does <code>na.rm = TRUE</code> reach <code>mean()</code>? When is this display better than three histograms?`,
          show: r`boxplot(wait ~ office, data = dmv, ylab = "Wait (minutes)", main = "Waiting time by office")
tapply(dmv$wait, dmv$office, mean, na.rm = TRUE)`,
          a: r`<p>The formula <code>wait ~ office</code> draws one box per level of <code>office</code> using variables from <code>data = dmv</code>. In <code>tapply()</code>, <code>na.rm = TRUE</code> after the function name is passed through to <code>mean()</code> for each group. North has the longest typical wait, East the shortest, and Central the most spread and the most high outliers. Box plots excel at compact side-by-side comparison of several distributions; a single histogram shows one distribution's full shape (e.g. bimodality) better.</p>`,
          rubric: ["y ~ group draws one box per office","Compares medians and spreads: North longest, East shortest, Central most spread","na.rm = TRUE after the function name is passed through to mean()","Box plots for comparing several groups compactly; histograms for one distribution's shape"],
        },
        {
          kind: "write", q: r`The analyst saves the box plot with the code below. Explain what each line does and what happens if the last line is forgotten. Then describe the layout <code>par(mfcol = c(2, 2))</code> would produce for four plots drawn in order.
<pre class=code>pdf(file = "waits.pdf", width = 6, height = 4)
boxplot(wait ~ office, data = dmv, ylab = "Wait (minutes)")
dev.off()</pre>`,
          a: r`<p><code>pdf()</code> opens a PDF file 6 inches wide and 4 tall as the graphics device, the plot draws into it rather than on screen, and <code>dev.off()</code> closes the device and writes the file. Without <code>dev.off()</code>, the file stays open and incomplete, and later plots keep going into it. <code>mfcol = c(2, 2)</code> makes a 2 × 2 grid filled <i>column by column</i>: plots 1 and 2 go down the left column, 3 and 4 down the right. (<code>mfrow</code> fills row by row.)</p>`,
          rubric: ["pdf() opens a file device with the given size","dev.off() closes it and writes the file","Forgetting dev.off() leaves the file incomplete","mfcol fills column by column (contrast with mfrow)"],
        },
      ],
    },
    {
      id: "c3samp", sec: "3.4.1", title: "Designing a city survey",
      setup: r`set.seed(12)
blocks <- data.frame(pop = round(rlnorm(600, log(900), 0.9)), income = round(rlnorm(600, log(52), 0.35)))
blocks$sampled <- 0
blocks$sampled[sample(600, 40)] <- 1`,
      context: r`<p>A city wants to estimate the share of adults who distrust the police. The options on the table:</p>
<ol><li>Interviewers at transit stations fill quotas so the sample matches the census on age, gender, and race.</li>
<li>Simple random sample of addresses from the postal delivery list.</li>
<li>Random digit dialing of phone numbers in the city's area codes.</li>
<li>Randomly sample 40 of the city's 600 census blocks, then 10 households within each sampled block.</li></ol>
<p>For option 4, the data frame <code>blocks</code> lists all 600 blocks: <code>pop</code> (residents), <code>income</code> (median household income, $ thousands), and <code>sampled</code> (1 if chosen).</p>`,
      parts: [
        {
          kind: "write", q: r`Which options are probability samples? Explain why option 1 can fail even if its sample matches the census perfectly on age, gender, and race, and connect this to a problem from Chapter 2.`,
          a: r`<p>Options 2, 3, and 4 are probability samples: every unit has a known, nonzero chance of selection. Option 1 is quota sampling. Matching on observed traits doesn't make the sample representative on <i>unobserved</i> ones: transit riders who agree to stop for an interviewer may distrust police more or less than demographically identical adults who drive or decline. Interviewers also choose whom to approach. This is the same problem as observational studies: balance on observed covariates does not imply balance on unobserved ones. Random selection, like random assignment, removes it (the 1948 polls that predicted Dewey used quotas).</p>`,
          rubric: ["Probability sampling = known nonzero selection probability; options 2–4","Quota matching on observables leaves unobservables unbalanced","Mentions interviewer discretion / self-selection of respondents","Explicit parallel to observational studies vs. randomization"],
        },
        {
          kind: "write", q: r`What is a sampling frame, and what coverage problem does each of options 2 and 3 have? Why might the city prefer option 4 anyway, and what does it give up?`,
          a: r`<p>A sampling frame is the complete list of units we sample from. Address lists miss people in informal housing, shelters, or unlisted units (often the people with the most police contact). Random digit dialing misses people without phones and over-represents people with several numbers. Option 4 is multistage cluster sampling: it needs only a list of blocks (easy to get) and sends interviewers to just 40 places (much cheaper). It gives up precision, because households in the same block resemble each other, and individuals' selection probabilities are known only through the design, not equal by construction as in SRS.</p>`,
          rubric: ["Defines a sampling frame","Coverage gap for addresses and for phones, with who is missed","Cluster sampling's advantages: available frame of clusters, lower cost","What it gives up (less precision / correlated units)"],
        },
        {
          kind: "interpret", q: r`The analyst checks whether the 40 sampled blocks resemble the other 560. Why is population logged? Interpret the plots and medians, and say what this check can and cannot establish.`,
          show: r`par(mfrow = c(1, 2))
boxplot(log(pop) ~ sampled, data = blocks, names = c("Not sampled", "Sampled"), ylab = "log population")
boxplot(income ~ sampled, data = blocks, names = c("Not sampled", "Sampled"), ylab = "Median income ($1000s)")
tapply(log(blocks$pop), blocks$sampled, median)
tapply(blocks$income, blocks$sampled, median)`,
          a: r`<p>Block population is heavily right-skewed (a few very large blocks), so the log makes the comparison readable. The medians and spreads are similar for sampled and non-sampled blocks on both variables, which is what random selection should produce on average. This checks only observed characteristics; randomization is what justifies representativeness on the unobserved ones.</p>`,
          rubric: ["Population is right-skewed, so the log makes the comparison readable","names = gives the box labels","Medians and spreads are similar, as random selection should produce","The check covers only observed variables; randomization justifies the unobserved ones"],
        },
        {
          kind: "write", q: r`Random sampling and random assignment both use chance. For each, say which comparison it makes credible and which kind of validity it supports. Could a study have one without the other?`,
          a: r`<p>Random <i>assignment</i> makes the treatment and control groups comparable, so outcome differences can be attributed to treatment: <b>internal</b> validity. Random <i>sampling</i> makes the sample comparable to the target population, so sample results generalize: <b>external</b> validity. They are independent: an RCT on a convenience sample of students has the first without the second; a national random-sample survey comparing people who chose to volunteer with those who didn't has the second without the first.</p>`,
          rubric: ["Assignment → treated vs control comparability → internal validity","Sampling → sample vs population comparability → external validity","Gives an example of each without the other"],
        },
      ],
    },
    {
      id: "c3log", sec: "3.4.1", title: "Logarithms",
      setup: r``,
      context: r`<p>\(y = \log_b x\) means \(x = b^y\). The natural log uses base \(e \approx 2.718\); R's <code>log()</code> uses base \(e\) unless you set <code>base</code>.</p>`,
      parts: [
        {
          kind: "predict", q: r`Predict each value.`,
          show: r`log(1000, base = 10)
log(0.01, base = 10)
log(8, base = 2)
log(1)
exp(log(42))
log(exp(3))
log(c(20000, 200000)) - log(c(2000, 20000))`,
          a: r`<p>3, −2 (counting zeros: \(10^{-2} = 0.01\)), 3, 0 (since \(e^0 = 1\)), 42 and 3 (log and exp are inverses), and <code>2.302585 2.302585</code>: \(\log(10x) - \log(x) = \log 10\) whatever \(x\) is. On the log scale, equal <i>ratios</i> become equal <i>distances</i>.</p>`,
          rubric: ["Base-10 values 3 and −2; base-2 value 3","log(1) = 0","exp and log undo each other (42 and 3)","Last line: both differences equal log(10) ≈ 2.303"],
        },
        {
          kind: "write", q: r`Why does the book log-transform income and population? What happens to a village with population 0, and to a negative value? After you average log incomes and take <code>exp()</code> of the result, do you get back the mean income? Explain.`,
          a: r`<p>Income and population are positive and right-skewed: a few huge values stretch the scale and squash everyone else. The log compresses large values, which makes the distribution more symmetric and plots readable. The log is undefined at 0 (R returns <code>-Inf</code>) and for negative numbers (<code>NaN</code>), so such values must be handled first. And <code>exp(mean(log(x)))</code> is <i>not</i> the mean: it is the geometric mean, which is smaller than the arithmetic mean whenever values differ, because averaging on the log scale downweights large values.</p>`,
          rubric: ["Purpose: reduce right skew of positive variables","log(0) is -Inf and log of a negative is NaN: only positive values","exp(mean(log x)) ≠ mean(x); it is smaller (geometric mean)"],
        },
      ],
    },
    {
      id: "c3sens", sec: "3.4.2", title: "Asking about bribery",
      setup: r`set.seed(9)
n <- 1200
bribe <- data.frame(group = sample(c("control", "treat"), n, replace = TRUE))
sens <- rbinom(n, 1, 0.18)
base <- rbinom(n, 3, 0.45)
bribe$count <- base + ifelse(bribe$group == "treat", sens, 0)
rm(n, sens, base)`,
      context: r`<p>Researchers want the share of citizens who paid a bribe to a police officer last year. A random half of respondents (<code>"control"</code>) hear three non-sensitive items and report how many apply to them; the other half (<code>"treat"</code>) hear the same three plus "I paid a bribe to a police officer." The data frame <code>bribe</code> has <code>group</code> and <code>count</code> (the number reported).</p>`,
      parts: [
        {
          kind: "write", q: r`Why not just ask "Did you pay a bribe?" Name the bias, two other topics where it arises, and the institution that might object to direct questions in a dangerous setting.`,
          a: r`<p>Respondents may deny bribery because it's illegal and stigmatized: <b>social desirability bias</b>, giving the socially acceptable answer rather than the truthful one. It also arises for voting (people over-report turnout), racial prejudice, drug use, and sexual behavior. An Institutional Review Board (IRB), which reviews risks to human subjects, may not approve direct sensitive questions if answers could expose respondents (or interviewers) to danger.</p>`,
          rubric: ["Names social desirability bias and its direction (under-reporting)","Two other sensitive topics","IRB and why it might object"],
        },
        {
          kind: "interpret", q: r`Interpret the estimate and the table. Which respondents' answers reveal their answer to the sensitive item, and what are these problems called?`,
          show: r`mean(bribe$count[bribe$group == "treat"]) - mean(bribe$count[bribe$group == "control"])
table(response = bribe$count, group = bribe$group)`,
          a: r`<p>The groups are randomized and identical except for the extra item, so the difference in mean counts (about 0.18) estimates the proportion who paid a bribe. In the treatment group, a count of <b>4</b> (10 people) means they said yes to every item, including the bribe: a <b>ceiling effect</b>. A count of <b>0</b> (79 people) reveals they did <i>not</i> pay a bribe: a <b>floor effect</b>. Respondents who realize this may misreport (e.g. say 3 instead of 4), biasing the estimate downward.</p>`,
          rubric: ["The difference in mean counts (≈ 0.18) estimates the share who paid a bribe","Randomization makes the groups identical except for the extra item","Ceiling: a treatment count of 4 reveals yes","Floor: a treatment count of 0 reveals no; possible misreporting"],
        },
        {
          kind: "write", q: r`In a randomized response design, each respondent privately rolls a die: on a 1 they must say "yes," on a 6 they must say "no," and on 2–5 they answer truthfully. If 35% of respondents say "yes," what share actually paid a bribe? Why is each individual answer completely private?`,
          a: r`<p>\(P(\text{yes}) = \tfrac{1}{6} + \tfrac{4}{6}\pi\), where \(\pi\) is the true share. So \(0.35 = 0.1667 + 0.6667\,\pi\), giving \(\pi = (0.35 - 0.1667)/0.6667 \approx \mathbf{0.275}\). No individual "yes" can be interpreted: it may be a forced answer from rolling a 1. Because the die probabilities are known, the forced answers can be subtracted out in aggregate.</p>`,
          rubric: ["Sets up P(yes) = 1/6 + (4/6)π","Solves π ≈ 0.275","Explains privacy: any single answer could be forced by the die"],
        },
      ],
    },
    {
      id: "c3ideal", sec: "3.5", title: "Ideal points and measurement models",
      setup: r``,
      context: r`<p>In a one-dimensional spatial voting model, five legislators have ideal points −0.8, −0.2, 0.1, 0.5, and 0.9. Each votes for whichever of the status quo or the proposal is closer to their ideal point.</p>`,
      parts: [
        {
          kind: "write", q: r`The status quo is at 0.0 and a proposal at 0.6. Predict each vote and the outcome. What single point separates yea and nay voters? If instead the proposal were at −1.5 and every legislator voted nay, what would this roll call tell us about ideology?`,
          a: r`<p>The cutpoint is the midpoint (0.0 + 0.6)/2 = <b>0.3</b>: legislators above it are closer to the proposal. Votes: −0.8 nay, −0.2 nay, 0.1 nay (0.1 from the status quo vs 0.5 from the proposal), 0.5 yea, 0.9 yea, so it fails 2–3. A proposal everyone rejects (or everyone accepts) gives no information about ideology: all legislators sit on the same side of the cutpoint, so the vote can't distinguish their positions. Only divided votes help locate ideal points.</p>`,
          rubric: ["Cutpoint at the midpoint 0.3","Correct individual votes and the outcome (fails 2–3)","Unanimous votes are uninformative about relative positions"],
        },
        {
          kind: "write", q: r`In two dimensions (economic, social), a legislator's ideal point is (0.4, −0.3), the status quo is (0.0, 0.5), and the proposal is (0.6, 0.2). Which way do they vote? Then explain what a "latent concept" is, why ideal points need a measurement model, and how item response theory applies the same idea to standardized tests.`,
          a: r`<p>Euclidean distance to the status quo: \(\sqrt{0.4^2 + 0.8^2} = \sqrt{0.80} \approx 0.89\). To the proposal: \(\sqrt{0.2^2 + 0.5^2} = \sqrt{0.29} \approx 0.54\). The proposal is closer: <b>yea</b>. Ideology is <i>latent</i>: it can't be observed directly, only inferred from behavior. A measurement model (here, closer-option voting) links the unobserved ideal points to observed roll-call votes, and estimating it recovers the positions. Item response theory does the same with test-takers: ability plays the role of the ideal point, and each question's difficulty plays the role of the proposal's location, both estimated from right/wrong answers.</p>`,
          rubric: ["Computes both distances and concludes yea","Defines a latent concept as unobservable, inferred from behavior","A measurement model links latent traits to observed votes","IRT analogy: ability ↔ ideal point, question difficulty ↔ proposal/cutpoint"],
        },
      ],
    },
    {
      id: "c3cor", sec: "3.6.1–3.6.2", title: "z-scores and correlation",
      setup: r`set.seed(21)
yrs <- 1991:2020
ineq <- data.frame(year = yrs, gini = round(0.38 + 0.0018 * (yrs - 1991) + rnorm(30, 0, 0.004), 3))
sess <- data.frame(congress = 102:116, start = seq(from = 1991, to = 2019, by = 2))
sess$gap <- round(0.6 + 0.017 * (sess$start - 1991) + rnorm(15, 0, 0.03), 3)
rm(yrs)
x <- c(1, 2, 3, 4, 5)
y <- c(2, 4, 5, 4, 5)`,
      context: r`<p>Two vectors are loaded: <code>x &lt;- c(1, 2, 3, 4, 5)</code> and <code>y &lt;- c(2, 4, 5, 4, 5)</code>. Also loaded: <code>ineq</code> (annual Gini coefficient, 1991–2020: <code>year</code>, <code>gini</code>) and <code>sess</code> (15 two-year legislative sessions starting 1991, 1993, …, 2019: <code>congress</code>, <code>start</code>, and <code>gap</code>, the distance between the two parties' median ideal points).</p>`,
      parts: [
        {
          kind: "write", q: r`By hand, using denominators of n: compute the z-scores of <code>x</code> and the correlation of <code>x</code> and <code>y</code> as the average product of z-scores.`,
          a: r`<p>\(\bar x = 3\), deviations −2, −1, 0, 1, 2, \(S_x = \sqrt{10/5} = \sqrt 2 \approx 1.414\), z-scores ≈ −1.41, −0.71, 0, 0.71, 1.41. \(\bar y = 4\), deviations −2, 0, 1, 0, 1, \(S_y = \sqrt{6/5} \approx 1.095\). The products of deviations sum to (−2)(−2) + 0 + 0 + 0 + 2·1 = 6, so \(r = \frac{1}{5}\cdot\frac{6}{\sqrt2 \cdot 1.095} = \frac{6}{\sqrt{10 \cdot 6}} \approx \mathbf{0.775}\). (Using n − 1 throughout gives the same r: the denominators cancel.)</p>`,
          rubric: ["Means and SDs with n (√2 and √1.2)","z-scores of x","Sum of cross-products 6","r ≈ 0.775"],
        },
        {
          kind: "predict", q: r`Predict each correlation without computing from scratch. Explain using the z-score property.`,
          show: r`cor(x, y)
cor(x, 100 * y + 5)
cor(-2 * x, y)
cor(x, (y - mean(y)) / sd(y))`,
          a: r`<p>The z-score of \(ax + b\) equals the z-score of \(x\) when \(a &gt; 0\), so rescaling and shifting don't change the correlation: 0.775 for the first, second, and fourth lines. When \(a &lt; 0\), every z-score flips sign, so the correlation flips: <code>cor(-2 * x, y)</code> = −0.775. Correlation is unit-free.</p>`,
          rubric: ["Positive rescaling/shifting leaves r unchanged (0.775)","Negative multiplier flips the sign (−0.775)","Standardizing y also leaves r unchanged","Explains via invariance of z-scores"],
        },
        {
          kind: "interpret", q: r`The analyst correlates inequality with polarization, matching each two-year session to one year of Gini data. Explain what each <code>seq()</code> call selects, interpret all four correlations, and say what a careful researcher should conclude.`,
          show: r`second <- ineq$gini[seq(from = 2, to = nrow(ineq), by = 2)]   # 1992, 1994, ..., 2020
cor(second, sess$gap)
first <- ineq$gini[seq(from = 1, to = nrow(ineq), by = 2)]    # 1991, 1993, ..., 2019
cor(first, sess$gap)
cor(ineq$year, ineq$gini)
cor(sess$start, sess$gap)`,
          a: r`<p>The annual series has 30 values and the session series 15, so you must pick one Gini value per session. <code>seq(from = 2, to = nrow(ineq), by = 2)</code> picks years 2, 4, …, 30 (1992, …, 2020), one per session. The correlation is about 0.96. Picking first years gives a slightly different value (about 0.92): alignment choices matter and should be stated. Both series also correlate above 0.9 with time itself. Any two variables that trend upward together will be highly correlated, so this is association, not evidence that inequality causes polarization.</p>`,
          rubric: ["seq(from = 2, ..., by = 2) picks the second year of each session; from = 1 picks the first","Reads the aligned correlation (~0.96) and notes the alignment choice changes it (~0.92)","Both series correlate above 0.9 with time","Common trends make a high correlation weak evidence of causation"],
        },
      ],
    },
    {
      id: "c3gini", sec: "3.6.2", title: "Gini coefficient by hand",
      setup: r``,
      context: r`<p>A four-person economy has incomes 10, 20, 30, and 40.</p>`,
      parts: [
        {
          kind: "write", q: r`Compute the points of the Lorenz curve, the area B under it (use trapezoids), area A, and the Gini coefficient \(A/(A+B)\).`,
          a: r`<p>Total income is 100, so the income shares are 0.1, 0.2, 0.3, 0.4. Cumulative population: 0.25, 0.5, 0.75, 1. Cumulative income: 0.1, 0.3, 0.6, 1.0. Lorenz curve points: (0, 0), (0.25, 0.1), (0.5, 0.3), (0.75, 0.6), (1, 1). Area B as trapezoids of width 0.25: \(0.25\cdot\frac{0+0.1}{2} + 0.25\cdot\frac{0.1+0.3}{2} + 0.25\cdot\frac{0.3+0.6}{2} + 0.25\cdot\frac{0.6+1}{2} = 0.0125 + 0.05 + 0.1125 + 0.2 = 0.375\). Area under the equality line = 0.5, so A = 0.5 − 0.375 = 0.125. Gini = 0.125 / 0.5 = <b>0.25</b>.</p>`,
          rubric: ["Cumulative population and income shares","Area B = 0.375 by trapezoids","A = 0.125 (0.5 − B)","Gini = 0.25"],
        },
        {
          kind: "write", q: r`What is the Gini if all four earn 25? If one person earns everything? Your second answer won't be 1. Why not, and what does the book's "ranges to 1" mean?`,
          a: r`<p>Equal incomes: the Lorenz curve is the 45-degree line, A = 0, Gini = <b>0</b>. One person earns all: cumulative income is 0, 0, 0, 1, so B = 0.25·(1/2) = 0.125, A = 0.375, Gini = <b>0.75</b>. With n people, the most unequal Lorenz curve still includes the last person's step, so the maximum is \(1 - 1/n\). The book's upper bound of 1 is the limit for a large population, where that last step becomes negligible.</p>`,
          rubric: ["Equal incomes give 0","One person with everything gives 0.75 for n = 4","Explains the 1 − 1/n maximum with finitely many people; 1 is the large-population limit"],
        },
      ],
    },
    {
      id: "c3qq", sec: "3.6.3", title: "Comparing whole distributions: Q-Q plots",
      setup: r`set.seed(4)
schools <- data.frame(district = rep(c("A", "B"), c(400, 300)))
schools$score <- round(ifelse(schools$district == "A", rnorm(700, 60, 12), rnorm(700, 62, 6)), 1)`,
      context: r`<p>The data frame <code>schools</code> holds test scores for students in two districts: <code>district</code> (A has 400 students, B has 300) and <code>score</code>.</p>`,
      parts: [
        {
          kind: "write", q: r`The 10th, 30th, 50th, 70th, and 90th percentiles of District A are 45, 54, 60, 66, 75 and of District B are 54, 59, 62, 65, 70. If you made a Q-Q plot with A on the horizontal axis, where would the points sit relative to the 45-degree line? What do the low and high quantiles tell you, and which district is more spread out?`,
          a: r`<p>The points are (45, 54), (54, 59), (60, 62), (66, 65), (75, 70). The low quantiles are <b>above</b> the 45-degree line: B's weakest students score higher than A's weakest. The upper quantiles are <b>below</b> it: A's strongest outscore B's strongest. The points rise only 16 for a horizontal run of 30, a slope of about 0.53, flatter than 45 degrees, so the horizontal-axis distribution (A) is more dispersed. Mean comparisons would miss this: the medians are close, but the districts differ sharply in spread.</p>`,
          rubric: ["Lower quantiles above the line: B higher at the bottom","Upper quantiles below the line: A higher at the top","Flatter slope means the horizontal (A) distribution is more dispersed","Notes centers are similar while spreads differ"],
        },
        {
          kind: "interpret", q: r`Interpret the Q-Q plot and the percentiles. What does <code>abline(0, 1)</code> draw, and why do the axis limits match?`,
          show: r`qqplot(schools$score[schools$district == "A"], schools$score[schools$district == "B"],
       xlab = "District A", ylab = "District B", xlim = c(20, 100), ylim = c(20, 100))
abline(0, 1)
tapply(schools$score, schools$district, quantile, probs = c(0.1, 0.5, 0.9))`,
          a: r`<p><code>qqplot(x, y)</code> plots sorted quantiles of y against those of x. <code>abline(0, 1)</code> is the 45-degree line (intercept 0, slope 1). Matching limits keep that line meaningful. The plot crosses the line near the middle and is flatter than it: B is concentrated, A spread out. The percentiles confirm it: A's 10th–90th range is about 45 to 75, B's about 54 to 70.</p>`,
          rubric: ["qqplot plots B's quantiles against A's","abline(0, 1) is the 45-degree line; equal limits keep it meaningful","Reads the crossing and the flatter slope: B concentrated, A spread out","Backs it up with the percentiles (A ≈ 45–75, B ≈ 54–70)"],
        },
      ],
    },
    {
      id: "c3mat", sec: "3.7.1–3.7.2", title: "Matrices and lists",
      setup: r``,
      context: r`<p>A matrix holds one data type in rows and columns; a list holds elements of any type and length.</p>`,
      parts: [
        {
          kind: "predict", q: r`Predict every output.`,
          show: r`m <- matrix(1:6, nrow = 2, byrow = FALSE)
m
m[2, ]
apply(m, 2, sum)
apply(m, 1, max)
rowMeans(m)
dim(cbind(m, c(7, 8)))`,
          a: r`<p>With <code>byrow = FALSE</code> the numbers fill <i>down columns</i>: row 1 is 1 3 5, row 2 is 2 4 6. <code>m[2, ]</code> is <code>2 4 6</code>. Margin 2 means columns, so the column sums are <code>3 7 11</code>. Margin 1 means rows, so the row maxima are <code>5 6</code>. Row means: <code>3 4</code>. Binding a column of length 2 gives a 2 × 4 matrix: <code>2 4</code>.</p>`,
          rubric: ["byrow = FALSE fills by column (rows 1 3 5 / 2 4 6)","MARGIN 1 = rows, 2 = columns; correct sums and maxima","rowMeans 3 4","cbind adds a column: dim 2 4"],
        },
        {
          kind: "predict", q: r`Predict each output. Pay attention to single versus double brackets.`,
          show: r`L <- list(a = 1:3, b = "hi", c = data.frame(x = 1:2, y = c("u", "v")))
L$a[2]
L[["c"]]$y
length(L)
class(L[2])
class(L[[2]])
class(as.matrix(data.frame(id = c(1, 2), grp = c("p", "q")))[1, 1])`,
          a: r`<p><code>L$a[2]</code> is <code>2</code>. <code>L[["c"]]</code> extracts the data frame, so <code>$y</code> gives <code>"u" "v"</code>. The list has 3 elements. <code>L[2]</code> (single brackets) returns a smaller <i>list</i> containing element b, so its class is <code>"list"</code>; <code>L[[2]]</code> returns the element itself, <code>"character"</code>. Converting a data frame with a numeric and a character column to a matrix forces one type, so every entry becomes character: <code>"character"</code>.</p>`,
          rubric: ["$ and [[ ]] extract elements; nested $ on the data frame","length 3","[ ] returns a sub-list vs [[ ]] returns the element","as.matrix coerces mixed types to character"],
        },
      ],
    },
    {
      id: "c3km", sec: "3.7.3", title: "k-means clustering",
      setup: r`set.seed(66)
voters <- data.frame(group = rep(c("A", "B", "C"), each = 30),
  income = round(c(rnorm(30, 40000, 6000), rnorm(30, 42000, 6000), rnorm(30, 75000, 6000))),
  ideology = round(c(rnorm(30, -0.6, 0.15), rnorm(30, 0.6, 0.15), rnorm(30, 0.5, 0.15)), 2))`,
      context: r`<p>The data frame <code>voters</code> has 90 people from three known groups: <code>group</code> (A, B, C), <code>income</code> (dollars), and <code>ideology</code> (−1 liberal to +1 conservative). Pretend you don't know <code>group</code> and want to discover clusters.</p>`,
      parts: [
        {
          kind: "write", q: r`Run k-means by hand with k = 2 on six points: A(1, 1), B(2, 1), C(1, 2), D(6, 5), E(7, 6), F(5, 6). Start with centroids at A and B. Show each assignment and centroid update until convergence.`,
          a: r`<p><b>Assign 1</b> (centroids (1,1) and (2,1)): A → 1; B → 2; C is 1 from c1 and 1.41 from c2 → 1; D, E, F are each closer to (2,1) → 2. Clusters {A, C}, {B, D, E, F}. <b>Update</b>: c1 = (1, 1.5); c2 = ((2+6+7+5)/4, (1+5+6+6)/4) = (5, 4.5). <b>Assign 2</b>: B is now 1.12 from c1 vs 4.61 from c2 → 1; D, E, F stay with 2. Clusters {A, B, C}, {D, E, F}. <b>Update</b>: c1 = (1.33, 1.33), c2 = (6, 5.67). <b>Assign 3</b>: nothing changes, so it has converged. Bad starting centroids (both in the same group) were fixed in two iterations, but with real data a bad start can get stuck, which is why <code>nstart</code> tries several.</p>`,
          rubric: ["First assignment correct, including C's tie-break by distance","First centroid update (1, 1.5) and (5, 4.5)","Second assignment moves B; update (1.33, 1.33) and (6, 5.67)","Stops when assignments don't change; links bad starts to nstart"],
        },
        {
          kind: "interpret", q: r`The analyst runs k-means with and without standardizing. Interpret the two tables and explain why they differ. When should you <i>not</i> standardize?`,
          show: r`X <- cbind(voters$income, voters$ideology)
raw <- kmeans(X, centers = 3, nstart = 10)
table(group = voters$group, cluster = raw$cluster)
std <- kmeans(scale(X), centers = 3, nstart = 10)
table(group = voters$group, cluster = std$cluster)`,
          a: r`<p>Unstandardized, income is measured in tens of thousands of dollars and ideology in tenths, so Euclidean distance is essentially income distance. The algorithm splits on income alone and mixes groups A and B (similar incomes, opposite ideology). After <code>scale()</code> (subtract each column's mean, divide by its SD), both variables count equally and the three clusters line up with the three groups. Standardize whenever variables' units are arbitrary. Don't when the units are meaningful and comparable, as with DW-NOMINATE scores in the book.</p>`,
          rubric: ["Reads the first table: groups A and B are mixed","Explains that unscaled distance is dominated by income's units","scale() centers and scales each column; the clusters then match the groups","States when not to standardize (meaningful, comparable units such as DW-NOMINATE)"],
        },
        {
          kind: "interpret", q: r`Interpret this output and plot: what each list element holds, the sizes and centers, and why the plot uses <code>col = std$cluster + 1</code>, <code>pch = 8</code>, and <code>cex = 2</code>.`,
          show: r`X <- scale(cbind(voters$income, voters$ideology))
std <- kmeans(X, centers = 3, nstart = 10)
names(std)
std$size
std$centers
std$iter
plot(X, col = std$cluster + 1, xlab = "Income (z-score)", ylab = "Ideology (z-score)")
points(std$centers, pch = 8, cex = 2)`,
          a: r`<p><code>kmeans()</code> returns a list: <code>cluster</code> (assignments), <code>centers</code> (one row per centroid, in z-score units), <code>totss</code>, <code>withinss</code>, <code>tot.withinss</code>, <code>betweenss</code>, <code>size</code>, <code>iter</code>, <code>ifault</code>. Sizes are 30 each. <code>col = cluster + 1</code> avoids color 1 (black), which is used for the centroids. <code>pch = 8</code> is an asterisk and <code>cex = 2</code> doubles its size. <code>iter.max</code> defaults to 10, which is more than enough here.</p>`,
          rubric: ["The output is a list accessed with $ (cluster, centers, size, iter, ...)","Centers are within-cluster means in z-score units; sizes are 30 each","+ 1 avoids black, which is used for the centroids","pch = 8 is an asterisk and cex = 2 doubles its size"],
        },
        {
          kind: "write", q: r`k-means is unsupervised. What does that mean, why is its output hard to evaluate in real applications, and what two choices must the researcher make that can change the answer?`,
          a: r`<p>Unsupervised learning has no outcome variable to predict; the goal is to discover structure. In this exercise we cheated by knowing the true groups. In real data there is no right answer to compare against, so we can't measure accuracy, and human judgment must decide whether clusters are substantively meaningful. The researcher chooses <b>k</b> (the algorithm always returns exactly k clusters, whether or not they exist) and the <b>starting centroids</b> (random by default, which is why <code>nstart</code> runs several and keeps the best). Standardization is a third consequential choice.</p>`,
          rubric: ["No outcome variable; goal is discovering structure","No ground truth to measure accuracy; needs judgment","Researcher chooses k and starting values (nstart)","Mentions standardization as another consequential choice"],
        },
      ],
    },
  ],
};
