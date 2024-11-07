import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const testimonials = [
  {
    name: "Armin Babaei",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1831477610414518272/s_7NZWub_400x400.jpg",
    handle: "@itsarminbabaei",
    verified: true,
    quote: "Hey 👋🏽 I'm Armin.",
  },
];

export function Testimonials() {
  return (
    <div className="relative pb-22">
      <h3 className="text-4xl mb-8 font-medium">What people say</h3>
      <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
    </div>
  );
}
