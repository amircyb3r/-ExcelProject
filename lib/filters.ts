export function getDateRange(searchParams: URLSearchParams) {
  const from = searchParams.get("from") ? new Date(searchParams.get("from") as string) : new Date(Date.now() - 24 * 3600 * 1000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to") as string) : new Date();
  return { from, to };
}
