# QSS Midterm — Q&A Study Guide

Questions asked while studying, with answers. To be turned into a study guide later.

---

## 1. What does `tapply(social$hhsize, social$messages, mean)` produce?
*Ch 2.4.2 — Social Pressure and Voter Turnout (RCT)*

**Key point:** **`messages` makes the groups, and `hhsize` is what gets averaged.**

`tapply(X, INDEX, FUN)`:
- **X** = `social$hhsize` is the values to summarize (household size).
- **INDEX** = `social$messages` is the grouping variable (which mailing each voter got).
- **FUN** = `mean` is what gets applied to each group.

**Exam answer:** "The mean household size within each message (treatment) group, used to check that the pre-treatment covariate is balanced across groups."

---

## 2. Difference-in-means estimator vs. SATE
*Ch 2.4.1 — The Role of Randomization (SATE box, p. 49)*

**Key point:** **SATE is the estimand (the target, which you can't observe). The difference-in-means is the estimator (what you compute from the data).**

- **SATE** $= \frac{1}{n}\sum_{i=1}^{n}[Y_i(1) - Y_i(0)]$: the average of each unit's individual causal effect. You can't observe it, because each unit shows only one potential outcome (the fundamental problem of causal inference).
- **Difference-in-means** $= \bar{Y}_{\text{treated}} - \bar{Y}_{\text{control}}$: always computable. The control group's mean stands in for the treated units' missing "no treatment" outcomes, and vice versa.
- **In an RCT**, randomization makes the groups identical on average in pre-treatment characteristics, so the difference-in-means is a valid estimate of the SATE. Without randomization, confounding can bias it.
- **Wording:** the difference-in-means **estimates** the SATE; it doesn't compute it exactly. They're not the same number, because the SATE needs both potential outcomes for every unit.

**Exam answer:** "SATE is the estimand: the average of the unobservable individual effects. The difference-in-means is the estimator: treated mean minus control mean. Randomization makes the second a valid estimate of the first."

---

## 3. What does `prop.table(table())` do?
*Ch 2.5 (p. 59, minimum wage) and Ch 3 (pp. 77–81, survey data)*

**Key point:** **`table()` counts how often each value appears. `prop.table()` turns those counts into proportions that add up to 1.**

- Example: `table(x)` gives `kfc 3, roys 1, wendys 1`, so `prop.table(table(x))` gives `kfc 0.6, roys 0.2, wendys 0.2` (each count divided by the total of 5).
- **p. 59:** run separately for the NJ and PA restaurants to compare the chain mix in each state. A different mix could make the chain a confounder.
- **p. 77, two variables:** `prop.table(table(A = , B = ))` gives each cell's share of the whole table (all cells sum to 1). Summing a row or column gives that category's overall share.
- **pp. 79–81:** `exclude = NULL` inside `table()` counts `NA` as its own category, showing the share of missing answers.

**Exam answer:** "It gives the proportion of observations in each category (or each cell of a two-way table): the counts from `table()` divided by the total."

---

## 4. What's an example of confounding bias? Is age a confounder or an immutable characteristic?
*Ch 2.5.2 — Confounding Bias (definition box, p. 58); Ch 2.3 — immutable characteristics*

**Key point:** **A confounder is a pre-treatment variable related to both the treatment and the outcome. It makes the naive comparison credit the treatment with an effect that partly belongs to the confounder.**

- **Example:** private-school students score higher, but family income drives both private-school attendance and test scores, so part of the gap is an income gap.
- **Book example (p. 59, minimum wage):** the chain mix differs between NJ and PA restaurants (`prop.table(table(chain))`), so chain could confound the wage effect. The fix is **subclassification**: compare within the same chain.
- **RCTs avoid it:** randomization breaks the link between any pre-treatment variable and treatment. Observational studies can never fully rule it out.
- **"Immutable" vs. "confounder" answer different questions.** Immutable (age, race, gender) is about whether something can be a *treatment* ("no causation without manipulation"; the résumé study manipulates *perceived* race through names). Confounder is about a variable's *role* in a specific study.
- **Age can be both:** it's always pre-treatment, so in observational studies it's often a confounder (e.g., news reading → voting). In an RCT it isn't one, because randomization means it can't affect who's treated; the balance checks on `yearofbirth` and `hhsize` confirm this.

**Exam answer:** "A confounder is a pre-treatment variable associated with both treatment and outcome, which biases the naive treated-vs-control comparison. An immutable trait like age can't be a manipulable treatment, but it can confound observational comparisons; randomization removes that confounding."

---

## 5. What's the logical flow of a linear regression (SSR, TSS, R², RMSE)?
*Ch 4.2.3 — Least Squares; 4.2.6 — Model Fit*

**Key point:** **Fit the line, measure what it misses (SSR, RMSE), then compare that with what you'd miss using only the mean of Y (TSS). R² is the share of that variation X explains.**

1. **Fit:** model \(Y = \alpha + \beta X + \varepsilon\). Least squares picks \(\hat\alpha, \hat\beta\) to minimize SSR (`lm(y ~ x, data = df)`, `coef(fit)`).
2. **Predict and miss:** fitted value \(\hat Y = \hat\alpha + \hat\beta X\) (`fitted(fit)`); residual \(\hat\varepsilon = Y - \hat Y\) (`resid(fit)`).
3. **Size of the misses:** SSR \(= \sum \hat\varepsilon_i^2\); RMSE \(= \sqrt{\text{SSR}/n}\), the typical miss in Y's units.
4. **Benchmark:** TSS \(= \sum (Y_i - \bar Y)^2\), the error from predicting \(\bar Y\) for everyone (the SSR of a model with no X). Then \(R^2 = 1 - \text{SSR}/\text{TSS}\).
5. **Check:** residual plot for outliers; adjusted R² with several predictors (plain R² never falls when a predictor is added); R² is in-sample fit, not causation.
- **Example:** points (1,2), (2,4), (3,5), (4,4), (5,5): \(\hat\beta = 0.6\), \(\hat\alpha = 2.2\), SSR = 2.4, TSS = 6, R² = 0.6, RMSE ≈ 0.69.

**Exam answer:** "Least squares chooses the intercept and slope that minimize SSR, the sum of squared residuals. TSS is the squared error from predicting the mean of Y for everyone. R² = 1 − SSR/TSS is the proportion of variation in Y explained by X, and RMSE = √(SSR/n) is the typical prediction error."

---

## 6. Is my exam study list complete? Can a linear regression be biased?
*Whole exam (Ch 1–4)*

**Key point:** **Fix the R names (`table()`, `cor()`; there's no `!>`; TSS not "TSR"), and add the gaps: k-means, least squares, SATT, parallel trends, balance checks and placebo tests, adjusted R², sensitive-question methods, sampling designs, and measurement models.**

- **Can a regression be biased?** As an in-sample predictor, no: with an intercept the residuals always average 0, so the prediction bias is 0 for any data (an algebraic fact, not proof the model is right). As a causal estimate, yes: if X isn't randomized, confounders bias the slope. Out-of-sample predictions can also be biased.
- **Mode** isn't in the book, and R's `mode()` reports an object's storage type, not the most common value.

**Exam answer:** "A least-squares regression with an intercept always has mean residual zero, so it is unbiased as an in-sample prediction. Its slope is a biased estimate of a causal effect whenever X is confounded."
