import fs from 'fs';
import path from 'path';

// Define spintax templates for multiple definitions to ensure high uniqueness
const spintax = {
    strona_glowna: {
        seo: [
            "Szukasz rozrywki w mieście {city}? {Silent Disco to idealny wybór na każdą pogodę|Wybierz bezprzewodowe słuchawki na swój event|Organizacja imprezy nigdy nie była tak prosta}. {Zapewniamy sprzęt na wesela, urodziny i domówki|Dostarczamy gotowe pakiety na imprezy plenerowe i firmowe|Nasze wypożyczalnie obsługują również wydarzenia masowe}. {Zasięg do 500m gwarantuje pełną swobodę|Słuchawki grają do 10 godzin bez ładowania|Trzy kanały muzyczne zadowolą każdego gościa}.",
            "Wynajem słuchawek w {city} {cieszy się ogromną popularnością|to wschodzący trend eventowy|to najlepsza opcja na bezproblemową imprezę}. {Nie musisz martwić się o ciszę nocną|Koniec mandatów za hałas|Sąsiedzi mogą spać spokojnie, a wy tańczycie do rana}. {Sprzęt wysyłamy naładowany i wydezynfekowany|W paczce znajdziesz wszystko czego potrzebujesz|Prosta instrukcja pozwoli uruchomić system w 2 minuty}.",
            "Eventy na terenie miasta {city} {wymagają rozwiązań omijających ciszę nocną|często borykają się z limitami decybeli|to świetne tło dla Silent Disco}. {Skorzystaj z wypożyczalni, która wysyła nadajniki i słuchawki pod drzwi|Zamów profesjonalne zestawy z dostawą kurierską|Zorganizuj niezapomniane przeżycie dzięki 3 kanałom audio}. {Sprzęt jest niezawodny, używano go na festiwalach|Stawiamy na higienę i certyfikaty UV|W zestawie aplikacja z gotowymi miksami}."
        ],
        sales: [
            "<p>Zamieszkujesz <strong>{city}</strong> i chcesz {wyprawić epicką imprezę|zorganizować event marzeń|zaskoczyć swoich znajomych}? Nasze słuchawki rozwiązują odwieczny problem z różnymi gustami muzycznymi gości. {Po prostu podpinasz nadajniki do gniazdka|Włączasz system jednym kablem|Szybka konfiguracja to nasza zaleta} i już możecie się bawić na 3 ścieżkach dźwiękowych jednocześnie.</p>",
            "<p>Dla klientów z miasta <strong>{city}</strong> {przygotowaliśmy ofertę kompleksową|oferujemy zryczałtowaną wysyłkę sprzętu|zarezerwowaliśmy pulę bezprzewodowych słuchawek Mylar HD}. Odbierasz paczkę, nakładasz odkażone nauszniki i zapominasz o skargach sąsiadów na hałas. {Wybierz nasz kalkulator|Wejdź na stronę cennika|Skonfiguruj pakiet pod siebie} aby poznać koszty dostawy w 24H.</p>",
            "<p>Organizacja eventu w przestrzeni, którą oferuje <strong>{city}</strong>, bywa {wymagająca|niebanalna|trudna ze względu na zakazy hałasu}. Dlatego dostarczamy {najwyższej klasy|innowacyjny|bezawaryjny} sprzęt radiowy RF z zasięgiem do 500m. {Zapomnij o DJ'ach-amatorach, podłącz aplikację|Wynajmij zestaw z potrójnym nadajnikiem|Skonfiguruj imprezę idealną na 20 lub 500 osób}.</p>"
        ],
        hook: [
            "Zorganizuj niezapomniane Silent Disco w mieście {city}.",
            "Wynajem słuchawek w {city} – prosto pod drzwi.",
            "Wypożyczalnia Silent Disco dla miasta {city} bez limitów hałasu."
        ]
    },
    oferta_wynajem: {
        seo: [
            "{Wypożyczalnia|Wynajem|Dzierżawa sprzętu} Silent Disco na obszarze miasta {city} {w atrakcyjnej cenie|z darmową rezerwacją|dla każdego}. {Nasze słuchawki naładowane są na 100%|W paczce znajdziesz okablowanie|Działamy w systemie door-to-door}. {Brak kaucji przy mniejszych zestawach to ogromny plus|Oferujemy natychmiastową wycenę PDF w 30 sekund|Mamy tysiące zadowolonych klientów w całej logistyce}.",
            "{Planujesz domówkę|Zbliża się osiemnastka lub wesele|Zarządzasz eventem} w mieście {city}? {Wybierz bezprzewodowe słuchawki RF|Postaw na słuchawki Mylar Membrane|Zamów zestaw nadajników} i baw się bez przeszkód. {Trzy stacje nadające inną muzykę rozkręcą każdego|Zagraj od popu, po mocnego rocka i techno na 3 kanałach|Słuchawki same łączą się z sygnałem}.",
            "Koszt wysyłki sprzętu na wynajem do lokalizacji {city} jest u nas {minimalizowany|prosty i przejrzysty|stały i bezpieczny}. {Dostarczamy skrzynie pełne mocy|Twoja paczka przyjdzie w solidnym futerale transportowym|Oszczędzasz na wynajęciu drogich głośników}. {Zastosowana technologia zapobiega opóźnieniom|Sygnał FM Double PLL chroni przed lagami|Gwarancja 500m to całkowita swoboda}."
        ],
        sales: [
            "<p>Wynajem słuchawek z darmową opcją rezerwacji. Obszar działania to m.in. <strong>{city}</strong>. {Wypożycz zestaw plug & play|Kup bilet na własną integrację wynajmując zestaw|Zostań swoim własnym DJem}. Słuchawki dotrą naładowane, poddane profesjonalnej procedurze sanityzacji z dedykowanymi gumkami higienicznymi.</p>",
            "<p>Zastanawiasz się nad atrakcją na wesele lub domówkę (Region: <strong>{city}</strong>)? Nasz sprzęt wyeliminuje ryzyko wzywania służb a dodatkowo {stworzy niesamowity efekt LED w ciemności|wytworzy świetny klimat rave|zrobi robotę przy poprawinach}. Wypełnij kreator w górnej sekcji a wyślemy sprzęt pod Twoje drzwi w określonym dniu.</p>"
        ],
        hook: [
            "Bezprzewodowy sprzęt na wynajem - {city}.",
            "Wypożyczalnia słuchawek Silent Disco ({city} i wsie dookoła).",
            "Słuchawki plug&play z dostawą pod drzwi - {city}."
        ]
    },
    oferta_b2b: {
        seo: [
            "Silent Disco dla B2B w mieście {city}. {Kompleksowa organizacja z fakturą VAT|Jako profesjonaliści wiemy jak podejść do korporacji|Gwarantujemy pewność działania w ramach umowy}. {Zapewniamy obsługę DJ-ska na wyłączność|Montujemy sprzęt w każdym holu czy hotelu|Działamy certyfikowanym sprzętem HD Sound}.",
            "Imprezy firmowe w paśmie {city} często {napotykają barierę ciszy nocnej hoteli|muszą odbywać się w wydzielonych strefach|potrzebują elementu 'zaskoczenia'}. {Nasze słuchawki RF to świetny ROI dla integracji|Z nami masz pewność poprawy nastrojów zespołu|Silent Disco przełamuje bariery wiekowe pracowników}. {Obsługiwaliśmy eventy na kilka tysięcy głów|Posiadamy wielki magazy centralny gotów na realizację wielkich projektów|Jesteśmy top-rankingową marką B2B}.",
            "Organizacja konferencji B2B lub bankietu na terenie miejscowości {city}. {Nasz kalkulator natychmiast generuje plik PDF do wycen z zarządem|Otrzymasz opiekuna klienta i support as it happens|Nasze słuchawki działają nieprzerwanie przez 10h trwania bloków}. {Dodatkowo sprzęt wspiera do 3 symultanicznych tłumaczeń dziękowych na żywo|System radzi sobie swobodnie jako zestaw tour-guide|Wyeliminuj problem echa w pustych akustycznie halach}."
        ],
        sales: [
            "<p>Jako Manager w firmie (<strong>{city}</strong>) szukasz wysokiego zwrotu z inwestycji w imprezę (ROI). Klasyczne głośniki dzielą pracowników i izolują starszą gwardię. <em>Silent Disco z 3 kanałami muzycznymi jednocześnie łączy wszystkie pokolenia pracownicze w jednym tańcu.</em> {Wydajemy faktury z odroczonym terminem|Zapewniamy pomoc techniczną|Gwarantujemy brak opóźnień podczas prezentacji}.</p>",
            "<p>Profesjonalny event firmowy dla setek pracowników w lokalizacji <strong>{city}</strong>? Odbieramy ten stres z Twoich pleców. Posiadamy logistykę radzącą sobie ze sterylizacją setek sztuk słuchawek na raz. {Nasz support przygotuje scenę z DJ-em|Wyślemy nasz team do obsługi bramek|Przeszkolimy hosty do skanowania sprzętu z użyciem CichoszauRent}. Skonfiguruj wycenę w naszym portalu B2B.</p>"
        ],
        hook: [
            "Imprezy firmowe B2B z wysokim ROI - {city}.",
            "Unikalne integracje i konferencje dla firm w {city}.",
            "Organizacja bankietów korporacyjnych przy użyciu Silent Disco - {city}."
        ]
    },
    oferta_festiwale: {
        seo: [
            "Organizacja festiwalu w mieście {city} jeszcze nigdy nie była tak prosta i cicha dla otoczenia. {Nasze Silent Disco na festiwale pozwala na zabawę tysięcy osób|Trzy kanały muzyczne zadowolą fanów różnych gatunków na jednej scenie|Zbuduj scenę bez ogromnych rzędów głośników i omiń restrykcje hałasu}. {Wysyłamy sprzęt w solidnych skrzyniach logistycznych|Odbierasz naładowane i zdezynfekowane słuchawki|Nasz system sprawdził się już na największych wydarzeniach masowych w Polsce}.",
            "Silent Disco na festiwale w {city} {to hit ostatnich sezonów letnich|gwarantuje niezapomniane emocje dla uczestników|to idealne rozszerzenie każdego line-up'u muzycznego}. {Zorganizuj aktywne pole namiotowe z całonocną muzyką|Obejdź denerwującą ciszę nocną i bawcie się do białego rana|Oferujemy specjalny system dystrybucji na bramkach z aplikacją CichoszauRent}. {Obsługujemy eventy od stu do paru tysięcy uczestników|Zapewniamy wsparcie techniczne na żywo|System świetnie radzi sobie z zasięgiem do 500m w terenie otwartym}.",
            "{Szukasz sposobu na urozmaicenie festiwalu w mieście|Twój nadchodzący festiwal w lokalizacji|Masowe imprezy plenerowe na obszarze} {city} {często zmagają się z trudnymi limitami dźwięku|to idealne miejsce na wyizolowaną strefę Silent Disco|zyskają prestiż dzięki trzem kanałom muzycznym RF}. {Jesteśmy dumnym partnerem największych festiwali|Nasze słuchawki z wbudowanymi LED'ami świecą w rytm muzyki tworząc niesamowitą aurę w nocy|Dostarczamy sprzęt razem z bramkami do wydawania}."
        ],
        sales: [
            "<p>Tworzysz festiwal muzyczny (<strong>{city}</strong>) i szukasz ukrytej lub dodatkowej sceny, która nie będzie zakłócać głównego potężnego nagłośnienia? <em>System Silent Disco działający płynnie na 3 kanałach to absolutny lodołamacz festiwalowy.</em> {Twój line-up może trwać śmiało po 22:00 bez stresu i mandatów|Oferujemy potężne rabaty B2B na wynajem długoterminowy|Wydajemy sprzęt płynnie z wykorzystaniem naszej aplikacji CichoszauRent prosto na bramkach}. To koniec zmartwień logistycznych.</p>",
            "<p>Rozszerz aktualną ofertę swojego festiwalu w lokalizacji <strong>{city}</strong> o innowacyjną strefę Silent Disco. Zasięg wynoszący bezpieczne 500m pozwala na nieskrępowaną zabawę w plenerze dla dzikiego tłumu, a wbudowane mocne baterie litowe wytrzymują śmiało do 10 godzin tańca. {Przygotujemy dla Ciebie w pełni indywidualną wycenę z obsługą techniczną|Wyślemy sprzęt pod wskazany punkt festiwalowy precyzyjnie o czasie|Dysponujemy bazą logistyczną tysięcy słuchawek gotowych na Twoje ogromne wydarzenie}.</p>"
        ],
        hook: [
            "Silent Disco na największe festiwale letnie w mieście {city}.",
            "Organizacja cichej sceny z wielkim rozmachem na Twoim festiwalu - {city}.",
            "Wynajem setek słuchawek na imprezy masowe i outdoor w {city}."
        ]
    }
};

