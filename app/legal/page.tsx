'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { Link, PhoneLink } from '@/components/ui';



export const dynamic = 'force-dynamic';

function LegalPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'terms';

    const tabs = [
        { id: 'terms', label: 'Termeni și condiții' },
        { id: 'gdpr', label: 'GDPR' },
        { id: 'cookies', label: 'Cookies' },
    ];

    const handleTabChange = (tabId: string) => {
        router.push(`/legal?tab=${tabId}`);
    };

    return (
        <div className="min-h-screen bg-dark-blue text-text-primary pb-16">
            {/* Header */}
            <Header isSimplified={true} isAuthenticated={isAuthenticated} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold mb-8 text-center">Informații Legale</h1>

                {/* Tabs */}
                <div className="mb-8 border-b border-border-color">
                    <div className="flex flex-wrap -mb-px">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleTabChange(t.id)}
                                className={`inline-block py-4 px-6 text-sm font-medium cursor-pointer ${tab === t.id
                                    ? 'text-white border-b-2 border-white bg-dark-blue-lighter rounded-t-lg'
                                    : 'text-text-secondary hover:text-text-primary hover:border-border-color border-b-2 border-transparent'
                                    } transition-colors`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-dark-blue-lighter rounded-lg p-6 border border-border-color">
                    {tab === 'terms' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Termeni și condiții</h2>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">1. Introducere</h3>
                                <p>
                                    Bine ați venit la SEO Doctor. Acești Termeni și Condiții guvernează utilizarea de către dumneavoastră a serviciului nostru, operat de SEO Doctor SRL, Cod Unic de Înregistrare 49345207, cu sediul în Str. Campia Libertății 33, sector 3, București.
                                </p>
                                <p>
                                    Prin accesarea sau utilizarea Serviciului, sunteți de acord să respectați acești Termeni. Dacă nu sunteți de acord cu vreo parte a termenilor, atunci nu aveți permisiunea de a accesa Serviciul.
                                </p>

                                <h3 className="text-xl font-semibold">2. Definiții</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Serviciu</strong> se referă la site-ul web și serviciile oferite de SEO Doctor.</li>
                                    <li><strong>Termeni și Condiții</strong> (denumiți și "Termeni") reprezintă aceste Termeni și Condiții care formează întregul acord între dumneavoastră și SEO Doctor SRL cu privire la utilizarea Serviciului.</li>
                                    <li><strong>Conținut</strong> se referă la conținutul cum ar fi text, imagini sau alte informații care pot fi postate, încărcate, legate de sau puse la dispoziție prin Serviciu.</li>
                                </ul>

                                <h3 className="text-xl font-semibold">3. Conturile</h3>
                                <p>
                                    Când creați un cont la noi, trebuie să ne furnizați informații care sunt corecte, complete și actuale în orice moment. Nerespectarea acestui lucru constituie o încălcare a Termenilor, care poate duce la încetarea imediată a contului dumneavoastră pe Serviciul nostru.
                                </p>
                                <p>
                                    Sunteți responsabil pentru protejarea parolei pe care o utilizați pentru a accesa Serviciul și pentru orice activități sau acțiuni sub parola dumneavoastră, indiferent dacă parola dumneavoastră este cu Serviciul nostru sau un serviciu terț.
                                </p>

                                <h3 className="text-xl font-semibold">4. Proprietate intelectuală</h3>
                                <p>
                                    Serviciul și conținutul său original, caracteristicile și funcționalitatea sunt și vor rămâne proprietatea exclusivă a SEO Doctor SRL și a licențiatorilor săi. Serviciul este protejat de drepturi de autor, mărci comerciale și alte legi atât din România, cât și din străinătate.
                                </p>
                                <p>
                                    Mărcile noastre comerciale și aspectul comercial nu pot fi utilizate în legătură cu niciun produs sau serviciu fără acordul prealabil scris al SEO Doctor SRL.
                                </p>

                                <h3 className="text-xl font-semibold">5. Limitarea răspunderii</h3>
                                <p>
                                    În niciun caz SEO Doctor SRL, directorii, angajații, partenerii, agenții, furnizorii sau afiliații săi nu vor fi răspunzători pentru orice daune indirecte, incidentale, speciale, exemplare sau de consecință, inclusiv fără limitare, pierderea de profit, date, utilizare, bunăvoință sau alte pierderi intangibile, rezultate din: (i) accesul dumneavoastră la sau utilizarea sau imposibilitatea de a accesa sau utiliza Serviciul; (ii) orice conduită sau conținut al oricărei terțe părți pe Serviciu; (iii) orice conținut obținut de la Serviciu; și (iv) acces neautorizat, utilizare sau modificare a transmisiilor sau conținutului dumneavoastră, fie bazate pe garanție, contract, delict (inclusiv neglijență) sau orice altă teorie juridică, indiferent dacă am fost informați sau nu de posibilitatea unor astfel de daune.
                                </p>

                                <h3 className="text-xl font-semibold">6. Reziliere</h3>
                                <p>
                                    Putem rezilia sau suspenda contul dumneavoastră imediat, fără notificare prealabilă sau răspundere, din orice motiv, inclusiv, fără limitare, dacă încălcați Termenii.
                                </p>
                                <p>
                                    La reziliere, dreptul dumneavoastră de a utiliza Serviciul va înceta imediat. Dacă doriți să vă reziliați contul, puteți pur și simplu să întrerupeți utilizarea Serviciului.
                                </p>

                                <h3 className="text-xl font-semibold">7. Modificări ale Serviciului</h3>
                                <p>
                                    Ne rezervăm dreptul de a retrage sau modifica Serviciul nostru, și orice serviciu sau material pe care îl furnizăm prin Serviciu, la discreția noastră fără notificare. Nu vom fi răspunzători dacă, din orice motiv, toate sau oricare dintre părțile Serviciului sunt indisponibile în orice moment sau pentru orice perioadă.
                                </p>

                                <h3 className="text-xl font-semibold">8. Modificări ale Termenilor</h3>
                                <p>
                                    Ne rezervăm dreptul, la discreția noastră, de a modifica sau înlocui acești Termeni în orice moment. Dacă o revizuire este materială, vom încerca să oferim cel puțin o notificare de 30 de zile înainte ca orice termeni noi să intre în vigoare.
                                </p>
                                <p>
                                    Continuând să accesați sau utilizați Serviciul nostru după ce aceste revizuiri devin efective, sunteți de acord să fiți legat de termenii revizuiți. Dacă nu sunteți de acord cu noii termeni, vă rugăm să încetați utilizarea Serviciului.
                                </p>

                                <h3 id="refund-policy" className="text-xl font-semibold">9. Politica de rambursare</h3>
                                <p>
                                    SEO Doctor SRL oferă servicii digitale care implică alocarea imediată de resurse și începerea muncii după procesarea plății. În consecință, toate plățile efectuate pentru serviciile noastre sunt nerambursabile.
                                </p>
                                <p>
                                    După achiziționarea unui serviciu și confirmarea plății, echipa noastră începe să lucreze la implementarea soluțiilor personalizate pentru afacerea dumneavoastră. Datorită naturii acestor servicii și a resurselor dedicate, nu putem oferi rambursări pentru serviciile deja achiziționate, indiferent de stadiul implementării sau de rezultate.
                                </p>
                                <p>
                                    Vă recomandăm să analizați cu atenție descrierile serviciilor și să ne contactați pentru orice întrebări înainte de a face o achiziție. Suntem dedicați să oferim valoare reală pentru investiția dumneavoastră și vom lucra pentru a asigura satisfacția dumneavoastră în limitele serviciului achiziționat.
                                </p>

                                <h3 className="text-xl font-semibold">10. Legea aplicabilă</h3>
                                <p>
                                    Acești Termeni vor fi guvernați și interpretați în conformitate cu legile României, fără a ține cont de prevederile sale privind conflictul de legi.
                                </p>
                                <p>
                                    Incapacitatea noastră de a aplica orice drept sau prevedere a acestor Termeni nu va fi considerată o renunțare la aceste drepturi. Dacă orice prevedere a acestor Termeni este considerată a fi invalidă sau inaplicabilă de către o instanță, prevederile rămase ale acestor Termeni vor rămâne în vigoare.
                                </p>

                                <h3 className="text-xl font-semibold">11. Contactați-ne</h3>
                                <p>
                                    Dacă aveți întrebări despre acești Termeni, vă rugăm să ne contactați:
                                </p>
                                <div className="pl-6">
                                    <p>Telefon: <PhoneLink /></p>
                                </div>

                                <h3 className="text-xl font-semibold">12. Descrierea serviciilor și obligațiile clientului</h3>
                                <p>
                                    SEO Doctor SRL oferă servicii de optimizare pentru motoarele de căutare (SEO) și marketing digital, incluzând, dar fără a se limita la:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Optimizare SEO on-page și off-page</li>
                                    <li>Marketing digital și strategie de conținut</li>
                                    <li>Audituri tehnice SEO</li>
                                    <li>Consultanță și cercetare de cuvinte cheie</li>
                                    <li>Creare de conținut optimizat</li>
                                    <li>Link building și promovare online</li>
                                    <li>Raportare și analiză de performanță</li>
                                </ul>
                                <p>
                                    Clientul se obligă să furnizeze accesul necesar la website-ul propriu, contul Google Analytics și Google Search Console pentru implementarea serviciilor contractate. Întârzierile cauzate de client în furnizarea accesului sau a materialelor solicitate nu constituie responsabilitatea companiei și pot afecta termenele de livrare.
                                </p>

                                <h3 className="text-xl font-semibold">13. Condiții de plată</h3>
                                <p>
                                    Plata serviciilor se efectuează prin transfer bancar sau prin platforma Stripe, în moneda RON sau EUR, conform ofertei acceptate de client. Facturile sunt emise în conformitate cu legislația fiscală din România și sunt scadente în termen de 5 zile lucrătoare de la emitere.
                                </p>
                                <p>
                                    Neplata la termen poate duce la suspendarea serviciilor fără a constitui o reziliere a contractului. Reluarea serviciilor se face după efectuarea plății restante.
                                </p>

                                <h3 className="text-xl font-semibold">14. Forță majoră</h3>
                                <p>
                                    Niciuna dintre părți nu va fi răspunzătoare pentru neexecutarea sau executarea cu întârziere a obligațiilor contractuale în cazul unui eveniment de forță majoră. Sunt considerate evenimente de forță majoră: dezastre naturale, pandemii, modificări legislative semnificative, întreruperi majore ale serviciului de internet și atacuri cibernetice de amploare.
                                </p>
                                <p>
                                    Partea afectată de forța majoră trebuie să notifice cealaltă parte în termen de 5 zile lucrătoare de la producerea evenimentului și să depună eforturi rezonabile pentru a minimiza impactul asupra obligațiilor contractuale.
                                </p>

                                <h3 className="text-xl font-semibold">15. Confidențialitate</h3>
                                <p>
                                    Ambele părți se obligă să păstreze confidențialitatea informațiilor sensibile obținute în cadrul colaborării, incluzând, dar fără a se limita la: date de acces la website-uri și platforme, strategii de marketing, date financiare și informații despre clienți.
                                </p>
                                <p>
                                    Obligația de confidențialitate se menține pe toată durata colaborării și încă 2 ani după încetarea acesteia. Încălcarea obligației de confidențialitate atrage răspunderea civilă conform legislației române în vigoare.
                                </p>

                                <h3 className="text-xl font-semibold">16. Legătura cu alte politici</h3>
                                <p>
                                    Acești Termeni și Condiții trebuie citiți împreună cu celelalte politici ale noastre:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        <Link href="/legal?tab=cookies" variant="primary" underline inline>Politica de Cookies</Link> — informații despre cookie-urile utilizate pe site-ul nostru
                                    </li>
                                    <li>
                                        <Link href="/legal?tab=gdpr" variant="primary" underline inline>Politica GDPR</Link> — informații despre protecția datelor personale și drepturile dumneavoastră
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {tab === 'gdpr' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">GDPR - Protecția Datelor</h2>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">1. Conformitate GDPR</h3>
                                <p>
                                    SEO Doctor SRL respectă Regulamentul General privind Protecția Datelor (GDPR) al Uniunii Europene, care a intrat în vigoare la 25 mai 2018. Această secțiune GDPR face parte din Politica noastră de Confidențialitate și explică drepturile dumneavoastră în ceea ce privește datele dumneavoastră personale și modul în care ne conformăm acestor reglementări.
                                </p>

                                <h3 className="text-xl font-semibold">2. Operatorul de date</h3>
                                <p>
                                    SEO Doctor SRL acționează în calitate de "operator de date" pentru orice date personale colectate prin Serviciul nostru. Acest lucru înseamnă că determinăm scopurile și mijloacele de prelucrare a datelor dumneavoastră personale.
                                </p>
                                <p>
                                    <strong>Date de contact ale Operatorului:</strong>
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Nume: SEO Doctor SRL</li>
                                    <li>Cod Unic de Înregistrare: 49345207</li>
                                    <li>Adresă: Str. Campia Libertății 33, sector 3, București</li>
                                    <li>Telefon: <PhoneLink /></li>
                                </ul>

                                <h3 className="text-xl font-semibold">3. Temeiurile juridice pentru prelucrare</h3>
                                <p>
                                    Prelucrăm datele dumneavoastră personale numai atunci când avem un temei juridic valid pentru a face acest lucru. Temeiurile juridice pe care ne bazăm includ:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Consimțământul</strong>: Când ne-ați dat permisiunea explicită de a prelucra datele dumneavoastră personale pentru un scop specific.</li>
                                    <li><strong>Executarea unui contract</strong>: Când prelucrarea este necesară pentru îndeplinirea unui contract la care sunteți parte sau pentru a lua măsuri la cererea dumneavoastră înainte de încheierea unui contract.</li>
                                    <li><strong>Obligație legală</strong>: Când prelucrarea este necesară pentru a respecta o obligație legală la care suntem supuși.</li>
                                    <li><strong>Interese legitime</strong>: Când prelucrarea este necesară pentru interesele noastre legitime sau ale unei terțe părți, cu excepția cazului în care prevalează interesele sau drepturile și libertățile dumneavoastră fundamentale care necesită protecția datelor personale.</li>
                                </ul>

                                <h3 className="text-xl font-semibold">4. Drepturile dumneavoastră GDPR</h3>
                                <p>
                                    Conform GDPR, aveți următoarele drepturi în ceea ce privește datele dumneavoastră personale:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Dreptul de a fi informat</strong>: Aveți dreptul de a primi informații clare, transparente, ușor de înțeles și ușor accesibile despre modul în care utilizăm datele dumneavoastră personale.</li>
                                    <li><strong>Dreptul de acces</strong>: Aveți dreptul de a obține confirmarea dacă prelucrăm datele dumneavoastră personale și de a accesa aceste date personale.</li>
                                    <li><strong>Dreptul la rectificare</strong>: Aveți dreptul de a solicita corectarea datelor personale inexacte sau completarea datelor personale incomplete.</li>
                                    <li><strong>Dreptul la ștergere ('dreptul de a fi uitat')</strong>: Aveți dreptul de a solicita ștergerea datelor dumneavoastră personale în anumite circumstanțe.</li>
                                    <li><strong>Dreptul la restricționarea prelucrării</strong>: Aveți dreptul de a solicita restricționarea prelucrării datelor dumneavoastră personale în anumite circumstanțe.</li>
                                    <li><strong>Dreptul la portabilitatea datelor</strong>: Aveți dreptul de a primi datele personale pe care ni le-ați furnizat într-un format structurat, utilizat în mod obișnuit și care poate fi citit automat, și de a transmite aceste date altui operator de date.</li>
                                    <li><strong>Dreptul la opoziție</strong>: Aveți dreptul de a vă opune prelucrării datelor dumneavoastră personale în anumite circumstanțe, inclusiv prelucrării pentru marketing direct.</li>
                                    <li><strong>Drepturi legate de luarea deciziilor automatizate și de profilare</strong>: Aveți dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrarea automatizată, inclusiv profilarea, care produce efecte juridice asupra dumneavoastră sau vă afectează în mod similar în mod semnificativ.</li>
                                </ul>

                                <h3 className="text-xl font-semibold">5. Exercitarea drepturilor dumneavoastră</h3>
                                <p>
                                    Pentru a vă exercita drepturile GDPR, vă rugăm să ne contactați utilizând detaliile de contact furnizate mai sus. Vom răspunde la solicitarea dumneavoastră în termen de o lună de la primirea acesteia. Acest termen poate fi prelungit cu două luni suplimentare dacă este necesar, ținând cont de complexitatea și numărul solicitărilor.
                                </p>
                                <p>
                                    Dacă solicitarea este evident nefondată sau excesivă, în special din cauza caracterului său repetitiv, putem:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Să percepem o taxă rezonabilă, ținând cont de costurile administrative pentru furnizarea informațiilor sau comunicarea sau întreprinderea acțiunii solicitate; sau</li>
                                    <li>Să refuzăm să dăm curs cererii.</li>
                                </ul>

                                <h3 className="text-xl font-semibold">6. Transfer de date în afara UE/SEE</h3>
                                <p>
                                    Dacă transferăm datele dumneavoastră personale în afara Uniunii Europene sau Spațiului Economic European, ne asigurăm că transferul este efectuat în conformitate cu GDPR. Aceasta poate include transferul către țări care au fost recunoscute de Comisia Europeană ca oferind un nivel adecvat de protecție a datelor sau utilizarea clauzelor contractuale standard aprobate de Comisia Europeană.
                                </p>

                                <h3 className="text-xl font-semibold">7. Încălcări ale securității datelor</h3>
                                <p>
                                    În cazul unei încălcări a securității datelor care prezintă un risc pentru drepturile și libertățile dumneavoastră, vom notifica autoritatea competentă de protecție a datelor fără întârzieri nejustificate și, dacă este posibil, în termen de 72 de ore după ce am luat cunoștință de încălcare.
                                </p>
                                <p>
                                    Dacă încălcarea este susceptibilă de a duce la un risc ridicat pentru drepturile și libertățile dumneavoastră, vă vom notifica, de asemenea, direct și fără întârzieri nejustificate.
                                </p>

                                <h3 className="text-xl font-semibold">8. Autoritatea de supraveghere</h3>
                                <p>
                                    Dacă considerați că prelucrarea datelor dumneavoastră personale încalcă prevederile GDPR, aveți dreptul de a depune o plângere la o autoritate de supraveghere, în special în statul membru UE unde aveți reședința obișnuită, locul de muncă sau locul presupusei încălcări.
                                </p>
                                <p>
                                    Pentru persoanele din România, autoritatea de supraveghere este:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong></li>
                                    <li>Adresă: B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, cod poștal 010336, București, România</li>
                                    <li>Website: <Link href="https://www.dataprotection.ro/" variant="primary" underline inline>https://www.dataprotection.ro/</Link></li>
                                </ul>

                                <h3 className="text-xl font-semibold">9. Datele personale pe care le colectăm</h3>
                                <p>
                                    În cadrul furnizării serviciilor noastre, colectăm următoarele categorii de date personale:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Nume și prenume</li>
                                    <li>Adresă de email</li>
                                    <li>Număr de telefon</li>
                                    <li>Adresă IP</li>
                                    <li>Date de navigare (paginile vizitate, durata vizitei, tipul browser-ului și dispozitivului)</li>
                                    <li>Date de facturare (nume, adresă, CUI pentru persoane juridice)</li>
                                    <li>Date furnizate voluntar prin formulare de contact</li>
                                </ul>

                                <h3 className="text-xl font-semibold">10. Scopurile prelucrării datelor</h3>
                                <p>
                                    Datele dumneavoastră personale sunt prelucrate pentru următoarele scopuri:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Furnizarea serviciilor de optimizare SEO și marketing digital</li>
                                    <li>Comunicarea cu dumneavoastră privind serviciile contractate</li>
                                    <li>Facturare și gestionarea plăților</li>
                                    <li>Analiza traficului prin Google Analytics</li>
                                    <li>Măsurarea campaniilor și remarketing prin Google Ads</li>
                                    <li>Conformitate legală și fiscală</li>
                                    <li>Prevenirea fraudelor prin Stripe</li>
                                </ul>

                                <h3 className="text-xl font-semibold">11. Servicii terțe care prelucrează date</h3>
                                <p>
                                    Utilizăm următoarele servicii terțe pentru prelucrarea datelor:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Google Analytics</strong> — analiza traficului pe site (temei juridic: interes legitim)</li>
                                    <li><strong>Google Ads</strong> — măsurarea conversiilor din campanii publicitare și remarketing (temei juridic: consimțământ)</li>
                                    <li><strong>Stripe</strong> — procesarea plăților online (temei juridic: executarea contractului)</li>
                                </ul>
                                <p>
                                    <strong>Nu vindem și nu partajăm datele dumneavoastră personale cu alte terțe părți</strong> în afara celor menționate mai sus.
                                </p>

                                <h3 className="text-xl font-semibold">12. Perioada de retenție a datelor</h3>
                                <p>
                                    Păstrăm datele dumneavoastră personale pentru perioade diferite, în funcție de scopul prelucrării:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Date de cont și facturare</strong>: pe durata relației contractuale + 5 ani (conform legislației fiscale din România)</li>
                                    <li><strong>Date Google Analytics</strong>: maximum 26 de luni</li>
                                    <li><strong>Date Google Ads</strong>: până la retragerea consimțământului sau maximum 540 de zile</li>
                                    <li><strong>Date din formulare de contact</strong>: maximum 12 luni</li>
                                </ul>
                                <p>
                                    La expirarea perioadei de retenție, datele sunt șterse sau anonimizate.
                                </p>

                                <h3 className="text-xl font-semibold">13. Legătura cu alte politici</h3>
                                <p>
                                    Această politică GDPR trebuie citită împreună cu celelalte politici ale noastre:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        <Link href="/legal?tab=cookies" variant="primary" underline inline>Politica de Cookies</Link> — informații despre cookie-urile utilizate pe site-ul nostru
                                    </li>
                                    <li>
                                        <Link href="/legal?tab=terms" variant="primary" underline inline>Termeni și Condiții</Link> — termenii de utilizare a serviciilor noastre
                                    </li>
                                </ul>

                                <h3 className="text-xl font-semibold">14. Contactați-ne</h3>
                                <p>
                                    Dacă aveți întrebări sau preocupări despre modul în care prelucrăm datele dumneavoastră personale sau doriți să vă exercitați drepturile GDPR, vă rugăm să ne contactați:
                                </p>
                                <div className="pl-6">
                                    <p>Telefon: <PhoneLink /></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'cookies' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Politica de Cookies</h2>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">1. Ce sunt cookie-urile?</h3>
                                <p>
                                    Cookie-urile sunt fișiere text mici care sunt plasate pe computerul sau dispozitivul dumneavoastră mobil atunci când vizitați un site web. Cookie-urile sunt utilizate pe scară largă pentru a face site-urile web să funcționeze mai eficient și pentru a furniza informații proprietarilor site-ului.
                                </p>

                                <h3 className="text-xl font-semibold">2. Cookie-urile pe care le utilizăm</h3>
                                <p>
                                    Site-ul nostru utilizează următoarele tipuri de cookie-uri:
                                </p>

                                <h4 className="text-lg font-semibold mt-4">Cookie-uri esențiale</h4>
                                <p>
                                    Aceste cookie-uri sunt necesare pentru funcționarea site-ului nostru. Includ, de exemplu, cookie-uri care vă permit să vă conectați în zonele securizate ale site-ului nostru sau să utilizați coșul de cumpărături.
                                </p>

                                <h4 className="text-lg font-semibold mt-4">Cookie-uri de la terți</h4>
                                <p>
                                    Utilizăm trei servicii terțe care pot seta cookie-uri:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        <strong>Stripe</strong> - pentru procesarea securizată a plăților. Stripe utilizează cookie-uri pentru a preveni fraudele și pentru a asigura securitatea tranzacțiilor dumneavoastră. Aceste cookie-uri sunt esențiale pentru procesarea plăților și nu pot fi dezactivate dacă doriți să efectuați o plată pe site-ul nostru.
                                    </li>
                                    <li>
                                        <strong>Google Analytics</strong> - pentru a înțelege cum utilizatorii interacționează cu site-ul nostru. Aceste cookie-uri colectează informații în mod anonim, inclusiv numărul de vizitatori ai site-ului, de unde au venit vizitatorii și paginile pe care le-au vizitat.
                                    </li>
                                    <li>
                                        <strong>Google Ads</strong> - pentru măsurarea conversiilor din campaniile publicitare și pentru remarketing. Aceste cookie-uri ne permit să evaluăm eficiența campaniilor noastre de publicitate și să afișăm reclame relevante utilizatorilor care au vizitat site-ul nostru.
                                    </li>
                                </ul>

                                <h3 className="text-xl font-semibold">3. Utilizarea cookie-urilor de publicitate</h3>
                                <p>
                                    Utilizăm Google Ads ca unic serviciu de publicitate pentru măsurarea eficienței campaniilor publicitare și pentru remarketing. Cookie-urile Google Ads ne permit să:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Măsurăm conversiile generate de campaniile noastre publicitare</li>
                                    <li>Afișăm reclame relevante utilizatorilor care au vizitat anterior site-ul nostru (remarketing)</li>
                                </ul>
                                <p>
                                    <strong>Nu vindem și nu partajăm datele dumneavoastră personale cu alte companii.</strong> Google Ads este singurul serviciu de publicitate pe care îl utilizăm.
                                </p>

                                <h3 className="text-xl font-semibold">4. Nu utilizăm alte cookie-uri de la terți</h3>
                                <p>
                                    <strong>Important:</strong> În afara cookie-urilor Stripe, Google Analytics și Google Ads menționate mai sus, nu utilizăm niciun alt cookie de la terți. Nu vindem și nu partajăm datele dumneavoastră cu alte companii.
                                </p>

                                <h3 className="text-xl font-semibold">5. Gestionarea cookie-urilor</h3>
                                <p>
                                    Majoritatea browser-elor web vă permit să controlați cookie-urile prin setările lor. Puteți seta browser-ul să vă avertizeze atunci când primiți cookie-uri sau să le refuze complet. Totuși, rețineți că:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Dacă dezactivați cookie-urile esențiale, este posibil să nu puteți utiliza anumite funcții ale site-ului nostru, cum ar fi conectarea la contul dumneavoastră.</li>
                                    <li>Dacă dezactivați cookie-urile Stripe, nu veți putea efectua plăți pe site-ul nostru.</li>
                                    <li>Dacă dezactivați cookie-urile Google Analytics, nu vom putea înțelege cum să îmbunătățim experiența dumneavoastră pe site.</li>
                                    <li>Dacă dezactivați cookie-urile Google Ads, reclamele afișate nu vor fi personalizate în funcție de vizitele dumneavoastră anterioare pe site-ul nostru.</li>
                                </ul>

                                <h3 className="text-xl font-semibold">6. Mai multe informații</h3>
                                <p>
                                    Pentru mai multe informații despre cookie-uri și cum să le gestionați, puteți vizita:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><Link href="https://www.allaboutcookies.org" variant="primary" underline inline>www.allaboutcookies.org</Link></li>
                                    <li><Link href="https://stripe.com/privacy" variant="primary" underline inline>Politica de confidențialitate Stripe</Link></li>
                                    <li><Link href="https://policies.google.com/privacy" variant="primary" underline inline>Politica de confidențialitate Google</Link></li>
                                </ul>

                                <h3 className="text-xl font-semibold">7. Contactați-ne</h3>
                                <p>
                                    Dacă aveți întrebări despre utilizarea cookie-urilor pe site-ul nostru, vă rugăm să ne contactați:
                                </p>
                                <div className="pl-6">
                                    <p>Telefon: <PhoneLink /></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default LegalPage;
