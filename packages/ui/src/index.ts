// shared utilities
export { cn } from "./lib/utils";

// custom components — src/components/*
export {
  CategoryBadge,
  type CategoryBadgeProps,
  type TournamentCategory,
} from "./components/category-badge";
export { DashboardPage } from "./components/dashboard-page";
export {
  DateTimePicker,
  type DateTimePickerProps,
} from "./components/date-time-picker";
export { EmptyState } from "./components/empty-state";
export {
  DayMatches,
  KnockoutBracket,
  MatchCard,
  MatchRow,
  MatchScore,
  MatchStatusBadge,
  QualifiedBadge,
  Schedule,
  StandingsTable,
  TeamBadge,
  TeamCard,
  TeamList,
  TodayMatches,
  type KnockoutNode,
  type KnockoutRound,
  type MatchStatus,
  type MatchTeam,
  type StandingRow,
  type TournamentMatch,
  type TournamentTeam,
} from "./components/tournament";
export {
  ScheduleTable,
  ScheduleTableSkeleton,
  type ScheduleDay,
  type ScheduleGroup,
  type ScheduleMatch,
  type ScheduleTableProps,
  type ScheduleTableSkeletonProps,
} from "./components/schedule-table";

// shadcn primitives — src/ui/* — never edit manually
export { Button, buttonVariants } from "./ui/button";
export { Input } from "./ui/input";
export { Label } from "./ui/label";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "./ui/card";
export { Badge, badgeVariants } from "./ui/badge";
export { Toggle, toggleVariants } from "./ui/toggle";
export { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
export { RadioGroup, RadioGroupItem } from "./ui/radio-group";
export { Calendar, CalendarDayButton } from "./ui/calendar";
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
export { Separator } from "./ui/separator";
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./ui/breadcrumb";
export { Textarea } from "./ui/textarea";
export { Toaster } from "./ui/sonner";
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
export { Skeleton } from "./ui/skeleton";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./ui/dropdown-menu";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./ui/table";
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
} from "./ui/avatar";