const DUMMY_FALLBACKS = {
    cennik: "oferta_wynajem",
    oferta_eventy_firmowe: "oferta_b2b",
    oferta_konferencje: "oferta_b2b",
    strona_glowna: "strona_glowna",
    oferta_wynajem: "oferta_wynajem",
    oferta_b2b: "oferta_b2b",
    oferta_beach_bary: "oferta_wynajem",
    oferta_kino_plenerowe: "oferta_b2b",
    oferta_teatr_silent: "oferta_b2b"
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const parseSpintax = (text) => text.replace(/\{([^{}]+)\}/g, (match, options) => getRandom(options.split('|')));

// Expose a public function we can call later
export const generateVariants = (city, type) => {
    // try direct match, else try fallback mapping, else fallback to 'strona_glowna'
    let templateKey = type;
    if (!spintax[templateKey]) {
        templateKey = DUMMY_FALLBACKS[type] || 'strona_glowna';
    }

    const t = spintax[templateKey];
    
    // Inject city and execute spintax logic to get highly unique combinations
    const raw_seo = getRandom(t.seo);
    const raw_sales = getRandom(t.sales);
    const raw_hook = getRandom(t.hook);
    
    const final_seo = parseSpintax(raw_seo.replace(/\{city\}/g, city));
    const final_sales = parseSpintax(raw_sales.replace(/\{city\}/g, city));
    const final_hook = parseSpintax(raw_hook.replace(/\{city\}/g, city));
    
    // Random boolean for opcja_roi
    const roi = Math.random() > 0.5 ? "true" : "false";

    return { hook: final_hook, sales: final_sales, seo: final_seo, roi };
};
