export type MapType = mapboxgl.Map;

export interface PlaneDetailsType {
  registration_number: string;
  model_name: string;
  model_code: string;
  miles_flown: string;
  engines_count: string;
  engines_type: string;
  plane_age: string;
  plane_status: string;
  description: string;
  airline: {
    name: string;
    code: string;
    country: string;
  };
}
