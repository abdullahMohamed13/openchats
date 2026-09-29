export type UserStatus = "online" | "away" | "offline";

export interface MockUser {
  id: string;
  name: string;
  avatar: string;
  badge?: string;
  status: UserStatus;
  title?: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "you",
    name: "Mohamed Hassan",
    avatar: "/images/characters/waltuh.webp",
    badge: "/images/badges/knight-shield.webp",
    status: "online",
    title: "Team lead",
  },
  {
    id: "sarah-ahmed",
    name: "Sarah Ahmed",
    avatar: "/images/characters/spiderman.webp",
    status: "online",
    title: "Frontend",
  },
  {
    id: "mohamed-ali",
    name: "Mohamed Ali",
    avatar: "/images/characters/sonic.webp",
    status: "online",
    title: "Backend",
  },
  {
    id: "youssef-hassan",
    name: "Youssef Hassan",
    avatar: "/images/characters/kratos-3.webp",
    status: "away",
    title: "Design",
  },
  {
    id: "omar-khaled",
    name: "Omar Khaled",
    avatar: "/images/characters/black-sonic.webp",
    status: "offline",
    title: "QA",
  },
  {
    id: "nour-eldeen",
    name: "Nour Eldeen",
    avatar: "/images/characters/batman-2.webp",
    badge: "/images/badges/crown.webp",
    status: "online",
    title: "Core team",
  },
  {
    id: "menna-fawzy",
    name: "Menna Fawzy",
    avatar: "/images/characters/patrick.webp",
    status: "away",
    title: "Media",
  },
  {
    id: "hazem-adel",
    name: "Hazem Adel",
    avatar: "/images/characters/tom.webp",
    status: "offline",
    title: "Hardware",
  },
];