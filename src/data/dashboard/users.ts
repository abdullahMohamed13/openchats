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
    avatar: "/images/characters/walter.png",
    badge: "/images/badges/knight-shield.webp",
    status: "online",
    title: "Team lead",
  },
  {
    id: "sarah-ahmed",
    name: "Sarah Ahmed",
    avatar: "/images/characters/arthur.jpg",
    status: "online",
    title: "Frontend",
  },
  {
    id: "mohamed-ali",
    name: "Mohamed Ali",
    avatar: "/images/characters/saul.png",
    status: "online",
    title: "Backend",
  },
  {
    id: "youssef-hassan",
    name: "Youssef Hassan",
    avatar: "/images/characters/kratos.jpg",
    status: "away",
    title: "Design",
  },
  {
    id: "omar-khaled",
    name: "Omar Khaled",
    avatar: "/images/characters/lalo.jpeg",
    status: "offline",
    title: "QA",
  },
  {
    id: "nour-eldeen",
    name: "Nour Eldeen",
    avatar: "/images/characters/john-snow.png",
    badge: "/images/badges/crown.webp",
    status: "online",
    title: "Core team",
  },
  {
    id: "menna-fawzy",
    name: "Menna Fawzy",
    avatar: "/images/characters/magnus.jpg",
    status: "away",
    title: "Media",
  },
  {
    id: "hazem-adel",
    name: "Hazem Adel",
    avatar: "/images/characters/abyusif.webp",
    status: "offline",
    title: "Hardware",
  },
];