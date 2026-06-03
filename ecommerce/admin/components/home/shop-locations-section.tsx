import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const shops = [
  {
    name: "GlowSkin Quận 1",
    address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    hours: "8:00 - 22:00",
    phone: "028 1234 5678",
    mapUrl: "https://maps.google.com/?q=10.7730,106.7000",
  },
  {
    name: "GlowSkin Quận 3",
    address: "456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM",
    hours: "8:00 - 22:00",
    phone: "028 2345 6789",
    mapUrl: "https://maps.google.com/?q=10.7800,106.6900",
  },
  {
    name: "GlowSkin Quận 7",
    address: "789 Nguyễn Lương Bằng, Phú Mỹ Hưng, Quận 7, TP.HCM",
    hours: "9:00 - 21:30",
    phone: "028 3456 7890",
    mapUrl: "https://maps.google.com/?q=10.7290,106.7220",
  },
];

export function ShopLocationsSection() {
  return (
    <section className="py-10 lg:py-16 bg-gradient-to-b from-background via-secondary/10 to-primary-light/15">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Hệ Thống Cửa Hàng
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ghé thăm cửa hàng GlowSkin gần bạn nhất để trải nghiệm sản phẩm trực tiếp và nhận tư vấn miễn phí.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Map */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden h-[350px] lg:h-[450px] shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31355.879780551064!2d106.68!3d10.78!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5e4b2064da!2zUXXhuq1uIDEsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hệ thống cửa hàng GlowSkin"
            />
          </div>

          {/* Shop list */}
          <div className="lg:col-span-2 space-y-4">
            {shops.map((shop) => (
              <Card
                key={shop.name}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-5 pb-5">
                  <h3 className="font-semibold text-lg mb-3 text-primary">
                    {shop.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/60" />
                      <span>{shop.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0 text-primary/60" />
                      <span>{shop.hours}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0 text-primary/60" />
                      <span>{shop.phone}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-transparent"
                    asChild
                  >
                    <a
                      href={shop.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="h-3.5 w-3.5 mr-2" />
                      Chỉ đường
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
