# Uçuş Keşfi

Bu proje, React Native ve TypeScript ile geliştirilen uçuş keşfi case çalışmasıdır. Sağlanan mock İstanbul → Antalya uçuş verileri üzerinde listeleme, filtreleme, sıralama, uçuş detayı ve favoriler akışlarını kapsar.

## Gereksinimler ve sürümler

| Araç | Sürüm |
|---|---|
| Node.js | 22.20.0 |
| npm | 10.9.3 |
| Expo SDK | 57.0.20 |
| React Native | 0.86.3 |
| TypeScript | 6.0.3 |

## Kurulum

Repository kökünde uygulama bağımlılıklarını kurun:

```bash
npm ci
```

## Mock servis

Ayrı bir terminalde, repository kökünden sağlanan mock servisi başlatın:

```bash
cd case-kit
node server.js
```

Uygulama kullanılırken servis çalışmaya devam etmelidir. Manuel olarak doğrulanan iOS Simulator API base URL değeri `http://localhost:4000` adresidir.

Sağlanan servis dokümantasyonuna göre Android Emulator için base URL `http://10.0.2.2:4000`, fiziksel cihaz için bilgisayarın LAN IP adresidir. Bu ortamlar manuel olarak doğrulanmadı.

## Uygulamayı çalıştırma

Mock servis çalışırken repository kökünde:

```bash
npm run ios
```

Manuel doğrulama iPhone 17, iOS 26.5 Simulator üzerinde yapıldı.

## Testler

```bash
npm test -- --runInBand
```

Doğrulanan sonuç: 3 test suite, 6 test ve 0 snapshot; tümü başarılı.

Davranış kapsamı:

- Filtre değişiminde pagination state'inin sıfırlanması ve doğru sunucu sorgusu
- Tekrarlanan pagination isteklerinin engellenmesi
- Pagination hatası ve retry sırasında mevcut verinin korunması
- Eski query generation yanıtlarının yok sayılması
- Favorilerin hydration, ekleme, çıkarma, kalıcılaştırma ve geri yükleme akışı
- Hydration tamamlanmadan boş favori listesinin depolamaya yazılmaması
- Ekran seviyesinde istek hatası → `Tekrar dene` → başarılı uçuş listesi etkileşimi

## Mimari kararlar

- Expo, React Native ve TypeScript kullanıldı.
- Ekran geçişleri React Navigation native stack ile yönetildi.
- Liste ve favori state'i için Zustand, favori kalıcılığı için AsyncStorage kullanıldı.
- Native `fetch` kullanan küçük ve typed bir API katmanı oluşturuldu; HTTP istekleri React component ve ekranlarının dışında tutuldu.
- Tam `FlightDto` nesneleri yerine yalnızca favori ID'leri saklandı. Kalıcı ID'ler `/flights?ids=...` ile güncel uçuş verisine çözümleniyor.
- Generation/query-version kontrolü, eski filtre veya sıralama isteklerinin geç gelen yanıtlarının güncel state'i değiştirmesini engelliyor.

Bu yapı; case'in küçük kapsamına uygun, asenkron state'i öngörülebilir tutan ve ekran/component, state ve HTTP erişimini gereksiz katmanlar oluşturmadan ayıran bir yaklaşım olarak seçildi.

## Uygulanan P0 davranışları

- Sunucu metadata'sından toplam sonucu gösteren, sekizer kayıtlı paginated uçuş listesi
- Sunucu taraflı `Yalnızca direkt` filtresi
- Sunucu taraflı en düşük fiyat ve en kısa süre sıralaması
- Filtre veya sıralama değiştiğinde pagination'ın ilk sayfaya sıfırlanması
- Tarih, saat, süre, fiyat ve bagaj bilgisini gösteren uçuş detayı
- `baggageKg=0` için `Bagaj dahil değil`, `baggageKg=null` için `Bagaj bilgisi yok` ayrımı
- Liste, detay ve ayrı Favorites ekranında ortak ve kalıcı favori state'i
- İlk yükleme, pagination yüklemesi, boş sonuç, hata ve retry durumları
- Filtrelenmiş boş sonuçta açıklama ve filtreyi temizleme aksiyonu
- Detail ekranından dönüldüğünde liste, filtre, sıralama ve yüklenmiş sayfaların korunması

## P1 durumu

Her iki P1 maddesi tamamlandı.

**P1.1:** React Native Testing Library ekran etkileşim testi; istek hatası → görünür hata durumu → kullanıcının `Tekrar dene` düğmesine basması → sonraki isteğin başarılı olması → uçuş listesinin görünmesi akışını doğruluyor.

**P1.2:** Sırasız yanıt dayanıklılığı `/debug/mode?value=race` kullanılarak iOS Simulator'da hızlı filtre ve sıralama değişiklikleriyle manuel olarak doğrulandı. Önceki sorguların geç gelen yanıtları son seçili sorgunun sonucunu değiştirmedi. Mevcut generation/query-version koruması yeterli oldu; bu P1 doğrulaması için production kodu değiştirilmedi.

## Doğrulama

- Manuel UI akışları iPhone 17, iOS 26.5 Simulator'da doğrulandı.
- Otomatik testler: 3 suite / 6 test başarılı.
- TypeScript typecheck başarılı.
- Expo Doctor: 20/21 kontrol başarılı. Tek uyarı, kurulu Expo 57.0.20 sürümü için güncel olarak ~57.0.21 patch sürümünün önerilmesiyle ilgilidir; uygulamanın doğrulanan davranışlarını etkilememektedir.
- Android export doğrulaması başarılı; Android UI manuel olarak test edilmedi.
- Favoriler, Expo Go tamamen sonlandırılıp yeniden açılarak doğrulandı ve kalıcı favoriler başarıyla geri yüklendi.
- Mock servis fiyat sıralamasının ilk üç kaydı `FL004`, `FL009`, `FL006` olarak doğrulandı.
- Race mode testinden sonra servis `/debug/reset` ile normal duruma getirildi.
- `case-kit`, sağlanan ZIP ile birebir aynı kaldı.

## Harcanan süre

Yaklaşık 2,5 saat aktif çalışma.

## Bilinen sınırlamalar

- Manuel UI doğrulaması yalnızca iOS Simulator'da yapıldı.
- Android export/build doğrulaması geçti ancak Android Emulator UI manuel olarak test edilmedi.
- Uçuş verilerinin kullanılabilmesi için sağlanan yerel mock servis çalışır durumda olmalıdır.

## AI kullanımı

Geliştirme ve kod inceleme süreçlerinde yapay zekâ destekli araçlardan yararlanıldı. Tüm değişiklikler case gereksinimlerine göre incelendi; otomatik testler, sağlanan mock servis ve manuel iOS Simulator testleriyle doğrulandı.
