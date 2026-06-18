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
    googleSheetTabExtra: '',
    googleCalendarId: '',
    resendApiKey: '',
    emailFrom: '',
    public: {
      siteUrl: 'http://localhost:3000',
      // URL des bestehenden Google-Formulars für neue Mitglieder
      joinFormUrl: 'https://docs.google.com/spreadsheets/d/1joL6gx3NSJeF7VvlSUm2j-re7mJB0-FvKDTmazSvlH0/edit?gid=1784728470#gid=1784728470',
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
        { name: 'theme-color', content: '#13283d' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
})
