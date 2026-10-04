// Graph cards: the book's plotting code on the book's data; the front shows the real plot (built by build_flash.mjs).
// The back covers how to read it, what it is good for, what it is bad for, and the key arguments.
const r = String.raw;
const G = (id, topics, sec, page, front, setup, code, back) => ({ id, dict: "graph", topics, sec, page, front, setup, code, back });
const AFGHAN = r`afghan <- read.csv("MEASUREMENT/afghan.csv", stringsAsFactors = TRUE)`;
const CONGRESS = r`congress <- read.csv("MEASUREMENT/congress.csv", stringsAsFactors = TRUE)
rep <- subset(congress, subset = (party == "Republican"))
dem <- congress[congress$party == "Democrat", ]
rep80 <- subset(rep, subset = (congress == 80)); dem80 <- subset(dem, subset = (congress == 80))
rep112 <- subset(rep, subset = (congress == 112)); dem112 <- subset(dem, subset = (congress == 112))
xlab <- "Economic liberalism/conservatism"; ylab <- "Racial liberalism/conservatism"; lim <- c(-1.5, 1.5)`;
const goodbad = (read, good, bad, args) => `<p><b>How to read it:</b> ${read}</p><p><b>Good for:</b> ${good}</p><p><b>Bad for:</b> ${bad}</p><p><b>Key code:</b> ${args}</p>`;

