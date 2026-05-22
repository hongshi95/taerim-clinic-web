// 시그니처 시술 상세 - /treatments/[slug] 페이지 데이터
// 의료법 준수: '무엇인지·적용·진행 방식'은 사실대로, 효과는 신중한 톤(단정·과장 X).
//             효과 근거가 검증된 시술(충격파·추나)은 관련 글(citations 포함)로 연결.
// 글쓰기 규칙: em dash 금지 (쉼표·하이픈·가운뎃점 사용).

export interface TreatmentGalleryItem {
  src: string;
  alt: string;
}
export interface TreatmentFaq {
  q: string;
  a: string;
}
export interface TreatmentRelated {
  label: string;
  href: string;
}
export interface TreatmentDetail {
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  heroImage: string;
  heroImageAlt: string;
  intro: string;
  whatIsIt: string[];
  indications: string[];
  process: string[];
  benefit: string[];
  gallery: TreatmentGalleryItem[];
  faqs: TreatmentFaq[];
  related: TreatmentRelated[];
  note?: string;
}

export const TREATMENT_DETAILS: TreatmentDetail[] = [
  // 01. 충격파
  {
    slug: 'shockwave',
    name: '충격파',
    nameEn: 'Shockwave',
    tagline: 'Ultra Dual로 만성 통증의 정체기에 접근하는 비침습 치료',
    heroImage: '/images/clinic/shockwave-treatment.webp',
    heroImageAlt: 'Ultra Dual 충격파 시술 (Radial 프로브, 팔 부위)',
    intro:
      '충격파 치료는 몸 밖에서 발생시킨 파동을 통증 부위에 전달해, 약물이나 절개 없이 만성 근막 통증과 석회화건염 등에 적용하는 비침습 치료입니다. 태림한의원은 Ultra Dual을 도입해 Radial(방사형)과 Focused(집중형) 두 모드를 함께 씁니다.',
    whatIsIt: [
      '충격파(Shockwave)는 체외에서 만든 음향 에너지 파동을 피부를 통해 통증 부위로 전달하는 치료입니다. 바늘이나 절개가 없는 비침습 방식이라, 주사나 약물이 부담스러운 분께도 적용할 수 있습니다.',
      'Radial(방사형)은 넓은 범위의 근막과 표층 통증에, Focused(집중형)는 더 깊은 지점에 에너지를 모아 전달합니다. 태림한의원은 두 모드를 모두 갖춘 Ultra Dual을 도입해, 부위와 깊이에 맞춰 조합합니다.',
    ],
    indications: [
      '오래된 어깨, 팔꿈치, 발바닥 등의 만성 근막 통증',
      '석회화건염처럼 한 곳에 통증이 반복되는 경우',
      '침, 약침, 물리치료를 받아도 회복이 더디게 느껴지는 정체기',
      '주사나 절개 없이 통증 부위를 자극하고 싶은 경우',
    ],
    process: [
      '통증 부위와 원인을 진찰하고, 충격파가 적합한지 먼저 확인합니다.',
      '부위와 깊이에 맞춰 Radial 또는 Focused 모드와 강도를 정합니다.',
      '프로브를 통증 지점에 대고 정해진 횟수만큼 파동을 전달합니다. 한 부위는 보통 수 분이면 끝납니다.',
      '반응을 보며 횟수와 간격을 조절합니다. 대개 여러 회에 걸쳐 진행합니다.',
    ],
    benefit: [
      '충격파는 만성 건, 근막 통증 영역에서 국내외 임상 연구가 비교적 많이 보고된 치료입니다. 다만 반응과 필요한 횟수는 환자분의 상태에 따라 다를 수 있습니다.',
      '약물, 주사, 절개 없이 외래에서 짧은 시간에 받을 수 있다는 점이 장점으로 꼽힙니다.',
    ],
    gallery: [
      { src: '/images/clinic/shockwave-treatment.webp', alt: 'Ultra Dual 충격파 시술 장면 (Radial 프로브)' },
      { src: '/images/clinic/shockwave-focused.webp', alt: 'Focused(집중형) 충격파 프로브' },
      { src: '/images/clinic/shockwave-machine.webp', alt: 'Ultra Dual 충격파 치료기 (Radial + Focused 듀얼 모드)' },
    ],
    faqs: [
      { q: '아픈가요?', a: '파동을 전달할 때 뻐근하거나 따끔한 느낌이 들 수 있습니다. 강도는 환자분이 견딜 수 있는 범위에서 조절합니다.' },
      { q: '몇 번 받아야 하나요?', a: '상태에 따라 다릅니다. 보통 일정 간격으로 여러 회 진행하며, 반응을 보며 정합니다.' },
      { q: '보험이 되나요?', a: '항목과 상황에 따라 적용이 다릅니다. 비용과 적용 여부는 진료 시 안내드립니다.' },
    ],
    related: [
      { label: '충격파 Ultra Dual 자세히 보기', href: '/pain/shockwave-ultra-dual-radial-focused/' },
      { label: '통증치료 전체 글', href: '/pain/' },
    ],
    note: '석회화 정도, 골절, 종양 부위 등 충격파가 적합하지 않은 경우가 있어 진료 후 적용 여부를 판단합니다.',
  },

  // 02. 골타요법
  {
    slug: 'golta',
    name: '골타요법',
    nameEn: 'Golta',
    tagline: '고무망치형 타진기로 척추 정렬과 관절 가동범위를 회복',
    heroImage: '/images/clinic/golta-tapping.webp',
    heroImageAlt: '서조혁 원장의 골타요법 시술',
    intro:
      '골타요법은 고무망치 형태의 타진기로 뼈와 근육에 일정한 자극을 반복해 전달하는 한방 수기 치료입니다. 손으로 세게 누르거나 꺾는 대신, 일정한 두드림으로 자극을 줍니다.',
    whatIsIt: [
      '골타요법은 타진기로 부위에 맞는 강도와 리듬의 자극을 전달해, 뭉친 부위를 풀고 척추 정렬과 관절 가동범위를 회복하는 데 활용하는 치료입니다.',
      '서조혁 원장은 본인이 직접 골타를 받아본 경험에서 시작해, 척추신경추나의학회 등에서 익힌 기법을 진료에 적용하고 있습니다.',
    ],
    indications: [
      '허리, 목, 어깨, 골반의 뻐근한 통증과 굳은 느낌',
      '자세 불균형으로 한쪽이 자주 결리는 경우',
      '강한 손기법이 부담스러워 부드러운 자극부터 시작하고 싶은 경우',
    ],
    process: [
      '통증 부위와 자세, 관절 가동범위를 먼저 살핍니다.',
      '타진기로 부위에 맞는 강도와 리듬으로 자극을 전달합니다.',
      '환자분의 반응을 보며 강도를 차근차근 조절합니다.',
    ],
    benefit: [
      '일정한 자극으로 뭉친 부위를 풀고 관절 가동범위를 회복하는 데 활용합니다. 반응과 경과는 환자분마다 다를 수 있습니다.',
      '강도를 세밀하게 조절할 수 있어, 자극에 민감한 분께도 단계적으로 적용하기 좋습니다.',
    ],
    gallery: [
      { src: '/images/clinic/golta-tapping.webp', alt: '고무망치형 타진기로 등, 허리를 자극하는 골타요법' },
      { src: '/images/clinic/golta-therapy.webp', alt: '골타요법에 쓰는 타진기 도구' },
      { src: '/images/clinic/golta-treatment-hd.webp', alt: '서조혁 원장의 골타요법 진료 장면' },
    ],
    faqs: [
      { q: '많이 아픈가요?', a: '두드리는 자극이 있지만 강도를 조절합니다. 처음에는 약하게 시작해 반응을 보며 맞춰갑니다.' },
      { q: '추나요법과 무엇이 다른가요?', a: '추나는 손기법으로 밀고 당겨 교정하고, 골타는 타진기의 일정한 두드림으로 자극합니다. 상태에 따라 함께 쓰기도 합니다.' },
    ],
    related: [{ label: '통증치료 전체 글', href: '/pain/' }],
  },

  // 03. 추나요법
  {
    slug: 'chuna',
    name: '추나요법',
    nameEn: 'Chuna',
    tagline: '손기법으로 척추와 관절을 바로잡는, 건강보험 적용 한방 표준 치료',
    heroImage: '/images/clinic/chuna-hd.webp',
    heroImageAlt: '서조혁 원장의 추나 치료 (척추 정렬 시술)',
    intro:
      '추나요법은 한의사가 손과 신체를 이용해 척추, 관절, 근육을 밀고(推) 당겨(拿) 바로잡는 한방 수기 치료입니다. 2019년부터 건강보험이 적용되기 시작한 한방 표준 치료입니다.',
    whatIsIt: [
      '추나요법은 어긋난 정렬이나 굳은 관절, 뭉친 근육을 손기법으로 조정하는 치료입니다. 환자분의 상태에 따라 부드러운 기법부터 단계적으로 적용합니다.',
      '2019년부터 디스크, 협착증 등 일정 기준에서 건강보험이 적용됩니다. 적용 여부와 본인부담은 상태와 기준에 따라 다릅니다.',
    ],
    indications: [
      '허리, 목 디스크와 관련된 통증',
      '척추, 골반의 좌우 불균형과 거북목',
      '교통사고 후 잘 잡히지 않는 근막, 연부조직 불편감',
      '오래 앉아 일하며 굳은 자세에서 오는 통증',
    ],
    process: [
      '통증과 자세, 정렬 상태를 진찰합니다. 다른 병원 검사 결과지를 가져오셔도 좋습니다.',
      '환자분의 체질과 민감도를 고려해 기법과 강도를 정합니다.',
      '손기법으로 척추, 관절, 근육을 단계적으로 조정합니다.',
      '집에서 할 수 있는 자세, 생활 관리까지 안내합니다.',
    ],
    benefit: [
      '추나요법은 요통 등 근골격계 영역에서 국내 임상 연구가 보고되어 있고, 2019년부터 건강보험이 적용됩니다. 효과와 횟수는 상태에 따라 다를 수 있습니다.',
      '약물이나 수술 전에 보존적으로 접근하고 싶은 분께 적용하는 한방 표준 치료입니다.',
    ],
    gallery: [
      { src: '/images/clinic/chuna-hd.webp', alt: '서조혁 원장의 추나 치료 (척추 정렬)' },
      { src: '/images/clinic/neck-treatment.webp', alt: '목 부위 추나 치료 장면' },
      { src: '/images/clinic/pediatric-chuna.webp', alt: '소아 성장 추나 치료 장면' },
    ],
    faqs: [
      { q: '건강보험이 되나요?', a: '디스크, 협착증 등 일정 기준에서 적용됩니다. 본인부담률과 적용 여부는 상태에 따라 다르며 진료 시 안내드립니다.' },
      { q: '아픈가요?', a: '교정 시 뻐근함이 있을 수 있으나, 체질과 민감도를 고려해 강도를 조절합니다.' },
      { q: '몇 번 받아야 하나요?', a: '증상과 경과에 따라 다릅니다. 진료를 통해 함께 정합니다.' },
    ],
    related: [
      { label: '추나요법 보험 적용 비용', href: '/pain/chuna-therapy-insurance-cost-2026/' },
      { label: '척추관협착증, 다리 저림', href: '/pain/spinal-stenosis-leg-numbness/' },
    ],
  },

  // 04. 약침
  {
    slug: 'pharmacopuncture',
    name: '약침',
    nameEn: 'Pharmacopuncture',
    tagline: '한약 성분을 정제해 경혈에 직접 주입하는 치료',
    heroImage: '/images/clinic/pharmacopuncture.png',
    heroImageAlt: '약침에 사용하는 봉독 정제 약품 (분리정제봉독 B4-eBV)',
    intro:
      '약침은 한약 성분을 정제해 경혈에 직접 주입하는 치료입니다. 침의 경혈 자극과 한약 성분을 함께 활용하며, 봉독, PDRN, 황련 등 환자분의 체질과 증상에 맞춰 사용합니다.',
    whatIsIt: [
      '약침은 정제한 한약 성분을 가는 주사로 경혈에 주입하는 치료입니다. 경혈을 자극하는 침의 원리에, 부위에 작용하는 한약 성분을 더한 방식입니다.',
      '봉독, PDRN, 황련 등 여러 약침을 환자분의 체질과 증상, 부위에 맞춰 선택합니다.',
    ],
    indications: [
      '근막, 관절 주변의 국소 통증과 염증 반응',
      '침 치료에 한약 성분을 더해 접근하고 싶은 경우',
      '체질과 증상에 맞춘 부위별 케어가 필요한 경우',
    ],
    process: [
      '통증 부위와 체질, 증상을 진찰합니다.',
      '봉독 등은 알레르기 반응 가능성을 먼저 확인합니다.',
      '체질과 증상에 맞는 약침을 선택해 경혈에 주입합니다.',
    ],
    benefit: [
      '경혈 자극과 한약 성분을 함께 활용하는 치료입니다. 반응과 경과는 환자분마다 다를 수 있습니다.',
      '체질적으로 민감한 분께는 자극이 강한 약침보다 부드러운 접근부터 시작합니다.',
    ],
    gallery: [
      { src: '/images/clinic/pharmacopuncture.png', alt: '약침에 사용하는 분리정제봉독 B4-eBV' },
    ],
    faqs: [
      { q: '봉독은 안전한가요?', a: '봉독은 알레르기 반응이 있을 수 있어, 사용 전 반응을 확인하며 신중히 진행합니다.' },
      { q: '침과 무엇이 다른가요?', a: '침은 경혈을 자극하고, 약침은 거기에 정제한 한약 성분을 더해 주입한다는 점이 다릅니다.' },
    ],
    related: [{ label: '통증치료 전체 글', href: '/pain/' }],
    note: '봉독 등 일부 약침은 알레르기 반응을 확인한 뒤 사용하며, 적합 여부는 진료를 통해 판단합니다.',
  },

  // 05. 매선요법
  {
    slug: 'maesun',
    name: '매선요법',
    nameEn: 'Melting Thread',
    tagline: '녹는 실을 경혈에 넣어 자연 흡수되며 작용하는 한방 미용, 체형 시술',
    heroImage: '/images/clinic/maesun-threads.webp',
    heroImageAlt: '매선요법에 사용하는 JAMBER 매선실 (녹는 실)',
    intro:
      '매선요법은 녹는 실(매선)을 경혈이나 부위에 자입하는 한방 시술입니다. 시간이 지나며 실이 자연 흡수되고, 그 과정에서 부위에 작용합니다. V라인, 8자 매선, 코 라인, 팔뚝 라인 등에 적용합니다.',
    whatIsIt: [
      '매선요법은 인체에 흡수되는 의료용 실(매선)을 가는 침을 이용해 부위에 넣는 시술입니다. 실은 시간이 지나며 자연 흡수됩니다.',
      '얼굴 라인, 체형 라인 등 목적에 따라 실의 종류와 자입 부위를 설계합니다.',
    ],
    indications: [
      '팔자주름, 코 라인 등 얼굴 라인 케어',
      'V라인, 8자 매선 등 윤곽 케어',
      '팔뚝 라인 등 체형 케어',
    ],
    process: [
      '원하시는 부위와 상태를 상담합니다.',
      '목적에 맞춰 실의 종류와 자입 라인을 설계합니다.',
      '가는 침으로 매선을 자입하고, 시술 후 관리법을 안내합니다.',
    ],
    benefit: [
      '녹는 실이 자연 흡수되며 부위에 작용합니다. 효과의 정도와 지속 기간은 개인차가 있습니다.',
      '체질과 부위를 고려해 무리하지 않는 범위에서 설계합니다.',
    ],
    gallery: [
      { src: '/images/clinic/maesun-threads.webp', alt: '매선요법에 사용하는 JAMBER 매선실 (녹는 실)' },
    ],
    faqs: [
      { q: '시술 후 붓나요?', a: '부위와 개인차에 따라 붓기나 멍이 있을 수 있습니다. 시술 후 관리법을 안내드립니다.' },
      { q: '효과는 얼마나 가나요?', a: '실의 흡수 기간과 개인차에 따라 다릅니다. 무리한 지속 효과를 단정하지 않습니다.' },
    ],
    related: [
      { label: '팔자주름 매선 케어', href: '/beauty/nasolabial-fold-melting-thread/' },
      { label: '매선 시술 후 관리', href: '/beauty/melting-thread-aftercare/' },
    ],
    note: '시술 후 붓기, 멍 등이 있을 수 있으며, 부위와 체질에 따라 적용을 판단합니다.',
  },

  // 06. 한약, 보약
  {
    slug: 'herbal',
    name: '한약·보약',
    nameEn: 'Herbal Medicine',
    tagline: '체질과 증상, 생활을 함께 보고 원내에서 직접 달이는 맞춤 한약',
    heroImage: '/images/clinic/herbal-preparation.png',
    heroImageAlt: '태림한의원 원내 탕전 - 직접 달이는 체질별 맞춤 한약',
    intro:
      '한약은 체질과 증상, 생활 습관을 함께 보고 처방합니다. 태림한의원은 원내 탕전실에서 GMP 인증 한약재를 검수하고, 정성을 들여 직접 달입니다. 다이어트, 산전산후, 소아 성장, 갱년기, 보약까지 폭넓게 다룹니다.',
    whatIsIt: [
      '같은 증상이라도 체질에 따라 나타나는 양상과 반응이 다릅니다. 그래서 한약은 진찰을 통해 환자분의 체질과 상태를 파악한 뒤 처방합니다.',
      '태림한의원은 원내 탕전실에서 한약재를 일일이 검수하고 좋은 물을 사용해 직접 달입니다.',
    ],
    indications: [
      '한약 다이어트, 산전, 산후 회복',
      '소아 성장, 비염, 식욕부진',
      '갱년기, 만성피로, 불면',
      '수험생 보약, 녹용, 공진단',
    ],
    process: [
      '진찰을 통해 체질과 증상, 생활 습관을 파악합니다.',
      '환자분께 맞는 처방을 설계하고 이해할 수 있게 설명합니다.',
      '원내 탕전실에서 검수한 한약재로 직접 달입니다.',
      '복용 방법과 생활 관리까지 안내합니다.',
    ],
    benefit: [
      '체질과 증상에 맞춰 처방합니다. 같은 증상이라도 체질에 따라 처방이 달라집니다.',
      '원내 탕전으로 한약재 검수부터 달이는 과정까지 직접 관리합니다.',
    ],
    gallery: [
      { src: '/images/clinic/herbal-preparation.png', alt: '태림한의원 한약 제조 모습' },
      { src: '/images/clinic/place-02.png', alt: '가운을 입은 원장이 한약을 달이는 원내 탕전 시설' },
    ],
    faqs: [
      { q: '체질을 어떻게 보나요?', a: '진찰과 문진을 통해 체질과 증상, 생활 습관을 함께 살펴 처방에 반영합니다.' },
      { q: '다이어트 한약은 요요가 오지 않나요?', a: '단순 체중 감량이 아니라 체질과 식습관, 대사 패턴을 함께 봅니다. 경과는 개인차가 있습니다.' },
    ],
    related: [
      { label: '체질개선 전체 글', href: '/constitution/' },
      { label: '한약 다이어트, 요요 예방', href: '/diet/herbal-diet-yoyo-prevention/' },
    ],
  },
];

export function getTreatment(slug: string): TreatmentDetail | undefined {
  return TREATMENT_DETAILS.find((t) => t.slug === slug);
}

export function getAdjacentTreatments(slug: string): {
  prev: TreatmentDetail | null;
  next: TreatmentDetail | null;
} {
  const idx = TREATMENT_DETAILS.findIndex((t) => t.slug === slug);
  return {
    prev: idx > 0 ? TREATMENT_DETAILS[idx - 1] : null,
    next: idx >= 0 && idx < TREATMENT_DETAILS.length - 1 ? TREATMENT_DETAILS[idx + 1] : null,
  };
}
