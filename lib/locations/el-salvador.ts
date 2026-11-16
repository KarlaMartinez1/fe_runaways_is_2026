export type Department = {
  name: string;
  municipalities: string[];
};

export const departments: Department[] = [
  { name: "Ahuachapán", municipalities: ["Ahuachapán Norte", "Ahuachapán Centro", "Ahuachapán Sur"] },
  { name: "Santa Ana", municipalities: ["Santa Ana Norte", "Santa Ana Centro", "Santa Ana Este", "Santa Ana Oeste"] },
  { name: "Sonsonate", municipalities: ["Sonsonate Norte", "Sonsonate Centro", "Sonsonate Este", "Sonsonate Oeste"] },
  { name: "Chalatenango", municipalities: ["Chalatenango Norte", "Chalatenango Centro", "Chalatenango Sur"] },
  {
    name: "La Libertad",
    municipalities: [
      "La Libertad Norte",
      "La Libertad Centro",
      "La Libertad Oeste",
      "La Libertad Este",
      "La Libertad Costa",
      "La Libertad Sur",
    ],
  },
  {
    name: "San Salvador",
    municipalities: [
      "San Salvador Norte",
      "San Salvador Oeste",
      "San Salvador Este",
      "San Salvador Centro",
      "San Salvador Sur",
    ],
  },
  { name: "Cuscatlán", municipalities: ["Cuscatlán Norte", "Cuscatlán Sur"] },
  { name: "La Paz", municipalities: ["La Paz Oeste", "La Paz Centro", "La Paz Este"] },
  { name: "Cabañas", municipalities: ["Cabañas Oeste", "Cabañas Este"] },
  { name: "San Vicente", municipalities: ["San Vicente Norte", "San Vicente Sur"] },
  { name: "Usulután", municipalities: ["Usulután Norte", "Usulután Este", "Usulután Oeste"] },
  { name: "San Miguel", municipalities: ["San Miguel Norte", "San Miguel Centro", "San Miguel Oeste"] },
  { name: "Morazán", municipalities: ["Morazán Norte", "Morazán Sur"] },
  { name: "La Unión", municipalities: ["La Unión Norte", "La Unión Sur"] },
];

export function getMunicipalities(department: string) {
  return departments.find((item) => item.name === department)?.municipalities ?? [];
}