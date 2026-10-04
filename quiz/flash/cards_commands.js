// Command cards: the book's code on the book's data. The front shows the code and its real output (built by build_flash.mjs).
// Hidden `setup` loads the data the way the book does (stringsAsFactors = TRUE reproduces the book's pre-R-4.0 factors).
const r = String.raw;

const UNPOP = r`UNpop <- read.csv("INTRO/UNpop.csv", stringsAsFactors = TRUE)
world.pop <- c(2525779, 3026003, 3691173, 4449049, 5320817, 6127700, 6916183)`;
const RESUME = r`resume <- read.csv("CAUSALITY/resume.csv", stringsAsFactors = TRUE)
race.call.tab <- table(race = resume$race, call = resume$call)`;
const SOCIAL2 = r`social <- read.csv("CAUSALITY/social.csv", stringsAsFactors = TRUE)`;
const MINWAGE = r`minwage <- read.csv("CAUSALITY/minwage.csv", stringsAsFactors = TRUE)
minwageNJ <- subset(minwage, subset = (location != "PA"))
minwagePA <- subset(minwage, subset = (location == "PA"))
minwageNJ$fullPropBefore <- minwageNJ$fullBefore / (minwageNJ$fullBefore + minwageNJ$partBefore)
minwageNJ$fullPropAfter <- minwageNJ$fullAfter / (minwageNJ$fullAfter + minwageNJ$partAfter)`;
const AFGHAN = r`afghan <- read.csv("MEASUREMENT/afghan.csv", stringsAsFactors = TRUE)`;
const CONGRESS = r`congress <- read.csv("MEASUREMENT/congress.csv", stringsAsFactors = TRUE)
dwnom80 <- cbind(congress$dwnom1[congress$congress == 80], congress$dwnom2[congress$congress == 80])
dwnom112 <- cbind(congress$dwnom1[congress$congress == 112], congress$dwnom2[congress$congress == 112])`;
const FACE = r`face <- read.csv("PREDICTION/face.csv", stringsAsFactors = TRUE)
face$d.share <- face$d.votes / (face$d.votes + face$r.votes)
face$r.share <- face$r.votes / (face$d.votes + face$r.votes)
face$diff.share <- face$d.share - face$r.share
fit <- lm(diff.share ~ d.comp, data = face)`;
const SOCIAL4 = r`social <- read.csv("PREDICTION/social.csv", stringsAsFactors = TRUE)`;
const NEIGHBOR = r`social <- read.csv("PREDICTION/social.csv", stringsAsFactors = TRUE)
social.neighbor <- subset(social, (messages == "Control") | (messages == "Neighbors"))
social.neighbor$age <- 2008 - social.neighbor$yearofbirth`;
const PRES = r`pres08 <- read.csv("DISCOVERY/pres08.csv", stringsAsFactors = TRUE)
pres12 <- read.csv("DISCOVERY/pres12.csv", stringsAsFactors = TRUE)
pres08$margin <- pres08$Obama - pres08$McCain`;
const POLLS = r`pres08 <- read.csv("DISCOVERY/pres08.csv", stringsAsFactors = TRUE)
polls08 <- read.csv("UNCERTAINTY/polls08.csv", stringsAsFactors = TRUE)
polls08$margin <- polls08$Obama - polls08$McCain
pres08$margin <- pres08$Obama - pres08$McCain
polls08$middate <- as.Date(polls08$middate)
polls08$DaysToElection <- as.Date("2008-11-04") - polls08$middate
poll.pred <- rep(NA, 51)
st.names <- unique(polls08$state)
names(poll.pred) <- as.character(st.names)
for (i in 1:51) {
  state.data <- subset(polls08, subset = (state == st.names[i]))
  latest <- subset(state.data, DaysToElection == min(DaysToElection))
  poll.pred[i] <- mean(latest$margin)
}`;
const WOMEN = r`women <- read.csv("PREDICTION/women.csv", stringsAsFactors = TRUE)
fit.women <- lm(water ~ reserved, data = women)`;
const MINWAGE7 = r`minwage <- read.csv("CAUSALITY/minwage.csv", stringsAsFactors = TRUE)
minwage$fullPropBefore <- minwage$fullBefore / (minwage$fullBefore + minwage$partBefore)
minwage$fullPropAfter <- minwage$fullAfter / (minwage$fullAfter + minwage$partAfter)
minwage$NJ <- ifelse(minwage$location == "PA", 0, 1)
fit.minwage <- lm(fullPropAfter ~ -1 + NJ + fullPropBefore + wageBefore + chain, data = minwage)
fit.minwage1 <- lm(fullPropAfter ~ NJ + fullPropBefore + wageBefore + chain, data = minwage)`;

const C = (id, topics, sec, page, front, setup, code, back, extra = {}) => ({ id, dict: "command", topics, sec, page, front, setup, code, back, ...extra });

