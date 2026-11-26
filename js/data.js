/* StudiumGo — Latijnse woordenschat, hoofdstukken, stamtijden en grammatica.
   Eigen, vrije woordenschat: geen letterlijke lijsten uit lesboeken. */
(function () {
  "use strict";

  var CAPITULA = [
    { n: 1,  title: "Familie & mensen",   latin: "Familia et homines" },
    { n: 2,  title: "Stad & land",        latin: "Urbs et ager" },
    { n: 3,  title: "Werkwoorden 1",      latin: "Verba prima" },
    { n: 4,  title: "Werkwoorden 2",      latin: "Verba secunda" },
    { n: 5,  title: "Bijvoeglijk",        latin: "Adiectiva" },
    { n: 6,  title: "Getallen & tijd",    latin: "Numeri et tempus" },
    { n: 7,  title: "School & studie",    latin: "Schola et studium" },
    { n: 8,  title: "Oorlog & vrede",     latin: "Bellum et pax" },
    { n: 9,  title: "Natuur & dieren",    latin: "Natura et animalia" },
    { n: 10, title: "Eten & drinken",     latin: "Cibus et potus" },
    { n: 11, title: "Gevoel & gedachte",  latin: "Animus et sensus" },
    { n: 12, title: "Abstracte begrippen",latin: "Res et notiones" }
  ];

  // [Latijn, Nederlands, caput, woordsoort]
  var RAW = [
    // 1 — Familie & mensen
    ["pater","vader",1,"zn."],["māter","moeder",1,"zn."],["fīlius","zoon",1,"zn."],["fīlia","dochter",1,"zn."],
    ["frāter","broer",1,"zn."],["soror","zus",1,"zn."],["avus","grootvader",1,"zn."],["avia","grootmoeder",1,"zn."],
    ["uxor","vrouw / echtgenote",1,"zn."],["marītus","man / echtgenoot",1,"zn."],["līberī","kinderen",1,"zn."],
    ["parens","ouder",1,"zn."],["familia","familie / huishouden",1,"zn."],["servus","slaaf",1,"zn."],
    ["ancilla","slavin",1,"zn."],["dominus","heer / meester",1,"zn."],["hospes","gast / gastheer",1,"zn."],
    ["vicīnus","buur",1,"zn."],["amīcus","vriend",1,"zn."],["inimīcus","vijand",1,"zn."],
    ["sodālis","makker / kameraad",1,"zn."],["comes","metgezel",1,"zn."],["rēx","koning",1,"zn."],
    ["rēgīna","koningin",1,"zn."],["princeps","vorst / eerste",1,"zn."],["deus","god",1,"zn."],
    ["dea","godin",1,"zn."],["sacerdōs","priester",1,"zn."],["poēta","dichter",1,"zn."],
    ["scrīptor","schrijver",1,"zn."],["pictor","schilder",1,"zn."],["cantor","zanger",1,"zn."],
    ["magister","leraar",1,"zn."],["magistra","lerares",1,"zn."],["discipulus","leerling",1,"zn."],
    ["discipula","leerlinge",1,"zn."],["medicus","arts",1,"zn."],["nauta","zeeman",1,"zn."],
    ["agricola","boer",1,"zn."],["faber","ambachtsman",1,"zn."],["mercātor","koopman",1,"zn."],
    ["iūdex","rechter",1,"zn."],["senātor","senator",1,"zn."],["cōnsul","consul",1,"zn."],
    ["praetor","praetor (magistraat)",1,"zn."],["quaestor","quaestor (ambtenaar)",1,"zn."],
    ["tribūnus","tribuun",1,"zn."],["lēgātus","gezant / legaat",1,"zn."],

    // 2 — Stad & land
    ["oppidum","stadje / vesting",2,"zn."],["urbs","stad",2,"zn."],["vīcus","dorp / wijk",2,"zn."],
    ["castellum","kasteel / fort",2,"zn."],["domus","huis",2,"zn."],["porta","poort",2,"zn."],
    ["mūrus","muur",2,"zn."],["via","weg / straat",2,"zn."],["sēmita","pad",2,"zn."],
    ["platea","plein",2,"zn."],["forum","marktplein / forum",2,"zn."],["templum","tempel",2,"zn."],
    ["cūria","raadhuis / curia",2,"zn."],["basilica","basiliek",2,"zn."],["theātrum","theater",2,"zn."],
    ["ager","akker / land",2,"zn."],["hortus","tuin",2,"zn."],["silva","bos",2,"zn."],
    ["mōns","berg",2,"zn."],["collis","heuvel",2,"zn."],["vallis","dal",2,"zn."],
    ["flūmen","rivier",2,"zn."],["rīvus","beek",2,"zn."],["fōns","bron",2,"zn."],
    ["lacus","meer",2,"zn."],["mare","zee",2,"zn."],["lītus","strand / kust",2,"zn."],
    ["īnsula","eiland",2,"zn."],["terra","land / aarde",2,"zn."],["caelum","hemel",2,"zn."],
    ["sōl","zon",2,"zn."],["lūna","maan",2,"zn."],["stella","ster",2,"zn."],
    ["nūbēs","wolk",2,"zn."],["ventus","wind",2,"zn."],["pluvia","regen",2,"zn."],
    ["nix","sneeuw",2,"zn."],["glaciēs","ijs",2,"zn."],["tempestās","storm / onweer",2,"zn."],

    // 3 — Werkwoorden 1
    ["sum","ik ben",3,"ww."],["habeō","ik heb",3,"ww."],["dō","ik geef",3,"ww."],
    ["accipiō","ik ontvang / neem aan",3,"ww."],["videō","ik zie",3,"ww."],["audiō","ik hoor",3,"ww."],
    ["dīcō","ik zeg / vertel",3,"ww."],["faciō","ik maak / doe",3,"ww."],["eō","ik ga",3,"ww."],
    ["veniō","ik kom",3,"ww."],["maneō","ik blijf",3,"ww."],["sedeō","ik zit",3,"ww."],
    ["stō","ik sta",3,"ww."],["ambulō","ik loop",3,"ww."],["currō","ik ren",3,"ww."],
    ["vocō","ik roep / noem",3,"ww."],["rogō","ik vraag",3,"ww."],["respondeō","ik antwoord",3,"ww."],
    ["scrībō","ik schrijf",3,"ww."],["legō","ik lees",3,"ww."],["discō","ik leer",3,"ww."],
    ["doceō","ik onderwijs / leer",3,"ww."],["intellegō","ik begrijp",3,"ww."],["sciō","ik weet",3,"ww."],
    ["nesciō","ik weet niet",3,"ww."],["volō","ik wil",3,"ww."],["nōlō","ik wil niet",3,"ww."],
    ["possum","ik kan",3,"ww."],["dēbeō","ik moet / verschuldig",3,"ww."],["cupiō","ik verlang",3,"ww."],
    ["conor","ik probeer",3,"ww."],["audeō","ik durf",3,"ww."],["soleō","ik pleeg / ben gewend",3,"ww."],

    // 4 — Werkwoorden 2
    ["amō","ik houd van / bemin",4,"ww."],["ōdī","ik haat",4,"ww."],["timeō","ik vrees",4,"ww."],
    ["spērō","ik hoop",4,"ww."],["crēdō","ik geloof",4,"ww."],["putō","ik denk / meen",4,"ww."],
    ["cōgitō","ik denk na",4,"ww."],["quaerō","ik zoek / vraag",4,"ww."],["inveniō","ik vind",4,"ww."],
    ["perdō","ik verlies / vernietig",4,"ww."],["servō","ik red / bewaar",4,"ww."],
    ["custōdiō","ik bewaak",4,"ww."],["laudō","ik prijs",4,"ww."],["vituperō","ik laak",4,"ww."],
    ["pūniō","ik straf",4,"ww."],["līberō","ik bevrijd",4,"ww."],["iuvō","ik help",4,"ww."],
    ["noceō","ik schaad",4,"ww."],["placeō","ik behaag",4,"ww."],["displaceō","ik mishaag",4,"ww."],
    ["gaudeō","ik verheug me",4,"ww."],["doleō","ik voel pijn / treur",4,"ww."],["fleō","ik huil",4,"ww."],
    ["rīdeō","ik lach",4,"ww."],["clāmō","ik roep luid",4,"ww."],["pugno","ik vecht",4,"ww."],
    ["vincō","ik win / overwinn",4,"ww."],["fugiō","ik vlucht",4,"ww."],["sequor","ik volg",4,"ww."],
    ["loquor","ik spreek",4,"ww."],["hortor","ik moedig aan",4,"ww."],["minitor","ik dreig",4,"ww."],

    // 5 — Bijvoeglijk naamwoord
    ["bonus","goed",5,"bn."],["malus","slecht",5,"bn."],["magnus","groot",5,"bn."],
    ["parvus","klein",5,"bn."],["multus","veel",5,"bn."],["paucus","weinig",5,"bn."],
    ["longus","lang",5,"bn."],["brevis","kort",5,"bn."],["altus","hoog / diep",5,"bn."],
    ["humilis","laag / nederig",5,"bn."],["lātus","breed",5,"bn."],["angustus","smal",5,"bn."],
    ["novus","nieuw",5,"bn."],["vetus","oud",5,"bn."],["iuvenis","jong",5,"bn."],
    ["senex","oud / bejaard",5,"bn."],["pulcher","mooi",5,"bn."],["turpis","lelijk / schandelijk",5,"bn."],
    ["fortis","sterk / dapper",5,"bn."],["dēbilis","zwak",5,"bn."],["celer","snel",5,"bn."],
    ["tardus","langzaam",5,"bn."],["clārus","helder / beroemd",5,"bn."],["obscūrus","donker / onduidelijk",5,"bn."],
    ["dulcis","zoet / aangenaam",5,"bn."],["amarus","bitter",5,"bn."],["facilis","makkelijk",5,"bn."],
    ["difficilis","moeilijk",5,"bn."],["vērus","waar",5,"bn."],["falsus","vals",5,"bn."],
    ["iūstus","rechtvaardig",5,"bn."],["iniūstus","onrechtvaardig",5,"bn."],["sapiens","wijs",5,"bn."],
    ["stultus","dwaas",5,"bn."],["honestus","eervol",5,"bn."],["ūtilis","nuttig",5,"bn."],

    // 6 — Getallen & tijd
    ["ūnus","één",6,"telw."],["duo","twee",6,"telw."],["trēs","drie",6,"telw."],
    ["quattuor","vier",6,"telw."],["quīnque","vijf",6,"telw."],["sex","zes",6,"telw."],
    ["septem","zeven",6,"telw."],["octō","acht",6,"telw."],["novem","negen",6,"telw."],
    ["decem","tien",6,"telw."],["ūndecim","elf",6,"telw."],["duodecim","twaalf",6,"telw."],
    ["centum","honderd",6,"telw."],["mīlle","duizend",6,"telw."],["prīmus","eerste",6,"telw."],
    ["secundus","tweede",6,"telw."],["tertius","derde",6,"telw."],["quārtus","vierde",6,"telw."],
    ["quīntus","vijfde",6,"telw."],["hodiē","vandaag",6,"bw."],["herī","gisteren",6,"bw."],
    ["crās","morgen",6,"bw."],["māne","'s ochtends",6,"bw."],["merīdiēs","middag",6,"zn."],
    ["vesper","avond",6,"zn."],["nox","nacht",6,"zn."],["diēs","dag",6,"zn."],
    ["hebdomada","week",6,"zn."],["mēnsis","maand",6,"zn."],["annus","jaar",6,"zn."],
    ["aetās","leeftijd / tijdperk",6,"zn."],["hōra","uur",6,"zn."],["mōmentum","moment / ogenblik",6,"zn."],
    ["semper","altijd",6,"bw."],["numquam","nooit",6,"bw."],["saepe","vaak",6,"bw."],
    ["rārō","zelden",6,"bw."],["iam","al / reeds",6,"bw."],["nōndum","nog niet",6,"bw."],
    ["tandem","eindelijk",6,"bw."],["aliquandō","soms / ooit",6,"bw."],["interdum","af en toe",6,"bw."],

    // 7 — School & studie
    ["littera","letter",7,"zn."],["litterae","brieven / literatuur",7,"zn."],["liber","boek",7,"zn."],
    ["pāgina","bladzijde / pagina",7,"zn."],["verbum","woord",7,"zn."],["sententia","zin / mening",7,"zn."],
    ["nōmen","naam",7,"zn."],["cāsus","naamval / casus",7,"zn."],["numerus","getal / aantal",7,"zn."],
    ["genus","geslacht / soort",7,"zn."],["dēclinātiō","verbuiging",7,"zn."],["coniugātiō","vervoeging",7,"zn."],
    ["tempus","tijd / tijdsvorm",7,"zn."],["modus","wijze / modus",7,"zn."],["vōx","stem / woord",7,"zn."],
    ["studium","studie / ijver",7,"zn."],["schola","school",7,"zn."],["lūdus","school / spel",7,"zn."],
    ["examen","examen / toets",7,"zn."],["nota","aantekening / cijfer",7,"zn."],["scientia","kennis / wetenschap",7,"zn."],
    ["ars","kunst / vaardigheid",7,"zn."],["doctrīna","leer / onderwijs",7,"zn."],["historia","geschiedenis",7,"zn."],
    ["philosophia","filosofie",7,"zn."],["grammatica","grammatica",7,"zn."],["rhētorica","retorica / welsprekendheid",7,"zn."],
    ["poēma","gedicht",7,"zn."],["carmen","lied / gedicht",7,"zn."],["ōrātiō","toespraak / rede",7,"zn."],
    ["epistula","brief",7,"zn."],["charta","papier",7,"zn."],["atrāmentum","inkt",7,"zn."],
    ["stilus","schrijfstift / stijl",7,"zn."],["tabula","tafel / bord",7,"zn."],

    // 8 — Oorlog & vrede
    ["bellum","oorlog",8,"zn."],["pāx","vrede",8,"zn."],["hostis","vijand (staat)",8,"zn."],
    ["socius","bondgenoot / makker",8,"zn."],["foedus","verbond / verdrag",8,"zn."],
    ["victōria","overwinning",8,"zn."],["clādēs","nederlaag / ramp",8,"zn."],["exercitus","leger",8,"zn."],
    ["legiō","legioen",8,"zn."],["cohors","cohort",8,"zn."],["mīles","soldaat",8,"zn."],
    ["eques","ruiter",8,"zn."],["pedes","voetsoldaat",8,"zn."],["dux","leider / aanvoerder",8,"zn."],
    ["imperātor","keizer / opperbevelhebber",8,"zn."],["arma","wapens",8,"zn."],["gladius","zwaard",8,"zn."],
    ["scūtum","schild",8,"zn."],["hasta","lans / speer",8,"zn."],["sagitta","pijl",8,"zn."],
    ["arcus","boog",8,"zn."],["castra","legerkamp",8,"zn."],["vallum","wal / palissade",8,"zn."],
    ["obsidiō","belegering",8,"zn."],["triumphus","triomf",8,"zn."],["captīvus","gevangene",8,"zn."],
    ["vulnus","wond",8,"zn."],["mors","dood",8,"zn."],["vīta","leven",8,"zn."],
    ["pugna","gevecht / slag",8,"zn."],["aciēs","slagorde / legerlinie",8,"zn."],["sīgnum","teken / vaandel",8,"zn."],
    ["tuba","trompet",8,"zn."],["praeda","buit",8,"zn."],["spolia","oorlogsbuit",8,"zn."],

    // 9 — Natuur & dieren
    ["animal","dier",9,"zn."],["bestia","beest / wild dier",9,"zn."],["equus","paard",9,"zn."],
    ["bōs","koe / rund",9,"zn."],["ovis","schaap",9,"zn."],["caper","bok / geit",9,"zn."],
    ["porcus","varken",9,"zn."],["canis","hond",9,"zn."],["fēlēs","kat",9,"zn."],
    ["mūs","muis",9,"zn."],["avis","vogel",9,"zn."],["piscis","vis",9,"zn."],
    ["serpēns","slang",9,"zn."],["rāna","kikker",9,"zn."],["formīca","mier",9,"zn."],
    ["apis","bij",9,"zn."],["arānea","spin",9,"zn."],["arbor","boom",9,"zn."],
    ["rādīx","wortel",9,"zn."],["rāmus","tak",9,"zn."],["folium","blad",9,"zn."],
    ["flōs","bloem",9,"zn."],["frūctus","vrucht / opbrengst",9,"zn."],["semen","zaad",9,"zn."],
    ["herba","kruid / gras",9,"zn."],["āēr","lucht",9,"zn."],["ignis","vuur",9,"zn."],
    ["aqua","water",9,"zn."],["lapis","steen",9,"zn."],["arēna","zand",9,"zn."],
    ["pulvis","stof",9,"zn."],["umbra","schaduw",9,"zn."],["lūx","licht",9,"zn."],
    ["tenebrae","duisternis",9,"zn."],["frīgus","koude",9,"zn."],["calor","warmte",9,"zn."],

    // 10 — Eten & drinken
    ["cibus","voedsel / eten",10,"zn."],["potus","drank",10,"zn."],["vīnum","wijn",10,"zn."],
    ["pānis","brood",10,"zn."],["cāseus","kaas",10,"zn."],["lac","melk",10,"zn."],
    ["mel","honing",10,"zn."],["oleum","olie",10,"zn."],["sal","zout",10,"zn."],
    ["saccharum","suiker",10,"zn."],["carō","vlees",10,"zn."],["ōvum","ei",10,"zn."],
    ["pōmum","appel / fruit",10,"zn."],["pirum","peer",10,"zn."],["uva","druif",10,"zn."],
    ["fīcus","vijg",10,"zn."],["nux","noot",10,"zn."],["cēpa","ui",10,"zn."],
    ["allium","knoflook",10,"zn."],["piper","peper",10,"zn."],["acetum","azijn",10,"zn."],
    ["mēnsa","tafel",10,"zn."],["convīvium","feest / maaltijd",10,"zn."],["cēna","avondeten",10,"zn."],
    ["prandium","middageten",10,"zn."],["ientāculum","ontbijt",10,"zn."],["gustus","smaak",10,"zn."],
    ["famēs","honger",10,"zn."],["sitis","dorst",10,"zn."],["esuriō","ik heb honger",10,"ww."],
    ["sitiō","ik heb dorst",10,"ww."],["gustō","ik proef",10,"ww."],["mandūcō","ik kauw / eet",10,"ww."],
    ["bibō","ik drink",10,"ww."],["coquō","ik kook",10,"ww."],["secō","ik snijd",10,"ww."],
    ["fundō","ik giet",10,"ww."],["misceō","ik meng",10,"ww."],["appōnō","ik zet voor / dien op",10,"ww."],

    // 11 — Gevoel & gedachte
    ["amor","liefde",11,"zn."],["odium","haat",11,"zn."],["timor","vrees / angst",11,"zn."],
    ["spēs","hoop",11,"zn."],["fidēs","vertrouwen / geloof",11,"zn."],["gaudium","vreugde",11,"zn."],
    ["dolor","pijn / verdriet",11,"zn."],["īra","woede",11,"zn."],["invidia","afgunst / jaloezie",11,"zn."],
    ["misericordia","medelijden",11,"zn."],["pudor","schaamte",11,"zn."],["glōria","roem / glorie",11,"zn."],
    ["honor","eer",11,"zn."],["ignōminia","schande",11,"zn."],["dēsiderium","verlangen",11,"zn."],
    ["cūra","zorg / bekommernis",11,"zn."],["sollicitūdō","bezorgdheid",11,"zn."],["quiēs","rust",11,"zn."],
    ["somnus","slaap",11,"zn."],["vigiliae","waakzaamheid / nachtwacht",11,"zn."],["memoria","geheugen",11,"zn."],
    ["oblīviō","vergetelheid",11,"zn."],["consilium","raad / plan",11,"zn."],["opinio","mening",11,"zn."],
    ["dubium","twijfel",11,"zn."],["certum","zekerheid",11,"zn."],["vēritās","waarheid",11,"zn."],
    ["mendācium","leugen",11,"zn."],["anxietās","angst / ongerustheid",11,"zn."],["laetitia","blijdschap",11,"zn."],
    ["tristitia","droefheid",11,"zn."],["benignitās","vriendelijkheid",11,"zn."],["malitia","kwaadaardigheid",11,"zn."],
    ["patientia","geduld",11,"zn."],["conscientia","geweten / bewustzijn",11,"zn."],

    // 12 — Abstracte begrippen
    ["rēs","zaak / ding",12,"zn."],["causa","oorzaak / reden",12,"zn."],["ratiō","rede / verhouding",12,"zn."],
    ["lēx","wet",12,"zn."],["iūs","recht",12,"zn."],["iniūria","onrecht / belediging",12,"zn."],
    ["lībertās","vrijheid",12,"zn."],["servitūs","slavernij",12,"zn."],["potestās","macht / vermogen",12,"zn."],
    ["imperium","heerschappij / rijk",12,"zn."],["rēgnum","koninkrijk",12,"zn."],["cīvitās","burgergemeenschap / stad",12,"zn."],
    ["rēspublica","republiek / gemenebest",12,"zn."],["corpus","lichaam",12,"zn."],["animus","geest / gemoed",12,"zn."],
    ["mēns","verstand / geest",12,"zn."],["spīritus","geest / adem",12,"zn."],["virtūs","deugd / moed",12,"zn."],
    ["vitium","fout / ondeugd",12,"zn."],["officium","plicht / ambt",12,"zn."],["mūnus","taak / geschenk",12,"zn."],
    ["labor","arbeid / inspanning",12,"zn."],["ōtium","vrije tijd / rust",12,"zn."],["negōtium","bezigheid / zaak",12,"zn."],
    ["perīculum","gevaar",12,"zn."],["auxilium","hulp",12,"zn."],["remedium","geneesmiddel / middel",12,"zn."],
    ["exemplum","voorbeeld",12,"zn."],["fīnis","einde / grens",12,"zn."],["initium","begin",12,"zn."],
    ["ōrdō","orde / volgorde",12,"zn."],["qualitās","hoedanigheid",12,"zn."],["quantitās","hoeveelheid",12,"zn."],
    ["substantia","zelfstandigheid / wezen",12,"zn."],["essentia","essentie / wezen",12,"zn."],
    ["ēventus","gebeurtenis / uitkomst",12,"zn."],["fortūna","lot / geluk",12,"zn."],["fātum","lot / noodlot",12,"zn."]
  ];

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  var WORDS = [];
  var seen = {};
  for (var i = 0; i < RAW.length; i++) {
    var row = RAW[i];
    var key_normalized = normalize(row[0]);
    if (seen[key_normalized]) continue;
    seen[key_normalized] = true;
    WORDS.push({
      id: key_normalized,
      latin: row[0],
      dutch: row[1],
      caput: row[2],
      pos: row[3],
      key: key_normalized
    });
  }

  // Elk leerjaar krijgt een eigen woordniveau binnen hetzelfde caput.
  // Zo oefent 1e middelbaar niet de woorden van 3e middelbaar.
  var perCaput = {};
  WORDS.forEach(function (w) {
    if (!perCaput[w.caput]) perCaput[w.caput] = [];
    perCaput[w.caput].push(w);
  });
  Object.keys(perCaput).forEach(function (c) {
    var list = perCaput[c];
    list.forEach(function (w, i) {
      w.level = Math.min(3, Math.floor((i * 3) / list.length) + 1);
    });
  });

  // Stamtijden: [praesens, infinitief, perfectum, supinum, Nederlands]
  var STEM_RAW = [
    ["amō","amāre","amāvī","amātum","houden van"],
    ["laudō","laudāre","laudāvī","laudātum","prijzen"],
    ["vocō","vocāre","vocāvī","vocātum","roepen"],
    ["ambulō","ambulāre","ambulāvī","ambulātum","lopen"],
    ["videō","vidēre","vīdī","vīsum","zien"],
    ["timeō","timēre","timuī","—","vrezen"],
    ["sedeō","sedēre","sēdī","sessum","zitten"],
    ["respondeō","respondēre","respondī","respōnsum","antwoorden"],
    ["legō","legere","lēgī","lēctum","lezen"],
    ["scrībō","scrībere","scrīpsī","scrīptum","schrijven"],
    ["dīcō","dīcere","dīxī","dictum","zeggen"],
    ["faciō","facere","fēcī","factum","maken / doen"],
    ["accipiō","accipere","accēpī","acceptum","ontvangen"],
    ["vincō","vincere","vīcī","victum","overwinnen"],
    ["currō","currere","cucurrī","cursum","rennen"],
    ["veniō","venīre","vēnī","ventum","komen"],
    ["audiō","audīre","audīvī","audītum","horen"],
    ["custōdiō","custōdīre","custōdīvī","custōdītum","bewaken"],
    ["pūniō","pūnīre","pūnīvī","pūnītum","straffen"],
    ["sum","esse","fuī","—","zijn"],
    ["habeō","habēre","habuī","habitum","hebben"],
    ["dō","dare","dedī","datum","geven"],
    ["eō","īre","īvī","itum","gaan"],
    ["possum","posse","potuī","—","kunnen"],
    ["volō","velle","voluī","—","willen"],
    ["ferō","ferre","tulī","lātum","dragen / brengen"],
    ["quaerō","quaerere","quaesīvī","quaesītum","zoeken"],
    ["inveniō","invenīre","invēnī","inventum","vinden"],
    ["intellego","intellegere","intellēxī","intellēctum","begrijpen"],
    ["crēdō","crēdere","crēdidī","crēditum","geloven"]
  ];

  var STEMS = STEM_RAW.map(function (r, i) {
    return {
      id: "stam-" + i,
      present: r[0],
      infinitive: r[1],
      perfect: r[2],
      supine: r[3],
      dutch: r[4]
    };
  });

  var DECLENSIONS = [
    { name: "1e verbuiging", ending: "-a", example: "puella, puellae", forms: ["puella","puellae","puellae","puellam","puellā","puellae","puellārum","puellīs","puellās","puellīs"] },
    { name: "2e verbuiging", ending: "-us", example: "amīcus, amīcī", forms: ["amīcus","amīcī","amīcō","amīcum","amīcō","amīcī","amīcōrum","amīcīs","amīcōs","amīcīs"] },
    { name: "3e verbuiging", ending: "-is (stam)", example: "rēx, rēgis", forms: ["rēx","rēgis","rēgī","rēgem","rēge","rēgēs","rēgum","rēgibus","rēgēs","rēgibus"] },
    { name: "4e verbuiging", ending: "-us", example: "domus, domūs", forms: ["domus","domūs","domuī","domum","domō","domūs","domuum","domibus","domūs","domibus"] },
    { name: "5e verbuiging", ending: "-ēs", example: "rēs, reī / diēs, diēī", forms: ["rēs","reī","reī","rem","rē","rēs","rērum","rēbus","rēs","rēbus"] }
  ];

  var CONJUGATIONS = [
    { name: "1e vervoeging", infinitive: "-āre", present: ["amō","amās","amat","amāmus","amātis","amant"], perfect: ["amāvī","amāvistī","amāvit","amāvimus","amāvistis","amāvērunt"] },
    { name: "2e vervoeging", infinitive: "-ēre", present: ["videō","vidēs","videt","vidēmus","vidētis","vident"], perfect: ["vīdī","vīdistī","vīdit","vīdimus","vīdistis","vīdērunt"] },
    { name: "3e vervoeging", infinitive: "-ere", present: ["legō","legis","legit","legimus","legitis","legunt"], perfect: ["lēgī","lēgistī","lēgit","lēgimus","lēgistis","lēgērunt"] },
    { name: "4e vervoeging", infinitive: "-īre", present: ["audiō","audīs","audit","audīmus","audītis","audiunt"], perfect: ["audīvī","audīvistī","audīvit","audīvimus","audīvistis","audīvērunt"] }
  ];

  var CASES = ["Nom.", "Gen.", "Dat.", "Acc.", "Abl."];

  // Lesboeken: zelfde structuur als verbum (boek → caput → woorden),
  // maar met vrije, eigen woordindeling — geen officiële boeklijsten.
  // Per leerjaar hoort een eigen boek: Pegasus Novus 1, 2 of 3.
  var YEARS = [
    { n: 1, label: "1e middelbaar", short: "1e" },
    { n: 2, label: "2de middelbaar", short: "2de" },
    { n: 3, label: "3de middelbaar", short: "3de" }
  ];

  var METHODS = [
    {
      id: "pegasus", name: "Pegasus Novus", caputCount: 12,
      note: "Vaste methode · elk leerjaar een eigen woordniveau",
      assign: function (w) { return w.caput; }
    }
  ];

  function findMethod(id) {
    for (var i = 0; i < METHODS.length; i++) if (METHODS[i].id === id) return METHODS[i];
    return METHODS[0];
  }

  function findYear(n) {
    var year = Number(n);
    for (var i = 0; i < YEARS.length; i++) if (YEARS[i].n === year) return YEARS[i];
    return YEARS[0];
  }

  var BOOKS = [];
  YEARS.forEach(function (year) {
    METHODS.forEach(function (method) {
      BOOKS.push({
        id: method.id + "-" + year.n,
        methodId: method.id,
        methodName: method.name,
        year: year.n,
        name: method.name + " " + year.n,
        caputCount: 12,
        note: method.note + " · " + year.label,
        assign: function (w) { return method.assign(w); }
      });
    });
  });

  function findBook(id) {
    for (var i = 0; i < BOOKS.length; i++) if (BOOKS[i].id === id) return BOOKS[i];
    return BOOKS[0];
  }

  function booksForYear(year) {
    var n = Number(year) || 1;
    return BOOKS.filter(function (b) { return b.year === n; });
  }

  function byBookCaput(bookId, caput) {
    var book = findBook(bookId);
    var wantAll = !caput || caput === "all";
    var n = Number(caput);
    var out = [];
    for (var i = 0; i < WORDS.length; i++) {
      var w = WORDS[i];
      if (book.year && w.level && w.level !== book.year) continue;
      if (!wantAll && book.assign(w) !== n) continue;
      var copy = {
        id: w.id, key: w.key, latin: w.latin, dutch: w.dutch,
        caput: w.caput, pos: w.pos, bookCaput: book.assign(w)
      };
      copy.number = 0;
      out.push(copy);
    }
    // Woordnummer binnen caput — net als de nummering in je lesboek.
    var counters = {};
    out.forEach(function (w) {
      var key = w.bookCaput;
      counters[key] = (counters[key] || 0) + 1;
      w.number = counters[key];
    });
    return out;
  }

  // Achterwaartse compatibiliteit: methode + leerjaar → boek.
  function byMethodCaput(methodId, caput, year) {
    return byBookCaput(findMethod(methodId).id + "-" + (Number(year) || 1), caput);
  }

  window.StudiumData = {
    CAPITULA: CAPITULA,
    YEARS: YEARS,
    METHODS: METHODS,
    BOOKS: BOOKS,
    findYear: findYear,
    findMethod: findMethod,
    findBook: findBook,
    booksForYear: booksForYear,
    byBookCaput: byBookCaput,
    byMethodCaput: byMethodCaput,
    WORDS: WORDS,
    STEMS: STEMS,
    DECLENSIONS: DECLENSIONS,
    CONJUGATIONS: CONJUGATIONS,
    CASES: CASES,
    normalize: normalize,
    byCaput: function (n) {
      if (!n || n === "all") return WORDS.slice();
      return WORDS.filter(function (w) { return w.caput === Number(n); });
    }
  };
})();
