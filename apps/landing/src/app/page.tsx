import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@elymica/ui';

const stats = [
  { label: 'Schools', value: '2,547+', description: 'Primary & secondary' },
  { label: 'Students', value: '1.2M+', description: '15 African countries' },
  { label: 'Publishers', value: '320+', description: 'Marketplace ready' },
];

const pillars = [
  {
    title: 'K-12 LMS',
    body: 'Student, teacher, parent portals with attendance, grading, notifications.',
  },
  {
    title: 'Publisher Marketplace',
    body: 'Upload, monetize, and distribute curriculum-aligned content.',
  },
  {
    title: 'Tertiary Learning',
    body: 'University-ready workflows, offline modes, and research collaboration.',
  },
];

const testimonials = [
  {
    quote:
      'Elymica helped us digitize 38 schools in four weeks. Parents finally get real-time updates.',
    author: 'Grace Achieng • Director, Umoja Schools',
  },
  {
    quote: 'The publisher portal unlocked a new revenue stream for our teachers.',
    author: 'Kwame Boateng • Head of Curriculum, STEAM Lab Ghana',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-sand text-night">
      <section className="relative overflow-hidden bg-gradient-to-br from-sand via-white to-terracotta/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff80,transparent_60%)]" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-olive">Elymica</p>
            <h1 className="font-heading text-5xl leading-tight text-night md:text-6xl">
              The Shopify of Education
              <span className="block text-terracotta">for Africa</span>
            </h1>
            <p className="text-lg text-olive">
              Launch student, parent, teacher, and publisher experiences across 23 production-ready microservices. Built for low bandwidth, mobile-first schooling.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg">Request Demo</Button>
              <Button variant="secondary" size="lg">
                Get Started
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <Card key={item.label} className="border-none bg-white/80 shadow-lg shadow-sand/40">
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-olive">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <Card className="border-none bg-surface shadow-2xl shadow-terracotta/20">
              <CardHeader>
                <CardDescription>Live status</CardDescription>
                <CardTitle>Sahara-Japandi Design System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-olive">
                <p>✅ 23 backend microservices healthy</p>
                <p>✅ Auth + notifications wired for multi-tenant schools</p>
                <p>⚡ Sprint 3 goal: launch customer-facing experiences</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-none bg-white/90 shadow-lg shadow-sand/40">
              <CardHeader>
                <CardTitle>{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-olive">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author} className="border border-sage/20 bg-white/80 shadow-none">
              <CardContent className="space-y-4 p-6">
                <p className="text-lg italic text-night">“{testimonial.quote}”</p>
                <p className="text-sm text-olive">{testimonial.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
