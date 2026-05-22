// 시그니처 시술 상세 - /treatments/[slug] 페이지 데이터
// 톤: 진짜 환자 입장. 장비 모델명·기술 용어(Ultra Dual/Radial/집중형/Piezo 등)는 본문에 넣지 않는다.
//     "내 통증이 나을까, 아픈가, 안전한가, 어떻게 받나"에 답한다.
// 의료법 준수: 효과는 신중한 톤(단정·과장 X), 검증 안 된 효과 논문은 인용하지 않는다.
//             기술적 깊이를 원하는 분은 related 글(deep-dive)로 연결.
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
    tagline: '침, 약침으로도 마지막 한 고비가 안 풀릴 때',
    heroImage: '/images/clinic/shockwave-treatment.webp',
    heroImageAlt: '충격파 시술을 받는 모습 (팔 부위)',
    intro:
      '오래된 어깨, 팔꿈치, 발바닥 통증이 침이나 약침을 받아도 마지막에 잘 안 풀릴 때가 있습니다. 충격파는 아픈 곳에 파동을 전달해, 멈춰 있던 회복을 다시 깨우는 치료입니다. 바늘도, 주사도, 절개도 없이 받습니다.',
    whatIsIt: [
      '충격파는 몸 밖에서 만든 진동(파동)을 아픈 부위로 보내는 치료입니다. 굳어서 회복이 멈춘 조직에 자극을 줘서, 몸이 스스로 다시 회복하도록 돕습니다.',
      '바늘이 들어가지 않아 침이나 주사가 부담스러운 분도 받을 수 있습니다. 통증이 표면에 있는지 더 깊은 곳에 있는지에 따라 자극 방식과 강도를 조절하며, 태림한의원은 표면과 깊은 통증을 모두 다룰 수 있는 장비를 갖추고 있습니다.',
    ],
    indications: [
      '어깨, 팔꿈치, 발바닥처럼 오래된 통증이 잘 안 낫는 곳',
      '한곳이 반복해서 아픈 석회화건염',
      '침, 약침을 받아도 회복이 더디게 느껴질 때',
      '주사나 시술이 부담스러워 바늘 없는 치료를 원할 때',
    ],
    process: [
      '어디가 언제부터 아픈지 충분히 듣고, 충격파가 맞는 상태인지 먼저 봅니다.',
      '통증 부위와 깊이에 맞춰 자극 방식과 강도를 정합니다. 처음에는 약하게 시작합니다.',
      '아픈 지점에 기구를 대고 파동을 전달합니다. 한 부위는 보통 몇 분이면 끝납니다.',
      '받으신 느낌을 보며 강도와 횟수를 조절합니다. 대개 여러 번에 걸쳐 진행합니다.',
    ],
    benefit: [
      '바늘, 주사, 약 없이 짧은 시간에 받을 수 있어, 다른 치료가 부담스러운 분께도 권하기 좋습니다.',
      '오래된 근육, 힘줄 통증에 도움이 된다고 여러 연구에서 보고되어 있습니다. 다만 효과와 필요한 횟수는 환자분의 상태에 따라 다릅니다.',
    ],
    gallery: [
      { src: '/images/clinic/shockwave-treatment.webp', alt: '충격파 시술을 받는 모습 (팔 부위)' },
      { src: '/images/clinic/shockwave-focused.webp', alt: '깊은 부위에 쓰는 충격파 기구' },
      { src: '/images/clinic/shockwave-machine.webp', alt: '태림한의원 충격파 치료 장비' },
    ],
    faqs: [
      { q: '많이 아픈가요?', a: '파동을 전달할 때 뻐근하거나 따끔할 수 있습니다. 처음에는 약하게 시작해서, 견딜 수 있는 만큼만 올립니다.' },
      { q: '몇 번 받아야 하나요?', a: '상태에 따라 다릅니다. 보통 여러 번에 나눠 받으며, 받으시는 동안 반응을 보고 함께 정합니다.' },
      { q: '보험이 되나요?', a: '항목과 상황에 따라 다릅니다. 비용은 진료 때 미리 안내드리고, 무리하게 권하지 않습니다.' },
    ],
    related: [
      { label: '충격파가 더 궁금하다면 (자세한 설명)', href: '/pain/shockwave-ultra-dual-radial-focused/' },
      { label: '통증치료 전체 글', href: '/pain/' },
    ],
    note: '석회 정도, 골절, 종양이 있는 부위 등 충격파가 맞지 않는 경우가 있어, 받기 전 진료로 확인합니다.',
  },

  // 02. 골타요법
  {
    slug: 'golta',
    name: '골타요법',
    nameEn: 'Golta',
    tagline: '콕콕 두드려 굳은 곳을 풀어주는 치료',
    heroImage: '/images/clinic/golta-tapping.webp',
    heroImageAlt: '서조혁 원장이 골타요법으로 등, 허리를 두드리는 모습',
    intro:
      '강하게 누르거나 꺾는 치료가 부담스러운 분이 있습니다. 골타요법은 작은 망치 모양 기구로 아픈 부위를 일정하게 두드려, 굳은 근육과 관절을 부드럽게 풀어주는 치료입니다.',
    whatIsIt: [
      '골타요법은 고무망치 같은 기구로 뼈와 근육 주변을 규칙적으로 두드리는 한방 치료입니다. 손으로 세게 밀거나 꺾는 대신, 가벼운 두드림으로 자극을 줍니다.',
      '서조혁 원장이 직접 받아보고 효과를 느껴 진료에 들인 치료입니다. 강도를 세밀하게 조절할 수 있어, 자극에 예민한 분도 약하게 시작할 수 있습니다.',
    ],
    indications: [
      '허리, 목, 어깨, 골반이 뻐근하고 굳은 느낌',
      '자세가 한쪽으로 틀어져 자주 결리는 경우',
      '강한 손기법이 부담스러워 부드러운 치료부터 원할 때',
    ],
    process: [
      '아픈 곳과 자세, 굳은 정도를 먼저 살핍니다.',
      '부위에 맞는 강도와 리듬으로 두드려 자극합니다.',
      '받으신 느낌을 보며 강도를 차근차근 맞춰갑니다.',
    ],
    benefit: [
      '두드리는 자극으로 뭉친 곳을 풀고 굳은 관절을 부드럽게 하는 데 활용합니다. 느낌과 경과는 사람마다 다릅니다.',
      '강도를 세밀하게 조절할 수 있어, 예민한 분도 무리 없이 시작할 수 있습니다.',
    ],
    gallery: [
      { src: '/images/clinic/golta-tapping.webp', alt: '망치 모양 기구로 등, 허리를 두드리는 골타요법' },
      { src: '/images/clinic/golta-therapy.webp', alt: '골타요법에 쓰는 기구' },
      { src: '/images/clinic/golta-treatment-hd.webp', alt: '서조혁 원장의 골타요법 진료 모습' },
    ],
    faqs: [
      { q: '많이 아픈가요?', a: '두드리는 자극이 있지만 강도를 조절합니다. 처음에는 약하게 시작해 받으시는 느낌을 보며 맞춰갑니다.' },
      { q: '추나요법과 무엇이 다른가요?', a: '추나는 손으로 밀고 당겨 바로잡고, 골타는 기구로 가볍게 두드려 자극합니다. 상태에 따라 함께 쓰기도 합니다.' },
    ],
    related: [{ label: '통증치료 전체 글', href: '/pain/' }],
  },

  // 03. 추나요법
  {
    slug: 'chuna',
    name: '추나요법',
    nameEn: 'Chuna',
    tagline: '약이나 수술 전에, 손으로 바로잡아 보는 치료',
    heroImage: '/images/clinic/chuna-hd.webp',
    heroImageAlt: '서조혁 원장이 추나로 척추를 바로잡는 모습',
    intro:
      '디스크나 오래된 자세 때문에 틀어진 곳을, 약이나 수술에 앞서 손으로 바로잡아 보는 치료입니다. 2019년부터 건강보험이 적용돼 비용 부담도 줄었습니다.',
    whatIsIt: [
      '추나요법은 한의사가 손으로 척추와 관절, 근육을 밀고 당겨 바로잡는 치료입니다. 환자분의 상태에 따라 부드러운 방법부터 차근차근 적용합니다.',
      '디스크, 협착증 등 정해진 기준에서는 건강보험이 적용됩니다. 적용 여부와 부담 금액은 상태에 따라 다릅니다.',
    ],
    indications: [
      '허리, 목 디스크로 인한 통증',
      '한쪽으로 틀어진 자세, 거북목',
      '교통사고 뒤 잘 잡히지 않는 뻐근함',
      '오래 앉아 일하며 굳은 통증',
    ],
    process: [
      '아픈 곳과 자세를 살핍니다. 다른 병원 검사 결과지를 가져오셔도 좋습니다.',
      '체질과 예민한 정도를 보고 방법과 강도를 정합니다.',
      '손으로 척추, 관절, 근육을 차근차근 바로잡습니다.',
      '집에서 할 수 있는 자세와 생활 관리까지 알려드립니다.',
    ],
    benefit: [
      '약이나 수술에 앞서 보존적으로 접근해보고 싶은 분께 권하는 치료이고, 건강보험도 적용됩니다.',
      '요통 등에 도움이 된다고 국내 연구에서 보고되어 있습니다. 효과와 횟수는 상태에 따라 다릅니다.',
    ],
    gallery: [
      { src: '/images/clinic/chuna-hd.webp', alt: '서조혁 원장이 척추를 바로잡는 추나 치료' },
      { src: '/images/clinic/neck-treatment.webp', alt: '목 부위를 보는 추나 치료' },
      { src: '/images/clinic/pediatric-chuna.webp', alt: '아이를 보는 성장 추나 치료' },
    ],
    faqs: [
      { q: '건강보험이 되나요?', a: '디스크, 협착증 등 정해진 기준에서 적용됩니다. 적용 여부와 부담 금액은 상태에 따라 다르며 진료 때 안내드립니다.' },
      { q: '아픈가요?', a: '바로잡을 때 뻐근할 수 있지만, 체질과 예민한 정도를 보고 강도를 조절합니다.' },
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
    tagline: '침에 한약의 힘을 더한 치료',
    heroImage: '/images/clinic/pharmacopuncture.png',
    heroImageAlt: '약침에 사용하는 정제 약품',
    intro:
      '약침은 한약 성분을 정제해, 아주 가는 침으로 아픈 부위(경혈)에 직접 넣는 치료입니다. 침의 자극에 한약의 효과를 더한 방식이라고 보시면 됩니다.',
    whatIsIt: [
      '한약에서 뽑아 정제한 성분을 경혈에 주입합니다. 침을 놓는 자리에 한약 성분이 더해지는 셈입니다.',
      '봉독, 황련 등 여러 종류가 있어, 환자분의 체질과 증상, 부위에 맞춰 고릅니다.',
    ],
    indications: [
      '근육, 관절 주변이 욱신거리고 염증이 있는 통증',
      '침 치료에 한약 효과를 더하고 싶을 때',
      '체질과 증상에 맞춘 부위별 관리가 필요할 때',
    ],
    process: [
      '아픈 곳과 체질, 증상을 살핍니다.',
      '봉독 같은 성분은 알레르기 반응이 있는지 먼저 확인합니다.',
      '맞는 약침을 골라 경혈에 주입합니다.',
    ],
    benefit: [
      '침의 자극과 한약 성분을 함께 쓰는 치료입니다. 느낌과 경과는 사람마다 다릅니다.',
      '체질적으로 예민한 분께는 자극이 약한 것부터 시작합니다.',
    ],
    gallery: [
      { src: '/images/clinic/pharmacopuncture.png', alt: '약침에 사용하는 정제 약품' },
    ],
    faqs: [
      { q: '봉독은 안전한가요?', a: '봉독은 알레르기 반응이 있을 수 있어, 쓰기 전에 반응을 확인하며 신중히 진행합니다.' },
      { q: '침과 무엇이 다른가요?', a: '침은 경혈을 자극하고, 약침은 거기에 정제한 한약 성분을 더해 넣는다는 점이 다릅니다.' },
    ],
    related: [{ label: '통증치료 전체 글', href: '/pain/' }],
    note: '봉독 등 일부 약침은 알레르기 반응을 확인한 뒤 사용하며, 맞는지는 진료로 판단합니다.',
  },

  // 05. 매선요법
  {
    slug: 'maesun',
    name: '매선요법',
    nameEn: 'Melting Thread',
    tagline: '녹는 실로 라인을 살리는 한방 미용 시술',
    heroImage: '/images/clinic/maesun-threads.webp',
    heroImageAlt: '매선요법에 사용하는 녹는 실',
    intro:
      '매선요법은 몸에 자연스럽게 녹아 흡수되는 실을 가는 침으로 넣는 시술입니다. 팔자주름, 코, V라인, 팔뚝 라인 등을 정리하는 데 씁니다.',
    whatIsIt: [
      '몸에 흡수되는 가는 실(매선)을 원하는 부위에 넣습니다. 실은 시간이 지나며 자연스럽게 녹아 사라집니다.',
      '얼굴 라인, 체형 라인 등 원하시는 부위에 맞춰 실의 종류와 넣는 방향을 설계합니다.',
    ],
    indications: [
      '팔자주름, 코 라인 등 얼굴 라인 정리',
      'V라인, 8자 매선 등 윤곽 정리',
      '팔뚝 라인 등 체형 정리',
    ],
    process: [
      '원하시는 부위와 상태를 상담합니다.',
      '목적에 맞춰 실의 종류와 넣는 라인을 설계합니다.',
      '가는 침으로 매선을 넣고, 시술 후 관리법을 알려드립니다.',
    ],
    benefit: [
      '넣은 실이 자연스럽게 녹으며 부위에 작용합니다. 효과 정도와 지속 기간은 사람마다 다릅니다.',
      '체질과 부위를 보고 무리하지 않는 선에서 진행합니다.',
    ],
    gallery: [
      { src: '/images/clinic/maesun-threads.webp', alt: '매선요법에 사용하는 녹는 실' },
    ],
    faqs: [
      { q: '시술 후 붓나요?', a: '부위와 사람에 따라 붓기나 멍이 있을 수 있습니다. 시술 후 관리법을 알려드립니다.' },
      { q: '효과는 얼마나 가나요?', a: '실이 녹는 기간과 사람에 따라 다릅니다. 무리한 지속 효과를 단정하지 않습니다.' },
    ],
    related: [
      { label: '팔자주름 매선 케어', href: '/beauty/nasolabial-fold-melting-thread/' },
      { label: '매선 시술 후 관리', href: '/beauty/melting-thread-aftercare/' },
    ],
    note: '시술 후 붓기나 멍이 있을 수 있으며, 부위와 체질에 따라 적용을 판단합니다.',
  },

  // 06. 한약, 보약
  {
    slug: 'herbal',
    name: '한약·보약',
    nameEn: 'Herbal Medicine',
    tagline: '내 체질에 맞춰, 직접 달이는 한약',
    heroImage: '/images/clinic/herbal-preparation.png',
    heroImageAlt: '태림한의원 원내에서 직접 달이는 한약',
    intro:
      '같은 증상이라도 사람마다 체질이 다릅니다. 태림한의원은 진료로 체질과 생활을 살핀 뒤, 원내에서 직접 검수하고 달인 한약을 처방합니다. 다이어트부터 산후 회복, 소아 성장, 보약까지 폭넓게 다룹니다.',
    whatIsIt: [
      '같은 증상이라도 체질에 따라 나타나는 모습과 반응이 다릅니다. 그래서 한약은 진료로 체질과 상태를 살핀 뒤 처방합니다.',
      '태림한의원은 원내에서 한약재를 직접 검수하고, 좋은 물로 정성껏 달입니다.',
    ],
    indications: [
      '한약 다이어트, 산전과 산후 회복',
      '소아 성장, 비염, 식욕부진',
      '갱년기, 만성피로, 불면',
      '수험생 보약, 녹용, 공진단',
    ],
    process: [
      '진료로 체질과 증상, 생활 습관을 살핍니다.',
      '환자분께 맞는 처방을 정하고 이해하시도록 설명합니다.',
      '원내에서 검수한 한약재로 직접 달입니다.',
      '드시는 방법과 생활 관리까지 알려드립니다.',
    ],
    benefit: [
      '체질과 증상에 맞춰 처방합니다. 같은 증상이라도 체질에 따라 처방이 달라집니다.',
      '한약재 검수부터 달이는 과정까지 원내에서 직접 챙깁니다.',
    ],
    gallery: [
      { src: '/images/clinic/herbal-preparation.png', alt: '태림한의원에서 직접 달이는 한약' },
      { src: '/images/clinic/place-02.png', alt: '가운을 입은 원장이 한약을 달이는 모습' },
    ],
    faqs: [
      { q: '체질을 어떻게 보나요?', a: '진료와 문진으로 체질과 증상, 생활 습관을 함께 살펴 처방에 반영합니다.' },
      { q: '다이어트 한약은 요요가 오지 않나요?', a: '단순히 체중만 줄이는 게 아니라 체질과 식습관을 함께 봅니다. 경과는 사람마다 다릅니다.' },
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
