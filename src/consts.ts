// ─────────────────────────────────────────────
// 사이트 전역 상수 (SEO/GEO/브랜드 전체에서 참조)
// 태림한의원 (대구 달서구 대천동, 서조혁 원장)
// ─────────────────────────────────────────────

export const SITE = {
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://taerimclinic.com',
  name: import.meta.env.PUBLIC_SITE_NAME ?? '태림한의원',
  nameEn: 'Taerimhan Korean Medicine Clinic',
  description:
    import.meta.env.PUBLIC_SITE_DESCRIPTION ??
    '대구 달서구 대천동 태림한의원. 추나, 약침, 한약, 매선으로 통증치료, 다이어트, 교통사고, 소아성장, 피부미용, 체질개선 6가지 진료. 대구한의원, 달서구한의원, 대천동한의원.',
  locale: 'ko-KR',
  defaultOgImage: '/images/clinic/clinic-exterior.jpg',
} as const;

export const SITE_VERIFICATIONS = {
  google: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
  naver: import.meta.env.PUBLIC_NAVER_VERIFICATION ?? '',
  bing: import.meta.env.PUBLIC_BING_VERIFICATION ?? '',
  daum: import.meta.env.PUBLIC_DAUM_VERIFICATION ?? '',
} as const;

export const SITE_NAVIGATION = [
  { label: '홈', href: '/' },
  { label: '통증치료', href: '/pain' },
  { label: '다이어트', href: '/diet' },
  { label: '교통사고', href: '/accident' },
  { label: '소아·성장', href: '/pediatric' },
  { label: '피부미용', href: '/beauty' },
  { label: '체질개선', href: '/constitution' },
  { label: '오시는길', href: '/visit' },
  { label: '원장 소개', href: '/about' },
] as const;

// 한의원 메타 (의료기관 정보 - GEO/AEO 최우선)
export const CLINIC = {
  legalName: '태림한의원',
  doctorName: '서조혁',
  doctorTitle: '한의사',
  phone: '0507-1364-5379',
  address: {
    streetAddress: '진천로 93 애플플라자 3층',
    addressLocality: '대구광역시 달서구',
    addressRegion: '대구광역시',
    addressCountry: 'KR',
    postalCode: '',
  },
  geo: {
    latitude: 35.846, // 달서구 대천동 대략 (사용자 정밀화 대기)
    longitude: 128.532,
  },
  openingHours: [
    // 사용자 입력 대기. 일반적인 한의원 표준값:
    'Mo-Fr 09:30-19:00',
    'Sa 09:30-13:00',
  ],
  closedDays: ['Su', 'PublicHolidays'],
  // 외부 채널 (CTA + sameAs용)
  // 플레이스(예약/소개) vs 지도(위치/길찾기) URL 분리
  naverPlaceUrl: 'https://m.place.naver.com/hospital/1221424403', // 예약·소개 (Place ID 1221424403)
  naverMapUrl: 'https://map.naver.com/p/entry/place/1221424403', // 지도·길찾기 (지도 + 마커 + 길찾기 버튼)
  kakaoChannelUrl: '', // 사용자 입력 대기
  instagramUrl: 'https://www.instagram.com/taerim_han',
  threadsUrl: 'https://www.threads.com/@taerim_han?hl=ko',
  youtubeUrl: '',
  blogUrl: 'https://blog.naver.com/astonish977154/',
} as const;

