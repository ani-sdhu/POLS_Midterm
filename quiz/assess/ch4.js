// Assessment, Chapter 4: Prediction. New studies and data; the book's methods and R functions.
// Like the exam, nothing asks you to write code: parts are written answers, predicting output, or interpreting shown code and output.
const r = String.raw;

export default {
  id: "ch4", short: "Chapter 4", title: "Chapter 4: Prediction",
  intro: "Loops and conditionals, prediction error and classification, least squares, regression towards the mean, merging, model fit, and regression for causal inference: binary and factor treatments, interactions, and regression discontinuity.",
  items: [
    {
      id: "c4loop", sec: "4.1.1", title: "Tracing and debugging loops",
      setup: r`d <- data.frame(x = c(2, 4, 9), lab = c("p", "q", "r"), y = c(1, 1, 7))`,
      context: r`<p>A loop repeats its body once for each value of the counter. Pre-allocate a container with <code>rep(NA, n)</code>; loops print nothing unless you call <code>print()</code> or <code>cat()</code>. The toy data frame <code>d</code> has a numeric <code>x</code>, a character <code>lab</code>, and a numeric <code>y</code>.</p>`,
      parts: [
        {
          kind: "predict", q: r`Trace the loop: what does it print, and what is <code>out</code> at the end?`,
          show: r`vals <- c(3, 8, 5)
out <- rep(NA, length(vals))
for (i in 1:length(vals)) {
  out[i] <- vals[i] - i
  cat("step", i, ":", out[i], "\n")
}
out`,
          a: r`<p>Iteration 1: 3 − 1 = 2; iteration 2: 8 − 2 = 6; iteration 3: 5 − 3 = 2. <code>cat()</code> separates its pieces with spaces and <code>"\n"</code> ends each line, so it prints <code>step 1 : 2</code>, <code>step 2 : 6</code>, <code>step 3 : 2</code>, and then <code>out</code> is <code>2 6 2</code>. The loop is unnecessary: <code>vals - 1:3</code> is the vectorized equivalent and is faster.</p>`,
          rubric: ["Correct value at each iteration (2, 6, 2)","Printed lines formatted with spaces from cat()","Final out = 2 6 2","Gives the vectorized alternative"],
        },
        {
          kind: "predict", q: r`This loop is meant to sum each column of <code>d</code>. Predict the printed lines, the error, and the final <code>res</code>. Explain how the printed iteration number helps you debug.`,
          show: r`res <- rep(NA, 3)
for (i in 1:3) {
  cat("iteration", i, "\n")
  res[i] <- sum(d[, i])
}
res`,
          a: r`<p>Iteration 1 prints and stores 15. Iteration 2 prints "iteration 2", then <code>sum()</code> of the character column <code>lab</code> fails with an "invalid 'type' (character)" error and the loop halts. "iteration 3" never prints and <code>res</code> stays <code>15 NA NA</code>; the last line never runs. Because the last message printed was "iteration 2", you know iteration 1 worked and something specific to column 2 broke it. Test that body directly with <code>i &lt;- 2</code>. Fix: loop only over numeric columns (<code>for (i in c(1, 3))</code>) or test the column's class with <code>if</code> before summing.</p>`,
          rubric: ["Prints iteration 1 and iteration 2, then the error","Error comes from summing a character column","res is 15 NA NA (later iterations never run)","Debugging logic: last printed iteration locates the failure; test the body with a fixed i"],
        },
      ],
    },
    {
      id: "c4if", sec: "4.1.2", title: "Conditional statements",
      setup: r``,
      context: r`<p><code>if () {} else if () {} else {}</code> runs exactly one block, chosen by the first condition that is TRUE. <code>ifelse()</code> works element by element on vectors. <code>%%</code> is the remainder.</p>`,
      parts: [
        {
          kind: "predict", q: r`Predict each result.`,
          show: r`rate <- function(m) {
  if (m > 10) {
    "safe"
  } else if (m > 3) {
    "lean"
  } else if (m >= -3) {
    "tossup"
  } else {
    "opponent"
  }
}
rate(12)
rate(3)
rate(-3)
rate(-3.5)
ifelse(c(5, -2, 0) > 0, "pos", "nonpos")
17 %% 5
c(10, 7) %% 2 == 0`,
          a: r`<p><code>"safe"</code>; <code>3 &gt; 3</code> is FALSE, so 3 falls to the third test and is <code>"tossup"</code>; −3 is also <code>"tossup"</code> (the test is ≥); −3.5 is <code>"opponent"</code>. <code>ifelse()</code> gives <code>"pos" "nonpos" "nonpos"</code>. 17 %% 5 = <code>2</code>. 10 is even and 7 is odd: <code>TRUE FALSE</code>.</p>`,
          rubric: ["Boundary cases correct: 3 and −3 are both tossup","First TRUE condition wins","ifelse vectorized output","%% remainder and even/odd test"],
        },
        {
          kind: "write", q: r`A student reorders <code>rate()</code> so it checks <code>m &gt; 3</code> before <code>m &gt; 10</code>. What changes? Separately, why does <code>if (c(5, -2) &gt; 0) "pos"</code> fail in current R, while the <code>ifelse()</code> line works?`,
          a: r`<p>With <code>m &gt; 3</code> first, every margin above 3, including 12, is labeled "lean". The "safe" branch can never be reached, because conditions are checked in order and the first TRUE one wins. <code>if</code> is control flow: it needs a <i>single</i> TRUE or FALSE to decide which block to run. A length-2 condition is an error ("the condition has length &gt; 1"). <code>ifelse()</code> is built for vectors: it evaluates each element separately.</p>`,
          rubric: ["Reordering makes 'safe' unreachable; 12 becomes lean","Explains that the first TRUE branch wins","if() needs one logical value; vector condition errors","ifelse() is the vectorized tool"],
        },
      ],
    },
    {
      id: "c4poll", sec: "4.1.3", title: "Forecasting district elections from polls",
      setup: r`set.seed(410)
nd <- 30
results <- data.frame(district = paste0("D", 1:nd), seats = sample(c(1, 1, 2, 3), nd, replace = TRUE))
results$margin <- round(rnorm(nd, 1, 9), 1)
k <- sample(3:8, nd, replace = TRUE)
polls <- data.frame(district = rep(results$district, k),
  days = unlist(lapply(k, function(m) sample(1:40, m, replace = TRUE))))
polls$margin <- round(rep(results$margin, k) + 1.5 + rnorm(sum(k), 0, 6), 1)
rm(nd, k)`,
      context: r`<p>Party A contests 30 districts that elect different numbers of seats under winner-take-all. Two data frames are loaded:</p>
<table><tr><td><code>results</code></td><td><code>district</code> (D1–D30), <code>seats</code> (seats at stake), <code>margin</code> (Party A's actual margin, points; positive = A wins)</td></tr>
<tr><td><code>polls</code></td><td><code>district</code>, <code>days</code> (days before the election the poll was fielded), <code>margin</code> (Party A's polled margin)</td></tr></table>`,
      parts: [
        {
          kind: "interpret", q: r`This loop builds a poll-based prediction for each district. Explain what each line inside the loop does, why the container is created before the loop, and how ties among the latest polls are handled.`,
          show: r`pred <- rep(NA, nrow(results))
names(pred) <- results$district
for (i in 1:nrow(results)) {
  d <- subset(polls, district == results$district[i])
  latest <- subset(d, days == min(days))
  pred[i] <- mean(latest$margin)
}
pred`,
          a: r`<p>Each iteration subsets one district's polls, keeps those with the smallest <code>days</code> (several polls can tie), and averages them. Pre-allocating with <code>rep(NA, ...)</code> and indexing with <code>[i]</code> is the book's pattern. Matching on <code>results$district[i]</code> keeps the predictions in the same order as <code>results</code>, which the next part relies on.</p>`,
          rubric: ["rep(NA, ...) pre-allocates a container; names() labels it by district","Each iteration subsets one district's polls","Keeps polls with min(days), so several polls on the same day are all kept","Averages the latest polls and stores the result at [i]"],
        },
        {
          kind: "interpret", q: r`Interpret the bias and the RMSE. How can both be true at once?`,
          show: r`pred <- rep(NA, nrow(results))
for (i in 1:nrow(results)) {
  d <- subset(polls, district == results$district[i])
  pred[i] <- mean(d$margin[d$days == min(d$days)])
}
errors <- results$margin - pred
mean(errors)                 # bias
sqrt(mean(errors^2))         # RMSE`,
          a: r`<p>Prediction error = actual − predicted. The bias (mean error) is about 0.1 points, essentially unbiased. The RMSE is about 6.8 points: a typical district forecast misses by roughly 7 points. Both can be true at once because large positive and negative errors cancel in the mean but not in the RMS. Bias tells you whether the polls lean systematically toward one party; RMSE tells you how accurate a single forecast is.</p>`,
          rubric: ["Error = actual minus predicted","Bias ≈ 0.1: essentially unbiased","RMSE ≈ 6.8: a typical forecast misses by about 7 points","Large positive and negative errors cancel in the mean but not in the RMS"],
        },
        {
          kind: "interpret", q: r`Treat "Party A wins" as the positive outcome. Interpret each line of output: the misclassified districts, the false positive and false negative counts, the misclassification rate, and the seat totals.`,
          show: r`pred <- rep(NA, nrow(results))
for (i in 1:nrow(results)) {
  d <- subset(polls, district == results$district[i])
  pred[i] <- mean(d$margin[d$days == min(d$days)])
}
wrong <- sign(pred) != sign(results$margin)
results$district[wrong]
sum(pred > 0 & results$margin < 0)    # false positives
sum(pred < 0 & results$margin > 0)    # false negatives
mean(wrong)                           # misclassification rate
sum(results$seats[results$margin > 0])
sum(results$seats[pred > 0])`,
          a: r`<p><code>sign()</code> returns 1 or −1, so a mismatch means the polls picked the wrong winner. A false positive predicts an A win where A lost (4 districts); a false negative predicts an A loss where A won (2). The misclassification rate is 6/30 = 0.2. The predicted seat total (25) is close to the actual (26) because the errors partly offset. A forecast can be good in aggregate while wrong in a fifth of the districts.</p>`,
          rubric: ["sign() mismatches identify districts where the polls picked the wrong winner","False positive = predicted A win, actual loss (4); false negative = the reverse (2)","Misclassification rate = 6/30 = 0.2","Seat totals (25 predicted vs 26 actual) are close because errors offset"],
        },
        {
          kind: "write", q: r`Lay out the confusion matrix for this forecast. Suppose a news outlet will "call" a district for Party A only when the predicted margin exceeds +5. Which error type falls and which rises? Why is this trade-off unavoidable?`,
          a: r`<p>Confusion matrix: rows are predicted (A wins / A loses), columns are actual (A wins / A loses). The cells are true positives, false positives (predicted win, actual loss), false negatives (predicted loss, actual win), and true negatives. A stricter threshold calls fewer districts for A, so <b>false positives fall</b> (fewer wrong A calls) but <b>false negatives rise</b> (more real A wins go uncalled). The threshold only moves districts between "positive" and "negative" predictions; unless the forecasts themselves get more accurate, reducing one error type means accepting more of the other.</p>`,
          rubric: ["Correct 2 × 2 layout with TP, FP, FN, TN","A higher threshold lowers FP and raises FN","Explains the trade-off as moving cases across the threshold"],
        },
      ],
    },
    {
      id: "c4date", sec: "4.1.3", title: "Dates and moving windows",
      setup: r``,
      context: r`<p>A national poll average for each of the last 60 days of a campaign uses all polls from the preceding week:</p>
<pre class=code>for (i in 1:60) {
  week <- subset(natl, (DaysToElection &lt;= (60 - i + 7)) &amp; (DaysToElection &gt; (60 - i)))
  A.pred[i] &lt;- mean(week$A)
}</pre>`,
      parts: [
        {
          kind: "write", q: r`Which values of <code>DaysToElection</code> enter the average when <code>i = 1</code>, <code>i = 45</code>, and <code>i = 60</code>? How many days is each window? Why does the book plot these predictions against <code>60:1</code> with <code>xlim = c(60, 0)</code>?`,
          a: r`<p>i = 1: greater than 59 and at most 66, i.e. days 60 to 66. i = 45: greater than 15 and at most 22, i.e. 16 to 22. i = 60: greater than 0 and at most 7, i.e. 1 to 7. Each window is 7 days, the day itself and the six before it, so each prediction is a 7-day moving average. Element <code>i</code> of the predictions refers to the day 60 − i + 1 days out, so <code>60:1</code> gives the correct horizontal positions. Reversing the axis with <code>xlim = c(60, 0)</code> makes time run left to right toward Election Day at 0.</p>`,
          rubric: ["Correct windows for i = 1, 45, 60","Each window spans 7 days: a moving average","Explains 60:1 matches each element to its day","Reversed xlim makes time flow toward Election Day"],
        },
        {
          kind: "predict", q: r`Predict the output.`,
          show: r`e <- as.Date("2026-11-03")
p <- as.Date("2026/9/15")
e - p
as.numeric(e - p) <= 50
a <- b <- rep(NA, 2)
a`,
          a: r`<p><code>as.Date()</code> accepts year-month-day with dashes or slashes. Subtracting dates gives a "Time difference of 49 days" (15 days left in September, 31 in October, 3 in November). Converted to a number, 49 ≤ 50 is <code>TRUE</code>. <code>a &lt;- b &lt;- rep(NA, 2)</code> assigns the same value to both objects, so <code>a</code> is <code>NA NA</code>.</p>`,
          rubric: ["Date subtraction gives 'Time difference of 49 days'","Correct day count across months","Chained assignment gives both objects NA NA"],
        },
      ],
    },
    {
      id: "c4ls", sec: "4.2.2–4.2.3", title: "Least squares by hand",
      setup: r`x <- c(1, 2, 3, 4, 5)
y <- c(2, 4, 5, 4, 5)`,
      context: r`<p>Use the five points (1, 2), (2, 4), (3, 5), (4, 4), (5, 5), stored as <code>x</code> and <code>y</code>. (Their correlation is about 0.775; see the Chapter 3 z-score problem.)</p>`,
      parts: [
        {
          kind: "write", q: r`Using the least-squares formulas, compute \(\hat\beta\) and \(\hat\alpha\). Then compute every fitted value and residual, and confirm two properties the book says always hold.`,
          a: r`<p>\(\bar x = 3\), \(\bar y = 4\). \(\sum(x_i - \bar x)(y_i - \bar y) = 6\) and \(\sum(x_i - \bar x)^2 = 10\), so \(\hat\beta = 0.6\) and \(\hat\alpha = \bar y - \hat\beta\bar x = 4 - 1.8 = 2.2\). Fitted values: 2.8, 3.4, 4.0, 4.6, 5.2. Residuals: −0.8, 0.6, 1.0, −0.6, −0.2. (1) The residuals sum (and average) to 0. (2) The line passes through \((\bar x, \bar y) = (3, 4)\), since 2.2 + 0.6·3 = 4.</p>`,
          rubric: ["β̂ = 0.6 from the covariance-over-variance formula","α̂ = 2.2","Fitted values and residuals correct","Verifies mean residual 0 and passing through the means"],
        },
        {
          kind: "write", q: r`Compute SSR, TSS, R², and the regression's RMSE. Show that \(\hat\beta = r\,S_y/S_x\), and that R² equals \(r^2\) here. Interpret \(\hat\beta\) in standard-deviation units.`,
          a: r`<p>SSR = 0.64 + 0.36 + 1 + 0.36 + 0.04 = 2.4. TSS = 4 + 0 + 1 + 0 + 1 = 6. R² = 1 − 2.4/6 = <b>0.6</b>. RMSE = \(\sqrt{2.4/5} \approx 0.69\): a typical prediction misses by about 0.7. With \(S_x = \sqrt 2\) and \(S_y = \sqrt{1.2}\): \(0.775 \times 1.095 / 1.414 = 0.6\) ✓, and \(0.775^2 = 0.6\) ✓ (in simple regression R² is the squared correlation). In SD units: a one-SD increase in x (1.41) is associated with a 0.775-SD increase in y (0.85).</p>`,
          rubric: ["SSR 2.4 and TSS 6","R² = 0.6 and RMSE ≈ 0.69","Slope = r × Sy / Sx verified","SD-unit interpretation using r"],
        },
        {
          kind: "interpret", q: r`Check your hand calculations against this output. Why does the mean residual print as a tiny number rather than 0, and why does <code>lm(y ~ x)</code> work here without a <code>data</code> argument?`,
          show: r`fit <- lm(y ~ x)
coef(fit)
fitted(fit)
resid(fit)
mean(resid(fit))
1 - sum(resid(fit)^2) / sum((y - mean(y))^2)
summary(fit)$r.squared`,
          a: r`<p>R reproduces α̂ = 2.2, β̂ = 0.6, the fitted values and residuals, and R² = 0.6. The mean residual prints as something like <code>1e-17</code>: zero up to floating-point rounding. Here <code>lm(y ~ x)</code> works without <code>data =</code> because <code>x</code> and <code>y</code> are separate objects in the workspace, which is the case the book says it's useful for.</p>`,
          rubric: ["Coefficients, fitted values, and residuals match the hand calculation","The mean residual is zero up to floating-point rounding (e.g. 4e-17)","Both R² calculations give 0.6","x and y are separate objects in the workspace, so no data argument is needed"],
        },
        {
          kind: "write", q: r`A classmate says: "My residuals average exactly zero, so my linear model is correct." Respond. Then describe what the book's four-panel correlation figure teaches about a data cloud with a correlation near 0.`,
          a: r`<p>The zero mean residual is an algebraic consequence of least squares with an intercept: it holds for <i>any</i> data, even data generated by a curve. It says nothing about whether the line describes the data-generating process. Check the residual plot instead. Correlation measures only <i>linear</i> association: a cloud with r ≈ 0 can still have a strong nonlinear (e.g. U-shaped, quadratic) relationship. So low correlation does not mean no relationship.</p>`,
          rubric: ["Mean residual zero holds for any data (algebraic property)","It does not validate the model; look at residuals","Correlation captures only linear relationships","A strong nonlinear pattern can have r near 0"],
        },
      ],
    },
    {
      id: "c4lm", sec: "4.2.3", title: "Interpreting a regression: campaign spending",
      setup: r`set.seed(10)
n <- 150
spend <- data.frame(spending = round(runif(n, 0.5, 15), 2))
spend$share <- round(30 + 1.2 * spend$spending + rnorm(n, 0, 5), 1)
rm(n)`,
      context: r`<p>The data frame <code>spend</code> covers 150 House challengers: <code>spending</code> (campaign spending, in $100,000s; every challenger spent at least $50,000) and <code>share</code> (the challenger's vote share, %).</p>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret the intercept and slope in context, rescale the slope to $10,000, and interpret the two predictions.`,
          show: r`fit <- lm(share ~ spending, data = spend)
fit
predict(fit, newdata = data.frame(spending = c(5, 10)))`,
          a: r`<p>Intercept ≈ 29.8: the predicted vote share for a challenger who spends $0. No challenger in the data spent less than $50,000, so this is an extrapolation and not substantively meaningful. Slope ≈ 1.2: each additional $100,000 is associated with about 1.2 more points of vote share, i.e. about 0.12 points per $10,000. Predictions: about 35.8% at $500,000 (spending = 5) and 41.7% at $1 million (spending = 10). <code>newdata</code> must contain a variable with the predictor's exact name.</p>`,
          rubric: ["Intercept is the predicted share at zero spending, an extrapolation","Slope ≈ 1.2 points per $100,000, i.e. ≈ 0.12 per $10,000","Predictions ≈ 35.8% at $500,000 and 41.7% at $1 million (spending = 5 and 10)","newdata must contain a variable named exactly like the predictor"],
        },
        {
          kind: "write", q: r`A consultant concludes, "Every $100,000 a challenger raises buys 1.2 points." Give two distinct reasons this causal reading is unjustified, using the language of Chapters 2 and 4.`,
          a: r`<p>Regression measures association; causation requires predicting counterfactuals. (1) <b>Confounding</b>: candidate quality, a strong district, or a national tide raise both fundraising and votes, so spending stands in for these pretreatment factors. (2) <b>Reverse causation / selection</b>: donors give more to challengers who already look competitive (expected vote share drives spending), so part of the slope is votes "causing" money. Without random assignment of money, the slope is a prediction rule, not the effect of an extra $100,000.</p>`,
          rubric: ["Association vs causation (counterfactual) framing","Confounder linked to both spending and vote share","Reverse causation: expected competitiveness attracts money","Notes randomization would be needed for a causal reading"],
        },
        {
          kind: "interpret", q: r`Explain what this output demonstrates about the slope and about the point of means, and why each holds.`,
          show: r`fit <- lm(share ~ spending, data = spend)
coef(fit)[2]
cor(spend$spending, spend$share) * sd(spend$share) / sd(spend$spending)
coef(fit)[1] + coef(fit)[2] * mean(spend$spending)
mean(spend$share)`,
          a: r`<p>\(\hat\beta = r \cdot S_y / S_x\). The \(n\) vs \(n - 1\) choice cancels in the ratio, so <code>sd()</code> works. Plugging \(\bar x\) into the fitted line returns \(\bar y\) exactly, because \(\hat\alpha = \bar y - \hat\beta \bar x\). The positive correlation (about 0.70) guarantees a positive slope, since SDs are never negative.</p>`,
          rubric: ["r × sd(y) / sd(x) reproduces the slope","The prediction at mean(x) equals mean(y)","Explains why: α̂ = ȳ − β̂x̄","A positive correlation implies a positive slope"],
        },
      ],
    },
    {
      id: "c4rtm", sec: "4.2.4", title: "Regression towards the mean: school probation",
      setup: r`set.seed(50)
n <- 400
true <- rnorm(n, 70, 8)
sch <- data.frame(score1 = round(true + rnorm(n, 0, 5), 1), score2 = round(true + rnorm(n, 0, 5), 1))
rm(n, true)`,
      context: r`<p>A state placed the 10% of schools with the lowest year-1 test scores on probation. In year 2, these schools' average score rose, and the superintendent credited probation. The data frame <code>sch</code> has <code>score1</code> and <code>score2</code> (school average scores) for 400 schools. Nothing about the tests changed between years.</p>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret this regression of year-2 on year-1 z-scores. Why is the intercept, printed in scientific notation, essentially zero? Why does the slope equal the correlation, and what does a slope below 1 imply?`,
          show: r`sch$z1 <- scale(sch$score1)
sch$z2 <- scale(sch$score2)
lm(z2 ~ z1, data = sch)
cor(sch$score1, sch$score2)`,
          a: r`<p>The intercept prints as something like <code>-1.05e-15</code>, which is zero: \(\hat\alpha = \bar y - \hat\beta\bar x\) and both standardized means are 0. With both variables standardized, the slope equals the correlation (about 0.74), which is less than 1. A school 1 SD above average in year 1 is predicted to be only 0.74 SD above average in year 2: it is pulled toward the mean.</p>`,
          rubric: ["scale() turns both scores into z-scores","Reads −1.05e-15 as zero and explains it (both means are 0)","Slope = correlation when both variables are standardized","Slope < 1 means predictions are pulled toward the mean"],
        },
        {
          kind: "interpret", q: r`Take the first expression apart piece by piece, then interpret all three numbers.`,
          show: r`sch$z1 <- scale(sch$score1)
sch$z2 <- scale(sch$score2)
mean((sch$z2 > sch$z1)[sch$z1 <= quantile(sch$z1, 0.25)])
mean((sch$z2 > sch$z1)[sch$z1 >= quantile(sch$z1, 0.75)])
prob <- sch$score1 <= quantile(sch$score1, 0.1)
mean(sch$score2[prob] - sch$score1[prob])`,
          a: r`<p>Read the expression inside out: <code>sch$z2 &gt; sch$z1</code> is a logical vector (improved?), it's subset to the schools in a quartile, and <code>mean()</code> gives the share that improved. About 70% of bottom-quartile schools improved versus about 32% of top-quartile schools. The probation schools gained about 2.5 points on average with no intervention at all in this simulation: there was no probation effect built into the data.</p>`,
          rubric: ["Explains the logical vector z2 > z1, its subsetting by quartile, and mean() as a share","Bottom quartile improves far more often (~70% vs ~32%)","Probation schools gain ~2.5 points","Notes the data contain no treatment effect"],
        },
        {
          kind: "write", q: r`Explain to the superintendent why the probation schools improved. Does this mean school quality is converging? Propose a design that could credibly estimate probation's effect.`,
          a: r`<p>Year-1 scores mix true quality and chance (a bad test day, a few weak cohorts). Schools selected for <i>extremely</i> low scores are disproportionately ones that were unlucky in year 1. Their luck doesn't repeat, so year 2 moves back toward their true level. That is regression towards the mean, explainable by chance alone. It's not convergence: the spread of scores is about the same both years (SD ≈ 9.9 each), with top schools drifting down as bottom ones drift up. A credible design is <b>regression discontinuity</b> at the probation cutoff: compare schools just below the 10th-percentile cutoff (probation) with schools just above it, which experienced the same chance selection. Alternatively, a DiD comparing probation schools with similar low-scoring non-probation schools.</p>`,
          rubric: ["Selection on extreme scores picks up bad luck that doesn't repeat","Names regression towards the mean, explainable by chance","Rebuts convergence (spread unchanged; top schools fall)","Proposes RD at the cutoff (or a valid comparison-group design)"],
        },
      ],
    },
    {
      id: "c4merge", sec: "4.2.5", title: "Merging data sets",
      setup: r``,
      context: r`<p><code>merge(x, y, by = )</code> matches rows on a key variable; <code>cbind()</code> just puts columns side by side.</p>`,
      parts: [
        {
          kind: "predict", q: r`Predict each output: the columns, their names, and the row order.`,
          show: r`a <- data.frame(id = c("TX", "CA", "NY"), pop = c(30, 39, 20), year = c(2020, 2020, 2020))
b <- data.frame(id = c("CA", "NY", "TX"), gdp = c(3.9, 2.0, 2.4), year = c(2021, 2021, 2021))
merge(a, b, by = "id")
cbind(a, b)[1, ]
names(b)[1] <- "abb"
names(merge(a, b, by.x = "id", by.y = "abb"))`,
          a: r`<ul><li><code>merge()</code> matches rows by <code>id</code> and sorts by it (CA, NY, TX). Both inputs have <code>year</code>, so the result has <code>year.x</code> (from a) and <code>year.y</code> (from b): columns <code>id pop year.x gdp year.y</code>.</li>
<li><code>cbind()</code> ignores the key: row 1 pairs a's TX with b's CA, so it wrongly gives TX a GDP of 3.9 and keeps two <code>id</code> and two <code>year</code> columns.</li>
<li>With different key names, <code>by.x</code> and <code>by.y</code> name each; the result keeps x's name: <code>"id" "pop" "year.x" "gdp" "year.y"</code>.</li></ul>`,
          rubric: ["merge matches on the key and sorts by it",".x / .y suffixes for the shared non-key column","cbind misaligns rows (TX paired with CA's GDP) and duplicates columns","by.x/by.y and the key keeps x's name"],
        },
      ],
    },
    {
      id: "c4fit", sec: "4.2.6", title: "Model fit and an influential outlier",
      setup: r`set.seed(23)
n <- 60
council <- data.frame(county = paste0("County", 1:n), minor20 = round(rlnorm(n, log(1500), 0.8)))
council$minor24 <- round(50 + 0.4 * council$minor20 + rnorm(n, 0, 120))
council$minor24[17] <- council$minor24[17] + 2600
council$county[17] <- "Ashford"
rm(n)`,
      context: r`<p>A minor party ran in two consecutive elections. The data frame <code>council</code> has, for 60 counties, <code>county</code>, <code>minor20</code> (the party's votes in 2020), and <code>minor24</code> (its votes in 2024). In 2024 one county used a confusing new ballot layout.</p>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret the regression and the R² (computed two ways). Is this fit surprising for a party's vote in consecutive elections?`,
          show: r`fit <- lm(minor24 ~ minor20, data = council)
fit
TSS <- sum((council$minor24 - mean(council$minor24))^2)
SSR <- sum(resid(fit)^2)
(TSS - SSR) / TSS
summary(fit)$r.squared`,
          a: r`<p>TSS is the total variation of the outcome around its mean; SSR is the variation left after the regression. R² = (TSS − SSR)/TSS ≈ 0.65: 2020 votes explain about 65% of the variation in 2024 votes. For a party's vote in two consecutive elections that's surprisingly low, which is a hint that something unusual is going on.</p>`,
          rubric: ["TSS = total variation; SSR = variation left after the regression","R² ≈ 0.65 by formula matches summary()","Interprets R² as the share of variation in 2024 votes explained","Flags the low fit as suspicious"],
        },
        {
          kind: "interpret", q: r`Interpret the residual plot and explain how the last line identifies a county.`,
          show: r`fit <- lm(minor24 ~ minor20, data = council)
plot(fitted(fit), resid(fit), xlab = "Fitted values", ylab = "Residuals")
abline(h = 0)
council$county[resid(fit) == max(resid(fit))]`,
          a: r`<p>Most residuals scatter around 0 with no pattern. One point sits far above the rest. <code>resid(fit) == max(resid(fit))</code> is a logical vector that is TRUE only for that county, and indexing <code>county</code> with it returns <code>"Ashford"</code>: the county with the new ballot, where the party got far more votes than predicted.</p>`,
          rubric: ["Residual plot: residuals against fitted values with a line at 0","Most points show no pattern; one is extreme","resid == max(resid) is a logical vector that picks out Ashford","Connects Ashford to the confusing ballot"],
        },
        {
          kind: "interpret", q: r`The analyst refits without Ashford. Interpret the changes in the coefficients and R², and the two lines on the plot.`,
          show: r`fit <- lm(minor24 ~ minor20, data = council)
fit2 <- lm(minor24 ~ minor20, data = subset(council, county != "Ashford"))
coef(fit)
coef(fit2)
summary(fit)$r.squared
summary(fit2)$r.squared
plot(council$minor20, council$minor24, xlab = "2020 votes", ylab = "2024 votes")
abline(fit, lty = "dashed")
abline(fit2)`,
          a: r`<p>Without Ashford, R² jumps from about 0.65 to about 0.96, and the line changes (the intercept falls from about 161 to about 65). One observation was both an outlier (huge residual) and influential (it moved the fitted line). The new line describes the other 59 counties much better.</p>`,
          rubric: ["R² rises from ~0.65 to ~0.96","The intercept falls (~161 to ~65) and the slope changes","Distinguishes outlier (large residual) from influential (moves the line)","The dashed line is the fit with Ashford; the solid line fits the other 59 counties better"],
        },
        {
          kind: "write", q: r`Is dropping Ashford "cheating"? Explain when it is appropriate, what Ashford's residual itself might measure, and why a high R² on these 60 counties doesn't guarantee good predictions for the next election.`,
          a: r`<p>It's appropriate when the goal is to describe the typical relationship and there's a substantive reason the point is different (here, a ballot design error), and when you report that you dropped it and why. Ashford's residual is itself informative: its gap above the predicted value estimates how many votes the confusing ballot shifted to the minor party, as with Palm Beach's butterfly ballot. R² measures <i>in-sample</i> fit. A model tuned too closely to one sample (overfitting) can predict worse out of sample, and the next election may bring new shocks the model has never seen.</p>`,
          rubric: ["Justified when there's a substantive reason and it's disclosed","Residual estimates the ballot's effect (Palm Beach analogy)","R² is in-sample; out-of-sample accuracy can be worse (overfitting)"],
        },
      ],
    },
    {
      id: "c4rct", sec: "4.3.1", title: "Regression on a randomized treatment: job training",
      setup: r`set.seed(86)
n <- 800
jobs <- data.frame(treat = sample(rep(0:1, n / 2)))
jobs$prior <- round(rlnorm(n, log(18), 0.5), 1)
jobs$attended <- jobs$treat * rbinom(n, 1, plogis(-0.5 + 0.12 * jobs$prior))
jobs$earn <- round(pmax(0, 4 + 0.8 * jobs$prior + 2.5 * jobs$attended + rnorm(n, 0, 4)), 1)
rm(n)`,
      context: r`<p>A city randomly offered a job-training program to half of 800 applicants. The data frame <code>jobs</code> has <code>treat</code> (1 if offered), <code>attended</code> (1 if the person actually attended), <code>prior</code> (earnings the year before, $1000s), and <code>earn</code> (earnings the year after, $1000s).</p>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret each line: the compliance check, the difference-in-means, and the regression. Which group mean does each coefficient equal?`,
          show: r`tapply(jobs$attended, jobs$treat, mean)
mean(jobs$earn[jobs$treat == 1]) - mean(jobs$earn[jobs$treat == 0])
lm(earn ~ treat, data = jobs)
mean(jobs$earn[jobs$treat == 0])`,
          a: r`<p>About 82% of those offered attended, and no one in the control group did, so the offer clearly changed participation (a compliance check). The slope on <code>treat</code> is exactly the difference-in-means (about 1.8, i.e. $1,800). The intercept is exactly the control group's mean earnings. Because the offer was randomized, the slope estimates the average causal effect of being <i>offered</i> training.</p>`,
          rubric: ["Compliance check: ~82% of those offered attended, none of the controls","Slope equals the difference-in-means (~1.8, i.e. $1,800)","Intercept equals the control group's mean","Causal interpretation of the offer, justified by randomization"],
        },
        {
          kind: "write", q: r`Derive why, with a binary X, \(\hat\alpha\) is the control mean and \(\hat\beta\) the difference in means. Connect the result to potential outcomes.`,
          a: r`<p>With X ∈ {0, 1}, the fitted values take two values: \(\hat\alpha\) for X = 0 and \(\hat\alpha + \hat\beta\) for X = 1. Least squares chooses each fitted value to minimize squared errors within its group, and the value that minimizes \(\sum (y_i - c)^2\) is the group mean. So \(\hat\alpha = \bar Y_{\text{control}}\) and \(\hat\alpha + \hat\beta = \bar Y_{\text{treated}}\), giving \(\hat\beta = \bar Y_{\text{treated}} - \bar Y_{\text{control}}\). In potential outcomes, \(\hat Y(0) = \hat\alpha\) and \(\hat Y(1) - \hat Y(0) = \hat\beta\): the regression is a numerically identical way to compute the difference-in-means estimator, and randomization makes it causal.</p>`,
          rubric: ["Fitted values: α̂ for X = 0 and α̂ + β̂ for X = 1","Group means minimize within-group squared error","β̂ = treated mean − control mean","Potential-outcomes link: Ŷ(0) = α̂, effect = β̂"],
        },
        {
          kind: "interpret", q: r`An evaluator instead regresses earnings on <code>attended</code>. Interpret the output, compare it with part (a), and explain the discrepancy using the second table.`,
          show: r`lm(earn ~ attended, data = jobs)
offered <- subset(jobs, treat == 1)
tapply(offered$prior, offered$attended, mean)`,
          a: r`<p>The slope on <code>attended</code> (about 4.2) is much larger than the effect of the offer. Attendance was <i>chosen</i>: among those offered, attendees had much higher prior earnings (about 22 vs 13 thousand) and would have earned more anyway. Prior earnings confounds the attended–earnings relationship. Randomization made the offer comparable across groups, not the decision to attend. The offer comparison (about 1.8) is the credible causal estimate. It is diluted by the 18% of offered people who didn't attend, but it isn't confounded.</p>`,
          rubric: ["The attended slope (~4.2) is much larger than the offer effect","Attendees had higher prior earnings (~22 vs 13 thousand)","Self-selection into attendance confounds the comparison","Randomization applies to the offer, not to attendance"],
        },
      ],
    },
    {
      id: "c4fac", sec: "4.3.2", title: "Factor treatments and adjusted R²",
      setup: r`set.seed(29)
n <- 4000
gotv <- data.frame(arm = sample(c("Assist", "Control", "Pledge", "Social"), n, replace = TRUE))
eff <- c(Assist = 0.03, Control = 0, Pledge = 0.06, Social = 0.09)[gotv$arm]
gotv$voted <- rbinom(n, 1, 0.35 + eff)
rm(n, eff)`,
      context: r`<p>A turnout experiment randomly assigned 4,000 registered voters to four arms: <code>"Assist"</code> (help with a voting plan), <code>"Control"</code>, <code>"Pledge"</code> (sign a pledge to vote), and <code>"Social"</code> (neighbors' turnout shown). The data frame <code>gotv</code> has <code>arm</code> and <code>voted</code> (1/0).</p>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret this output. Which level is the base, and why? What does each coefficient mean, and how does the third line reproduce the group means?`,
          show: r`levels(as.factor(gotv$arm))
fit <- lm(voted ~ arm, data = gotv)
coef(fit)
coef(fit)[1] + c(0, coef(fit)[2:4])
tapply(gotv$voted, gotv$arm, mean)`,
          a: r`<p>The base level is the first alphabetically, <b>Assist</b>, so <i>Control is not the baseline</i>. R creates indicators for the other three levels and omits Assist's because, with an intercept, all four indicators would be redundant (they always sum to 1). The intercept is Assist's mean turnout; each other coefficient is that arm's mean <i>minus Assist's</i>. Adding the intercept to each coefficient reproduces every group mean exactly. That's why <code>armControl</code> is negative.</p>`,
          rubric: ["Base level is Assist (alphabetically first), not Control","One indicator is dropped because, with an intercept, all four would be redundant","Intercept = Assist's mean; other coefficients = differences from Assist","Intercept + each coefficient reproduces the tapply group means"],
        },
        {
          kind: "interpret", q: r`Three calculations of the Social arm's effect relative to Control give identical numbers. Explain why each works.`,
          show: r`fit <- lm(voted ~ arm, data = gotv)
coef(fit)["armSocial"] - coef(fit)["armControl"]
fit0 <- lm(voted ~ -1 + arm, data = gotv)
coef(fit0)
coef(fit0)["armSocial"] - coef(fit0)["armControl"]
mean(gotv$voted[gotv$arm == "Social"]) - mean(gotv$voted[gotv$arm == "Control"])`,
          a: r`<p>All three give the same number (about 0.093, or 9.3 points). In the intercept model both coefficients are differences from Assist, so subtracting them cancels the base. In the <code>-1</code> model each coefficient <i>is</i> a group mean, so the difference is directly a difference in means. The parameterization changes how coefficients read, not the fitted values or effects.</p>`,
          rubric: ["Subtracting the two coefficients cancels the common base (Assist)","In the -1 model each coefficient is a group mean","The difference-in-means matches","The parameterization changes how coefficients read, not the effects"],
        },
        {
          kind: "interpret", q: r`Explain the order of the predictions and what the new data frame must contain.`,
          show: r`fit <- lm(voted ~ arm, data = gotv)
newd <- data.frame(arm = unique(gotv$arm))
newd
predict(fit, newdata = newd)`,
          a: r`<p><code>unique()</code> returns values in order of <i>first appearance</i> in the data, not alphabetically, so the rows of <code>newd</code> follow that order and <code>predict()</code> returns one prediction per row in the same order. Always print <code>newd</code> to see which prediction belongs to which arm. The new data frame must contain a variable named exactly like the model's predictor (<code>arm</code>).</p>`,
          rubric: ["newdata needs a variable named exactly like the predictor (arm)","unique() returns values in order of first appearance, not alphabetically","Each prediction equals that arm's group mean"],
        },
        {
          kind: "write", q: r`By hand: a model with p = 3 predictors fit to n = 1,000 observations has SSR = 236.4 and TSS = 240.0. Compute R² and adjusted R². Why does adjusted R² divide SSR by n − p − 1 and TSS by n − 1? Why can't plain R² be used to choose between models with different numbers of predictors?`,
          a: r`<p>R² = 1 − 236.4/240 = 1 − 0.985 = <b>0.015</b>. Adjusted R² = \(1 - \frac{236.4/996}{240/999} = 1 - \frac{0.23735}{0.24024} \approx \mathbf{0.0120}\). SSR is divided by its degrees of freedom: n minus the p + 1 coefficients estimated (intercept included). TSS estimates only one parameter, the mean, so it is divided by n − 1. Adding any predictor, even pure noise, can only lower SSR, so plain R² never decreases. Adjusted R² charges a price per predictor, so it can fall when a useless variable is added. With n large relative to p (as here), the two are close.</p>`,
          rubric: ["R² = 0.015","Adjusted R² ≈ 0.012 with correct degrees of freedom","Explains the n − p − 1 and n − 1 denominators","Plain R² never decreases with added predictors"],
        },
      ],
    },
    {
      id: "c4het", sec: "4.3.3", title: "Heterogeneous effects and interactions: door-to-door canvassing",
      setup: r`set.seed(55)
n <- 3000
canv <- data.frame(treat = rbinom(n, 1, 0.5), prior = rbinom(n, 1, 0.45), age = round(runif(n, 18, 90)))
p <- 0.15 + 0.25 * canv$prior + 0.005 * (canv$age - 18) - 0.00004 * (canv$age - 18)^2 +
  canv$treat * (0.04 + 0.05 * canv$prior + 0.0025 * (canv$age - 18) - 0.00003 * (canv$age - 18)^2)
canv$voted <- rbinom(n, 1, pmin(0.95, p))
rm(n, p)`,
      context: r`<p>A campaign randomly assigned 3,000 households to be canvassed (<code>treat</code> = 1) or not. The data frame <code>canv</code> has <code>treat</code>, <code>prior</code> (1 if the person voted in the previous election), <code>age</code>, and <code>voted</code>.</p>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret the subgroup estimates, then show which coefficients of the interaction model reproduce each one. What does <code>*</code> do in the formula?`,
          show: r`v <- subset(canv, prior == 1)
nv <- subset(canv, prior == 0)
ate.v <- mean(v$voted[v$treat == 1]) - mean(v$voted[v$treat == 0])
ate.nv <- mean(nv$voted[nv$treat == 1]) - mean(nv$voted[nv$treat == 0])
c(ate.v, ate.nv, ate.v - ate.nv)
lm(voted ~ prior * treat, data = canv)`,
          a: r`<p>Prior voters: about 0.114; prior non-voters: about 0.046; difference about 0.068. In the model \(Y = \alpha + \beta_1\,\text{prior} + \beta_2\,\text{treat} + \beta_3\,\text{prior}\times\text{treat}\): the effect for non-voters (prior = 0) is \(\beta_2\) ≈ 0.046; for voters (prior = 1) it is \(\beta_2 + \beta_3\) ≈ 0.114; and \(\beta_3\) ≈ 0.068 is exactly the difference. The two approaches agree. <code>*</code> creates both main effects and the interaction; <code>:</code> alone creates only the interaction term.</p>`,
          rubric: ["Subgroup effects (~0.114 and ~0.046) and their difference (~0.068)","β2 (treat) = the effect for prior non-voters","β2 + β3 = the effect for prior voters; β3 = the difference","* creates both main effects plus the interaction; : creates only the interaction"],
        },
        {
          kind: "write", q: r`A fitted model is \(\hat Y = 0.20 + 0.004\,\text{age} + 0.03\,T + 0.0008\,(\text{age} \times T)\). Derive the estimated treatment effect as a function of age, evaluate it at 30 and 70, and interpret 0.0008. Why should the model include the main effect of age?`,
          a: r`<p>Effect at age \(x\) = \((0.20 + 0.004x + 0.03 + 0.0008x) - (0.20 + 0.004x) = 0.03 + 0.0008x\), which is also \(\partial \hat Y/\partial T\). At 30: 0.03 + 0.024 = <b>0.054</b>. At 70: 0.03 + 0.056 = <b>0.086</b>. The 0.0008 means each additional year of age raises the treatment effect by 0.08 percentage points. Without age's main effect, the interaction coefficient would also absorb age's direct relationship with turnout, distorting how the effect varies with age; that's why main effects are kept whenever an interaction is included. A continuous moderator also assumes the effect changes <i>linearly</i> in age.</p>`,
          rubric: ["Effect = 0.03 + 0.0008 × age (derived by differencing)","0.054 at 30 and 0.086 at 70","Interprets the interaction as the change in the effect per year","Justifies keeping main effects / notes the linearity assumption"],
        },
        {
          kind: "interpret", q: r`Explain what <code>I(age^2)</code> does, why the effect is computed from two sets of predictions instead of read off a coefficient, and interpret the peak age and the plot.`,
          show: r`fit <- lm(voted ~ age + I(age^2) + treat + age:treat + I(age^2):treat, data = canv)
ages <- 20:85
yT <- predict(fit, newdata = data.frame(age = ages, treat = 1))
yC <- predict(fit, newdata = data.frame(age = ages, treat = 0))
ate <- yT - yC
ages[ate == max(ate)]
plot(ages, ate, type = "l", xlab = "Age", ylab = "Estimated effect of canvassing")`,
          a: r`<p><code>I(age^2)</code> squares age inside the formula; without <code>I()</code>, <code>^</code> would be read as formula syntax. With quadratic and interaction terms, no single coefficient is "the effect," so you predict outcomes for the same ages under treatment and control and subtract. The estimated effect rises with age, peaks in the mid-60s, and declines after. <code>type = "l"</code> draws a line.</p>`,
          rubric: ["I() makes ^ arithmetic inside a formula","With quadratic and interaction terms no single coefficient is the effect","Predicts under treat = 1 and treat = 0 for the same ages, then subtracts","Reads the peak (~65) and the rise-then-fall shape"],
        },
      ],
    },
    {
      id: "c4rd", sec: "4.3.4", title: "Regression discontinuity: reform mayors and city debt",
      setup: r`set.seed(71)
n <- 500
mayors <- data.frame(margin = round(runif(n, -0.3, 0.3), 3))
mayors$reform <- as.numeric(mayors$margin > 0)
mayors$ln.debt.pre <- round(7 + 1.2 * mayors$margin + rnorm(n, 0, 0.35), 2)
mayors$ln.debt <- round(mayors$ln.debt.pre + 0.1 + 0.8 * mayors$margin - 0.25 * mayors$reform + rnorm(n, 0, 0.25), 2)
rm(n)`,
      context: r`<p>In 500 mayoral races, a "reform" candidate faced an incumbent-party candidate. The data frame <code>mayors</code> has <code>margin</code> (the reform candidate's vote margin, a proportion; positive = reform won), <code>reform</code> (1 if reform won), <code>ln.debt</code> (log city debt per resident four years later), and <code>ln.debt.pre</code> (log debt per resident in the year <i>before</i> the election).</p>`,
      parts: [
        {
          kind: "interpret", q: r`Interpret the naive comparison and the RD estimate. Why do they have opposite signs? Explain the <code>[2]</code> and <code>[1]</code> in the last line.`,
          show: r`mean(mayors$ln.debt[mayors$reform == 1]) - mean(mayors$ln.debt[mayors$reform == 0])
fit1 <- lm(ln.debt ~ margin, data = mayors[mayors$margin < 0, ])
fit2 <- lm(ln.debt ~ margin, data = mayors[mayors$margin > 0, ])
y1 <- predict(fit1, newdata = data.frame(margin = c(min(mayors$margin), 0)))
y2 <- predict(fit2, newdata = data.frame(margin = c(0, max(mayors$margin))))
y2[1] - y1[2]`,
          a: r`<p>The naive comparison is about <b>+0.32</b>: reform cities look more indebted. But cities where reform wins big differ from cities where it loses big (debt already rises with the reform vote margin). RD compares only what happens <i>at</i> the threshold: each regression predicts log debt at margin 0 from its own side, and the difference, about <b>−0.27</b>, is the jump. <code>y1[2]</code> is the losers' prediction at 0 (the second element of <code>c(min, 0)</code>); <code>y2[1]</code> is the winners' prediction at 0 (the first element of <code>c(0, max)</code>). The sign flips relative to the naive comparison.</p>`,
          rubric: ["Naive difference ≈ +0.32 is confounded by how debt varies with the margin","Two regressions, one on each side of 0, each predicting at margin 0","y1[2] = losers' prediction at 0; y2[1] = winners' prediction at 0","Jump ≈ −0.27 at the threshold"],
        },
        {
          kind: "interpret", q: r`Interpret these back-transformed predictions and the effect in dollars.`,
          show: r`fit1 <- lm(ln.debt ~ margin, data = mayors[mayors$margin < 0, ])
fit2 <- lm(ln.debt ~ margin, data = mayors[mayors$margin > 0, ])
y1 <- predict(fit1, newdata = data.frame(margin = c(min(mayors$margin), 0)))
y2 <- predict(fit2, newdata = data.frame(margin = c(0, max(mayors$margin))))
exp(y2[1])
exp(y1[2])
exp(y2[1]) - exp(y1[2])`,
          a: r`<p><code>exp()</code> undoes the natural log. At the threshold, cities where reform barely won are predicted to carry about $940 of debt per resident versus about $1,230 where reform barely lost: roughly <b>$290 less</b> per resident (about 24% lower). The effect applies to closely contested races only.</p>`,
          rubric: ["exp() undoes the natural log","≈ $940 vs ≈ $1,230 per resident at the threshold","Effect ≈ −$290 per resident (about 24% lower)","The effect is local to close races"],
        },
        {
          kind: "interpret", q: r`This is a placebo test. Explain its logic, why the code compares intercepts, and interpret the result.`,
          show: r`p1 <- lm(ln.debt.pre ~ margin, data = mayors[mayors$margin < 0, ])
p2 <- lm(ln.debt.pre ~ margin, data = mayors[mayors$margin > 0, ])
coef(p2)[1] - coef(p1)[1]`,
          a: r`<p>Debt the year <i>before</i> the election cannot be caused by who wins it, so the true effect at the threshold is zero. The estimated jump is about 0.003, essentially zero, which supports the RD assumption that barely-winning and barely-losing cities are comparable. Comparing <i>intercepts</i> works because each intercept is the prediction at margin 0. A large placebo jump would suggest the cities just above and below differ in ways that existed before the election, e.g. sorting or manipulation of close races (fraud, strategic recounts), which would undermine the design.</p>`,
          rubric: ["Pre-election debt can't be affected by who wins","Estimate ≈ 0 supports comparability at the threshold","Intercepts are the predictions at margin 0","A large jump would signal sorting or manipulation of close races"],
        },
        {
          kind: "write", q: r`State the RD assumption for this study, its main strength relative to the naive comparison, and its main weakness. Would you use this estimate to predict what happens when a reform candidate wins in a landslide?`,
          a: r`<p>Assumption: absent the election result, average debt would change smoothly through margin 0. Any jump at the threshold is due only to who won (cities just above and below are comparable). Strength: high internal validity without randomization, since near-ties are close to coin flips, and it needs weaker assumptions than other observational designs. Weakness: the estimate is <i>local</i> to close races. A landslide reform win likely happens in a different kind of city (stronger mandate, different politics), so the effect may differ there. This is RD's external validity limitation, so no.</p>`,
          rubric: ["States the continuity / only-the-winner-changes assumption","Strength: internal validity near the threshold, weaker assumptions","Weakness: local effect, limited external validity","Correctly declines to extrapolate to landslides"],
        },
      ],
    },
    {
      id: "c4syn", sec: "4.4", title: "Synthesis: prediction versus causation",
      setup: r``,
      context: r`<p>These questions cut across the chapter.</p>`,
      parts: [
        {
          kind: "write", q: r`Forecaster A's state forecasts have bias 0 and RMSE 8 points; forecaster B's have bias +2 (overstating the Democrat) and RMSE 3. Which would you rather use to call state winners, and why? What does B's bias tell you that RMSE alone wouldn't?`,
          a: r`<p>B. Calling winners depends on getting each state's sign right, which depends on the size of individual errors. B's errors are typically 3 points versus A's 8, so B will misclassify far fewer close states even though its forecasts lean 2 points toward the Democrat. A's zero bias only means its large errors cancel <i>on average</i>. B's bias says its errors are systematic (consistently toward the Democrat). You could subtract 2 points to correct it, which you can't do for A's random scatter.</p>`,
          rubric: ["Prefers B because of its smaller RMSE","Classification depends on individual error size","Zero bias can coexist with large errors","B's bias is systematic and correctable"],
        },
        {
          kind: "write", q: r`A model predicts turnout with R² = 0.6 using "number of campaign contacts received." (i) Can a campaign conclude that each contact causes higher turnout? (ii) Under what design would the slope on contacts be causal? (iii) Why might this same model still be excellent for <i>predicting</i> who votes?`,
          a: r`<p>(i) No. Campaigns target likely voters, so people who were already going to vote receive more contacts: contacts are associated with turnout through targeting (confounding by prior propensity), not necessarily caused by it. (ii) If contacts were randomly assigned (an RCT), the slope would estimate the average causal effect, as in Section 4.3.1. A regression discontinuity, if contacts were assigned by a score cutoff, would also work. (iii) Prediction needs association, not causation: if contacts reliably signal who will vote, the model forecasts well even though changing someone's contacts wouldn't change their behavior by that amount. Causal inference requires predicting <i>counterfactual</i> outcomes, which a good observational fit doesn't deliver.</p>`,
          rubric: ["(i) Targeting/confounding means no causal conclusion","(ii) Random assignment (or a valid design like RD) makes it causal","(iii) Association suffices for prediction","Explicitly contrasts predicting observed vs counterfactual outcomes"],
        },
      ],
    },
  ],
};
