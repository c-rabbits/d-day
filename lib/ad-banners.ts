import type { ContractCategory } from "@/lib/types";

/**
 * CPA 제휴 배너 데이터
 * url은 실제 제휴 링크로 교체 필요 (현재 placeholder)
 */

export type AdBanner = {
  id: string;
  category: ContractCategory;
  title: string;
  urgentTitle: string; // D-7/D-1 긴급 배너
  description: string;
  ctaText: string;
  url: string;
};

export const AD_BANNERS: AdBanner[] = [
  // 부동산
  {
    id: "rent_move",
    category: "RENT",
    title: "이사 견적, 한 번에 비교하세요",
    urgentTitle: "계약 만료 임박! 이사 견적 미리 받으세요",
    description: "여러 이사 업체 견적을 무료로 비교해 보세요.",
    ctaText: "무료 견적 받기",
    url: "#",
  },
  // 통신비
  {
    id: "phone_internet",
    category: "PHONE",
    title: "인터넷 요금, 더 저렴하게",
    urgentTitle: "통신 계약 만료 전! 최저가 요금제 확인",
    description: "통신사별 요금제를 비교하고 최적의 플랜을 찾으세요.",
    ctaText: "요금제 비교하기",
    url: "#",
  },
  // 보험
  {
    id: "insurance_compare",
    category: "CAR_INSURANCE",
    title: "보험료 비교하고 절약하세요",
    urgentTitle: "보험 만료 임박! 갱신 전 비교 필수",
    description: "내게 맞는 보험을 무료로 비교 상담 받으세요.",
    ctaText: "무료 상담 신청",
    url: "#",
  },
  // 멤버십
  {
    id: "membership_deals",
    category: "GYM",
    title: "멤버십 혜택, 놓치지 마세요",
    urgentTitle: "멤버십 갱신 전! 더 좋은 혜택 확인",
    description: "다양한 멤버십 할인 혜택을 확인해 보세요.",
    ctaText: "혜택 확인하기",
    url: "#",
  },
  // 렌탈
  {
    id: "rental_compare",
    category: "RENTAL",
    title: "렌탈 비용, 비교하고 줄이세요",
    urgentTitle: "렌탈 계약 만료! 최신 제품으로 교체하세요",
    description: "정수기, 공기청정기 등 렌탈 비용을 비교해 보세요.",
    ctaText: "렌탈 비교하기",
    url: "#",
  },
  // 스트리밍
  {
    id: "streaming_bundle",
    category: "STREAMING",
    title: "OTT 결합 상품으로 할인 받으세요",
    urgentTitle: "구독 갱신 전! 더 저렴한 요금제 확인",
    description: "통신사 결합으로 스트리밍 구독료를 절약하세요.",
    ctaText: "결합 상품 보기",
    url: "#",
  },
  // 금융/대출
  {
    id: "finance_compare",
    category: "FINANCE",
    title: "대출 금리, 비교하면 줄어듭니다",
    urgentTitle: "만기 임박! 대환대출로 이자 절약하세요",
    description: "최저 금리 대출 상품을 한 번에 비교해 보세요.",
    ctaText: "금리 비교하기",
    url: "#",
  },
  // 교육
  {
    id: "education_course",
    category: "EDUCATION",
    title: "새로운 강의를 시작해 보세요",
    urgentTitle: "수강 기간 만료 전! 연장 할인 확인",
    description: "인기 온라인 강의를 할인된 가격에 수강하세요.",
    ctaText: "강의 둘러보기",
    url: "#",
  },
  // 기타
  {
    id: "other_general",
    category: "OTHER",
    title: "더 좋은 조건을 찾아보세요",
    urgentTitle: "계약 만료 임박! 갱신 전 비교해 보세요",
    description: "계약 갱신 전, 더 나은 조건이 있는지 확인하세요.",
    ctaText: "자세히 보기",
    url: "#",
  },
];

/** 카테고리에 맞는 배너 반환 */
export function getBannerForCategory(category: ContractCategory): AdBanner {
  return AD_BANNERS.find((b) => b.category === category) ?? AD_BANNERS[AD_BANNERS.length - 1];
}
