import { useState } from "react";
import "./Animals.css";

type Animal = { emoji: string; name: string; sound: string; facts: string[] };

const ANIMALS: Animal[] = [
  {
    emoji: "🐶", name: "Hunden", sound: "Vov vov!",
    facts: [
      "Hundar har ett jättebra luktsinne. De kan känna lukter som vi aldrig kan känna.",
      "Hundar viftar på svansen när de är glada.",
      "Små hundvalpar kan inte se när de föds. De öppnar ögonen efter ungefär två veckor.",
      "Hunden flämtar med tungan ute när den är varm, för att kyla sig.",
      "Hundar kan höra ljud som är för höga för oss.",
      "Varje hunds nos har sitt eget mönster, precis som våra fingeravtryck.",
      "Hundar kommer från vargar för jättelänge sedan.",
      "Hundar rör ofta på tassarna när de sover, kanske för att de drömmer.",
    ],
  },
  {
    emoji: "🐱", name: "Katten", sound: "Mjau!",
    facts: [
      "Katter sover jättemycket, ofta mer än halva dagen.",
      "Katter spinner när de är nöjda.",
      "Kattens morrhår hjälper den att känna var den kan ta sig fram.",
      "Katter kan hoppa många gånger högre än de själva är långa.",
      "Katter ser bra även när det nästan är mörkt.",
      "Katten tvättar sig med tungan, som är lite sträv.",
      "Katter landar oftast på fötterna när de ramlar.",
      "Katter lägger öronen bakåt när de är arga eller rädda.",
    ],
  },
  {
    emoji: "🐘", name: "Elefanten", sound: "Tuuut!",
    facts: [
      "Elefanten använder snabeln som en hand, som en dusch och som en trumpet.",
      "Elefanten är det största djuret som lever på land.",
      "Elefanter fläktar med sina stora öron när de är varma.",
      "Elefantungen heter kalv och dricker mjölk av sin mamma.",
      "Elefanter kan simma och använder snabeln som en snorkel.",
      "Elefantens betar är egentligen jättelånga tänder.",
      "Elefanter äter gräs, blad och frukt nästan hela dagen.",
      "Elefanter känner igen sina vänner och kommer ihåg dem länge.",
    ],
  },
  {
    emoji: "🦒", name: "Giraffen", sound: "Hmm hmm!",
    facts: [
      "Giraffen har en jättelång hals. Ändå har den lika många halskotor som du: sju stycken.",
      "Giraffens tunga är ungefär en halv meter lång.",
      "Alla giraffer har olika fläckar, precis som vi har olika fingeravtryck.",
      "Giraffen äter blad från höga träd.",
      "Giraffen är världens högsta djur.",
      "Giraffungen kan stå upp och gå bara en kort stund efter att den är född.",
      "Giraffen sover bara en liten stund, ofta stående.",
      "Giraffer kan springa ganska snabbt, trots sina långa ben.",
    ],
  },
  {
    emoji: "🐧", name: "Pingvinen", sound: "Kvack!",
    facts: [
      "Pingviner kan inte flyga, men de är jättebra på att simma.",
      "Pingviner bor långt söderut, till exempel vid Sydpolen.",
      "Kejsarpingvinens pappa håller ägget varmt på sina fötter.",
      "Pingvinens täta fjädrar gör att den håller sig varm och torr i vattnet.",
      "Pingviner åker ibland på magen över isen, som på en kälke.",
      "Pingvinens vingar fungerar som simfenor.",
      "Pingviner går vaggande från sida till sida.",
      "Pingviner äter fisk och små djur som lever i havet.",
    ],
  },
  {
    emoji: "🦉", name: "Ugglan", sound: "Hu-hu!",
    facts: [
      "Ugglan kan vrida huvudet nästan ett helt varv runt.",
      "Ugglan är mest vaken på natten och ser jättebra i mörker.",
      "Ugglan flyger nästan helt tyst.",
      "Ugglan kan inte flytta på ögonen, så den vrider på huvudet i stället.",
      "Ugglans runda ansikte hjälper den att höra ljud.",
      "Ugglan har jättestora ögon.",
      "Ugglan jagar små djur, som möss.",
      "Det finns över 200 olika sorters ugglor.",
    ],
  },
  {
    emoji: "🐸", name: "Grodan", sound: "Kvack kvack!",
    facts: [
      "Grodan börjar som ett litet ägg. Sedan blir den en yngel med svans, och till slut en groda.",
      "Grodan kan hoppa långt med sina starka bakben.",
      "Grodan kan andas lite genom huden.",
      "Grodan fångar flugor med sin klibbiga tunga.",
      "Grodan lägger sina ägg i vatten. Äggen kallas grodrom.",
      "Grodor kväker för att prata med andra grodor.",
      "Grodans ögon sitter högt upp, så den kan titta upp ur vattnet.",
      "Grodor byter hud ibland, som en gammal tröja.",
    ],
  },
  {
    emoji: "🐝", name: "Bin", sound: "Bzzzz!",
    facts: [
      "Bin samlar nektar från blommor och gör honung av den.",
      "Bin dansar för att visa varandra var blommorna finns.",
      "Många bin bor tillsammans i en bikupa.",
      "När bin flyger mellan blommor hjälper de blommorna att bli frön och frukt.",
      "Ett bi har fem ögon.",
      "Bin surrar för att deras vingar slår jättesnabbt.",
      "Det är drottningen i bikupan som lägger äggen.",
      "Bin bär med sig blompollen i små korgar på bakbenen.",
    ],
  },
  {
    emoji: "🦋", name: "Fjärilen", sound: "Fff fff!",
    facts: [
      "Fjärilen var en larv först. Sedan blev den en puppa, och till slut en fjäril.",
      "Fjärilens vingar är täckta av jättesmå färgglada fjäll.",
      "Fjärilen smakar med fötterna.",
      "Fjärilen dricker nektar med en lång, tunn sugsnabel.",
      "Fjärilar har fyra vingar.",
      "Fjärilar värmer sig i solen innan de flyger.",
      "Larven äter massor av blad innan den blir en puppa.",
      "Fjärilens långa spröt hjälper den att lukta sig fram till blommor.",
    ],
  },
  {
    emoji: "🐋", name: "Valen", sound: "Uuuuu!",
    facts: [
      "Valen är världens största djur, och den bor i havet.",
      "Valen andas luft genom ett hål på ryggen. Ibland sprutar det upp vatten.",
      "Valar sjunger långa sånger till varandra under vattnet.",
      "Valen är ingen fisk. Valungen dricker mjölk av sin mamma.",
      "Blåvalen är större än någon dinosaurie vi känner till.",
      "Blåvalen äter jättesmå djur som kallas krill.",
      "Valar hoppar ibland upp ur vattnet.",
      "Valar kan hålla andan länge när de dyker.",
    ],
  },
  {
    emoji: "🐮", name: "Kossan", sound: "Muuu!",
    facts: [
      "Kossan äter gräs nästan hela dagen och ger oss mjölk.",
      "Kossan har en mage med fyra delar.",
      "Kor tuggar om sin mat flera gånger, för att den ska bli lättare att smälta.",
      "Kokalven dricker mjölk av sin mamma.",
      "Kossan drar in gräs med sin långa tunga.",
      "En ko dricker flera hinkar vatten varje dag.",
      "Kor kan känna igen varandra.",
      "Kossans klövar är delade i två delar.",
    ],
  },
  {
    emoji: "🦁", name: "Lejonet", sound: "Roooar!",
    facts: [
      "Lejon bor tillsammans i en flock. Lejonhanen har en stor man runt huvudet.",
      "Lejonets rytande hörs flera kilometer bort.",
      "Det är oftast lejonhonorna som jagar åt flocken.",
      "Lejon sover mer än halva dagen.",
      "Lejonungar har fläckar när de är små.",
      "Lejon är de enda stora kattdjuren som bor i flock.",
      "Lejon bor mest i Afrika.",
      "Lejonets tunga är sträv som sandpapper.",
    ],
  },
  {
    emoji: "🐌", name: "Snigeln", sound: "Sch sch!",
    facts: [
      "Snigeln har sitt hus på ryggen och bär med sig det överallt.",
      "Snigeln har ögonen längst ut på sina långa känselspröt.",
      "Snigeln lämnar ett glansigt slemspår efter sig när den kryper.",
      "Snigeln kryper väldigt, väldigt långsamt.",
      "Snigeln har tusentals pyttesmå tänder på tungan.",
      "Snigeln kan dra in hela sig i sitt hus.",
      "Snigeln gillar regn och fuktigt väder.",
      "Snigeln äter blad och andra växter.",
    ],
  },
  {
    emoji: "🐰", name: "Kaninen", sound: "Hopp hopp!",
    facts: [
      "Kaninens långa öron hjälper den att höra när någon kommer.",
      "Kaniner kan hoppa högt och snabbt för att komma undan.",
      "Kaninens tänder växer hela livet, så den behöver gnaga på saker.",
      "Kaniner äter helst hö och gräs, och de gillar morötter också.",
      "Kaninen kan se nästan hela vägen runt huvudet utan att vrida det.",
      "Kaniner bor ofta i gångar under jorden.",
      "Glada kaniner gör glädjehopp i luften.",
      "Kaninens nos rör sig jättesnabbt hela tiden.",
    ],
  },
  {
    emoji: "🐷", name: "Grisen", sound: "Nöff nöff!",
    facts: [
      "Grisar är mycket smarta djur och tycker om att leka.",
      "Grisar kan inte svettas, så de rullar sig i lera för att svalka sig.",
      "Grisen har ett jättebra luktsinne och använder nosen för att hitta mat.",
      "Små grisar kallas smågrisar, och de leker med varandra.",
      "Grisar kan lära sig knep, ungefär som hundar.",
      "Grisens nos kallas tryne.",
      "Grisar grymtar för att prata med varandra.",
      "Grisar sover gärna tätt ihop.",
    ],
  },
];

