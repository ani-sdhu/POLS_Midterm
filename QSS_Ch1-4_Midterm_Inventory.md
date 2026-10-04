# POLS 7012 Midterm — Knowledge Inventory (QSS Ch. 1–4)

Source: Imai, *Quantitative Social Science: An Introduction* (QSS), Chapters 1–4.
Exam: October 6, 2026. Written exam covering R coding and political methodology, conceptually.

Scope:

- Readings: QSS 1.3 (R foundation), 2.1–2.7, 3.1–3.8, 4.1–4.4
- Calculus fundamentals (course addition, not from QSS)
- Out of scope: problem sets; the specifics of the book's case studies (authors, findings, variable lists, numbers)

Conventions:

- Every bullet is a knowledge target (something to define, state, compute, read, or interpret). No answers are written here.
- Headings mirror QSS section numbers and titles. Each section has up to three parts:
  - **★ Definition Box** — the book's outlined boxes with a bolded term. Know these to a tee. Each box is split into every component it states. Page = printed book page.
  - **Concepts** — methodology to understand conceptually.
  - **Code Blocks** — book code to read and interpret. Format: `p. <page> — <functions/operators> — what the block does → what to read/interpret`. A quiz may give the case context ("in this study, variable x means …") and ask what the code does or what its output means. Case facts are supplied, not memorized.
- **Case (context only)** lines name the running example behind a section's code, so the code can be located. Nothing about the case itself is a target.

---

# Core Vocabulary

Know each term conceptually and be able to apply it to any study description.

- Research question
- Unit of observation (unit of analysis)
- Observation vs variable (rows vs columns of a data set)
- Sample size (n)
- Treatment variable (causal variable of interest)
- Outcome (response) variable
- Treatment group vs control group
- Treatment condition vs control condition
- Pretreatment variable (covariate): definition; why it is unaffected by treatment
- Posttreatment variable
- Research design: what the term covers
- Experimental design vs observational design
- Experimental data vs observational data
- Natural experiment: how it differs from an RCT and from a typical observational study
- Cross-section data vs longitudinal (panel) data
- Binary (dummy, indicator) variable
- Categorical (factor) variable; levels
- Numeric/continuous variable
- Ordinal vs interval measurement; treating ordinal responses as numeric (equal-spacing assumption)
- Proportion vs percentage vs percentage point
- Population vs sample
- Parameter vs estimate vs estimator
- Quantity of interest
- Descriptive vs causal vs predictive questions
- Operationalization: turning a concept into a measured variable
- Identifying, from a study description: the unit, treatment, outcome, treatment/control groups, design, and possible confounders

---

# Chapter 1: Introduction

No definition boxes in Chapter 1.

## 1.3 Introduction to R

### 1.3.1 Arithmetic Operations

#### Concepts

- Arithmetic operators and order of operations with parentheses
- The `[1]` marker in output: what it indexes
- `##` in the book: marks output, not code
- What a function is (input → output)

#### Code Blocks

- p. 11–12 — `+ - * / ^`, parentheses, `sqrt()` — R as a calculator → predict each output

### 1.3.2 Objects

#### Concepts

- Objects; informative names; naming rules (no leading digit, no spaces, avoid `%`, `$`)
- Case sensitivity
- Overwriting an object by reassigning its name
- Workspace and the Environment pane
- Object classes: numeric, character, function (later: logical, factor, data.frame, matrix, list, Date)
- Why arithmetic on a character value fails

#### Code Blocks

- p. 12 — `<-`, auto-printing, `print()` — assigning and printing → predict output
- p. 12–13 — reassignment; referencing `Result` vs `result` — overwriting; case-sensitivity error → read the "object not found" error
- p. 13 — `ls()`; character strings in quotes — listing objects; storing text
- p. 13–14 — `"5"` then `/`, `sqrt()` on a character — arithmetic on characters → read the "non-numeric argument" errors
- p. 14 — `class()` — checking numeric, character, function classes → predict each class

### 1.3.3 Vectors

#### Concepts

- Vector: one-dimensional ordered collection
- Indexing by position; negative indices; indexing never changes the original
- Vectorized arithmetic (element-wise; vector with scalar; vector with vector)
- Percentage change between consecutive elements
- Replacing elements by assigning to an index

#### Code Blocks

- p. 14–15 — `c()` — creating a vector; combining vectors
- p. 15 — `[ ]`, `c()` inside brackets, negative index — extracting and dropping elements → predict the returned elements and their order
- p. 16 — vector `/ 1000`; vector `/ vector[1]` — element-wise division; ratio to a baseline → interpret the values
- p. 16 — `world.pop[-1] - world.pop[-7]`, then `/ world.pop[-7] * 100` — decade-over-decade percentage increase → explain why the two shifted vectors line up
- p. 16 — `x[c(1, 2)] <- c(20, 22)` — replacing elements → predict the new vector

### 1.3.4 Functions

#### Concepts

- Function anatomy: name, arguments, output
- Argument order vs named arguments
- Names attribute (absent → `NULL`)
- Writing your own function; local objects inside a function

#### Code Blocks

- p. 17 — `length()`, `min()`, `max()`, `range()`, `mean()`, `sum()`; `sum()/length()` — summary functions; mean two ways → predict outputs
- p. 17–18 — `seq(from, to, by)`, reordered named arguments, negative `by`, `:` — generating sequences → predict each sequence
- p. 18–19 — `names()` get/assign — labeling vector elements → predict the printed output before and after
- p. 19 — `function(x) { … return(out) }` (`my.summary`) — user-defined function returning a named vector → trace it on a given input; predict output

### 1.3.5 Data Files

#### Concepts

- CSV vs RData files
- Working directory
- Data frame: collection of equal-length vectors
- Missing values (`NA`) and how functions treat them

#### Code Blocks

- p. 20 — `setwd()`, `getwd()` — setting and checking the working directory
- p. 21 — `read.csv()`, `class()`; `load()` — loading data; why `load()` needs no assignment
- p. 21–22 — `names()`, `nrow()`, `ncol()`, `dim()`, `summary()`, `View()` — inspecting a data frame → read the dimensions; read `summary()` output (Min., 1st Qu., Median, Mean, 3rd Qu., Max.)
- p. 22 — `$` — extracting one variable
- p. 22 — `df[, "var"]`, `df[c(1,2,3), ]`, `df[1:3, "year"]` — two-dimensional indexing → predict what each returns
- p. 23 — `df$var[seq(from = 1, to = nrow(df), by = 2)]` — every other observation → predict the elements
- p. 23 — `c(x, NA)`, `mean()` vs `mean(…, na.rm = TRUE)` — missing values in summaries → predict both outputs

### 1.3.6 Saving Objects

#### Code Blocks

- p. 24 — `save.image()`, `save(obj, file = )`, `write.csv()`, `load()` — saving the workspace vs specific objects vs a CSV → choose the right one for a task

### 1.3.7 Packages

#### Concepts

- Install once vs load every session; CRAN

#### Code Blocks

- p. 25 — `install.packages()`, `library()` — installing vs loading
- p. 25 — `read.dta()`, `read.spss()`, `write.dta()` (foreign) — other software's file formats

### 1.3.8 Programming and Learning Tips

#### Concepts

- Scripts vs console; running highlighted code
- Comments: `#` vs `##` convention
- Style: informative names, spaces around operators, space after commas, indentation
- Linting
- R Markdown / Quarto and reproducibility

#### Code Blocks

- p. 26 — `source()` — running a script file
- p. 26 — commented script: `library()`, `read.csv()`, variable rescaling, `write.dta()` → explain what the script does line by line
- p. 27 — `lint()` output — reading a style warning (`=` vs `<-` for assignment)

---

# Chapter 2: Causality

## 2.1 Racial Discrimination in the Labor Market

Case (context only): résumé field experiment.

### ★ Definition Box: Experimental research (p. 33)

- What experimental research examines (how a treatment causally affects an outcome)
- How it does so: assigning varying values of the treatment variable to different observations
- What it then measures: each observation's corresponding outcome value

### Concepts

- Experimental data: definition
- Treatment variable (causal variable of interest) manipulated to study its effect on an outcome variable
- Manipulating perception of an attribute vs manipulating the attribute itself
- Contingency table (cross-tabulation): definition; cells, rows, columns, margins
- Rate/proportion computed from a table's counts
- Sample mean of a binary variable = sample proportion of 1s
- Expressing a difference in proportions in percentage points
- Interpretation limits: an outcome gap as evidence of discrimination vs intent

### Code Blocks

