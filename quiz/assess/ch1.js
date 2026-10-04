// Assessment, Chapter 1: R foundations. New studies and data; the book's methods and R functions.
// Like the exam, nothing asks you to write code: parts are written answers, predicting output, or interpreting shown code and output.
const r = String.raw;

export default {
  id: "ch1", short: "Chapter 1", title: "Chapter 1: R foundations",
  intro: "Vectors, indexing, functions, data frames, missing values, object classes, and a reproducible workflow. Predict outputs before you run anything.",
  items: [
    {
      id: "c1vec", sec: "1.3.3", title: "Registration growth in a county",
      setup: r`reg <- c(41200, 43800, 47100, 50300, 52000, 55900)`,
      context: r`<p>A county's registered voters (in people) at six consecutive even-year elections, 2014 through 2024, are stored as <code>reg</code>:</p>
<pre class=code>reg <- c(41200, 43800, 47100, 50300, 52000, 55900)</pre>`,
      parts: [
        {
          kind: "predict", q: r`What does each line print?`,
          show: r`reg[c(5, 2)]
reg[-c(1, length(reg))]
length(reg[-2])`,
          a: r`<ul><li><code>reg[c(5, 2)]</code> returns the 5th then the 2nd element, in the order you asked: <code>52000 43800</code>.</li>
<li><code>-c(1, length(reg))</code> is <code>-c(1, 6)</code>, which drops the first and last elements: <code>43800 47100 50300 52000</code>.</li>
<li>Dropping one element leaves 5, so <code>length(reg[-2])</code> is <code>5</code>. Indexing never changes <code>reg</code> itself.</li></ul>`,
          rubric: ["Positive indices return elements in the order requested (52000 before 43800)","Negative indices drop elements; length(reg) evaluates to 6 inside the brackets","Notes that indexing does not modify reg (length is 5 for the subset only)"],
        },
        {
          kind: "interpret", q: r`An analyst computes the percentage increase in registration from each election to the next. Explain why <code>reg[-1]</code> and <code>reg[-length(reg)]</code> line up, interpret the output, and explain why the code uses <code>length(reg)</code> rather than <code>6</code>.`,
          show: r`growth <- (reg[-1] - reg[-length(reg)]) / reg[-length(reg)] * 100
growth`,
          a: r`<p>The first value, 6.31, means registration grew 6.3% from 2014 to 2016; the slowest growth was 3.4% (2020 to 2022).</p><p><code>reg[-1]</code> is elections 2 to 6 and <code>reg[-length(reg)]</code> is elections 1 to 5. Element <i>i</i> of the first lines up with element <i>i</i> of the second, so subtracting gives each election minus the one before. Dividing by the shifted <i>earlier</i> vector gives the growth rate. Using <code>length(reg)</code> instead of a hard-coded <code>6</code> keeps it correct when the vector grows.</p>`,
          rubric: ["reg[-1] is elections 2–6 and reg[-length(reg)] is elections 1–5, so elements pair consecutive elections","The denominator is the earlier election: growth from the starting value","Interprets the numbers (e.g. 6.31 = 6.3% growth from 2014 to 2016)","length(reg) keeps the code correct when elections are added"],
        },
        {
          kind: "write", q: r`A classmate writes <code>(reg[-1] - reg[-6]) / reg[-1] * 100</code>. Explain precisely what this computes, whether it is larger or smaller than the correct growth rates when registration is rising, and what else is fragile about it.`,
          a: r`<p>It divides each increase by the <i>later</i> election's count, so it measures the increase as a share of the end-of-period total, not growth from the starting point. When registration is rising, the later value is larger than the earlier one, so every number is too small (for 41,200 to 43,800: 5.94% instead of 6.31%). Separately, <code>-6</code> is hard-coded: once a seventh election is appended, <code>reg[-6]</code> would drop the wrong element and the two vectors would have different lengths.</p>`,
          rubric: ["Identifies the denominator as the later value (end of period)","Concludes the numbers are understated when the series is rising","Flags the hard-coded 6 as breaking when the vector changes length"],
        },
        {
          kind: "predict", q: r`Predict the output of the last two lines.`,
          show: r`names(reg) <- seq(from = 2014, to = 2024, by = 2)
reg[c(1, 2)] <- c(41000, 44000)
reg["2016"]
round(reg / reg[1], 2)`,
          a: r`<p>Names are labels attached to the elements, so <code>reg["2016"]</code> returns the second element, now replaced with 44000, printed with its name. Dividing by <code>reg[1]</code> (41000) rescales every element relative to 2014, and the names carry through. The values are 1.00, 1.07, 1.15, 1.23, 1.27, 1.36. Note that the replacement on line 2 happens before both lines run.</p>`,
          rubric: ["Uses the replaced values (41000 and 44000), not the originals","Shows that names print above the values","Gets the ratio to 2014 for each element (first element 1)"],
        },
      ],
    },
    {
      id: "c1fun", sec: "1.3.4", title: "Writing and tracing functions",
      setup: r`reg <- c(41200, 43800, 47100, 50300, 52000, 55900)`,
      context: r`<p>Functions take arguments and return one object. Objects created inside a function live only inside it. <code>reg</code> from the previous problem is loaded.</p>`,
      parts: [
        {
          kind: "predict", q: r`Trace this code. What are the two printed results?`,
          show: r`spread <- function(x) {
  lo <- min(x)
  hi <- max(x)
  out <- c(hi - lo, sum(x) / length(x))
  names(out) <- c("width", "center")
  return(out)
}
lo <- 100
spread(c(4, 10, 7, 1))
lo`,
          a: r`<p>Inside <code>spread()</code>, <code>lo</code> is 1 and <code>hi</code> is 10, so width = 9 and center = 22 / 4 = 5.5. The function returns a named vector (<code>width 9, center 5.5</code>). The <code>lo</code> created inside the function is local: it never touches the <code>lo</code> in the workspace, which is still <code>100</code>.</p>`,
          rubric: ["Computes width 9 and center 5.5","Output is a named vector with names width and center","Explains the global lo stays 100 because the inner lo is local"],
        },
        {
          kind: "predict", q: r`Predict each sequence. Pay attention to which arguments are named.`,
          show: r`seq(from = 10, to = 1, by = -3)
seq(by = 5, to = 20, from = 0)
seq(10, 1950, 2010)
7:4`,
          a: r`<ul><li>Counting down from 10 by 3 stops before going below 1: <code>10 7 4 1</code>.</li>
<li>Named arguments can come in any order: <code>0 5 10 15 20</code>.</li>
<li>Unnamed arguments match by position, so this is <code>from = 10, to = 1950, by = 2010</code>. The next value, 2020, is past 1950, so only <code>10</code> is returned. The intended years were never generated: this is the bug named arguments prevent.</li>
<li>The colon counts down by 1: <code>7 6 5 4</code>.</li></ul>`,
          rubric: ["First two sequences correct (10 7 4 1; 0 5 10 15 20)","Positional matching gives from = 10, to = 1950, by = 2010, which returns just 10","7:4 counts down to 7 6 5 4"],
        },
        {
          kind: "interpret", q: r`Trace this function and interpret its output for <code>reg</code>. Why does the result print as one labeled row, and why is <code>total / n</code> the mean?`,
          show: r`describe <- function(x) {
  n <- length(x)
  total <- sum(x)
  out <- c(n, total, total / n, max(x) - min(x))
  names(out) <- c("n", "total", "mean", "width")
  return(out)
}
describe(reg)`,
          a: r`<p>The function builds one vector of four numbers, labels it with <code>names()</code>, and returns it. For <code>reg</code>: n = 6, total = 290,300, mean ≈ 48,383, width = 14,700. Because <code>c()</code> combines everything into one numeric vector, the result prints as a single named row.</p>`,
          rubric: ["Explains each line: length, sum, combining four numbers, names()","Interprets the output: n = 6, total 290,300, mean ≈ 48,383, width 14,700","c() makes one numeric vector and names() labels its elements","sum / length is the definition of the mean"],
        },
      ],
    },
    {
      id: "c1df", sec: "1.3.5", title: "A small data frame of parliaments",
      setup: r`parl <- data.frame(
  country = c("Ardonia", "Belmar", "Corvia", "Dastan", "Elbor", "Fennic", "Galt", "Heron"),
  region = c("North", "South", "South", "North", "East", "East", "South", "North"),
  seats = c(120, 300, 85, 450, 200, 150, 60, 240),
  women = c(18, 120, NA, 180, 50, 30, 6, 60),
  year = c(2019, 2020, 2018, 2021, 2019, 2022, 2020, 2021))`,
      context: r`<p>The data frame <code>parl</code> describes eight (fictional) national parliaments:</p>
<table><tr><td><code>country</code></td><td>country name</td></tr><tr><td><code>region</code></td><td>North, South, or East</td></tr><tr><td><code>seats</code></td><td>total seats</td></tr><tr><td><code>women</code></td><td>seats held by women (missing for one country)</td></tr><tr><td><code>year</code></td><td>year of the last election</td></tr></table>
<p>Corvia (row 3) is the country with missing <code>women</code>.</p>`,
      parts: [
        {
          kind: "predict", q: r`Predict the output of each line.`,
          show: r`dim(parl)
parl[c(2, 4), c("country", "women")]
parl$seats[seq(from = 2, to = nrow(parl), by = 3)]`,
          a: r`<ul><li><code>dim()</code> gives rows then columns: <code>8 5</code>.</li>
<li>Rows 2 and 4, two named columns: Belmar 120 and Dastan 180, with row labels 2 and 4 kept.</li>
<li><code>seq(2, 8, by = 3)</code> is 2, 5, 8, so the seats in rows 2, 5, 8: <code>300 200 240</code>.</li></ul>`,
          rubric: ["dim gives 8 5 (rows, then columns)","Two-dimensional indexing returns rows 2 and 4 with only the two columns (original row labels shown)","Works out seq() as 2, 5, 8 and returns 300 200 240"],
        },
        {
          kind: "interpret", q: r`Explain what each line does and why the first mean is <code>NA</code>. Interpret the second value.`,
          show: r`parl$share <- parl$women / parl$seats
mean(parl$share)                # NA: one share is missing
mean(parl$share, na.rm = TRUE)  # drop the missing value first`,
          a: r`<p>Arithmetic on two columns is element-wise, so <code>women / seats</code> gives one share per row, and Corvia's is <code>NA</code>. <code>mean()</code> returns <code>NA</code> if any element is missing. <code>na.rm = TRUE</code> removes missing values before averaging, giving 0.25.</p>`,
          rubric: ["Element-wise division gives one share per parliament (NA for Corvia)","A single NA makes mean() return NA","na.rm = TRUE drops missing values before averaging","Interprets 0.25 as the average share across the seven reporting parliaments"],
        },
        {
          kind: "interpret", q: r`The analyst compares two summaries of women's representation. Interpret each number, explain why they differ, and say which question each answers. Why does the code drop row 3 from <i>both</i> sums?`,
          show: r`parl$share <- parl$women / parl$seats
mean(parl$share, na.rm = TRUE)             # average parliament
sum(parl$women[-3]) / sum(parl$seats[-3])  # average seat`,
          a: r`<p>The pooled ratio (0.31) is well above the mean of shares (0.25). It gives every <i>seat</i> equal weight, so the largest parliaments dominate it, and here the big parliaments (Dastan, Belmar) have the highest shares. The mean of shares gives every <i>parliament</i> equal weight. The first answers "what share of all legislators are women?"; the second answers "how gender-balanced is the typical parliament?". They differ whenever the share is related to parliament size. You must drop Corvia from <i>both</i> sums, or the denominator would include seats whose women's count is unknown.</p>`,
          rubric: ["[-3] drops Corvia from numerator and denominator so they cover the same parliaments","The pooled ratio weights by seats (large parliaments count more)","The mean of shares weights each parliament equally","Matches each number to the substantive question it answers"],
        },
        {
          kind: "predict", q: r`What does <code>summary()</code> report for <code>women</code>? Read off the median and explain the extra entry.`,
          show: r`summary(parl$women)`,
          a: r`<p><code>summary()</code> reports Min, 1st Qu., Median, Mean, 3rd Qu., Max computed on the seven non-missing values, plus an <code>NA's</code> count of 1. The sorted values are 6, 18, 30, 50, 60, 120, 180, so the median is the 4th value, 50. The mean is 464 / 7 ≈ 66.3, above the median because two large values pull it up.</p>`,
          rubric: ["Notes that the statistics use only the non-missing values","Explains the NA's entry counts the missing value (1)","Finds the median 50 as the middle of seven sorted values"],
        },
      ],
    },
    {
      id: "c1cls", sec: "1.3.2", title: "Objects, classes, and error messages",
      setup: r``,
      context: r`<p>R decides what operations are allowed from an object's class. Read each error message as a diagnosis.</p>`,
      parts: [
        {
          kind: "predict", q: r`Predict each output, including any error. (An error stops the run, as it would in a script.)`,
          show: r`Turnout <- 0.62
turnout <- "0.58"
class(Turnout)
class(turnout)
class(c(1, "2", 3))
Turnout * 100
turnout * 100`,
          a: r`<ul><li><code>Turnout</code> and <code>turnout</code> are different objects (R is case sensitive): <code>"numeric"</code>, then <code>"character"</code>, because quotes make a string.</li>
<li>A vector holds one type. Mixing numbers and a string coerces everything to character, so <code>class(c(1, "2", 3))</code> is <code>"character"</code>.</li>
<li><code>Turnout * 100</code> is <code>62</code>.</li>
<li><code>turnout * 100</code> fails with "non-numeric argument to binary operator": multiplication is undefined for a character string, even one that looks like a number.</li></ul>`,
          rubric: ["Distinguishes Turnout from turnout (case sensitivity)","Character class for the quoted value","Recognizes that c() with one string coerces the whole vector to character","Predicts the non-numeric argument error for the character multiplication"],
        },
        {
          kind: "write", q: r`A script fails at four lines. For each, name the problem and give the fix.
<pre class=code>2020data <- read.csv("turnout.csv")
turnout rate <- 0.6
Result
mean(c(4, 8, NA))</pre>(Assume the third line should print an object you created earlier as <code>result</code>, and the fourth should give 6.)`,
          a: r`<ul><li><code>2020data</code>: object names cannot begin with a number. Rename, e.g. <code>data2020</code>.</li>
<li><code>turnout rate</code>: names cannot contain spaces. Use <code>turnout.rate</code>.</li>
<li><code>Result</code>: "object 'Result' not found", because names are case sensitive. Type <code>result</code> (use <code>ls()</code> to see what exists).</li>
<li><code>mean(c(4, 8, NA))</code> returns <code>NA</code>, not an error. Add <code>na.rm = TRUE</code>.</li></ul>`,
          rubric: ["Names cannot start with a digit","Names cannot contain spaces","Case sensitivity causes 'object not found'; suggests ls() or the exact name","Missing value: NA result fixed with na.rm = TRUE"],
        },
      ],
    },
    {
      id: "c1flow", sec: "1.3.6–1.3.8", title: "A reproducible workflow",
      setup: r``,
      context: r`<p>You are a research assistant who cleaned a large survey this afternoon. Your workspace holds the raw data <code>svy</code>, a cleaned data frame <code>svy.clean</code>, and two summary objects <code>tab1</code> and <code>tab2</code>. You work from scripts in RStudio.</p>`,
      parts: [
        {
          kind: "write", q: r`You find these lines at the end of the script. For each, explain what it does and which kind of task it serves. Why does <code>load()</code> have no assignment arrow? Why must <code>library(foreign)</code> run in every session while <code>install.packages("foreign")</code> runs only once?
<pre class=code>library(foreign)
write.dta(svy.clean, file = "svy_clean.dta")
save(tab1, tab2, file = "tables.RData")
write.csv(svy.clean, file = "svy_clean.csv")
load("tables.RData")
source("clean.R")</pre>`,
          a: r`<ol><li><code>library(foreign)</code> loads an installed package into this session. Installing downloads it to the computer once; loading must happen in every new session.</li>
<li><code>write.dta()</code> (from foreign) writes the data frame as a Stata file, for a coauthor who uses Stata.</li>
<li><code>save(tab1, tab2, file = ...)</code> saves just those two objects to an RData file, not the whole workspace.</li>
<li><code>write.csv()</code> writes the data frame as plain-text CSV that any program or spreadsheet can open.</li>
<li><code>load()</code> restores the saved objects <i>under their saved names</i>, which is why nothing is assigned.</li>
<li><code>source()</code> runs every line of another script file without opening it.</li></ol>`,
          rubric: ["library() loads each session vs install.packages() once","write.dta writes a Stata file; write.csv a CSV","save() stores only the named objects","load() restores objects under their original names (no assignment)","source() runs a script file"],
        },
        {
          kind: "write", q: r`When you quit R, it asks whether to save the workspace image. The book recommends answering no. Explain why, and say what practice replaces it. Then explain what <code>lint()</code> would flag in the line <code>svy.clean = subset(svy, age >= 18)</code>.`,
          a: r`<p>Saving the image writes a hidden <code>.RData</code> file that reloads silently next time. You stop knowing which objects exist or how they were made, so your results can depend on stale objects that no script recreates. That is the opposite of reproducible. Instead, keep the code in a script (or R Markdown) that rebuilds everything from the raw data, and explicitly <code>save()</code> only what you need. The linter flags using <code>=</code> for assignment; the style rule is <code>&lt;-</code>.</p>`,
          rubric: ["Hidden .RData reloads objects silently, so you lose track of what exists","Connects this to reproducibility: results should be rebuilt from scripts","Recommends scripts / R Markdown plus explicit save()","Lint flags = instead of <- for assignment"],
        },
      ],
    },
  ],
};
