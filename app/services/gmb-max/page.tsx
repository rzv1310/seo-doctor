'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/data/services';

export default function GmbMaxServicePage() {
  const { isAuthenticated } = useAuth();
  const service = services.find(s => s.name === 'GMB MAX');

  if (!service) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Serviciu indisponibil</h2>
        <p className="text-text-secondary mb-6">Ne pare rău, dar serviciul solicitat nu este disponibil momentan.</p>
        <Link href="/" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md transition-colors">
          Înapoi la pagina principală
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Glow Effects */}
      <div className="relative overflow-hidden rounded-2xl mb-12 backdrop-blur-sm">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-accent opacity-10 blur-3xl rounded-full"></div>
        
        <div className="relative bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <span className="inline-block text-5xl mb-6">💎</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GMB MAX
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-6">
              GARANTAT TOP 3 ÎN GOOGLE MAP - SAU NU PLĂTEȘTI NIMIC!
            </p>
            <div className="max-w-3xl mx-auto">
              <p className="text-text-secondary text-lg mb-3">
                Ești sătul ca listarea ta în Harta Google să fie îngropată sub competitori?
              </p>
              <p className="text-text-secondary text-lg mb-3">
                Te-ai saturat de colaborări cu agenții de marketing care îți iau banii și nu livrează rezultate?
              </p>
              <p className="text-lg mb-6">
                <span className="text-primary font-semibold">GMB MAX</span> este arma ta secretă pentru a domina Pachetul de hărți Google 
                și pentru a aduce mai mulți pacienți către clinica ta! 🚀
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {service.price}<span className="text-sm text-text-secondary">{service.period}</span>
            </div>
            <div className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm">
              Reducere până la 75% în primele 3 luni
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full px-8 py-3 transition-all hover:shadow-lg hover:shadow-primary/20"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Achiziție Serviciu
                </Link>
                <Link
                  href="/dashboard/checkout"
                  className="bg-dark-blue-lighter hover:bg-primary/20 text-white font-semibold rounded-full px-8 py-3 transition-all border border-border-color"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Finalizează Comanda
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full px-8 py-3 transition-all hover:shadow-lg hover:shadow-primary/20"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Autentificare pentru Achiziție
                </Link>
                <a
                  href="/#services"
                  className="bg-dark-blue-lighter hover:bg-primary/20 text-white font-semibold rounded-full px-8 py-3 transition-all border border-border-color inline-block"
                  onClick={() => {
                    window.location.href = '/#services';
                    return false;
                  }}
                >
                  Află mai multe despre servicii
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6 flex flex-col">
          <div className="text-4xl mb-5 text-primary">🎯</div>
          <h3 className="text-xl font-bold mb-4">DE CE SĂ ALEGI GMB MAX?</h3>
          <p className="text-text-secondary mb-4">GMB MAX este serviciul nostru premium care îți garantează prezența în top 3 rezultate pe Google Maps sau nu plătești nimic!</p>
          <div className="mt-auto">
            <p className="text-primary font-bold">Exclusivitate! - Nu vom colabora cu niciun competitor din orașul tău pentru același cuvânt-cheie.</p>
          </div>
        </div>
        
        <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6">
          <div className="text-4xl mb-5 text-primary">👥</div>
          <h3 className="text-xl font-bold mb-4">CINE ARE NEVOIE DE GMB MAX?</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Cabinete medicale locale care doresc mai multe apeluri și pacienți</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Stomatologi care caută o soluție puternică de poziționare pentru servicii premium</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Clinici medicale care vor să depășească competiția locală</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Oricine dorește să își crească vizibilitatea SEO locală</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6 flex flex-col">
          <div className="text-4xl mb-5 text-primary">💰</div>
          <h3 className="text-xl font-bold mb-4">INVESTIȚIE</h3>
          <div className="text-2xl font-bold text-primary mb-2">1000 EUR<span className="text-sm text-text-secondary">/lună</span></div>
          <p className="mb-3 text-accent font-semibold">Reducere până la 75% în primele 3 luni!</p>
          <p className="font-medium mb-3">DURATA: 1-3 luni (în funcție de competiția din oraș)</p>
          <p className="text-sm text-text-secondary mb-4">*Se poate cumpara numai împreună cu Pachetul "Google Organic"</p>
          
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full px-6 py-3 transition-all mt-auto"
            >
              Achiziție Serviciu
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full px-6 py-3 transition-all text-center mt-auto"
              onClick={() => window.scrollTo(0, 0)}
            >
              Autentificare pentru Achiziție
            </Link>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl mb-12 overflow-hidden">
        <div className="p-6 border-b border-border-color">
          <h2 className="text-2xl font-bold">Cum funcționează GMB MAX?</h2>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex items-start mb-8">
            <div className="text-4xl mr-5 text-primary">🌐</div>
            <div>
              <p className="text-xl font-semibold mb-4">Creăm de la zero un profil GBP / GMB - Google My Business nou, special pentru tine, pentru serviciul medical cel mai important.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Îl optimizăm complet cu datele tale (adresa, servicii medicale etc.)</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Postăm in el poze geotarghetate</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Aducem recenzii de la subiecți reali din orașul tău (pentru a obține relevanța geografică)</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Răspundem la recenzii folosind keywords relevante</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Publicăm articole in site-uri locale, pentru obținere de backlinks dofollow</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Publicăm articole in site-uri cu profil medical pentru linkuri dofollow</span>
              </li>
            </ul>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Creăm profile de social media noi si începem sa postăm in ele</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Aducem trafic catre profilul GBP - direct și prin social media</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Construim backlinkuri către toate url-urile GBP cu ancore bogate în cuvinte cheie locale</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Menționăm cabinetul tău in mii de alte website-uri cu nume+ adresa+ telefon+ url</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Folosim un mix natural de cuvinte cheie exacte, de brand și generice</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Practic inundam internetul cu citații despre tine pentru a crește relevanța în ochii Google</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6 my-8">
            <p className="mb-4">Forțăm indexarea tuturor acestor website-uri: Google le va găsi și indexa, ceea ce va oferi beneficiul de poziționare și autoritate, dar in unele cazuri blocăm instrumente de tracking ca Ahrefs și Semrush.</p>
            <p className="text-lg font-semibold">Acesta este un beneficiu suplimentar - competitorii tăi nu vor ști cum ai ajuns să te poziționezi atât de sus!</p>
          </div>
          
          <div className="flex items-center border-t border-border-color pt-6 mt-6">
            <span className="text-2xl text-primary mr-4">✨</span>
            <p className="text-lg font-bold">La toate aceste adăugăm sosul secret Seo Doctor și rezultatele apar in 100% din cazuri!</p>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl mb-12 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary opacity-5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent opacity-5 blur-3xl rounded-full"></div>
        
        <div className="relative p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">💰 Nu lăsa competiția să te depășească!</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Oricât de cinic ar suna…. Degeaba ești cel mai bun, mai dedicat și mai empatic medic din orașul tău, 
            daca pacienții nu te "vad" in Google!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full px-8 py-3 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  Achiziție Serviciu
                </Link>
                <Link
                  href="/dashboard/checkout"
                  className="bg-dark-blue-lighter hover:bg-primary/20 text-white font-semibold rounded-full px-8 py-3 transition-all border border-border-color"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Finalizează Comanda
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full px-8 py-3 transition-all hover:shadow-lg hover:shadow-primary/20"
                onClick={() => window.scrollTo(0, 0)}
              >
                Asigură-ți AZI locul în Pachetul de hărți Google!
              </Link>
            )}
          </div>
          
          <p className="text-text-secondary">Suna la 0742 702 982 pentru un call gratuit de 15 min!</p>
        </div>
      </div>

      {/* Related Services Section */}
      <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border-color">
          <h2 className="text-2xl font-bold">Servicii Complementare</h2>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border-color rounded-xl p-5 h-full flex flex-col">
              <h3 className="text-xl font-bold mb-4 text-primary">GOOGLE ORGANIC</h3>
              <p className="text-text-secondary mb-4">
                Serviciul perfect pentru a domina rezultatele organice ale Google. Creăm un website nou special pentru tine, 
                cu focus pe vizibilitate în rezultatele de căutare.
              </p>
              <p className="text-accent font-semibold mb-4">Plătești doar după ce ajungi în Top 3 Google!</p>
              <Link 
                href="/services/google-organic"
                className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-5 py-2.5 rounded-full transition-colors text-center font-semibold mt-auto"
                onClick={() => window.scrollTo(0, 0)}
              >
                Vezi Detalii
              </Link>
            </div>
            
            <div className="border border-border-color rounded-xl p-5 h-full flex flex-col">
              <h3 className="text-xl font-bold mb-4">Ai întrebări despre GMB MAX?</h3>
              <p className="text-text-secondary mb-4">
                Echipa noastră este disponibilă să răspundă la toate întrebările tale și să te ajute să înțelegi cum 
                GMB MAX îți poate transforma vizibilitatea online a clinicii.
              </p>
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-full transition-colors text-center font-semibold mt-auto">
                Contactează-ne
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}