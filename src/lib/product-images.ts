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

export function productImage(p: Product): string {
  const t = `${p.n} ${p.m}`.toLowerCase();
  if (/cable|سلك|لفه|لفة|وصلة كاميرا|extention usb/.test(t)) return cable;
  if (/حامل|pad|بوكس|box|بواط|لقم/.test(t)) return assortment;
  if (/memory|كارت ذاكرة/.test(t)) return memory;
  if (/cover|convert|converter|adapter|adaptor|ادبتر|usb|balun|gender|spliter|اسبليتر/.test(t)) return adapter;
  if (/hdd|هارد/.test(t)) return hdd;
  if (/mouse|ماوس/.test(t)) return mouse;
  if (/speaker|speeker|سماع|سمعات|سمعات|headphone/.test(t)) return speaker;
  if (/انتر كم|انتلر|انتركم|intercom|ktp03|kta02|kis103/.test(t)) return intercom;
  if (/smok|حريق|ديتيكتور|detector/.test(t)) return detector;
  if (/شاشه|شاشة|monitor/.test(t)) return monitor;
  if (/power|باور|ups/.test(t)) return power;
  if (/rack|راك/.test(t)) return rack;
  if (p.c === "rec") return recorder;
  if (p.c === "net") return /switch|سويتش/.test(t) ? network : router;
  if (p.c === "cam" || /camera|كاميرا|tc 70|tc 70|tapo/.test(t)) {
    if (/imou|ايمو|ezviz|tapo|wifi|ptz|mc510/.test(t)) return wifi;
    return /خارجي|out|hfw|b1|b5|2ce16|1021|1023|ipc-b|uac-b/.test(t) ? bullet : turret;
  }
  return assortment;
}