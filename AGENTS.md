# AGENTS.md

## Projektin tarkoitus

Tämä repositorio sisältää **Open Mats Helsinki Region** -palvelun. Palvelu kokoaa koko Helsingin seudun eli Helsingin, Espoon, Vantaan ja Kauniaisten brasilialaisen jujutsun (BJJ) ja lukkopainin avoimet sparrivuorot yhdelle verkkosivulle heti ensimmäisestä julkaistavasta versiosta alkaen.

Projektin omistaja aloittaa verkkokehityksen ja julkaisemisen perusteista. Kerro olennaiset valinnat selkeästi suomeksi, vältä tarpeetonta ammattisanastoa ja tee turvalliset, palautettavat oletukset aina kun mahdollista.

## Työkieli

- Keskustele käyttäjän kanssa ensisijaisesti suomeksi.
- Käytä lähdekoodissa, tiedostonimissä, tietokentissä ja teknisessä dokumentaatiossa selkeää englantia.
- Käyttöliittymän ensisijainen kieli on suomi. Rakenne ei saa estää myöhempää englanninkielistä versiota.
- Käytä käyttöliittymässä ja käyttäjäviestinnässä termiä `open mat`. Älä suomenna sitä muotoon "avoin matto" tai käytä pelkkää matto-sanaa sen korvikkeena. Suomenkieliset taivutukset, kuten "open matit", ovat sallittuja.

## MVP:n rajaus

Ensimmäinen julkaistava versio:

- näyttää tulevat open mat -tapahtumat aikajärjestyksessä;
- kertoo vähintään lajin, päivämäärän, kellonajan, salin, osoitteen, hinnan jos tiedossa ja alkuperäisen lähdelinkin;
- kertoo, milloin tapahtuman tiedot on viimeksi tarkistettu;
- toimii hyvin puhelimella;
- kattaa alusta alkaen Helsingin, Espoon, Vantaan ja Kauniaisten salit;
- sisältää helposti löydettävät yhteystiedot, joiden kautta voi ilmoittaa
  virheestä tai ehdottaa puuttuvaa tapahtumaa; erillistä palautelomaketta tai
  GitHub-ilmoituslinkkiä ei käytetä.

Älä lisää käyttäjätilejä, maksamista, omaa ilmoittautumisjärjestelmää, keskusteluominaisuuksia tai raskasta karttaratkaisua ilman erillistä päätöstä.

## Tiedon luotettavuus

- Älä koskaan keksi tapahtumatietoja tai täytä puuttuvia tietoja arvauksilla.
- Säilytä jokaiselle tapahtumalle alkuperäinen lähde-URL ja tarkistusajankohta.
- Suosi salin tai tapahtumajärjestäjän omaa verkkosivua, kalenteria tai julkista somejulkaisua toissijaisten listausten sijaan.
- Merkitse epävarmat tai ristiriitaiset tiedot tarkistettaviksi. Älä julkaise niitä automaattisesti varmoina.
- Kohdista jäsenrajaus, peruutus ja muu poissulkeva ehto vain siihen tapahtumariviin tai yksiselitteisesti määriteltyyn aikataulun osaan, johon lähde sen liittää. Älä yleistä toisen rivin tekstiä saman taulukon muihin open mateihin.
- Säilytä aiemmin vahvistettu epävarma tapahtuma, jos uusi lähde on kadonnut, palauttaa 404-virheen tai sen taulukkorakenne jää epäselväksi. Lähteen lukuvirhe ei ole todiste peruutuksesta tai jäsenrajauksesta.
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
- Jokainen `excludedDates`-poikkeus tarvitsee samalle päivälle yksilöidyn
  `excludedDateEvidence`-tietueen, jossa ovat lähde-URL, tarkistusajankohta ja
  perustelu. Samassa kaupungissa tai lajissa järjestettävä muu tapahtuma ei ole
  poissulkemisperuste, ellei lähde osoita sen käyttävän juuri open matin salia.
