// Typisierung der Login-Session (nuxt-auth-utils).
// Liegt unter shared/, damit sowohl der App- als auch der Server-Kontext sie sehen.
declare module '#auth-utils' {
  interface User {
    email: string
    name: string
    role: 'member' | 'admin'
    paid: boolean
  }
}

export {}
