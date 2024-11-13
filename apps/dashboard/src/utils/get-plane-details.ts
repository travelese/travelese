import { unstable_cacheLife as cacheLife } from "next/cache";

export async function getPlaneDetails(id: string) {
  "use cache";
  cacheLife("hours");
  return {
    registration_number: "N152FE",
    model_name: "Airbus A320",
    model_code: "A320",
    miles_flown: "300k",
    engines_count: "2",
    engines_type: "Turbofan",
    plane_age: "10",
    plane_status: "active",
    description:
      "The Airbus A320 is one of the most popular commercial aircraft models in the world, often used for short to medium-haul flights.",
    airline: {
      name: "Travelese Airways",
      code: "TRVS",
      country: "CA",
    },
  };
}
