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
    '대구 달서구 대천동(진천역) 태림한의원. 추나·약침·한약·매선·근건이완수기요법으로 통증치료, 다이어트, 교통사고, 소아성장, 피부미용, 체질개선 진료. 대구한의원, 달서구한의원, 진천역한의원, 대천동한의원.',
  locale: 'ko-KR',
  defaultOgImage: '/og-image.jpg', // 1200x630 JPG (카카오톡은 webp OG 미렌더 → JPG 고정). 재생성: node scripts/make-og-image.mjs
} as const;

export const SITE_VERIFICATIONS = {
  google: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
  naver: import.meta.env.PUBLIC_NAVER_VERIFICATION ?? '1e3a74581bd545f1862dc4b93faaed80bdddcce1', // 공개용 인증 토큰. CI 빌드에 env 없어도 prod에 반드시 노출되도록 기본값 고정
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
  // NAP 통일 결정(2026-06-11): 모든 채널(사이트·스키마·디렉터리·심평원)에 대표번호 사용.
  // 스마트콜(0507-1319-5379 홈페이지 채널 등)은 네이버 플레이스 전용 - 사이트에 쓰지 말 것.
  phone: '053-633-5379',
  address: {
    streetAddress: '진천로 93 애플플라자 3층',
    addressLocality: '대구광역시 달서구',
    addressRegion: '대구광역시',
    addressCountry: 'KR',
    postalCode: '',
  },
  geo: {
    latitude: 35.8166384, // 네이버 플레이스(1221424403) 기준 정밀 좌표
    longitude: 128.5224521,
  },
  openingHours: [
    // 네이버 플레이스(1221424403) 기준. 점심 13:00-14:00, 일요일 휴진, 공휴일 진료.
    'Mo,We 09:00-13:00',
    'Mo,We 14:00-20:00',
    'Tu,Th,Fr 09:00-13:00',
    'Tu,Th,Fr 14:00-18:30',
    'Sa 09:00-14:00',
    'PH 09:00-14:00',
  ],
  closedDays: ['Su'], // 공휴일은 09:00-14:00 진료 (네이버 플레이스 기준)
  // 외부 채널 (CTA + sameAs용)
  // 플레이스(예약/소개) vs 지도(위치/길찾기) URL 분리
  naverPlaceUrl: 'https://m.place.naver.com/hospital/1221424403', // 예약·소개 (Place ID 1221424403)
  naverMapUrl: 'https://map.naver.com/p/entry/place/1221424403', // 지도·길찾기 (지도 + 마커 + 길찾기 버튼)
  googleMapsUrl: 'https://maps.google.com/?cid=6334016964225006563', // Google Maps 비즈니스 listing (CID 6334016964225006563)
  googleMapsCid: '6334016964225006563', // 16진수 0x57e6f2deb1edfbe3
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
  // 뾰족한 한 줄 포지셔닝 (GEO/AEO: AI가 인용할 핵심 사실. 도보 6분/399m = 네이버 스마트플레이스 실측)
  description:
    '대구 달서구 진천역 4번 출구 도보 6분(399m), 추나·약침 통증치료와 교통사고 후유증(자동차보험) 중심 한의원. 월·수 야간 20시 진료.',
  hasMap: 'https://map.naver.com/p/entry/place/1221424403',
  logo: {
    '@type': 'ImageObject',
    url: `${SITE.url}/favicon.svg`,
    width: 128,
    height: 128,
  },
  image: `${SITE.url}/images/clinic/clinic-building.webp`,
  // 외부 식별자 (AEO/GEO: 검색 엔진이 같은 비즈니스로 인식)
  identifier: [
    {
      '@type': 'PropertyValue',
      propertyID: 'NaverPlaceID',
      value: '1221424403',
    },
    {
      '@type': 'PropertyValue',
      propertyID: 'GoogleMapsCID',
      value: '6334016964225006563',
    },
  ],
  medicalSpecialty: [
    'TraditionalChinese',
    'PhysicalMedicineAndRehabilitation',
    'Pediatric',
  ],
  // 시술별 medicalProcedure 6종 (Google 의료 검색이 시술명으로 매칭)
  availableService: [
    {
      '@type': 'MedicalProcedure',
      name: '근건이완수기요법 (Shockwave)',
      procedureType: 'https://schema.org/TherapeuticProcedure',
      bodyLocation: '근막·관절·건',
      description: '체외충격파를 이용한 비침습 근건이완 물리요법 (표면·심부 자극)',
    },
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
    // 기본 진료 (한방 표준)
    {
      '@type': 'MedicalProcedure',
      name: '침치료',
      procedureType: 'https://schema.org/PercutaneousProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: '전침치료',
      procedureType: 'https://schema.org/PercutaneousProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: '부항',
      procedureType: 'https://schema.org/TherapeuticProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: '사혈부항',
      procedureType: 'https://schema.org/TherapeuticProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: '물리치료',
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
    // 네이버 플레이스(1221424403) 기준. 점심 13:00-14:00은 오전/오후 구간 분리로 표현.
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday'], opens: '09:00', closes: '13:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday'], opens: '14:00', closes: '20:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Thursday', 'Friday'], opens: '09:00', closes: '13:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Thursday', 'Friday'], opens: '14:00', closes: '18:30' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '09:00', closes: '14:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/PublicHolidays', opens: '09:00', closes: '14:00' },
  ],
  sameAs: [
    CLINIC.naverPlaceUrl,
    CLINIC.googleMapsUrl,
    CLINIC.kakaoChannelUrl,
    CLINIC.instagramUrl,
    CLINIC.threadsUrl,
    CLINIC.youtubeUrl,
    CLINIC.blogUrl,
  ].filter(Boolean),
  // 지역 SEO: 진료 서비스 지역 명시 (대구 달서구 + 대천동·월배·진천역 하이퍼로컬)
  areaServed: [
    { '@type': 'City', name: '대구광역시' },
    { '@type': 'AdministrativeArea', name: '대구광역시 달서구' },
    '대천동', '월배', '진천역', '상인동', '도원동', '유천동', '본동',
  ],
} as const;

// 진료과목 6축 (전문성 강화: 이모지 대신 카테고리 번호 + 영문 부제)
export const TREATMENTS = [
  {
    slug: 'pain',
    name: '통증치료',
    nameEn: 'Pain Treatment',
    shortDesc: '허리·목·어깨·무릎 통증을 추나·골타·약침으로',
    longDesc:
      '척추 정렬과 근막 균형을 회복하는 추나·골타·약침·매선·한약, 그리고 신규 도입한 체외충격파를 이용한 근건이완수기요법을 환자 단계에 맞춰 조합합니다.',
  },
  {
    slug: 'diet',
    name: '다이어트',
    nameEn: 'Diet & Weight',
    shortDesc: '체질을 고려한 한약 다이어트와 식이 상담',
    longDesc:
      '단순 체중 감량이 아닌 체질·식습관·대사 패턴을 파악해 요요를 막는 한약 다이어트 + 매선 체형 케어를 제공합니다.',
  },
  {
    slug: 'accident',
    name: '교통사고',
    nameEn: 'Auto Accident',
    shortDesc: '자동차보험 적용 추나·약침 후유증 치료',
    longDesc:
      '교통사고 후 일반 검사로는 잘 잡히지 않는 근막·연부조직 손상을 추나·약침·한약으로 케어합니다. 자동차보험 적용.',
  },
  {
    slug: 'pediatric',
    name: '소아·성장',
    nameEn: 'Pediatric & Growth',
    shortDesc: '소아 비염·키성장·성장추나·수험생 보약',
    longDesc:
      '아이의 비염·체질·수면·성장판을 함께 보고 한약과 성장추나를 병행합니다. 어머님·아버님과 충분히 상담합니다.',
  },
  {
    slug: 'beauty',
    name: '피부미용',
    nameEn: 'Facial & Body',
    shortDesc: '8자매선·코미용 매선·V라인 매선요법',
    longDesc:
      '한방 매선(녹는 실 시술)으로 팔자주름·코 라인·V라인·팔뚝 라인을 자연스럽게 정리합니다.',
  },
  {
    slug: 'constitution',
    name: '체질개선',
    nameEn: 'Constitution & Herbal',
    shortDesc: '한약·보약·체질 진단으로 몸의 균형 회복',
    longDesc:
      '불면·이명·구안와사·만성피로·갱년기·산전산후·수험생 보약·녹용·공진단까지. 체질을 보고 균형을 회복하는 한약 처방을 합니다.',
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