export const ORGANIZATION = {
  '@type': ['MedicalBusiness', 'LocalBusiness'],
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.nameEn,
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE.url}/favicon.svg`,
    width: 128,
    height: 128,
  },
  image: `${SITE.url}/images/clinic/clinic-exterior.jpg`,
  // 외부 식별자 (AEO/GEO: 검색 엔진이 같은 비즈니스로 인식)
  identifier: [
    {
      '@type': 'PropertyValue',
      propertyID: 'NaverPlaceID',
      value: '1221424403',
    },
  ],
  medicalSpecialty: [
    'TraditionalChinese',
    'PhysicalMedicineAndRehabilitation',
    'Pediatric',
  ],
  // 시술별 medicalProcedure (Google 의료 검색이 시술명으로 매칭)
  availableService: [
    {
      '@type': 'MedicalProcedure',
      name: '추나요법',
      procedureType: 'https://schema.org/PercutaneousProcedure',
      bodyLocation: '척추·관절',
    },
    {
      '@type': 'MedicalProcedure',
      name: '골타요법',
      procedureType: 'https://schema.org/TherapeuticProcedure',
      bodyLocation: '뼈·근육',
    },
    {
      '@type': 'MedicalProcedure',
      name: '약침',
      procedureType: 'https://schema.org/PercutaneousProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: '매선요법',
      procedureType: 'https://schema.org/SurgicalProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: '한약 처방',
      procedureType: 'https://schema.org/TherapeuticProcedure',
    },
  ],
  // 진료 영역 catalog (AEO: "어떤 진료" 질문 답변 강화)
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: '태림한의원 진료 영역',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: '통증치료' }, url: `${SITE.url}/pain/` },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: '다이어트' }, url: `${SITE.url}/diet/` },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: '교통사고 후유증' }, url: `${SITE.url}/accident/` },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: '소아·성장' }, url: `${SITE.url}/pediatric/` },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: '피부미용' }, url: `${SITE.url}/beauty/` },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: '체질개선' }, url: `${SITE.url}/constitution/` },
    ],
  },
  // 한국어 지원 (AEO/GEO 신호)
  availableLanguage: ['ko', 'Korean'],
  priceRange: '₩₩',
  telephone: CLINIC.phone || undefined,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CLINIC.address.streetAddress || undefined,
    addressLocality: CLINIC.address.addressLocality,
    addressRegion: CLINIC.address.addressRegion,
    postalCode: CLINIC.address.postalCode || undefined,
    addressCountry: CLINIC.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: CLINIC.geo.latitude,
    longitude: CLINIC.geo.longitude,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:30',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '09:30',
      closes: '13:00',
    },
  ],
  sameAs: [
    CLINIC.naverPlaceUrl,
    CLINIC.kakaoChannelUrl,
    CLINIC.instagramUrl,
    CLINIC.threadsUrl,
    CLINIC.youtubeUrl,
    CLINIC.blogUrl,
  ].filter(Boolean),
} as const;

// 진료과목 5축 (treatments + 카테고리)
export const TREATMENTS = [
  {
    slug: 'pain',
    name: '통증치료',
    nameEn: 'Pain Treatment',
    shortDesc: '허리·목·어깨·무릎 통증을 추나·골타·약침으로',
    longDesc:
      '척추 정렬과 근막 균형을 회복하는 추나(척추·관절 손기법)와 골타요법, 약침을 결합하여 통증의 본질을 찾습니다.',
    icon: '🩺',
  },
  {
    slug: 'diet',
    name: '다이어트',
    nameEn: 'Diet & Weight',
    shortDesc: '체질을 고려한 한약 다이어트와 식이 상담',
    longDesc:
      '단순 체중 감량이 아닌 체질·식습관·대사 패턴을 파악해 요요를 막는 한약 다이어트 + 매선 체형 케어를 제공합니다.',
    icon: '🥗',
  },
  {
    slug: 'accident',
    name: '교통사고',
    nameEn: 'Auto Accident',
    shortDesc: '자동차보험 적용 추나·약침 후유증 치료',
    longDesc:
      '교통사고 후 일반 검사로는 잘 잡히지 않는 근막·연부조직 손상을 추나·약침·한약으로 케어합니다. 자동차보험 적용.',
    icon: '🚗',
  },
  {
    slug: 'pediatric',
    name: '소아·성장',
    nameEn: 'Pediatric & Growth',
    shortDesc: '소아 비염·키성장·성장추나·수험생 보약',
    longDesc:
      '아이의 비염·체질·수면·성장판을 함께 보고 한약과 성장추나를 병행합니다. 어머님·아버님과 충분히 상담합니다.',
    icon: '👶',
  },
  {
    slug: 'beauty',
    name: '피부미용',
    nameEn: 'Facial & Body',
    shortDesc: '8자매선·코미용 매선·V라인 매선요법',
    longDesc:
      '한방 매선(녹는 실 시술)으로 팔자주름·코 라인·V라인·팔뚝 라인을 자연스럽게 정리합니다.',
    icon: '✨',
  },
  {
    slug: 'constitution',
    name: '체질개선',
    nameEn: 'Constitution & Herbal',
    shortDesc: '한약·보약·체질 진단으로 몸의 균형 회복',
    longDesc:
      '불면·이명·구안와사·만성피로·갱년기·산전산후·수험생 보약·녹용·공진단까지. 체질을 보고 균형을 회복하는 한약 처방을 합니다.',
    icon: '🌿',
  },
] as const;

// AI 크롤러 - 차단하지 않음 (GEO/AEO 전략)
// 2026년 현재 차단하면 AI 인용 기회 상실
export const ALLOWED_AI_CRAWLERS = [
  'GPTBot', // OpenAI
  'ChatGPT-User', // ChatGPT 실시간
  'OAI-SearchBot', // SearchGPT
  'ClaudeBot', // Anthropic
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot', // Perplexity
  'Perplexity-User',
  'Google-Extended', // Gemini/Bard
  'GoogleOther',
  'Applebot-Extended', // Apple Intelligence
  'Bytespider', // ByteDance
  'cohere-ai', // Cohere
  'Diffbot',
  'FacebookBot',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'Amazonbot',
  'Bingbot', // Bing (Copilot 파워링)
  'Yeti', // Naver
  'Daum', // Daum
  'DuckAssistBot', // DuckDuckGo AI
] as const;