const IMAGE: Record<string, string> = {
  Hunden: "dog.jpg",
  Katten: "cat.jpg",
  Elefanten: "elephant.jpg",
  Giraffen: "giraffe.jpg",
  Pingvinen: "penguin.jpg",
  Ugglan: "owl.png",
  Grodan: "frog.jpg",
  Bin: "bee.jpg",
  Fjärilen: "butterfly.jpg",
  Valen: "whale.jpg",
  Kossan: "cow.jpg",
  Lejonet: "lion.jpg",
  Snigeln: "snail.jpg",
  Kaninen: "rabbit.jpg",
  Grisen: "pig.jpg",
};

function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = synth
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith("sv"));
    if (voice) u.voice = voice;
    u.lang = "sv-SE";
    u.rate = 0.85;
    setTimeout(() => synth.speak(u), 60);
  } catch {
    /* ljud är en bonus */
  }
}

export default function Animals({
  onBack,
  sound,
}: {
  onBack: () => void;
  sound: boolean;
}) {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * ANIMALS.length)
  );
  const [bounce, setBounce] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
 const [visits, setVisits] = useState<Record<string, number>>({});

const animal = ANIMALS[index];
const fact = animal.facts[(visits[animal.name] ?? 0) % animal.facts.length];
  const canSpeak = sound && "speechSynthesis" in window;
  const showPhoto = !failed.includes(animal.name) && IMAGE[animal.name];

  const go = (step: number) => {
  const next = (index + step + ANIMALS.length) % ANIMALS.length;
  const name = ANIMALS[next].name;
  setIndex(next);
  setVisits((v) => ({ ...v, [name]: (v[name] ?? -1) + 1 }));
};
  return (
    <div className="animals-app">
      <header className="animals-header">
        <button className="animals-btn animals-back" onClick={onBack}>
          ← Tillbaka
        </button>
        <h1>🐾 Djur</h1>
        <div className="animals-count">
          {index + 1} / {ANIMALS.length}
        </div>
      </header>

      <main className="animals-card" key={index}>
        <button
          className="animal-emoji"
          key={bounce}
          onClick={() => {
            setBounce((b) => b + 1);
            if (canSpeak) speak(animal.sound);
          }}
          aria-label={`${animal.name}, tryck för att höra lätet`}
        >
          {showPhoto ? (
            <img
              className="animal-photo"
              src={`/animals/${IMAGE[animal.name]}`}
              alt={animal.name}
              draggable={false}
              onError={() => setFailed((f) => [...f, animal.name])}
            />
          ) : (
            animal.emoji
          )}
              </button>
        {/* <div className="animal-sound">{animal.sound}</div> */}
        <h2 className="animal-name">{animal.name}</h2>
        <p className="animal-fact">{fact}</p>
      </main>

      <footer className="animals-nav">
        <button className="animals-btn" onClick={() => go(-1)}>
          ← Förra
        </button>
        {canSpeak && (
          <button
            className="animals-btn animals-listen"
            onClick={() => speak(`${animal.name}. ${fact}`)}
          >
            🔊 Lyssna
          </button>
        )}
        <button className="animals-btn animals-next" onClick={() => go(1)}>
          Nästa →
        </button>
      </footer>
    </div>
  );
}