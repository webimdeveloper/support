<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ clientData?.site_name || 'Dashboard' }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Welcome to your support portal</p>
        </div>
        <button
          @click="handleLogout"
          class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              activeTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'py-4 px-1 border-b-2 font-medium text-sm',
            ]"
          >
            {{ tab }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- CRO Tab -->
      <div v-if="activeTab === 'CRO'" class="space-y-6">
        <ClientDashboardTabCRO :pages="pages" />
      </div>

      <!-- Placeholder tabs -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-lg">{{ activeTab }} tab - Coming soon</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.client as string

const activeTab = ref('CRO')
const tabs = ['CRO', 'Site Health', 'Assets', 'Reports']
const clientData = ref<any>(null)
const pages = ref([
  {
    id: 1, name: 'Homepage', url: '/',
    tag: 'Trust / authority', tagColor: '#534AB7', tagBg: '#EEEDFE',
    intents: ['trustseeker', 'researcher', 'urgent'],
    goal: 'Route users to key destinations and build instant brand trust',
    cro: 'Hero with single primary CTA (Get Free Estimate), social proof strip with media logos and review count, 3 user-intent navigation paths (Prices / Doctors / Locations), 100% non-stock photography above the fold.',
    seo: 'Brand + medical tourism intent. Targets: dental work in Mexico, affordable dentist Mexico, Dayo Dental reviews.',
    kw: ['dayo dental', 'dental implants mexico', 'cheap dental work mexico', 'dentist los algodones'],
    schema: 'Organization, WebSite, FAQPage',
    cta: 'Get Free Estimate, See Prices, Find a Doctor',
  },
  {
    id: 2, name: 'Pricing + estimate calculator', url: '/prices',
    tag: 'Lead gen', tagColor: '#0F6E56', tagBg: '#E1F5EE',
    intents: ['researcher'],
    goal: 'Capture price-conscious leads via high-value lead magnet',
    cro: 'Multi-step Personalized Dental Estimate Quiz: Step 1 procedure type, Step 2 urgency and timeline, Step 3 contact capture. Comparison table vs US/CA prices. Sticky Get My Estimate CTA bar on scroll.',
    seo: 'High-intent pricing queries. Targets: dental implants cost Mexico, how much does a crown cost in Mexico.',
    kw: ['dental implants cost mexico', 'dental crown price mexico', 'veneers mexico price', 'all on 4 mexico cost'],
    schema: 'FAQPage, PriceSpecification',
    cta: 'Get My Personalized Estimate',
  },
  {
    id: 3, name: 'What is Dayo Dental (authority page)', url: '/about',
    tag: 'Trust / authority', tagColor: '#534AB7', tagBg: '#EEEDFE',
    intents: ['trustseeker'],
    goal: 'Convert skeptical visitors by controlling the trust narrative',
    cro: 'Single scrollable long-form page. Narrative flow: Problem (US dental costs) to Solution (Dayo model) to Proof (stats, media, certifications) to Action (CTA). Sticky side-nav with accordion sections for skimmability.',
    seo: 'Brand authority + safety concerns. Targets: is dental work in mexico safe, dayo dental reviews.',
    kw: ['is dental work in mexico safe', 'dayo dental reviews', 'affordable dental care abroad', 'dental tourism mexico'],
    schema: 'AboutPage, Organization, FAQPage',
    cta: 'See Our Doctors, Read Patient Stories',
  },
  {
    id: 4, name: 'Doctors directory', url: '/doctors',
    tag: 'Trust / authority', tagColor: '#534AB7', tagBg: '#EEEDFE',
    intents: ['trustseeker'],
    goal: 'Build individual doctor trust and drive profile page clicks',
    cro: 'Dynamic grid via Elementor Loop Builder and CPT/ACF. Filter by specialty and location. Real headshots (no stock). Each card: name, specialty, years of experience, star rating, View Profile CTA.',
    seo: 'Doctor and specialty queries. Targets: english speaking dentist los algodones, board certified dentist mexico.',
    kw: ['english speaking dentist mexico', 'certified dentist los algodones', 'dental specialist mexico'],
    schema: 'Physician, MedicalOrganization',
    cta: 'View Profile, Book with [Doctor Name]',
  },
  {
    id: 5, name: 'Single doctor profile', url: '/doctors/[name]',
    tag: 'Trust / authority', tagColor: '#534AB7', tagBg: '#EEEDFE',
    intents: ['trustseeker'],
    goal: 'Act as individual trust landing page and drive direct bookings',
    cro: 'Credentials and education section. Before/after photo gallery. Doctor-specific UGC reviews. Specialties with editable pricing blocks. Sticky booking CTA sidebar on desktop.',
    seo: 'Doctor-specific branded and specialty search terms.',
    kw: ['[doctor name] dentist mexico', '[specialty] dentist los algodones'],
    schema: 'Physician, Review, AggregateRating',
    cta: 'Book a Consultation with [Name]',
  },
  {
    id: 6, name: 'Services hub', url: '/services',
    tag: 'SEO / education', tagColor: '#854F0B', tagBg: '#FAEEDA',
    intents: ['researcher', 'trustseeker'],
    goal: 'SEO anchor page and visual entry point to all procedures',
    cro: 'Visual card grid of all procedures. Each card: icon, procedure name, 1-line benefit, price range link. Strong internal linking to all Service landing pages.',
    seo: 'Broad procedure queries. Targets: dental services in mexico, what dental work can I get in mexico.',
    kw: ['dental services mexico', 'dental implants mexico', 'veneers mexico', 'dentures mexico'],
    schema: 'MedicalClinic, Service',
    cta: 'Learn More, Get a Price Estimate',
  },
  {
    id: 7, name: 'Service landing pages', url: '/services/[procedure]',
    tag: 'Lead gen', tagColor: '#0F6E56', tagBg: '#E1F5EE',
    intents: ['researcher', 'urgent'],
    goal: 'Rank for high-intent procedure queries and convert to leads',
    cro: 'Consistent template: H1 with geo-intent keyword, price comparison table, doctor CTA block, procedure-specific UGC reviews, FAQ accordion, sticky bottom CTA bar.',
    seo: 'High-intent geo and procedure combos. Targets: dental implants los algodones, all on 4 tijuana cost.',
    kw: ['dental implants los algodones', 'all on 4 mexico', 'veneers tijuana', 'crowns nogales dentist'],
    schema: 'MedicalProcedure, FAQPage, AggregateRating',
    cta: 'Get My Free Estimate, Book a Consult',
  },
  {
    id: 8, name: 'Blog / educational articles', url: '/blog/[slug]',
    tag: 'SEO / education', tagColor: '#854F0B', tagBg: '#FAEEDA',
    intents: ['researcher', 'urgent'],
    goal: 'Capture top-of-funnel search traffic and convert via inline CTAs',
    cro: 'Readability-first layout. Inline Get a Free Estimate CTAs after key sections. Internal links to relevant Service LPs. AI-search optimised: FAQ schema and short direct answer at top of each article.',
    seo: 'Informational and mid-funnel queries. Targets: how much do dental implants cost, is it safe to get dental work in mexico.',
    kw: ['dental implants cost 2025', 'dental work mexico safety tips', 'emergency dentist mexico border', 'best dental implant brands'],
    schema: 'Article, FAQPage, BreadcrumbList',
    cta: 'Get a Free Estimate, Find a Doctor Near You',
  },
  {
    id: 9, name: 'Destinations + interactive map', url: '/destinations',
    tag: 'SEO / education', tagColor: '#854F0B', tagBg: '#FAEEDA',
    intents: ['researcher', 'urgent'],
    goal: 'Help users plan logistics and funnel to location-specific pages',
    cro: 'Interactive map embedded directly in page (not a separate URL). 3 location pins — each click scrolls to a location summary card with See All Clinics CTA. No external tool dependency.',
    seo: 'Location-based dental queries. Targets: los algodones dental, dentist near US mexico border.',
    kw: ['los algodones dental clinics', 'tijuana dental tourism', 'dentist near nogales az', 'dental work near san diego border'],
    schema: 'TouristDestination, LocalBusiness',
    cta: 'Explore [City] Clinics',
  },
  {
    id: 10, name: 'Location pages (x3)', url: '/destinations/[city]',
    tag: 'Lead gen', tagColor: '#0F6E56', tagBg: '#E1F5EE',
    intents: ['researcher', 'urgent'],
    goal: 'Localized SEO landing page and destination-specific conversion',
    cro: 'City-specific hero headline. Associated clinics and doctors grid. Local logistics section (flights, transport, accommodation). Localized patient reviews. Book at this location CTA.',
    seo: 'Hyper-local dental queries per city.',
    kw: ['los algodones dentist', 'tijuana dental implants', 'nogales mexico dentist', 'dentist algodones reviews'],
    schema: 'LocalBusiness, MedicalClinic, AggregateRating',
    cta: 'Book at This Location, See Local Doctors',
  },
  {
    id: 11, name: 'Reviews / UGC hub', url: '/reviews',
    tag: 'Trust / authority', tagColor: '#534AB7', tagBg: '#EEEDFE',
    intents: ['trustseeker'],
    goal: 'Maximum social proof — resolve final objections before booking',
    cro: 'Video testimonials first (autoplay muted). Photo galleries. Filter by procedure or location. Aggregate star rating summary. UGC reviews also exported as global Elementor component injected on Home, Doctor, and Service pages.',
    seo: 'Review and reputation queries.',
    kw: ['dayo dental reviews', 'dayo dental testimonials', 'is dayo dental legit', 'dayo dental patient results'],
    schema: 'Review, AggregateRating',
    cta: 'See All Testimonials, Book Now',
  },
  {
    id: 12, name: 'Emergency dental / urgent care', url: '/emergency-dental-mexico',
    tag: 'Urgent conversion', tagColor: '#993C1D', tagBg: '#FAECE7',
    intents: ['urgent'],
    goal: 'Capture urgent-need visitors and drive immediate contact',
    cro: 'Urgency signals above the fold (same-day appointments). Phone number and WhatsApp CTA immediately visible. Fast logistics guide to reach the border. Short rapid-callback form. Zero trust-building detours.',
    seo: 'Emergency and high-urgency dental queries.',
    kw: ['emergency dentist mexico', 'same day dental appointment mexico border', 'broken tooth dentist mexico', 'toothache dentist near border'],
    schema: 'EmergencyService, LocalBusiness',
    cta: 'Call Now, WhatsApp Us, Request Callback',
  },
  {
    id: 13, name: 'FAQ / support center', url: '/faq',
    tag: 'Support / retention', tagColor: '#185FA5', tagBg: '#E6F1FB',
    intents: ['researcher', 'trustseeker'],
    goal: 'Reduce pre-sales friction and deflect customer service volume',
    cro: 'Zendesk-style layout. Prominent search bar. Category tabs: Safety, Prices, Logistics, Aftercare. Top questions shown by default. Escalation path: Submit a ticket or Chat with us.',
    seo: 'Long-tail question queries.',
    kw: ['is it safe to get dental work in mexico', 'how does dayo dental work', 'what is included in dental implant package mexico'],
    schema: 'FAQPage, QAPage',
    cta: 'Submit a Ticket, Chat With Us',
  },
  {
    id: 14, name: 'In the news / press', url: '/press',
    tag: 'Trust / authority', tagColor: '#534AB7', tagBg: '#EEEDFE',
    intents: ['trustseeker'],
    goal: 'Establish authority — footer link only, not in main nav',
    cro: 'Short visual page: media logo strip, brief excerpts with links to original articles. Intentionally excluded from main nav to preserve navigation budget for conversion pages.',
    seo: 'Branded press and media queries.',
    kw: ['dayo dental news', 'dayo dental featured in', 'dental tourism press coverage'],
    schema: 'NewsArticle, Organization',
    cta: 'Read the Full Story (external links)',
  },
  {
    id: 15, name: 'Contact page', url: '/contact',
    tag: 'Lead gen', tagColor: '#0F6E56', tagBg: '#E1F5EE',
    intents: ['researcher', 'urgent', 'trustseeker'],
    goal: 'Final frictionless conversion point for direct inquiries',
    cro: 'Mobile-optimised short form: name, email, phone, procedure interest, preferred timeline. WhatsApp button prominently placed. Response time expectation: within 2 business hours. No distracting outbound links.',
    seo: 'Branded contact and consultation queries.',
    kw: ['dayo dental contact', 'free dental consultation mexico', 'get dental quote mexico'],
    schema: 'ContactPage',
    cta: 'Send Inquiry, WhatsApp Us',
  },
])

onMounted(async () => {
  // Load client data
  clientData.value = {
    slug: slug,
    site_name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Client`,
  }
})

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/')
}
</script>
