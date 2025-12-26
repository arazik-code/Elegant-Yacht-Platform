// Yacht Specifications Table

import { Anchor, Ruler, Calendar, Users, Bed, Bath, Gauge, Fuel, Navigation } from 'lucide-react'

interface YachtSpecsProps {
  yacht: {
    lengthFeet?: number | null
    lengthMeters?: number | null
    beam?: number | null
    draft?: number | null
    brand?: string | null
    model?: string | null
    year?: number | null
    builder?: string | null
    cabins?: number | null
    bathrooms?: number | null
    guestCapacity?: number | null
    crewCapacity?: number | null
    engines?: string | null
    engineMake?: string | null
    engineModel?: string | null
    engineHours?: string | null
    engineType?: string | null
    driveType?: string | null
    fuelType?: string | null
    maxSpeed?: number | null
    cruiseSpeed?: number | null
    fuelCapacity?: number | null
    range?: number | null
    charterPricePerWeek?: number | null
    charterPricePerSeasonWinter?: number | null
    charterPricePerSeasonSummer?: number | null
  }
  type: 'SALE' | 'CHARTER'
  charterRoutes?: string[]
  minimumHours?: number | null
  locale?: string
}

const translations = {
  en: {
    specs: 'Specifications',
    dimensions: 'Dimensions',
    details: 'Details',
    accommodation: 'Accommodation',
    performance: 'Performance',
    propulsion: 'Propulsion',
    rates: 'Charter Rates',
    winter: 'Winter Season',
    summer: 'Summer Season',
    weekly: 'Weekly Rate',
    routes: 'Popular Routes',
    season: 'season',
    week: 'week',

    // Labels
    length: 'Length',
    beam: 'Beam',
    draft: 'Draft',
    brand: 'Brand',
    model: 'Model',
    year: 'Year',
    builder: 'Builder',
    cabins: 'Cabins',
    bath: 'Bathrooms',
    guests: 'Guest Capacity',
    crew: 'Crew',
    maxSpeed: 'Max Speed',
    cruiseSpeed: 'Cruise Speed',
    fuelCap: 'Fuel Capacity',
    range: 'Range',
    engineMake: 'Engine Make',
    engineModel: 'Engine Model',
    engineHours: 'Engine Hours',
    engineType: 'Engine Type',
    driveType: 'Drive Type',
    fuelType: 'Fuel Type',
  },
  ar: {
    specs: 'المواصفات',
    dimensions: 'الأبعاد',
    details: 'التفاصيل',
    accommodation: 'الإقامة',
    performance: 'الأداء',
    propulsion: 'المحركات',
    rates: 'أسعار التأجير',
    winter: 'الموسم الشتوي',
    summer: 'الموسم الصيفي',
    weekly: 'السعر الأسبوعي',
    routes: 'الوجهات الشهيرة',
    season: 'موسم',
    week: 'أسبوع',

    // Labels
    length: 'الطول',
    beam: 'العرض',
    draft: 'العمق',
    brand: 'الماركة',
    model: 'الموديل',
    year: 'السنة',
    builder: 'المصنع',
    cabins: 'الكبائن',
    bath: 'الحمامات',
    guests: 'سعة الضيوف',
    crew: 'الطاقم',
    maxSpeed: 'السرعة القصوى',
    cruiseSpeed: 'سرعة الإبحار',
    fuelCap: 'سعة الوقود',
    range: 'المدى',
    engineMake: 'صانع المحرك',
    engineModel: 'موديل المحرك',
    engineHours: 'ساعات العمل',
    engineType: 'نوع المحرك',
    driveType: 'نوع الدفع',
    fuelType: 'نوع الوقود',
  }
}

