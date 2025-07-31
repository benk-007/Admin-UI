export interface OccupancyModel {
  adults: number;
  children: { age: number; quantity: number }[];
}
