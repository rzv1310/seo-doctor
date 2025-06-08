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
    const tab = searchParams.get('tab') || 'privacy';

    const tabs = [
        { id: 'privacy', label: 'Politici de confidențialitate' },
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
                    {tab === 'privacy' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Politici de confidențialitate</h2>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">1. Introducere</h3>
                                <p>
                                    Această Politică de Confidențialitate descrie modul în care SEO Doctor SRL colectează, utilizează și divulgă informațiile dumneavoastră atunci când utilizați serviciul nostru.
                                </p>
                                <p>
                                    Colectăm și utilizăm datele dumneavoastră personale pentru a furniza și îmbunătăți Serviciul. Prin utilizarea Serviciului, sunteți de acord cu colectarea și utilizarea informațiilor în conformitate cu această politică.
                                </p>

                                <h3 className="text-xl font-semibold">2. Informațiile pe care le colectăm</h3>
                                <p>
                                    <strong>Date personale</strong>: În timp ce utilizați Serviciul nostru, este posibil să vă solicităm să ne furnizați anumite informații de identificare personală care pot fi utilizate pentru a vă contacta sau identifica.
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Informații de contact (nume, adresă de email, număr de telefon)</li>
                                    <li>Informații de utilizare și preferințe</li>
                                    <li>Informații despre dispozitivul și browser-ul dumneavoastră</li>
                                    <li>Adresa IP și date de localizare aproximative</li>
                                </ul>

                                <h3 className="text-xl font-semibold">3. Cum utilizăm datele dumneavoastră</h3>
                                <p>Utilizăm informațiile colectate pentru:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Furnizarea și menținerea Serviciului nostru</li>
                                    <li>Notificarea despre modificări ale Serviciului nostru</li>
                                    <li>Oferirea de asistență pentru clienți</li>
                                    <li>Analizarea datelor pentru îmbunătățirea Serviciului</li>
                                    <li>Monitorizarea utilizării Serviciului</li>
                                    <li>Detectarea, prevenirea și rezolvarea problemelor tehnice</li>
                                </ul>

                                <h3 className="text-xl font-semibold">4. Cookie-uri și tehnologii de urmărire</h3>
                                <p>
                                    Utilizăm cookie-uri și tehnologii similare pentru a urmări activitatea pe Serviciul nostru și pentru a stoca anumite informații. Cookie-urile sunt fișiere cu o cantitate mică de date care pot include un identificator unic anonim.
                                </p>
                                <p>
                                    Puteți instrui browser-ul dumneavoastră să refuze toate cookie-urile sau să indice când este trimis un cookie. Cu toate acestea, dacă nu acceptați cookie-urile, este posibil să nu puteți utiliza unele părți ale Serviciului nostru.
                                </p>

                                <h3 className="text-xl font-semibold">5. Transferul datelor</h3>
                                <p>
                                    Informațiile dumneavoastră, inclusiv Datele Personale, pot fi transferate către și menținute pe computere localizate în afara statului, provinciei, țării sau altei jurisdicții guvernamentale unde legile de protecție a datelor pot diferi de cele din jurisdicția dumneavoastră.
                                </p>
                                <p>
                                    Consimțământul dumneavoastră la această Politică de Confidențialitate urmat de trimiterea unor astfel de informații reprezintă acordul dumneavoastră pentru acel transfer.
                                </p>

                                <h3 className="text-xl font-semibold">6. Dezvăluirea datelor</h3>
                                <p>Putem dezvălui informațiile dumneavoastră personale în următoarele situații:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Pentru a respecta o obligație legală</li>
                                    <li>Pentru a proteja și apăra drepturile sau proprietatea SEO Doctor SRL</li>
                                    <li>Pentru a preveni sau investiga posibile abateri în legătură cu Serviciul</li>
                                    <li>Pentru a proteja siguranța personală a utilizatorilor Serviciului sau a publicului</li>
                                    <li>Pentru a proteja împotriva răspunderii legale</li>
                                </ul>

                                <h3 className="text-xl font-semibold">7. Securitatea datelor</h3>
                                <p>
                                    Securitatea datelor dumneavoastră este importantă pentru noi, dar rețineți că nicio metodă de transmitere pe Internet sau metodă de stocare electronică nu este 100% sigură. În timp ce ne străduim să folosim mijloace comercial acceptabile pentru a proteja Datele dumneavoastră Personale, nu putem garanta securitatea absolută a acestora.
                                </p>

                                <h3 className="text-xl font-semibold">8. Modificări ale acestei Politici de Confidențialitate</h3>
                                <p>
                                    Este posibil să actualizăm Politica noastră de Confidențialitate din când în când. Vă vom notifica cu privire la orice modificări prin postarea noii Politici de Confidențialitate pe această pagină.
                                </p>
                                <p>
                                    Vă sfătuim să revizuiți periodic această Politică de Confidențialitate pentru orice modificări. Modificările acestei Politici de Confidențialitate sunt efective atunci când sunt postate pe această pagină.
                                </p>

                                <h3 className="text-xl font-semibold">9. Contactați-ne</h3>
                                <p>
                                    Dacă aveți întrebări despre această Politică de Confidențialitate, vă rugăm să ne contactați:
                                </p>
                                <div className="pl-6">
                                    <p>Telefon: <PhoneLink /></p>
                                </div>
                            </div>
                        </div>
                    )}

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

                                <h3 className="text-xl font-semibold">9. Contactați-ne</h3>
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
                                    Utilizăm doar două servicii terțe care pot seta cookie-uri:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        <strong>Stripe</strong> - pentru procesarea securizată a plăților. Stripe utilizează cookie-uri pentru a preveni fraudele și pentru a asigura securitatea tranzacțiilor dumneavoastră. Aceste cookie-uri sunt esențiale pentru procesarea plăților și nu pot fi dezactivate dacă doriți să efectuați o plată pe site-ul nostru.
                                    </li>
                                    <li>
                                        <strong>Google Analytics</strong> - pentru a înțelege cum utilizatorii interacționează cu site-ul nostru. Aceste cookie-uri colectează informații în mod anonim, inclusiv numărul de vizitatori ai site-ului, de unde au venit vizitatorii și paginile pe care le-au vizitat.
                                    </li>
                                </ul>

                                <h3 className="text-xl font-semibold">3. Nu utilizăm alte cookie-uri de la terți</h3>
                                <p>
                                    <strong>Important:</strong> În afara cookie-urilor Stripe și Google Analytics menționate mai sus, nu utilizăm niciun alt cookie de la terți. Nu folosim cookie-uri pentru publicitate, remarketing sau tracking în scopuri de marketing. Nu vindem și nu partajăm datele dumneavoastră cu alte companii.
                                </p>

                                <h3 className="text-xl font-semibold">4. Gestionarea cookie-urilor</h3>
                                <p>
                                    Majoritatea browser-elor web vă permit să controlați cookie-urile prin setările lor. Puteți seta browser-ul să vă avertizeze atunci când primiți cookie-uri sau să le refuze complet. Totuși, rețineți că:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Dacă dezactivați cookie-urile esențiale, este posibil să nu puteți utiliza anumite funcții ale site-ului nostru, cum ar fi conectarea la contul dumneavoastră.</li>
                                    <li>Dacă dezactivați cookie-urile Stripe, nu veți putea efectua plăți pe site-ul nostru.</li>
                                    <li>Dacă dezactivați cookie-urile Google Analytics, nu vom putea înțelege cum să îmbunătățim experiența dumneavoastră pe site.</li>
                                </ul>

                                <h3 className="text-xl font-semibold">5. Mai multe informații</h3>
                                <p>
                                    Pentru mai multe informații despre cookie-uri și cum să le gestionați, puteți vizita:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><Link href="https://www.allaboutcookies.org" variant="primary" underline inline>www.allaboutcookies.org</Link></li>
                                    <li><Link href="https://stripe.com/privacy" variant="primary" underline inline>Politica de confidențialitate Stripe</Link></li>
                                    <li><Link href="https://policies.google.com/privacy" variant="primary" underline inline>Politica de confidențialitate Google</Link></li>
                                </ul>

                                <h3 className="text-xl font-semibold">6. Contactați-ne</h3>
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