export function YachtSpecs({ yacht, type, charterRoutes, minimumHours, locale = 'en' }: YachtSpecsProps) {
  const t = translations[locale as 'en' | 'ar'] || translations.en
  const isRtl = locale === 'ar'

  // Group specifications
  const dimensions = [
    { label: t.length, value: yacht.lengthFeet ? `${yacht.lengthFeet}ft (${yacht.lengthMeters || (yacht.lengthFeet * 0.3048).toFixed(1)}m)` : null },
    { label: t.beam, value: yacht.beam ? `${yacht.beam}m` : null },
    { label: t.draft, value: yacht.draft ? `${yacht.draft}m` : null },
  ].filter(s => s.value)

  const details = [
    { label: t.brand, value: yacht.brand },
    { label: t.model, value: yacht.model },
    { label: t.year, value: yacht.year },
    { label: t.builder, value: yacht.builder },
  ].filter(s => s.value)

  const accommodation = [
    { label: t.cabins, value: yacht.cabins },
    { label: t.bath, value: yacht.bathrooms },
    { label: t.guests, value: yacht.guestCapacity },
    { label: t.crew, value: yacht.crewCapacity },
  ].filter(s => s.value)

  const performance = [
    { label: t.maxSpeed, value: yacht.maxSpeed ? `${yacht.maxSpeed} knots` : null },
    { label: t.cruiseSpeed, value: yacht.cruiseSpeed ? `${yacht.cruiseSpeed} knots` : null },
    { label: t.fuelCap, value: yacht.fuelCapacity ? `${yacht.fuelCapacity}L` : null },
    { label: t.range, value: yacht.range ? `${yacht.range} nm` : null },
  ].filter(s => s.value)

  const propulsion = [
    { label: t.engineMake, value: yacht.engineMake },
    { label: t.engineModel, value: yacht.engineModel },
    { label: t.engineHours, value: yacht.engineHours },
    { label: t.engineType, value: yacht.engineType },
    { label: t.driveType, value: yacht.driveType },
    { label: t.fuelType, value: yacht.fuelType },
  ].filter(s => s.value)

  return (
    <section className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className={`text-2xl font-display font-semibold text-foreground flex items-center gap-3 ${isRtl ? 'font-arabic' : ''}`}>
        <Anchor className="w-6 h-6 text-gold" />
        {t.specs}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dimensions */}
        {dimensions.length > 0 && (
          <SpecGroup title={t.dimensions} icon={Ruler} isRtl={isRtl}>
            {dimensions.map((spec) => (
              <SpecRow key={spec.label} label={spec.label} value={spec.value!} />
            ))}
          </SpecGroup>
        )}

        {/* Yacht Details */}
        {details.length > 0 && (
          <SpecGroup title={t.details} icon={Anchor} isRtl={isRtl}>
            {details.map((spec) => (
              <SpecRow key={spec.label} label={spec.label} value={String(spec.value)} />
            ))}
          </SpecGroup>
        )}

        {/* Accommodation */}
        {accommodation.length > 0 && (
          <SpecGroup title={t.accommodation} icon={Users} isRtl={isRtl}>
            {accommodation.map((spec) => (
              <SpecRow key={spec.label} label={spec.label} value={String(spec.value)} />
            ))}
          </SpecGroup>
        )}

        {/* Performance */}
        {performance.length > 0 && (
          <SpecGroup title={t.performance} icon={Gauge} isRtl={isRtl}>
            {performance.map((spec) => (
              <SpecRow key={spec.label} label={spec.label} value={spec.value!} />
            ))}
          </SpecGroup>
        )}

        {/* Propulsion */}
        {propulsion.length > 0 && (
          <SpecGroup title={t.propulsion} icon={Fuel} isRtl={isRtl}>
            {propulsion.map((spec) => (
              <SpecRow key={spec.label} label={spec.label} value={String(spec.value)} />
            ))}
          </SpecGroup>
        )}
      </div>

      {/* Charter Rates */}
      {type === 'CHARTER' && (
        <div className="mt-8 p-6 bg-card border border-border">
          <h3 className={`text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2 ${isRtl ? 'font-arabic' : ''}`}>
            <Calendar className="w-5 h-5 text-gold" />
            {t.rates}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yacht.charterPricePerSeasonWinter && (
              <div>
                <span className={`text-muted-foreground text-sm ${isRtl ? 'font-arabic' : ''}`}>{t.winter}</span>
                <p className="text-foreground font-medium">{yacht.charterPricePerSeasonWinter.toLocaleString()} / {t.season}</p>
              </div>
            )}
            {yacht.charterPricePerSeasonSummer && (
              <div>
                <span className={`text-muted-foreground text-sm ${isRtl ? 'font-arabic' : ''}`}>{t.summer}</span>
                <p className="text-foreground font-medium">{yacht.charterPricePerSeasonSummer.toLocaleString()} / {t.season}</p>
              </div>
            )}
            {yacht.charterPricePerWeek && (
              <div>
                <span className={`text-muted-foreground text-sm ${isRtl ? 'font-arabic' : ''}`}>{t.weekly}</span>
                <p className="text-foreground font-medium">{yacht.charterPricePerWeek.toLocaleString()} / {t.week}</p>
              </div>
            )}
            {charterRoutes && charterRoutes.length > 0 && (
              <div className="md:col-span-2 mt-4 border-t border-border pt-4">
                <span className={`text-muted-foreground text-sm block mb-2 ${isRtl ? 'font-arabic' : ''}`}>{t.routes}</span>
                <div className="flex flex-wrap gap-2">
                  {charterRoutes.map((route) => (
                    <span
                      key={route}
                      className="inline-flex px-3 py-1 bg-gold/10 border border-gold/30 
                               text-gold text-sm"
                    >
                      {route}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function SpecGroup({
  title,
  icon: Icon,
  children,
  isRtl
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  isRtl: boolean
}) {
  return (
    <div className="bg-card border border-border p-6">
      <h3 className={`text-sm font-medium text-gold uppercase tracking-wider mb-4 
                   flex items-center gap-2 ${isRtl ? 'font-arabic' : ''}`}>
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  )
}
