# AGENTS.md

## Projektin tarkoitus

Tämä repositorio sisältää **Open Mats Helsinki Region** -palvelun. Palvelu kokoaa koko Helsingin seudun eli Helsingin, Espoon, Vantaan ja Kauniaisten brasilialaisen jujutsun (BJJ) ja lukkopainin avoimet sparrivuorot yhdelle verkkosivulle heti ensimmäisestä julkaistavasta versiosta alkaen.

Projektin omistaja aloittaa verkkokehityksen ja julkaisemisen perusteista. Kerro olennaiset valinnat selkeästi suomeksi, vältä tarpeetonta ammattisanastoa ja tee turvalliset, palautettavat oletukset aina kun mahdollista.

## Työkieli

- Keskustele käyttäjän kanssa ensisijaisesti suomeksi.
- Käytä lähdekoodissa, tiedostonimissä, tietokentissä ja teknisessä dokumentaatiossa selkeää englantia.
- Käyttöliittymän ensisijainen kieli on suomi. Rakenne ei saa estää myöhempää englanninkielistä versiota.

## MVP:n rajaus

Ensimmäinen julkaistava versio:

- näyttää tulevat open mat -tapahtumat aikajärjestyksessä;
- kertoo vähintään lajin, päivämäärän, kellonajan, salin, osoitteen, hinnan jos tiedossa ja alkuperäisen lähdelinkin;
- kertoo, milloin tapahtuman tiedot on viimeksi tarkistettu;
- toimii hyvin puhelimella;
- kattaa alusta alkaen Helsingin, Espoon, Vantaan ja Kauniaisten salit;
- sisältää helpon tavan ilmoittaa virheestä tai ehdottaa puuttuvaa tapahtumaa.

Älä lisää käyttäjätilejä, maksamista, omaa ilmoittautumisjärjestelmää, keskusteluominaisuuksia tai raskasta karttaratkaisua ilman erillistä päätöstä.

## Tiedon luotettavuus

- Älä koskaan keksi tapahtumatietoja tai täytä puuttuvia tietoja arvauksilla.
- Säilytä jokaiselle tapahtumalle alkuperäinen lähde-URL ja tarkistusajankohta.
- Suosi salin tai tapahtumajärjestäjän omaa verkkosivua, kalenteria tai julkista somejulkaisua toissijaisten listausten sijaan.
- Merkitse epävarmat tai ristiriitaiset tiedot tarkistettaviksi. Älä julkaise niitä automaattisesti varmoina.
- Normalisoi ajat aikavyöhykkeelle `Europe/Helsinki` ja säilytä koneellisesti käsiteltävät ajat ISO 8601 -muodossa.
- Tunnista peruutukset, poikkeusajat, juhlapyhät ja vanhentuneet toistuvat tapahtumat mahdollisuuksien mukaan.
- Tapahtuman yksilöinti ei saa perustua vain nimeen; huomioi vähintään sali, ajankohta ja laji.

## Keräysperiaatteet

- Aloita pienestä, ylläpidetystä lähdelistasta. Älä yritä indeksoida koko internetiä.
- Käytä ensisijaisesti virallisia rajapintoja, kalentereita ja jäsenneltyä dataa. Tee sivukohtaisia keräimiä vasta tarvittaessa.
- Noudata sivustojen käyttöehtoja, `robots.txt`-ohjeita ja kohtuullista pyyntötahtia. Älä kierrä kirjautumista, maksumuureja, CAPTCHAa tai muita pääsynrajoituksia.
- Tekoäly voi auttaa muuttuvien tekstien jäsentämisessä, mutta sen tulos on validoitava ennen julkaisua.
- Keräyksen epäonnistuminen ei saa poistaa aiemmin vahvistettuja tapahtumia automaattisesti. Vanhentuminen käsitellään erikseen.
- Keräysajojen pitää tuottaa ymmärrettävä loki: onnistuneet lähteet, virheet, löydetyt muutokset ja tarkistusta vaativat havainnot.

## Tekniset periaatteet

- Repositorio ja sen lähdekoodi julkaistaan avoimena GitHubissa. Julkisuus ei koske salaisuuksia, henkilötietoja tai palvelutunnuksia.
- Pidä ensimmäinen versio mahdollisimman pienenä, halpana ja helposti ylläpidettävänä.
- Suosi staattisesti rakennettavaa sivustoa ja versioitua tapahtumadataa ennen erillistä tietokantaa.
- Lisää ulkoinen palvelu tai maksullinen riippuvuus vain, kun sille on konkreettinen tarve.
- Säilytä salaisuudet ympäristömuuttujissa tai julkaisualustan secret-varastossa. Älä koskaan commitoi API-avaimia, tunnuksia tai henkilötietoja.
- Käytä riippuvuuksista lukittuja versioita ja vältä tarpeettomia paketteja.
- Huomioi saavutettavuus, semanttinen HTML, näppäimistökäyttö, riittävä kontrasti ja selkeät virhetilat.
- Kerää vain palvelun toiminnan kannalta tarpeellista dataa. Vältä analytiikka- ja seurantakoodeja MVP:ssä.

## Työskentelytapa

- Tarkista ennen muutoksia olemassa oleva rakenne ja keskeneräiset käyttäjän muutokset.
- Tee pienet, rajatut muutokset ja varmista ne soveltuvilla testeillä.
- Päivitä dokumentaatio, kun asennus, tietomalli, lähteet, automaatio tai julkaisutapa muuttuu.
- Kerro käyttäjälle ennen toimia, jotka synnyttävät kustannuksia, julkaisevat tietoa verkkoon, luovat ulkoisia tilejä tai muuttavat ulkoisia palveluita.
- Älä lähetä viestejä saleille tai tapahtumajärjestäjille käyttäjän puolesta ilman nimenomaista lupaa.
- Älä ota tuotantoa käyttöön, osta verkkotunnusta tai tee muuta peruuttamatonta ulkoista toimenpidettä ilman käyttäjän hyväksyntää.

## Laatuportit

Kun projektiin lisätään toteutus, muutoksen on soveltuvin osin läpäistävä:

1. formatointi ja linttaus;
2. yksikkötestit erityisesti ajan, toistuvuuden ja duplikaattien käsittelylle;
3. tuotantobuild;
4. mobiilinäkymän ja saavutettavuuden perustarkistus;
5. keräimen testiajo tallennettua esimerkkiaineistoa vasten, jotta testit eivät rasita oikeita lähdesivuja.

## Alustava hakemistorakenne

Kun toteutus aloitetaan, suosi seuraavaa rakennetta, ellei valittu teknologia perustellusti vaadi muuta:

```text
docs/                 päätökset, käyttöohjeet ja lähderekisteri
src/                  verkkosivun lähdekoodi
data/                 vahvistettu julkaistava tapahtumadata
collectors/           lähdekohtaiset keräimet ja normalisointi
tests/fixtures/       tallennetut testiaineistot
.github/workflows/    ajastettu keräys, testaus ja julkaisu
```

Tämä tiedosto on projektin alkuohje. Päivitä sitä, kun tehdyt arkkitehtuuri- ja toimintatapapäätökset vakiintuvat.
