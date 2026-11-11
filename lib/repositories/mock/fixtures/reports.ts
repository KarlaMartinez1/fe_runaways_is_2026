import type {
  IncomeSummary,
  PropertyIncomeItem,
  PropertyOccupancyItem,
  PropertyRatingItem,
} from "@/lib/repositories/report-repository";

export const defaultIncomeSummaryFixture: IncomeSummary = {
  from: null,
  to: null,
  rentalIncome: "1100.00",
  retainedDepositIncome: "140.00",
  totalIncome: "1240.00",
};

export const propertyIncomeItemsFixture: PropertyIncomeItem[] = [
  {
    propertyId: "prop-01",
    title: "Quinta Las Cascadas",
    status: "DISPONIBLE",
    lastIncomeDate: "28/09/2026",
    rentalIncome: "600.00",
    retainedDepositIncome: "80.00",
    totalIncome: "680.00",
  },
  {
    propertyId: "prop-02",
    title: "Proyector y pantalla",
    status: "DISPONIBLE",
    lastIncomeDate: "15/09/2026",
    rentalIncome: "250.00",
    retainedDepositIncome: "40.00",
    totalIncome: "290.00",
  },
  {
    propertyId: "prop-03",
    title: "Cámara mirrorless",
    status: "ELIMINADO",
    lastIncomeDate: "10/10/2026",
    rentalIncome: "250.00",
    retainedDepositIncome: "20.00",
    totalIncome: "270.00",
  },
  {
    propertyId: "prop-04",
    title: "Dron con estuche",
    status: "DISPONIBLE",
    lastIncomeDate: null,
    rentalIncome: "0.00",
    retainedDepositIncome: "0.00",
    totalIncome: "0.00",
  },
];

export const propertyRatingItemsFixture: PropertyRatingItem[] = [
  {
    propertyId: "prop-01",
    title: "Quinta Las Cascadas",
    status: "DISPONIBLE",
    averageRating: 4.8,
    reviewCount: 12,
  },
  {
    propertyId: "prop-02",
    title: "Proyector y pantalla",
    status: "DISPONIBLE",
    averageRating: 4.5,
    reviewCount: 6,
  },
  {
    propertyId: "prop-03",
    title: "Cámara mirrorless",
    status: "ELIMINADO",
    averageRating: 4.2,
    reviewCount: 4,
  },
  {
    propertyId: "prop-04",
    title: "Dron con estuche",
    status: "DISPONIBLE",
    averageRating: null,
    reviewCount: 0,
  },
];

export const propertyOccupancyItemsFixture: PropertyOccupancyItem[] = [
  {
    propertyId: "prop-01",
    title: "Quinta Las Cascadas",
    status: "DISPONIBLE",
    occupiedDays: 13,
    periodDays: 30,
    occupancyRate: 43.3,
  },
  {
    propertyId: "prop-02",
    title: "Proyector y pantalla",
    status: "DISPONIBLE",
    occupiedDays: 9,
    periodDays: 30,
    occupancyRate: 30.0,
  },
  {
    propertyId: "prop-03",
    title: "Cámara mirrorless",
    status: "ELIMINADO",
    occupiedDays: 6,
    periodDays: 30,
    occupancyRate: 20.0,
  },
  {
    propertyId: "prop-04",
    title: "Dron con estuche",
    status: "DISPONIBLE",
    occupiedDays: 0,
    periodDays: 30,
    occupancyRate: 0.0,
  },
];
