import type { Achievement } from "@/types";

export const achievements: Achievement[] = [
  {
    id: "first-contact",
    name: "FIRST CONTACT",
    description: "Entered the world.",
    icon: "01",
    unlockCondition: "first_visit",
  },
  {
    id: "dig-deeper",
    name: "DIG DEEPER",
    description: "Read three Chronicles.",
    icon: "02",
    unlockCondition: "chronicles_read_3",
  },
  {
    id: "southside-resident",
    name: "SOUTHSIDE RESIDENT",
    description: "Visit every current location page.",
    icon: "03",
    unlockCondition: "all_locations",
  },
  {
    id: "found-something",
    name: "FOUND SOMETHING",
    description: "Discover an Easter egg.",
    icon: "04",
    unlockCondition: "easter_egg",
  },
  {
    id: "day-one",
    name: "DAY ONE",
    description: "Listen to a featured release.",
    icon: "05",
    unlockCondition: "listen_featured",
  },
];
