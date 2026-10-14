# Papcorns Hackathon Quickstart

Papcorns internal dashboard'unun **boş hali**. Soldaki menü boş, hiçbir sayfa yok; ama dashboard'un kabuğu (sidebar, tema renkleri, dark mode), tasarım sistemi ve ortak bileşenleri burada. Hackathon projeni bu boş dashboard'un içine kurarsın ve gerçek dashboard'da nasıl görüneceğini kendi bilgisayarında görürsün.

Kod yazmayı bilmen gerekmiyor. Ne istediğini Claude'a anlatırsın, o kurar.

## Hızlı başlangıç (Claude ile)

1. **Projeyi bilgisayarına indir.**
   GitHub sayfasında yeşil **Code** düğmesine bas, **Download ZIP** de ve inen dosyayı aç. Git kullanıyorsan:

   ```bash
   git clone https://github.com/papcorns/papcorns-hackathon-quickstart.git
   ```

2. **Klasörü Claude'da aç.**
   Claude masaüstü uygulamasında **Code** sekmesine geç ve bu klasörü seç. Terminal kullanıyorsan klasörün içinde `claude` yaz.

3. **Claude'a şunu yaz:**

   > Projeyi çalıştır ve dashboard'u bana göster.

Gerisini Claude halleder: bilgisayarında eksik olan bir şey varsa (örneğin Node.js) onu kurar, projenin paketlerini indirir ve dashboard'u açar. İlk seferde birkaç dakika sürebilir. Claude bir şey kurmak ya da bir komut çalıştırmak için izin isterse onaylaman yeterli.

Her şey yolundaysa ekranda solda Papcorns logolu **boş bir menü**, ortada da **"Welcome, Hacker 👋"** yazan bir kart görürsün. Bu, dashboard'un boş hali; artık kendi sayfalarını ekleyebilirsin.

## Projeni nasıl geliştirirsin

Ne yapmak istediğini kendi cümlelerinle Claude'a yaz. Birkaç örnek:

> "Reklam Performansı" adında bir sayfa ekle. Üstte toplam harcama, gelir ve ROAS kartları olsun, altında son 30 günün grafiği. Şimdilik örnek veri kullan.

> Bu sayfaya tarih aralığı ve uygulama filtresi ekle.

> Tabloya arama kutusu koy, satıra tıklayınca sağdan detay paneli açılsın.

> Sol menüde "Raporlarım" diye bir grup oluştur, içine Haftalık ve Aylık sayfalarını koy.

İşini kolaylaştıracak birkaç şey:

