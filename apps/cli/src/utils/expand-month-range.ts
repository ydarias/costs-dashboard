export function expandMonthRange(from: string, to: string): string[] {
  const [fromYear, fromMonth] = from.split('-').map(Number)
  const [toYear, toMonth] = to.split('-').map(Number)

  if (fromYear > toYear || (fromYear === toYear && fromMonth > toMonth)) {
    throw new Error(`--from (${from}) must not be after --to (${to})`)
  }

  const months: string[] = []
  let year = fromYear
  let month = fromMonth

  while (year < toYear || (year === toYear && month <= toMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return months
}