export default [
  // ---------- R basics (1.3) ----------
  C("cmd-c", ["rbasics"], "1.3.3", 14, r`What does <code>c()</code> do here?`, "",
    r`world.pop <- c(2525779, 3026003, 3691173, 4449049, 5320817, 6127700, 6916183)
world.pop
pop.first <- c(2525779, 3026003, 3691173)
pop.second <- c(4449049, 5320817, 6127700, 6916183)
c(pop.first, pop.second)`,
    r`<p><b><code>c()</code></b> ("concatenate") builds a vector: values in a fixed order, separated by commas. It also joins existing vectors end to end, so <code>c(pop.first, pop.second)</code> rebuilds the full 7-element vector. <code>[1]</code> in the output marks the position of the first value printed on that line.</p>`),
  C("cmd-seq", ["rbasics"], "1.3.4", 18, r`Read each sequence. Why do the first two match?`, "",
    r`seq(from = 1950, to = 2010, by = 10)
seq(to = 2010, by = 10, from = 1950)
seq(from = 2010, to = 1950, by = -10)
2008:2012
2012:2008`,
    r`<p><b><code>seq(from, to, by)</code></b> makes a regular sequence. Named arguments can come in any order, so the first two lines are identical; a negative <code>by</code> counts down. The colon <b><code>a:b</code></b> counts by 1 in either direction. Without names, arguments match by position (from, to, by).</p>`),
  C("cmd-rep", ["rbasics"], "3.3.2 / 4.1.1", 84, r`What does <code>rep()</code> build in each line, and why would you want an all-<code>NA</code> vector?`, AFGHAN,
    r`rep(median(afghan$educ.years), 2)
poll.pred <- rep(NA, 5)
poll.pred`,
    r`<p><b><code>rep(x, times)</code></b> repeats a value. The book uses <code>rep(median(...), 2)</code> to get two identical x-coordinates for a vertical line drawn with <code>lines()</code> (p. 84), and <code>rep(NA, n)</code> to create an empty "container" that a loop fills one element at a time (p. 125).</p>`),
  C("cmd-length-names", ["rbasics"], "1.3.4", 17, r`What do <code>length()</code> and <code>names()</code> return here, and how does assigning names change the printout?`, UNPOP,
    r`length(world.pop)
names(world.pop)
names(world.pop) <- seq(from = 1950, to = 2010, by = 10)
world.pop`,
    r`<p><code>length()</code> counts elements (7). <code>names()</code> is <code>NULL</code> until labels are assigned. Afterwards each value prints under its label (the year). Names are an attribute for readability; they are not part of the data values.</p>`),
  C("cmd-index", ["rbasics"], "1.3.3", 15, r`Predict each result of indexing.`, UNPOP,
    r`world.pop[2]
world.pop[c(2, 4)]
world.pop[c(4, 2)]
world.pop[-3]`,
    r`<p>Square brackets pick elements by position. A vector of positions returns them <i>in the order asked</i> (<code>c(4, 2)</code> reverses). A negative index drops that element. Indexing never changes the original vector.</p>`),
  C("cmd-head", ["rbasics"], "2.1", 34, r`What does <code>head()</code> show?`, RESUME, r`head(resume)`,
    r`<p><b><code>head()</code></b> prints the first six rows of a data frame (or first six elements of a vector; set <code>n =</code> for more). Each row is one observation (a fictitious applicant); each column a variable. Row 2: Kristen, a white female, no callback.</p>`),
  C("cmd-dim", ["rbasics"], "2.1 / 1.3.5", 33, r`What do these three numbers tell you about the data?`, RESUME,
    r`dim(resume)
nrow(resume)
ncol(resume)`,
    r`<p><b><code>dim()</code></b> returns rows then columns: 4,870 observations (résumés) and 4 variables. <code>nrow()</code> and <code>ncol()</code> return each number alone. <code>nrow()</code> is handy as a denominator, e.g. <code>sum(...) / nrow(resume)</code>.</p>`),
  C("cmd-summary", ["rbasics", "describe"], "2.1", 34, r`How do you read <code>summary()</code> for factor and numeric variables?`, RESUME, r`summary(resume)`,
    r`<p>For a <b>factor</b>, <code>summary()</code> counts observations per level (e.g. 2,435 black and 2,435 white names; Tamika appears 256 times). For a <b>numeric</b> variable it gives Min, 1st Qu., Median, Mean, 3rd Qu., Max (and an <code>NA's</code> count if any are missing). Because <code>call</code> is 0/1, its mean (0.08049) is the overall callback rate.</p>`),
  C("cmd-class", ["rbasics"], "1.3.2 / 2.2.1", 14, r`What class is each object, and why does it matter?`, "",
    r`result <- 5 - 3
Result <- "5"
class(result)
class(Result)
class(sqrt)
class(TRUE)`,
    r`<p><b><code>class()</code></b> reports how R stores an object, which determines what you can do with it: numbers are <code>"numeric"</code>, anything in quotes is <code>"character"</code> (so <code>Result / 3</code> fails: "non-numeric argument"), functions are <code>"function"</code>, and TRUE/FALSE are <code>"logical"</code>. Note <code>result</code> and <code>Result</code> are different objects: R is case sensitive.</p>`),
  C("cmd-dataframe-index", ["rbasics"], "1.3.5", 22, r`Each line extracts something from the data frame. What?`, UNPOP,
    r`UNpop$world.pop
UNpop[, "world.pop"]
UNpop[c(1, 2, 3), ]
UNpop[1:3, "year"]`,
    r`<p><b><code>$</code></b> extracts one variable as a vector. <b><code>[rows, columns]</code></b> indexes two dimensions: leaving rows blank means all rows, leaving columns blank means all columns. Columns can be named or numbered. The first two lines return the same vector; line 3 returns the first three rows (all columns); line 4 the first three years.</p>`),
  C("cmd-list", ["rbasics", "correlation"], "3.7.2", 110, r`How do <code>$</code>, <code>[[2]]</code>, and <code>[["y3"]]</code> extract list elements?`, "",
    r`x <- list(y1 = 1:10, y2 = c("hi", "hello", "hey"),
          y3 = data.frame(z1 = 1:3, z2 = c("good", "bad", "ugly")))
x$y1
x[[2]]
x[["y3"]]
length(x)`,
    r`<p>A <b>list</b> holds elements of different types and lengths (here a numeric vector, a character vector, and a data frame). Extract an element with <code>$name</code>, <code>[[position]]</code>, or <code>[["name"]]</code>. <code>length()</code> counts elements (3). Model outputs such as <code>lm()</code> and <code>kmeans()</code> results are lists.</p>`),
  C("cmd-subset", ["rbasics", "causal"], "2.2.3", 42, r`What does this <code>subset()</code> call keep?`, RESUME,
    r`resumeBf <- subset(resume, select = c("call", "firstname"),
                   subset = (race == "black" & sex == "female"))
head(resumeBf)
dim(resumeBf)`,
    r`<p><b><code>subset(data, subset = , select = )</code></b>: <code>subset</code> is a logical condition choosing <i>rows</i>; <code>select</code> names the <i>columns</i> to keep. Variable names are looked up inside the data frame, so no <code>resume$</code> is needed. Result: résumés with Black female names, only <code>call</code> and <code>firstname</code>, with original row numbers kept. The bracket equivalent is <code>resume[resume$race == "black" &amp; resume$sex == "female", c("call", "firstname")]</code>.</p>`),
  C("cmd-relational", ["rbasics"], "2.2.2", 39, r`What does each relational comparison return?`, "",
    r`4 > 3
"Hello" == "hello"
"Hello" != "hello"
x <- c(3, 2, 1, -2, -1)
x >= 2
x != 1`,
    r`<p>Relational operators <code>&gt; &gt;= &lt; &lt;= == !=</code> return TRUE/FALSE. <code>==</code> tests equality (a single <code>=</code> assigns arguments). String comparison is case sensitive. Applied to a vector, the comparison is made element by element, giving a logical vector the same length. (There is no <code>!&gt;</code>; "not greater than" is <code>&lt;=</code>.)</p>`),
  C("cmd-logical", ["rbasics"], "2.2.1–2.2.2", 40, r`What do <code>&amp;</code>, <code>|</code>, <code>mean()</code>, and <code>sum()</code> give here?`, "",
    r`x <- c(3, 2, 1, -2, -1)
(x > 0) & (x <= 2)
(x > 2) | (x <= -1)
x.int <- (x > 0) & (x <= 2)
mean(x.int)
sum(x.int)`,
    r`<p><code>&amp;</code> (AND) is TRUE only if both sides are TRUE; <code>|</code> (OR) is TRUE if at least one is. Both work element by element. TRUE counts as 1 and FALSE as 0, so <b><code>mean()</code> of a logical vector is the proportion TRUE</b> (0.4) and <b><code>sum()</code> is the count</b> (2). Put each comparison in parentheses when combining.</p>`),
  C("cmd-logical-index", ["rbasics", "causal"], "2.2.3", 40, r`What does this line compute, piece by piece?`, RESUME,
    r`mean(resume$call[resume$race == "black"])
(resume$race == "black")[1:5]`,
    r`<p><code>resume$race == "black"</code> is a logical vector (TRUE for Black-sounding names). Putting it inside <code>[ ]</code> keeps only the <code>call</code> values where it is TRUE, and <code>mean()</code> of those 0/1 values is the callback rate for Black names: 0.0645. The second line shows the logical vector for the first five résumés.</p>`),
  C("cmd-ifelse", ["rbasics", "causal"], "2.2.4", 43, r`What does <code>ifelse()</code> create, and how does the three-way table check it?`, RESUME,
    r`resume$BlackFemale <- ifelse(resume$race == "black" & resume$sex == "female", 1, 0)
table(race = resume$race, sex = resume$sex, BlackFemale = resume$BlackFemale)`,
    r`<p><b><code>ifelse(X, Y, Z)</code></b> works element by element: Y where X is TRUE, Z where it is FALSE. Here it builds a 0/1 indicator. The three-way table prints one layer per value of the third variable (<code>, , BlackFemale = 0</code> then <code>= 1</code>): BlackFemale is 1 only in the black/female cell, confirming the coding.</p>`),
  C("cmd-factor", ["rbasics"], "2.2.5", 44, r`How is the factor built, and in what order are its levels?`, RESUME,
    r`resume$type <- NA
resume$type[resume$race == "black" & resume$sex == "female"] <- "BlackFemale"
resume$type[resume$race == "black" & resume$sex == "male"] <- "BlackMale"
resume$type[resume$race == "white" & resume$sex == "female"] <- "WhiteFemale"
resume$type[resume$race == "white" & resume$sex == "male"] <- "WhiteMale"
class(resume$type)
resume$type <- as.factor(resume$type)
levels(resume$type)
table(resume$type)`,
    r`<p>Start with <code>NA</code>, then assign a label wherever each condition is TRUE. The result is <code>"character"</code>; <b><code>as.factor()</code></b> turns it into a categorical (factor) variable. <b><code>levels()</code></b> lists the categories, sorted alphabetically by default. <code>table()</code> counts observations per level.</p>`),
  C("cmd-table", ["rbasics", "causal"], "2.1", 35, r`What does this code produce, and how do you read it?`, RESUME,
    r`race.call.tab <- table(race = resume$race, call = resume$call)
race.call.tab`,
    r`<p><b><code>table()</code></b> counts observations in each combination of categories: a two-way <b>contingency table</b> (cross-tabulation). Rows are <code>race</code>, columns are <code>call</code> (0 = no callback, 1 = callback). Read a cell as a count: 157 résumés with Black-sounding names got a callback; 2,278 did not.</p>`),
  C("cmd-addmargins", ["rbasics", "causal"], "2.1", 35, r`What do the margins add?`, RESUME, r`addmargins(race.call.tab)`,
    r`<p><b><code>addmargins()</code></b> appends row and column totals (<code>Sum</code>) to a table. Row totals: 2,435 résumés of each race. Column totals: 4,478 without and 392 with a callback. Bottom-right: 4,870 in all.</p>`),
  C("cmd-table-rates", ["rbasics", "causal"], "2.1", 35, r`Which cells give each rate?`, RESUME,
    r`sum(race.call.tab[, 2]) / nrow(resume)
race.call.tab[1, 2] / sum(race.call.tab[1, ])
race.call.tab[2, 2] / sum(race.call.tab[2, ])`,
    r`<p><code>[, 2]</code> is the callback column, so line 1 is all callbacks ÷ all résumés = the overall rate (0.0805). <code>[1, 2] / sum([1, ])</code> is Black callbacks ÷ Black résumés (0.0645); row 2 is white (0.0965). The gap is 0.032, i.e. <b>3.2 percentage points</b>.</p>`),
  C("cmd-proptable", ["rbasics", "sampling"], "3.1", 77, r`How do you read the proportions, and get the marginal ones?`, AFGHAN,
    r`prop.table(table(ISAF = afghan$violent.exp.ISAF, Taliban = afghan$violent.exp.taliban))`,
    r`<p><b><code>prop.table()</code></b> converts a table of counts into proportions of the total, so all cells sum to 1. Each cell is a <b>joint</b> proportion (e.g. 0.196 were harmed by both). <b>Marginal</b> proportions are row or column sums: harmed by ISAF = 0.177 + 0.196 ≈ 37%; by the Taliban = 0.132 + 0.196 ≈ 33%.</p>`),
  C("cmd-tapply", ["rbasics", "causal"], "2.4.2", 53, r`What does <code>tapply()</code> compute here, and what does the second line add?`, SOCIAL2,
    r`tapply(social$primary2006, social$messages, mean)
tapply(social$primary2006, social$messages, mean) -
  mean(social$primary2006[social$messages == "Control"])`,
    r`<p><b><code>tapply(X, INDEX, FUN)</code></b> splits <code>X</code> by the groups in <code>INDEX</code> and applies <code>FUN</code> to each: here, 2006 turnout in each message group. Subtracting the Control group's turnout gives each message's estimated average effect: Neighbors +8.1 points, Hawthorne +2.6, Civic Duty +1.8; Control is 0 by construction.</p>`),
  C("cmd-mean-median", ["describe"], "2.6.1", 63, r`Why does one outlier move the mean but not the median?`, "",
    r`median(c(1, 3, 4, 10))
mean(c(1, 3, 4, 10))
median(c(1, 3, 4, 10, 82))
mean(c(1, 3, 4, 10, 82))`,
    r`<p>With four values the median averages the two middle ones: (3 + 4) / 2 = 3.5. Adding 82 makes the median the middle value, 4, but drags the mean from 4.5 to 20. The median uses only the order of the data, so it is <b>robust to outliers</b>; the mean uses every value's size.</p>`),
  C("cmd-sd-var", ["describe"], "2.6.2", 68, r`What do <code>sd()</code> and <code>var()</code> report, and which denominator do they use?`, MINWAGE,
    r`sd(minwageNJ$fullPropBefore)
sd(minwageNJ$fullPropAfter)
var(minwageNJ$fullPropBefore)`,
    r`<p><b><code>sd()</code></b> is the standard deviation: how far, on average, values lie from their mean (here, a NJ restaurant's full-time share is about 0.23 away from the mean). <b><code>var()</code></b> is the variance, the SD squared (0.053). Both use <b>n − 1</b> in the denominator.</p>`),
  C("cmd-quantile", ["describe"], "2.6.1", 65, r`Read the quartiles, IQRs, and deciles. What happened to wages?`, MINWAGE,
    r`summary(minwageNJ$wageAfter)
IQR(minwageNJ$wageBefore)
IQR(minwageNJ$wageAfter)
quantile(minwageNJ$wageAfter, probs = seq(from = 0, to = 1, by = 0.1))`,
    r`<p><code>summary()</code> shows the quartiles. <b><code>IQR()</code></b> = upper − lower quartile: 0.62 before, <b>0</b> after, because the middle half of NJ restaurants now pay exactly $5.05. <b><code>quantile(x, probs =)</code></b> gives any quantiles; <code>seq(0, 1, by = 0.1)</code> asks for deciles (labels 0%, 10%, …, 100%). Wages bunched at the new minimum.</p>`),
  C("cmd-isna", ["sampling"], "3.2", 78, r`How do these lines count missing data?`, AFGHAN,
    r`head(afghan$income, n = 10)
head(is.na(afghan$income), n = 10)
sum(is.na(afghan$income))
mean(is.na(afghan$income))`,
    r`<p>Missing values are <code>NA</code> (printed <code>&lt;NA&gt;</code> in a factor). <b><code>is.na()</code></b> returns TRUE where a value is missing; <code>sum()</code> counts them (154) and <code>mean()</code> gives the proportion missing (about 5.6%).</p>`),
  C("cmd-narm", ["sampling", "describe"], "3.2", 79, r`Why is the first result <code>NA</code>?`, "",
    r`x <- c(1, 2, 3, NA)
mean(x)
mean(x, na.rm = TRUE)`,
    r`<p>Many summary functions return <code>NA</code> if any value is missing. <b><code>na.rm = TRUE</code></b> removes missing values first, so the mean is (1 + 2 + 3) / 3 = 2. <code>median()</code>, <code>max()</code>, <code>min()</code>, <code>sd()</code> take the same argument, and inside <code>tapply(x, g, mean, na.rm = TRUE)</code> it is passed on to <code>mean()</code>.</p>`),
  C("cmd-naomit", ["sampling"], "3.2", 79, r`Why do these two counts differ?`, AFGHAN,
    r`nrow(na.omit(afghan))
length(na.omit(afghan$income))`,
    r`<p><b><code>na.omit()</code></b> on a data frame performs <b>listwise deletion</b>: it drops every row with a missing value in <i>any</i> variable (2,554 rows remain). On a single variable it drops only that variable's missing values (2,600 answered income). The difference is respondents who answered income but skipped some other question, whose answers listwise deletion throws away.</p>`),
  C("cmd-exclude", ["sampling"], "3.2", 79, r`What does <code>exclude = NULL</code> change, and how do you read nonresponse?`, AFGHAN,
    r`prop.table(table(ISAF = afghan$violent.exp.ISAF, Taliban = afghan$violent.exp.taliban,
                 exclude = NULL))`,
    r`<p>By default <code>table()</code> drops <code>NA</code>. <b><code>exclude = NULL</code></b> keeps missing values as their own <code>&lt;NA&gt;</code> row and column. Item nonresponse for the Taliban question is the sum of the <code>&lt;NA&gt;</code> column; for the ISAF question, the sum of the <code>&lt;NA&gt;</code> row (both under 2%).</p>`),
  C("cmd-log", ["sampling"], "3.4.1", 92, r`Predict each value.`, "",
    r`log(1000, base = 10)
log(0.01, base = 10)
log(exp(2))
exp(log(5))
log(1)`,
    r`<p><b><code>log()</code></b> is the natural log (base e) unless you set <code>base =</code>: log₁₀ 1000 = 3 and log₁₀ 0.01 = −2. <b><code>exp()</code></b> is the inverse of the natural log, so <code>log(exp(2))</code> = 2 and <code>exp(log(5))</code> = 5. log(1) = 0. Logs are defined only for positive numbers.</p>`),
  C("cmd-scale", ["correlation", "regression"], "4.2.5", 154, r`What does <code>scale()</code> do to a variable?`, PRES,
    r`pres <- merge(pres08, pres12, by = "state")
z <- scale(pres$Obama.x)
round(mean(z), 10)
sd(z)`,
    r`<p><b><code>scale()</code></b> standardizes: it subtracts the mean (centering) and divides by the SD (scaling), turning each value into a <b>z-score</b>. The result has mean 0 and SD 1. Used before k-means and to show regression towards the mean with standardized vote shares.</p>`),
  C("cmd-cor", ["correlation"], "4.2.2", 141, r`What does this number say about perceived competence and vote margins?`, FACE,
    r`cor(face$d.comp, face$diff.share)`,
    r`<p><b><code>cor(x, y)</code></b> is the correlation coefficient. 0.43 is a moderate positive <i>linear</i> association: candidates rated more competent tend to have larger vote margins. It doesn't depend on units and lies between −1 and 1. It is association, not causation.</p>`),
  C("cmd-lm", ["regression"], "4.2.3", 144, r`Interpret the printed coefficients.`, FACE,
    r`fit <- lm(diff.share ~ d.comp, data = face)
fit`,
    r`<p><b><code>lm(y ~ x, data = )</code></b> fits a linear regression by least squares; an intercept is added automatically. Intercept −0.312: predicted Democratic margin when the competence score is 0 (−31.2 points). Slope 0.660: each 0.1 increase in competence is associated with a 6.6-point higher margin on average.</p>`),
  C("cmd-coef-fitted", ["regression"], "4.2.3", 145, r`What does each function extract from the fitted model?`, FACE,
    r`coef(fit)
head(fitted(fit))
head(resid(fit))`,
    r`<p><b><code>coef()</code></b>: the estimated intercept and slope. <b><code>fitted()</code></b>: the predicted value \(\hat Y = \hat\alpha + \hat\beta X\) for each observation used in the fit. <b><code>resid()</code></b>: each residual \(Y - \hat Y\), the prediction error.</p>`),
  C("cmd-predict", ["regression", "regcausal"], "4.3.2", 167, r`What does <code>predict()</code> return here, and in what order?`, SOCIAL4,
    r`fit <- lm(primary2006 ~ messages, data = social)
unique.messages <- data.frame(messages = unique(social$messages))
unique.messages
predict(fit, newdata = unique.messages)`,
    r`<p><b><code>predict(fit, newdata = )</code></b> computes predictions for <i>new</i> rows (unlike <code>fitted()</code>, which covers the estimation sample). <code>newdata</code> must contain variables named exactly like the predictors. <code>unique()</code> lists values in order of first appearance, so the predictions follow that order. Each prediction equals that group's mean turnout. <i>(The book prints <code>primary2008</code>; the variable in its data file is <code>primary2006</code>, with the same numbers.)</i></p>`),
  C("cmd-rsq", ["regression"], "4.2.6", 158, r`What do these two numbers measure?`, r`florida <- read.csv("PREDICTION/florida.csv", stringsAsFactors = TRUE)`,
    r`fit2 <- lm(Buchanan00 ~ Perot96, data = florida)
summary(fit2)$r.squared
summary(fit2)$adj.r.squared`,
    r`<p><code>summary(fit)$r.squared</code> is R², the share of the variation in Buchanan's 2000 votes explained by Perot's 1996 votes (0.51). <code>$adj.r.squared</code> applies the degrees-of-freedom adjustment, which penalizes extra predictors. With one predictor and 67 counties they are close.</p>`),
  C("cmd-factor-base", ["regcausal"], "4.3.2", 166, r`Which group is the baseline, and how do you read each coefficient?`, SOCIAL4,
    r`levels(social$messages)
fit <- lm(primary2006 ~ messages, data = social)
fit`,
    r`<p>A factor predictor is turned into indicator (dummy) variables, leaving out the <b>base level</b>: the first level alphabetically, here <b>Civic Duty</b>. The intercept (0.315) is Civic Duty's mean turnout; each coefficient is a group's difference from Civic Duty. Control's predicted turnout: 0.315 − 0.018 = 0.297. <i>(The book prints <code>primary2008</code>; the variable in its data file is <code>primary2006</code>, with the same numbers.)</i></p>`),
  C("cmd-noint", ["regcausal"], "4.3.2", 168, r`What changes when the formula includes <code>-1</code>?`, SOCIAL4,
    r`lm(primary2006 ~ -1 + messages, data = social)`,
    r`<p><b><code>-1</code></b> removes the intercept, so every level gets its own indicator and each coefficient is that group's <b>mean</b> outcome. The fitted values are identical to the model with an intercept; only the parameterization changes. Neighbors' effect vs Control: 0.378 − 0.297 = 0.081. <i>(The book prints <code>primary2008</code>; the variable in its data file is <code>primary2006</code>, with the same numbers.)</i></p>`),
  C("cmd-interaction", ["regcausal"], "4.3.3", 172, r`How do you read these four coefficients?`, NEIGHBOR,
    r`lm(primary2006 ~ primary2004 * messages, data = social.neighbor)`,
    r`<p><b><code>*</code></b> includes both main effects and their interaction (<code>a*b</code> = <code>a + b + a:b</code>; <b><code>:</code></b> alone is just the interaction). Effect of Neighbors among 2004 non-voters = <code>messagesNeighbors</code> (0.069); among 2004 voters = 0.069 + 0.027 = 0.097. The interaction coefficient (0.027) is the difference between those effects. <i>(The book prints <code>primary2008</code>; the variable in its data file is <code>primary2006</code>, with the same numbers.)</i></p>`),
  C("cmd-iwrap", ["regcausal"], "4.3.3", 175, r`Why does the formula need <code>I()</code>?`, NEIGHBOR,
    r`fit.age2 <- lm(primary2006 ~ age + I(age^2) + messages + age:messages + I(age^2):messages,
               data = social.neighbor)
names(coef(fit.age2))`,
    r`<p>Inside a formula, <code>^</code> and <code>*</code> have special meanings, so arithmetic must be wrapped in <b><code>I()</code></b>: <code>I(age^2)</code> adds age squared as a predictor (to model turnout rising then falling with age). With quadratic and interaction terms the coefficients are hard to read directly, so the book interprets the model through <code>predict()</code>. <i>(The book prints <code>primary2008</code>; the variable in its data file is <code>primary2006</code>, with the same numbers.)</i></p>`),
  C("cmd-merge", ["regression"], "4.2.5", 150, r`How do <code>merge()</code> and <code>cbind()</code> differ? Look at rows 8–9.`, PRES,
    r`pres <- merge(pres08, pres12, by = "state")
pres[8:9, c("state", "Obama.x", "Obama.y")]
pres1 <- cbind(pres08, pres12)
pres1[8:9, c(2, 3, 7, 8)]`,
    r`<p><b><code>merge(x, y, by = )</code></b> matches rows on a key variable and sorts by it; variables with the same name get <code>.x</code> / <code>.y</code> suffixes. <b><code>cbind()</code></b> just pastes columns side by side, assuming the rows are already in the same order. They aren't here: DC and DE are in different orders in the two files, so <code>cbind</code> pairs DC's 2008 result with DE's 2012 result.</p>`),
  C("cmd-kmeans", ["correlation"], "3.7.3", 112, r`What do the centers and the table tell you about the 112th Congress?`, CONGRESS,
    r`k112two.out <- kmeans(dwnom112, centers = 2, nstart = 5)
k112two.out$centers
table(party = congress$party[congress$congress == 112], cluster = k112two.out$cluster)`,
    r`<p><b><code>kmeans(X, centers = k, nstart = )</code></b> splits observations into k clusters; <code>nstart</code> runs several random starts and keeps the best. The output is a list: <code>$centers</code> (one row per centroid: within-cluster means of each variable), <code>$cluster</code> (assignments), <code>$size</code>, <code>$iter</code>. Here the two clusters line up almost perfectly with party: polarization. Cluster numbers are arbitrary labels.</p>`),
  C("cmd-matrix", ["rbasics", "correlation"], "3.7.1", 108, r`How is the matrix filled, and what do the margin functions return?`, "",
    r`x <- matrix(1:12, nrow = 3, ncol = 4, byrow = TRUE)
x
colSums(x)
rowMeans(x)
apply(x, 1, sd)`,
    r`<p><b><code>matrix()</code></b> fills by row when <code>byrow = TRUE</code> (by column otherwise); a matrix holds one data type. <code>colSums()</code>/<code>rowMeans()</code> summarize each column/row. <b><code>apply(X, MARGIN, FUN)</code></b> applies any function to each row (MARGIN = 1) or column (MARGIN = 2).</p>`),
  C("cmd-for", ["rbasics", "prediction"], "4.1.1", 125, r`Trace the loop: what prints, and what is <code>results</code>?`, "",
    r`values <- c(2, 4, 6)
n <- length(values)
results <- rep(NA, n)
for (i in 1:n) {
  results[i] <- values[i] * 2
  cat(values[i], "times 2 is equal to", results[i], "\n")
}
results`,
    r`<p><b><code>for (i in X) { }</code></b> runs the body once for each value of the counter <code>i</code>. The empty container <code>rep(NA, n)</code> is filled at position <code>[i]</code> each time. Loops don't print on their own; <code>cat()</code> prints its pieces separated by spaces, and <code>"\n"</code> starts a new line. (Here <code>values * 2</code> would do the same without a loop.)</p>`),
  C("cmd-if", ["rbasics", "prediction"], "4.1.2", 129, r`Which branch runs, and what does <code>sep = ""</code> do?`, "",
    r`operation <- "subtract"
if (operation == "add") {
  cat("I will perform addition 4 + 4\n")
  4 + 4
} else if (operation == "multiply") {
  cat("I will perform multiplication 4 * 4\n")
  4 * 4
} else {
  cat("\"", operation, "\" is invalid. Use either \"add\" or \"multiply.\"\n", sep = "")
}`,
    r`<p><b><code>if () { } else if () { } else { }</code></b> runs exactly one block: the first whose condition is TRUE, otherwise the <code>else</code>. Order matters. Unlike <code>ifelse()</code>, <code>if</code> needs a single TRUE/FALSE. <code>sep = ""</code> tells <code>cat()</code> to put nothing between pieces (default is a space).</p>`),
  C("cmd-modulo", ["rbasics", "prediction"], "4.1.2", 130, r`Trace the loop. What does <code>%%</code> test?`, "",
    r`values <- 1:5
results <- rep(NA, 5)
for (i in 1:5) {
  x <- values[i]
  r <- x %% 2
  if (r == 0) {
    results[i] <- x + x
  } else {
    results[i] <- x * x
  }
}
results`,
    r`<p><b><code>%%</code></b> gives the remainder of division (5 %% 2 = 1), so <code>x %% 2 == 0</code> tests whether x is even. Even numbers are added to themselves, odd ones squared: 1, 4, 9, 8, 25. The <code>if/else</code> is nested inside the loop, so it runs once per iteration.</p>`),
  C("cmd-sign", ["prediction"], "4.1.3", 136, r`Which states did the polls call wrong, and how does <code>sign()</code> find them?`, POLLS,
    r`pres08$state[sign(poll.pred) != sign(pres08$margin)]
pres08$margin[sign(poll.pred) != sign(pres08$margin)]
mean(sign(poll.pred) != sign(pres08$margin))`,
    r`<p><b><code>sign()</code></b> returns 1 for positive (Obama ahead), −1 for negative, 0 for zero. Where the predicted and actual signs differ, the polls picked the wrong winner (misclassification). Indiana and North Carolina are false negatives (Obama predicted to lose but won); Missouri is a false positive. Misclassification rate 3/51 ≈ 6%.</p>`),
  C("cmd-plot-layers", ["describe"], "3.3.2", 83, r`What does each layer add to the histogram?`, AFGHAN,
    r`hist(afghan$educ.years, freq = FALSE, breaks = seq(from = -0.5, to = 18.5, by = 1),
     xlab = "Years of education", main = "Distribution of respondent's education")
text(x = 3, y = 0.5, "median")
abline(v = median(afghan$educ.years))
lines(x = rep(median(afghan$educ.years), 2), y = c(0, 0.5), lty = "dashed", col = "blue")
points(x = 0, y = 0.4, pch = 19, col = "red")`,
    r`<p>Functions that add to an existing plot: <b><code>text(x, y, label)</code></b> writes text; <b><code>abline()</code></b> draws a line (<code>v =</code> vertical, <code>h =</code> horizontal, <code>a =, b =</code> intercept and slope); <b><code>lines(x, y)</code></b> connects points (here a vertical segment built with <code>rep()</code>); <b><code>points(x, y)</code></b> adds points. Common arguments: <code>col</code> color, <code>lty</code> line type, <code>lwd</code> width, <code>pch</code> symbol.</p>`, { plot: true }),
  C("cmd-par", ["describe"], "3.3.4", 88, r`What layout does <code>par()</code> set up? How would you save this to a file?`, AFGHAN,
    r`par(mfrow = c(1, 2), cex = 0.8)
hist(afghan$age, freq = FALSE, xlab = "Age", ylim = c(0, 0.04),
     main = "Distribution of respondent's age")
hist(afghan$educ.years, freq = FALSE, breaks = seq(from = -0.5, to = 18.5, by = 1),
     xlab = "Years of education", xlim = c(0, 20), main = "Distribution of respondent's education")`,
    r`<p><b><code>par(mfrow = c(1, 2))</code></b> splits the device into 1 row × 2 plots, filled row by row (<code>mfcol</code> fills by column); <code>cex</code> scales text size. To save: <code>pdf(file = "hist.pdf", height = 4, width = 8)</code> before plotting and <b><code>dev.off()</code></b> after, which closes the device and writes the file.</p>`, { plot: true }),

  // ---------- Regression output and inference (Ch 7.3) ----------
  C("inf-summary-overview", ["inference", "regression"], "7.3.4", 381, r`Name each part of this <code>summary()</code> output.`, WOMEN, r`summary(fit.women)`,
    r`<ul><li><b>Call</b>: the model fit (water facilities on the reserved-seat indicator).</li><li><b>Residuals</b>: quartiles of the residuals.</li><li><b>Coefficients</b> table, one row per coefficient: Estimate, Std. Error, t value, Pr(&gt;|t|), and significance stars.</li><li><b>Residual standard error</b> with its degrees of freedom (n − p − 1 = 320).</li><li><b>Multiple and Adjusted R-squared.</b></li><li><b>F-statistic</b> with its p-value.</li></ul>`),
  C("inf-estimate-se", ["inference", "regression", "regcausal"], "7.3.3–7.3.4", 381, r`For <code>reserved</code>, what do the Estimate and the Std. Error mean?`, WOMEN, r`summary(fit.women)$coefficients`,
    r`<p><b>Estimate</b> 9.252: villages in GPs reserved for women have about 9.3 more new or repaired drinking water facilities on average; because reservation was randomized, this estimates the average treatment effect. <b>Std. Error</b> 3.948: the estimated standard deviation of this estimate's sampling distribution, i.e. how much it would vary across hypothetical repeated samples. Smaller SE = more precise.</p>`),
  C("inf-tvalue", ["inference", "regression"], "7.3.4", 382, r`Where does the t value 2.344 come from, and what does it test?`, WOMEN, r`summary(fit.women)$coefficients["reserved", ]`,
    r`<p>t value = Estimate ÷ Std. Error = 9.252 / 3.948 ≈ <b>2.344</b>: how many standard errors the estimate is from 0. It is the test statistic for the null hypothesis H₀: β = 0 (no effect). Under H₀ it follows a t-distribution with 320 degrees of freedom. Rough rule: |t| above about 2 means p below about 0.05.</p>`),
  C("inf-pvalue", ["inference", "regression"], "7.3.4", 382, r`Interpret <code>Pr(&gt;|t|)</code> = 0.0197 and the star.`, WOMEN, r`summary(fit.women)`,
    r`<p>The two-sided p-value: if the true effect were 0, the probability of an estimate at least this far from 0 is 0.0197. Because 0.0197 ≤ 0.05, we <b>reject</b> H₀ at the 5% level: the effect is statistically significant. One star means p &lt; 0.05 (see the "Signif. codes" line). It is <i>not</i> the probability that the null is true.</p>`),
  C("inf-intercept-row", ["inference", "regression"], "7.3.4", 381, r`What does the intercept row test, and is it interesting here?`, WOMEN, r`summary(fit.women)$coefficients["(Intercept)", ]`,
    r`<p>The intercept (14.738) is the control group's mean: unreserved GPs averaged about 14.7 facilities. Its t value and tiny p-value (4.22e-10) test H₀: intercept = 0, i.e. that unreserved villages have zero facilities on average. That is rarely a question of interest; the slope row is the one that tests the treatment effect.</p>`),
  C("inf-model-lines", ["inference", "regression"], "7.3.4", 383, r`Interpret the bottom three lines of the summary.`, WOMEN, r`summary(fit.women)`,
    r`<p><b>Residual standard error</b> 33.45 on 320 df: the typical size of a residual (SD of residuals, using n − p − 1 = 322 − 2). <b>Multiple R²</b> 0.017: reservation explains under 2% of the variation in facilities; <b>Adjusted R²</b> 0.014 penalizes for predictors. A significant effect with a low R² is common: the effect is real but most variation comes from other factors. <b>F-statistic</b>: tests whether all slopes are 0 at once; with one predictor its p-value equals the slope's (0.0197). (The book shows the F line but doesn't discuss it.)</p>`),
  C("inf-confint", ["inference", "regression"], "7.3.4", 382, r`Interpret the 95% confidence interval for <code>reserved</code>.`, WOMEN, r`confint(fit.women)`,
    r`<p><b><code>confint()</code></b> gives 95% intervals by default (change with <code>level =</code>). For <code>reserved</code>: [1.49, 17.02]. Over repeated samples, intervals built this way contain the true effect 95% of the time. The interval excludes 0, matching p &lt; 0.05: both say the effect is statistically significant at the 5% level.</p>`),
  C("inf-summary-continuous", ["inference", "regression"], "4.2.3 / 7.3.4", 144, r`Interpret the slope's estimate, t value, and p-value for a continuous predictor.`, FACE, r`summary(fit)`,
    r`<p>Slope 0.660: a one-unit (0 to 1) increase in perceived competence is associated with a 66-point higher Democratic margin on average, or 6.6 points per 0.1. Its t value is the estimate divided by its SE; the very small p-value means we reject H₀: β = 0, so the association is statistically significant. It is not necessarily causal: competence ratings were not randomly assigned to candidates. R² ≈ 0.19: competence explains about a fifth of the variation in margins.</p>`),
  C("inf-summary-multi", ["inference", "regression", "regcausal"], "7.3.4", 382, r`Interpret the <code>NJ</code> row in this multiple regression.`, MINWAGE7, r`summary(fit.minwage)`,
    r`<p>Holding prior full-time share, prior wage, and chain constant, NJ restaurants' full-time share after the wage increase is estimated to be 5.4 percentage points higher (SE 3.3). t = 1.63 and p = 0.103 &gt; 0.05, so we <b>fail to reject</b> H₀ that the effect is 0. We can't rule out that the estimate is sampling error. That is not proof of no effect, and it is causal only if all confounders are in the model (exogeneity).</p>`),
  C("inf-multi-other", ["inference", "regression"], "7.3.4", 382, r`Interpret <code>fullPropBefore</code> and the chain rows. Why are there four chain coefficients?`, MINWAGE7, r`summary(fit.minwage)$coefficients`,
    r`<p><b>fullPropBefore</b> 0.169 (p = 0.003): restaurants that had a higher full-time share before also had a higher share after, holding the other variables constant; statistically significant. The model has <code>-1</code> (no intercept), so each chain gets its own coefficient: its baseline level, with Burger King's the highest. Their individual tests (H₀: coefficient = 0) aren't substantively meaningful here.</p>`),
  C("inf-multi-base", ["inference", "regcausal"], "7.3.1", 374, r`With an intercept, how do the chain coefficients change meaning?`, MINWAGE7, r`coef(fit.minwage1)`,
    r`<p>With an intercept, the first level alphabetically (<b>burgerking</b>) is the base and is dropped; <code>chainkfc</code>, <code>chainroys</code>, <code>chainwendys</code> are each chain's difference from Burger King (all negative, so Burger King is predicted to have the highest full-time share). The <code>NJ</code> estimate (0.054) and all predictions are identical to the no-intercept model.</p>`),
  C("inf-multi-fit", ["inference", "regression"], "7.3.4", 383, r`Interpret the bottom lines of the multiple-regression summary.`, MINWAGE7, r`summary(fit.minwage)`,
    r`<p>Residual standard error 0.244 on 351 df (358 observations − 7 coefficients). R² 0.63 and adjusted R² 0.63. (Without an intercept R computes R² differently, which inflates it; compare fits using models with intercepts.) F-statistic p &lt; 2.2e-16: the predictors jointly matter. A strong overall fit doesn't make the NJ coefficient significant.</p>`),
  C("inf-confint-multi", ["inference", "regression"], "7.3.4", 383, r`Interpret the confidence interval for the NJ effect.`, MINWAGE7, r`confint(fit.minwage)["NJ", ]`,
    r`<p>95% CI ≈ [−0.011, 0.120]. It <b>contains 0</b>, matching p = 0.10 &gt; 0.05: not statistically significant. But most of the interval is positive, so the data give little support for the claim that the higher minimum wage <i>reduced</i> full-time employment.</p>`),
];
