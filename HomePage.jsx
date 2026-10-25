import { useState } from 'react';
import { Link } from 'react-router-dom';
import ContentGrid from '../components/content/ContentGrid.jsx';
import EmptyState from '../components/content/EmptyState.jsx';
import CategoryTabs from '../components/filters/CategoryTabs.jsx';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/AuthContext.jsx';
import useContents from '../hooks/useContents.js';
import useLanguage from '../hooks/useLanguage.js';

const programs = [
  {
    icon: '01',
    title: 'Islamic learning',
    description: 'Explore Quran, books, audio, and video shared for learning and reflection.',
    link: '/library',
    linkText: 'Browse the library',
  },
  {
    icon: '02',
    title: 'Family guidance',
    description: 'Reach out to ask about family support, counseling, and available services.',
    link: '/contact',
    linkText: 'Contact the center',
  },
  {
    icon: '03',
    title: 'Community care',
    description: 'Connect with the center to learn about current community initiatives.',
    link: '/contact',
    linkText: 'Get in touch',
  },
];

const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function HomePage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const contents = useContents();
  const [logoutError, setLogoutError] = useState('');

  async function handleSignOut() {
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message);
    }
  }

  return (
    <Layout
      className="app-shell home-shell"
      language={language}
      onLanguageChange={setLanguage}
      onSignOut={handleSignOut}
      t={t}
      user={user}
    >
      <section aria-labelledby="home-title" className="home-welcome">
        <figure className="home-welcome-image">
          <img
            alt="The National Mosque of Ghana, framed by arches."
            fetchPriority="high"
            src="/images/mosque-hero.jpg"
          />
          <figcaption>
            Mosque by <a href="https://commons.wikimedia.org/wiki/User:Warmglow" target="_blank" rel="noreferrer">Warmglow</a>,
            via <a href="https://commons.wikimedia.org/wiki/File:Architecture_National_Mosque_Kanda,_Accra_Ghana.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>,
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer"> CC BY-SA 4.0</a>.
          </figcaption>
        </figure>
        <div className="home-welcome-copy">
          <span className="home-overline"><span /> MUSLIM ISLAMIC CENTER</span>
          <h1 id="home-title">A welcoming place for <span>faith and community.</span></h1>
          <p>
            Find a place to learn, reflect, and connect. Muslims of every culture and background
            are welcome.
          </p>
          <div className="home-welcome-actions">
            <Button as={Link} className="home-action-primary" to="/about">Discover our center <span aria-hidden="true">→</span></Button>
            <Button as={Link} className="home-action-secondary" to="/library" variant="quiet">Explore Islamic resources</Button>
          </div>
          <span className="home-welcome-note">Learn together. Grow in faith. Serve with care.</span>
        </div>
      </section>

      <section aria-labelledby="prayer-title" className="home-prayer-section" id="prayer-times">
        <div className="home-prayer-copy">
          <span className="home-overline">DAILY WORSHIP</span>
          <h2 id="prayer-title">Make space for prayer.</h2>
          <p>
            Prayer times vary by location and date. Contact the center for the current local
            schedule.
          </p>
          <Link className="home-text-link" to="/contact">Ask about prayer times <span aria-hidden="true">→</span></Link>
        </div>
        <div aria-label="Daily prayers" className="home-prayer-card">
          <div className="home-prayer-card-heading">
            <span className="home-prayer-symbol" aria-hidden="true">☾</span>
            <div>
              <strong>Daily prayers</strong>
              <span>Check locally for today’s times</span>
            </div>
          </div>
          <ul>
            {prayerNames.map((name, index) => (
              <li key={name}>
                <span><span className="home-prayer-dot" aria-hidden="true" />{name}</span>
                <span className="home-prayer-order">0{index + 1}</span>
              </li>
            ))}
          </ul>
          <Link className="home-prayer-contact" to="/contact">Request the current schedule <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section aria-labelledby="programs-title" className="home-programs" id="services">
        <div className="home-section-heading">
          <div>
            <span className="home-overline">A PLACE TO CONNECT</span>
            <h2 id="programs-title">Explore our programs and services</h2>
            <p>Find resources, support, and ways to take part in community life.</p>
          </div>
          <Link className="home-text-link" to="/about">Learn about us <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-program-grid">
          {programs.map((program) => (
            <article className="home-program-card" key={program.title}>
              <span className="home-program-icon" aria-hidden="true">{program.icon}</span>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <Link to={program.link}>{program.linkText} <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="community-title" className="home-community" id="community">
        <figure className="home-community-image">
          <img
            alt="A Quran lesson taking place inside a mosque."
            loading="lazy"
            src="/images/quran-lesson.jpg"
          />
        </figure>
        <div className="home-community-copy">
          <span className="home-overline">ONE COMMUNITY, MANY CULTURES</span>
          <h2 id="community-title">Faith brings us together.</h2>
          <p>
            Build understanding through shared knowledge and a welcoming community. Learn in
            English, Amharic, or Afaan Oromoo.
          </p>
          <Link className="home-text-link" to="/about">More about our community <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section aria-labelledby="giving-title" className="home-giving" id="projects">
        <div className="home-giving-mark" aria-hidden="true">✦</div>
        <div>
          <span className="home-overline">COMMUNITY PROJECTS</span>
          <h2 id="giving-title">Help make a difference.</h2>
          <p>Contact the center to learn about current initiatives and verified ways to contribute.</p>
        </div>
        <Button as={Link} className="home-giving-button" to="/contact">Ask about supporting <span aria-hidden="true">→</span></Button>
      </section>

      <section aria-labelledby="events-title" className="home-events" id="events">
        <div className="home-section-heading">
          <div>
            <span className="home-overline">GATHER TOGETHER</span>
            <h2 id="events-title">Community events and learning</h2>
            <p>Get in touch for current event details and announcements.</p>
          </div>
          <Link className="home-text-link" to="/contact">Request event details <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-event-card">
          <span className="home-event-icon" aria-hidden="true">◇</span>
          <div>
            <h3>There’s a place for you here.</h3>
            <p>Ask the center about upcoming gatherings, learning opportunities, and ways to participate.</p>
          </div>
          <Button as={Link} to="/contact" variant="quiet">Contact the center</Button>
        </div>
      </section>

      <section className="home-resources" id="community">
        <div className="home-section-heading" id="resources">
          <div>
            <span className="home-overline">EXPLORE AND REFLECT</span>
            <h2>Islamic resources for discovery</h2>
            <p>Books, audio, video, and learning shared by our community.</p>
          </div>
          <Button as={Link} to="/library" variant="quiet">Browse all resources <span aria-hidden="true">→</span></Button>
        </div>
        {(contents.error || logoutError) && (
          <div className="notice" role="alert">
            <span>{contents.error || logoutError}</span>
            {contents.error && <Button className="retry-button" onClick={contents.refresh} type="button" variant="quiet">Retry</Button>}
          </div>
        )}
        <CategoryTabs value={contents.category} onChange={contents.chooseCategory} t={t} />
        {contents.loading
          ? <div aria-label="Loading resources" className="skeleton-grid"><div /><div /><div /></div>
          : contents.items.length
            ? <ContentGrid allowManage={false} items={contents.items} language={language} t={t} user={user} />
            : !contents.error && <EmptyState t={t} />}
      </section>
    </Layout>
  );
}
