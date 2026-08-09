import type { ProductCatalogEntry } from "@/product-framework/catalog";
import { personalFinanceCompanionDefinition } from "./definition";
import CompanionModule from "./components/companion/CompanionModule";
import WorkspaceModule from "./components/WorkspaceModule";
import SettingsModule from "./components/SettingsModule";
import SetupModule from "./components/SetupModule";
import AccountsModule from "./components/AccountsModule";
import IncomeModule from "./components/IncomeModule";
import BillsModule from "./components/BillsModule";
import SubscriptionsModule from "./components/SubscriptionsModule";
import TransactionsModule from "./components/TransactionsModule";
import DebtModule from "./components/DebtModule";
import SavingsModule from "./components/SavingsModule";
import SetupCentreModule from "./components/SetupCentreModule";
import AttentionModule from "./components/AttentionModule";
import RecordsModule from "./components/RecordsModule";

export const personalFinanceCompanionCatalogEntry: ProductCatalogEntry = {
  definition: personalFinanceCompanionDefinition,
  moduleComponents: {
    "personal-finance-companion.companion": CompanionModule,
    "personal-finance-companion.workspace": WorkspaceModule,
    "personal-finance-companion.settings": SettingsModule,
    "personal-finance-companion.setup": SetupModule,
    "personal-finance-companion.accounts": AccountsModule,
    "personal-finance-companion.income": IncomeModule,
    "personal-finance-companion.bills": BillsModule,
    "personal-finance-companion.subscriptions": SubscriptionsModule,
    "personal-finance-companion.transactions": TransactionsModule,
    "personal-finance-companion.debt": DebtModule,
    "personal-finance-companion.savings": SavingsModule,
    "personal-finance-companion.setup-centre": SetupCentreModule,
    "personal-finance-companion.attention": AttentionModule,
    "personal-finance-companion.records": RecordsModule,
  },
};
