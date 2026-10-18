/**
 * What people type into Pinterest search, per board, for Draftpace's own
 * pins (waves 2 to 5). The words on the pin and the original title and
 * description stay as written; this only decides how each pin is found:
 *
 * - `leads`: search phrases put in front of a title that has none of its
 *   board's search words in it ("Notes, Not Answers" becomes "Symptom
 *   Tracker: Notes, Not Answers"). Pinterest weighs the first words of a
 *   title most, and a hook alone matches no search.
 * - `fits`: narrower leads ("Medical Decision Maker"), used only on a pin
 *   whose own words share one of theirs.
 * - `terms`: the Keywords column, the phrases a searcher types, including
 *   what peaks in late October and November (holiday budget, winterizing,
 *   winter car prep, holiday travel) where the pin is truly about it.
 * - `line`: one sentence after the original description that says, in
 *   plain words, what someone searching would be looking for.
 *
 * Nothing here claims a feature: every phrase names the topic, not the
 * product, so a pin is never found for something it does not do.
 */
export type BoardSearch = { leads: string[]; terms: string[]; line: string; fits?: string[] };

export const BOARD_SEARCH: Record<string, BoardSearch> = {
  "Paperwork and Mail Pile": {
    leads: ["Paperwork Organization", "ADHD Organization", "How to Organize Mail"],
    terms: ["paperwork organization", "paper clutter", "mail organization", "adhd organization", "organize important papers", "declutter paperwork", "adhd tips for adults"],
    line: "Save this for the day the paper clutter wins: an ADHD-friendly way into paperwork organization that starts with one pile.",
  },
  "Doctor Appointment Prep and Questions": {
    leads: ["Doctor Appointment Prep", "Symptom Tracker", "Questions to Ask Your Doctor"],
    terms: ["doctor appointment prep", "questions to ask your doctor", "symptom tracker", "doctor visit checklist", "health journal", "medical appointment tips", "chronic illness organization"],
    line: "Save this before your next appointment: doctor visit prep, a simple symptom tracker and the questions to ask your doctor, all on paper.",
  },
  "Estate Planning Checklists for Beginners": {
    leads: ["Estate Planning Checklist", "Estate Planning for Beginners", "End of Life Planning"],
    fits: ["Beneficiary Checklist", "Update Your Beneficiary", "Medical Decision Maker", "Guardian for Children", "What to Do When Someone Dies"],
    terms: ["estate planning checklist", "estate planning for beginners", "beneficiary designation", "healthcare proxy", "legal guardian for children", "end of life planning", "what to do when someone dies", "adulting checklist"],
    line: "Estate planning for beginners, one plain question at a time. Save this to check your beneficiaries and the people you have named.",
  },
  "Packing Lists": {
    leads: ["Packing List", "Holiday Travel Packing List", "Carry On Packing List"],
    terms: ["packing list", "packing checklist", "carry on packing list", "family packing list", "holiday travel packing list", "travel essentials", "packing tips"],
    line: "Save this packing list for holiday travel, a week away or a carry-on only trip, sorted by person so nobody is forgotten.",
  },
  "Homeschool Requirements by State": {
    leads: ["Homeschool Requirements by State", "Homeschool Laws by State", "Homeschool Record Keeping"],
    terms: ["homeschool requirements by state", "homeschool laws", "homeschool record keeping", "notice of intent homeschool", "homeschool for beginners", "homeschool organization", "homeschool attendance"],
    line: "Homeschool requirements by state, in plain words: what your state asks you to keep, and the records that cover it.",
  },
  "Irregular Income Budgeting": {
    leads: ["Irregular Income Budget", "Variable Income Budgeting", "Budget for Freelancers"],
    terms: ["irregular income budget", "variable income budgeting", "budgeting for freelancers", "budget for commission income", "gig work budget", "budgeting tips", "how to budget"],
    line: "Save this if your pay changes every month: irregular income budgeting for freelance, tips, gig work and commission.",
  },
  "Home Maintenance Schedule": {
    leads: ["Home Maintenance Schedule", "Home Maintenance Checklist", "House Maintenance Schedule"],
    terms: ["home maintenance schedule", "home maintenance checklist", "house maintenance", "homeowner tips", "fall home maintenance checklist", "home organization", "home maintenance tracker"],
    line: "A home maintenance schedule that sorts what is wrong, what is due and what can wait. Save this before fall maintenance season gets away from you.",
  },
  "At the Repair Shop Checklists": {
    leads: ["Car Repair Tips", "What to Tell Your Mechanic", "Auto Repair Checklist"],
    terms: ["car repair tips", "auto repair shop", "mechanic tips", "car maintenance tips", "car repair estimate", "car tips for women", "car owner tips"],
    line: "Car repair tips for the moment you hand over the keys: what to tell your mechanic, and the most you will agree to without a call.",
  },
  "Bill Tracker Ideas": {
    leads: ["Bill Tracker", "Variable Bills Budget", "Monthly Bills Tracker"],
    terms: ["bill tracker", "monthly bills", "variable expenses", "budget for utilities", "bill organization", "budgeting tips", "holiday budget"],
    line: "Bill tracker ideas for electric, water and phone bills that never cost the same twice. Save this for winter, when utility bills swing.",
  },
  "Organize Your Finances": {
    leads: ["Organize Your Finances", "Financial Organization", "Get Your Finances Together"],
    terms: ["organize your finances", "financial organization", "money organization", "get your finances together", "personal finance tips", "end of year financial checklist", "financial planning"],
    line: "Save this to organize your finances when everything is scattered across apps, tabs and paper, before the end of the year.",
  },
  "Difficult Conversations": {
    leads: ["Phone Anxiety Tips", "How to Say No", "Difficult Conversations"],
    terms: ["phone anxiety", "how to say no", "difficult conversations", "adhd phone anxiety", "scripts for hard conversations", "adhd tips for adults", "boundaries"],
    line: "Save this for the call you keep putting off: phone anxiety tips, how to say no, and what to have ready before a difficult conversation.",
  },
  "Medication List and Health Record Templates": {
    leads: ["Medication List", "Medication Tracker", "Health Record Organization"],
    terms: ["medication list", "medication tracker", "health records", "medical binder", "caregiver organization", "medical information", "health organization"],
    line: "A medication list you can trust at the pharmacy or the doctor. Save this for keeping health records current for yourself or someone you care for.",
  },
  "Documents to Keep and Where to Keep Them": {
    leads: ["Important Documents Checklist", "Where to Keep Important Documents", "In Case of Emergency"],
    fits: ["Executor Checklist", "Pet Emergency Plan"],
    terms: ["important documents checklist", "where to keep important documents", "executor checklist", "estate planning", "in case of emergency binder", "life admin", "what to do when someone dies"],
    line: "Save this important documents checklist: where the will, the keys and the papers are, so the person who needs them can find them.",
  },
  "Travel Documents and Bookings Organizer": {
    leads: ["Travel Document Checklist", "Travel Organization", "Travel Documents Organizer"],
    terms: ["travel document checklist", "travel organization", "passport tips", "travel tips", "holiday travel tips", "international travel tips", "travel planning"],
    line: "Save this travel document checklist before holiday travel: what to carry, where to keep it, and what to do if your phone dies.",
  },
  "Homeschool Portfolio and Evaluation": {
    leads: ["Homeschool Portfolio", "Homeschool Evaluation", "Homeschool Records"],
    terms: ["homeschool portfolio", "homeschool evaluation", "homeschool records", "homeschool record keeping", "homeschool mid year review", "homeschool organization", "homeschool mom tips"],
    line: "What goes in a homeschool portfolio, and how to get ready for an evaluation. Save this for your mid-year review.",
  },
  "Weekly Money Check-in": {
    leads: ["Weekly Budget Check-in", "Weekly Money Routine", "Budgeting for Beginners"],
    terms: ["weekly budget check in", "money routine", "budgeting for beginners", "budgeting tips", "money habits", "how to budget", "holiday budget"],
    line: "A weekly money check-in short enough to keep doing. Save this for budgeting for beginners, and for keeping the holiday budget on track.",
  },
  "Subscription Tracker": {
    leads: ["Subscription Tracker", "Cancel Subscriptions", "Save Money on Subscriptions"],
    terms: ["subscription tracker", "cancel subscriptions", "save money tips", "monthly subscriptions", "budgeting tips", "annual renewal", "money saving tips"],
    line: "Save this subscription tracker idea to find every monthly charge, the renewal dates and where the cancel button hides.",
  },
  "Email You Keep Avoiding": {
    leads: ["How to Write a Hard Email", "Email Anxiety", "Follow Up Email Tips"],
    terms: ["email anxiety", "how to write an email", "follow up email", "adhd procrastination", "adhd tips for adults", "work email tips", "overwhelm"],
    line: "Save this for the email you have been avoiding: the first line, three checks before you send it, and how to follow up.",
  },
  "Couples Money": {
    leads: ["Couples Finances", "How to Split Bills", "Roommate Bill Splitting"],
    terms: ["couples finances", "how to split bills", "splitting bills with roommates", "money tips for couples", "shared expenses", "budgeting tips", "holiday expenses"],
    line: "How couples and roommates split bills without keeping score. Save this for shared expenses, holiday costs included.",
  },
  "Task Paralysis Help": {
    leads: ["ADHD Task Paralysis", "Task Paralysis Tips", "How to Get Started"],
    terms: ["adhd task paralysis", "task paralysis", "adhd tips for adults", "executive dysfunction", "how to stop procrastinating", "adhd productivity", "overwhelm"],
    line: "ADHD task paralysis help for the next ten minutes, not the whole list. Save this for the day starting feels impossible.",
  },
  "Emergency Contact and Medical Information Sheets": {
    leads: ["Emergency Contact Sheet", "Emergency Information Card", "Medical Information Sheet"],
    terms: ["emergency contact list", "emergency information sheet", "medical information card", "family emergency plan", "in case of emergency", "emergency preparedness", "family organization"],
    line: "Save this to make an emergency contact sheet and a small medical information card for a bag, a wallet or the fridge.",
  },
  "Emergency and In Case of Death Binder": {
    leads: ["In Case of Emergency Binder", "Life Admin Binder", "Emergency Binder"],
    terms: ["in case of emergency binder", "emergency binder", "life admin binder", "in case of death binder", "important documents organization", "estate planning", "family binder"],
    line: "What goes in an in case of emergency binder, so someone could find what they need. Save this and start the life admin binder this year.",
  },
  "Flight Delay and Hotel Problem Checklists": {
    leads: ["Flight Delay Tips", "Travel Problems", "Holiday Travel Tips"],
    terms: ["flight delay tips", "missed connection", "holiday travel tips", "hotel reservation problem", "travel hacks", "airport tips", "travel tips"],
    line: "Save this before holiday travel: what to do first when a flight is delayed or a hotel cannot find your reservation.",
  },
  "Homeschool Assessment at Home": {
    leads: ["Homeschool Assessment", "Homeschool Progress Check", "Homeschool Tips"],
    terms: ["homeschool assessment", "homeschool progress", "homeschool tips", "homeschool evaluation", "homeschool mid year review", "homeschool mom", "learning at home"],
    line: "How to check whether your child actually learned something, at home and marked by you. Save this for a mid-year homeschool check.",
  },
  "Stop Overspending": {
    leads: ["How to Stop Overspending", "Stop Impulse Buying", "Holiday Spending"],
    terms: ["stop overspending", "impulse buying", "can i afford it", "holiday spending", "christmas budget", "money saving tips", "budgeting tips"],
    line: "Save this before holiday shopping: how to stop overspending by checking what you can afford before you buy.",
  },
  "New Homeowner Checklist": {
    leads: ["New Homeowner Checklist", "First Time Home Buyer Tips", "New House Checklist"],
    terms: ["new homeowner checklist", "first time homeowner", "new house checklist", "homeowner tips", "moving into a new house", "home maintenance checklist", "house binder"],
    line: "A new homeowner checklist for the first week in a new house: what to write down before you forget it.",
  },
  "Used Car Buying and Selling Checklists": {
    leads: ["Used Car Checklist", "Buying a Used Car", "Used Car Maintenance"],
    terms: ["used car checklist", "buying a used car", "used car tips", "car maintenance checklist", "car service history", "car tips", "car owner tips"],
    line: "Bought a used car with no records? Save this used car checklist for the first week, and start the service history yourself.",
  },
  "Budget From Statements": {
    leads: ["Budget From Bank Statements", "Track Your Spending", "Budgeting Spreadsheet Alternative"],
    terms: ["track your spending", "bank statement budget", "budgeting spreadsheet", "budgeting for beginners", "where does my money go", "spending tracker", "end of year finances"],
    line: "Save this to turn a bank statement into a budget, and see where your money went this year without linking your bank.",
  },
  "Coming Back To Things": {
    leads: ["ADHD Unfinished Projects", "How to Restart a Project", "ADHD Motivation"],
    terms: ["adhd unfinished projects", "how to restart", "adhd motivation", "adhd tips for adults", "adhd productivity", "procrastination tips", "executive dysfunction"],
    line: "Save this for the project you gave up on: how to pick it back up without rebuilding it all in your head.",
  },
  "Medical Binder Printables": {
    leads: ["Medical Binder", "New Doctor Checklist", "Medical Binder Printables"],
    terms: ["medical binder", "medical binder printables", "new doctor appointment", "health records", "chronic illness binder", "medical history", "health organization"],
    line: "Save this medical binder idea for a new doctor or several specialists: your health history on one page.",
  },
  "Life Admin Binder Ideas": {
    leads: ["Life Admin Binder", "Life Admin Checklist", "Adulting Checklist"],
    terms: ["life admin", "life admin binder", "adulting checklist", "important documents", "life organization", "paperwork after divorce", "year end paperwork"],
    line: "Life admin binder ideas that skip what does not apply to you. Save this for after a move, a marriage, a baby or a separation.",
  },
  "International Travel Checklists": {
    leads: ["International Travel Checklist", "Travel Checklist", "Road Trip Checklist"],
    terms: ["international travel checklist", "travel checklist", "lost passport abroad", "road trip checklist", "holiday travel tips", "travel tips", "travel planning"],
    line: "Save this travel checklist for the night before, the road trip, or the day something goes missing abroad.",
  },
  "How to Start Homeschooling": {
    leads: ["How to Start Homeschooling", "Homeschool for Beginners", "New to Homeschooling"],
    terms: ["how to start homeschooling", "homeschool for beginners", "new to homeschooling", "homeschool records", "homeschool mom", "homeschool organization", "homeschool mid year"],
    line: "How to start homeschooling, paperwork first. Save this for homeschool for beginners, including starting mid-year.",
  },
  "Money Reset and Fresh Starts": {
    leads: ["Monthly Money Reset", "Budget Reset", "End of Month Money Review"],
    terms: ["money reset", "monthly budget reset", "end of month review", "budgeting tips", "financial fresh start", "holiday budget", "budget planner"],
    line: "A monthly money reset in ten minutes. Save this to close out October and November before the holiday budget starts.",
  },
  "Financial Binder Printables": {
    leads: ["Financial Binder", "Financial Binder Printables", "Money Binder"],
    terms: ["financial binder", "financial binder printables", "money binder", "budget binder", "finance organization", "end of year financial checklist", "personal finance"],
    line: "What goes in a financial binder and how often to update it. Save this for your end of year financial check.",
  },
  "Kind Systems That Survive Bad Weeks": {
    leads: ["ADHD Weekly Reset", "ADHD Planning System", "Weekly Reset Routine"],
    terms: ["adhd weekly reset", "weekly reset routine", "adhd planner", "adhd organization", "adhd tips for adults", "self compassion", "adhd productivity"],
    line: "An ADHD weekly reset that survives a bad week. Save this for a planning system that does not punish a missed week.",
  },
  "Family Health Binder Ideas": {
    leads: ["Family Medical Binder", "Health Binder Ideas", "Family Health Records"],
    terms: ["family medical binder", "health binder", "family health records", "medical binder", "health privacy", "family organization", "caregiver binder"],
    line: "Family medical binder ideas that keep private facts off the pages you hand over. Save this before you print the next one.",
  },
  "Budget Planner and Tracker": {
    leads: ["Budget Planner", "Monthly Budget", "Sinking Funds"],
    terms: ["budget planner", "monthly budget", "sinking funds", "50 30 20 budget", "budgeting for beginners", "christmas sinking fund", "budget tracker"],
    line: "Save this monthly budget idea: one page, sinking funds for the costs you can see coming, Christmas and annual bills included.",
  },
  "Bills and Dates": {
    leads: ["ADHD Bill Paying System", "Never Miss a Bill", "ADHD Time Blindness"],
    terms: ["adhd bill paying", "missed due dates", "adhd time blindness", "bill reminders", "adhd organization", "adhd tips for adults", "bill organization"],
    line: "Why you keep missing due dates, and an ADHD bill paying system that does not rely on remembering. Save this for time blindness days.",
  },
  "Caregiver Binder for Aging Parents and Kids": {
    leads: ["Caregiver Binder", "Caring for Aging Parents", "Sandwich Generation"],
    terms: ["caregiver binder", "caring for aging parents", "sandwich generation", "family medical binder", "caregiver organization", "elderly parent care", "family organization"],
    line: "A caregiver binder for aging parents and kids: everyone's facts on their own page. Save this before the holidays bring everyone together.",
  },
  "Family Vacation Planning": {
    leads: ["Family Vacation Planning", "Group Trip Planning", "Travel With Kids"],
    terms: ["family vacation planning", "group trip planning", "travel with kids", "traveling with a baby", "holiday travel with kids", "family packing list", "travel planning"],
    line: "Save this for family vacation planning and holiday travel with kids: group bookings, packing per child, and one place everyone can ask.",
  },
  "Four Day Homeschool Week": {
    leads: ["Four Day Homeschool Week", "Homeschool Schedule", "Homeschool Routine"],
    terms: ["four day homeschool week", "homeschool schedule", "homeschool routine", "homeschool planning", "homeschool mom", "homeschool burnout", "homeschool tips"],
    line: "How to set up a four day homeschool week, and what a short day looks like. Save this for homeschool burnout season.",
  },
  "Budget Reset Ideas": {
    leads: ["Budget Reset", "Restart Your Budget", "Budgeting for Beginners"],
    terms: ["budget reset", "restart budgeting", "budgeting for beginners", "budgeting tips", "fresh start", "holiday budget", "money reset"],
    line: "Fell off your budget? Save this budget reset to start again from today, in time for the holiday budget.",
  },
  "Seasonal Home Maintenance": {
    leads: ["Fall Home Maintenance Checklist", "Seasonal Home Maintenance", "Home Maintenance Calendar"],
    terms: ["fall home maintenance checklist", "seasonal home maintenance", "home maintenance calendar", "winterize house", "home maintenance by month", "homeowner tips", "house maintenance"],
    line: "Save this fall home maintenance checklist: the seasonal jobs that belong in October and November, month by month.",
  },
  "Vehicle Maintenance Log Printables": {
    leads: ["Car Maintenance Log", "Vehicle Maintenance Log", "Car Service Record"],
    terms: ["car maintenance log", "vehicle maintenance log", "car service record", "car maintenance printable", "selling a car", "car maintenance checklist", "car owner tips"],
    line: "A car maintenance log you can hand to a buyer. Save this to keep the service history straight, newest first.",
  },
  "Digital Estate and Account Lists": {
    leads: ["Digital Estate Planning", "Digital Legacy", "Password and Account List"],
    terms: ["digital estate planning", "digital legacy", "account list", "what happens to your accounts when you die", "estate planning checklist", "family photos backup", "life admin"],
    line: "Digital estate planning without writing passwords down. Save this to list your accounts, devices and photos for someone you trust.",
  },
  "Trip Itinerary Templates": {
    leads: ["Trip Itinerary", "Travel Itinerary Planner", "First International Trip"],
    terms: ["trip itinerary", "travel itinerary planner", "first international trip", "multi city trip", "time zones travel", "travel planning", "holiday travel"],
    line: "Save this trip itinerary idea for many stops on one page, with each place's time zone, and a first international trip checklist.",
  },
  "Homeschool Reading Log": {
    leads: ["Homeschool Reading Log", "Reading Log for Kids", "Homeschool Reading"],
    terms: ["homeschool reading log", "reading log for kids", "homeschool reading", "homeschool records", "reading list for kids", "homeschool mom", "raising readers"],
    line: "A homeschool reading log with room for the books they did not finish. Save this for raising readers who keep starting.",
  },
  "Travel Planner Printables and Templates": {
    leads: ["Travel Planner Printable", "Travel Planner", "Printable Itinerary"],
    terms: ["travel planner printable", "travel planner", "printable itinerary", "travel organization", "holiday travel", "trip planning", "travel tips"],
    line: "Save this travel planner idea: what to keep on paper when you travel, from a one-page trip card to a printable itinerary.",
  },
  "Homeschool Attendance": {
    leads: ["Homeschool Attendance", "Homeschool Attendance Tracker", "Homeschool Record Keeping"],
    terms: ["homeschool attendance", "homeschool attendance tracker", "homeschool record keeping", "homeschool days", "homeschool requirements", "homeschool organization", "homeschool mid year"],
    line: "Homeschool attendance: what to track and what is pointless. Save this to catch up on records before the end of the semester.",
  },
  "Emergency Fund Ideas": {
    leads: ["Emergency Fund", "How to Save Money", "Savings Plan"],
    terms: ["emergency fund", "how to save money", "savings plan", "save 1000 dollars", "money saving tips", "budgeting for beginners", "savings challenge"],
    line: "How to build your first $1,000 emergency fund. Save this savings plan for before the holiday spending starts.",
  },
  "Winterizing Your Home": {
    leads: ["Winterize Your House", "Winterizing Checklist", "Before the First Freeze"],
    terms: ["winterize house", "winterizing checklist", "winter home maintenance", "frozen pipes prevention", "fall home maintenance checklist", "homeowner tips", "home maintenance calendar"],
    line: "Save this winterizing checklist: the jobs to finish before the first freeze, so a pipe never bursts in January.",
  },
  "Car Maintenance Checklists": {
    leads: ["Car Maintenance Checklist", "Car Maintenance Schedule", "Car Maintenance by Mileage"],
    terms: ["car maintenance checklist", "car maintenance schedule", "car maintenance by mileage", "car care tips", "car owner tips", "oil change interval", "winter car maintenance"],
    line: "A car maintenance schedule by mileage, starting from your owner's manual. Save this before winter driving starts.",
  },
  "Homeschool Help": {
    leads: ["Homeschool Help", "Homeschool Struggles", "Homeschool Tips"],
    terms: ["homeschool help", "homeschool struggles", "homeschool tips", "homeschool burnout", "homeschool curriculum", "homeschool mom", "learning at home"],
    line: "Homeschool help for the subject that is not working: what to change first, and when to go back one step.",
  },
  "Bills and Subscriptions": {
    leads: ["Monthly Bills Budget", "Cancel Subscriptions", "Bill Budget"],
    terms: ["monthly bills budget", "cancel subscriptions", "bill tracker", "budget without bank link", "money saving tips", "holiday budget", "budgeting tips"],
    line: "Save this to protect bill money before you spend it, and find every subscription you are paying for before the holidays.",
  },
  "Home Maintenance Log": {
    leads: ["Home Maintenance Log", "Home Repair Log", "Home Maintenance Tracker"],
    terms: ["home maintenance log", "home repair log", "home maintenance tracker", "house binder", "homeowner tips", "home records", "house maintenance"],
    line: "A home maintenance log that keeps your house's history. Save this for what to write after every repair.",
  },
  "Seasonal Car Care": {
    leads: ["Winter Car Prep", "Winter Car Maintenance", "Winter Car Checklist"],
    terms: ["winter car prep", "winter car maintenance", "winter car checklist", "car battery cold weather", "winter tires", "car care tips", "car maintenance checklist"],
    line: "Save this winter car prep checklist: the battery, tires and wipers the cold is hard on, before the first freeze.",
  },
  "Appliance Care Tips": {
    leads: ["Furnace Filter Tips", "Appliance Maintenance", "Find Appliance Model Number"],
    terms: ["furnace filter size", "appliance maintenance", "appliance model number", "hvac filter", "homeowner tips", "home maintenance checklist", "furnace maintenance"],
    line: "Save this before heating season: write the furnace filter size and appliance model numbers down once, and stop guessing at the store.",
  },
  "Car Binder and Glove Box Organization": {
    leads: ["Glove Box Organization", "Car Binder", "Car Paperwork Organization"],
    terms: ["glove box organization", "car binder", "car paperwork", "car registration renewal", "car organization", "car maintenance tracker", "car owner tips"],
    line: "Save this for glove box organization and a car binder: registration, insurance and inspection dates for every car in the house.",
  },
  "Home Emergency Prep": {
    leads: ["Home Emergency Prep", "Main Water Shutoff", "Home Repair Tracker"],
    terms: ["home emergency preparedness", "main water shutoff", "home repair tracker", "homeowner tips", "frozen pipes", "home emergency plan", "house binder"],
    line: "Save this home emergency prep idea: find your main water shutoff now and write down who to call, before a winter pipe bursts.",
  },
  "Home Binder Printables": {
    leads: ["Home Binder", "Home Binder Printables", "House Binder"],
    terms: ["home binder", "home binder printables", "house binder", "home management binder", "home organization", "home maintenance printable", "homeowner tips"],
    line: "What to put in a home binder and what to leave out. Save this to make a home binder that stays useful.",
  },
  "Renter Tips": {
    leads: ["Renter Tips", "Rental Move In Checklist", "Apartment Move In Checklist"],
    terms: ["renter tips", "rental move in checklist", "apartment move in checklist", "security deposit tips", "first apartment", "renting tips", "lease tracker"],
    line: "Save this rental move-in checklist: what to photograph and document on day one, so the deposit comes back.",
  },
  "First Car Checklist": {
    leads: ["First Car Checklist", "New Driver Tips", "Teen Driver Checklist"],
    terms: ["first car checklist", "new driver tips", "teen driver", "car maintenance for beginners", "car maintenance log", "car owner tips", "winter driving tips"],
    line: "A first car checklist for new drivers: what to log from week one. Save this for a new driver before their first winter.",
  },
};

/** A title already found by its search words keeps them; this many characters is Pinterest's title limit. */
export const TITLE_LIMIT = 100;
export const DESCRIPTION_LIMIT = 500;
export const KEYWORD_LIMIT = 8;
