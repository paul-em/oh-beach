/**
 * Hält das gewählte Datum (YYYY-MM-DD) mit dem URL-Query `?date=` synchron.
 * Macht die Belegungs-/Reservierungsansicht deep-linkbar und Back-Button-fähig.
 */
export function useDateParam() {
  const route = useRoute()
  const router = useRouter()

  const valid = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
  const date = ref(valid(route.query.date) ? route.query.date : viennaToday())

  watch(date, (d) => {
    router.replace({ query: { ...route.query, date: d } })
  })

  return date
}
