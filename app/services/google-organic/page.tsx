'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthUser } from '@/utils/auth';
import { useCart } from '@/context/CartContext';
import { services } from '@/data/services';

export default function GoogleOrganicServicePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addItem, isInCart, removeItem } = useCart();
  const service = services.find(s => s.name === 'GOOGLE ORGANIC');

  useEffect(() => {
    // Check if user is authenticated
    const user = getAuthUser();
    setIsAuthenticated(!!user);
    
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  // Handle adding service to cart
  const handleAddToCart = () => {
    if (service) {
      addItem({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        priceValue: service.priceValue,
        features: service.features,
      });
    }
  };

  // Handle removing service from cart
  const handleRemoveFromCart = () => {
    if (service) {
      removeItem(service.id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
              GOOGLE ORGANIC
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-6">
              GARANTAT TOP 3 ÎN REZULTATELE GOOGLE - SAU NU PLĂTEȘTI NIMIC!
            </p>
            <div className="max-w-3xl mx-auto">
              <p className="text-text-secondary text-lg mb-3">
                Ești frustrat că site-ul tău e invizibil în Google?
              </p>
              <p className="text-text-secondary text-lg mb-3">
                Te-ai săturat să investești în strategii SEO care nu dau rezultate concrete?
              </p>
              <p className="text-lg mb-3">
                <span className="text-primary font-semibold">GOOGLE ORGANIC</span> este soluția ta completă pentru a domina rezultatele organice
                și pentru a aduce mai mulți pacienți către clinica ta! 🚀
              </p>
              <p className="text-lg mb-3">
                Prin strategia noastră avansată SEO, creăm un website nou special pentru tine, optimizat pentru a urca rapid în Google pentru serviciul medical pe care îl dorești.
              </p>
              <p className="text-lg font-bold mb-6">
                PLĂTEȘTI DOAR DUPĂ CE AJUNGI ÎN TOP 3! Website-ul va aduce trafic, mai multe apeluri telefonice și, implicit, mai multe programări în cabinet!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {service.price}<span className="text-sm text-text-secondary">{service.period}</span>
            </div>
            <div className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">
              Plătești doar după ce ajungi în Top 3!
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                {isInCart(service.id) ? (
                  <button
                    onClick={handleRemoveFromCart}
                    className="bg-danger/20 hover:bg-danger/30 text-danger font-semibold rounded-full px-8 py-3 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Elimină din Coș
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full px-8 py-3 transition-all hover:shadow-lg hover:shadow-primary/20"
                  >
                    Adaugă în Coș
                  </button>
                )}
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
          <h3 className="text-xl font-bold mb-4">DE CE SĂ ALEGI GOOGLE ORGANIC?</h3>
          <p className="text-text-secondary mb-4">Serviciul nostru îți garantează prezența în top 3 rezultate organice sau nu plătești nimic!</p>
          <div className="mt-auto">
            <p className="text-primary font-bold">Fără plată până nu atingi Top 3 Google - RISC ZERO!</p>
          </div>
        </div>
        
        <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6">
          <div className="text-4xl mb-5 text-primary">👥</div>
          <h3 className="text-xl font-bold mb-4">CINE ARE NEVOIE DE GOOGLE ORGANIC?</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Clinici medicale care doresc să domine căutările pentru specialitățile lor</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Cabinete stomatologice care își doresc pacienți pentru servicii premium</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Centre medicale care vor să se poziționeze ca lideri în serviciile lor medicale</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 text-xl">✅</span>
              <span>Clinici de recuperare medicală care doresc să atragă pacienți pentru servicii specifice</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6 flex flex-col">
          <div className="text-4xl mb-5 text-primary">💰</div>
          <h3 className="text-xl font-bold mb-4">INVESTIȚIE</h3>
          <div className="text-2xl font-bold text-primary mb-2">1000 EUR<span className="text-sm text-text-secondary">/lună</span></div>
          <p className="mb-3 text-accent font-semibold">Reducere până la 75% în primele 3 luni!</p>
          <p className="font-medium mb-3 text-blue-300">PLĂTEȘTI DOAR DUPĂ CE AJUNGI ÎN TOP 3!</p>
          <p className="text-sm text-text-secondary mb-4">Se poate achiziționa individual sau împreună cu "GMB MAX", pentru rezultate complete.</p>
          
          {isAuthenticated ? (
            <button
              onClick={isInCart(service.id) ? handleRemoveFromCart : handleAddToCart}
              className={`${isInCart(service.id) 
                ? 'bg-danger/20 hover:bg-danger/30 text-danger' 
                : 'bg-gradient-to-r from-primary to-primary-dark text-white'} 
                font-semibold rounded-full px-6 py-3 transition-all mt-auto`}
            >
              {isInCart(service.id) ? 'Elimină din Coș' : 'Adaugă în Coș'}
            </button>
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
          <h2 className="text-2xl font-bold">Cum funcționează GOOGLE ORGANIC?</h2>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start mb-6">
                <div className="text-4xl mr-5 text-primary">🌐</div>
                <h3 className="text-xl font-bold">Creăm și optimizăm un website nou, dedicat:</h3>
              </div>
              
              <ul className="space-y-4 ml-16">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Construim de la zero un website optimizat pentru serviciul tău medical principal</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Implementăm cea mai avansată arhitectură de site pentru indexare rapidă</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Asigurăm viteză de încărcare perfectă pentru experiență utilizator optimă</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Implementăm Schema.org medicală specializată și microdate pentru evidențiere în rezultate</span>
                </li>
              </ul>
              
              <div className="flex items-start mt-10 mb-6">
                <div className="text-4xl mr-5 text-primary">📊</div>
                <h3 className="text-xl font-bold">Strategie SEO avansată:</h3>
              </div>
              
              <ul className="space-y-4 ml-16">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Realizăm cercetare detaliată a cuvintelor cheie pentru serviciile medicale cu ROI înalt</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Optimizăm conținutul și creăm pagini noi orientate spre conversie</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creăm conținut medical de autoritate (articole, studii de caz, ghiduri)</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Implementăm "intent matching" pentru a atrage pacienți cu intenție reală de programare</span>
                </li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-start mb-6">
                <div className="text-4xl mr-5 text-primary">🔗</div>
                <h3 className="text-xl font-bold">Off-Page:</h3>
              </div>
              
              <ul className="space-y-4 ml-16">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Construim backlink-uri medicale de calitate de la site-uri medicale</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Obținem mențiuni în publicații generaliste cu autoritate</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creăm conținut valoros care atrage linkuri naturale</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Implementăm strategie avansată de link building intern</span>
                </li>
              </ul>
              
              <div className="flex items-start mt-10 mb-6">
                <div className="text-4xl mr-5 text-primary">📱</div>
                <h3 className="text-xl font-bold">Optimizare pentru dispozitive mobile:</h3>
              </div>
              
              <ul className="space-y-4 ml-16">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Asigurăm experiență perfectă pe toate dispozitivele</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Optimizăm pentru Core Web Vitals și semnalele UX</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Implementăm AMP (Accelerated Mobile Pages) pentru secțiuni critice</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Asigurăm loading rapid și experiență impecabilă pe mobil</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10">
            <div className="flex items-start mb-6">
              <div className="text-4xl mr-5 text-primary">📈</div>
              <h3 className="text-xl font-bold">Monitorizare și raportare transparentă:</h3>
            </div>
            
            <ul className="space-y-4 ml-16">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Tracking detaliat al poziționărilor pentru cuvintele cheie țintă</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Rapoarte lunare cu evoluția traficului și conversiilor</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Analiză a comportamentului utilizatorilor și optimizare continuă</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6 mt-8">
            <div className="flex items-center">
              <span className="text-2xl text-primary mr-4">✨</span>
              <p className="text-lg font-bold">La toate acestea adăugăm expertiza exclusivă Seo Doctor și tehnici avansate proprietare, care aduc rezultate garantate în 100% din cazuri!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl mb-12 overflow-hidden">
        <div className="p-6 border-b border-border-color">
          <h2 className="text-2xl font-bold">BENEFICII EXCLUSIVE</h2>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
              <div className="text-3xl mb-4 text-primary">💰</div>
              <h3 className="text-xl font-bold mb-2">Fără plată până nu atingi Top 3 Google</h3>
              <p className="text-text-secondary">Începi să plătești abonamentul doar după ce ajungi în primele 3 poziții - RISC ZERO!</p>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
              <div className="text-3xl mb-4 text-primary">🌐</div>
              <h3 className="text-xl font-bold mb-2">Website nou dedicat brandului tău</h3>
              <p className="text-text-secondary">Nu modificăm site-ul tău existent, ci creăm unul nou, specializat.</p>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
              <div className="text-3xl mb-4 text-primary">🥇</div>
              <h3 className="text-xl font-bold mb-2">Exclusivitate geografică</h3>
              <p className="text-text-secondary">Nu lucrăm cu competitorii tăi din același oraș pentru aceleași servicii.</p>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
              <div className="text-3xl mb-4 text-primary">📈</div>
              <h3 className="text-xl font-bold mb-2">Creștere organică sustenabilă</h3>
              <p className="text-text-secondary">Rezultatele rămân și continuă să se îmbunătățească în timp.</p>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
              <div className="text-3xl mb-4 text-primary">👥</div>
              <h3 className="text-xl font-bold mb-2">Focus pe conversii</h3>
              <p className="text-text-secondary">Nu doar trafic, ci pacienți reali care programează vizite.</p>
            </div>
            
            <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
              <div className="text-3xl mb-4 text-primary">⏱️</div>
              <h3 className="text-xl font-bold mb-2">Rezultate în 1-3 luni</h3>
              <p className="text-text-secondary">Începi să plătești doar după ce obții rezultatele dorite.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl mb-12 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary opacity-5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent opacity-5 blur-3xl rounded-full"></div>
        
        <div className="relative p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">📱 În medicină, vizibilitatea online este crucială!</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Competitorii tăi investesc deja în SEO pentru a-ți lua pacienții. 
            Asigură-ți poziția în topul Google încă de azi!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            {isAuthenticated ? (
              <>
                <button
                  onClick={isInCart(service.id) ? handleRemoveFromCart : handleAddToCart}
                  className={`${isInCart(service.id) 
                    ? 'bg-danger/20 hover:bg-danger/30 text-danger' 
                    : 'bg-gradient-to-r from-primary to-primary-dark text-white'} 
                    font-semibold rounded-full px-8 py-3 transition-all`}
                >
                  {isInCart(service.id) ? 'Elimină din Coș' : 'Adaugă în Coș'}
                </button>
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
                Asigură-ți AZI vizibilitatea online!
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
              <h3 className="text-xl font-bold mb-4 text-primary">GMB MAX</h3>
              <p className="text-text-secondary mb-4">
                Complementează GOOGLE ORGANIC cu GMB MAX pentru a domina atât rezultatele organice cât și harta Google, 
                maximizând vizibilitatea clinicii tale medicale.
              </p>
              <p className="text-accent font-semibold mb-4">Garantat Top 3 în Google Maps!</p>
              <Link 
                href="/services/gmb-max"
                className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-5 py-2.5 rounded-full transition-colors text-center font-semibold mt-auto"
                onClick={() => window.scrollTo(0, 0)}
              >
                Vezi Detalii
              </Link>
            </div>
            
            <div className="border border-border-color rounded-xl p-5 h-full flex flex-col">
              <h3 className="text-xl font-bold mb-4">Ai întrebări despre GOOGLE ORGANIC?</h3>
              <p className="text-text-secondary mb-4">
                Echipa noastră este disponibilă să răspundă la toate întrebările tale și să te ajute să înțelegi cum 
                acest serviciu îți poate transforma prezența online a clinicii.
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