import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import useLanguage from '../hooks/useLanguage.js';
import { useAuth } from '../hooks/AuthContext.jsx';

const categories = [
  ['quran', 'Quran', 'Read, study, and discover Quran-related learning resources.'],
  ['book', 'Books', 'Find written resources and educational material.'],
  ['audio', 'Audio', 'Explore spoken lessons, recitations, and other audio resources.'],
  ['video', 'Video', 'Learn through visual lessons and video resources.'],
  ['dhikr', 'Dhikr', 'Discover resources related to remembrance and reflection.'],
];

export default function AboutPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  async function signOut() { try { await logout(); } catch (error) { console.error('Logout failed:', error.message); } }

  return (
    <Layout className="app-shell interior-shell about-shell" language={language} onLanguageChange={setLanguage} onSignOut={signOut} t={t} user={user}>
      <section aria-labelledby="about-title" className="about-hero">
        <div aria-label="Mosque and Quran learning" className="about-hero-collage">
          <figure className="about-photo about-photo-primary">
            <img alt="National Mosque of Ghana in Accra." src="/images/mosque-hero.jpg" />
            <figcaption className="about-photo-credit">
              Mosque architecture by <a href="https://commons.wikimedia.org/wiki/User:Warmglow" target="_blank" rel="noreferrer">Warmglow</a>,
                <a href="https://commons.wikimedia.org/wiki/File:Architecture_National_Mosque_Kanda,_Accra_Ghana.jpg" target="_blank" rel="noreferrer"> source</a>,
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer"> CC BY-SA 4.0</a>.
            </figcaption>
          </figure>
          <div className="about-photo-column">
            <figure className="about-photo about-photo-secondary">
              <img alt="A Quran lesson taking place inside a mosque." loading="lazy" src="/images/quran-lesson.jpg" />
              <figcaption className="about-photo-credit">
                Quran lesson by <a href="https://commons.wikimedia.org/wiki/User:Dosseman" target="_blank" rel="noreferrer">Dosseman</a>,
                <a href="https://commons.wikimedia.org/wiki/File:Nişancı_Mehmet_Paşa_mosque_Quran_lesson_in_2015_9314.jpg" target="_blank" rel="noreferrer"> source</a>,
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer"> CC BY-SA 4.0</a>.
              </figcaption>
            </figure>
            <div className="about-image-message">
              <span className="eyebrow">OUR COMMUNITY</span>
              <p>Faith and knowledge bring us together.</p>
            </div>
          </div>
        </div>
        <div className="about-hero-copy">
          <span className="eyebrow">ABOUT US</span>
          <h1 id="about-title">Your trusted center for faith and community.</h1>
          <span aria-hidden="true" className="about-hero-divider" />
          <p>Muslim Islamic Center is a welcoming place for Muslims of every culture and background to connect through faith, learning, and community.</p>
          <ul className="about-hero-highlights">
            <li>Islamic resources for learning and reflection</li>
            <li>English, Amharic, and Afaan Oromoo access</li>
            <li>A respectful space to connect with the community</li>
          </ul>
          <Button as={Link} to="/contact">Contact our center <span aria-hidden="true">↗</span></Button>
        </div>
      </section>
      <section className="mission-grid">
        <article className="mission-card">
          <span className="mission-icon">◎</span>
          <span className="eyebrow">MISSION</span>
          <h2>Bring people together through faith and knowledge.</h2>
          <p>We welcome people to explore Islamic resources, share useful knowledge, and learn from the many cultures of the global Ummah.</p>
        </article>
        <article className="mission-card mission-card-green">
          <span className="mission-icon">⌖</span>
          <span className="eyebrow">VISION</span>
          <h2>A respectful space for Muslims everywhere.</h2>
          <p>Our hope is to make Islamic knowledge easier to discover and to celebrate the shared values that connect Muslims across languages and cultures.</p>
        </article>
      </section>
      <section className="about-section">
        <div className="section-heading">
          <div><span className="eyebrow">EXPLORE AND REFLECT</span><h2>Islamic resources for discovery</h2></div>
        </div>
        <div className="about-category-grid">
          {categories.map(([key, title, description]) => (
            <article className="about-category-card" key={key}>
              <span className="category-icon" aria-hidden="true">{title.slice(0, 1)}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </article>
          ))}
        </div>
      </section>
      <section className="language-section">
        <div><span className="eyebrow">MULTILINGUAL ACCESS</span><h2>Learn in the language that feels like home.</h2></div>
        <p>English, Amharic, and Afaan Oromoo titles and descriptions help more people find and understand shared resources. Contributors can include translated information where available.</p>
      </section>
      <section className="responsible-section">
        <span className="eyebrow">ACCESSIBLE. THOUGHTFUL. RESPONSIBLE.</span>
        <h2>Knowledge shared with care.</h2>
        <p>Muslim Islamic Center makes learning resources easier to discover and share. Contributors should share only resources they have permission to use, provide clear descriptions, and consider accessibility.</p>
        <Button as={Link} to="/library">Explore the content library →</Button>
      </section>
    </Layout>
  );
}
