import * as Plotly from "plotly.js";

import localeAf from "plotly.js/lib/locales/af";
import localeAm from "plotly.js/lib/locales/am";
import localeAr_dz from "plotly.js/lib/locales/ar-dz";
import localeAr_eg from "plotly.js/lib/locales/ar-eg";
import localeAr from "plotly.js/lib/locales/ar";
import localeAz from "plotly.js/lib/locales/az";
import localeBg from "plotly.js/lib/locales/bg";
import localeBs from "plotly.js/lib/locales/bs";
import localeCa from "plotly.js/lib/locales/ca";
import localeCs from "plotly.js/lib/locales/cs";
import localeCy from "plotly.js/lib/locales/cy";
import localeDa from "plotly.js/lib/locales/da";
import localeDe_ch from "plotly.js/lib/locales/de-ch";
import localeDe from "plotly.js/lib/locales/de";
import localeEl from "plotly.js/lib/locales/el";
import localeEo from "plotly.js/lib/locales/eo";
import localeEs_ar from "plotly.js/lib/locales/es-ar";
import localeEs_pe from "plotly.js/lib/locales/es-pe";
import localeEs from "plotly.js/lib/locales/es";
import localeEt from "plotly.js/lib/locales/et";
import localeEu from "plotly.js/lib/locales/eu";
import localeFa from "plotly.js/lib/locales/fa";
import localeFi from "plotly.js/lib/locales/fi";
import localeFo from "plotly.js/lib/locales/fo";
import localeFr_ch from "plotly.js/lib/locales/fr-ch";
import localeFr from "plotly.js/lib/locales/fr";
import localeGl from "plotly.js/lib/locales/gl";
import localeGu from "plotly.js/lib/locales/gu";
import localeHe from "plotly.js/lib/locales/he";
import localeHi_in from "plotly.js/lib/locales/hi-in";
import localeHr from "plotly.js/lib/locales/hr";
import localeHu from "plotly.js/lib/locales/hu";
import localeHy from "plotly.js/lib/locales/hy";
import localeId from "plotly.js/lib/locales/id";
import localeIs from "plotly.js/lib/locales/is";
import localeIt from "plotly.js/lib/locales/it";
import localeJa from "plotly.js/lib/locales/ja";
import localeKa from "plotly.js/lib/locales/ka";
import localeKm from "plotly.js/lib/locales/km";
import localeKo from "plotly.js/lib/locales/ko";
import localeLt from "plotly.js/lib/locales/lt";
import localeLv from "plotly.js/lib/locales/lv";
import localeMe_me from "plotly.js/lib/locales/me-me";
import localeMe from "plotly.js/lib/locales/me";
import localeMk from "plotly.js/lib/locales/mk";
import localeMl from "plotly.js/lib/locales/ml";
import localeMs from "plotly.js/lib/locales/ms";
import localeMt from "plotly.js/lib/locales/mt";
import localeNl_be from "plotly.js/lib/locales/nl-be";
import localeNl from "plotly.js/lib/locales/nl";
import localeNo from "plotly.js/lib/locales/no";
import localePa from "plotly.js/lib/locales/pa";
import localePl from "plotly.js/lib/locales/pl";
import localePt_br from "plotly.js/lib/locales/pt-br";
import localePt_pt from "plotly.js/lib/locales/pt-pt";
import localeRm from "plotly.js/lib/locales/rm";
import localeRo from "plotly.js/lib/locales/ro";
import localeRu from "plotly.js/lib/locales/ru";
import localeSk from "plotly.js/lib/locales/sk";
import localeSl from "plotly.js/lib/locales/sl";
import localeSq from "plotly.js/lib/locales/sq";
import localeSr_sr from "plotly.js/lib/locales/sr-sr";
import localeSr from "plotly.js/lib/locales/sr";
import localeSv from "plotly.js/lib/locales/sv";
import localeSw from "plotly.js/lib/locales/sw";
import localeTa from "plotly.js/lib/locales/ta";
import localeTh from "plotly.js/lib/locales/th";
import localeTr from "plotly.js/lib/locales/tr";
import localeTt from "plotly.js/lib/locales/tt";
import localeUk from "plotly.js/lib/locales/uk";
import localeUr from "plotly.js/lib/locales/ur";
import localeVi from "plotly.js/lib/locales/vi";
import localeZh_cn from "plotly.js/lib/locales/zh-cn";
import localeZh_hk from "plotly.js/lib/locales/zh-hk";
import localeZh_tw from "plotly.js/lib/locales/zh-tw";

Plotly.register([
  localeAf,
  localeAm,
  localeAr_dz,
  localeAr_eg,
  localeAr,
  localeAz,
  localeBg,
  localeBs,
  localeCa,
  localeCs,
  localeCy,
  localeDa,
  localeDe_ch,
  localeDe,
  localeEl,
  localeEo,
  localeEs_ar,
  localeEs_pe,
  localeEs,
  localeEt,
  localeEu,
  localeFa,
  localeFi,
  localeFo,
  localeFr_ch,
  localeFr,
  localeGl,
  localeGu,
  localeHe,
  localeHi_in,
  localeHr,
  localeHu,
  localeHy,
  localeId,
  localeIs,
  localeIt,
  localeJa,
  localeKa,
  localeKm,
  localeKo,
  localeLt,
  localeLv,
  localeMe_me,
  localeMe,
  localeMk,
  localeMl,
  localeMs,
  localeMt,
  localeNl_be,
  localeNl,
  localeNo,
  localePa,
  localePl,
  localePt_br,
  localePt_pt,
  localeRm,
  localeRo,
  localeRu,
  localeSk,
  localeSl,
  localeSq,
  localeSr_sr,
  localeSr,
  localeSv,
  localeSw,
  localeTa,
  localeTh,
  localeTr,
  localeTt,
  localeUk,
  localeUr,
  localeVi,
  localeZh_cn,
  localeZh_hk,
  localeZh_tw,
]);