export default [
  G("gr-bar", ["describe", "sampling"], "3.3.1", 80, "Bar plot", AFGHAN,
    r`ISAF.ptable <- prop.table(table(ISAF = afghan$violent.exp.ISAF, exclude = NULL))
barplot(ISAF.ptable, names.arg = c("No harm", "Harm", "Nonresponse"),
        main = "Civilian victimization by the ISAF", xlab = "Response category",
        ylab = "Proportion of the respondents", ylim = c(0, 0.7))`,
    goodbad(r`one bar per category; the height is the proportion (or count) in that category.`,
      r`the distribution of a <b>factor/categorical</b> variable, including a nonresponse category.`,
      r`numeric variables (use a histogram); comparing many groups at once.`,
      r`<code>barplot(heights, names.arg = labels)</code> with heights from <code>prop.table(table())</code>; <code>main</code>, <code>xlab</code>, <code>ylab</code>, <code>ylim</code> set titles and axis range.`)),
  G("gr-hist", ["describe"], "3.3.2", 82, "Histogram", AFGHAN,
    r`hist(afghan$age, freq = FALSE, ylim = c(0, 0.04), xlab = "Age",
     main = "Distribution of respondent's age")`,
    goodbad(r`the data are split into bins; with <code>freq = FALSE</code> each bar's <b>height is density</b> and its <b>area is the proportion</b> of observations in the bin (areas sum to 1). Here ages are skewed toward the young.`,
      r`the full <b>shape</b> of one numeric variable's distribution: skew, peaks, spread, outliers.`,
      r`comparing many groups compactly (use box plots); categorical variables (use a bar plot). The look depends on the bins chosen.`,
      r`<code>hist(x, freq = FALSE)</code> for density (default <code>TRUE</code> plots counts); <code>breaks = seq(-0.5, 18.5, by = 1)</code> centers bins on whole numbers; add layers with <code>abline()</code>, <code>text()</code>, <code>lines()</code>.`)),
  G("gr-scatter", ["correlation"], "3.6.1", 99, "Scatter plot", CONGRESS,
    r`plot(dem80$dwnom1, dem80$dwnom2, pch = 16, col = "blue", xlim = lim, ylim = lim,
     xlab = xlab, ylab = ylab, main = "80th Congress")
points(rep80$dwnom1, rep80$dwnom2, pch = 17, col = "red")
text(-0.75, 1, "Democrats")
text(1, -1, "Republicans")`,
    goodbad(r`each point is one unit (a legislator) placed at its values of two variables. Look for direction, strength, clusters, and outliers.`,
      r`the <b>relationship between two numeric variables</b> measured on the same units; groups distinguished by color (<code>col</code>) and symbol (<code>pch</code>).`,
      r`a single variable's distribution; very many overlapping points; it shows association, not causation.`,
      r`<code>plot(x, y, pch =, col =, xlim =, ylim =, xlab =, ylab =, main =)</code>, then <code>points()</code> to add another group and <code>text()</code> for labels.`)),
  G("gr-box", ["describe"], "3.3.3", 86, "Box plot", AFGHAN,
    r`boxplot(educ.years ~ province, data = afghan, main = "Education by province",
        ylab = "Years of education")`,
    goodbad(r`the box runs from the lower to the upper quartile (the middle 50%, i.e. the IQR) with a line at the <b>median</b>. Whiskers extend to the most extreme points within <b>1.5 × IQR</b> of the box; points beyond are drawn as open circles (outliers). Helmand and Uruzgan have much lower education.`,
      r`<b>comparing distributions across groups</b> compactly, side by side.`,
      r`showing the full shape of one distribution (two peaks, gaps), where a histogram is better.`,
      r`<code>boxplot(y ~ group, data = df)</code> (formula: y by group); <code>names =</code> relabels the boxes.`)),
  G("gr-line", ["correlation"], "3.6.1", 100, "Line graph (time series)", CONGRESS,
    r`dem.median <- tapply(dem$dwnom1, dem$congress, median)
rep.median <- tapply(rep$dwnom1, rep$congress, median)
plot(names(dem.median), dem.median, col = "blue", type = "l", xlim = c(80, 115),
     ylim = c(-1, 1), xlab = "Congress", ylab = "DW-NOMINATE score (first dimension)")
lines(names(rep.median), rep.median, col = "red")
text(110, -0.6, "Democratic\n Party")
text(110, 0.85, "Republican\n Party")`,
    goodbad(r`x is time (Congress), y is a summary (party median ideology); the lines connect successive points. The parties' medians diverge over time: polarization.`,
      r`<b>change over time</b> in a summary statistic, and comparing trends across groups.`,
      r`showing individual-level spread (each point is a median); two trends moving together don't prove causation.`,
      r`<code>plot(x, y, type = "l")</code> draws lines (<code>"b"</code> = both points and lines); <code>names(v)</code> supplies the x-values from <code>tapply()</code>'s labels; <code>lines()</code> adds a second series; <code>"\n"</code> starts a new line in <code>text()</code>.`)),
  G("gr-qq", ["correlation"], "3.6.3", 106, "Quantile-quantile (Q-Q) plot", CONGRESS,
    r`qqplot(dem112$dwnom2, rep112$dwnom2, xlab = "Democrats", ylab = "Republicans",
       xlim = c(-1.5, 1.5), ylim = c(-1.5, 1.5), main = "Racial liberalism/conservatism dimension")
abline(0, 1)`,
    goodbad(r`each point pairs the same quantile of two variables. On the 45° line = identical distributions. Above the line = the vertical-axis variable is larger at that quantile. Slope flatter than 45° = the horizontal-axis distribution is more spread out. Here low quantiles are above the line (liberal Republicans are more conservative than liberal Democrats) and the points are flatter than 45° (Democrats more dispersed).`,
      r`comparing <b>entire distributions</b> (not just means), even for variables in different units.`,
      r`relationships between paired observations (it pairs quantiles, not units).`,
      r`<code>qqplot(x, y)</code>; <code>abline(0, 1)</code> adds the 45° line (intercept 0, slope 1); use matching <code>xlim</code>/<code>ylim</code>.`)),
  G("gr-residual", ["regression"], "4.2.6", 158, "Residual plot",
    r`florida <- read.csv("PREDICTION/florida.csv", stringsAsFactors = TRUE)
fit2 <- lm(Buchanan00 ~ Perot96, data = florida)`,
    r`plot(fitted(fit2), resid(fit2), xlim = c(0, 1500), ylim = c(-750, 2500),
     xlab = "Fitted values", ylab = "Residuals")
abline(h = 0)`,
    goodbad(r`residuals (y) against fitted values (x), with a reference line at 0. A good fit is patternless scatter around 0. Here one huge positive residual stands out: Palm Beach (the butterfly ballot).`,
      r`spotting <b>outliers</b>, nonlinearity, and unequal spread after fitting a regression.`,
      r`showing the relationship itself (use the scatter plot with the fitted line).`,
      r`<code>plot(fitted(fit), resid(fit))</code> plus <code>abline(h = 0)</code>; find the outlier with <code>florida$county[resid(fit2) == max(resid(fit2))]</code>.`)),
  G("gr-lorenz", ["correlation"], "3.6.2", 101, "Lorenz curve (and the Gini coefficient)",
    r`income <- c(2, 5, 8, 12, 18, 25, 35, 50, 75, 120)`,
    r`share.people <- c(0, seq(from = 0.1, to = 1, by = 0.1))
share.income <- c(0, cumsum(sort(income)) / sum(income))
plot(share.people, share.income, type = "l", lwd = 2, col = "blue",
     xlab = "Cumulative share of people (poorest to richest)", ylab = "Cumulative share of income")
abline(a = 0, b = 1, lty = "dashed")
text(0.35, 0.55, "line of equality")
text(0.55, 0.42, "A")
text(0.85, 0.2, "B")`,
    goodbad(r`people are sorted from lowest to highest income; the curve shows the share of total income held by the bottom x% of people. The dashed 45° line is perfect equality. A = area between the line and the curve, B = area under the curve; Gini = A ÷ (A + B).`,
      r`showing <b>inequality</b> in a distribution, and seeing where the Gini coefficient comes from.`,
      r`comparing average levels (it shows shares, not amounts); two curves can cross, giving similar Ginis for different patterns.`,
      r`(the book draws this as a diagram, Figure 3.4; here it's drawn in R from ten example incomes.) <code>cumsum(sort(income)) / sum(income)</code> gives cumulative income shares; <code>abline(a = 0, b = 1)</code> draws the equality line.`)),
  G("gr-did", ["causal"], "2.5.3", 61, "Difference-in-differences figure",
    r`minwage <- read.csv("CAUSALITY/minwage.csv", stringsAsFactors = TRUE)
minwage$fullPropBefore <- minwage$fullBefore / (minwage$fullBefore + minwage$partBefore)
minwage$fullPropAfter <- minwage$fullAfter / (minwage$fullAfter + minwage$partAfter)
NJ <- subset(minwage, location != "PA"); PA <- subset(minwage, location == "PA")`,
    r`nj <- c(mean(NJ$fullPropBefore), mean(NJ$fullPropAfter))
pa <- c(mean(PA$fullPropBefore), mean(PA$fullPropAfter))
counterfactual <- nj[1] + (pa[2] - pa[1])
plot(c(0, 1), nj, type = "b", pch = 19, xlim = c(-0.2, 1.3), ylim = c(0.23, 0.37), xaxt = "n",
     xlab = "", ylab = "Average proportion of full-time employees")
axis(1, at = c(0, 1), labels = c("Before", "After"))
lines(c(0, 1), pa, type = "b", pch = 1)
lines(c(0, 1), c(nj[1], counterfactual), lty = "dashed", col = "blue")
points(1, counterfactual, pch = 17, col = "blue")
arrows(1.08, counterfactual, 1.08, nj[2], code = 3, length = 0.06)
text(1.2, (counterfactual + nj[2]) / 2, "effect")
legend("topleft", legend = c("Treatment (NJ)", "Control (PA)", "NJ counterfactual"), pch = c(19, 1, 17),
       lty = c(1, 1, 2), col = c("black", "black", "blue"), bty = "n")
round(c(NJ.change = nj[2] - nj[1], PA.change = pa[2] - pa[1], DiD = nj[2] - counterfactual), 3)`,
    goodbad(r`solid points: treated group (NJ) before and after; open points: control group (PA). The dashed blue line starts at NJ's "before" value and runs <b>parallel to PA's trend</b>, ending at the counterfactual (triangle): what NJ would have had without the policy. The arrow between the counterfactual and NJ's actual "after" value is the DiD estimate of the SATT.`,
      r`seeing the <b>parallel trends assumption</b> and why DiD differs from the before-and-after estimate (it subtracts the control group's trend).`,
      r`checking the assumption: the counterfactual line is assumed, not observed (earlier periods would help).`,
      r`(the book draws this as Figure 2.2; here it's rebuilt in R from the minimum-wage data.) The four means, then <code>lines()</code>, <code>points()</code>, and <code>arrows()</code> as layers.`)),
];
