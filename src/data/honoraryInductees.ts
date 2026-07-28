export type HonoraryInductee = {
  slug: string;
  name: string;
  photo: string; // path relative to public/
  bio: string;
};

export const honoraryInductees: HonoraryInductee[] = [
  {
    slug: "pablo-sanchez",
    name: "Pablo Sanchez",
    photo: "/pablo-sanchez.png",
    bio: "Pablo Ramon Sanchez, also known as the Secret Weapon, is a spanish-speaking baseball player who is widely regarded as one of the greatest players in the Backyard Sports universe. An all-around incredible athlete, he excels at going yard, no matter what opposing pitchers have up their sleeve. He's no slouch in the outfield either, with a knack for tracking the ball and an absolute cannon of an arm to boot! It's no wonder that 93% of the HoPG community voted to induct him as an honorary member.",
  },
];
