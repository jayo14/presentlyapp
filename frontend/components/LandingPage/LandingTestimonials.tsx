import React from 'react';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      '"The level of precision Presently provides has completely transformed our faculty oversight. It\'s not just a tool; it\'s an editorial standard for data."',
    name: 'Dr. Alistair Thorne',
    role: 'Dean of Sciences, Oakhaven',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9COqM4fJRsMreUnVWeh12TR5PdxZdzG1I9fC6lFkKmkjk5_VCGgj2TzHp2Iazhal4OWk9nKEpCPLlrE-2rh_hW_a3uJgTpQrQSxu2w8K6FZmDQfj56CAYV8oJajR1hehYzwyhkLTxXQN5mrPfv27TeJfeq1sRoU4RdpmL_qO-91MfxFC_koJNIamvXbkodHlBGL8DCKouB9PHtB2_wPZrTbHEsBtKOJLAqMaRMWB0GQz0CvOn5ozoEzfPfGLw-n-GWXLC-4mKSdo',
  },
  {
    quote:
      '"Finally, a system that respects the sophistication of modern administrative needs. The real-time visual analytics are simply unparalleled."',
    name: 'Marcus Vane',
    role: "Registrar, St. Jude's",
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDto_i1wsGaAj6EdsEnBX_Kmgk-ZpJ7jv3fAkqmPvruCetikQTfZXaNtvX5YCvb4ukLcoW2xLjWarhnVBsXTaNAF1zLGHvlyXVnOwKHLp0USyjJtKm-NCPjZ9ShyUxTD16La9m5xD4pqS_oNM7iJ8ro8jGVXx6UbdvtaGsPATON6bLgbQ9oh09apBYh0nNK_EBtVap8YahyY-0XFMUw0Wa9vuSt5JsrawEp3e0Oej_QCwJG7YBuOemCGR7K5RhhEYtpnMYn2mIq-0g',
  },
  {
    quote:
      '"Integration was seamless. Our staff loves the mobile app companion, and the accuracy of the biometric sync is truly world-class."',
    name: 'Sarah Jenkins',
    role: 'COO, Global Academy',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj4c7d2--Y4NdiBDRXmMLJSwdxbKvJwC-eYht_x_5GUncR_KcPnLyKHyMq2aaQzVHyH05UIWPQpntoQcmJbsOU3TXHQsHwL7Jkm5yOVjvzwfjbmsMPg_T0AY3MRiD0yM_UM3SDMeYVzuDx3xEofVj91Bj2TMa1f88ub8nfoSE5D8vI_9GL6Gk5m1m1fcJPVuO3dHZCyfGJy8mXw-O98XWWPrfrB_X-cke8AY_MkX6SWjSoHUrnbFG-6ad0oBypOTx9oNbtVJplh5s',
  },
];

export const LandingTestimonials: React.FC = () => {
  return (
    <section style={{ background: 'var(--surface)', padding: '8rem 2rem' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span
            style={{
              display: 'block',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Institutional Trust
          </span>
          <h2
            className="font-headline"
            style={{
              fontSize: 'clamp(2rem,4vw,3.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--on-surface)',
            }}
          >
            Trusted by Leading Institutions
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {TESTIMONIALS.map(({ quote, name, role, img }) => (
            <div
              key={name}
              className="fade-up testimonial-card editorial-shadow"
              style={{
                background: 'var(--surface-container-low)',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(210,197,171,0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '2.5rem',
              }}
            >
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <Quote size={36} color="#ffca0d" />
                </div>
                <p
                  style={{
                    fontSize: '1.05rem',
                    color: 'var(--on-surface)',
                    lineHeight: 1.7,
                    fontStyle: 'italic',
                    fontWeight: 500,
                  }}
                >
                  {quote}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={img}
                  alt={name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    filter: 'grayscale(1)',
                    transition: 'filter 0.5s',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLImageElement).style.filter = 'grayscale(0)')}
                  onMouseLeave={(e) => ((e.target as HTMLImageElement).style.filter = 'grayscale(1)')}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
                    {name}
                  </p>
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--secondary)',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