- Jokaisella `datedOpenMats`-rivillä pitää olla pysyvä `seriesId`, joka yhdistää
  sen omaan tapahtumapohjaansa. Sama `seriesId` ei saa olla yhtä aikaa
  toistuvalla ja erikseen päivätyllä sarjalla.
- Onnistunut ajastettu tarkistus päivittää jokaisen julkaistavan sarjan
  tarkistusajan, ajaa `pnpm events:refresh` -komennon ja muodostaa vähintään
  kahdeksan viikon rullaavan julkaisujakson. Pelkkä yleisen tarkistuspäivän
  muuttaminen ei ole onnistunut julkaisu.
- GitHub CLI:n verkkoyhteysvirhettä ei saa tulkita vanhentuneeksi tokeniksi.
  Uudelleenkirjautumista pyydetään vain, jos avainnipun tunnus puuttuu tai
  GitHub vastaa aidolla 401-/Bad credentials -virheellä.
- `credential_unavailable`, `authorization_unavailable`,
  `network_unavailable`, `git_unavailable` ja `gh_unavailable` ovat
  käyttöoikeus-, verkko-, SSO/rate limit-, Git- tai asennusongelmia. Ne eivät
  yksin oikeuta pyytämään GitHub-uudelleenkirjautumista.

## Tekniset periaatteet

- Repositorio ja sen lähdekoodi julkaistaan avoimena GitHubissa. Julkisuus ei koske salaisuuksia, henkilötietoja tai palvelutunnuksia.
- Pidä ensimmäinen versio mahdollisimman pienenä, halpana ja helposti ylläpidettävänä.
- Suosi staattisesti rakennettavaa sivustoa ja versioitua tapahtumadataa ennen erillistä tietokantaa.
- Lisää ulkoinen palvelu tai maksullinen riippuvuus vain, kun sille on konkreettinen tarve.
- Säilytä salaisuudet ympäristömuuttujissa tai julkaisualustan secret-varastossa. Älä koskaan commitoi API-avaimia, tunnuksia tai henkilötietoja.
- Käytä riippuvuuksista lukittuja versioita ja vältä tarpeettomia paketteja.
- Julkaistavan tapahtumadatan ensisijaiset syötteet ovat
  `data/event-series.json`, `data/event-templates.json` ja
  `data/source-registry.json`. `src/data/events.json` on näistä
  deterministisesti generoitu tuloste eikä käsin ylläpidettävä lähde.
- Huomioi saavutettavuus, semanttinen HTML, näppäimistökäyttö, riittävä kontrasti ja selkeät virhetilat.
- Kerää vain palvelun toiminnan kannalta tarpeellista dataa. Vältä analytiikka- ja seurantakoodeja MVP:ssä.
- Kanoninen tuotantosivusto on `https://openmats.fi`. Cloudflare Pagesin
  tekninen projektiosoite on `https://openmats.pages.dev`. GitHubin
  `main`-haaran onnistuneet muutokset käynnistävät automaattisen
  tuotantobuildin.
- Ajastettu ajo säilyttää `acquire`-komennon palauttaman `ownerId`-arvon ja
  käyttää täsmälleen samaa arvoa `record`- ja `release`-komennoissa. Toisen ajon
  lukkoa ei saa vapauttaa.
- Ajastetussa worktreessa kaikki Node- ja pnpm-komennot suoritetaan muodossa
  `sh scripts/with-automation-runtime.sh <command>`. Wrapper lisää Codexin
  versionhallinnasta riippumattoman, mukana toimitetun Node-runtimen `PATH`:iin;
  ajon ei pidä jäädä odottamaan erillistä runtime-polun hakua.
- Yhdistämisen jälkeen tuotanto varmennetaan komennolla
  `sh scripts/with-automation-runtime.sh pnpm automation:verify-production -- --commit <main-commit-sha>`.
  Pelkkä Cloudflare-checkin onnistuminen tai näkyvän tarkistuspäivän muuttuminen
  ei riitä.

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