- p. 33 — `read.csv()`, `dim()` — loading; rows = observations, columns = variables → interpret the dimensions
- p. 34 — `head()`, `summary()` on factor and numeric columns → read counts per level; read the mean of a 0/1 variable as a rate
- p. 35 — `table(race = , call = )`, `addmargins()` — two-way table with totals → read cells and totals
- p. 35 — `sum(tab[, 2]) / nrow(df)`; `tab[1, 2] / sum(tab[1, ])` — overall and group rates from table cells → interpret; explain which cells are used
- p. 36 — `tab[1, ]`, `tab[, 2]` — extracting a table row vs column → predict the output
- p. 36 — `mean(df$call)` — rate as the mean of a binary variable

## 2.2 Subsetting the Data in R

### 2.2.1 Logical Values and Operators

#### Concepts

- The logical class; coercion TRUE → 1, FALSE → 0
- Mean of a logical vector = proportion TRUE; sum = count TRUE
- AND/OR truth table; chaining; parentheses and evaluation order
- Element-wise AND/OR on vectors

#### Code Blocks

- p. 37 — `class(TRUE)`, `as.integer()` — logical class and coercion → predict output
- p. 37 — `mean()` and `sum()` of a logical vector → predict the proportion and count
- p. 37–38 — `&`, `|`, chained and parenthesized combinations → evaluate each expression
- p. 39 — `TF1 | TF2`, `TF1 & TF2` — element-wise logic → predict the vectors

### 2.2.2 Relational Operators

#### Concepts

- `>`, `>=`, `<`, `<=`, `==`, `!=`; `==` vs `=`
- Case-sensitive string comparison
- Element-wise comparison; combining with `&` and `|`

#### Code Blocks

- p. 39 — `4 > 3`, `"Hello" == "hello"`, `!=` → predict TRUE/FALSE
- p. 39 — `x >= 2`, `x != 1` on a vector → predict the logical vector
- p. 39–40 — `(x > 0) & (x <= 2)`, `(x > 2) | (x <= -1)` → predict the logical vector
- p. 40 — `mean()` / `sum()` of a combined condition → predict the proportion and count

### 2.2.3 Subsetting

#### Concepts

- Logical indexing: keep the elements where the index is TRUE
- Row subsetting a data frame; why the comma matters
- `subset()`: the `subset` (rows) and `select` (columns) arguments
- Variables inside `subset()` are found in the named data frame
- Equivalence of bracket subsetting and `subset()`
- Comparing a gap across subgroups

#### Code Blocks

- p. 40 — `mean(df$call[df$race == "black"])` — group rate via logical indexing → explain each piece
- p. 41 — `df$race[1:5]`, `(df$race == "black")[1:5]` — seeing the logical index; reading `Levels:` → predict output
- p. 41 — `df[df$race == "black", ]`, `dim()` — subset rows, then compute on the subset → explain the change in dimensions
- p. 42 — `subset(df, select = c(…), subset = (… & …))` — rows and columns at once → predict which rows and columns remain
- p. 42 — bracket equivalent `df[cond1 & cond2, c("call", "firstname")]` → show it matches `subset()`
- p. 42–43 — four `subset()` calls, then two differences in means — gap within each subgroup → interpret the two gaps

### 2.2.4 Simple Conditional Statements

#### Concepts

- `ifelse(X, Y, Z)`: element-wise choice
- Building an indicator variable from a compound condition
- Three-way tables

#### Code Blocks

- p. 43 — `df$new <- ifelse(cond1 & cond2, 1, 0)` — creating an indicator → predict values for given rows
- p. 43–44 — `table(a = , b = , c = )` — three-way table printed as layers (`, , c = 0`) → read the layered output; check the indicator

### 2.2.5 Factor Variables

#### Concepts

- Factor: categorical variable with levels (stored as integer codes with labels)
- Character vs factor; default alphabetical level order
- Group-wise function application: `tapply(X, INDEX, FUN)`
- Sorting results

#### Code Blocks

- p. 44 — `df$type <- NA`, then `df$type[cond] <- "label"` for four conditions — building a categorical variable → predict the value for given rows
- p. 44 — `class()` → `"character"`; `as.factor()`; `levels()` → predict the level order
- p. 45 — `table(df$type)` — counts per level
- p. 45 — `tapply(df$call, df$type, mean)` — group means → interpret each entry
- p. 45–46 — `as.factor()`, `tapply(…, mean)`, `sort()` — group means sorted ascending → read the sorted output

## 2.3 Causal Effects and the Counterfactual

### ★ Definition Box: Causal effect (p. 48)

- The unit-level scope ("for each observation i")
- Causal effect of a binary treatment Ti defined as the difference between two potential outcomes
- The expression Yi(1) − Yi(0)
- Yi(1): the outcome that would be realized under the treatment condition (Ti = 1)
- Yi(0): the outcome that would be realized under the control condition (Ti = 0)

### ★ Definition Box: Fundamental problem of causal inference (p. 48)

- We observe only one of the two potential outcomes
- Which potential outcome is observed depends on the treatment status
- Formal statement: the observed outcome Yi equals Yi(Ti)

### Concepts

- Counterfactual: definition; factual vs counterfactual comparison
- Potential outcomes Y(1), Y(0); subscript i notation
- Reading a potential-outcomes table: observed vs missing ("?") cells and what determines them
- Pretreatment characteristics are not affected by manipulating treatment
- Identification assumptions: causal claims are only as credible as these
- Immutable characteristics; "no causation without manipulation"
- Getting around immutability by manipulating perceptions of an attribute

### Code Blocks

- p. 46 — `df[1, ]` — one row viewed as a unit whose counterfactual is unobserved → state which potential outcome is observed

## 2.4 Randomized Controlled Trials

### Concepts

- RCT: researchers randomly assign receipt of treatment; why it is called the "gold standard"

### 2.4.1 The Role of Randomization

#### ★ Definition Box: Sample average treatment effect, SATE (p. 49)

- Verbal definition: the sample average of individual-level causal effects
- The formula (equation 2.1)
- Meaning of n
- Meaning of the summation operator and its limits (i = 1 to i = n)

#### ★ Definition Box: Randomized controlled trial, RCT (p. 50)

- Each unit is randomly assigned to either the treatment or control group
- What randomization guarantees: the average outcome difference between groups can be attributed solely to the treatment
- Why: the two groups are, on average, identical in all pretreatment characteristics

#### ★ Definition Box: Internal and external validity (p. 50)

- The main advantage of RCTs: improved internal validity
- Internal validity: the extent to which causal assumptions are satisfied in the study
- One weakness of RCTs: potential lack of external validity
- External validity: the extent to which conclusions can be generalized beyond a particular study

#### Concepts

- Why individual effects cannot be estimated but average effects can
- Why the SATE is not directly observable
- Treatment group vs control group
- Difference-in-means estimator: definition; which group's mean stands in for which counterfactual
- Randomization balances observed and unobserved pretreatment characteristics on average
- Threats to external validity: convenience samples (sample selection bias), laboratory settings, unrealistic interventions
- Field experiments as a response

### 2.4.2 Social Pressure and Voter Turnout

Case (context only): get-out-the-vote mailing experiment with four message groups.

#### ★ Definition Box: Hawthorne effect (p. 52)

- Study subjects behave differently
- Because they know they are being observed by researchers

#### Concepts

- Designing a treatment arm that isolates one mechanism (being observed vs social pressure)
- Multiple treatment arms compared with one control group
- Balance check: comparing pretreatment covariate means across randomized groups; what small differences indicate

#### Code Blocks

- p. 52 — `read.csv()`, `summary()` — factor counts per group, binary means → read the summary
- p. 53 — `tapply(outcome, group, mean)` — outcome rate by group → interpret
- p. 53 — `mean(outcome[group == "Control"])`; `tapply(…) - mean(…)` — each group's effect relative to control → interpret each effect; explain why Control's entry is 0
- p. 54 — `df$age <- 2006 - df$yearofbirth`; `tapply()` of age, prior turnout, household size by group — balance check → interpret balance

## 2.5 Observational Studies

### Concepts

- Observational study: researcher does not intervene; observes naturally occurring treatment
- Why used (ethical and logistical limits)
- Validity profile vs RCTs: weaker internal (selection bias), often stronger external validity

### 2.5.1 Minimum Wage and Unemployment

Case (context only): a state policy change compared with a neighboring state; restaurants surveyed before and after.

#### Concepts

- Cross-section comparison design: treated vs control units after treatment
- Checking that a treatment actually took effect (manipulation/compliance check)
- Constructing a proportion outcome from two counts

#### Code Blocks

- p. 55 — `read.csv()`, `dim()`, `summary()` → read the summary
- p. 56 — `subset(df, location != "PA")` / `== "PA"`; `mean(df$wage < 5.05)` before and after — proportion below a threshold by group and time → interpret as a compliance check
- p. 57 — `df$fullPropAfter <- full / (full + part)`; difference in means between groups → interpret the cross-section estimate

