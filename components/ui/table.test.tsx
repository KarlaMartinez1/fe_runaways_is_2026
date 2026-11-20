import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  type TableColumn,
} from "./table";

describe("Table", () => {
  it("renderiza modo headers y rows con alineación y ancho", () => {
    render(
      <Table
        headers={[
          "Concepto",
          { label: "Monto", align: "right", width: "120px" },
        ]}
        rows={[
          ["Alquiler", "$100.00"],
          ["Depósito", "$50.00"],
        ]}
        striped
        bordered
      />
    );

    expect(screen.getByRole("columnheader", { name: "Concepto" })).toBeInTheDocument();
    const montoHeader = screen.getByRole("columnheader", { name: "Monto" });
    expect(montoHeader).toHaveStyle({ width: "120px" });
    expect(montoHeader.className).toContain("text-right");
    expect(screen.getByText("Alquiler")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("renderiza modo columns y data tipado con cell y fallback", () => {
    const columns: TableColumn[] = [
      { key: "name", header: "Nombre" },
      {
        key: "amount",
        header: "Total",
        align: "right",
        cell: (item) => `$${Number(item.amount).toFixed(2)}`,
      },
    ];

    const data: Record<string, unknown>[] = [{ id: "1", name: "Cámara", amount: 80 }];

    render(
      <Table
        columns={columns}
        data={data}
        keyExtractor={(item) => String(item.id)}
      />
    );

    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Cámara")).toBeInTheDocument();
    expect(screen.getByText("$80.00")).toBeInTheDocument();
  });

  it("muestra mensaje vacío por defecto y personalizado", () => {
    const { rerender } = render(<Table headers={["Columna"]} rows={[]} />);
    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();

    rerender(
      <Table
        headers={["Columna"]}
        rows={[]}
        emptyMessage="Sin registros encontrados"
      />
    );
    expect(screen.getByText("Sin registros encontrados")).toBeInTheDocument();
  });

  it("soporta composición declarativa con children", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Encabezado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Celda manual</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText("Encabezado")).toBeInTheDocument();
    expect(screen.getByText("Celda manual")).toBeInTheDocument();
  });
});
