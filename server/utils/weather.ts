/**
 * Wettervorhersage für den Platz via Open-Meteo (kostenlos, ohne API-Key).
 * Liefert pro Tag (YYYY-MM-DD) Höchst-/Tiefsttemperatur, Windspitze und eine
 * vereinfachte Wetter-Art ("kind") – sowie stündliche Werte, damit jeder
 * Buchungsslot sein eigenes Wetter zeigen kann. Das Frontend mappt "kind" auf
 * Icon und Hintergrund. Ein einzelner Request deckt das gesamte Vorlauf-Fenster
 * ab; das Ergebnis wird gecacht, damit Open-Meteo nicht bei jedem Seitenaufruf
 * getroffen wird.
 */

// Platz Offenhausen
const PLACE = { lat: 48.156858, lon: 13.838473 }

export type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

export interface DayWeather {
  date: string
  kind: WeatherKind
  tempMax: number
  tempMin: number
  windMax: number
  windy: boolean
}

export interface HourWeather {
  kind: WeatherKind
  temp: number
}

/** Tagesbündel: Tageswetter (für den Header) + Wetter je Stunde (für die Slots). */
export interface DayBundle {
  day: DayWeather | null
  hours: Record<number, HourWeather>
}

/** Ab dieser Windspitze (km/h) gilt ein Tag als windig (Beachvolleyball-relevant). */
const WINDY_KMH = 28

/** WMO-Wettercode → vereinfachte Art. Siehe open-meteo.com/en/docs (weather_code). */
function kindFromCode(code: number): WeatherKind {
  if (code === 0 || code === 1) return 'clear'
  if (code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 71 && code <= 77) return 'snow'
  if (code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  // 51–67 Niesel/Regen, 80–82 Regenschauer
  return 'rain'
}

interface OpenMeteoResponse {
  daily?: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    wind_speed_10m_max: number[]
  }
  hourly?: {
    time: string[]
    weather_code: number[]
    temperature_2m: number[]
  }
}

interface Forecast {
  days: Record<string, DayWeather>
  hours: Record<string, HourWeather> // Schlüssel: "YYYY-MM-DDTHH"
}

/**
 * Holt die Vorhersage (16 Tage, täglich + stündlich) von Open-Meteo. Gecacht für
 * 30 Minuten, damit wiederholte Kalender-Aufrufe nicht erneut die externe API
 * belasten.
 */
const fetchForecast = defineCachedFunction(
  async (): Promise<Forecast> => {
    const res = await $fetch<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
      query: {
        latitude: PLACE.lat,
        longitude: PLACE.lon,
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max',
        hourly: 'weather_code,temperature_2m',
        timezone: BOOKING.timeZone,
        forecast_days: 16,
      },
    })

    const days: Record<string, DayWeather> = {}
    const d = res.daily
    if (d) {
      for (let i = 0; i < d.time.length; i++) {
        const date = d.time[i]
        if (!date) continue
        const windMax = Math.round(d.wind_speed_10m_max[i] ?? 0)
        days[date] = {
          date,
          kind: kindFromCode(d.weather_code[i] ?? 3),
          tempMax: Math.round(d.temperature_2m_max[i] ?? 0),
          tempMin: Math.round(d.temperature_2m_min[i] ?? 0),
          windMax,
          windy: windMax >= WINDY_KMH,
        }
      }
    }

    const hours: Record<string, HourWeather> = {}
    const h = res.hourly
    if (h) {
      for (let i = 0; i < h.time.length; i++) {
        const t = h.time[i]
        if (!t) continue
        // "YYYY-MM-DDTHH:00" → Schlüssel "YYYY-MM-DDTHH"
        hours[t.slice(0, 13)] = {
          kind: kindFromCode(h.weather_code[i] ?? 3),
          temp: Math.round(h.temperature_2m[i] ?? 0),
        }
      }
    }

    return { days, hours }
  },
  {
    name: 'open-meteo-forecast',
    maxAge: 60 * 30, // 30 Minuten
    getKey: () => 'forecast',
  },
)

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Wetter für einen bestimmten Tag: Tageswerte + Stundenwerte (nach Stunde 0–23).
 * Bei Fehlern oder außerhalb des Vorhersagefensters wird leer zurückgegeben –
 * Wetter ist nur ein nettes Extra und darf den Kalender nie blockieren.
 */
export async function weatherForDate(dateStr: string): Promise<DayBundle> {
  try {
    const forecast = await fetchForecast()
    const hours: Record<number, HourWeather> = {}
    for (let hour = 0; hour < 24; hour++) {
      const hw = forecast.hours[`${dateStr}T${pad2(hour)}`]
      if (hw) hours[hour] = hw
    }
    return { day: forecast.days[dateStr] ?? null, hours }
  }
  catch {
    return { day: null, hours: {} }
  }
}