### 2.5.2 Confounding Bias

#### ★ Definition Box: Confounder and confounding bias (p. 58)

- Confounder: a pretreatment variable
- Associated with both the treatment and the outcome
- A source of confounding bias in estimating the treatment effect

#### ★ Definition Box: Statistical control and subclassification (p. 60)

- Confounding bias can be reduced through statistical control
- Subclassification as an example
- How subclassification works: comparing treated and control units that share an identical value of a confounding variable

#### Concepts

- Key assumption of observational comparisons: groups comparable on everything related to the outcome except treatment
- Why a confounder must be pretreatment
- Self-selection into treatment
- Selection bias: confounding due to self-selection
- "Association does not necessarily imply causation"
- Confounding can never be ruled out in observational studies
- Subclassification by one variable, then by two (narrowing the comparison)
- Stable estimates across subclasses: what they suggest

#### Code Blocks

- p. 59 — `prop.table(table(df$chain))` for each group — composition comparison → read proportions; spot a possible confounder
- p. 59 — `subset(…, chain == "burgerking")`, difference in means — subclassification by one variable → interpret vs overall
- p. 59–60 — `subset(…, (location != "shoreNJ") & (location != "centralNJ"))`, difference in means — subclassifying further → interpret

### 2.5.3 Before-and-After and Difference-in-Differences Designs

#### ★ Definition Box: Before-and-after design (p. 61)

- What it examines: how the outcome changed from pretreatment to posttreatment
- For the same set of units
- What it adjusts for: any confounding factor specific to each unit that does not change over time
- What it does not address: bias from time-varying confounders

#### ★ Definition Box: Difference-in-differences, DiD (p. 62)

- DiD estimates the sample average treatment effect for the treated (SATT)
- The DiD estimate formula (treated after − treated before) − (control after − control before)
- Which part is the "difference for the treatment group" and which the "difference for the control group"
- Assumption: the treated group's counterfactual outcome follows a time trend parallel to the control group's

#### Concepts

