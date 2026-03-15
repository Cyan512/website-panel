export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-PE");
};
