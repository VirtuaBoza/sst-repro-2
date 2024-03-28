import * as fs from "node:fs";
import * as path from "node:path";
import { Iso2709Parser } from "../src/marc/parser";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe("marc parser", () => {
  describe("parsing function", () => {
    it("gracefully handles bad data", () => {
      // This records length indicator is incorrect
      // prettier-ignore
      const TEST_RECORD = "01924cam a2200409 a 4500008004100000010001700041020001800058035001800076040003000094050002300124082001200147100002100159245003800180260006400218300003300282490003000315500003400345504005900379510002700438520039300465521000900858521003500867650003100902650002900933650001800962776018100980830004801161900001201209940005201221035002301273005001701296001000601313003000601319526005701325526005601382852007601438210320s2022    mnua   b b    001 0 eng    a  2021012623  a9781663908353  a(ICrlF)1992KQ  aDLCbengcDLCdDLCdICrlF00aBP186.6b.M64 202200a2972231 aMohamed, Mariam.10aEid al-Adha /cby Mariam Mohamed.  aNorth Mankato, Minn. :bPebble, a Capstone imprint,c[2022]  a32 p. :bcol. ill. ;c24 cm.1 aTraditions & celebrations  a\"Pebble explore\"--Back cover.  aIncludes bibliographical references (p. 31) and index.3 aBooklist, January 2022  a\"Eid al-Adha is about celebrating! It is a Muslim festival remembering the sacrifice Ibrahim was willing to make. People mark the festival with prayer, visiting family, and gifts. Some people sacrifice an animal and share the meat with their community. Readers will discover how a shared holiday can have multiple traditions and be celebrated in all sorts of ways\"--Provided by publisher.0 a3.4.2 aK-3bFollett School Solutions. 7aʿĪd al-Aḍḥā.2sears 7aIslamic holidays.2sears 7aIslam.2sears08iOnline version:aMohamed, Mariam,tEid al-AdhadNorth Mankato, Minnesota : Pebble Explore is published by Pebble, an imprint of Capstone, 2022.z9781663908322w(DLC) 2021012624 0aTraditions and celebrations (Pebble (Firm))  a297 MOH2 a3.4bK-3d05/04/23sBooklist, January 2022vFSS  a(ICrlF)fol2016695520230614114708.05869439012  aAccelerated Reader ARbLGc4.0d0.5z516595EN5SMEDS  aAccelerated Reader ARbLGc4.0d0.5z516595.5SMEDS  pT 32889aSMEDS923.54USDxCOPYID:43747xFSC@aRegular@c20230504h297 MOH"

      const res = Iso2709Parser.parseRecord(TEST_RECORD);

      expect(res).toMatchObject({
        controlFields: {
          "001": "58694",
          "003": "39012",
          "005": "20230614114708.0",
          "008": "210320s2022    mnua   b b    001 0 eng  ",
        },
        dataFields: {
          "010": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["  2021012623"],
              },
            },
          ],
          "020": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["9781663908353"],
              },
            },
          ],
          "035": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["(ICrlF)1992KQ"],
              },
            },
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["(ICrlF)fol20166955"],
              },
            },
          ],
          "040": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["DLC"],
                b: ["eng"],
                c: ["DLC"],
                d: ["DLC", "ICrlF"],
              },
            },
          ],
          "050": [
            {
              ind1: "0",
              ind2: "0",
              subfields: {
                a: ["BP186.6"],
                b: [".M64 2022"],
              },
            },
          ],
          "082": [
            {
              ind1: "0",
              ind2: "0",
              subfields: {
                "2": ["23"],
                a: ["297"],
              },
            },
          ],
          "100": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Mohamed, Mariam."],
              },
            },
          ],
          "245": [
            {
              ind1: "1",
              ind2: "0",
              subfields: {
                a: ["Eid al-Adha /"],
                c: ["by Mariam Mohamed."],
              },
            },
          ],
          "260": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["North Mankato, Minn. :"],
                b: ["Pebble, a Capstone imprint,"],
                c: ["[2022]"],
              },
            },
          ],
          "300": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["32 p. :"],
                b: ["col. ill. ;"],
                c: ["24 cm."],
              },
            },
          ],
          "490": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Traditions & celebrations"],
              },
            },
          ],
          "500": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ['"Pebble explore"--Back cover.'],
              },
            },
          ],
          "504": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["Includes bibliographical references (p. 31) and index."],
              },
            },
          ],
          "510": [
            {
              ind1: "3",
              ind2: " ",
              subfields: {
                a: ["Booklist, January 2022"],
              },
            },
          ],
          "520": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: [
                  '"Eid al-Adha is about celebrating! It is a Muslim festival remembering the sacrifice Ibrahim was willing to make. People mark the festival with prayer, visiting family, and gifts. Some people sacrifice an animal and share the meat with their community. Readers will discover how a shared holiday can have multiple traditions and be celebrated in all sorts of ways"--Provided by publisher.',
                ],
              },
            },
          ],
          "521": [
            {
              ind1: "0",
              ind2: " ",
              subfields: {
                a: ["3.4."],
              },
            },
            {
              ind1: "2",
              ind2: " ",
              subfields: {
                a: ["K-3"],
                b: ["Follett School Solutions."],
              },
            },
          ],
          "526": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "5": ["SMEDS"],
                a: ["Accelerated Reader AR"],
                b: ["LG"],
                c: ["4.0"],
                d: ["0.5"],
                z: ["516595EN"],
              },
            },
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "5": ["SMEDS"],
                a: ["Accelerated Reader AR"],
                b: ["LG"],
                c: ["4.0"],
                d: ["0.5"],
                z: ["516595."],
              },
            },
          ],
          "650": [
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["ʿĪd al-Aḍḥā."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Islamic holidays."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Islam."],
              },
            },
          ],
          "776": [
            {
              ind1: "0",
              ind2: "8",
              subfields: {
                a: ["Mohamed, Mariam,"],
                d: [
                  "North Mankato, Minnesota : Pebble Explore is published by Pebble, an imprint of Capstone, 2022.",
                ],
                i: ["Online version:"],
                t: ["Eid al-Adha"],
                w: ["(DLC) 2021012624"],
                z: ["9781663908322"],
              },
            },
          ],
          "830": [
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Traditions and celebrations (Pebble (Firm))"],
              },
            },
          ],
          "852": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "9": ["23.54USD"],
                a: ["SMEDS"],
                h: ["297 MOH"],
                p: ["T 32889"],
                x: ["COPYID:43747", "FSC@aRegular@c20230504"],
              },
            },
          ],
          "900": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["297 MOH"],
              },
            },
          ],
          "940": [
            {
              ind1: "2",
              ind2: " ",
              subfields: {
                a: ["3.4"],
                b: ["K-3"],
                d: ["05/04/23"],
                s: ["Booklist, January 2022"],
                v: ["FSS"],
              },
            },
          ],
        },
        leader: "01924cam a2200409 a 4500",
      });
    });

    it("works as expected", () => {
      const TEST_RECORD =
        '02631pam  2200697 i 4500001001300000003000600013005001700019008004100036020002700077040002700104082001000131099001000141100003000151245005300181250001900234264009400253264001900347300004500366336002600411337002800437338002700465490002100492510002500513520023300538521001400771521001600785526006100801586003700862650003600899650004300935650003900978650004901017650004201066650002001108650004801128650004001176650005201216650001901268650002601287650002201313650003201335650002501367650002001392650002601412650002301438650003401461650002601495650003301521650002901554650003901583650003201622650002701654650003801681650003001719650004101749655003401790655003201824655002701856800003901883852001101922mlg75994105 KyBuM20220719000000.0220715t20222022nyua   b 6    000 1 eng d  a9780063069091 :c16.72  aKyBuMbengerdacKyBuM00aE223  aE TAB1 aTabor, Corey R.,eauthor.10aSir Ladybug and the queen bee /cCorey R. Tabor.  aFirst edition. 1aNew York, NY :bBalzer + Bray, HarperAlley, imprints of HarperCollins Publishers,c[2022] 4ccopyright 2022  a62 pages :bcolor illustrations ;c24 cm  atextbtxt2rdacontent  aunmediatedbn2rdamedia  avolumebnc2rdacarrier1 aSir Ladybug ;v23 aJunior Library Guild  a"Sir Ladybug--the duke of the dandelion patch, champion of truth and justice--is on a new quest!  With his herald, Pell, and his trusty squire, Sterling, he will have to be extra-clever to outwit the mean Queen Bee"--Back cover.1 aAges 6-8.2 aGrades 1-3.0 aAccelerated ReaderbLower Gradesc2.4d0.5zquiz: 515672  aA Junior Library Guild selection 0aBeesvComic books, strips, etc. 0aCooperationvComic books, strips, etc. 0aCouragevComic books, strips, etc. 0aCreative thinkingvComic books, strips, etc. 0aFriendshipvComic books, strips, etc. 0aGraphic novels. 0aHelping behaviorvComic books, strips, etc. 0aLadybugsvComic books, strips, etc. 0aQuests (Expeditions)vComic books, strips, etc. 1aBeesvFiction. 1aCooperationvFiction. 1aCouragevFiction. 1aCreative thinkingvFiction. 1aFriendshipvFiction. 1aGraphic novels. 1aHelpfulnessvFiction. 1aLadybugsvFiction. 1aVoyages and travelsvFiction. 7aBeesvFiction.2sears 7aCooperationvFiction.2sears 7aCouragevFiction.2sears 7aCreative thinkingvFiction.2sears 7aFriendshipvFiction.2sears 7aGraphic novels.2sears 7aHelping behaviorvFiction.2sears 7aLadybugsvFiction.2sears 7aVoyages and travelsvFiction.2sears 7aComics (Graphic works)2lcgft 7aFunny animal comics.2lcgft 7aGraphic novels.2lcgft1 aTabor, Corey R.tSir Ladybug ;v2.  hEiTAB';
      const res = Iso2709Parser.parseRecord(TEST_RECORD);

      expect(res).toMatchObject({
        controlFields: {
          "001": "mlg75994105 ",
          "003": "KyBuM",
          "005": "20220719000000.0",
          "008": "220715t20222022nyua   b 6    000 1 eng d",
        },
        dataFields: {
          "020": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["9780063069091 :"],
                c: ["16.72"],
              },
            },
          ],
          "040": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["KyBuM"],
                b: ["eng"],
                c: ["KyBuM"],
                e: ["rda"],
              },
            },
          ],
          "082": [
            {
              ind1: "0",
              ind2: "0",
              subfields: {
                "2": ["23"],
                a: ["E"],
              },
            },
          ],
          "099": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["E TAB"],
              },
            },
          ],
          "100": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Tabor, Corey R.,"],
                e: ["author."],
              },
            },
          ],
          "245": [
            {
              ind1: "1",
              ind2: "0",
              subfields: {
                a: ["Sir Ladybug and the queen bee /"],
                c: ["Corey R. Tabor."],
              },
            },
          ],
          "250": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["First edition."],
              },
            },
          ],
          "264": [
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["New York, NY :"],
                b: [
                  "Balzer + Bray, HarperAlley, imprints of HarperCollins Publishers,",
                ],
                c: ["[2022]"],
              },
            },
            {
              ind1: " ",
              ind2: "4",
              subfields: {
                c: ["copyright 2022"],
              },
            },
          ],
          "300": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["62 pages :"],
                b: ["color illustrations ;"],
                c: ["24 cm"],
              },
            },
          ],
          "336": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "2": ["rdacontent"],
                a: ["text"],
                b: ["txt"],
              },
            },
          ],
          "337": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "2": ["rdamedia"],
                a: ["unmediated"],
                b: ["n"],
              },
            },
          ],
          "338": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "2": ["rdacarrier"],
                a: ["volume"],
                b: ["nc"],
              },
            },
          ],
          "490": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Sir Ladybug ;"],
                v: ["2"],
              },
            },
          ],
          "510": [
            {
              ind1: "3",
              ind2: " ",
              subfields: {
                a: ["Junior Library Guild"],
              },
            },
          ],
          "520": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: [
                  '"Sir Ladybug--the duke of the dandelion patch, champion of truth and justice--is on a new quest!  With his herald, Pell, and his trusty squire, Sterling, he will have to be extra-clever to outwit the mean Queen Bee"--Back cover.',
                ],
              },
            },
          ],
          "521": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Ages 6-8."],
              },
            },
            {
              ind1: "2",
              ind2: " ",
              subfields: {
                a: ["Grades 1-3."],
              },
            },
          ],
          "526": [
            {
              ind1: "0",
              ind2: " ",
              subfields: {
                a: ["Accelerated Reader"],
                b: ["Lower Grades"],
                c: ["2.4"],
                d: ["0.5"],
                z: ["quiz: 515672"],
              },
            },
          ],
          "586": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["A Junior Library Guild selection"],
              },
            },
          ],
          "650": [
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Bees"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Cooperation"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Courage"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Creative thinking"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Friendship"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Graphic novels."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Helping behavior"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Ladybugs"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Quests (Expeditions)"],
                v: ["Comic books, strips, etc."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Bees"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Cooperation"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Courage"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Creative thinking"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Friendship"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Graphic novels."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Helpfulness"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Ladybugs"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "1",
              subfields: {
                a: ["Voyages and travels"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Bees"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Cooperation"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Courage"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Creative thinking"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Friendship"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Graphic novels."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Helping behavior"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Ladybugs"],
                v: ["Fiction."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Voyages and travels"],
                v: ["Fiction."],
              },
            },
          ],
          "655": [
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["lcgft"],
                a: ["Comics (Graphic works)"],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["lcgft"],
                a: ["Funny animal comics."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["lcgft"],
                a: ["Graphic novels."],
              },
            },
          ],
          "800": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Tabor, Corey R."],
                t: ["Sir Ladybug ;"],
                v: ["2."],
              },
            },
          ],
          "852": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                h: ["E"],
                i: ["TAB"],
              },
            },
          ],
        },
        leader: "02631pam  2200697 i 4500",
      });
    });

    it("blah", () => {
      const TEST_RECORD =
        '01924cam a2200409 a 4500008004100000010001700041020001800058035001800076040003000094050002300124082001200147100002100159245003800180260006400218300003300282490003000315500003400345504005900379510002700438520039300465521000900858521003500867650003100902650002900933650001800962776018100980830004801161900001201209940005201221035002301273005001701296001000601313003000601319526005701325526005601382852007601438\x1E210320s2022    mnua   b b    001 0 eng  \x1E  \x1Fa  2021012623\x1E  \x1Fa9781663908353\x1E  \x1Fa(ICrlF)1992KQ\x1E  \x1FaDLC\x1Fbeng\x1FcDLC\x1FdDLC\x1FdICrlF\x1E00\x1FaBP186.6\x1Fb.M64 2022\x1E00\x1Fa297\x1F223\x1E1 \x1FaMohamed, Mariam.\x1E10\x1FaEid al-Adha /\x1Fcby Mariam Mohamed.\x1E  \x1FaNorth Mankato, Minn. :\x1FbPebble, a Capstone imprint,\x1Fc[2022]\x1E  \x1Fa32 p. :\x1Fbcol. ill. ;\x1Fc24 cm.\x1E1 \x1FaTraditions & celebrations\x1E  \x1Fa"Pebble explore"--Back cover.\x1E  \x1FaIncludes bibliographical references (p. 31) and index.\x1E3 \x1FaBooklist, January 2022\x1E  \x1Fa"Eid al-Adha is about celebrating! It is a Muslim festival remembering the sacrifice Ibrahim was willing to make. People mark the festival with prayer, visiting family, and gifts. Some people sacrifice an animal and share the meat with their community. Readers will discover how a shared holiday can have multiple traditions and be celebrated in all sorts of ways"--Provided by publisher.\x1E0 \x1Fa3.4.\x1E2 \x1FaK-3\x1FbFollett School Solutions.\x1E 7\x1FaʿĪd al-Aḍḥā.\x1F2sears\x1E 7\x1FaIslamic holidays.\x1F2sears\x1E 7\x1FaIslam.\x1F2sears\x1E08\x1FiOnline version:\x1FaMohamed, Mariam,\x1FtEid al-Adha\x1FdNorth Mankato, Minnesota : Pebble Explore is published by Pebble, an imprint of Capstone, 2022.\x1Fz9781663908322\x1Fw(DLC) 2021012624\x1E 0\x1FaTraditions and celebrations (Pebble (Firm))\x1E  \x1Fa297 MOH\x1E2 \x1Fa3.4\x1FbK-3\x1Fd05/04/23\x1FsBooklist, January 2022\x1FvFSS\x1E  \x1Fa(ICrlF)fol20166955\x1E20230614114708.0\x1E58694\x1E39012\x1E  \x1FaAccelerated Reader AR\x1FbLG\x1Fc4.0\x1Fd0.5\x1Fz516595EN\x1F5SMEDS\x1E  \x1FaAccelerated Reader AR\x1FbLG\x1Fc4.0\x1Fd0.5\x1Fz516595.\x1F5SMEDS\x1E  \x1FpT 32889\x1FaSMEDS\x1F923.54USD\x1FxCOPYID:43747\x1FxFSC@aRegular@c20230504\x1Fh297 MOH\x1E';
      const res = Iso2709Parser.parseRecord(TEST_RECORD);
      expect(res).toMatchObject({
        controlFields: {
          "001": "58694",
          "003": "39012",
          "005": "20230614114708.0",
          "008": "210320s2022    mnua   b b    001 0 eng  ",
        },
        dataFields: {
          "010": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["  2021012623"],
              },
            },
          ],
          "020": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["9781663908353"],
              },
            },
          ],
          "035": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["(ICrlF)1992KQ"],
              },
            },
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["(ICrlF)fol20166955"],
              },
            },
          ],
          "040": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["DLC"],
                b: ["eng"],
                c: ["DLC"],
                d: ["DLC", "ICrlF"],
              },
            },
          ],
          "050": [
            {
              ind1: "0",
              ind2: "0",
              subfields: {
                a: ["BP186.6"],
                b: [".M64 2022"],
              },
            },
          ],
          "082": [
            {
              ind1: "0",
              ind2: "0",
              subfields: {
                "2": ["23"],
                a: ["297"],
              },
            },
          ],
          "100": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Mohamed, Mariam."],
              },
            },
          ],
          "245": [
            {
              ind1: "1",
              ind2: "0",
              subfields: {
                a: ["Eid al-Adha /"],
                c: ["by Mariam Mohamed."],
              },
            },
          ],
          "260": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["North Mankato, Minn. :"],
                b: ["Pebble, a Capstone imprint,"],
                c: ["[2022]"],
              },
            },
          ],
          "300": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["32 p. :"],
                b: ["col. ill. ;"],
                c: ["24 cm."],
              },
            },
          ],
          "490": [
            {
              ind1: "1",
              ind2: " ",
              subfields: {
                a: ["Traditions & celebrations"],
              },
            },
          ],
          "500": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ['"Pebble explore"--Back cover.'],
              },
            },
          ],
          "504": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["Includes bibliographical references (p. 31) and index."],
              },
            },
          ],
          "510": [
            {
              ind1: "3",
              ind2: " ",
              subfields: {
                a: ["Booklist, January 2022"],
              },
            },
          ],
          "520": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: [
                  '"Eid al-Adha is about celebrating! It is a Muslim festival remembering the sacrifice Ibrahim was willing to make. People mark the festival with prayer, visiting family, and gifts. Some people sacrifice an animal and share the meat with their community. Readers will discover how a shared holiday can have multiple traditions and be celebrated in all sorts of ways"--Provided by publisher.',
                ],
              },
            },
          ],
          "521": [
            {
              ind1: "0",
              ind2: " ",
              subfields: {
                a: ["3.4."],
              },
            },
            {
              ind1: "2",
              ind2: " ",
              subfields: {
                a: ["K-3"],
                b: ["Follett School Solutions."],
              },
            },
          ],
          "526": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "5": ["SMEDS"],
                a: ["Accelerated Reader AR"],
                b: ["LG"],
                c: ["4.0"],
                d: ["0.5"],
                z: ["516595EN"],
              },
            },
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "5": ["SMEDS"],
                a: ["Accelerated Reader AR"],
                b: ["LG"],
                c: ["4.0"],
                d: ["0.5"],
                z: ["516595."],
              },
            },
          ],
          "650": [
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["ʿĪd al-Aḍḥā."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Islamic holidays."],
              },
            },
            {
              ind1: " ",
              ind2: "7",
              subfields: {
                "2": ["sears"],
                a: ["Islam."],
              },
            },
          ],
          "776": [
            {
              ind1: "0",
              ind2: "8",
              subfields: {
                a: ["Mohamed, Mariam,"],
                d: [
                  "North Mankato, Minnesota : Pebble Explore is published by Pebble, an imprint of Capstone, 2022.",
                ],
                i: ["Online version:"],
                t: ["Eid al-Adha"],
                w: ["(DLC) 2021012624"],
                z: ["9781663908322"],
              },
            },
          ],
          "830": [
            {
              ind1: " ",
              ind2: "0",
              subfields: {
                a: ["Traditions and celebrations (Pebble (Firm))"],
              },
            },
          ],
          "852": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                "9": ["23.54USD"],
                a: ["SMEDS"],
                h: ["297 MOH"],
                p: ["T 32889"],
                x: ["COPYID:43747", "FSC@aRegular@c20230504"],
              },
            },
          ],
          "900": [
            {
              ind1: " ",
              ind2: " ",
              subfields: {
                a: ["297 MOH"],
              },
            },
          ],
          "940": [
            {
              ind1: "2",
              ind2: " ",
              subfields: {
                a: ["3.4"],
                b: ["K-3"],
                d: ["05/04/23"],
                s: ["Booklist, January 2022"],
                v: ["FSS"],
              },
            },
          ],
        },
        leader: "01924cam a2200409 a 4500",
      });
    });
  });

  it("should parse marc records", async () => {
    const readStream = fs.createReadStream(
      path.join(__dirname, "small_example.mrc")
    );

    const marcStream = readStream.pipe(new Iso2709Parser());
    let successCount = 0;
    let errorCount = 0;

    await new Promise<void>((resolve, reject) => {
      marcStream.on("data", (chunk) => {
        if (chunk.error) {
          errorCount++;
        } else {
          successCount++;
        }
      });
      marcStream.on("end", () => {
        resolve();
      });
      marcStream.on("error", (err) => {
        reject(err);
      });
    });
    expect(successCount).toBe(12);
    expect(errorCount).toBe(0);
  });

  it("should parse large files of marc records", async () => {
    const readStream = fs.createReadStream(
      path.join(__dirname, "large_example.mrc")
    );

    const marcStream = readStream.pipe(new Iso2709Parser());
    let successCount = 0;
    let errorCount = 0;

    await new Promise<void>((resolve, reject) => {
      marcStream.on("data", (chunk) => {
        if (chunk.error) {
          errorCount++;
        } else {
          successCount++;
        }
      });
      marcStream.on("end", () => {
        resolve();
      });
      marcStream.on("error", (err) => {
        reject(err);
      });
    });

    expect(successCount).toBe(12519);
    expect(errorCount).toBe(0);
  });
});
