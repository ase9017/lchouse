import type { Product } from "./brand";
import turret from "@/assets/products/turret.jpg";
import bullet from "@/assets/products/bullet.jpg";
import wifi from "@/assets/products/wifi.jpg";
import recorder from "@/assets/products/recorder.jpg";
import network from "@/assets/products/switch.jpg";
import router from "@/assets/products/router.jpg";
import hdd from "@/assets/products/hdd.jpg";
import mouse from "@/assets/products/mouse.jpg";
import memory from "@/assets/products/memory.jpg";
import cable from "@/assets/products/cable.jpg";
import power from "@/assets/products/power.jpg";
import monitor from "@/assets/products/monitor.jpg";
import speaker from "@/assets/products/speaker.jpg";
import intercom from "@/assets/products/intercom.jpg";
import adapter from "@/assets/products/adapter.jpg";
import rack from "@/assets/products/rack.jpg";
import detector from "@/assets/products/detector.jpg";
import assortment from "@/assets/products/assortment.jpg";
import telephone from "@/assets/products/telephone.jpg";
import amplifier from "@/assets/products/amplifier.jpg";
import mount from "@/assets/products/mount.jpg";
import junctionBox from "@/assets/products/junction-box.jpg";
import satellite from "@/assets/products/satellite.jpg";
import powerStrip from "@/assets/products/power-strip.jpg";
import tvBox from "@/assets/products/tv-box.jpg";
import alarm from "@/assets/products/alarm.jpg";

/** Ordered rules: the first matching pattern decides the illustration. */
const RULES: [RegExp, string][] = [
  [/memory|كارت ذاكرة/, memory],
  [/rack external hdd|hdd cover|hdd convert/, adapter],
  [/mouse pad/, assortment],
  [/مشترك|electric switch|plug switch|smart plug/, powerStrip],
  [/حامل|holder|ذراع/, mount],
  [/انتر كم|انتلر|انتركم|intercom|ktp03|kta02|kis103|vto2111d|door phone|vth2621/, intercom],
  [/spliter|اسبليتر|convert|gender|balun|kvm|vga spliter/, adapter],
  [/تليفون (?!نحاس)|تلفون|el adl phone|سنترال|pabix|telphone switch/, telephone],
  [/cable|كابل|سلك|لفه|لفة|ارجيه|rg 58|patch cord|cat 5|وصلة كاميرا|extention usb|^hdmi|vga original/, cable],
  [/speaker|speeker|سماع|سمعات|headphone/, speaker],
  [/امبيلفير|أمبلفير|amplifier|مايك|microphone|mic /, amplifier],
  [/smok|حريق|ديتيكتور|detector/, detector],
  [/انزار|siren|سرينه|alarm|exit door|فاير كول|مجنتك|اكسيس كنترول/, alarm],
  [/دش|lnb|ريسيفر|diseq/, satellite],
  [/tv box|android box|chromecast|easy cap/, tvBox],
  [/box|بوكس|بواط|علبه|duct|rain proof housing/, junctionBox],
  [/cover|adapter|adaptor|adabtor|ادبتر|usb|charger|extender (60|50|gd|d li)|air line/, adapter],
  [/hdd|هارد/, hdd],
  [/mouse|ماوس|key board/, mouse],
  [/شاشه|شاشة|monitor/, monitor],
  [/power|باور|ups/, power],
  [/rack|راك/, rack],
];

export function productImage(p: Product): string {
  const t = `${p.n} ${p.m}`.toLowerCase().trim();
  if (p.c !== "cam" || !/حامل|وصلة/.test(t)) {
    if (p.c === "cam" || /camera|كاميرا|tc 70|tapo|web cam|wi fi 3 mp|sky worth/.test(t)) {
      if (/imou|ايمو|ezviz|tapo|wifi|wi fi|ptz|mc510|web cam|sky worth/.test(t)) return wifi;
      return /خارجي|out|hfw|b1|b5|2ce16|1021|1023|ipc-b|uac-b/.test(t) ? bullet : turret;
    }
  }
  for (const [re, img] of RULES) if (re.test(t)) return img;
  if (p.c === "rec") return recorder;
  if (p.c === "net") return /switch|سويتش|بورت/.test(t) ? network : router;
  return assortment;
}
