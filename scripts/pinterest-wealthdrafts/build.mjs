/**
 * WealthDrafts Pinterest batch: 50 Personal Finance Companion pins and 50
 * Monthly Money Reset pins, each a different money problem a woman in the
 * US is likely to recognise, each carrying the features it solves. Two
 * separate design systems, one per product, both pastel.
 *
 *   node scripts/run-tsx.mjs scripts/pinterest-wealthdrafts/build.mjs
 *
 *   Personal Finance Companion: "Ledger". Rounded white cards holding the
 *     real app screen, with a soft-edged paper scan on some pins.
 *   Monthly Money Reset: "Monthly page". A calendar-dot motif, receipt and
 *     landscape window frames around the real phone screen.
 *
 * Output: public/store/pinterest-wealthdrafts/{pfc,mmr}-NN.jpg, and
 * marketing/pinterest/wealthdrafts/combined-100.csv (100 rows, 15 a day).
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const PAGES_DIR = path.resolve(process.cwd(), ".etsy-images/_pages");
const SCREENS_DIR = path.resolve(process.cwd(), ".etsy-images/_screens");
const STORE_DIR = path.resolve(process.cwd(), "public/store");
const FONTS_DIR = path.resolve(process.cwd(), "public/fonts");
const IMG_OUT = path.resolve(process.cwd(), "public/store/pinterest-wealthdrafts");
const CSV_OUT = path.resolve(process.cwd(), "marketing/pinterest/wealthdrafts");
const SITE = "https://draftpace.com";
const PFC_LINK = `${SITE}/shop/personal-finance-companion`;
const MMR_LINK = `${SITE}/free`;
const PER_DAY = 15;

// ---------- Personal Finance Companion: 50 pins ----------
// [headline, title, board, layout, pal, screen(0-2), guideSlug, description]
const PFC = [
  ["You checked your balance and still don't know what's yours to spend.", "Available Money: What You Can Actually Spend", "Money Organization", "card", "mint", 0, "how-much-of-your-money-is-actually-safe-to-spend", "Your bank app shows money that bills are about to take. Personal Finance Companion shows one Available Money figure, with a bar that explains where the rest of your balance goes."],
  ["Your bank app says you have money. Your bills say otherwise.", "Available Balance vs Current Balance Explained", "Money Organization", "tiles", "lilac", 1, "available-balance-vs-current-balance", "Current balance counts what has posted, and available balance subtracts holds, but neither knows what bills are still coming. The companion keeps every bill in the picture."],
  ["Where does your balance actually go each month?", "Where Your Balance Goes Each Month", "Money Organization", "stack", "peach", 2, "monthly-bills-list", "A four-part bar shows what is available, bills and subscriptions, debt minimums and what is protected, so you can see the whole balance at once."],
  ["Did you pay the electric bill, or just think about paying it?", "Tick Bills Paid for the Month", "Bills and Subscriptions", "margin", "sky", 0, "monthly-bills-list", "Tick a bill paid and the companion works out what is left to pay. Paid bills drop off the list of what is coming up."],
  ["Bills due this month, and you can't remember which are already paid.", "Monthly Bills List: Paid and Still Due", "Bills and Subscriptions", "card", "mint", 1, "monthly-bills-list", "One list of this month's bills, with paid ones ticked off, so nothing gets paid twice or missed. Set up your own list in a few minutes."],
  ["A bill with no due date is the one that sneaks up on you.", "Bills Without a Due Date: Why They Get Missed", "Bills and Subscriptions", "tiles", "blush", 2, "what-to-check-before-each-direct-debit-date", "The companion flags any bill missing a due date, so the gap shows up before the payment does. Fix the record and the flag clears on its own."],
  ["Your records are three months out of date, and the balance still looks fine.", "Stale Money Records and How to Refresh Them", "Money Organization", "card", "lilac", 0, "organize-your-finances-from-scratch", "The Attention inbox only flags real gaps in your own records, like an old balance. It never invents a task to make the list look busy."],
  ["Five small subscriptions, and you can't name all of them.", "Find Every Subscription You Are Paying For", "Bills and Subscriptions", "stack", "sage", 1, "how-to-find-every-subscription-you-are-paying-for", "Add each subscription with its amount and renewal date, and see the yearly total in one place."],
  ["A free trial quietly turned into a charge you didn't expect.", "Free Trials That Turn Into Charges", "Bills and Subscriptions", "margin", "peach", 2, "how-to-cancel-subscriptions", "Record each renewal date, and the companion shows what is coming before the card is charged. A cancelled subscription can be ticked off, not forgotten."],
  ["Annual subscriptions are the bills you forget until the card is charged.", "Annual Subscriptions: The Bills You Forget", "Bills and Subscriptions", "tiles", "mint", 0, "subscription-tracker-what-to-track", "Yearly charges sit outside the monthly view, so they are easy to miss. The companion keeps each renewal date beside its amount."],
  ["When will you actually be debt-free? Not roughly. The month.", "Debt Payoff Plan: The Month You Are Debt-Free", "Paying Down Debt", "card", "blush", 1, "debt-snowball-vs-avalanche", "Your balances, rates and minimum payments make a plan with a real finish date. Add an extra amount and watch the finish date move earlier."],
  ["Smallest balance first, or highest rate first? Which one saves more?", "Debt Snowball vs Avalanche: Which Saves More", "Paying Down Debt", "stack", "lilac", 2, "debt-snowball-vs-avalanche", "The payoff plan works out both orders from your own numbers and shows what the cheaper method saves, so you can choose with the figures in front of you."],
  ["Minimum payments keep the debt alive, and you're not sure which card to hit.", "Credit Card Minimum Payments: How Long They Take", "Paying Down Debt", "margin", "peach", 0, "credit-card-minimum-payments-how-long", "See how long the minimum takes, then add an extra amount and watch the finish date move."],
  ["A debt with no interest rate is the one you can't plan around.", "Debt With No Rate: Why It Gets Left Out", "Paying Down Debt", "tiles", "sky", 1, "debt-snowball-vs-avalanche", "A debt without a rate is named as left out of the plan, never guessed at. Add the rate when you have it and the plan includes it."],
  ["Where would an extra $50 a month do the most good?", "Extra Debt Payments: Where $50 Does the Most", "Paying Down Debt", "card", "mint", 2, "debt-snowball-vs-avalanche", "Set an extra monthly amount and the payoff plan shows which debt it clears first and how much sooner you finish."],
  ["You're saving for something, but the money keeps getting spent.", "Savings Goals That Stop Leaking", "Sinking Funds and Savings Goals", "stack", "peach", 0, "sinking-funds-explained", "Savings progress is what you record toward each goal. It is never worked out from a linked account, so the goal stays honest."],
  ["A savings goal with no end date feels like it will never happen.", "Savings Goals With a Date and an Amount", "Sinking Funds and Savings Goals", "margin", "lilac", 1, "how-to-build-a-first-1000-emergency-fund", "Give each goal an amount and a date, and see the monthly amount it needs. Build a first $1,000 emergency fund one step at a time."],
  ["Your savings goal and the money in your account are not the same thing.", "Linking a Savings Account Without Mixing Them Up", "Sinking Funds and Savings Goals", "tiles", "sage", 2, "sinking-funds-explained", "Linking an account is optional and only a reference. Your goal's progress stays what you recorded, so a linked balance never quietly becomes your goal."],
  ["Reviewing a statement means retyping everything by hand.", "Import a Bank Statement Without Retyping", "Money Organization", "card", "butter", 0, "bank-statement-csv-to-budget", "Paste a note, add a text file or import a CSV, then review what changed before anything is confirmed."],
  ["A CSV from your bank, and you're not sure what happens to it next.", "Bank CSV to Budget: Review Before It Counts", "Money Organization", "stack", "sky", 1, "bank-statement-csv-to-budget", "Imported lines wait for your review, so nothing lands in your picture until you have checked it."],
  ["Paste the notes from your week and see what changed.", "Paste Notes to Update Your Money Picture", "Money Organization", "margin", "mint", 2, "end-of-month-money-review", "Paste a note of what you spent, and the companion shows what it changes before it counts toward the month."],
  ["You split the rent and the bills, and nobody remembers who paid what.", "Splitting Rent and Bills With a Partner", "Splitting Bills", "card", "blush", 0, "split-bills-with-a-partner-or-roommate", "Mark a bill as shared, set your share as a percentage, and tick it settled when it is genuinely settled."],
  ["Roommates or a partner: who owes what this month?", "Who Owes What: Shared Bills Explained", "Splitting Bills", "tiles", "lilac", 1, "split-bills-with-a-partner-or-roommate", "A printable statement shows what is settled and what is still owed, so the conversation is about numbers, not memory."],
  ["Squared up last time, or still owed? Settle it in writing.", "Shared Bill Statement: Settled or Still Owed", "Splitting Bills", "stack", "peach", 2, "split-bills-with-a-partner-or-roommate", "The printable statement says what has and has not been squared up, before the next bill is due."],
  ["Splitting bills feels awkward until there is a clear record.", "Splitting Bills Without the Awkward Talk", "Splitting Bills", "margin", "sage", 0, "split-bills-with-a-partner-or-roommate", "A written record keeps the money part simple, so the rest of the relationship can stay simple too."],
  ["What does a normal month look like once everything is counted?", "A Typical Month, Laid Out Line by Line", "Money Organization", "card", "mint", 1, "how-to-budget-for-beginners", "The companion writes out a typical month from what you recorded: what comes in, what goes out, what goes toward each goal, and what is left."],
  ["You earn enough, so why does the month still feel tight?", "Why the Month Feels Tight Even With Good Pay", "Money Organization", "tiles", "sky", 2, "how-to-budget-for-beginners", "Counting everything once shows where the money really goes, including the bills you forgot about."],
  ["The bill that comes once a year always catches you out.", "Sinking Funds for Once-a-Year Bills", "Sinking Funds and Savings Goals", "stack", "butter", 0, "sinking-funds-explained", "A sinking fund turns a yearly bill into a small monthly amount, so it arrives without a panic."],
  ["Where does the money go before you even see it?", "Money That Leaves Before Payday", "Money Organization", "margin", "lilac", 1, "what-to-check-before-each-direct-debit-date", "Direct debits and bills leave before payday, and the picture shows exactly which ones before they do."],
  ["You don't trust a number you can't see the math behind.", "Money App Numbers You Can Check Line by Line", "Money Organization", "card", "peach", 2, "how-much-of-your-money-is-actually-safe-to-spend", "Every figure has a How Draftpace got this breakdown, built from your own records, line by line."],
  ["Do you have to hand over your bank password to get a clear picture?", "Money Tracker With No Bank Login", "Money Organization", "tiles", "mint", 0, "organize-your-finances-from-scratch", "You enter your own numbers. Nothing reads your bank account, your card or your login, because there is no connection to read them through."],
  ["You want a clear picture, not someone telling you how to spend.", "Money Picture Without Financial Advice", "Money Organization", "stack", "sky", 1, "50-30-20-rule-where-it-breaks", "The companion shows the picture and one useful next move. The decisions stay yours."],
  ["Another money app you'll stop opening in a month?", "A Money App You Will Keep Opening", "Money Organization", "margin", "blush", 2, "why-budgeting-apps-stop-working-after-two-months", "It opens on one next action, worked out from what is actually missing in your records, not a list that demands a full review first."],
  ["Seven areas sounds like a lot of setup before it's useful.", "Start a Money Tracker With What You Have", "Money Organization", "card", "butter", 0, "organize-your-finances-from-scratch", "Add the accounts, bills and income you have now and skip the rest. Add more later from settings without starting over."],
  ["Do you pay monthly for a tool you'll use twice?", "One-Time Money Tool, No Subscription", "Money Organization", "tiles", "lilac", 1, "financial-binder-what-to-include", "Personal Finance Companion is a one-time purchase at $49. You keep it, with no monthly fee."],
  ["Your money info lives in your phone, your head and a spreadsheet nobody trusts.", "One Place for Accounts, Bills and Debt", "Money Organization", "stack", "mint", 2, "financial-binder-what-to-include", "Accounts, income, bills, subscriptions, transactions, debt and savings in one picture, with exactly one next move."],
  ["Your numbers should stay private and follow you to any device.", "Private Money Records on Any Device", "Money Organization", "margin", "sage", 0, "financial-binder-what-to-include", "Your entries are tied to your sign-in and saved as you go, so they are there on whatever device you use next."],
  ["A printable book for the money you can hold in your hands.", "Printable Money Book for Bills and Goals", "Money Organization", "card", "peach", 1, "financial-binder-what-to-include", "Pair the app with a printable money book for the pages you want on paper, filled in by hand."],
  ["Paper for the bills, screen for the numbers. Both, please.", "Printable Monthly Bill Pages", "Bills and Subscriptions", "tiles", "sky", 2, "monthly-bills-list", "Print the bill pages for the month and tick them off on paper, then update the app with the same numbers."],
  ["What should you do next, when everything feels urgent?", "The Next Money Move, One at a Time", "Money Organization", "stack", "butter", 0, "why-budgeting-apps-stop-working-after-two-months", "The companion gives one next action at a time, so the list never piles up into something you avoid."],
  ["You don't need another to-do list. You need the next useful move.", "One Next Money Action, Not a Long To-Do List", "Money Organization", "margin", "blush", 1, "how-to-start-over-after-budget-failure", "One next action, worked out from your own records, so the month stops feeling like a list of chores."],
  ["Your income comes in at different times, and the bills don't wait.", "Irregular Income: Count It When It Lands", "Money Organization", "card", "lilac", 2, "how-to-budget-with-irregular-income", "Record income you expect and count it when it is received, so the month reflects money you actually have."],
  ["Freelance or irregular pay? Count it when it lands.", "Freelance Income in Your Money Picture", "Money Organization", "tiles", "mint", 0, "how-to-budget-with-irregular-income", "Income sources can be expected or received, so what you can spend reflects money that has arrived."],
  ["Five accounts, five balances, and no single number that's yours.", "All Your Accounts in One Money Picture", "Money Organization", "stack", "sky", 1, "available-balance-vs-current-balance", "Accounts, debts and savings sit side by side, so one number reflects all of them."],
  ["Your bills are in your email, your calendar and your memory.", "Bills in One Place, Not Three", "Bills and Subscriptions", "margin", "peach", 2, "budget-for-variable-bills", "Every bill goes into one list with its amount and due date, so you see the month at a glance."],
  ["Bills that change every month make the budget feel like guessing.", "Budgeting for Bills That Change Each Month", "Bills and Subscriptions", "card", "sage", 0, "budget-for-variable-bills", "Mark a bill as varying and keep a realistic amount in the picture, not a guess."],
  ["You're starting from scratch, with one account and one bill.", "Money Tracking for Beginners", "Money Organization", "tiles", "butter", 1, "how-to-budget-for-beginners", "Begin with one account and one bill, then add the rest when you are ready."],
  ["Debt, savings and bills are all fighting for the same money.", "Balancing Debt, Savings and Bills", "Paying Down Debt", "stack", "lilac", 2, "50-30-20-rule-where-it-breaks", "The picture shows what is protected for bills and debt minimums before the rest is free for goals."],
  ["After a life change, you're not sure what changed in your money.", "Money Admin After a Life Change", "Money Organization", "margin", "blush", 0, "sort-out-your-finances-after-a-life-change", "A new job, a move or a separation changes bills and income. Update the records once and the picture follows."],
  ["Money you forgot to write down is still money you owe.", "Catching Forgotten Bills and Subscriptions", "Bills and Subscriptions", "card", "mint", 1, "how-to-find-every-subscription-you-are-paying-for", "A forgotten subscription is still a bill. Find each one, add it, and the picture shows the true monthly total."],
];

// ---------- Monthly Money Reset: 50 pins ----------
const MMR = [
  ["What can you actually spend this month, without doing the math?", "Safe to Spend This Month, Explained", "Safe to Spend Planning", "calendar", "butter", 0, "how-much-of-your-money-is-actually-safe-to-spend", "One Safe-to-Spend figure that updates as the month goes on, with no mental math. It is free, with no card."],
  ["Safe to spend: one number, updated as the month goes on.", "Safe-to-Spend Calculator, Free", "Safe to Spend Planning", "receipt", "sky", 1, "how-much-of-your-money-is-actually-safe-to-spend", "Monthly Money Reset works out what is free to spend from your balance and bills. It is free, with no card and no trial."],
  ["Bills you haven't paid yet still feel like money you have.", "Protected Bills: Money You Owe", "Safe to Spend Planning", "strip", "sage", 2, "you-missed-a-payment-what-to-do-next", "Protected bills stay held back whether they are paid or not, so the number never assumes money you owe."],
  ["Protected bills stay held back, so the number never assumes money you owe.", "Protected Bills Stay Out of the Spendable Number", "Safe to Spend Planning", "big", "peach", 0, "you-missed-a-payment-what-to-do-next", "Bills you have marked stay protected in the figure, so the number you see is the one you can really use."],
  ["Your month looks fine on average and still goes wrong on one day.", "The Tightest Day of the Month", "Safe to Spend Planning", "calendar", "lilac", 1, "end-of-month-money-review", "The tightest day this cycle is named with its date and the amount you would be down to, worked out from the dates you entered."],
  ["The tightest day this cycle, named, with the date and the amount.", "Find Your Tightest Day Before It Arrives", "Safe to Spend Planning", "receipt", "mint", 2, "end-of-month-money-review", "Know the day your money runs lowest, before it happens, and the amount that day would leave you with."],
  ["Payday is Friday and rent is Thursday. Will you make it?", "Rent Due Before Payday: Will You Make It?", "Monthly Budget Reset", "strip", "blush", 0, "how-to-budget-with-irregular-income", "Enter the bill dates and the payday, and the tightest day shows whether the gap is covered."],
  ["Income you're expecting only counts once it actually lands.", "Expected Income Counts Once It Lands", "Monthly Budget Reset", "big", "sky", 1, "how-to-budget-with-irregular-income", "Income you expect is held out of Safe-to-Spend until you mark it received, so a paycheck still on its way cannot spend itself."],
  ["A bonus that hasn't arrived yet shouldn't spend itself.", "Bonus Money Held Until It Arrives", "Monthly Budget Reset", "calendar", "butter", 2, "how-to-budget-with-irregular-income", "Expected money waits in the background until it is received, so the number you spend from is always real."],
  ["Freelance month, uneven pay: which number is real?", "Freelance Pay and the Safe-to-Spend Number", "Monthly Budget Reset", "receipt", "sage", 0, "how-to-budget-with-irregular-income", "Count income when it lands, and the number reflects the money you have, not the money you hope is coming."],
  ["Staying on top of money turns into a chore by month two.", "Money Check-Ins That Don't Turn Into a Chore", "Money Check-ins", "strip", "lilac", 1, "why-budgeting-apps-stop-working-after-two-months", "A short weekly check-in keeps the picture accurate. There is no daily ritual and nothing to fall behind on."],
  ["A five-minute weekly check-in, not a full budget day.", "Five-Minute Weekly Money Check-In", "Money Check-ins", "big", "mint", 2, "end-of-month-money-review", "The weekly check-in asks a few short questions and confirms nothing is missing, then you are done for the week."],
  ["Missed a few weeks? You get one question, not a wall of overdue tasks.", "Back From Missed Weeks, Without the Pile-Up", "Money Check-ins", "calendar", "peach", 0, "how-to-start-over-after-budget-failure", "Leave it for a few weeks and you get one short question about what changed. No overdue wall, no lecture."],
  ["Coming back after a hard month without the guilt pile-up.", "Restart Your Money After a Hard Month", "Money Check-ins", "receipt", "butter", 1, "how-to-start-over-after-budget-failure", "After a rough month, you start from today's balance and the bills still coming, not from six weeks of catching up."],
  ["No scores, no streaks, nothing that says you're behind.", "A Money Tool With No Scores or Streaks", "Money Check-ins", "strip", "sky", 2, "why-budgeting-apps-stop-working-after-two-months", "Monthly Money Reset has no score and no streak. Nothing in it tells you that you are behind."],
  ["It's not a budget, so a rough month isn't a failed one.", "Not a Budget: Rough Months Are Not Failures", "Money Check-ins", "big", "lilac", 0, "50-30-20-rule-where-it-breaks", "It is not a budget. It shows what is safe to spend this month, and a rough month is simply a month with a smaller number."],
  ["Spent something, paid a bill, set money aside: in seconds.", "Quick Add for Everyday Money Moves", "Safe to Spend Planning", "calendar", "mint", 1, "end-of-month-money-review", "Quick Add records a spend, a paid bill or money set aside in seconds, so the number stays current without a big session."],
  ["Spending in the middle of the month, logged as it happens.", "Log Spending as It Happens", "Safe to Spend Planning", "receipt", "peach", 2, "how-to-save-money-fast", "Log each spend when it happens, and Safe-to-Spend moves with it, so the number is never a week out of date."],
  ["Money to set aside for a trip, without it getting spent by accident.", "Set Money Aside for a Trip", "Safe to Spend Planning", "strip", "sage", 0, "sinking-funds-explained", "Money you set aside stops counting as spendable, so the trip fund is protected from the everyday budget."],
  ["Spending groups that match how you actually live.", "Spending Groups That Fit Your Life", "Monthly Budget Reset", "big", "blush", 1, "budget-for-variable-bills", "Spending groups are yours to name and use, so the picture matches how you actually spend, not a template."],
  ["Unlimited bills, income and spending groups, with no paywall on the basics.", "Unlimited Bills and Income, Free", "Monthly Budget Reset", "calendar", "butter", 2, "how-to-budget-for-beginners", "Add as many bills, income sources and spending groups as you need. Monthly Money Reset is free."],
  ["Free means free: no card, no trial, no catch.", "Free Money Tool With No Card", "Monthly Budget Reset", "receipt", "sky", 0, "how-to-budget-for-beginners", "No card, no trial and no time limit. It is a complete, narrower tool, not a preview of a paid one."],
  ["You don't want to hand your bank password to a budgeting app.", "Budget App Without a Bank Login", "Monthly Budget Reset", "strip", "lilac", 1, "organize-your-finances-from-scratch", "You add the numbers yourself. Nothing reads your bank account, card or transactions."],
  ["A money tool that never reads your bank account.", "A Money Tool That Never Reads Your Bank", "Monthly Budget Reset", "big", "mint", 2, "organize-your-finances-from-scratch", "Your figures come from what you enter. There is no connection to your bank, so there is nothing to hand over."],
  ["A weekly spending guide, not a rule book.", "A Weekly Spending Guide, Not Rules", "Monthly Budget Reset", "calendar", "peach", 0, "how-to-budget-for-beginners", "A weekly guide shows roughly what you can spend each week. It is a guide, not a rule book."],
  ["One next action, not a list of twelve.", "One Next Money Action at a Time", "Monthly Budget Reset", "receipt", "sage", 1, "why-budgeting-apps-stop-working-after-two-months", "One recommended next action at a time, so the month never feels like a stack of tasks."],
  ["Finish the month, and carry the bills forward.", "Month Close With Bills Carried Forward", "Monthly Budget Reset", "strip", "butter", 2, "end-of-month-money-review", "Close the month when you are ready. Recurring bills carry into the next one, so you do not start from zero."],
  ["Recurring bills roll into next month, but spending starts fresh.", "Recurring Bills Roll Forward, Spending Resets", "Monthly Budget Reset", "big", "sky", 0, "end-of-month-money-review", "Bills that repeat carry into next month, while spending starts fresh. You keep the structure and lose the old noise."],
  ["You finished the month. What carries into the next one?", "What Carries Into Next Month", "Monthly Budget Reset", "calendar", "lilac", 1, "end-of-month-money-review", "A closing summary shows what carries forward, so the next month starts with the right numbers already in it."],
  ["The money you thought you had isn't the money you can spend.", "The Money You Can Really Spend", "Safe to Spend Planning", "receipt", "blush", 2, "available-balance-vs-current-balance", "Safe-to-Spend removes what is already spoken for, so the figure is the money you can really use this month."],
  ["Your payday balance, and what's already spoken for.", "Payday Balance Minus What Is Spoken For", "Safe to Spend Planning", "strip", "mint", 0, "available-balance-vs-current-balance", "Protected bills and set-aside money come off your payday balance first, leaving the number you can spend."],
  ["Groceries, rent, fun money, all in one picture.", "Groceries, Rent and Fun Money in One Picture", "Monthly Budget Reset", "big", "peach", 1, "how-to-save-money-fast", "Spending groups keep groceries, rent and fun money in one picture, so you can see which one is running low."],
  ["Groceries cost more than last month. Where's the room?", "Where to Find Room in the Grocery Budget", "Monthly Budget Reset", "calendar", "sage", 2, "how-to-save-money-fast", "Your grocery group shows how this month compares with the amount you planned, so you can see where the room is."],
  ["The car repair you keep putting off, and where the money comes from.", "Car Repair Money Set Aside Early", "Safe to Spend Planning", "receipt", "butter", 0, "sinking-funds-explained", "Set money aside for the repair so it is not a surprise, and the number you spend from stays honest."],
  ["The bills land before the pay does. Now what?", "When Bills Land Before Payday", "Safe to Spend Planning", "strip", "lilac", 1, "you-missed-a-payment-what-to-do-next", "The tightest-day view shows the gap before it happens, so you can move a payment or pause a purchase in time."],
  ["Is this purchase safe, or is it next month's rent?", "Is This Purchase Safe This Month?", "Safe to Spend Planning", "big", "sky", 2, "can-you-afford-it-before-you-buy-it", "Check the purchase against Safe-to-Spend before you buy, so next month's rent is not quietly spent today."],
  ["You can afford it on paper. Can you afford it this week?", "Can You Afford It This Week?", "Safe to Spend Planning", "calendar", "blush", 0, "can-you-afford-it-before-you-buy-it", "The weekly amount shows what is comfortable this week, not just what the month allows on paper."],
  ["Protecting your emergency money so it isn't spent by accident.", "Protect the Emergency Fund From Everyday Spending", "Safe to Spend Planning", "receipt", "mint", 1, "how-to-build-a-first-1000-emergency-fund", "Money held for emergencies stays out of the spendable figure, so a bad week does not dip into it by accident."],
  ["Stop guessing whether the month will hold.", "Will the Month Hold? See It Before Payday", "Safe to Spend Planning", "strip", "peach", 2, "how-much-of-your-money-is-actually-safe-to-spend", "The figure and the tightest day together answer whether the month holds, with the numbers you entered."],
  ["Your numbers stay in your account, on any device you sign in on.", "Money Numbers on Any Device", "Monthly Budget Reset", "big", "lilac", 0, "organize-your-finances-from-scratch", "Your figures are saved to your sign-in, so they are there on whatever device you use next."],
  ["Not a full budget system. One month at a time.", "One Month at a Time, Not a Budget System", "Monthly Budget Reset", "calendar", "butter", 1, "how-to-budget-for-beginners", "It works one month at a time, so you do not need a year-long plan to get through this one."],
  ["You don't need a year-long plan to get through this month.", "You Only Need This Month", "Monthly Budget Reset", "receipt", "sage", 2, "how-to-budget-for-beginners", "Get through this month with one clear number and one next move. The rest can wait."],
  ["Your partner asks what's safe to spend. You don't have a number to give.", "The Number to Share With Your Partner", "Splitting Bills", "strip", "blush", 0, "split-bills-with-a-partner-or-roommate", "One Safe-to-Spend figure gives you and your partner the same number to talk from."],
  ["Two incomes, one month, and nobody's sure which money is whose.", "Two Incomes, One Clear Number", "Splitting Bills", "big", "sky", 1, "split-bills-with-a-partner-or-roommate", "Income sources are tracked separately, so the shared figure reflects both incomes without confusion."],
  ["A bill came out early, and the month looks different now.", "When a Bill Comes Out Early", "Safe to Spend Planning", "calendar", "mint", 2, "what-to-check-before-each-direct-debit-date", "Enter the new date and the figure updates, so an early bill cannot surprise you at the end of the month."],
  ["A forgotten subscription is still protected in your numbers.", "Forgotten Subscriptions Still Count", "Bills and Subscriptions", "receipt", "peach", 0, "how-to-find-every-subscription-you-are-paying-for", "Recurring charges you have entered stay protected in the figure, so a forgotten subscription still gets counted."],
  ["What happens to the month if the car insurance renews early?", "Car Insurance Renews Early: The Month Changes", "Safe to Spend Planning", "strip", "lilac", 1, "what-to-check-before-each-direct-debit-date", "Change one date and the picture reflows, so you see the effect before the bill arrives."],
  ["The last week of the month is always the tight one. How tight?", "How Tight Is the Last Week of the Month?", "Safe to Spend Planning", "big", "butter", 2, "budget-for-variable-bills", "The tightest-day view names the low point in the final week, so you can plan around it instead of being surprised."],
  ["Your bank says one thing and your month says another.", "Why Your Bank Balance Isn't Your Spending Money", "Safe to Spend Planning", "calendar", "sage", 0, "available-balance-vs-current-balance", "Your bank balance and what you can spend are different numbers. Safe-to-Spend shows the second one."],
  ["Start the month with one number, and one next move.", "Start the Month With One Number", "Monthly Budget Reset", "receipt", "blush", 1, "how-to-start-over-after-budget-failure", "Start with one number and one next move, and add the rest as the month goes on."],
];

const PAL = {
  mint: { bg: "#dcf0e8", card: "#f5fbf8", ink: "#20392f", accent: "#3f7a63" },
  lilac: { bg: "#e9e3f6", card: "#f8f5fc", ink: "#33294a", accent: "#7d6aa6" },
  blush: { bg: "#fbe4e8", card: "#fef6f8", ink: "#4a2a33", accent: "#b46a7c" },
  peach: { bg: "#fde7d9", card: "#fff6ef", ink: "#4a3020", accent: "#c27a4f" },
  sky: { bg: "#e0ecf7", card: "#f4f9fd", ink: "#23364a", accent: "#5b82a8" },
  butter: { bg: "#faf1cf", card: "#fffbec", ink: "#4a4020", accent: "#b59a3c" },
  sage: { bg: "#e2ede2", card: "#f6faf6", ink: "#2c3e30", accent: "#6b8f72" },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const csvField = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csvRow = (vals) => vals.map(csvField).join(",") + "\r\n";
const TIME_SLOTS = [
  { time: "17:00:00", dayShift: 0 }, { time: "21:30:00", dayShift: 0 }, { time: "00:00:00", dayShift: 1 },
  { time: "04:00:00", dayShift: 1 }, { time: "06:00:00", dayShift: 1 },
];
const SLOT_COUNTS = [2, 3, 3, 3, 4];
const SLOT_SEQUENCE = TIME_SLOTS.flatMap((_, i) => Array(SLOT_COUNTS[i]).fill(i));
function isoDate(dayOffset, slotIndex) {
  const slot = TIME_SLOTS[slotIndex];
  const d = new Date();
  d.setDate(d.getDate() + 1 + dayOffset + slot.dayShift);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${slot.time}`;
}

async function dataUri(buf, mime) { return `data:${mime};base64,${buf.toString("base64")}`; }
async function findByPrefix(dir, prefix) {
  const m = (await readdir(dir)).find((f) => f.startsWith(prefix));
  if (!m) throw new Error(`no file ${prefix}* in ${dir}`);
  return path.join(dir, m);
}

// Crops the phone screen out of the MMR presentation frames. Those frames
// have a caption and the Draftpace mark around the phone; this keeps only
// the screen, so none of that framing shows on a pin.
async function mmrScreen(file) {
  const buf = await sharp(file).extract({ left: 607, top: 242, width: 386, height: 858 }).png().toBuffer();
  return dataUri(buf, "image/png");
}

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

function headSize(text) { return text.length < 40 ? 100 : text.length < 70 ? 86 : 74; }

function pageCss(fonts, pal) {
  return `*{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1000px;height:1500px;overflow:hidden;font-family:Plex,sans-serif}
    @font-face{font-family:Newsreader;src:url(${fonts.newsreader}) format('truetype');font-weight:400 800}
    @font-face{font-family:Plex;src:url(${fonts.plex}) format('truetype');font-weight:400 700}
    .cv{width:1000px;height:1500px;position:relative;overflow:hidden;background:radial-gradient(120% 90% at 85% 8%,#ffffff55 0%,transparent 60%),${pal.bg};color:${pal.ink}}
    .grain{position:absolute;inset:0;opacity:0.18;mix-blend-mode:multiply;pointer-events:none;z-index:1;background-image:${GRAIN}}
    .head{position:absolute;font-family:Newsreader;font-weight:700;letter-spacing:-0.02em;line-height:1.04;text-wrap:balance;z-index:8}
    .label{position:absolute;left:80px;top:70px;font-size:16px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${pal.accent};z-index:9}
    .foot{position:absolute;left:80px;right:80px;bottom:58px;display:flex;justify-content:space-between;font-size:15px;font-weight:600;color:${pal.ink};z-index:9;border-top:1.5px solid ${pal.accent};padding-top:16px}
    .card{position:absolute;background:${pal.card};border-radius:40px;box-shadow:0 34px 70px -34px rgba(40,30,30,0.32);z-index:4;overflow:hidden}
    .card img{position:absolute;display:block;width:100%;height:100%;object-fit:cover}
    .paper{position:absolute;background:#fff;border-radius:6px;box-shadow:0 46px 80px -30px rgba(40,30,30,0.35);z-index:4}
    .paper img{display:block;width:100%;height:auto;border-radius:6px}
    .dot{position:absolute;width:44px;height:44px;border-radius:12px;background:${pal.accent};opacity:0.18;z-index:2}`;
}

function pfcBody(p, s, pal) {
  const [head, , , layout, , scr] = p;
  const size = headSize(head);
  const h = (st) => `<div class="head" style="font-size:${size}px;color:${pal.ink};${st}">${esc(head)}</div>`;
  const screen = s.pfc[scr];
  const label = `<div class="label">WealthDrafts</div>`;
  const foot = `<div class="foot"><span>Personal Finance Companion, $49 once</span><span>Made by Draftpace, the maker of Personal Finance Companion.</span></div>`;
  const card = (st, extra = "") => `<div class="card" style="${st}">${extra}</div>`;
  const screenIn = (w, h2) => `<img src="${screen}" style="object-position:top">`;
  switch (layout) {
    case "card":
      return `${label}${h("left:80px;top:150px;right:80px")}
        ${card("left:110px;top:600px;width:780px;height:820px", screenIn())}${foot}`;
    case "tiles":
      return `${label}${h("left:80px;top:150px;right:80px")}
        ${card("left:70px;top:610px;width:430px;height:800px", screenIn())}
        ${card("left:520px;top:660px;width:410px;height:760px", `<img src="${s.pfc[(scr + 1) % 3]}" style="object-position:top">`)}${foot}`;
    case "stack":
      return `${label}${h("left:80px;top:150px;right:80px")}
        ${card("left:60px;top:640px;width:380px;height:760px;transform:rotate(-6deg)", `<img src="${s.pfc[(scr + 2) % 3]}" style="object-position:top">`)}
        ${card("left:280px;top:600px;width:420px;height:800px", screenIn())}
        ${card("left:560px;top:680px;width:360px;height:720px;transform:rotate(6deg)", `<img src="${s.pfc[(scr + 1) % 3]}" style="object-position:top">`)}${foot}`;
    case "margin":
      return `${label}<div class="head" style="left:80px;top:160px;width:430px;font-size:${Math.min(size, 80)}px;color:${pal.ink}">${esc(head)}</div>
        ${card("left:520px;top:520px;width:400px;height:880px", screenIn())}${foot}`;
    default:
      throw new Error(layout);
  }
}

function mmrBody(p, s, pal) {
  const [head, , , layout, , scr] = p;
  const size = headSize(head);
  const h = (st) => `<div class="head" style="font-size:${size}px;color:${pal.ink};${st}">${esc(head)}</div>`;
  const label = `<div class="label">WealthDrafts</div>`;
  const foot = `<div class="foot"><span>Monthly Money Reset, free</span><span>Made by Draftpace, the maker of Monthly Money Reset.</span></div>`;
  const dots = (x, y) => Array.from({ length: 28 }, (_, i) => {
    const col = i % 7, row = Math.floor(i / 7);
    const on = (i * 7 + 3) % 5 === 0;
    return `<div class="dot" style="left:${x + col * 58}px;top:${y + row * 58}px;opacity:${on ? 0.45 : 0.12}"></div>`;
  }).join("");
  const screen = s.mmr[scr];
  const img = (src) => `<img src="${src}" style="object-position:top">`;
  switch (layout) {
    case "calendar":
      return `${label}${h("left:80px;top:150px;right:80px")}
        ${dots(80, 1130)}
        ${`<div class="card" style="left:300px;top:520px;width:600px;height:0px"></div>`}
        ${card(pal, "left:330px;top:500px;width:420px;height:910px", img(screen))}${foot}`;
    case "receipt":
      return `${label}${h("left:80px;top:150px;right:80px")}
        <div class="paper" style="left:250px;top:500px;width:500px;height:900px;transform:rotate(-2deg);border-radius:0 0 18px 18px">
          <div style="position:absolute;left:0;right:0;top:-14px;height:28px;background:radial-gradient(circle at 14px 14px,${pal.bg} 13px,transparent 14px) 0 0/28px 28px repeat-x"></div>
          <img src="${screen}" style="position:absolute;left:58px;top:56px;width:384px;height:auto;border-radius:18px;object-position:top">
        </div>${foot}`;
    case "strip":
      return `${label}${h("left:80px;top:150px;right:80px")}
        ${card(pal, "left:60px;top:640px;width:280px;height:610px", img(s.mmr[0]))}
        ${card(pal, "left:360px;top:640px;width:280px;height:610px", img(s.mmr[1]))}
        ${card(pal, "left:660px;top:640px;width:280px;height:610px", img(s.mmr[2]))}${foot}`;
    case "big":
      return `${label}${h("left:80px;top:150px;right:80px")}
        ${card(pal, "left:250px;top:430px;width:500px;height:1080px", img(screen))}${foot}`;
    default:
      throw new Error(layout);
  }
}

// Shorthand used by both bodies; kept as a plain function so the markup
// reads the same across the two products.
function card(pal, style, inner) {
  return `<div class="card" style="${style};background:${pal.card}">${inner}</div>`;
}

async function main() {
  await mkdir(IMG_OUT, { recursive: true });
  await mkdir(CSV_OUT, { recursive: true });

  const fonts = {
    newsreader: await dataUri(await readFile(path.join(FONTS_DIR, "Newsreader.ttf")), "font/ttf"),
    plex: await dataUri(await readFile(path.join(FONTS_DIR, "IBMPlexSans.ttf")), "font/ttf"),
  };
  const s = { pfc: [], mmr: [] };
  for (let n = 0; n < 3; n++) {
    s.pfc.push(await dataUri(await readFile(await findByPrefix(SCREENS_DIR, `personal-finance-companion-${n}.`)), "image/png"));
  }
  const mmrFiles = [
    path.join(STORE_DIR, "monthly-money-reset-2-screen.webp"),
    path.join(STORE_DIR, "monthly-money-reset-3-screen.webp"),
    path.join(STORE_DIR, "monthly-money-reset-4-screen.webp"),
  ];
  for (const f of mmrFiles) s.mmr.push(await mmrScreen(f));

  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });

  // Interleave both products so each day carries a mix.
  const items = [];
  for (let i = 0; i < 50; i++) {
    items.push({ kind: "pfc", row: PFC[i], n: i + 1 });
    items.push({ kind: "mmr", row: MMR[i], n: i + 1 });
  }

  const rows = [];
  for (let i = 0; i < items.length; i++) {
    const { kind, row, n } = items[i];
    const [head, title, board, layout, palName, scr, slug, desc] = row;
    const pal = PAL[palName];
    const body = kind === "pfc" ? pfcBody(row, s, pal) : mmrBody(row, s, pal);
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${pageCss(fonts, pal)}</style></head><body><div class="cv">${body}<div class="grain"></div></div></body></html>`;
    await pg.setContent(html, { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    const png = await pg.screenshot();

    const prefix = kind;
    const num = String(n).padStart(2, "0");
    await sharp(png).resize(2000, 3000).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(IMG_OUT, `${prefix}-${num}.jpg`));

    const isPfc = kind === "pfc";
    const link = isPfc ? `${SITE}/guides/${slug}` : `${SITE}/guides/${slug}`;
    const utm = `utm_source=pinterest&utm_medium=organic_social&utm_campaign=${isPfc ? "wealthdrafts_pfc" : "wealthdrafts_mmr"}&utm_content=${prefix}-${num}`;
    const cta = isPfc ? "Read the guide, then see how Personal Finance Companion works." : "Read the guide, then get Monthly Money Reset free.";
    const disclosure = isPfc ? "Made by Draftpace, the maker of Personal Finance Companion." : "Made by Draftpace, the maker of Monthly Money Reset.";
    rows.push([
      title,
      `${SITE}/store/pinterest-wealthdrafts/${prefix}-${num}.jpg`,
      board,
      `${desc} ${cta} ${disclosure}`,
      `${link}?${utm}`,
      isoDate(Math.floor(i / PER_DAY), SLOT_SEQUENCE[i % PER_DAY]),
      "",
    ]);
    console.log(`${prefix}-${num}.jpg  [${layout}/${palName}]  ${head}`);
  }
  await browser.close();

  const header = ["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"];
  await writeFile(path.join(CSV_OUT, "combined-100.csv"), csvRow(header) + rows.map(csvRow).join(""), "utf8");
  console.log(`csv: marketing/pinterest/wealthdrafts/combined-100.csv (${rows.length} rows)`);
}

await main();