- **Küçük adımlarla ilerle.** Önce sayfanın iskeletini iste, bak, sonra üstüne ekle. Tek seferde her şeyi istemektense "şunu da ekle", "şurayı değiştir" diye gitmek daha iyi sonuç verir.
- **Gördüğünü anlat.** Bir şey yanlış görünüyorsa ekran görüntüsünü yapıştırıp "şu kart çok geniş" demen yeterli.
- **Hangi parçaların hazır olduğuna bak.** Dashboard açıkken [localhost:3000/design-system](http://localhost:3000/design-system) adresinde bütün renkleri ve hazır bileşenleri (kartlar, grafikler, filtreler, butonlar) görürsün. "Şuradaki KPI kartından kullan" diyebilirsin.
- **Tema ve dark mode'u dene.** Sol alttaki palet düğmesi vurgu rengini (mavi, lila, yeşil), ay düğmesi açık / koyu modu değiştirir. Sayfan hepsinde düzgün görünmeli.
- **Veri sana kalmış.** Hiçbir şey vermezsen Claude sayfaları uydurma örnek veriyle kurar. Elindeki gerçek veriyi (dosya, export, bir kaynağa erişim) de kullanabilirsin; proje senin bilgisayarında çalışır. Bir dış servise ya da yapay zeka modeline bağlanmak istersen Claude'a söyle, anahtarını nereye koyacağını o gösterir.
- **Arayüz metinleri İngilizce.** Gerçek dashboard'daki kural bu; Claude sayfaları İngilizce metinlerle kurar. Sen Türkçe yazmaya devam edebilirsin.

## ⚠️ Projeni yayınlama

Burada geliştirdiğin kodu **GitHub'a ya da herkese açık herhangi bir yere koyma**: push etme, yeni repo / gist açma, Vercel gibi bir yere deploy etme, dışarıya açık link ya da tünel (ngrok vb.) oluşturma. Projende şirket verisi, anahtar ya da henüz paylaşılmamış fikirler olabilir.

Projen kendi bilgisayarında kalır; sunumu da kendi bilgisayarından, dashboard `localhost` üzerinde çalışırken yaparsın. Claude'dan yayınlamasını istersen bunu yapmayacak şekilde talimatlandırıldı.

## Elle çalıştırmak istersen

Terminalle aran iyiyse Claude'a bırakmadan da çalıştırabilirsin. [Node.js](https://nodejs.org) 20.9 ya da üstü gerekir (LTS sürümünü kur).

```bash
npm install
```

```bash
npm run dev
```

Sonra tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç. 3000 numaralı port doluysa terminalde yazan adresi kullan (örneğin `http://localhost:3001`).

Diğer komutlar:

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Dashboard'u bilgisayarında çalıştırır |
| `npm run build` | Yayına hazır derleme alır, hataları yakalar |
| `npm run lint` | Kod kurallarını denetler |
| `npm run typecheck` | Tip hatalarını denetler |

## Yazı tipi (isteğe bağlı)

Dashboard'un yazı tipi Bomstad Display lisanslı olduğu için bu repoda yok. Onsuz her şey çalışır; metinler bilgisayarının sistem fontuyla görünür. Gerçek dashboard'la birebir aynı görünüm istersen üç font dosyasını ekibinden alıp `public/fonts/` klasörüne koy ([ayrıntı](public/fonts/README.md)) ve sayfayı yenile.

## Bir şey ters giderse

Önce Claude'a ne gördüğünü yaz ("sayfa açılmıyor", "kırmızı bir hata çıktı") ve varsa ekran görüntüsünü ekle; çoğu sorunu kendi çözer.

| Belirti | Çözüm |
|---|---|
| `node: command not found` | Node.js kurulu değil. Claude'a "Node kur" de, ya da [nodejs.org](https://nodejs.org) adresinden LTS sürümünü indirip kur ve Claude'u yeniden aç. |
| `npm install` hata veriyor | İnternet bağlantını ve varsa VPN'i kontrol et, tekrar dene. |
| Sayfa bembeyaz ya da stiller bozuk | Claude'a "sunucuyu durdur, `.next` klasörünü sil, yeniden başlat" de. |
| Adres açılmıyor | Dashboard çalışmıyor olabilir. Claude'a "dashboard'u yeniden başlat" de. |

## Bu projenin içinde ne var

```
src/app/dashboard/            sayfalar buraya eklenir (şu an yalnızca karşılama kartı var)
src/components/dashboard/     sol menü (Sidebar.tsx içindeki liste boş)
src/components/design-system/ ortak bileşenler: buton, filtre, KPI kartı, grafik, sidebar…
src/features/                 her projenin kendi kodu ve örnek verisi
src/app/globals.css           renkler, yazı tipleri, tasarım değişkenleri
public/fonts/                 lisanslı Bomstad font dosyaları buraya konur (repoda yok, isteğe bağlı)
docs/frontend/                tasarım sistemi dokümanları
CLAUDE.md                     Claude'un bu projede nasıl çalışacağını anlatan talimatlar
```

Gerçek dashboard'dan farkı: giriş, veri bağlantıları ve mevcut sayfaların hiçbiri burada yok. Tasarım sistemi ve ortak bileşenler ise aynı; bu yüzden burada kurduğun sayfa gerçek dashboard'a taşındığında aynı görünür.

## Teknik özet

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Chart.js · Radix UI. Paket yöneticisi npm.
