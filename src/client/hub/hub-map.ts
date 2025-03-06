import { MapFileV0_0_1 } from "src/map/map-serialization";

export function getHubMap(): MapFileV0_0_1 {
    // TODO: Fetch it from the server
    return {
        "signature": "TNKS",
        "version": "0.0.1",
        "width": 150,
        "height": 150,
        "name": "Вихрь",
        "spawnZones": [
            {
                "x1": 62,
                "y1": 92,
                "x2": 66,
                "y2": 97,
                "id": 0
            },
            {
                "x1": 126,
                "y1": 39,
                "x2": 132,
                "y2": 42,
                "id": 1
            },
            {
                "x1": 10,
                "y1": 104,
                "x2": 16,
                "y2": 106,
                "id": 2
            }
        ],
        "blocks": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbddddddbddddddddddddddddddddddddddddddddddddddddddddddddd----------dddddddd--------------ddddddddddddddddddddddddddddddbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbdddddddddddbddddddddddddddddddddddddddddddddddddddddd--dd------dddddd-----------------ddddddddddddddddddddddbdddddddbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbddbddbbddddddddddddddddddddddddddddddddddddddddddd-------dd-dddd----------------ddddddddddddddddddbddddddddddddddddbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbdddbdddddddddddddddddddddddddddddddddddddddddddd-d-d-----ddddd-----------------ddddddddddddddddddbddddbbdddddbdddddbbbbbbaabbbbbbbbbbbbbbbbbbbdbbbbdbdbbdddddddddddddddddd-----------------dddddddddd---------ddddd------------ddddddddddddddddddddddbddddbddddddddddddddbbbbbaaabbbbbbbbbbbbbbbbbbbbbbdbbbbbdddddddddd--------------------------------ddd--------ddd------dd-----dddddddddddddddddddddddddddddbddddbddbbdbbddbbbbbbaabbbbbbbbbbbbbbbbbbbbbbbbbbbddddddddd------------------------------------dd-------ddd-----ddd-----dddddddddddddddddddddbbddbdddbddbdbbbbddbddddbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbbbdbddddddd-----------------------------------------------d-------------ddddddddddddddddddddddddddddddddbdbbddbddbddddddbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbddbdd-------------------------------------------------------------ddddddddddddddddddddbdddddddddbddbbdddddddddddbbdbabbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbdddb----d---------------bbbbb--b--b-------------------------------dddddddddddddddddddddddddddbbdddddbddddddbbddbdbdbbabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbb---------------dddddddddddddddddddddddddd-------------------------------dddddddddddddddddddbddddddbddbbbdbbdddddddbabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb--------------dddddddddddddddddddddddddddddd------d------------------------dddddddddddddddddbdddddbbdddbbdbbdbdbbbbbabbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbb-------------dddddddddddddddddddddddddddddddd------d-------------------d------bddddddbdddddddddddbdbddddddbdddddbdbbbabbbbbbbbbbbbbbbbbbbbbbbbbbbbbb--------d----ddddddddddddddddddddddddddddddddb---dddd--------------dd----dddd-b----bddddddddddbdddddddddbdddddbbbbbdbbbaabbbbbbbbbbbbbbbbbbbbbbdbbbbb-------------bbddbddddddddddddddddddddddddddb---ddd----------dd----ddd-----ddd-b------bdddddddddddddbdddbdddbdbdbbbbdbbbaabbbbaaabbbbbbbbaaabbbbbbbbd---d--------dbddbdbdddddddddddddddddddddddddd---dddd-----------dd----ddd----ddbbb--------bdddddddddddbbddddddddbdbbdbbbbbaabbbbaaabbbbbbbbaaabbbbbbb-------------bbbbdbbdbddddddddddddddddddddddddd--dddd---dd---dd--d----------------b-----------bddbdddddddddddddbbbbdbbbbbbbaabbbbbbbbbbbbbbbbbbbbbbbb------------bbbbdbbdbdbdbdddddddddddddddddddddd---ddd--d---ddddddb-----------------------dd------dddddddbddddbbdbbbbdbbbbbbbaabbbbbbbbbbbbdbbbbbbbbbb--b--------bbbbdbbbbbbdddbddbddddddddddddddddddd--ddd-----dddddddddb----------------------ddd----b--dddddbddddbbdddbdbbbddbbbaabbbbbbbbbbbbbbbbbbbbbd-bb------bb-bbbbbbbbbdbdbbbbdbdddddddddddddddddd--dddd---dddddddddddddd-------------------bbbddd--bb--dbbdbbdbddbdddddbbbddbbbaabbbbbbbbbbbbbbbbbbbbb--b------bb-bbdbbbbbbbdbbbdbbdbbddddddddddddddddd-dddd---dddddddddddddddb---dd--------------bbddd---bb---bddbddbdddbbbbbbbdbbbbaabbbbbbbbbbbbbbbbbbbb-bb---------bbbbbbbbdbbbbdbbdbbddddddddddddddddddd-bdbd---ddddddddddddddbbbdddd----------------------b-bbb-bbddbddddbbddbbbbbbbbaabbbbbbbbbbbbbbbbbbb--b------b--bbbbbbbbbbbbbbbdbddbbddddddddddddddddddddddd--dddddddddddddddddbdddd----------d-----------bbbb-b-bbbbbbbbbbdddbbbbbbbaabbbbbbbbbbbbbbbbbb------------dbbbbbbbbbbbbbbbbbbbdbbbdddddddddddddbdbdddddddddddddddddddddddddbddd---------ddb---------------b--bbbddbbbbbbbbdbbbbbaabbbbbabbbbbbbbbbbb--------d---bbbbbbbbbbbdbbbdbbdbbdbddddddddddddddd-ddddbdbdddddddddddddddddddbbbbb--d-----ddb------------------bbbdbbbdbddbbdbbbbdabbbbbaaaabbbbbbaaa--d---------bbbbbdbbbbbbbbbbbbbbbbbbbddddddddddddd--dddd--ddddddddddddddddbddddbbbdddd---------------------------bbbbbbbbbdbbbbbbbbbbbbbbaaaabbbbbaaaa------------bbbbbbbbbbbbbbbbbbbbdbdbdddddddddddddd--bbdb-dbdddddddddddddddddddbddddddd------------------bb--b-----bbbbdbbbbbbbbbbdbbbbbbbaaabbbbbbaaaa-----------bbbbbbbbbbbbbbbbbdbbbbbbbbbddddddddddd--d--db-dddddddddbddddddddddddddddddd--------------b-------bb-b--bddbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaaa-----------bbbbbbbbbbbbbbbbbbbbbbbbbdbbdddddddddd---b-dd--dddddddddddddddddddbddddddddd------b----------------b-b---dbbbddbbbbddbbbbbbbbbbbbbbbbdbbb-b---------b-bbbbbbbbbbbbbbbbbbbbbbdbbbbbdddddddddd--d--db--dddddddddddddbbbbdddddddddddbbb-----b---------------------bdbbddbbbbdbbbbbabbbbbbbbbbbbbb------------bbbbbbbbbbbbbbbbbbbbbbbbbbbb-------ddddd--d-db--bdddddbbdbbbddddbbbbddddddddddbb----------------------------bbbbbbbbbbbbbbbaaabbbbbbbbbbbb-----------b-bbdbbbbbbbbbbbbbdbbbbbbbb------------dd-bd-d---ddddddbddbddddbbddbbbbdddbdddddbb----------------------------dbbbbbbbbbbbbbaaabbbbbbbbbbb-------------bbbbbbbbbbbbbbbbbbbbbb--------------------d-----dbddddddddbbbddddddddbbdddddddddbb----b---b-----------b------bbdbdbbbbddbbbaaaabbbbbbbbbbb--------b---bbbbbbbbbbbbbbbbbbbb----------------------d----dddbddddbddbbdbdbdddddbbbbddbbdddbb-----b--------------b------bbbbbbbbbbddbbaaaabbbbbbbbb-b--------b--bbaaabbbbbbbbbbbbbb-----------------------d----dddddbbdbddddddddddbddbbbbbbbbbbdbbbb----bb-------------bb---b--bbbbbdbbbbdbbaaaaabbbbbaa--------------bbaaabbbbbbbbbbbb-------------------------dd----ddbddddbdddddddbddddbbdbbbbbbbbdbbbb-----bb-------------bb--b--bbbdbbbbbbbbbaaaaabbbbaaaa-------------bbaabbbbbbbbbbbb----------------d--------dd------dddbddddbddddbbdbddbdbdddbdbbbdbbbbb-----bb-----------------b-bbbbbbbbbbbbbaaaaabbbaaaaa------------bbbbbbbbbbbbbbbb-----------------dd---------------ddddddddbdddddbdddbddbbbdbdbbbbbbbbb-----bbb-b-------------b---bbbbbbdbbbbbaaaabbbbaaaa-------------bbbbbbbbbbbbbbb------------------dd----------------dbbddbbdbdbbddbbdbbbbdddbbbdbbdbbbb------bbbbb-------------b--bbbbbbbbbbbbaaaabbbbaaaa------------bbbbbbbbbbbbbb---------------dd---dd----------------dbdbbdbdddbbbbbbdbbbbbbbbbbbbbddbbbb----bb-b-b-------------b---bbbbbbbbbbbbbbbbbbbbaa---------aaa-bbbbbbaabbbbbb---------------dd---ddd---------------ddbdbddbdbdbbbbbdbbbddbbbbddbbbbbbbb-----b-bbbb------------b-b-bbdbbbbbbbbaabbbbbbb-----------aaabbbbbbaaabbbbb---------------d---ddddd---dd-----------dbdbdbdddbbbbbbbbbbddbbbbdbbbbbbbbbb----b-bbbb------------bbb-bbbbbbbbdbbaaaaabbbb--------------bbbbbbaaabbbb-------------d------dddbd---dd-----------dddddbdddbbbbbbbbbbbbbbbbbbbbbbbbbbb----b-bbbbb-------------b--bbbbbdbbbbaaaaaabb---------------bbbbbbaabbbbb----------d---bbbbbbddddd-bdd------------bbdbdbdbbbbbbbbbbbbbbbbbbbbdbbbdbbbb-----bbbbbb----------------bbbbbbbbbbaaaaaaaa---a----------aaabbbbbbbbbb--------------bbbbbbbbddd--dddd------------bdbdddbbbbbbbbbbbbbbbdbbbbddbbdbbbbb----bbbbbb----------------bbbbbbbbbbaaaaaaaa---aa--------aaaaabbbbbbbbb-------------dbbbbbbbdddd--ddbd------------bbbbddbbbbbbbbbbbbbbbdbbbbbbdbdbbbbb----bbbb-b----------------bbbbbbbbbbaaaaaaaa--aaa--------aaaaabbbbbbbaaa-----------bddbbbddbdddb-bddb----dd-------bbbddbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbb----bbbbbb------b---------bbbbbbbbbbaaaaaaaa--aaa--------aaaabbbbbbbaaaa---------bbbdbdbbbbbdddd-bdbb---ddd-------bbdddbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-----bbbbb-----------------bbbbbbbbbaaaaaaaa-------------aaabbbbbbbaaaaa---------bbbbbbbbbbddddd-dbbd-dd-d---------bbddbbbbbbdbbbbbbbbdbbbbbbbbbbdbbbb----bbbbb-------------b----bbdbbbbbbaaaaaaaa---------------bbbbbbbbaaaa---------bbbbbbbbdbbddddd-bdd--dbdd---------bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb----b-bbb-------------b----bbbbbbbdbaaaaaaaa---------------bbbbbbbbbaa----------bbdbbbbbddddddbd-dd---ddd----------bbbbbbbbbbbbbbbbbbbbbbbbbdbbbbbbbbb----b-bbb-------------b----bbbbbbbbbaaaaaaaaa--------------bbbbbbbbbbb-----d----bbbbbbbbbddddddd-dd--ddbb-d-------bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb----bbbbb------------bb----bbbbbbbbbaaaaaaaaa--------------bbbbbbbbbbb----------bbbbbbbbdddddddd-bd-dddbdddd------bbbbbbbbbbbbbbbbbdbbbbbbbbbbbbbbbbbb-----bbbb-------------b---bbbbbbbbbbaaaaaaaaa--------------babbbbbbbb----------dbbbddbbbbdddddd--dddddbbbddd----d-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb----bbbb-------------bb---bbbbbbbbbbaaaaaaaaa-------a------aaaabbbbbb--------d-bbbbbbbbbddddddd-bd-ddddbb--------bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-----bbb-----b-b------b----bbbbbbbbbbaaaaaaaaa-------aa----aaaaaabbbbb----------bbbbbbdbbddddbdddbdddddbb---------bbbbbdbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-----bb------bbb----------bbbbbbbbbbbaaaaaaaa--------aa---aaaaaaabbbbb----------bddbddbbdbddddddddbdddbbb---------bbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbb------bb-----b-------------bbbbbbbbbbbaaaaaaa--------------aaaaaaaabbbb----------bbbbdbbddddbbdddddbddbbbb--------bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-----bb-------------------bbbbbbbbbbbbaaaaaaa--------------aaaaaaaabbbbb-------d--bbbbdbdbbdddbddddddbbbbb--------bbbbbbbbbbbbbbbdbbbbbdbbbbbbbbbbbbb------bb--------------b----bbbbbbbbbbbbaaaaaa---------------aaaaaaaabbbbb----------bbbbbbddddddddbdbdbbbdbb--------bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb------bb---------------b----bbbbbbbbbbbbaaaaaa---------------aaaaaaabbbbbb----------bdbbbbbbddddddddbdbddbbb---------bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-----bbb--------------------bbbbbbbbbbbbbaaaaa----------------aaaaaaabbbbbb----------bbbbbdbbbbdddbddddbdbbdb----------bbbbbbbbbbbbbbbbbbbbbdbbbbbb-------bb---------------------bbbbbbbbbbbbbbaaa------------------aaaaaaabbbbaaa----------bbbbbbbbddddddbddddbbbb----------bbbbbbbbbbbbbbbbbbbbbbbbb----------b-----b------------bb-bbbbbbbbbbbbbbbaa-------------------aaaaaabbbbbaaa----------bbbbbbbdddddddbddbbbbb--c---------bbbbbbbbbbbbdbbbbbb--dd--------b---------------------b-bbbbbbbbbbbbbbbbaaa-----------aaa-----aaaaabbbbbaaa----------bbbbbbddddddddddbbbbbb--c-----------bbbbbbbbbbbbbb---------------b--------------------bbbbbbbbbbbbbbbbbbbaaaa---------aaaaa----aaaaabbbbbaaaa---------bbbbbbbddddbddbdbbbbdbccc-----------bb-bbbbbbbbbb-------------------------------------b-bbbbbbbbbbbbbbbbbaaaaaa-------aaaaaa---aaaaabbbbbaaaa----------bbbbbbbdddddddbbdbbbbc--b-----------b--bbbbbbbbb-----------b-------b------------------bbbbbbbbcccbbbbbbbaaaaaaa------aaaaaa----baabbbbbbbaaa----------bbbbdbbdddddddbdbbbbbc---b---c----------bbbbb--------------b-----bbb-----------------bbbbbbbbbcbccbbbbbbaaaaaaaa------aaaa-----bbbbbbbbbbba-----------bbbbdbbddddddbddbbbbcc-------c----------------------b--bbb--------------------------bbbbbbbbbbbbbbbbbbbbaaaaaaaa----------------bbbbbbbbbbbb----------bbbbbddbdddddddbbbbbbb------cc---------------------------------------------------bcbbbbbbbbbbbbbbbbbbbbbaaaaaaaa----------------bbbbbbbbbbbbb----------bbbbddbdddbddbbbbbbbb---bb-cc-------------------------------------------------cccbbbbbbccccbbbbbbbbbbbbaaaaaaaa----------------bbbbbbbbbbbbb----------bbbbbdbddddddbbbbbbcbb--bcbbc-------c---------------------------------------cccbbbbbbcccbbbbbbbccccbbbbaaaaaaaa------------a---bbbbbbbbbbbbb-----------bbbbdbdddddbbbbbbbcbb----cbc----b--c-------------------------------------cccbbbbbbbbbbbbbbbbbbcbcccbbbaaaaaaaaa---------aaaa--bbbbbaaabbbbb------------bbbbbdddddbbbdbbbcbbb---------bb--c---------b--------------------------bccbbbbbbbbbbbbbbbbbbbbccbccbbaaaaaaaaa--------aaaaaa-bbbbaaaabbbbb-------------bbbbdddddbbbbbbbcbbbcbc-cc-bbbbb-cbbbb-----b------------bb---------bbcccbbbbbbbbbccccbcbbbbbbbbccccbaaaaaaaaa-------aaaaaaaabbbbaaaabbbbbb--------------bdddddbbbbbbbbbcbbcbbccccbbbbb-cbbbbb----bbb---------bbbb-----bbbbbcbbbbbbbbbbbbbbbcccccbbbbbbbcbbaaaaaaaaa------aaaaaaaaabbbbaaaaabbbbb---------------dddddbbbbbbbbbcbbcbbbbbcbbbbbbbbbbbbb---bbb---------------bbbbbbbbbbbbccccccbbbbbbbbbbcccbbbbbbbbaaaaaaaaa------aaaaaaaabbbbbaaaaabbbbb-----------d---dddddbbdbbbbbbcbbcbbbbbccbbccbbcbbbbb---bbb-----b-------bbbbbbbbbbbbbbbbbbbccbbbbbbbbbbbbbbbbbbbbaaaaaaaaa------aaaaaaaabbbbbaaaaabbbbaaa--------------dddbbbbbbbbbbbbbbcbbbbccbbcbbbcbbbbbb--bbbbbbbbbb---bbbbcccbbbbbbbbbbbbbbbbccbbbbbbbbbbbbbbbbbbbaaaaaaaaa------aaaaaaaaabbbbbaaaabbbbaaaa-------------dddbbbbbbbbdbbbbbbcbbbcbbbbcbbcbbbbbbbbbbbbbbbbbbbbbbbbccbbbbbbbbbbbbbbcccbbbbbbbbbcccccbbbbbbbbaaaaaaaaa-------aaaaaaaabbbbbaaabbbbbaaaa-----------d-dddbbbbbbbbbbbbbbbbbbbbbbbbcbbbcbbbbbbbbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccbbbbbbbbbbbbbbbcbbbbbbbbaaaaaaaaa--------aaaaaaabbbbbbbbbbbbbaaaa-------------dd---bbbccccbbbbbbbccbbbbbbbbbbcccbbbbbbcbbbccbbbbbbbbbbbcccccbbbbbcccccbbbbbbbbbbbbbbbbccbbbbbbaaaaaaaaa---------aaaaabbbbbbbbbbbbbbaaaa-------------dd-----bbbbcccbbbbbbccccbbbbbbbbcbcbbbbbcccccbbbbbbbbbbbccccccbbcccbbbbbbbbbbccccccbbbbbbccccbbbaaaaaaaa--------------bbbbbbbbbbbbbbbbaabb------------dd-dd----bbbcbbbbbbbbbbccbbbbbbbbbccbbbbbbbbbbbcccbbbbbbccbbbbbbbbbbbbbbbcccccccccccbbbbbbcccbbbaaaaaaaa--------------bbbbbbbbbbbbbbbbbbbbb-----------dd--------bbbcccbbbbbbbbcccbbbbbbbbccbbbbbbbbbbbbbbbbbbccbbbbbbbbbbbbbbbbbbbbbbbbcccccbbbbbbcbbbaaaaaaaa-------------bbbbbbbbbbbbaaabbbbbbb------------d----------bbbcccbbbbbbbccbbbbbbbbbbbbccbbccbbbbbbbbccbbbbbbbbccccccccccccbbbbbbbcccccbbbbbbccbaaaaaaa--------------bbbbbbbbbbbaaaabbbbbbaaa-----------------------bbbcccbbbbbbccbbbbbbbbbbbbbccccbbbbbbbbcbbbbbbbcccccccccccccccbbbbbbbbccbcbbbbbbcbaaaaaaa--------------bbbbbbbbbbbaaaabbbbbbaaaa-----------------------bbbbbcccbbbbcccccbbbbbbbbbbbbbbbbbbbbbbbbbbbccccccccccccccccccbbbbbbbbbcccbbbbbbbaaaaaaa--------------aaaaaaaabbbaaaabbbbbbaaaa-------------------------bbbbccbbbbbbccccccccbbbbbbbbbbbbbbbbbbbcccccccccccccccccccccccccbbbbbbcccbbbbbbaaaaa---------------aaaaaaaaaabbbaaabbbbbbbaab---------------------------bbbcbbbbbbbbbcccccccbbccbbbbbbccbbbbccccccccccccccccccccccccccccbbbbbcccbbbbbaaaaa---------------aaaaaaaaaabbbbbbbbbbbbbbbbb---d----------------b------bbbbbbcbbbbbbbbbbbbcccbbbbbbccbbbbcccccc---------ccccccccccccccccbbbbcccbbbbaaaaa---------------aaaaaaaaabbbbbbbbbbbbbbbbbbb--------------------bb-----bbbbbbcbbbbbbbbbbbbbbbbbbbcbbbccccccc---------------ccccccccccccccbbbccbbbbaaaaaaa-------------baaaaaaaabbbbbbbbabbbbbbbbbbbb----d-------------bbb------bbbbbccbbbbbbbbbbbbbbcbccbbccccccc------------------cccccccccccccbbbccbbbaaaaaaa-------------bbbbbbbbbbbbbbbbbabbdbbbbbdbbbb---d--------------bbb------bbbbbccbbbbbbbbbbbbbcccbbcccccc---------------------cccccccccccccbbbcbbbaaaaaaaa-----------aabbbbbbbbbbbbbbbaabbbbaaabdbbbbbbdd-------------------------bbbbbccbbbbbbbbbcccbbbbccc-------------------------ccccccccccccbbbcbbbaaaaaaaa-------aaaaaaaabbbbbbbbbbbaaaabbbbaaabbbbbbbbddd--------------------------bbbbcccbbbccccccbbbcccc---------------------------ccccccccccccbbcbbbaaaaaaaa-------aaaaaaaaabbbbbbbbbbaaaabbbbbaabbbbbddbdd---d-------------------------bbbbbccccccccbbbbcc-------------------------------ccccccccccbbbbbbaaaaaaaa-------aaaaaaaabbbbbbbbbbbaaaaabbbdbbbbddbbddddbb-----------------------------bbbbbbbbbbbbbbcc--cc-----------------------------cccccccccbbbbbbaaaaaaaa---------aaaaabbbbbbbbbbbbbaabbbbbbbbbbbddbddddbbb------------------------------bbbbbbbbbbbcc--c---------------------------------ccccccccbbbbbaaaaaaa-------------bbbaaaabbbbbbbbbbbbbbbbbbbbbbdbddddddbb------------------------------bbbbbbbbbb--ccc----------------------------------cccccccbbbbbaa-aaa--------------baaaaaaabbbbbbbbbbdbbbbbbbbbbdbdddddbbbbb---------------------bbbb----bcbbbbbb-ccc-------------------------------------cccccccbbbbaa------------------aaaaaaaabbbbaabbbbb-----bbbbbbbdddddbbbbdb--------------------bbbbbb---cccccc--c-------------------ccc-----------------cccccccbbbba-------------------aaaaaaaabbbbaaaab----------bbbbddddbbdbbdbb-------------------bbbbbbb----ccc-------------------cccccccccc--------------cccccccbbbba-------------------aaaaaaaabbbbaaa---------------dddddbbddbbbbb-c------bbbb-------bbbbbb-------------------------cccccccccccc--------------ccccccbbbcaaa------------------baaaaabbbbbaaa---------------dddddbbbbbddbbbcc-----bbbbb-------bccbc------------------------ccccccccccccccc------------cccccccbbcaaaa-----------------baaabbbbbbaaaa----------------ddbbbbbbbdbbbbbccc---bbbbb---------ccc------------------------cccccccccccccccc------------ccccccbbbaaaaa----------------bbbbbbbbbbba------------------dd--bbbdddbdbdbbbc----bbb----------cc------------------------ccccccccccccccccc---------c--ccccccbbbaaaaa----------------bbbbbbbbbbb-------------------d----dbbbddbbbbbbb----bbb---------------------------------ccccccccccbbccccccccc--------cc-ccccccbbbaaaaa-----------------bbbbbbbbbb--------bbbb-aa----d------bcbdbbbbbbbb--------------------------------------ccccbbbbbbbbbbbbcccccc---------c--cccccbbbaaaaa-----------------bbbbbbbbb--------aabbbbaaa-----------bbbdbcbbcbbbb-----------------------------------cccccbbbbbbbbbbbbcccccc---------c--cccccbbbaaaaa-----------------baaaaabbb-------aaabbbbbabb----------bbbbbbbbbcbbbbb-------------------------------ccc-cccbbbbbbbbbbbbbccccc---------c--cccccbbbaaaa------------------aaaaaaabb-------aaabbdbdbbbbbd---------bbbbbbbccbbbbb------------------------------c--cccbbbbbbbbbbbbbbccccc---------c--cccccbbcaaaaa----------------aaaaaaaaab--------aabbbbbbbbbdd---------bdbbbbbbbcbccbb--------------ccc--------------cccbbbbbbcccbbbbbbccccc---------c--cccccbbcaaaaaaa-------------aaaaaaaaaabb---------bbbbbbddbdbb---------bbccbbbbbbbcbbb------------cccccc------ccc--cccbbbbcccccbcbbbbbccccc---------c-cccccbbbcaaaaaaaa-----------aaaaaaaaaabbb-----------bbbbdbbdddb---------bbccbbbcbbbbbbb-----------cbbbccb-----c--ccccbbbbbcbbbcccbbbbbcccc----------c-cccccbbbcaaaaaaaaa---------aaaaaaaaaaabbbb----------bbdbbbddddbb---------bbcbbbccbbbbbbbb---------cbbbbcc----c--bcbbbbbbbbbbbbccccbbbbcccc---------cc-cccccbbbcaaaaaaaaa---------aaaaaaaaaabbbbb------------bbbbdddbdbb----------cccbbbccbbbbbbbb--------bbbbbb------cccbbbbbbccbbbbcbccbbbccccc---------c--ccccbbbbcaaaaaaaaa---------aaaaaaaaabbbbbbb------------bbddddbbbbb----------bccbbbccbbbccbbbb------bbbbbb-----cccbbbbcbbcbbbbbcccbbbbccccc---------c--ccccbbbccaaaaaaaaa----------aaaaaaaabbbbbbbbaaa--------bbdddbbbdbbb----------bccbbbcccbbcccbbbbb----bbbb-----bccbbbbbcbccbbbbccbbbbbccccc----------c--ccccbbbcbaaaaaaaaa-----------aaaabbbbbbbbbbbaaa---------bddbddbbbbcb----------bccbbbbccbbbccbbbbbbbb-------bbbcbbbbbbccbbbbbccbbbbbbccc---------------ccccbbcbbaaaaaaaa--------------bbbbbbbbbbbbbaabb--------bddbbdbbbbbbb----------bcccbbbbccbbccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccbbbbbbbbccc--------------ccccbbbbbbaaaaaaa---------------bbbbbbbbbbbbbbbbbb--------ddbbdbbbbcbc-----------bbcccbbbcbbbbbbbbbbbbbbbcbbcbccbbbbbbbbbbbbbbbbcbbbcc---------------cccccbbbbbbaaaaaaa---------------bbbbbbbbaabbbbbbbbb--------dbbbbbbbbbcb-----------bbbccbbbccbbbbcbbbbcbbbbbbbcbbcccccbbbbbbbbccbbbbbc----------------cccccbbbbbbaaaaaaa--------------aabbbbbbaaaaabbbbbbb-------d-bbbddbdbbbcb-----------bbbccbbbbbcbbbcccccbbbbbbcbccbbbbbbcbbbbbbbbbbbbcc---------------ccccccbbbbbbaaaaaa--------------aaabbbbbbaaaaabbbbbbbb----------bbbbbbbbcbb-----------ccbccbbbbcccbbbbbbbbbbccccbcbbbbbccbbbbbbbccbcc-----c----------ccccccbbbbbbbaaaaaa--------------aaabbbbbbaaaaabbbbdbbbb-----------bbbbbbbbbbb----------ccbbcbbcbbccccbbbccccccccccbbbcccbbcccbbbccbc---c--------c---ccccccbbbbcbbbaaaaaa---------------bbbbbbbbbbbbbbbbbbbdbb-------------bbbbbbcbbb------c---ccbbbbbcccbbbbbbbbbbbbbcbbbbbbbbbccbbccccbcb---------------ccccccbbbbcbbbbaaaaaa----------------bbbbbbbbbbbbbbbbbbbbbb------------cbbbbbccbb--c--------cccbbbbbbbbbbbccccbbbcccbbcccbbccbccccc-----c--------c----cccccbbbbccbbbbaaaaaa----aaa----------bbbabbbbbbbbbbbbbbbdbb-dd--------ccbbbbbbbbb------------bbccbbbbbbbcccbccccccccccbbcccccccccc------------------ccccbbbbbbcbbbcbaaaaaab--aaaa----------bbaaabbbbbbbbbbbbbbdbbbdd---------cbbbbbbbbbb-----------c-bccccccbbcbbccbccccccccccccccccbcc------------------cccbbbbbbbbbbbbcbaaaaaab-aaaaa-----------baaabbbbbbbbbbdbbbddbdddb---------cbbbbbbbbbbb------------bbccccbbbbbbbccccccccccccbbbbccc---cc-c-----------cccbbbbbbbbbbbbccbaaaaaab-aaaa-------------babbbb-bbbbbbbbdbddbddbbbb-------cc-bbbbcbbbbbb--------cc--bbbbbbbcccccbcccccbcccccccbc----c--------------ccccbbbbcbbbcbbbcbbaaaaabb-aaaa---------------bb-----bbbbbbbddbdddbdbbb---------bbbbbcbbbbb-----c---cc--bbcbbcccccccbbccbbccbccb------c---------c----cccbbbbbccbbccbbccbbaaaaabbbaaa-------------------------bddbbddbdddbdbbbb---------bbbbcbbbbb----------ccc-----c---------cb-c-------c------------------ccbbbbcccbbbcbbbcbbbaaaabbbb-a----------------------------bbbbdbdddbdbbdbb--------cbbbccbbb------------cc-------c-cccc--c--cc--c---c-----------------bbbbbcccbbbbcbbcccbbbaaabbbbb---------------bb---------------bbdbddbbbbbbbbb-------ccbbbbcbb---cc-----------c-c--c-------cc-c---c----cc-------------bbbcbbccbbbbbccbbcbbbbbaaabbbbbb-------------bbb-----------------bbdbdbbbbbbbbb-------ccbbbbbbc---cc----------------------------cc-------------c-----bbbbbcccbbbbbbcbbbbbbbbbaabbbbbbb--------------bb------------------bdbdbdbbbbbbbb-------cbbbbbbcc---cc--c-------------c-cccccc--cc-------------------bbcbbbcbbbbbbccbbbbbbbbbbbbbbbbbbbb----------------------bbb---------dbbbbbbbbcbbb-------ccbbbbbbcc--------------------------cc-------c------c----ccccbcccbcbbbbbbccbbbbbccbbbbbbbbbbbbbbb-------------------bbbbbb--------d-bbbbbbbccbb--------cbbbbbbbbcb--------c-c-c----------cc-------------c----cc--bbbbbbbbbbbbbbcbbbbbccbbbcbbbbaaabbbbb------------------bbbbbbbb-------d----bbbbcc----------cbbbbbbbbccbbbb-c-cc---ccc----------------c-------cc--c-bbbbbbbbbbbbbbbbcbbbbccbbbccbbbaaaabbbbbaaa---------------bbbbbbbbb------d--------cc------c--bcbbbbbbbbbcccbbbb-ccc----c-----c-------ccc------ccc--c-bbbbcbbcbbbbcbbbbbbbbbcbbbbccbbbaaaabbbbbaaa-----------------bbbbbbb-----------------------cc-bcbbcbbbbbbbbccbbbbbbcc----cccc----c-------c--c-------bbbbbbcbbbbbbbbbbbcbbbbccbbbccbbbbaaaabbbbbaaa------------------bbbbbb------------------------cbbbbbbcbbbbcbbbbbbbbbbbbc--bbbbbbcbbbbbbbcbbcbbbbbbbbccccbbbbbcbbbbbbbbbccbbcccbbbbcbbbbbaaaabbbbbbbbbb------------------bbb-------------------------ccbbbbbcbbbbccbbbbbbbbbbbbbbbbbbbbcbbbbcbbccccccbbcccccbbbbbbbbbbbbbbbbbccbbcbbbbbbccbbbbbaabbbbbbbbbbbbbbb------------------------------------------bccbbbbbccbbbbbccbbbbbbbbbbbbbccbcbbbbcbbbbbbbbbbccbcbbcccbbbcbbbbbbcbbbbbbbccbbbbbcccbbbbbbbbbbbbbbbbbbbbbbbbbbb-----------------------------------bbbbccbbbbbcbbbbbbccccccccbbbbcccccccbcbbbcbcbbbbcbbbcccccbbbbccccbbbbbbbbbccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-----------d---bbb-------bccbbbbcbcbbbbccbbbbbbbbcccbbbbbbbbbbbbbbcccccccccccccbbbcbbbbbbcccccbbbbbbcccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbddbbbbbbbdbbbccccccbbbccbbbbbbbcbbbbbbbbbccccccbbbbccbbbbbbbbbbbbbccbcccbcbcbcccccbbbbbbccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdbbbbdbbbbdddbbbdbbbbbbccbccbbbbbbccbbbbbbccbbbbbbbbbbbbbcccbbbbbbccccbcbbccbbbbbbbbbccccbbccccccbbbbbbbbbbbbbbbbbbbbbbb"
    }
}
