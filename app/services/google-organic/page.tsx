'use client';

import { useAuth } from '@/context/AuthContext';
import { services } from '@/data/services';
import { ActionButton, Link } from '@/components/ui';



export default function GoogleOrganicServicePage() {
    const { isAuthenticated } = useAuth();
    const service = services.find(s => s.name === 'GOOGLE ORGANIC');

    if (!service) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-4">Serviciu indisponibil</h2>
                <p className="text-text-secondary mb-6">Ne pare rău, dar serviciul solicitat nu este disponibil momentan.</p>
                <ActionButton href="/" size="md" fullRounded={false}>
                    Înapoi la pagina principală
                </ActionButton>
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
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text">
                            Abonament GOOGLE ORGANIC
                        </h1>
                        <p className="text-xl md:text-2xl font-semibold mb-6">
                            GARANTAT TOP 3 ÎN REZULTATELE GOOGLE - SAU NU PLĂTEȘTI NIMIC!
                        </p>
                        <div className="max-w-3xl mx-auto">
                            <p className="text-text-secondary text-lg mb-3">
                                Ești frustrat că site-ul tău e invizibil în Google?
                            </p>
                            <p className="text-lg mb-3">
                                Primele 3 rezultate organice din Google primesc 68.7% din toate clickurile! 🚀
                            </p>
                            <p className="text-lg mb-3">
                                A doua pagină primește mai puțin de 1% din trafic.
                            </p>
                            <p className="text-lg font-bold mb-6">
                                Rezultatul organic #1 primește ~ de 13 ori mai multe clickuri decât primul rezultat plătit!
                            </p>
                            <p className="text-lg font-bold mb-6">
                                Sună la <Link href="tel:+40742702982" variant="primary">+40 742 702 982</Link> pentru un call gratuit de 15 min, înainte de a cumpăra!
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text">
                            {service.price}<span className="text-sm text-text-secondary">{service.period}</span>
                        </div>
                        <div className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm">
                            Reducere până la 75% în primele 3 luni!
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <ActionButton href="/dashboard" size="lg">
                                Cumpără acum!
                            </ActionButton>
                        ) : (
                            <ActionButton href="/login" size="lg">
                                Cumpără acum!
                            </ActionButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6 flex flex-col">
                    <div className="text-4xl mb-5 text-white">🎯</div>
                    <h3 className="text-xl font-bold mb-4">DE CE SĂ ALEGI GOOGLE ORGANIC?</h3>
                    <p className="text-text-secondary mb-4">Serviciul nostru îți garantează prezența în top 3 rezultate organice sau nu plătești nimic!</p>
                    <div className="mt-auto">
                        <p className="text-white font-bold">Fără plată până nu atingi Top 3 Google - RISC ZERO!</p>
                    </div>
                </div>

                <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6">
                    <div className="text-4xl mb-5 text-white">👥</div>
                    <h3 className="text-xl font-bold mb-4">CINE ARE NEVOIE DE GOOGLE ORGANIC?</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Clinici medicale care doresc să domine căutările pentru specialitățile lor</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Cabinete stomatologice care își doresc pacienți pentru servicii premium</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Clinici de recuperare medicală care doresc să atragă pacienți pentru servicii specifice</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-dark-blue-lighter/40 backdrop-blur-sm border border-border-color rounded-xl p-6 flex flex-col">
                    <div className="text-4xl mb-5 text-white">💰</div>
                    <h3 className="text-xl font-bold mb-4">INVESTIȚIE</h3>
                    <div className="text-2xl font-bold text-white mb-2">1000 EUR<span className="text-sm text-text-secondary">/lună</span></div>
                    <p className="mb-3 text-green-300 font-semibold">Reducere până la 75% în primele 3 luni!</p>
                    <p className="font-medium mb-3 text-white">PLĂTEȘTI DOAR DUPĂ CE AJUNGI ÎN TOP 3!</p>
                    <p className="text-sm text-text-secondary mb-4">Se poate achiziționa individual sau împreună cu "GMB MAX", pentru rezultate complete.</p>

                    <p className="text-center font-bold mb-6">
                        Sună la <Link href="tel:+40742702982" variant="primary">+40 742 702 982</Link> pentru un call gratuit de 15 min, înainte de a cumpăra!
                    </p>
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
                                <div className="text-4xl mr-5 text-white">🌐</div>
                                <h3 className="text-xl font-bold">Creăm și optimizăm un website nou, dedicat:</h3>
                            </div>

                            <ul className="space-y-4 ml-16">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Construim de la zero un website optimizat pentru serviciul tău medical principal</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Implementăm cea mai avansată arhitectură de site pentru indexare rapidă</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Asigurăm viteză de încărcare perfectă pentru experiență utilizator optimă</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Implementăm Schema.org medicală specializată și microdate pentru evidențiere în rezultate</span>
                                </li>
                            </ul>

                            <div className="flex items-start mt-10 mb-6">
                                <div className="text-4xl mr-5 text-white">📊</div>
                                <h3 className="text-xl font-bold">Strategie SEO avansată:</h3>
                            </div>

                            <ul className="space-y-4 ml-16">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Realizăm cercetare detaliată a cuvintelor cheie pentru serviciile medicale cu ROI înalt</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Optimizăm conținutul și creăm pagini noi orientate spre conversie</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Creăm conținut medical de autoritate (articole, studii de caz, ghiduri)</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Implementăm "intent matching" pentru a atrage pacienți cu intenție reală de programare</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-start mb-6">
                                <div className="text-4xl mr-5 text-white">🔗</div>
                                <h3 className="text-xl font-bold">Off-Page:</h3>
                            </div>

                            <ul className="space-y-4 ml-16">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Construim backlink-uri medicale de calitate de la site-uri medicale</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Obținem mențiuni în publicații generaliste cu autoritate</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Creăm conținut valoros care atrage linkuri naturale</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Implementăm strategie avansată de link building intern</span>
                                </li>
                            </ul>

                            <div className="flex items-start mt-10 mb-6">
                                <div className="text-4xl mr-5 text-white">📱</div>
                                <h3 className="text-xl font-bold">Optimizare pentru dispozitive mobile:</h3>
                            </div>

                            <ul className="space-y-4 ml-16">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Asigurăm experiență perfectă pe toate dispozitivele</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Optimizăm pentru Core Web Vitals și semnalele UX</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Implementăm AMP (Accelerated Mobile Pages) pentru secțiuni critice</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Asigurăm loading rapid și experiență impecabilă pe mobil</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10">
                        <div className="flex items-start mb-6">
                            <div className="text-4xl mr-5 text-white">📈</div>
                            <h3 className="text-xl font-bold">Monitorizare și raportare transparentă:</h3>
                        </div>

                        <ul className="space-y-4 ml-16">
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Tracking detaliat al poziționărilor pentru cuvintele cheie țintă</span>
                            </li>
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Rapoarte lunare cu evoluția traficului și conversiilor</span>
                            </li>
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Analiză a comportamentului utilizatorilor și optimizare continuă</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6 mt-8">
                        <div className="flex items-center">
                            <span className="text-2xl text-white mr-4">✨</span>
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
                            <div className="text-3xl mb-4 text-white">💰</div>
                            <h3 className="text-xl font-bold mb-2">Fără plată până atingi Top 3</h3>
                            <p className="text-text-secondary">Începi să plătești abonamentul doar după ce ajungi în primele 3 poziții - RISC ZERO!</p>
                        </div>

                        <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                            <div className="text-3xl mb-4 text-white">🌐</div>
                            <h3 className="text-xl font-bold mb-2">Website dedicat brandului tău</h3>
                            <p className="text-text-secondary">Nu modificăm site-ul tău existent, ci creăm unul nou, specializat, pe cheltuiala noastră.</p>
                        </div>

                        <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                            <div className="text-3xl mb-4 text-white">🥇</div>
                            <h3 className="text-xl font-bold mb-2">Exclusivitate geografică</h3>
                            <p className="text-text-secondary">Nu lucrăm cu competitorii tăi din același oraș pentru aceleași servicii.</p>
                        </div>

                        <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                            <div className="text-3xl mb-4 text-white">📈</div>
                            <h3 className="text-xl font-bold mb-2">Creștere organică sustenabilă</h3>
                            <p className="text-text-secondary">Rezultatele rămân și continuă să se îmbunătățească în timp.</p>
                        </div>

                        <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                            <div className="text-3xl mb-4 text-white">👥</div>
                            <h3 className="text-xl font-bold mb-2">Focus pe conversii</h3>
                            <p className="text-text-secondary">Nu doar trafic, ci pacienți reali care programează vizite.</p>
                        </div>

                        <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                            <div className="text-3xl mb-4 text-white">⏱️</div>
                            <h3 className="text-xl font-bold mb-2">Rezultate în 1-3 luni</h3>
                            <p className="text-text-secondary">Atât durează până ajungem în top, în funcție de cât de acerbă e competiția.</p>
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

                    {/* Removed duplicate CTA section */}

                    <p className="text-text-secondary">
                        Sună la <Link href="tel:+40742702982" variant="primary">+40 742 702 982</Link> pentru un call gratuit de 15 min!
                    </p>
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
                            <h3 className="text-xl font-bold mb-4 text-white">GMB MAX</h3>
                            <p className="text-text-secondary mb-4">
                                Cumpără GOOGLE ORGANIC împreună cu GMB MAX pentru a domina atât rezultatele organice cât și harta Google.
                            </p>
                            <p className="text-white font-semibold mb-4">Garantat Top 3 în Google Maps!</p>
                            <ActionButton
                                href="/services/gmb-max"
                                size="sm"
                                fullRounded
                                showArrow={false}
                                onClick={() => window.scrollTo(0, 0)}
                            >
                                Vezi Detalii
                            </ActionButton>
                        </div>

                        <div className="border border-border-color rounded-xl p-5 h-full flex flex-col">
                            <h3 className="text-xl font-bold mb-4">Ai întrebări?</h3>
                            <p className="text-text-secondary mb-4">
                                Echipa noastră te ajut să înțelegi cum acest serviciu îți poate transforma radical prezența online.
                            </p>
                            <ActionButton href="/contact" size="md" showArrow={false} fullRounded={false}>
                                Contactează-ne
                            </ActionButton>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
