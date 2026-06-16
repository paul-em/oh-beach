import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    'nuxt-auth-utils',
  ],

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // shadcn-vue: Komponenten liegen unter app/components/ui (Nuxt-4-srcDir = app/)
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  // Server-seitige Secrets. Werte kommen aus NUXT_*-Umgebungsvariablen.
  // (Nuxt mappt z. B. NUXT_GOOGLE_SHEET_ID -> runtimeConfig.googleSheetId)
  runtimeConfig: {
    authTokenSecret: '',
    googleServiceAccountEmail: '',
    googlePrivateKey: '',
    googleSheetId: '',
    googleSheetTab: '',
    googleCalendarId: '',
    resendApiKey: '',
    emailFrom: '',
    public: {
      siteUrl: 'http://localhost:3000',
      // URL des bestehenden Google-Formulars für neue Mitglieder
      joinFormUrl: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      titleTemplate: '%s · O.H.BEACH',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'O.H.BEACH – der entspannteste Beachvolleyball-Verein. Infos, Mitgliedschaft und Platzreservierung.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