- Longitudinal (panel) data; advantage over cross-section data
- Time trends as time-varying confounders
- Parallel trends: meaning; why it cannot be verified directly; how earlier pre-periods increase its credibility
- Reading the DiD figure: observed points, counterfactual point, parallel dashed line, brace = effect
- SATT: definition and formula (footnote); how it differs from SATE; n1 as the sum of treatment indicators
- Data each design needs: cross-section (post only, both groups); before-and-after (pre and post, treated only); DiD (pre and post, both groups)
- Why DiD and before-and-after estimates differ (the control group's trend)
- Computing DiD by hand from four means

#### Code Blocks

- p. 60 — `df$fullPropBefore <- …`; `NJdiff <- mean(after) - mean(before)` — before-and-after estimate → interpret
- p. 63 — the same for control, then `NJdiff - PAdiff` — DiD estimate → interpret; say which object is which difference

## 2.6 Descriptive Statistics for a Single Variable

### 2.6.1 Quantiles

#### ★ Definition Box: Median (p. 64)

- The formula for n odd
- The formula for n even
- The notation x(i): the i-th smallest observation
- n: sample size
- The median is less sensitive to outliers than the mean
- Hence the median is a more robust measure of the center of a distribution

#### ★ Definition Box: Quantiles and interquartile range (p. 66)

- Quantiles: data values that divide observations into a number of equally sized groups
- Quartiles (4 groups) and percentiles (100 groups)
- 25th percentile = lower quartile
- 50th percentile = median
- 75th percentile = upper quartile
- Interquartile range: the difference between the upper and lower quartiles
- The IQR measures the spread of a distribution

#### Concepts

- Mean vs median; effect of an extreme value; computing both by hand
- Median-based versions of the cross-section, before-and-after, and DiD estimates as a robustness check
- Terciles, quartiles, quintiles, deciles, percentiles: number of groups each makes
- Reading an IQR of zero

#### Code Blocks

- p. 64 — `median()` differences: cross-section, before-and-after, DiD → interpret vs the mean-based versions
- p. 65 — `summary()` of a numeric variable → read the quartiles
- p. 65 — `IQR()` before vs after → interpret; explain an IQR of 0
- p. 65–66 — `quantile(x, probs = seq(from = 0, to = 1, by = 0.1))` — deciles → read the labeled output (0%, 10%, …, 100%); interpret bunching

### 2.6.2 Standard Deviation

#### ★ Definition Box: Standard deviation and variance (p. 68)

- The SD measures the average deviation from the mean
- The formula with n in the denominator
- The formula with n − 1 in the denominator
- x̄: the sample mean, and its formula
- n: the sample size
- Few data points lie beyond 2 or 3 standard deviations from the mean
- The square of the standard deviation is the variance

#### Concepts

- Root mean square (RMS): definition and formula (equation 2.3); the three steps in its name
- What RMS measures (average magnitude, ignoring sign); mean zero with RMS nonzero
- SD as the RMS of deviations from the mean (equation 2.4)
- n vs n − 1: when it matters; which one R uses
- Variance: harder to interpret, analytically useful
- Computing SD and variance by hand for a small set

#### Code Blocks

- p. 67 — `sqrt(mean((after - before)^2))` vs `mean(after - before)` — RMS vs mean of a change → interpret why they differ
- p. 68 — `sd()`, `var()` → interpret; say which denominator R uses

## 2.7 Summary (synthesis targets)

- The fundamental problem of causal inference as the thread through every design
- Assumptions, strengths, and weaknesses: RCT, cross-section comparison, subclassification, before-and-after, DiD
- RCT vs observational study: internal vs external validity trade-off
- Statistics for center (mean, median) vs spread (range, IQR, SD, variance)

---

# Chapter 3: Measurement

## Chapter framing

- Survey methodology as the most common data-collection mode
- Latent concepts: unobservable; measured through a theoretical model
- Clustering as exploratory pattern discovery

## 3.1 Measuring Civilian Victimization during Wartime

Case (context only): in-person survey in a conflict zone, measuring victimization by two combatant groups.

### Concepts

- Why measurement is hard in sensitive or dangerous settings
- Participation rate: definition and computation from contacted and refused counts
- Joint vs marginal proportions in a two-way proportion table

### Code Blocks

- p. 76–77 — `read.csv()`, `summary()` of numeric, binary, and factor variables → read each type of summary (including the `NA's` count)
- p. 77 — `prop.table(table(A = , B = ))` — joint proportions → read cells; get marginals by summing a row or column

## 3.2 Handling Missing Data in R

### Concepts

- Sources of missing data; `NA` coding
- Listwise deletion: definition and drawback

### Code Blocks

- p. 78 — `head(x, n = 10)`, `is.na()` → read `<NA>` in factor output; predict the logical vector
- p. 78 — `sum(is.na(x))`, `mean(is.na(x))` — count and proportion missing → interpret
- p. 78–79 — `mean(x)` vs `mean(x, na.rm = TRUE)` → predict both
- p. 79 — `prop.table(table(…, exclude = NULL))` — missing values as a category → read nonresponse from the `<NA>` row and column
- p. 79–80 — `na.omit(df)` + `nrow()` vs `length(na.omit(df$x))` → explain why the counts differ

## 3.3 Visualizing the Univariate Distribution

### 3.3.1 Bar Plot

#### Concepts

- Bar plots for factor/categorical variables; heights as proportions

#### Code Blocks

- p. 80–81 — `prop.table(table(…, exclude = NULL))`, `barplot(…, names.arg = , main = , xlab = , ylab = , ylim = )` → name each argument's role; read the plot

### 3.3.2 Histogram

#### ★ Definition Box: Histogram and density (p. 83)

- A histogram divides the data into bins
- The area of each bin represents the proportion of observations in it
- The height of each bin represents density
- Density = proportion of observations in the bin ÷ width of the bin
- A histogram approximates the distribution of a variable

#### Concepts

- Histograms for numeric variables
- Density units (proportion per unit of the horizontal axis); why heights can exceed 1; bin areas sum to 1
- Frequency vs density scale; why density suits comparisons across different sample sizes
- Choosing bin breaks; centering bins on integers for discrete data
- Reading skewness from a histogram
- Interval notation `[a, b)`
- Adding layers to an existing plot

#### Code Blocks

- p. 82 — `hist(x, freq = FALSE, ylim = , xlab = , main = )` → explain `freq = FALSE`; read density
- p. 83 — `hist(…, breaks = seq(from = -0.5, to = 18.5, by = 1))`, `text(x, y, "label")`, `abline(v = median(x))` → explain the break choice and each layer
- p. 84 — `abline(h = )`, `abline(v = )`, `abline(a = , b = )` — three kinds of lines
- p. 84 — `lines(x = rep(median(x), 2), y = c(0, 0.5))` — drawing a line segment → explain what `rep()` builds
- p. 85 — `points()`; `col`, `lty`, `lwd` arguments → name each argument's effect

### 3.3.3 Box Plot

#### ★ Definition Box: Box plot (p. 87)

- What a box plot indicates: median, lower and upper quartiles
- Points outside 1.5 × IQR from the lower and upper quartiles
- Its advantage: compact comparison of distributions across multiple variables

#### Concepts

- Whiskers: extent (1.5 × IQR, or the min/max if within); open circles beyond them
- Histogram vs box plot: what each shows better
- Formula notation `y ~ x` for grouped plots

#### Code Blocks

- p. 85–86 — `boxplot(x, main = , ylab = , ylim = )` → read the median, quartiles, whiskers, outliers
- p. 86 — `boxplot(y ~ group, data = df, …)` — grouped box plots → compare groups
- p. 87 — `tapply(x, group, mean, na.rm = TRUE)` — group means dropping missing values → explain how `na.rm` is passed through

### 3.3.4 Printing and Saving Graphs

#### Code Blocks

- p. 88 — `pdf(file = , height = , width = )`, plot, `dev.off()` → give the sequence and its purpose
- p. 88 — `par(mfrow = c(1, 2), cex = 0.8)` vs `mfcol` — multi-panel layouts; text size → predict the layout

## 3.4 Survey Sampling

### Concepts

- Survey sampling: selecting a sample to learn about a target population
- Census vs sample
- Why small random samples can describe large populations

### 3.4.1 The Role of Randomization

#### ★ Definition Box: Simple random sampling, probability sampling, sample selection bias (p. 90)

- SRS is the most basic form of probability sampling
- SRS avoids sample selection bias by randomly choosing units from a population
- A predetermined number of units is randomly selected
- From a target population, without replacement
- Each unit has an equal probability of selection
- The resulting sample is representative of the population in observed and unobserved characteristics

#### ★ Definition Box: Natural logarithmic transformation (p. 92)

- Used to correct skewness in variables like income and population
- Specifically, variables with a few extremely large or small positive values
- The natural log is the log with base e
- e is a mathematical constant, approximately 2.7182
- Defined as y = logₑ x
- The inverse of the exponential function: x = eʸ

#### Concepts

- Probability sampling: every unit has a known, nonzero probability of selection
- SRS as one type of probability sampling; other probability designs have known but unequal probabilities
- With vs without replacement
- Sampling frame: definition; problems obtaining one
- "Representative": on average across repeated samples
- Parallel between random sampling and random treatment assignment
- Quota sampling: definition; why it fails (unobserved characteristics; interviewer selection); parallel to observational studies
- Random digit dialing and its selection problems
- Multistage cluster sampling: definition; why it is used (no frame; cost)
- Checking representativeness by comparing sampled vs non-sampled units
- Logarithm in general: y = log_b x ⇔ x = bʸ; base-10 values by counting zeros; logs of numbers below 1
- Log is defined only for positive numbers

#### Code Blocks

- p. 92–93 — `log()` (default base e; `base =` argument), `exp()` → predict simple values
- p. 93 — `boxplot(altitude ~ sampled, data = , names = c(…))`; `boxplot(log(population) ~ sampled, …)` — comparing sampled vs non-sampled units → interpret representativeness; explain the log

### 3.4.2 Nonresponse and Other Sources of Bias

#### ★ Definition Box: Unit and item nonresponse (p. 94)

- Two types of nonresponse in survey research
- Unit nonresponse: a potential respondent refuses to participate in the survey
- Item nonresponse: a respondent who agreed to participate refuses to answer a particular question
- Both can bias inferences
- The condition for bias: those who respond systematically differ from those who do not

#### Concepts

- Misreporting; social desirability bias: definition; examples of sensitive topics
- Institutional Review Board: role
- List experiment (item count technique): design (random split; control list; treatment list adds the sensitive item); estimator (difference in mean counts); how it protects anonymity
- Floor and ceiling effects: definitions; which answers reveal a respondent's true answer
- Randomized response technique: design; why individual answers stay secret; how aggregates are recovered from known probabilities

#### Code Blocks

- p. 94 — `tapply(is.na(x), group, mean)` — item nonresponse rate by group → interpret whether nonresponse is systematic
- p. 95 — `mean(response[group == "treat"]) - mean(response[group == "control"])` — list-experiment estimate → interpret as a proportion
- p. 96 — `table(response = , group = )` — distribution of counts by list group → spot floor/ceiling effects from empty cells

## 3.5 Measuring Political Polarization

### Concepts

- Measurement model: definition and purpose
- Latent (unobserved) concepts, e.g., ideology
- Using observed behavior (roll-call votes) to infer a latent trait
- Spatial voting model: ideal point, status quo, proposal; voting rule (vote for the closer option)
- Multiple ideological dimensions
- Why unanimous votes carry no information about ideology
- Item response theory: the educational-testing analog (ability ↔ ideal point; question difficulty)

## 3.6 Summarizing Bivariate Relationships

### 3.6.1 Scatter Plot

#### ★ Definition Box: Scatter plot (p. 101)

- Graphically compares two variables measured on the same set of units
- Plots the value of one variable against the other for each unit

#### Concepts

- Horizontal vs vertical axis variable
- Grouping by color and symbol
- Time-series plot of a group summary
- Polarization as divergence of group centers over time

#### Code Blocks

- p. 98 — `subset()` by group, and by group and period; `df[df$var == "x", ]` → state what each object contains
- p. 98 — storing labels and limits as objects (`xlab <-`, `lim <- c(-1.5, 1.5)`) for reuse
- p. 99 — `plot(x, y, pch = , col = , xlim = , ylim = , xlab = , ylab = , main = )`, `points()`, `text()` — layered scatter plot → name each argument's role; interpret
- p. 100 — `tapply(x, period, median)` — group medians over time
- p. 100 — `plot(names(v), v, type = "l", …)`, `lines()`, `text(…, "A\n B")` → explain `type = "l"`, `names()` as the x-axis, `\n`

### 3.6.2 Correlation

#### ★ Definition Box: Gini coefficient (p. 102)

- Measures the degree of income equality and inequality in a society
- Ranges from 0 (everyone has the same wealth)
- To 1 (one person holds all the wealth)

#### ★ Definition Box: z-score (p. 104)

- Measures the number of standard deviations an observation is above or below the mean
- The formula (xᵢ − x̄) / Sₓ
- x̄ and Sₓ: the mean and standard deviation of x
- Not sensitive to how the variable is scaled and/or shifted

#### ★ Definition Box: Correlation (p. 105)

- Measures the degree to which two variables are associated
- The formula (average product of z-scores), with n
- The alternative formula with n − 1
- x̄, ȳ: means; Sₓ, Sᵧ: standard deviations
- Ranges from −1 to 1
- Not sensitive to how a variable is scaled and/or shifted

#### Concepts

- Lorenz curve (axes), line of equality, Gini = A / (A + B)
- Co-trending variables need not be causally related
- Interpreting a z-score value
- The algebra showing z-score invariance to ax + b; what happens if a < 0
- Intuition for the sign of a correlation (paired deviations above/below the means)
- Correlation is unit-free
- Aligning time units before correlating

#### Code Blocks

- p. 102 — `plot(seq(from = 1947.5, to = 2011.5, by = 2), rep.median - dem.median, …)`; `plot(year, gini, …)` — two time series → explain how the x-values are built
- p. 105 — `cor(gini[seq(from = 2, to = nrow(gini), by = 2)], rep.median - dem.median)` → explain the alignment; interpret the correlation

### 3.6.3 Quantile-Quantile Plot

#### ★ Definition Box: Quantile–quantile (Q-Q) plot (p. 107)

- A scatter plot of quantiles
- Plots the value of each quantile of one variable against the same quantile of another
- Identical distributions → all points on the 45-degree line
- Slope steeper than 45 degrees → the vertical-axis distribution is more dispersed
- Slope less than 45 degrees → the vertical-axis distribution is less dispersed

#### Concepts

- Comparing whole distributions, not just centers
- Side-by-side histograms need common axes
- Points above vs below the 45-degree line: which variable is larger at that quantile
- Q-Q plots can compare variables measured in different units

#### Code Blocks

- p. 105 — two `hist()` calls with identical `xlim`/`ylim` → explain why the axes must match
- p. 106 — `qqplot(x, y, xlab = , ylab = , xlim = , ylim = )`, `abline(0, 1)` → read points above/below the line; read the slope

## 3.7 Clustering

### 3.7.1 Matrix in R

#### Concepts

- Matrix vs data frame: single data type vs mixed; `[ , ]` vs `$`
- Coercing a data frame to a matrix unifies types (e.g., everything becomes character)

#### Code Blocks

- p. 108 — `matrix(1:12, nrow = 3, ncol = 4, byrow = TRUE)`, `rownames()`, `colnames()`, `dim()` → predict the matrix (byrow TRUE vs FALSE)
- p. 108–109 — `data.frame()` with a factor and a numeric; `class()`; `as.matrix()` → predict the coerced output
- p. 109 — `colSums()`, `rowMeans()` → predict outputs
- p. 109–110 — `apply(x, 1, …)` vs `apply(x, 2, …)`; `apply(x, 1, sd)` → say which margin is rows vs columns; predict output

### 3.7.2 List in R

#### Concepts

- List: elements of different types and lengths (even data frames)
- List vs data frame
- Model outputs are lists

#### Code Blocks

- p. 110–111 — `list(y1 = , y2 = , y3 = data.frame(…))`; extraction by `$`, `[[2]]`, `[["y3"]]`; `names()`, `length()` → predict each extraction

### 3.7.3 The k-Means Algorithm

#### ★ Definition Box: k-means algorithm (p. 111)

- It produces a prespecified number of clusters, k
- Step 1: choose initial centroids for the k clusters
- Step 2: assign each observation to the cluster with the closest centroid (Euclidean distance)
- Step 3: recompute each centroid as the within-cluster mean of each variable
- Step 4: repeat steps 2 and 3 until cluster assignments no longer change

#### Concepts

- Clustering goal; iterative algorithm; convergence
- Centroid = within-cluster mean
- Researcher chooses k and initial centroids (random by default); multiple random starts
- Standardizing inputs first (centering and scaling) and why; when not to
- Unsupervised vs supervised learning; why unsupervised results are hard to evaluate; human judgment

#### Code Blocks

- p. 112 — `cbind(x[cond], y[cond])` → state the matrix's shape and meaning; contrast with `rbind()`
- p. 112 — `scale()` — standardizing (centering and scaling)
- p. 112 — `kmeans(X, centers = 2, nstart = 5)` → explain `centers`, `nstart`, and `iter.max` (default 10)
- p. 112–113 — `names(out)`: `cluster`, `centers`, `totss`, `withinss`, `tot.withinss`, `betweenss`, `size`, `iter` → say what each element holds; read `out$centers`
- p. 113 — `table(group = , cluster = out$cluster)` → interpret how clusters line up with groups
- p. 114 — `plot(X, col = out$cluster + 1, …)`, `points(out$centers, pch = 8, cex = 2)` → explain `+ 1`, `pch`, `cex`
- p. 115 — `palette()` — integer-to-color mapping

## 3.8 Summary (synthesis targets)

- Randomization in sampling vs randomization of treatment
- Practical survey problems: sampling frames, complex designs, unit/item nonresponse, social desirability bias, non-probability internet samples
- Latent concepts and measurement models
- Matching a plot to its purpose: bar plot, histogram, box plot, scatter plot, Q-Q plot
- Correlation (numeric) vs scatter plot (visual)

---

# Chapter 4: Prediction

## Chapter framing

- Prediction as a goal of data analysis
- Causal inference as predicting counterfactual outcomes

## 4.1 Predicting Election Outcomes

Case (context only): forecasting state-level presidential results from polls.

### Concepts

- Electoral College logic: why forecasting requires predicting each unit's winner (winner-take-all aggregation)

### 4.1.1 Loops in R

#### Concepts

- Loop structure: counter, vector iterated over, body in `{ }`
- Pre-allocating a container (`rep(NA, n)`)
- Loops don't auto-print
- Prefer vectorized operations over loops when possible
- Debugging loops: run the body for a fixed `i`; print the iteration

#### Code Blocks

- p. 125 — `rep(NA, n)`; `for (i in 1:n) { results[i] <- …; cat(…, "\n") }` → trace iterations; predict printed lines and `results`
- p. 126 — the same loop body run once with `i <- 1` — debugging strategy
- p. 126 — a loop over data-frame columns calling `median()`, with `cat("iteration", i)`; error at iteration 2 → explain the error and why `results` is `1 NA NA`

### 4.1.2 General Conditional Statements in R

#### Concepts

- `ifelse()` (vectorized) vs `if () {}` (control flow)
- `if`; `if … else`; `else if` chains; order of conditions matters
- `%%` (remainder); even/odd test
- Indentation for nested structures

#### Code Blocks

- p. 127 — `if (operation == "add") { … }` and `if (operation == "multiply") { … }` → predict which block runs
- p. 128 — `if … else` → predict output
- p. 129 — `if … else if … else` with `cat(…, sep = "")` → predict output; explain `sep`
- p. 130 — a loop over `1:5` with `x %% 2` inside `if/else` → trace; predict `results`

### 4.1.3 Poll Predictions

#### ★ Definition Box: Prediction error, bias, RMSE (p. 133)

- Prediction error = actual outcome − predicted outcome
- Bias: the average prediction error
- A prediction is unbiased when its bias is zero
- Root-mean-squared error: the root mean square of prediction error
- RMSE represents the average magnitude of prediction error

#### ★ Definition Box: Classification and misclassification (p. 136)

- Classification: predicting a categorical outcome
- Classification is either correct or incorrect
- A binary classification problem has two types of misclassification
- False positive: an incorrectly predicted positive outcome
- False negative: an incorrectly predicted negative outcome

#### Concepts

- Margin variable as a predicted/actual quantity
- Using the most recent data point(s) per unit as the prediction
- Near-zero bias with large RMSE (errors cancel)
- Reading predicted-vs-actual plots: 45-degree line; above vs below; wrong-winner quadrants
- Misclassification rate
- Confusion matrix: TP, FP, FN, TN layout
- Trade-off between false positives and false negatives
- Moving averages (smoothing over a window)

#### Code Blocks

- p. 131 — `read.csv()` ×2; `df$margin <- df$A - df$B` in both data frames
- p. 132 — `as.Date()`; subtracting dates → "Time difference of … days"
- p. 132 — `DaysToElection <- as.Date("2008-11-04") - df$middate`; `rep(NA, 51)`; `unique()`; `names(v) <- as.character(…)` — setup for a loop → explain each line
- p. 132 — loop: `subset(df, state == st.names[i])`, `subset(…, DaysToElection == min(DaysToElection))`, `mean(latest$margin)` → explain what each iteration stores
- p. 133 — `errors <- actual - pred`; `mean(errors)`; `sqrt(mean(errors^2))` — bias and RMSE → interpret both
- p. 134 — `hist(errors, freq = FALSE, …)`, `abline(v = mean(errors), lty = "dashed")`, `text()` → read the error distribution
- p. 135 — `plot(…, type = "n")`, `text(x, y, labels = df$state)`, `abline(a = 0, b = 1)`, `abline(v = 0)`, `abline(h = 0)` → read states above/below the line and in the wrong-winner quadrants
- p. 135–136 — `df$state[sign(pred) != sign(actual)]`; `actual[sign(pred) != sign(actual)]` — misclassified units → identify FP vs FN given which outcome is "positive"
- p. 137 — `sum(df$EV[df$margin > 0])` vs `sum(df$EV[pred > 0])` — aggregating predicted winners → interpret
- p. 137 — `Obama.pred <- McCain.pred <- rep(NA, 90)`; loop with `subset(df, (DaysToElection <= (90 - i + 7)) & (DaysToElection > (90 - i)))` — 7-day moving window → work out the window for a given i
- p. 138 — `plot(90:1, pred, type = "b", xlim = c(90, 0), …)`, `lines()`, `points(0, value, pch = 19)`, `abline(v = 0)` → explain the reversed axis and `type = "b"`

## 4.2 Linear Regression

### 4.2.1 Facial Appearance and Election Outcomes

Case (context only): snap competence ratings of candidate photos used to predict vote margins.

#### Concepts

- Two-party vote share: definition (only major-party votes in the denominator)

#### Code Blocks

- p. 140 — `d.share <- d / (d + r)`; `r.share <- …`; `diff.share <- d.share - r.share` → explain the constructed variables
- p. 141 — `plot(x, y, pch = 16, col = ifelse(df$w.party == "R", "red", "blue"), …)` — color by group → explain `ifelse` inside `col`

### 4.2.2 Correlation and Scatter Plots

#### ★ Definition Box: Correlation coefficient (p. 143)

- Quantifies the linear relationship between two variables
- An upward trend in the data cloud implies a positive correlation
- A downward trend implies a negative correlation
- Correlation is often not suitable for representing a nonlinear relationship

#### Concepts

- Matching correlation values to scatter-plot clouds (sign and strength)
- Perfect ±1 correlation
- Low correlation ≠ no relationship (nonlinear/quadratic pattern)

#### Code Blocks

- p. 141 — `cor(x, y)` → interpret size and sign

### 4.2.3 Least Squares

#### ★ Definition Box: Linear regression model (p. 144)

- The model Y = α + βX + ε
- Y: the outcome (response) variable
- X: the predictor, or independent (explanatory) variable
- ε: the error (disturbance) term
- (α, β): the coefficients
- The slope β: the increase in the average outcome associated with a one-unit increase in the predictor
- Once estimates (α̂, β̂) are obtained, predicting with X = x as Ŷ = α̂ + β̂x
- The fitted (predicted) value Ŷ
- The residual: ε̂ = Y − Ŷ

#### ★ Definition Box: Least squares (p. 147)

- A common method of estimating the linear regression coefficients
- Minimizes the sum of squared residuals
- The SSR formula
- The mean of the residuals is always zero
- The regression line always passes through the center of the data (X̄, Ȳ)
- X̄ and Ȳ: the sample means of X and Y

#### ★ Definition Box: Slope coefficient and correlation (p. 148)

- The estimated slope equals ρ standard-deviation units of increase in the outcome
- Associated with a one-standard-deviation increase in the predictor
- ρ: the correlation between the two variables

#### Concepts

- Intercept interpretation (average Y when X = 0)
- Parameters vs estimates; hat notation
- Residual vs error term
- "All models are wrong, but some are useful"
- Rescaling a slope interpretation (e.g., a 0.1-unit change in X)
- RMSE of a regression (equation 4.5): from SSR and n; interpretation
- Least-squares formulas for α̂ and β̂ (equations 4.6, 4.7)
- The algebra behind "passes through the means" and "mean residual is zero"
- A mean residual of zero holds for any data and does not validate the model
- Slope = correlation × (SD of Y / SD of X) (equation 4.8) and its implications (same sign as correlation; SD-unit interpretation)
- Deriving the least-squares formulas with calculus (see Calculus Fundamentals)

#### Code Blocks

- p. 144 — `fit <- lm(y ~ x, data = df)`; printing `fit` → read the Coefficients output ((Intercept) and slope); interpret both in context
- p. 144–145 — `lm(df$y ~ df$x)` without `data =` → explain when this is used and why it is discouraged
- p. 145 — `coef(fit)`, `head(fitted(fit))` → explain what each returns
- p. 145 — `plot(…)`, `abline(fit)`, `abline(v = 0, lty = "dashed")` — adding the fitted line → locate the intercept, fitted value, residual, and point of means on the plot
- p. 146 — `resid(fit)`; `sqrt(mean(epsilon.hat^2))` — regression RMSE → interpret

### 4.2.4 Regression towards the Mean

#### ★ Definition Box: Regression towards the mean (p. 149)

- An empirical phenomenon
- An observation whose predictor value is farther from the distribution's mean
- Tends to have an outcome value closer to that mean
- The tendency can be explained by chance alone

#### Concepts

- Galton's heights example: the logic, not the numbers
- Common misreading (convergence over time) and why it is wrong
- Other examples: repeated elections; midterm vs final exam scores
- It holds technically when both variables are standardized

### 4.2.5 Merging Data Sets in R

#### Concepts

- Merging on a key variable
- Pitfalls of column-binding (row order must match; duplicate columns)
- Standardizing variables before comparing across periods

#### Code Blocks

- p. 150 — `merge(x, y, by = "key")`; `head()` of both inputs → predict the merged columns, including `.x`/`.y` suffixes
- p. 151 — `names(y)[1] <- "state.abb"`; `merge(x, y, by.x = "state", by.y = "state.abb")` → explain `by.x`/`by.y` and which key name is kept
- p. 152–153 — `cbind(x, y)`, `pres1[8:9, ]` vs `pres[8:9, ]` → explain why `cbind` mismatches rows and `merge` doesn't
- p. 152 — `rbind()` — row-binding
- p. 154 — `scale(x)` — z-scores
- p. 154 — `lm(z2 ~ z1)` → explain why the intercept is ~0 (e.g., `-3.521e-17`); read scientific notation
- p. 154 — `lm(z2 ~ -1 + z1)` — regression without an intercept → compare the slopes
- p. 155 — `plot(…, xlim = c(-4, 4), …)`, `abline(fit1)`
- p. 155 — `mean((z2 > z1)[z1 <= quantile(z1, 0.25)])` and the top-quartile version → take the expression apart; interpret the two proportions as evidence for regression towards the mean

### 4.2.6 Model Fit

#### ★ Definition Box: Coefficient of determination, R² (p. 156)

- A measure of model fit
- The proportion of variation in the outcome explained by the predictor
- Defined as one minus SSR/TSS

#### Concepts

- Model fit: definition
- TSS: formula and meaning
- R² = (TSS − SSR)/TSS; range 0–1; relation to correlation at the endpoints
- Residual plot: residuals vs fitted values; what to look for
- Outliers; influential observations shifting the fitted line
- In-sample vs out-of-sample prediction; overfitting

#### Code Blocks

- p. 157 — `lm(y ~ x, data = df)`; `TSS <- sum((y - mean(y))^2)`; `SSR <- sum(resid(fit)^2)`; `(TSS - SSR) / TSS` → interpret R²
- p. 158 — `R2 <- function(fit) { … y <- fitted(fit) + resid; … }` → explain why fitted + residual recovers y; trace the function
- p. 158 — `summary(fit)$r.squared` — built-in R²
- p. 158 — `plot(fitted(fit), resid(fit), …)`, `abline(h = 0)` — residual plot → spot an outlier
- p. 159 — `df$county[resid(fit) == max(resid(fit))]` → explain how the outlier is identified
- p. 159–160 — `subset(df, county != "PalmBeach")`, refit, `R2()` → interpret the change in R²
- p. 160–161 — residual plot without the outlier; `abline(fit2, lty = "dashed")`, `abline(fit3)`, `text()` — comparing the two fitted lines → explain the influence of one point

## 4.3 Regression and Causation

### Concepts

- Causal inference requires predicting counterfactual outcomes
- Association found by regression ≠ causation

### 4.3.1 Randomized Experiments

Case (context only): randomized reservation of council seats for women; outcomes are public-goods investments.

#### ★ Definition Box: Regression on a binary treatment (p. 165)

- Applies to experimental data with a single binary treatment
- The estimated slope can be interpreted as an estimate of the average treatment effect
- The slope is numerically equivalent to the difference-in-means estimator
- The estimated intercept equals the estimated average outcome under the control condition
- Randomization of treatment assignment permits this causal interpretation

#### Concepts

- Why a naive comparison of treated and untreated units is confounded without randomization
- Compliance check (did the assigned treatment actually happen?)
- Intercept and slope formulas with a binary X (n0, n1): control mean; treated mean − control mean
- Linking regression to potential outcomes: Ŷ(1) − Ŷ(0) = β̂; Ŷ(0) = α̂

#### Code Blocks

- p. 163 — `mean(df$female[df$reserved == 1])` and `== 0` — compliance check → interpret
- p. 163 — `mean(y[t == 1]) - mean(y[t == 0])` for two outcomes — difference in means → interpret
- p. 164 — `lm(y ~ t, data = df)` → match the intercept to the control mean and the slope to the difference in means

### 4.3.2 Regression with Multiple Predictors

#### ★ Definition Box: Linear regression with multiple predictors (p. 170)

- The model Y = α + β₁X₁ + β₂X₂ + ⋯ + βₚXₚ + ε
- βⱼ: the increase in the average outcome associated with a one-unit increase in Xⱼ
- While holding the other variables constant
- Coefficients are estimated by minimizing the sum of squared residuals
- A degrees-of-freedom adjustment is often made when computing R²

#### Concepts

- Ceteris paribus interpretation
- SSR with multiple predictors
- Linearity assumption; least squares "fits best" even when linearity is wrong
- Factor predictors → automatic indicator (dummy) variables
- Base (reference) level: the first level alphabetically; its indicator is omitted when there is an intercept; why
- Coefficients relative to the base level; predicted group means = α̂ + β̂ⱼ
- Model without an intercept: coefficients equal group means
- ATE as a difference of coefficients (either parameterization)
- `fitted()` (estimation sample) vs `predict(newdata = )` (new data); new data must contain the predictor variables
- Degrees of freedom: n − p − 1
- Unadjusted R² never decreases when a predictor is added
- Adjusted R²: formula; why SSR is divided by n − p − 1 and TSS by n − 1
- Adjusted and unadjusted R² are close when n is large relative to p

#### Code Blocks

- p. 166 — `levels(df$messages)` → identify the base level
- p. 166 — `lm(y ~ messages, data = df)` → read the coefficient names (`messagesControl`, …); compute predicted group means from the output
- p. 166 — `df$Control <- ifelse(df$messages == "Control", 1, 0)` ×3; `lm(y ~ Control + Hawthorne + Neighbors)` → explain why it matches the factor version
- p. 167 — `data.frame(messages = unique(df$messages))`; `predict(fit, newdata = …)` → explain the output's order; match it to group means
- p. 167 — `tapply(y, messages, mean)` → compare with the predictions
- p. 168 — `lm(y ~ -1 + messages)` → read each coefficient as a group mean
- p. 168 — `coef(fit)["messagesNeighbors"] - coef(fit)["messagesControl"]` vs the difference in means → explain why they are equal
- p. 169 — `adjR2 <- function(fit) { … / (n - length(coef(fit))) … }`; `R2(fit)` → trace the function; compare adjusted and unadjusted R²
- p. 169 — `summary(fit)$adj.r.squared`

### 4.3.3 Heterogeneous Treatment Effects

#### ★ Definition Box: Interaction term (p. 172)

- Example model: Y = α + β₁X₁ + β₂X₂ + β₃X₁X₂ + ε
- The model assumes the effect of X₁ depends linearly on X₂
- As X₂ increases by one unit, the change in the average outcome from a one-unit increase in X₁ goes up by β₃

#### Concepts

- Heterogeneous treatment effects: definition; why they matter
- Subgroup approach vs interaction approach (they give the same answer here)
- Deriving subgroup effects: β₂ for one group, β₂ + β₃ for the other; β₃ = the difference
- General derivation: the effect of X₁ = β₁ + β₃x₂
- Always include main effects with an interaction
- Continuous moderator: effect at x = β₂ + β₃x; β₃ = change in the effect per unit of the moderator
- Stronger linearity assumption with continuous predictors
- Quadratic terms for nonlinear relationships
- Interpreting complex models through predictions rather than coefficients

#### Code Blocks

- p. 170 — `subset(df, prior == 1)`; difference in means within each subset; `ate.voter - ate.nonvoter` → interpret
- p. 172 — `lm(y ~ prior + messages + prior:messages, data = )` → read the four coefficients; derive each subgroup's effect
- p. 172–173 — `lm(y ~ prior * messages)` → explain `*` vs `:`
- p. 173 — `df$age <- 2008 - df$yearofbirth`; `summary(df$age)`
- p. 174 — `lm(y ~ age * messages)` → interpret the interaction coefficient
- p. 174 — `data.frame(age = seq(25, 85, by = 20), messages = "Neighbors")` and a `"Control"` version; `predict(…) - predict(…)` → explain why the difference is the ATE at each age
- p. 175 — `lm(y ~ age + I(age^2) + messages + age:messages + I(age^2):messages)` → explain `I()`; explain why the coefficients are hard to read directly
- p. 175 — `predict(fit, newdata = data.frame(age = 25:85, messages = …))` under both conditions
- p. 176 — `plot(25:85, yT.hat, type = "l")`, `lines(…, lty = "dashed")`; `plot(25:85, yT.hat - yC.hat, type = "l")` → read predicted outcomes and the ATE by age

### 4.3.4 Regression Discontinuity Design

Case (context only): candidates who barely won vs barely lost office; later wealth.

#### ★ Definition Box: Regression discontinuity design (p. 181)

- A research design for causal inference in observational studies with possible confounding
- Assumes the change in outcome at the point of discontinuity can be attributed to the change in treatment alone
- Often has strong internal validity
- May lack external validity
- Because results may not generalize to observations away from the discontinuity

#### Concepts

- Treatment determined by whether a variable crosses a threshold
- Key intuition: units just above vs just below the threshold are comparable
- Estimating the effect: separate regressions on each side; the difference in predictions at the threshold
- Log-transformed outcomes and back-transforming with `exp()`
- Placebo test: definition; logic (an outcome treatment cannot affect should show ~0 effect); what a large placebo effect would suggest
- RD's effect is local to the threshold
- RD needs weaker assumptions than other observational approaches

#### Code Blocks

- p. 178 — `subset()` by group; `lm(y ~ margin, data = df[df$margin < 0, ])` and `> 0` → explain the two regressions
- p. 178 — `c(min(df$margin), 0)`, `c(0, max(df$margin))`; `predict(fit, newdata = data.frame(margin = range))` → explain what the two predicted values are
- p. 178–179 — `plot(…)`, `abline(v = 0, lty = "dashed")`, `lines(range, pred)` → read the jump at the threshold
- p. 179–180 — `exp(y2[1])`, `exp(y1[2])`, and their difference → explain the indexing [1] vs [2] and the back-transformation; interpret the effect
- p. 180 — `lm(margin.pre ~ margin, …)` on each side; `coef(fit4)[1] - coef(fit3)[1]` — placebo test → explain why the intercepts are compared; interpret

## 4.4 Summary (synthesis targets)

- Prediction accuracy: bias vs RMSE
- Classification errors and the false positive / false negative trade-off
- Regression, correlation, and regression towards the mean
- Model fit: R², residual plots, overfitting
- When regression estimates are causal: randomized treatment, interactions for heterogeneous effects, RD

---

# Calculus Fundamentals

Course addition, not from QSS.

## Derivative Basics

- Derivative: definition as instantaneous rate of change / slope of the tangent line
- Notation: prime notation, dy/dx, d/dx operator
- Derivative of a constant
- Constant multiple rule
- Sum and difference rule

## Power Rule

- Statement of the power rule
- Applying it to positive integer exponents
- Special cases: exponent of 1, exponent of 0
- Negative exponents (rewriting 1/xⁿ as a power)
- Fractional exponents (rewriting roots as powers)
- Differentiating polynomials term by term (power rule with the constant multiple and sum rules)

## Product Rule

- Statement of the product rule
- Identifying the two factors in a product
- When expanding the product first is easier than using the rule
- Checking a product-rule result against the expanded version

## Quotient Rule

- Statement of the quotient rule
- Order of terms in the numerator and why it matters (sign)
- The squared denominator
- Alternative: rewriting a quotient as a product with a negative exponent and using the product and chain rules
- Values where the function and its derivative are undefined

## Chain Rule

- Statement of the chain rule
- Identifying the inner and outer functions of a composition
- Evaluating the outer derivative at the inner function
- Compositions with more than two layers
- Powers of a function (generalized power rule), e.g., a squared term like (a − bx)²
- Combining the chain rule with the product and quotient rules

## Partial Derivatives

- Functions of several variables
- Partial derivative: definition (differentiate in one variable, holding the others constant)
- Partial derivative notation (∂)
- Treating the other variables as constants while differentiating
- Applying the power, product, quotient, and chain rules inside partial derivatives
- Taking the partial derivative with respect to each variable of a multivariable function
- Link to the ceteris paribus interpretation of multiple-regression coefficients (4.3.2)

## Optimization

- Critical point: definition
- First-order condition: setting the first derivative equal to zero and solving
- Second derivative test: identifying a minimum vs a maximum vs an inconclusive case
- Local vs global optimum
- Multivariable optimization: setting every partial derivative equal to zero at once
- Solving the resulting system of equations (two equations, two unknowns; substitution)
- Why a sum of squares has a minimum rather than a maximum
- Interpreting the optimizing value in context
- Minimizing Σ(Xᵢ − c)² over c: which familiar statistic it produces

## Summation Algebra for Optimization

- Differentiating a sum term by term (the derivative of a sum is the sum of the derivatives)
- Pulling constants out of a sum
- Sum of a constant over n terms
- Rewriting ΣXᵢ in terms of the sample mean
- Expanding and simplifying sums of squared terms

## Derivatives from a Linear Model

- Derivative of Y = α + βX with respect to X; interpretation as the slope (marginal effect)
- Why the marginal effect of X is constant in a simple linear model
- Multiple regression: partial derivative of Y with respect to each Xⱼ; ceteris paribus interpretation
- Interaction model Y = α + β₁X₁ + β₂X₂ + β₃X₁X₂: partial derivative with respect to X₁ and how it depends on X₂ (link to 4.3.3)
- Interaction model: partial derivative with respect to X₂ and how it depends on X₁
- Quadratic model (e.g., age and age²): derivative with respect to the variable; how the marginal effect changes with its value (link to 4.3.3)
- Quadratic model: finding the turning point (where the marginal effect is zero) and whether it is a peak or a trough
- Quadratic model with interactions (4.3.3 turnout model): the treatment effect as a function of the moderator
- Least squares as optimization: writing SSR as a function of the intercept and slope estimates
- Partial derivative of SSR with respect to the intercept (chain rule on each squared residual)
- Partial derivative of SSR with respect to the slope
- Setting both partials to zero (first-order conditions / normal equations)
- Solving the first-order conditions to recover the least-squares intercept and slope formulas (4.2.3)
- What the intercept first-order condition implies about the residuals (their sum/mean; link to 4.2.3)
- What the slope first-order condition implies about the residuals and the predictor
- Why the fitted line passes through the point of means (from the first-order conditions)

---

# Cross-Chapter Synthesis

## Research designs

- For each design — RCT, natural experiment, cross-section comparison, subclassification, before-and-after, DiD, regression on a randomized treatment, RD — be able to state:
  - the comparison it makes
  - its key identifying assumption
  - what confounding it removes and what it cannot
  - its estimand (SATE, SATT, local effect at a threshold)
  - its internal vs external validity profile
- Classifying a new study description into the right design
- Recurring diagnostics: balance checks, placebo tests, manipulation/compliance checks

## Randomization in two roles

- Random treatment assignment (Ch. 2) vs random sample selection (Ch. 3): what each guarantees and for which comparison
- Internal validity (from random assignment) vs external validity (from random sampling)

## Forms of selection bias

- Self-selection into treatment (confounding)
- Sample selection bias (nonrepresentative or convenience samples)
- Nonresponse bias (unit and item)
- Quota sampling and interviewer selection

## Measurement

- Latent concepts and measurement models
- Sensitive questions: social desirability bias, list experiments, randomized response
- Composition effects: crude vs group-specific summaries

## Statistics that recur

- Mean vs median; robustness to outliers
- The RMS family: RMS, standard deviation, RMSE — the same operation on different inputs
- Standardization (z-scores) in correlation, k-means, regression towards the mean
- Proportion = mean of a binary/logical variable
- Percent vs percentage points
- Difference in means = regression slope on a binary treatment
- Correlation ↔ regression slope ↔ R² relationships
- Log transformation of skewed positive variables; back-transformation
- Association vs causation

## Prediction vs causation

- Predicting observed outcomes vs predicting counterfactual outcomes
- Bias vs RMSE as two dimensions of prediction quality
- In-sample fit vs out-of-sample accuracy; overfitting
- Supervised vs unsupervised learning

## Recurring R patterns

- Group comparison: logical indexing `y[g == "a"]` vs `subset()` vs `tapply()`
- Rates and proportions: `mean()` of a 0/1 or logical vector; `table()` / `prop.table()`
- Missing data: `is.na()`, `na.rm = TRUE`, `exclude = NULL`, `na.omit()`
- Creating variables: `df$new <- …`, `ifelse()`, NA-fill then conditional assignment, `as.factor()`
- Loops: pre-allocate, index with `[i]`, subset inside, store
- Models: `lm()` formula syntax (`~`, `+`, `:`, `*`, `-1`, `I()`); `coef()`, `fitted()`, `resid()`, `predict(newdata = )`, `summary()$r.squared`
- Plot building: base plot, then `abline()`, `lines()`, `points()`, `text()` layers
- Reading printed output: `##`, `[1]`, named vectors, `Levels:`, table layouts, `lm` Coefficients, scientific notation

---

# Definition Box Index

All ★ boxes, in book order (printed page). Chapter 1 has none.

- p. 33 — Experimental research (2.1)
- p. 48 — Causal effect (2.3)
- p. 48 — Fundamental problem of causal inference (2.3)
- p. 49 — Sample average treatment effect, SATE (2.4.1)
- p. 50 — Randomized controlled trial, RCT (2.4.1)
- p. 50 — Internal and external validity (2.4.1)
- p. 52 — Hawthorne effect (2.4.2)
- p. 58 — Confounder and confounding bias (2.5.2)
- p. 60 — Statistical control and subclassification (2.5.2)
- p. 61 — Before-and-after design (2.5.3)
- p. 62 — Difference-in-differences (2.5.3)
- p. 64 — Median (2.6.1)
- p. 66 — Quantiles and interquartile range (2.6.1)
- p. 68 — Standard deviation and variance (2.6.2)
- p. 83 — Histogram and density (3.3.2)
- p. 87 — Box plot (3.3.3)
- p. 90 — Simple random sampling, probability sampling, sample selection bias (3.4.1)
- p. 92 — Natural logarithmic transformation (3.4.1)
- p. 94 — Unit and item nonresponse (3.4.2)
- p. 101 — Scatter plot (3.6.1)
- p. 102 — Gini coefficient (3.6.2)
- p. 104 — z-score (3.6.2)
- p. 105 — Correlation (3.6.2)
- p. 107 — Quantile–quantile plot (3.6.3)
- p. 111 — k-means algorithm (3.7.3)
- p. 133 — Prediction error, bias, RMSE (4.1.3)
- p. 136 — Classification and misclassification (4.1.3)
- p. 143 — Correlation coefficient (4.2.2)
- p. 144 — Linear regression model (4.2.3)
- p. 147 — Least squares (4.2.3)
- p. 148 — Slope coefficient and correlation (4.2.3)
- p. 149 — Regression towards the mean (4.2.4)
- p. 156 — Coefficient of determination (4.2.6)
- p. 165 — Regression on a binary treatment (4.3.1)
- p. 170 — Linear regression with multiple predictors (4.3.2)
- p. 172 — Interaction term (4.3.3)
- p. 181 — Regression discontinuity design (4.3.4)

---

# Formula Roster (names only)

- Individual causal effect (2.3)
- Observed outcome in terms of potential outcomes (2.3)
- SATE (2.4.1)
- Difference-in-means estimator (2.4.1)
- SATT (2.5.3)
- DiD estimate (2.5.3)
- Median, odd and even n (2.6.1)
- IQR (2.6.1)
- RMS (2.6.2)
- Standard deviation, n and n − 1 versions (2.6.2)
- Variance (2.6.2)
- Participation rate (3.1)
- Histogram density (3.3.2)
- Logarithm / natural logarithm definitions (3.4.1)
- List experiment estimator (3.4.2)
- Gini coefficient (3.6.2)
- z-score (3.6.2)
- Correlation (3.6.2)
- Prediction error (4.1.3)
- Bias (4.1.3)
- RMSE (4.1.3, 4.2.3)
- Misclassification rate (4.1.3)
- Two-party vote share (4.2.1)
- Linear regression model (4.2.3)
- Fitted value (4.2.3)
- Residual (4.2.3)
- SSR (4.2.3)
- Least-squares intercept (4.2.3)
- Least-squares slope (4.2.3)
- Slope = correlation × SD ratio (4.2.3)
- TSS (4.2.6)
- R² (4.2.6)
- Intercept and slope with a binary predictor (4.3.1)
- Multiple regression model (4.3.2)
- Degrees of freedom (4.3.2)
- Adjusted R² (4.3.2)
- Interaction model and conditional effect of X1 (4.3.3)
- RD effect as the difference in predictions at the threshold (4.3.4)
- Power rule (Calculus)
- Product rule (Calculus)
- Quotient rule (Calculus)
- Chain rule (Calculus)
- Partial derivative (Calculus)
- First-order condition (Calculus)
- Second derivative test (Calculus)
- Marginal effect in a linear, interaction, and quadratic model (Calculus)
- Turning point of a quadratic (Calculus)
- Partial derivatives of SSR / normal equations (Calculus)

---

# Case & Data Roster (context only)

Lets the quiz generator attach a case's context to its code blocks. None of this is a memorization target.

| Case | Sections | Pages | Data file |
|---|---|---|---|
| UN world population | 1.3 | 14–23 | UNpop.csv |
| Résumé field experiment | 2.1–2.3 | 32–48 | resume.csv |
| Social pressure GOTV experiment | 2.4.2, 4.3.2–4.3.3 | 51–54, 165–176 | social.csv |
| Minimum-wage study | 2.5–2.6 | 54–68 | minwage.csv |
| Afghanistan survey | 3.1–3.4 | 75–96 | afghan.csv, afghan-village.csv |
| Congressional ideal points & inequality | 3.5–3.7 | 96–115 | congress.csv, USGini.csv |
| 2008 presidential polls | 4.1 | 123–138 | pres08.csv, polls08.csv, pollsUS08.csv |
| Facial competence experiment | 4.2.1–4.2.3 | 139–148 | face.csv |
| 2008 vs 2012 vote shares | 4.2.4–4.2.5 | 148–156 | pres08.csv, pres12.csv |
| Florida 1996/2000 counties | 4.2.6 | 156–161 | florida.csv |
| Women as policy makers | 4.3.1 | 162–165 | women.csv |
| MPs' wealth (RD) | 4.3.4 | 176–181 | MPs.csv |
