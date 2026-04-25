export type Collection = {
  id: string;
  title: string;
  designer: string;
  school: string;
  image: string;
  endsAt: number; // timestamp
  piecesLeft: number;
  priceFrom: number;
};

const now = Date.now();
const hours = (h: number) => now + h * 60 * 60 * 1000;

export const collections: Collection[] = [
  {
    id: "1",
    title: "Liminal",
    designer: "Mira Okonkwo",
    school: "Central Saint Martins",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80&auto=format&fit=crop",
    endsAt: hours(62),
    piecesLeft: 8,
    priceFrom: 180,
  },
  {
    id: "2",
    title: "Soft Architecture",
    designer: "Theo Laurent",
    school: "Parsons",
    image:
      "https://images.unsplash.com/photo-1485518882345-15568b007407?w=1200&q=80&auto=format&fit=crop",
    endsAt: hours(28),
    piecesLeft: 3,
    priceFrom: 240,
  },
  {
    id: "3",
    title: "Hinterland",
    designer: "Yuna Park",
    school: "Antwerp Royal Academy",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80&auto=format&fit=crop",
    endsAt: hours(50),
    piecesLeft: 12,
    priceFrom: 95,
  },
  {
    id: "4",
    title: "After Hours",
    designer: "Ines Romero",
    school: "Marangoni Milano",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=80&auto=format&fit=crop",
    endsAt: hours(14),
    piecesLeft: 2,
    priceFrom: 320,
  },
  {
    id: "5",
    title: "Paper Garden",
    designer: "Adaeze Igwe",
    school: "FIT New York",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80&auto=format&fit=crop",
    endsAt: hours(70),
    piecesLeft: 16,
    priceFrom: 140,
  },
  {
    id: "6",
    title: "Salt & Stone",
    designer: "Kai Mendel",
    school: "Bunka Tokyo",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80&auto=format&fit=crop",
    endsAt: hours(40),
    piecesLeft: 6,
    priceFrom: 210,
  },
];

export type Designer = {
  name: string;
  school: string;
  avatar: string;
  tagline: string;
};

export const designers: Designer[] = [
  {
    name: "Mira Okonkwo",
    school: "Central Saint Martins",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&auto=format&fit=crop",
    tagline: "Sculptural tailoring rooted in West African textile heritage.",
  },
  {
    name: "Theo Laurent",
    school: "Parsons",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop",
    tagline: "Architectural minimalism for the in-between hours.",
  },
  {
    name: "Yuna Park",
    school: "Antwerp Royal Academy",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop",
    tagline: "Soft deconstruction, wearable poetry.",
  },
];
