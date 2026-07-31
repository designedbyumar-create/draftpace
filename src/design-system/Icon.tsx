"use client";

import type {
  Icon as PhosphorIcon,
  IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import {
  Archive as PhosphorArchive,
  Article as PhosphorArticle,
  ArrowCounterClockwise as PhosphorArrowCounterClockwise,
  ArrowLeft as PhosphorArrowLeft,
  ArrowRight as PhosphorArrowRight,
  Bank as PhosphorBank,
  Barbell as PhosphorBarbell,
  Bell as PhosphorBell,
  BookOpen as PhosphorBookOpen,
  Books as PhosphorBooks,
  CalendarCheck as PhosphorCalendarCheck,
  CaretDown as PhosphorCaretDown,
  CaretRight as PhosphorCaretRight,
  ChatCircle as PhosphorChatCircle,
  Check as PhosphorCheck,
  CheckCircle as PhosphorCheckCircle,
  CheckSquare as PhosphorCheckSquare,
  Circle as PhosphorCircle,
  Clock as PhosphorClock,
  Compass as PhosphorCompass,
  CreditCard as PhosphorCreditCard,
  DeviceMobile as PhosphorDeviceMobile,
  Desktop as PhosphorDesktop,
  Download as PhosphorDownload,
  Envelope as PhosphorEnvelope,
  Fire as PhosphorFire,
  Flame as PhosphorFlame,
  Flower as PhosphorFlower,
  FloppyDisk as PhosphorFloppyDisk,
  GearSix as PhosphorGearSix,
  HandWaving as PhosphorHandWaving,
  Heart as PhosphorHeart,
  House as PhosphorHouse,
  LinkSimple as PhosphorLinkSimple,
  List as PhosphorList,
  Lightning as PhosphorLightning,
  Lock as PhosphorLock,
  LockKey as PhosphorLockKey,
  MagnifyingGlass as PhosphorMagnifyingGlass,
  Moon as PhosphorMoon,
  Minus as PhosphorMinus,
  Pause as PhosphorPause,
  Play as PhosphorPlay,
  Plus as PhosphorPlus,
  SealCheck as PhosphorSealCheck,
  Shield as PhosphorShield,
  ShieldCheck as PhosphorShieldCheck,
  SignOut as PhosphorSignOut,
  SlidersHorizontal as PhosphorSlidersHorizontal,
  Sparkle as PhosphorSparkle,
  SquaresFour as PhosphorSquaresFour,
  Stack as PhosphorStack,
  Star as PhosphorStar,
  Sun as PhosphorSun,
  Target as PhosphorTarget,
  Trash as PhosphorTrash,
  TrendUp as PhosphorTrendUp,
  Trophy as PhosphorTrophy,
  User as PhosphorUser,
  Wallet as PhosphorWallet,
  WarningCircle as PhosphorWarningCircle,
  WifiHigh as PhosphorWifiHigh,
  WifiX as PhosphorWifiX,
  X as PhosphorX,
} from "@phosphor-icons/react";

export type DraftpaceIconProps = Omit<PhosphorIconProps, "weight"> & {
  active?: boolean;
  filled?: boolean;
};

export type DraftpaceIcon = ComponentType<DraftpaceIconProps>;

function createIcon(BaseIcon: PhosphorIcon, displayName: string): DraftpaceIcon {
  const Icon = ({
    active = false,
    "aria-label": ariaLabel,
    color = "currentColor",
    filled = false,
    size = 16,
    ...props
  }: DraftpaceIconProps) => (
    <BaseIcon
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      color={color}
      focusable="false"
      size={size}
      weight={active || filled ? "fill" : "regular"}
      {...props}
    />
  );

  Icon.displayName = displayName;
  return Icon;
}

export const Archive = createIcon(PhosphorArchive, "Archive");
export const Article = createIcon(PhosphorArticle, "Article");
export const ArrowLeft = createIcon(PhosphorArrowLeft, "ArrowLeft");
export const ArrowRight = createIcon(PhosphorArrowRight, "ArrowRight");
export const BadgeCheck = createIcon(PhosphorSealCheck, "BadgeCheck");
export const Bank = createIcon(PhosphorBank, "Bank");
export const Barbell = createIcon(PhosphorBarbell, "Barbell");
export const Bell = createIcon(PhosphorBell, "Bell");
export const BookOpen = createIcon(PhosphorBookOpen, "BookOpen");
export const CalendarCheck = createIcon(PhosphorCalendarCheck, "CalendarCheck");
export const CaretDown = createIcon(PhosphorCaretDown, "CaretDown");
export const Check = createIcon(PhosphorCheck, "Check");
export const CheckCircle2 = createIcon(PhosphorCheckCircle, "CheckCircle2");
export const CheckSquare = createIcon(PhosphorCheckSquare, "CheckSquare");
export const ChevronRight = createIcon(PhosphorCaretRight, "ChevronRight");
export const Circle = createIcon(PhosphorCircle, "Circle");
export const Clock = createIcon(PhosphorClock, "Clock");
export const Compass = createIcon(PhosphorCompass, "Compass");
export const CreditCard = createIcon(PhosphorCreditCard, "CreditCard");
export const Desktop = createIcon(PhosphorDesktop, "Desktop");
export const Download = createIcon(PhosphorDownload, "Download");
export const Envelope = createIcon(PhosphorEnvelope, "Envelope");
export const Flame = createIcon(PhosphorFlame, "Flame");
export const Fire = createIcon(PhosphorFire, "Fire");
export const Flower = createIcon(PhosphorFlower, "Flower");
export const HandWaving = createIcon(PhosphorHandWaving, "HandWaving");
export const Heart = createIcon(PhosphorHeart, "Heart");
export const Home = createIcon(PhosphorHouse, "Home");
export const Landmark = createIcon(PhosphorBank, "Landmark");
export const Layers3 = createIcon(PhosphorStack, "Layers3");
export const Library = createIcon(PhosphorBooks, "Library");
export const LinkSimple = createIcon(PhosphorLinkSimple, "LinkSimple");
export const Lightning = createIcon(PhosphorLightning, "Lightning");
export const Lock = createIcon(PhosphorLock, "Lock");
export const LockKeyhole = createIcon(PhosphorLockKey, "LockKeyhole");
export const LogOut = createIcon(PhosphorSignOut, "LogOut");
export const Menu = createIcon(PhosphorList, "Menu");
export const MessageCircle = createIcon(PhosphorChatCircle, "MessageCircle");
export const Moon = createIcon(PhosphorMoon, "Moon");
export const Minus = createIcon(PhosphorMinus, "Minus");
export const Pause = createIcon(PhosphorPause, "Pause");
export const Play = createIcon(PhosphorPlay, "Play");
export const Plus = createIcon(PhosphorPlus, "Plus");
export const RotateCcw = createIcon(PhosphorArrowCounterClockwise, "RotateCcw");
export const Save = createIcon(PhosphorFloppyDisk, "Save");
export const Search = createIcon(PhosphorMagnifyingGlass, "Search");
export const Settings = createIcon(PhosphorGearSix, "Settings");
export const Shield = createIcon(PhosphorShield, "Shield");
export const ShieldCheck = createIcon(PhosphorShieldCheck, "ShieldCheck");
export const SlidersHorizontal = createIcon(PhosphorSlidersHorizontal, "SlidersHorizontal");
export const Smartphone = createIcon(PhosphorDeviceMobile, "Smartphone");
export const Sparkles = createIcon(PhosphorSparkle, "Sparkles");
export const SquaresFour = createIcon(PhosphorSquaresFour, "SquaresFour");
export const Star = createIcon(PhosphorStar, "Star");
export const Sun = createIcon(PhosphorSun, "Sun");
export const Target = createIcon(PhosphorTarget, "Target");
export const Trash2 = createIcon(PhosphorTrash, "Trash2");
export const TrendingUp = createIcon(PhosphorTrendUp, "TrendingUp");
export const Trophy = createIcon(PhosphorTrophy, "Trophy");
export const User = createIcon(PhosphorUser, "User");
export const Wallet = createIcon(PhosphorWallet, "Wallet");
export const WarningCircle = createIcon(PhosphorWarningCircle, "WarningCircle");
export const Wifi = createIcon(PhosphorWifiHigh, "Wifi");
export const WifiOff = createIcon(PhosphorWifiX, "WifiOff");
export const X = createIcon(PhosphorX, "X");
