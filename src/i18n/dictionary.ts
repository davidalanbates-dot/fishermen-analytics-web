import type { Locale } from './config'

/**
 * Interface text that is part of the design rather than CMS content.
 * BM entries are first drafts for the team to edit (agreed: Claude drafts, the team edits).
 */
export const dictionary = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      work: 'Work',
      about: 'About',
      insights: 'Insights',
      careers: 'Careers',
      contact: 'Contact',
    },
    main: 'Main',
    menu: 'Menu',
    closeMenu: 'Close',
    skip: 'Skip to content',
    startProject: 'Start a project',
    switchLanguage: 'BM',
    switchLanguageLabel: 'Baca dalam Bahasa Malaysia',
    kickers: {
      services: 'What we do',
      work: 'Selected work',
      awards: 'Recognition',
      clients: 'Clients',
      contact: 'Get in touch',
    },
    core: 'Our core',
    allCaseStudies: 'All case studies',
    allAwards: 'All awards',
    clientsIntro:
      'Across healthcare, retail, property, education and social causes, in Malaysia and Singapore.',
    sonarLabel: 'Fish finder · live',
    sonarAria: 'Sonar display showing featured results',
    game: {
      title: 'Cast for our services',
      text: 'Catch all seven in 30 seconds. Each catch tells you what we do.',
      play: 'Play',
      comingSoon: 'The game arrives in the next build step.',
      help: 'Arrow keys or mouse to steer · Space or click to cast',
      skip: 'Skip the game',
      caught: 'Caught',
    },
    result: { winner: 'Winner', finalist: 'Finalist', 'peoples-voice': "People's Voice" },
    withIntegrated: 'with Fishermen Integrated',
    shows: {
      mea: 'Marketing Excellence Awards',
      markies: 'MARKies Awards',
      webby: 'Webby Awards',
      other: '',
    },
    form: {
      sending: 'Sending…',
      error: 'Sorry, something went wrong. Please try again or email us.',
      required: 'Required',
    },
    footer: {
      family: 'Part of the Fishermen family, alongside',
      company: 'Company',
      services: 'Services',
      visit: 'Visit',
      awards: 'Awards',
    },
  },
  ms: {
    nav: {
      home: 'Utama',
      services: 'Perkhidmatan',
      work: 'Hasil Kerja',
      about: 'Tentang Kami',
      insights: 'Wawasan',
      careers: 'Kerjaya',
      contact: 'Hubungi',
    },
    main: 'Utama',
    menu: 'Menu',
    closeMenu: 'Tutup',
    skip: 'Langkau ke kandungan',
    startProject: 'Mulakan projek',
    switchLanguage: 'EN',
    switchLanguageLabel: 'Read in English',
    kickers: {
      services: 'Apa yang kami lakukan',
      work: 'Hasil kerja pilihan',
      awards: 'Pengiktirafan',
      clients: 'Pelanggan',
      contact: 'Hubungi kami',
    },
    core: 'Teras kami',
    allCaseStudies: 'Semua kajian kes',
    allAwards: 'Semua anugerah',
    clientsIntro:
      'Merentasi penjagaan kesihatan, peruncitan, hartanah, pendidikan dan kebajikan, di Malaysia dan Singapura.',
    sonarLabel: 'Pengesan ikan · langsung',
    sonarAria: 'Paparan sonar menunjukkan hasil pilihan',
    game: {
      title: 'Pancing perkhidmatan kami',
      text: 'Tangkap ketujuh-tujuhnya dalam 30 saat. Setiap tangkapan menerangkan apa yang kami lakukan.',
      play: 'Main',
      comingSoon: 'Permainan akan tiba dalam langkah pembinaan seterusnya.',
      help: 'Kekunci anak panah atau tetikus untuk mengemudi · Space atau klik untuk melontar',
      skip: 'Langkau permainan',
      caught: 'Ditangkap',
    },
    result: { winner: 'Pemenang', finalist: 'Finalis', 'peoples-voice': "People's Voice" },
    withIntegrated: 'bersama Fishermen Integrated',
    shows: {
      mea: 'Marketing Excellence Awards',
      markies: 'MARKies Awards',
      webby: 'Webby Awards',
      other: '',
    },
    form: {
      sending: 'Menghantar…',
      error: 'Maaf, berlaku ralat. Sila cuba lagi atau e-mel kami.',
      required: 'Wajib',
    },
    footer: {
      family: 'Sebahagian daripada keluarga Fishermen, bersama',
      company: 'Syarikat',
      services: 'Perkhidmatan',
      visit: 'Lawati',
      awards: 'Anugerah',
    },
  },
} satisfies Record<Locale, unknown>

export type Dictionary = (typeof dictionary)['en']
export const t = (locale: Locale): Dictionary => dictionary[locale]
