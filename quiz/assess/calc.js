// Assessment, Calculus fundamentals (course material). New studies and data; the book's methods and R functions.
// Like the exam, nothing asks you to write code: parts are written answers, predicting output, or interpreting shown code and output.
const r = String.raw;

export default {
  id: "calc", short: "Calculus", title: "Calculus fundamentals (course material)",
  intro: "Derivative rules, partial derivatives, and optimization, applied where the course uses them: marginal effects in regression models and the derivation of least squares. Show every step.",
  items: [
    {
      id: "k1rules", sec: "Derivatives", title: "Derivative rules",
      setup: r``,
      context: r`<p>Use the power, product, quotient, and chain rules. Simplify each answer.</p>`,
      parts: [
        {
          kind: "write", q: r`Differentiate \(f(x) = 3x^4 - \dfrac{2}{x^2} + 5\sqrt{x} - 7\).`,
          a: r`<p>Rewrite as powers: \(3x^4 - 2x^{-2} + 5x^{1/2} - 7\). Term by term: \(f'(x) = 12x^3 + 4x^{-3} + \tfrac{5}{2}x^{-1/2} = 12x^3 + \dfrac{4}{x^3} + \dfrac{5}{2\sqrt{x}}\). The constant −7 has derivative 0.</p>`,
          rubric: ["Rewrites 1/x² and √x as powers","Power rule on each term, including the negative and fractional exponents","Constant's derivative is 0"],
        },
        {
          kind: "write", q: r`Differentiate \(g(x) = (x^2 + 1)(3x - 2)\) with the product rule, then check by expanding first.`,
          a: r`<p>Product rule: \(g'(x) = 2x(3x - 2) + (x^2 + 1)\cdot 3 = 6x^2 - 4x + 3x^2 + 3 = 9x^2 - 4x + 3\). Check: \(g(x) = 3x^3 - 2x^2 + 3x - 2\), so \(g'(x) = 9x^2 - 4x + 3\) ✓.</p>`,
          rubric: ["Applies u'v + uv' correctly","Simplifies to 9x² − 4x + 3","Expansion check agrees"],
        },
        {
          kind: "write", q: r`Differentiate \(h(x) = \dfrac{2x + 1}{x - 3}\). Where are \(h\) and \(h'\) undefined?`,
          a: r`<p>Quotient rule (low d-high minus high d-low, over low squared): \(h'(x) = \dfrac{2(x - 3) - (2x + 1)\cdot 1}{(x - 3)^2} = \dfrac{-7}{(x - 3)^2}\). The order of terms in the numerator matters: reversing them flips the sign. Both \(h\) and \(h'\) are undefined at \(x = 3\). Since \(h'(x) &lt; 0\) everywhere else, \(h\) is decreasing on each side.</p>`,
          rubric: ["Correct quotient rule with the right order in the numerator","Simplifies to −7/(x − 3)²","Undefined at x = 3"],
        },
        {
          kind: "write", q: r`Differentiate \(k(b) = (y - a - bx)^2\) with respect to \(b\) (treat \(y, a, x\) as constants), and \(m(x) = \big(1 + (2x - 1)^3\big)^4\) with respect to \(x\).`,
          a: r`<p>Chain rule: outer function \(u^2\), inner \(u = y - a - bx\) with \(du/db = -x\). So \(k'(b) = 2(y - a - bx)(-x) = -2x(y - a - bx)\). This is exactly one term of the derivative of SSR with respect to the slope. For \(m\), three layers: \(m'(x) = 4\big(1 + (2x - 1)^3\big)^3 \cdot 3(2x - 1)^2 \cdot 2 = 24(2x - 1)^2\big(1 + (2x - 1)^3\big)^3\).</p>`,
          rubric: ["Identifies inner and outer functions","k'(b) = −2x(y − a − bx)","Applies the chain rule through all three layers of m","m'(x) = 24(2x − 1)²(1 + (2x − 1)³)³"],
        },
      ],
    },
    {
      id: "k2part", sec: "Partial derivatives", title: "Partial derivatives and marginal effects",
      setup: r``,
      context: r`<p>A partial derivative differentiates with respect to one variable, holding the others fixed. That is the calculus behind "holding other predictors constant."</p>`,
      parts: [
        {
          kind: "write", q: r`For \(f(x, z) = 3x^2z + 4xz^3 - z\), find \(\partial f/\partial x\) and \(\partial f/\partial z\).`,
          a: r`<p>\(\partial f/\partial x = 6xz + 4z^3\), treating \(z\) as a constant. \(\partial f/\partial z = 3x^2 + 12xz^2 - 1\), treating \(x\) as a constant.</p>`,
          rubric: ["∂f/∂x = 6xz + 4z³","∂f/∂z = 3x² + 12xz² − 1","Treats the other variable as a constant in each"],
        },
        {
          kind: "write", q: r`For \(Y = \alpha + \beta_1X_1 + \beta_2X_2 + \beta_3X_1X_2\), find \(\partial Y/\partial X_1\) and \(\partial Y/\partial X_2\). Interpret \(\beta_1\) and \(\beta_3\). How does this differ from the model without the interaction?`,
          a: r`<p>\(\partial Y/\partial X_1 = \beta_1 + \beta_3X_2\) and \(\partial Y/\partial X_2 = \beta_2 + \beta_3X_1\). \(\beta_1\) is the effect of \(X_1\) when \(X_2 = 0\) (not "the" effect of \(X_1\)), and \(\beta_3\) is how much \(X_1\)'s effect changes per unit of \(X_2\) (and symmetrically). Without the interaction, \(\partial Y/\partial X_1 = \beta_1\): a constant marginal effect, the ceteris paribus slope of multiple regression.</p>`,
          rubric: ["∂Y/∂X1 = β1 + β3X2 and ∂Y/∂X2 = β2 + β3X1","β1 is the effect of X1 only when X2 = 0","β3 = change in X1's effect per unit of X2","Without interaction the marginal effect is the constant β1"],
        },
        {
          kind: "write", q: r`Predicted turnout is \(\hat Y = 0.10 + 0.012\,\text{age} - 0.0001\,\text{age}^2\). Find the marginal effect of age, the age where turnout peaks, and verify it is a maximum. What is the marginal effect at 30 and at 80?`,
          a: r`<p>\(d\hat Y/d\,\text{age} = 0.012 - 0.0002\,\text{age}\). Setting it to 0 gives <b>age = 60</b>. The second derivative is −0.0002 &lt; 0, so this is a maximum. At 30: 0.012 − 0.006 = +0.006 (turnout still rising, 0.6 points per year). At 80: 0.012 − 0.016 = −0.004 (falling). In a quadratic model the marginal effect is not constant: it changes linearly with age, which is why the book interprets such models through predictions.</p>`,
          rubric: ["Derivative 0.012 − 0.0002·age","Turning point at 60","Second derivative negative: maximum","Marginal effects +0.006 at 30 and −0.004 at 80"],
        },
      ],
    },
    {
      id: "k3opt", sec: "Optimization", title: "Optimization",
      setup: r``,
      context: r`<p>At an interior optimum the first derivative is 0 (first-order condition); the sign of the second derivative tells you whether it is a minimum or a maximum.</p>`,
      parts: [
        {
          kind: "write", q: r`Find and classify the critical points of \(f(x) = x^3 - 6x^2 + 9x + 1\). Are they global optima?`,
          a: r`<p>\(f'(x) = 3x^2 - 12x + 9 = 3(x - 1)(x - 3) = 0\) at \(x = 1\) and \(x = 3\). \(f''(x) = 6x - 12\): \(f''(1) = -6 &lt; 0\), a local max (f = 5); \(f''(3) = 6 &gt; 0\), a local min (f = 1). Neither is global: a cubic goes to \(+\infty\) and \(-\infty\), so there is no global max or min on the real line.</p>`,
          rubric: ["Solves f'(x) = 0: x = 1 and 3","Second derivative test: max at 1, min at 3","Local, not global, because the cubic is unbounded"],
        },
        {
          kind: "write", q: r`Find the value \(c\) that minimizes \(S(c) = \sum_{i=1}^n (x_i - c)^2\), show it is a minimum, and evaluate it for {2, 5, 11}. Which familiar statistic is it, and how does this connect to least squares?`,
          a: r`<p>\(S'(c) = \sum -2(x_i - c) = -2\big(\sum x_i - nc\big) = 0\) gives \(c = \frac{1}{n}\sum x_i = \bar x\), the <b>mean</b>. \(S''(c) = 2n &gt; 0\): a minimum (a sum of squares is a convex upward parabola in \(c\)). For {2, 5, 11}: \(c = 6\), \(S(6) = 16 + 1 + 25 = 42\). This is least squares with only an intercept: the best constant prediction is the mean, and TSS is exactly this minimized sum, the error left with no predictors.</p>`,
          rubric: ["Differentiates term by term and solves: c = x̄","Second derivative 2n > 0: minimum","c = 6 and S = 42 for the data","Links to least squares with only an intercept / TSS"],
        },
      ],
    },
    {
      id: "k4ols", sec: "Least squares", title: "Deriving least squares",
      setup: r`x <- c(1, 2, 3, 4, 5)
y <- c(2, 4, 5, 4, 5)`,
      context: r`<p>\(\text{SSR}(a, b) = \sum_{i=1}^n (Y_i - a - bX_i)^2\). The least-squares estimates are the \((a, b)\) that minimize it. For the code part, <code>x</code> and <code>y</code> are the five points (1, 2), (2, 4), (3, 5), (4, 4), (5, 5).</p>`,
      parts: [
        {
          kind: "write", q: r`Take the partial derivatives of SSR with respect to \(a\) and \(b\), set them to zero, and solve for \(\hat\alpha\) and \(\hat\beta\).`,
          a: r`<p>\(\partial/\partial a = -2\sum(Y_i - a - bX_i) = 0 \Rightarrow \sum Y_i = na + b\sum X_i \Rightarrow \hat\alpha = \bar Y - \hat\beta\bar X\). \(\partial/\partial b = -2\sum X_i(Y_i - a - bX_i) = 0\). Substituting \(a = \bar Y - b\bar X\): \(\sum X_i(Y_i - \bar Y) = b\sum X_i(X_i - \bar X)\), and since \(\sum \bar X(Y_i - \bar Y) = 0\) and \(\sum \bar X(X_i - \bar X) = 0\), this becomes \(\hat\beta = \dfrac{\sum(X_i - \bar X)(Y_i - \bar Y)}{\sum(X_i - \bar X)^2}\).</p>`,
          rubric: ["∂SSR/∂a with the chain rule (−2 times the sum of residuals)","∂SSR/∂b (−2 times the sum of X times residuals)","Solves the intercept condition: α̂ = Ȳ − β̂X̄","Substitutes and centers to get the slope formula"],
        },
        {
          kind: "write", q: r`What do the two first-order conditions imply about the residuals? Use them to prove the fitted line passes through \((\bar X, \bar Y)\).`,
          a: r`<p>The intercept condition says \(\sum \hat\varepsilon_i = 0\): the residuals sum (and average) to zero. The slope condition says \(\sum X_i\hat\varepsilon_i = 0\): residuals are uncorrelated with the predictor. Through the means: \(\hat\alpha + \hat\beta\bar X = (\bar Y - \hat\beta\bar X) + \hat\beta\bar X = \bar Y\). These hold for any data set by construction, which is why they don't validate the model.</p>`,
          rubric: ["Σε̂ = 0 from the intercept condition","ΣXε̂ = 0 from the slope condition","Algebra showing the line passes through the means","Notes these are mechanical properties"],
        },
        {
          kind: "interpret", q: r`For regression <i>through the origin</i> (\(Y = bX\), no intercept), derive \(\hat b\) by hand by minimizing \(\sum(Y_i - bX_i)^2\). Use the output to check your answer, and explain why this slope differs from the slope with an intercept (0.6).`,
          show: r`sum(x * y) / sum(x^2)
coef(lm(y ~ -1 + x))
coef(lm(y ~ x))`,
          a: r`<p>\(\frac{d}{db}\sum(Y_i - bX_i)^2 = -2\sum X_i(Y_i - bX_i) = 0 \Rightarrow \hat b = \dfrac{\sum X_iY_i}{\sum X_i^2} = 66/55 = 1.2\). The second derivative \(2\sum X_i^2 &gt; 0\) confirms a minimum. Forcing the line through (0, 0) when the data's center is (3, 4) tilts it steeply. With an intercept, the line passes through the means and the slope is 0.6. The two coincide only when the data are centered (as with z-scores, where the intercept is zero anyway).</p>`,
          rubric: ["Derives b̂ = ΣXY / ΣX²","Gets 1.2, matching lm(y ~ -1 + x)","Explains the difference: forced through the origin vs through the means","Notes they coincide for centered (standardized) data"],
        },
      ],
    },
  ],
};
